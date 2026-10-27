import { spawnSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, join, relative, resolve, sep, win32 } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// T8: S7/S11/S12 shared-guard regression; S2 normal gates, without force/skip/bypass.
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const lefthookLauncher = createRequire(import.meta.url).resolve('lefthook');
const guardError =
  'ERROR: staged files have unstaged changes. Stage or revert those changes before committing.';
const baseStaged = '# Original staged document\n\nUnchanged tail.\n';
const stagedBytes = '# Staged document\n\nUnchanged tail.\n';
const partiallyStagedBytes = '# Staged document\n\nUnstaged tail.\n';
const baseUnrelated = '# Unrelated document\n';
const changedUnrelated = '# Unrelated document with unstaged changes\n';

const layouts = ['ordinary repository', 'linked worktree with spaces'] as const;
const scenarios = ['clean staged', 'same-file unstaged', 'unrelated unstaged'] as const;
type Layout = (typeof layouts)[number];
type Scenario = (typeof scenarios)[number];

function ownedRoot() {
  const astro = join(realpathSync(projectRoot), '.astro');
  try {
    // Create only this immediate directory; never recursively follow an existing link.
    mkdirSync(astro);
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) {
      throw error;
    }
  }
  if (!lstatSync(astro).isDirectory() || realpathSync(astro) !== astro) {
    throw new Error('The ignored .astro fixture parent must be a real project directory.');
  }

  const selected = process.env.CHRONOS_GUARD_TEST_ROOT;
  if (selected !== undefined && !isAbsolute(selected)) {
    throw new Error(
      'CHRONOS_GUARD_TEST_ROOT must be an existing absolute directory under .astro/.',
    );
  }
  const parent = selected === undefined ? astro : realpathSync(selected);
  const insideAstro = relative(astro, parent);
  if (
    insideAstro === '..' ||
    insideAstro.startsWith(`..${sep}`) ||
    isAbsolute(insideAstro) ||
    !lstatSync(parent).isDirectory()
  ) {
    throw new Error("The fixture parent must resolve inside this worktree's ignored .astro/.");
  }

  // Every case owns a new directory, with or without the optional evidence override.
  const root = mkdtempSync(join(parent, 'staged-files-clean-'));
  if (realpathSync(root) !== root) {
    throw new Error('The fresh fixture directory must not resolve through a symbolic link.');
  }
  return root;
}

