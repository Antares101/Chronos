/* global WebSocket, clearTimeout, console, fetch, setTimeout */

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const routeChecks = [
  {
    path: '/app/today',
    semanticChecks: [
      { name: 'app heading', text: 'Run the Day' },
      {
        name: 'quick task capture heading',
        selector: '#today-quick-capture-title',
        text: 'Add a Task',
      },
      { name: 'day sheet heading', selector: '#today-sheet-title', text: 'Day Sheet' },
      {
        name: 'active block context',
        selector: '.today-active-block',
        text: 'CURRENT EXECUTION',
      },
    ],
    hydrationTargets: [{ name: 'today-quick-capture', selector: '.today-quick-capture' }],
  },
  {
    path: '/app/planning',
    semanticChecks: [
      { name: 'app heading', text: 'Shape the week' },
      {
        name: 'planning actions heading',
        selector: '#planning-actions-title',
        text: 'Set up blocks and assign tasks',
      },
      {
        name: 'weekly calendar heading',
        selector: '#weekly-calendar-title',
        text: 'Weekly plan',
      },
      {
        name: 'weekly planned blocks',
        selector: '[aria-label="Weekly planned blocks"]',
        text: 'Check the active block',
      },
      {
        name: 'task list heading',
        selector: '#task-list-title',
        text: 'Unassigned tasks',
      },
      {
        name: 'unassigned task list',
        selector: '[aria-label="Unassigned tasks"]',
        text: 'Draft tomorrow priorities',
      },
    ],
    hydrationTargets: [
      { name: 'weekly-calendar', selector: '.weekly-calendar' },
      { name: 'task-list', selector: '.task-list' },
    ],
  },
  {
    path: '/app/review',
    semanticChecks: [
      { name: 'app heading', text: 'Close the loop' },
      {
        name: 'review actions heading',
        selector: '#review-actions-title',
        text: 'Finish blocks and save conclusions',
      },
      {
        name: 'conclusion panel heading',
        selector: '#conclusion-panel-title',
        text: 'Last review',
      },
      {
        name: 'conclusion summary',
        selector: 'article[aria-label="Block conclusion summary"]',
        text: 'Review local fixture outcomes',
      },
      {
        name: 'conclusion notes heading',
        selector: '#conclusion-notes-title',
        text: 'Notes',
      },
    ],
    hydrationTargets: [{ name: 'conclusion-panel', selector: '.conclusion-panel' }],
  },
];

const mobileViewport = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
};

class CdpClient {
  constructor(webSocketUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.socket = new WebSocket(webSocketUrl);
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });

    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);

      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);

        if (message.error) {
          reject(new Error(message.error.message));
          return;
        }

        resolve(message.result);
        return;
      }

      if (message.method) {
        this.events.push(message);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;

    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });

    this.socket.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  async close() {
    this.socket.close();
  }

  waitForEvent(method, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.socket.removeEventListener('message', onMessage);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);

      const onMessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.method === method) {
          clearTimeout(timeout);
          this.socket.removeEventListener('message', onMessage);
          resolve(message);
        }
      };

      this.socket.addEventListener('message', onMessage);
    });
  }

  takeConsoleFailures() {
    const failures = [];

    for (const event of this.events) {
      if (event.method === 'Runtime.exceptionThrown') {
        const details = event.params.exceptionDetails;
        failures.push(details.exception?.description ?? details.text);
      }

      if (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error') {
        failures.push(event.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' '));
      }
    }

    return failures.filter((message) =>
      /_jsxDEV|TypeError|DailyTimeline|BlockDetail|WeeklyCalendar|TaskList|ConclusionPanel/i.test(
        message,
      ),
    );
  }
}

