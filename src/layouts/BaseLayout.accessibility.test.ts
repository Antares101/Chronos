import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(new URL('./BaseLayout.astro', import.meta.url), 'utf8');

function readThemeBlock(selector: string) {
  const match = layoutSource.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`));

  if (!match) {
    throw new Error(`Could not find ${selector} theme tokens.`);
  }

  return match[1];
}

function readToken(themeBlock: string, token: string) {
  const match = themeBlock.match(new RegExp(`${token}:\\s*([^;]+);`));

  if (!match) {
    throw new Error(`Could not find ${token}.`);
  }

  return match[1].trim();
}

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255);

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected an opaque six-digit hex color, received ${hex}.`);
  }

  return channels
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce(
      (luminance, channel, index) => luminance + channel * [0.2126, 0.7152, 0.0722][index],
      0,
    );
}

function contrastRatio(foreground: string, background: string) {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (first, second) => second - first,
  );

  return (lighter + 0.05) / (darker + 0.05);
}

describe('BaseLayout focus ring tokens', () => {
  it('uses opaque rings with at least 3:1 contrast against primary and muted route surfaces', () => {
    const themes = [
      {
        name: 'light',
        block: readThemeBlock(':root'),
        surfaces: ['--chronos-surface', '--chronos-surface-muted'],
      },
      {
        name: 'dark',
        block: readThemeBlock(":root\\[data-theme='dark'\\]"),
        surfaces: ['--chronos-surface', '--chronos-surface-muted'],
      },
    ];

    for (const { name, block, surfaces } of themes) {
      const ring = readToken(block, '--chronos-ring');

      expect(ring, `${name} focus ring must be opaque`).toMatch(/^#[\da-f]{6}$/i);

      for (const surfaceToken of surfaces) {
        const surface = readToken(block, surfaceToken);

        expect(
          contrastRatio(ring, surface),
          `${name} focus ring on ${surfaceToken}`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe('BaseLayout responsive shell', () => {
  it('permits reflow below 320 CSS px at browser zoom without a body min-width floor', () => {
    expect(layoutSource).not.toMatch(/body\s*\{[^}]*\bmin-width\s*:/s);
  });
});