function isolatedEnvironment(root: string): NodeJS.ProcessEnv {
  const home = join(root, 'home');
  const config = join(root, 'config');
  const cache = join(root, 'cache');
  const temp = join(root, 'temp');
  const roaming = join(home, 'AppData', 'Roaming');
  const local = join(home, 'AppData', 'Local');
  const template = join(root, 'empty-template');
  const emptyConfig = join(root, 'empty-git-config');
  const npmCache = join(cache, 'npm');
  const npmPrefix = join(root, 'npm-prefix');
  const npmUserConfig = join(config, 'npm-user.npmrc');
  const npmGlobalConfig = join(config, 'npm-global.npmrc');
  for (const directory of [
    home,
    config,
    cache,
    temp,
    roaming,
    local,
    template,
    npmCache,
    npmPrefix,
  ]) {
    mkdirSync(directory, { recursive: true });
  }
  writeFileSync(emptyConfig, '');
  const offlineNpmConfig = 'offline=true\nupdate-notifier=false\naudit=false\nfund=false\n';
  writeFileSync(npmUserConfig, offlineNpmConfig);
  writeFileSync(npmGlobalConfig, offlineNpmConfig);

  // Allowlist executable lookup only; never spread ambient credential/profile variables.
  const env: NodeJS.ProcessEnv = {
    PATH: process.env.PATH,
    HOME: home,
    USERPROFILE: home,
    APPDATA: roaming,
    LOCALAPPDATA: local,
    XDG_CONFIG_HOME: config,
    XDG_CACHE_HOME: cache,
    XDG_DATA_HOME: join(root, 'data'),
    XDG_STATE_HOME: join(root, 'state'),
    TMPDIR: temp,
    TEMP: temp,
    TMP: temp,
    GIT_CONFIG_SYSTEM: emptyConfig,
    GIT_CONFIG_GLOBAL: emptyConfig,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_ATTR_NOSYSTEM: '1',
    GIT_TEMPLATE_DIR: template,
    GIT_TERMINAL_PROMPT: '0',
    GCM_INTERACTIVE: 'never',
    NO_UPDATE_NOTIFIER: '1',
    npm_config_userconfig: npmUserConfig,
    npm_config_globalconfig: npmGlobalConfig,
    npm_config_cache: npmCache,
    npm_config_prefix: npmPrefix,
    npm_config_offline: 'true',
    npm_config_update_notifier: 'false',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    DO_NOT_TRACK: '1',
    CI: 'true',
    TERM: 'dumb',
    LANG: 'C',
    LC_ALL: 'C',
    TZ: 'UTC',
  };
  if (process.platform === 'win32') {
    const systemRoot = process.env.SystemRoot ?? process.env.SYSTEMROOT;
    if (!systemRoot || !isAbsolute(systemRoot)) {
      throw new Error('Windows requires an absolute SystemRoot for executable discovery.');
    }
    env.SystemRoot = systemRoot;
    env.WINDIR = systemRoot;
    env.ComSpec = join(systemRoot, 'System32', 'cmd.exe');
    env.HOMEDRIVE = win32.parse(home).root.replace(/[\\/]$/, '');
    env.HOMEPATH = home.slice(env.HOMEDRIVE.length);
  }

  const settings = [
    ['user.name', 'Guard Regression'],
    ['user.email', 'guard-regression@example.invalid'],
    ['commit.gpgSign', 'false'],
    ['tag.gpgSign', 'false'],
    ['core.autocrlf', 'false'],
    ['core.eol', 'lf'],
    ['core.attributesFile', emptyConfig],
    ['core.pager', 'cat'],
    ['credential.helper', ''],
    ['credential.interactive', 'false'],
    ['core.askPass', ''],
    ['protocol.allow', 'never'],
    ['maintenance.auto', 'false'],
    ['gc.auto', '0'],
  ];
  env.GIT_CONFIG_COUNT = String(settings.length);
  settings.forEach(([key, value], index) => {
    env[`GIT_CONFIG_KEY_${index}`] = key;
    env[`GIT_CONFIG_VALUE_${index}`] = value;
  });
  return env;
}