async function main() {
  const chromePath = findChromePath();
  let smokeTarget;
  let chrome;
  let userDataDir;

  try {
    smokeTarget = await resolveSmokeTarget();
    const baseUrl = smokeTarget.baseUrl;
    const rootRedirectResult = await verifyRootRedirect(baseUrl);
    const debuggingPort = await getFreePort();
    userDataDir = await mkdtemp(path.join(tmpdir(), 'chronos-browser-smoke-'));
    chrome = spawn(
      chromePath,
      [
        '--headless=new',
        `--remote-debugging-port=${debuggingPort}`,
        `--user-data-dir=${userDataDir}`,
        '--disable-background-networking',
        '--disable-gpu',
        '--no-default-browser-check',
        '--no-first-run',
        'about:blank',
      ],
      {
        stdio: 'ignore',
        windowsHide: true,
      },
    );

    const webSocketUrl = await waitForWebSocketUrl(debuggingPort);
    const client = new CdpClient(webSocketUrl);
    await client.open();
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    const routeResults = [];
    for (const routeCheck of routeChecks) {
      routeResults.push(await verifyHydratedRoute(client, baseUrl, routeCheck));
    }

    const signInResult = await verifySignInTargets(client, baseUrl);
    const consoleFailures = client.takeConsoleFailures();
    await client.close();

    if (consoleFailures.length > 0) {
      throw new Error(`Browser console hydration failures:\n${consoleFailures.join('\n')}`);
    }

    console.log(
      JSON.stringify(
        { baseUrl, serverMode: smokeTarget.mode, rootRedirectResult, routeResults, signInResult },
        null,
        2,
      ),
    );
  } finally {
    await stopChildProcess(chrome);
    if (userDataDir) {
      await removeUserDataDir(userDataDir);
    }
    await smokeTarget?.close();
  }
}

async function resolveSmokeTarget() {
  if (process.env.CHRONOS_BASE_URL) {
    return {
      baseUrl: process.env.CHRONOS_BASE_URL.replace(/\/$/, ''),
      mode: 'external',
      close: async () => undefined,
    };
  }

  return startOwnedDevServer();
}

async function verifyRootRedirect(baseUrl) {
  const response = await fetch(`${baseUrl}/`, { redirect: 'manual' });
  const location = response.headers.get('location');

  if (response.status !== 302 || location !== '/app/today') {
    throw new Error(
      `Root redirect smoke failed: expected HTTP 302 with Location /app/today, received HTTP ${response.status} with Location ${location ?? '<missing>'}.`,
    );
  }

  return {
    path: '/',
    status: response.status,
    location,
  };
}

async function startOwnedDevServer() {
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  process.env.ASTRO_TELEMETRY_DISABLED ??= '1';
  process.env.BROWSER ??= 'none';
  const astroDevEntry = pathToFileURL(
    path.join(process.cwd(), 'node_modules', 'astro', 'dist', 'core', 'dev', 'index.js'),
  ).href;
  const { default: startAstroDevServer } = await import(astroDevEntry);
  let devServer;

  try {
    devServer = await startAstroDevServer({
      root: process.cwd(),
      logLevel: 'silent',
      server: {
        host: '127.0.0.1',
        port,
      },
    });

    if (devServer.address.port !== port) {
      throw new Error(`Owned Chronos dev server bound to ${devServer.address.port}, not ${port}.`);
    }

    await waitForOwnedDevServer(baseUrl);
  } catch (error) {
    await devServer?.stop();
    throw error;
  }

  return {
    baseUrl,
    mode: 'owned-dev-server',
    close: async () => devServer.stop(),
  };
}

function findChromePath() {
  const configuredPath = process.env.CHRONOS_BROWSER_BIN;

  if (configuredPath) {
    return configuredPath;
  }

  if (process.platform === 'win32') {
    const programFiles = process.env.ProgramFiles;
    const programFilesX86 = process.env['ProgramFiles(x86)'];
    const localAppData = process.env.LOCALAPPDATA;
    const candidates = [
      programFiles && path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      programFilesX86 &&
        path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      programFiles && path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      programFilesX86 &&
        path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      localAppData && path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    ].filter(Boolean);

    const browserPath = candidates.find((candidate) => existsSync(candidate));

    if (browserPath) {
      return browserPath;
    }

    throw new Error(
      'No Chrome or Edge executable found. Set CHRONOS_BROWSER_BIN to run browser smoke checks.',
    );
  }

  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }

  return process.env.CHROME_BIN ?? 'google-chrome';
}

