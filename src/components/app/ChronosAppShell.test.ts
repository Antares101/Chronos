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
    expect(shellSource).not.toContain('role="tab"');
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
});