function fixture(layout: Layout) {
  const root = ownedRoot();
  const env = isolatedEnvironment(root);
  const transcript = join(root, 'commands.jsonl');
  console.info(`Retained owned guard fixture and complete command output: ${root}`);

  function run(cwd: string, executable: string, args: string[]) {
    const result = spawnSync(executable, args, {
      cwd,
      env,
      encoding: 'utf8',
      timeout: 2_000,
      maxBuffer: 8 * 1024 * 1024,
      windowsHide: true,
      shell: false,
    });
    appendFileSync(
      transcript,
      `${JSON.stringify({
        cwd,
        executable,
        args,
        status: result.status,
        signal: result.signal,
        error: result.error?.message,
        stdout: result.stdout,
        stderr: result.stderr,
      })}\n`,
    );
    if (result.error) throw result.error;
    if (result.signal) {
      throw new Error(`Fixture process terminated by ${result.signal}; see ${transcript}`);
    }
    return result;
  }

  function git(cwd: string, ...args: string[]) {
    const result = run(cwd, 'git', args);
    expect(result.status, `git ${args.join(' ')}; see ${transcript}`).toBe(0);
    expect(result.stderr, `git diagnostics; see ${transcript}`).toBe('');
    return result.stdout;
  }

  const repository = join(root, 'repository');
  mkdirSync(repository);
  git(repository, 'init', '--quiet', '--initial-branch=guard-fixture');
  writeFileSync(join(repository, 'staged.md'), baseStaged);
  writeFileSync(join(repository, 'unrelated.md'), baseUnrelated);
  git(repository, 'add', '--', 'staged.md', 'unrelated.md');
  // Synthetic seed only: no installed hooks or source history is involved.
  git(repository, 'commit', '--quiet', '-m', 'Seed isolated guard fixture');

  let cwd = repository;
  if (layout === 'linked worktree with spaces') {
    cwd = join(root, 'linked worktree - guard fixture');
    git(repository, 'worktree', 'add', '--quiet', '-b', 'linked-guard-fixture', cwd);
    const patchPath = git(cwd, 'rev-parse', '--git-path', 'info/lefthook-unstaged.patch').trim();
    expect(isAbsolute(patchPath)).toBe(true);
    expect(patchPath).toContain(' ');
    // Only query the public Git interface; never open or construct Git storage files.
  }

  const configuration = readFileSync(resolve(projectRoot, 'lefthook.yml'), 'utf8');
  writeFileSync(join(cwd, 'lefthook.yml'), configuration);
  const guardScript = join(projectRoot, 'scripts', 'staged-files-clean.sh');
  const fixtureGuardScript = join(cwd, 'scripts', 'staged-files-clean.sh');
  if (existsSync(guardScript)) {
    mkdirSync(join(cwd, 'scripts'));
    writeFileSync(fixtureGuardScript, readFileSync(guardScript));
  }
  // Fail closed if this adapter's known folded-scalar layout changes. The command
  // comes from the live configuration; no validator logic is copied into this test.
  const command = configuration.match(
    /^ {4}staged-files-clean:\r?\n {6}priority: 1\r?\n {6}run: >-\r?\n {8}([^\r\n]+)\r?\n(?= {4}\S)/m,
  )?.[1];
  if (!command) throw new Error('Cannot locate the complete configured guard command.');

  const commandStdout = join(root, 'guard.stdout');
  const commandStderr = join(root, 'guard.stderr');
  const commandStatus = join(root, 'guard.status');
  const shellPath = (file: string) => `'${file.replaceAll('\\', '/').replaceAll("'", "'\\''")}'`;
  // Public local override: the original command runs unchanged in a subshell,
  // with identical cwd/environment and its exit propagated to the normal hook.
  // Capture files are outside the synthetic Git worktree, never in Git storage.
  const capture = [
    `( ${command}\n) > ${shellPath(commandStdout)} 2> ${shellPath(commandStderr)}`,
    'guard_status=$?',
    `printf '%s\\n' "$guard_status" > ${shellPath(commandStatus)}`,
    'exit "$guard_status"',
  ].join('\n');
  // Keep the capture transport out of Lefthook's inline shell quoting. The script
  // contains the complete configured command verbatim, not a validator replica.
  const captureScript = join(root, 'capture-guard.sh');
  writeFileSync(captureScript, `#!/usr/bin/env bash\n${capture}\n`);
  writeFileSync(
    join(cwd, 'lefthook-local.yml'),
    `output:\n  - execution_out\npre-commit:\n  commands:\n    staged-files-clean:\n      run: bash ${shellPath(captureScript)}\n`,
  );

  function snapshot() {
    return {
      head: git(cwd, 'rev-parse', 'HEAD'),
      commitCount: git(cwd, 'rev-list', '--count', 'HEAD'),
      allHistory: git(cwd, 'rev-list', '--all'),
      refs: git(cwd, 'show-ref', '--head'),
      index: git(cwd, 'ls-files', '--stage'),
      stagedDocument: git(cwd, 'show', ':staged.md'),
      stagedUnrelated: git(cwd, 'show', ':unrelated.md'),
      workingDocument: readFileSync(join(cwd, 'staged.md')),
      workingUnrelated: readFileSync(join(cwd, 'unrelated.md')),
      config: readFileSync(join(cwd, 'lefthook.yml')),
      localConfig: readFileSync(join(cwd, 'lefthook-local.yml')),
      captureScript: readFileSync(captureScript),
      guardScript: existsSync(fixtureGuardScript) ? readFileSync(fixtureGuardScript) : null,
      status: git(cwd, 'status', '--porcelain=v1', '--untracked-files=all'),
      stagedDiff: git(cwd, 'diff', '--cached', '--binary'),
      workingDiff: git(cwd, 'diff', '--binary'),
    };
  }

  return {
    cwd,
    git,
    snapshot,
    guard: () => {
      // Run the full public hook: command selection and --no-stage-fixed must not
      // suppress the real stash lifecycle. Other jobs retain their original globs.
      const framework = run(cwd, process.execPath, [
        lefthookLauncher,
        'run',
        'pre-commit',
        '--colors',
        'off',
        '--no-tty',
        '--no-auto-install',
      ]);
      return {
        ...framework,
        commandStdout: readFileSync(commandStdout, 'utf8'),
        commandStderr: readFileSync(commandStderr, 'utf8'),
        commandStatus: readFileSync(commandStatus, 'utf8'),
      };
    },
    transcript,
  };
}

