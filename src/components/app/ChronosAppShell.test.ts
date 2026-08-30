import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const shellSource = readFileSync(new URL('./ChronosAppShell.astro', import.meta.url), 'utf8');

describe('ChronosAppShell command bar contract', () => {
  it('renders label-only section links while preserving active-route semantics', () => {
    expect(shellSource).toContain('<nav class="section-nav"');
    expect(shellSource).toContain('href={route.href}');
    expect(shellSource).toContain("aria-current={currentPath === route.href ? 'page' : undefined}");
    expect(shellSource).toContain('<span>{route.label}</span>');
    expect(shellSource).not.toContain('<small>{route.description}</small>');
  });

  it('preserves link routes and native utility controls in the compact row', () => {
    for (const [route, label] of [
      ['today', 'Today'],
      ['planning', 'Planning'],
      ['review', 'Review'],
      ['insights', 'Insights'],
    ]) {
      expect(shellSource).toContain(`href: chronosAppRoutes.${route}, label: '${label}'`);
    }

    expect(shellSource).toMatch(/<button[\s\S]*data-sound-toggle/);
    expect(shellSource).toMatch(/<button[\s\S]*data-theme-toggle/);
    expect(shellSource).toContain('<form method="post" action="/sign-out">');
    expect(shellSource).toContain('class="sign-out-button ui-button" aria-label="Sign out"');
    expect(shellSource.match(/<svg viewBox="0 0 24 24" aria-hidden="true">/g)).toHaveLength(3);
    expect(shellSource).toContain('class="visually-hidden" data-sound-toggle-label');
    expect(shellSource).toContain('class="visually-hidden" data-theme-toggle-label');
    expect(shellSource).not.toContain('role="tab"');
  });

  it('keeps each route heading available to assistive technology while compacting the shared shell', () => {
    expect(shellSource).toContain(
      'const isCompactShellRoute = routes.some((route) => route.href === currentPath);',
    );
    expect(shellSource).toContain("{ 'command-bar--compact': isCompactShellRoute }");
    expect(shellSource).toContain('<h1 id="app-title" class="visually-hidden">{heading}</h1>');
    expect(shellSource).not.toContain('isTodayRoute');
  });

  it('associates the fixed desktop utility cluster with the command bar and lets it scroll on mobile', () => {
    const utilitiesIndex = shellSource.indexOf('<div class="command-bar__utilities"');
    const commandBarIndex = shellSource.indexOf("class:list={['command-bar'");
    const commandBarEndIndex = shellSource.indexOf('</section>', commandBarIndex);

    expect(commandBarIndex).toBeGreaterThan(-1);
    expect(utilitiesIndex).toBeGreaterThan(commandBarIndex);
    expect(commandBarEndIndex).toBeGreaterThan(commandBarIndex);
    expect(shellSource.slice(commandBarIndex, commandBarEndIndex)).toContain(
      'command-bar__utilities',
    );
    expect(shellSource).toMatch(/\.command-bar__utilities\s*{[\s\S]*position: fixed;/);
    expect(shellSource).toContain('top: max(0.75rem, env(safe-area-inset-top));');
    expect(shellSource).toContain('right: max(0.75rem, env(safe-area-inset-right));');
    expect(shellSource).toMatch(
      /@media \(max-width: 520px\)\s*{[\s\S]*\.command-bar__utilities\s*{[\s\S]*position: static;/,
    );
    expect(shellSource).toMatch(
      /\.sign-out-button\s*{[\s\S]*width: 2\.75rem;[\s\S]*height: 2\.75rem;/,
    );
  });

  it('keeps utility and route focus order aligned with the visual command bar', () => {
    const soundToggleIndex = shellSource.indexOf('data-sound-toggle');
    const themeToggleIndex = shellSource.indexOf('data-theme-toggle');
    const signOutIndex = shellSource.indexOf('action="/sign-out"');
    const sectionNavIndex = shellSource.indexOf('<nav class="section-nav"');

    expect(soundToggleIndex).toBeGreaterThan(-1);
    expect(themeToggleIndex).toBeGreaterThan(soundToggleIndex);
    expect(signOutIndex).toBeGreaterThan(themeToggleIndex);
    expect(sectionNavIndex).toBeGreaterThan(signOutIndex);
    expect(shellSource).not.toMatch(/\.theme-toggle\s*{[^}]*order:/);
    expect(shellSource).not.toMatch(/\.sound-toggle\s*{[^}]*order:/);
  });

  it('gives all idle utility controls equal transparent border weight', () => {
    expect(shellSource).toMatch(
      /\.command-bar__utilities\s+:is\(\.theme-toggle, \.sound-toggle, \.sign-out-button\)\s*{\s*border: 1px solid transparent;/,
    );
    expect(shellSource).toMatch(
      /\.command-bar__utilities\s+:is\(\.theme-toggle, \.sound-toggle, \.sign-out-button\):hover:not\(:disabled\)\s*{\s*border-color: var\(--app-border-strong\);/,
    );
  });

  it('keeps two readable route columns on narrow screens', () => {
    const mobileStyles = shellSource.slice(shellSource.indexOf('@media (max-width: 520px)'));

    expect(mobileStyles).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
    expect(mobileStyles).toContain('min-height: 2.75rem;');
    expect(shellSource).toContain('.command-bar--compact {');
    expect(shellSource).not.toContain('command-bar--today');
  });
});
