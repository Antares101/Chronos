import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../scripts/browser-smoke.mjs', import.meta.url), 'utf8');

async function runSmoke(environment: NodeJS.ProcessEnv) {
  const child = spawn(process.execPath, ['scripts/browser-smoke.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, ...environment },
    stdio: ['ignore', 'ignore', 'pipe'],
    windowsHide: true,
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });
  const [code, signal] = await once(child, 'exit');

  return { code, signal, stderr };
}

describe('browser smoke harness contract', () => {
  it('owns the app target and pins the server clock to the local fixture date', () => {
    expect(source).toContain("const fixtureNow = '2026-07-02T11:30:00.000Z';");
    expect(source).toContain('smokeTarget = await startOwnedDevServer();');
    expect(source).not.toContain('CHRONOS_BASE_URL');
    expect(source).toContain('env: ownedServerEnvironment');
    expect(source).toContain("PUBLIC_SUPABASE_URL: 'https://chronos-smoke.invalid'");
    expect(source).toContain("PUBLIC_SUPABASE_ANON_KEY: 'chronos-browser-smoke-anon-key'");
    expect(source).toContain("selector: '#app-title'");
  });

  it('bounds browser startup and tears down the owned browser, profile, and server', () => {
    expect(source).toContain('const deadline = Date.now() + 15000;');
    expect(source).toContain('await stopChildProcess(chrome);');
    expect(source).toContain('await removeUserDataDir(userDataDir);');
    expect(source).toContain('await smokeTarget?.close();');
  });

  it('reports an early browser exit before the CDP timeout', async () => {
    const result = await runSmoke({ CHRONOS_BROWSER_BIN: process.execPath });

    expect(result.code).not.toBe(0);
    expect(result.signal).toBeNull();
    expect(result.stderr).toMatch(/Browser exited before CDP became ready with code \d+\./);
  }, 60_000);
});