async function getFreePort() {
  const { createServer } = await import('node:net');
  const server = createServer();

  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });

  const address = server.address();
  await new Promise((resolve) => server.close(resolve));
  return address.port;
}

async function waitForWebSocketUrl(port) {
  const deadline = Date.now() + 15000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const pageTarget = targets.find(
        (target) => target.type === 'page' && target.webSocketDebuggerUrl,
      );

      if (pageTarget) {
        return pageTarget.webSocketDebuggerUrl;
      }
    } catch {
      await delay(250);
    }
  }

  throw new Error('Chrome DevTools Protocol endpoint did not become ready.');
}

async function waitForOwnedDevServer(baseUrl) {
  const deadline = Date.now() + 45000;
  let lastError = 'server was not contacted';

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/app/today`);
      const html = await response.text();

      if (response.ok && html.includes('Run the Day')) {
        return;
      }

      lastError = `HTTP ${response.status} while waiting for /app/today`;
    } catch (error) {
      lastError = error.message;
    }

    await delay(250);
  }

  throw new Error(`Owned Chronos dev server did not become ready at ${baseUrl}: ${lastError}`);
}

async function verifyHydratedRoute(client, baseUrl, routeCheck) {
  const url = `${baseUrl}${routeCheck.path}`;
  await navigate(client, url);

  return waitForRouteAssertions(client, routeCheck);
}

async function waitForRouteAssertions(client, routeCheck) {
  const deadline = Date.now() + 5000;
  let result;
  let failures;

  while (Date.now() < deadline) {
    result = await collectRouteState(client, routeCheck);
    failures = getRouteFailures(result);

    if (failures.semanticFailures.length === 0 && failures.hydrationFailures.length === 0) {
      return {
        pathname: result.pathname,
        semanticChecks: result.semanticChecks.map(({ name }) => name),
        hydrationTargets: result.hydrationTargets.map(({ name, textLength }) => ({
          name,
          textLength,
        })),
      };
    }

    await delay(100);
  }

  throw new Error(
    `Hydration smoke failed for ${routeCheck.path}: ${JSON.stringify(failures ?? {}, null, 2)}`,
  );
}

async function collectRouteState(client, routeCheck) {
  return evaluate(
    client,
    `(() => {
    const semanticChecks = ${JSON.stringify(routeCheck.semanticChecks)};
    const hydrationTargets = ${JSON.stringify(routeCheck.hydrationTargets)};
    const normalize = (value) => value.replace(/\\s+/g, ' ').trim();
    const visibleText = (element) => normalize(element?.innerText ?? '');
    const isVisible = (element) => {
      if (!element) {
        return false;
      }

      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
    };

    return {
      pathname: location.pathname,
      semanticChecks: semanticChecks.map((check) => {
        const element = check.selector ? document.querySelector(check.selector) : document.body;
        const text = visibleText(element);

        return {
          name: check.name,
          selector: check.selector ?? null,
          expectedText: check.text,
          found: Boolean(element),
          visible: isVisible(element),
          textFound: text.includes(normalize(check.text)),
          textSample: text.slice(0, 160),
        };
      }),
      hydrationTargets: hydrationTargets.map((target) => {
        const element = document.querySelector(target.selector);
        const text = visibleText(element);

        return {
          name: target.name,
          selector: target.selector,
          found: Boolean(element),
          visible: isVisible(element),
          textLength: text.length,
          textSample: text.slice(0, 160),
        };
      }),
    };
  })()`,
  );
}

function getRouteFailures(result) {
  return {
    semanticFailures: result.semanticChecks.filter(
      (check) => !check.found || !check.visible || !check.textFound,
    ),
    hydrationFailures: result.hydrationTargets.filter(
      (target) => !target.found || !target.visible || target.textLength === 0,
    ),
  };
}

async function verifySignInTargets(client, baseUrl) {
  await client.send('Emulation.setDeviceMetricsOverride', mobileViewport);
  await navigate(client, `${baseUrl}/sign-in`);

  try {
    return await waitForSignInAssertions(client);
  } finally {
    await client.send('Emulation.clearDeviceMetricsOverride');
  }
}

async function waitForSignInAssertions(client) {
  const deadline = Date.now() + 5000;
  let result;
  let failures = [];

  while (Date.now() < deadline) {
    result = await collectSignInState(client);
    failures = getSignInFailures(result);

    if (failures.length === 0) {
      return result;
    }

    await delay(100);
  }

  throw new Error(
    `Sign-in smoke failed: ${JSON.stringify(
      {
        failures,
        result,
      },
      null,
      2,
    )}`,
  );
}

async function collectSignInState(client) {
  return evaluate(
    client,
    `(() => {
    const expectedHeadingText = 'Sign in to open Chronos.';
    const expectedSubmitText = 'Send sign-in link';
    const normalize = (value) => (value ?? '').replace(/\\s+/g, ' ').trim();
    const visibleText = (element) => normalize(element?.innerText ?? element?.textContent ?? '');
    const heading = document.querySelector('#sign-in-title');
    const email = document.querySelector('input[type="email"][name="email"]');
    const emailLabel = email?.closest('label') ?? null;
    const submit = document.querySelector('button[type="submit"]');
    const headingText = visibleText(heading);
    const emailLabelText = visibleText(emailLabel);
    const submitText = visibleText(submit);

    return {
      pathname: location.pathname,
      bodyFound: Boolean(document.body),
      headingFound: Boolean(heading),
      emailFound: Boolean(email),
      submitFound: Boolean(submit),
      hasHeading: headingText.includes(expectedHeadingText),
      hasEmailLabel: emailLabelText.includes('Email'),
      hasSubmitText: submitText.includes(expectedSubmitText),
      headingText,
      emailLabelText,
      submitText,
      emailHeight: email?.getBoundingClientRect().height ?? 0,
      submitHeight: submit?.getBoundingClientRect().height ?? 0,
    };
  })()`,
  );
}

function getSignInFailures(result) {
  const failures = [];

  if (result.pathname !== '/sign-in') {
    failures.push(`expected pathname /sign-in, received ${result.pathname}`);
  }

  if (!result.bodyFound) {
    failures.push('expected document.body to be available');
  }

  if (!result.headingFound) {
    failures.push('expected heading selector #sign-in-title to exist');
  } else if (!result.hasHeading) {
    failures.push('expected #sign-in-title to include "Sign in to open Chronos."');
  }

  if (!result.emailFound) {
    failures.push('expected input[type="email"][name="email"] to exist');
  } else if (!result.hasEmailLabel) {
    failures.push('expected email input label to include "Email"');
  }

  if (!result.submitFound) {
    failures.push('expected button[type="submit"] to exist');
  } else if (!result.hasSubmitText) {
    failures.push('expected submit button to include "Send sign-in link"');
  }

  if (result.emailFound && result.emailHeight < 44) {
    failures.push(
      `expected email input height to be at least 44px, received ${result.emailHeight}`,
    );
  }

  if (result.submitFound && result.submitHeight < 44) {
    failures.push(
      `expected submit button height to be at least 44px, received ${result.submitHeight}`,
    );
  }

  return failures;
}

async function navigate(client, url) {
  const loaded = client.waitForEvent('Page.loadEventFired', 10000);
  await client.send('Page.navigate', { url });
  await loaded;
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  }

  return result.result.value;
}

async function removeUserDataDir(userDataDir) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rm(userDataDir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 4) {
        console.warn(`Could not remove temporary browser profile ${userDataDir}: ${error.message}`);
        return;
      }

      await delay(250);
    }
  }
}

async function stopChildProcess(childProcess) {
  if (!childProcess || childProcess.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32') {
    await new Promise((resolve) => {
      const taskkill = spawn('taskkill', ['/pid', String(childProcess.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
      taskkill.once('exit', resolve);
      taskkill.once('error', resolve);
    });
  } else if (childProcess.pid) {
    try {
      process.kill(-childProcess.pid, 'SIGTERM');
    } catch {
      childProcess.kill('SIGTERM');
    }
  }

  await Promise.race([once(childProcess, 'exit'), delay(2000)]).catch(() => undefined);
}

await main();
