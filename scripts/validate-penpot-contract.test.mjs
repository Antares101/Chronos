import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import { URL } from 'node:url';

import { validateV2Snapshot } from './validate-penpot-contract.mjs';

const tokenFamilies = [
  'color',
  'disabled',
  'focus-ring',
  'muted',
  'radius',
  'shell-ornament',
  'spacing',
  'status',
  'typography',
];
const grammarFamilies = [
  'alerts-status',
  'authentication',
  'calendar-timeline',
  'command-ribbons',
  'context-bands',
  'controls-forms',
  'disclosures',
  'insights-evidence',
  'navigation',
  'reviews-conclusions',
  'shell',
  'surfaces',
  'tasks',
];
const routes = ['/insights', '/planning', '/review', '/sign-in', '/today'];
const themes = ['dark', 'light'];
const viewports = ['desktop', 'mobile'];

function tokenKey(tier, family, theme) {
  return `${tier}.${family}.base.${theme}`;
}

function validSnapshot() {
  const tokenChains = tokenFamilies.flatMap((family) =>
    themes.map((theme) => ({
      family,
      theme,
      type: family === 'color' || family === 'status' ? 'color' : 'dimension',
      global: { key: tokenKey('global', family, theme), revision: 1, value: '1rem' },
      semantic: {
        key: tokenKey('semantic', family, theme),
        revision: 1,
        value: `{${tokenKey('global', family, theme)}}`,
      },
      component: {
        key: tokenKey('component', family, theme),
        revision: 1,
        value: `{${tokenKey('semantic', family, theme)}}`,
      },
    })),
  );
  const coverage = [
    ...tokenFamilies.map((family) => ({
      semanticKey: `token/${family}`,
      kind: 'token',
      family,
      page: '00 Foundations',
      objectId: null,
      objectRevision: null,
      mappingRevision: 0,
      lifecycle: 'draft',
      applicability: { status: 'covered', reason: null },
      consumedTokens: [],
      evidenceKeys: [],
    })),
    ...grammarFamilies.map((family) => ({
      semanticKey: `grammar/${family}`,
      kind: 'grammar',
      family,
      page: family === 'shell' ? '02 Patterns' : '01 Components',
      objectId: null,
      objectRevision: null,
      mappingRevision: 0,
      lifecycle: 'draft',
      applicability: { status: 'covered', reason: null },
      consumedTokens: [tokenKey('component', 'color', 'light')],
      evidenceKeys: [],
    })),
    ...routes.map((route) => ({
      semanticKey: `route${route}`,
      kind: 'route',
      family: route,
      page: `1${routes.indexOf(route)} ${route.slice(1)}`,
      objectId: null,
      objectRevision: null,
      mappingRevision: 0,
      lifecycle: 'draft',
      applicability: { status: 'covered', reason: null },
      consumedTokens: [tokenKey('component', 'color', 'light')],
      evidenceKeys: [],
    })),
  ].sort((left, right) => left.semanticKey.localeCompare(right.semanticKey));

  return {
    manifest: {
      schemaVersion: 2,
      revision: 3,
      authority: {
        behavior: 'code',
        visual: 'penpot',
        policy: 'contracts',
        verification: 'rendered-application',
      },
      registries: {
        grammarFamilies,
        routes,
        states: ['disabled', 'empty', 'error', 'expanded', 'ready', 'status'],
        themes,
        tokenFamilies,
        viewports,
      },
    },
    designSystem: { schemaVersion: 2, revision: 2, tokenChains },
    components: { schemaVersion: 2, revision: 2, families: grammarFamilies },
    coverage: { schemaVersion: 2, revision: 1, entries: coverage },
    targets: routes.map((route) => ({
      route,
      revision: 1,
      manifestRevision: 3,
      state: 'draft',
      lifecycleHistory: ['draft'],
      evidenceKeys: [],
      requiredAxes: { themes, viewports },
    })),
    receipts: { schemaVersion: 2, revision: 0, receipts: [] },
    evidence: { schemaVersion: 2, revision: 0, evidence: [] },
    change: {
      schemaVersion: 2,
      visualImpact: 'penpot-first',
      rationale: 'Establish visual authority.',
      approvalStatus: 'pending',
      approvedRevisions: [],
      evidenceKeys: [],
    },
  };
}

function expectGate(snapshot, gate) {
  assert.throws(
    () => validateV2Snapshot(snapshot),
    (error) => {
      assert.equal(error.detail.gate, gate);
      for (const field of ['target', 'semanticKey', 'expected', 'actual', 'remediation']) {
        assert.notEqual(error.detail[field], undefined, `${gate} must report ${field}`);
      }
      return true;
    },
  );
}

