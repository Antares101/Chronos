import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const shellSource = readFileSync(new URL('./ChronosAppShell.astro', import.meta.url), 'utf8');

describe('ChronosAppShell command bar contract', () => {
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
