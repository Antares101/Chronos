/* global console, structuredClone */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const penpotRoot = path.join(root, '.penpot');
const lifecycle = ['draft', 'reviewed', 'approved', 'implemented', 'verified'];

export class ContractValidationError extends Error {
  constructor(detail) {
    super(JSON.stringify(detail));
    this.name = 'ContractValidationError';
    this.detail = detail;
  }
}

function fail(gate, target, semanticKey, expected, actual, remediation) {
  throw new ContractValidationError({ target, semanticKey, gate, expected, actual, remediation });
}

function requireValue(condition, gate, target, semanticKey, expected, actual, remediation) {
  if (!condition) fail(gate, target, semanticKey, expected, actual, remediation);
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function assertSortedUnique(values, target) {
  const normalized = values.map((value) => value.trim().toLowerCase());
  const duplicate = normalized.find((value, index) => normalized.indexOf(value) !== index);
  requireValue(
    !duplicate,
    'semantic-key-unique',
    target,
    duplicate ?? null,
    'one normalized semantic key',
    duplicate ?? null,
    'Remove the collision; never select an implicit winner.',
  );
  const sorted = [...values].sort((left, right) => left.localeCompare(right));
  requireValue(
    same(values, sorted),
    'semantic-key-order',
    target,
    null,
    sorted,
    values,
    'Sort records by semanticKey.',
  );
}

function assertClosedCoverage(snapshot) {
  const entries = snapshot.coverage.entries;
  assertSortedUnique(
    entries.map((entry) => entry.semanticKey),
    '.penpot/coverage.json',
  );
  const domains = [
    ['token', snapshot.manifest.registries.tokenFamilies],
    ['grammar', snapshot.manifest.registries.grammarFamilies],
    ['route', snapshot.manifest.registries.routes],
  ];
  for (const [kind, required] of domains) {
    const actual = entries
      .filter((entry) => entry.kind === kind)
      .map((entry) => entry.family)
      .sort();
    requireValue(
      same(actual, required),
      'closed-family-coverage',
      '.penpot/coverage.json',
      kind,
      required,
      actual,
      `Add exactly one ${kind} coverage row for every closed registry member.`,
    );
  }
  for (const entry of entries) {
    const applicability = entry.applicability;
    requireValue(
      applicability?.status !== 'inapplicable' || Boolean(applicability.reason?.trim()),
      'applicability',
      '.penpot/coverage.json',
      entry.semanticKey,
      'non-empty reason when inapplicable',
      applicability?.reason ?? null,
      'Record a target-specific inapplicability reason.',
    );
    requireValue(
      entry.lifecycle === 'draft' || (entry.objectId && Number.isInteger(entry.objectRevision)),
      'mapping-readback',
      '.penpot/coverage.json',
      entry.semanticKey,
      'verified provider identity before lifecycle advancement',
      {
        lifecycle: entry.lifecycle,
        objectId: entry.objectId,
        objectRevision: entry.objectRevision,
      },
      'Restore the last verified mapping or keep this row draft until provider readback passes.',
    );
  }
}

function assertTokenGraph(snapshot) {
  const chains = snapshot.designSystem.tokenChains;
  const required = snapshot.manifest.registries.tokenFamilies.flatMap((family) =>
    snapshot.manifest.registries.themes.map((theme) => `${family}:${theme}`),
  );
  const actual = chains.map((chain) => `${chain.family}:${chain.theme}`).sort();
  requireValue(
    same(actual, required),
    'token-family-coverage',
    '.penpot/design-system.json',
    null,
    required,
    actual,
    'Add one global → semantic → component chain per family and theme.',
  );
  const graph = new Map();
  const componentKeys = new Set();
  for (const chain of chains) {
    const expectedGlobal = `{${chain.global.key}}`;
    const expectedSemantic = `{${chain.semantic.key}}`;
    requireValue(
      chain.semantic.value === expectedGlobal && chain.semantic.key.endsWith(`.${chain.theme}`),
      'token-theme',
      '.penpot/design-system.json',
      chain.semantic.key,
      expectedGlobal,
      chain.semantic.value,
      'Alias the same-theme global token.',
    );
    requireValue(
      chain.component.value === expectedSemantic,
      'token-component-alias',
      '.penpot/design-system.json',
      chain.component.key,
      expectedSemantic,
      chain.component.value,
      'Replace the literal or skipped tier with a semantic-token alias.',
    );
    graph.set(chain.global.key, reference(chain.global.value));
    graph.set(chain.semantic.key, reference(chain.semantic.value));
    graph.set(chain.component.key, reference(chain.component.value));
    componentKeys.add(chain.component.key);
  }
  for (const start of graph.keys()) {
    const seen = new Set();
    let current = start;
    while (current && graph.has(current)) {
      if (seen.has(current)) {
        fail(
          'token-cycle',
          '.penpot/design-system.json',
          start,
          'acyclic alias chain',
          [...seen, current],
          'Break the alias cycle at the global tier.',
        );
      }
      seen.add(current);
      current = graph.get(current);
    }
  }
  for (const entry of snapshot.coverage.entries.filter((item) => item.kind === 'grammar')) {
    requireValue(
      entry.consumedTokens.length > 0 &&
        entry.consumedTokens.every((key) => componentKeys.has(key)),
      'grammar-token-consumption',
      '.penpot/coverage.json',
      entry.semanticKey,
      'existing component token keys',
      entry.consumedTokens,
      'Map the grammar family to at least one consumed component token.',
    );
  }
}

function reference(value) {
  const match = typeof value === 'string' && value.match(/^\{([^{}]+)\}$/);
  return match ? match[1] : null;
}

function assertTargets(snapshot) {
  const targetRoutes = snapshot.targets.map((target) => target.route).sort();
  requireValue(
    same(targetRoutes, snapshot.manifest.registries.routes),
    'route-target-coverage',
    '.penpot/targets',
    null,
    snapshot.manifest.registries.routes,
    targetRoutes,
    'Create one route target contract for each required route.',
  );
  for (const target of snapshot.targets) {
    requireValue(
      target.manifestRevision === snapshot.manifest.revision,
      'revision',
      `.penpot/targets${target.route}.json`,
      `route${target.route}`,
      snapshot.manifest.revision,
      target.manifestRevision,
      'Refresh from the current manifest without replacing the last verified mapping.',
    );
    const history = target.lifecycleHistory;
    const validHistory = history.every(
      (state, index) =>
        index === 0 || lifecycle.indexOf(state) === lifecycle.indexOf(history[index - 1]) + 1,
    );
    requireValue(
      history[0] === 'draft' && validHistory && history.at(-1) === target.state,
      'lifecycle',
      `.penpot/targets${target.route}.json`,
      `route${target.route}`,
      'draft → reviewed → approved → implemented → verified',
      history,
      'Restore a legal contiguous lifecycle history.',
    );
    if (target.state === 'verified') assertEvidenceAxes(snapshot, target);
  }
}

function assertEvidenceAxes(snapshot, target) {
  const records = snapshot.evidence.evidence.filter(
    (record) => record.route === target.route && record.case === 'ready',
  );
  const expected = target.requiredAxes.themes.flatMap((theme) =>
    target.requiredAxes.viewports.map((viewport) => `${theme}:${viewport}`),
  );
  const actual = records.map((record) => `${record.theme}:${record.viewport}`).sort();
  const validHashes = records.every((record) => /^[a-f0-9]{64}$/.test(record.sha256));
  requireValue(
    same(actual, expected) && validHashes,
    'evidence-axes',
    `.penpot/targets${target.route}.json`,
    `route${target.route}`,
    expected,
    { axes: actual, validHashes },
    'Capture exact rendered-app PNG evidence for every required axis and record SHA-256.',
  );
}

function assertReceipts(snapshot) {
  const byDigest = new Map();
  for (const receipt of snapshot.receipts.receipts) {
    const canonical = JSON.stringify({ page: receipt.page, changedKeys: receipt.changedKeys });
    if (byDigest.has(receipt.digest) && byDigest.get(receipt.digest) !== canonical) {
      fail(
        'receipt-replay',
        '.penpot/transactions/index.json',
        receipt.digest,
        byDigest.get(receipt.digest),
        canonical,
        'Reject drift; replay only the exact verified digest as a no-op.',
      );
    }
    byDigest.set(receipt.digest, canonical);
  }
}

function assertVisualImpact(change) {
  if (change.visualImpact === 'none') {
    requireValue(
      change.approvalStatus === 'not-required' &&
        change.approvedRevisions.length === 0 &&
        change.evidenceKeys.length === 0,
      'visual-impact-none',
      '.penpot/changes',
      null,
      'not-required with no visual references',
      change,
      'Remove visual references or declare penpot-first.',
    );
    return;
  }
  requireValue(
    change.visualImpact === 'penpot-first',
    'visual-impact',
    '.penpot/changes',
    null,
    'none or penpot-first',
    change.visualImpact,
    'Use the closed visualImpact domain.',
  );
  if (change.approvalStatus === 'approved') {
    requireValue(
      change.approvedRevisions.length > 0 && change.evidenceKeys.length > 0,
      'visual-impact-approval',
      '.penpot/changes',
      null,
      'approved revisions and evidence',
      change,
      'Keep approval pending until provider and rendered-app verification pass.',
    );
  }
}

function normalizeSnapshot(input) {
  const snapshot = structuredClone(input);
  snapshot.designSystem.tokenChains = snapshot.designSystem.tokenChains.map((chain) => {
    if (!Array.isArray(chain)) return chain;
    const [family, theme, type, globalValue] = chain;
    const key = (tier) => `${tier}.${family}.base.${theme}`;
    return {
      family,
      theme,
      type,
      global: { key: key('global'), revision: 0, value: globalValue },
      semantic: { key: key('semantic'), revision: 0, value: `{${key('global')}}` },
      component: { key: key('component'), revision: 0, value: `{${key('semantic')}}` },
    };
  });
  snapshot.coverage.entries = snapshot.coverage.entries.map((entry) => {
    if (!Array.isArray(entry)) return entry;
    const [semanticKey, kind, family, page, consumedTokens = []] = entry;
    return {
      ...snapshot.coverage.defaults,
      semanticKey,
      kind,
      family,
      page,
      consumedTokens,
    };
  });
  if (snapshot.evidence.baseline) {
    snapshot.evidence.evidence = Object.entries(snapshot.evidence.baseline).flatMap(
      ([target, record]) =>
        Object.entries(record.axes).flatMap(([viewport, themes]) =>
          Object.entries(themes).map(([theme, value]) => ({
            key: `evidence/${target}/ready/${viewport}/${theme}`,
            route: record.route,
            case: 'ready',
            viewport,
            theme,
            appCommit: snapshot.evidence.appCommit,
            result: snapshot.evidence.result,
            deviations: [snapshot.evidence.deviation],
            ...value,
          })),
        ),
    );
  }
  return snapshot;
}

export function validateV2Snapshot(input) {
  const snapshot = normalizeSnapshot(input);
  for (const [name, value] of Object.entries(snapshot)) {
    if (name === 'targets') continue;
    requireValue(
      value.schemaVersion === 2,
      'schema-version',
      name,
      null,
      2,
      value.schemaVersion,
      'Migrate the record to schema v2.',
    );
  }
  const expectedAuthority = {
    behavior: 'code',
    visual: 'penpot',
    policy: 'contracts',
    verification: 'rendered-application',
  };
  requireValue(
    same(snapshot.manifest.authority, expectedAuthority),
    'authority',
    '.penpot/manifest.json',
    null,
    expectedAuthority,
    snapshot.manifest.authority,
    'Restore the authority split; do not repair conflicts implicitly.',
  );
  assertClosedCoverage(snapshot);
  assertTokenGraph(snapshot);
  assertTargets(snapshot);
  assertReceipts(snapshot);
  assertVisualImpact(snapshot.change);
  return { schemaVersion: 2, targetCount: snapshot.targets.length };
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

async function loadSnapshot() {
  const targetFiles = (await readdir(path.join(penpotRoot, 'targets')))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const [manifest, designSystem, components, coverage, receipts, evidence, change, targets] =
    await Promise.all([
      readJson('.penpot/manifest.json'),
      readJson('.penpot/design-system.json'),
      readJson('.penpot/components.json'),
      readJson('.penpot/coverage.json'),
      readJson('.penpot/transactions/index.json'),
      readJson('.penpot/evidence/index.json'),
      readJson('.penpot/changes/complete-penpot-visual-authority.json'),
      Promise.all(targetFiles.map((file) => readJson(`.penpot/targets/${file}`))),
    ]);
  return { manifest, designSystem, components, coverage, receipts, evidence, change, targets };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateV2Snapshot(await loadSnapshot());
  console.log(
    `Penpot contracts valid: schema v${result.schemaVersion}, ${result.targetCount} route targets.`,
  );
}