describe('Penpot contract v2 fail-closed validation', () => {
  it('accepts a complete pending snapshot', () => {
    assert.deepEqual(validateV2Snapshot(validSnapshot()), { schemaVersion: 2, targetCount: 5 });
  });

  it('rejects authority collisions', () => {
    const snapshot = validSnapshot();
    snapshot.manifest.authority.behavior = 'penpot';
    expectGate(snapshot, 'authority');
  });

  it('rejects duplicate and unsorted semantic keys', () => {
    const duplicate = validSnapshot();
    duplicate.coverage.entries[1].semanticKey = duplicate.coverage.entries[0].semanticKey;
    expectGate(duplicate, 'semantic-key-unique');
    const unsorted = validSnapshot();
    unsorted.coverage.entries.reverse();
    expectGate(unsorted, 'semantic-key-order');
  });

  it('rejects closed-family omissions and unjustified inapplicability', () => {
    const omitted = validSnapshot();
    omitted.coverage.entries = omitted.coverage.entries.filter(
      (entry) => entry.family !== 'spacing',
    );
    expectGate(omitted, 'closed-family-coverage');
    const inapplicable = validSnapshot();
    inapplicable.coverage.entries[0].applicability = { status: 'inapplicable', reason: '' };
    expectGate(inapplicable, 'applicability');
  });

  it('rejects cycles, cross-theme aliases, and component literals', () => {
    const cycle = validSnapshot();
    const chain = cycle.designSystem.tokenChains[0];
    chain.global.value = `{${chain.component.key}}`;
    expectGate(cycle, 'token-cycle');
    const leakage = validSnapshot();
    const dark = leakage.designSystem.tokenChains.find((item) => item.theme === 'dark');
    dark.semantic.value = `{${tokenKey('global', dark.family, 'light')}}`;
    expectGate(leakage, 'token-theme');
    const literal = validSnapshot();
    literal.designSystem.tokenChains[0].component.value = '#FFFFFF';
    expectGate(literal, 'token-component-alias');
  });

  it('rejects stale revisions and illegal lifecycle transitions', () => {
    const stale = validSnapshot();
    stale.targets[0].manifestRevision = 2;
    expectGate(stale, 'revision');
    const lifecycle = validSnapshot();
    lifecycle.targets[0].lifecycleHistory = ['draft', 'approved'];
    expectGate(lifecycle, 'lifecycle');
  });

  it('rejects verified targets without exact axes and hashes', () => {
    const snapshot = validSnapshot();
    snapshot.targets[0].state = 'verified';
    snapshot.targets[0].lifecycleHistory = [
      'draft',
      'reviewed',
      'approved',
      'implemented',
      'verified',
    ];
    expectGate(snapshot, 'evidence-axes');
  });

  it('rejects receipt replay drift', () => {
    const snapshot = validSnapshot();
    snapshot.receipts.receipts = [
      { digest: 'a'.repeat(64), page: '00 Foundations', changedKeys: ['token/color'] },
      { digest: 'a'.repeat(64), page: '00 Foundations', changedKeys: ['token/spacing'] },
    ];
    expectGate(snapshot, 'receipt-replay');
  });

  it('validates both visual impact modes', () => {
    const behaviorOnly = validSnapshot();
    behaviorOnly.change = {
      schemaVersion: 2,
      visualImpact: 'none',
      rationale: 'Behavior only.',
      approvalStatus: 'not-required',
      approvedRevisions: [],
      evidenceKeys: [],
    };
    assert.equal(validateV2Snapshot(behaviorOnly).targetCount, 5);
    behaviorOnly.change.evidenceKeys = ['evidence/today'];
    expectGate(behaviorOnly, 'visual-impact-none');
    const visual = validSnapshot();
    visual.change.approvalStatus = 'approved';
    expectGate(visual, 'visual-impact-approval');
  });
});

describe('Penpot contract v2 schemas', () => {
  it('publishes closed v2 schemas for every record family', async () => {
    const files = [
      'change',
      'components',
      'coverage',
      'design-system',
      'evidence',
      'manifest',
      'receipt',
      'target',
    ];
    for (const file of files) {
      const source = await readFile(
        new URL(`../.penpot/schemas/${file}.schema.json`, import.meta.url),
      );
      const schema = JSON.parse(source);
      assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
      assert.equal(schema.type, 'object');
      assert.equal(schema.additionalProperties, false);
      assert.equal(schema.properties.schemaVersion.const, 2);
    }
  });
});

describe('Chronos Penpot contract snapshot', () => {
  it('passes the repository v2 validator without claiming remote completion', () => {
    const result = spawnSync(process.execPath, ['scripts/validate-penpot-contract.mjs'], {
      cwd: new URL('..', import.meta.url),
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /schema v2, 5 route targets/);
  });

  it('records 24 exact blocked baseline captures without claiming visual parity', async () => {
    const index = JSON.parse(
      await readFile(new URL('../.penpot/evidence/index.json', import.meta.url), 'utf8'),
    );
    const records = Object.entries(index.baseline).flatMap(([target, record]) =>
      Object.entries(record.axes).flatMap(([viewport, themes]) =>
        Object.entries(themes).map(([theme, value]) => ({ target, viewport, theme, ...value })),
      ),
    );
    assert.equal(records.length, 24);
    assert.equal(index.result, 'blocked');
    for (const record of records) {
      const filename = `${record.target}-ready-${record.viewport}-${record.theme}.png`;
      const bytes = await readFile(new URL(`../.penpot/evidence/${filename}`, import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256);
    }
  });
});