// Fixtures/logs are deliberately retained for the parent's RED evidence and owned cleanup.
// No cleanup operation can delete another test's fixture or alter the delivery repository.
describe.each(layouts)('staged-files-clean [S2, S7]: %s', (layout) => {
  it.each(scenarios)(
    '%s preserves staged bytes, working bytes, refs and history',
    (scenario: Scenario) => {
      const owned = fixture(layout);
      writeFileSync(join(owned.cwd, 'staged.md'), stagedBytes);
      owned.git(owned.cwd, 'add', '--', 'staged.md');
      if (scenario === 'same-file unstaged') {
        writeFileSync(join(owned.cwd, 'staged.md'), partiallyStagedBytes);
      } else if (scenario === 'unrelated unstaged') {
        writeFileSync(join(owned.cwd, 'unrelated.md'), changedUnrelated);
      }

      const before = owned.snapshot();
      expect(before.commitCount).toBe('1\n');
      expect(before.stagedDocument).toBe(stagedBytes);
      expect(before.stagedUnrelated).toBe(baseUnrelated);
      expect(before.workingDocument).toEqual(
        Buffer.from(scenario === 'same-file unstaged' ? partiallyStagedBytes : stagedBytes),
      );
      expect(before.workingUnrelated).toEqual(
        Buffer.from(scenario === 'unrelated unstaged' ? changedUnrelated : baseUnrelated),
      );

      // Lefthook itself must discover and stash unstaged changes. Do not manufacture a patch.
      const result = owned.guard();
      const after = owned.snapshot();
      console.info(
        JSON.stringify({
          layout,
          scenario,
          stdout: result.stdout,
          stderr: result.stderr,
          status: result.status,
          commandStdout: result.commandStdout,
          commandStderr: result.commandStderr,
          commandStatus: result.commandStatus,
        }),
      );
      // Soft assertions retain evidence for every effect even on the expected false-success RED.
      expect.soft(after, `state preservation; see ${owned.transcript}`).toEqual(before);
      expect
        .soft(result.commandStderr, `exact guard diagnostics; see ${owned.transcript}`)
        .toBe('');
      const expectedStatus = scenario === 'same-file unstaged' ? 1 : 0;
      expect.soft(result.status, `hook exit; see ${owned.transcript}`).toBe(expectedStatus);
      expect
        .soft(result.commandStatus, `exact guard exit; see ${owned.transcript}`)
        .toBe(`${expectedStatus}\n`);
      expect
        .soft(result.commandStdout, `exact guard output; see ${owned.transcript}`)
        .toBe(scenario === 'same-file unstaged' ? `${guardError}\nstaged.md\n` : '');
    },
    15_000,
  );
});
