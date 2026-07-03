import { describe, expect, it, vi } from 'vitest';

import {
  CHRONOS_SOUND_MUTED_STORAGE_KEY,
  CHRONOS_THEME_STORAGE_KEY,
  initSoundToggle,
  initThemeToggle,
  resolveInitialTheme,
} from './app-shell-client';

class FakeButton {
  disabled = true;
  readonly attributes = new Map<string, string>();
  private readonly listeners = new Map<string, (() => void)[]>();

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  addEventListener(type: 'click', listener: () => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  click(): void {
    for (const listener of this.listeners.get('click') ?? []) {
      listener();
    }
  }
}

class FakeLabel {
  textContent: string | null = null;
}

function createRoot(theme?: string) {
  return {
    dataset: { theme },
    style: { colorScheme: undefined as string | undefined },
  };
}

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));

  return {
    values,
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}

function createMatchMedia(prefersDark: boolean, reducedMotion = false) {
  return vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : prefersDark,
  }));
}

function createAudioContextConstructor() {
  const gain = {
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
  const oscillator = () => ({
    type: 'sine' as OscillatorType,
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  });

  return class FakeAudioContext {
    currentTime = 10;
    destination = {};
    state = 'running';
    resume = vi.fn();
    createGain = vi.fn(() => gain);
    createOscillator = vi.fn(oscillator);
  };
}

describe('app shell theme behavior', () => {
  it('uses chronos-theme localStorage before dataset theme and system preference', () => {
    const root = createRoot('light');
    const storage = createStorage({ [CHRONOS_THEME_STORAGE_KEY]: 'dark' });

    expect(resolveInitialTheme({ root, storage, matchMedia: createMatchMedia(false) })).toBe(
      'dark',
    );
  });

  it('falls back to prefers-color-scheme when no stored or current theme exists', () => {
    expect(
      resolveInitialTheme({
        root: createRoot(),
        storage: createStorage(),
        matchMedia: createMatchMedia(true),
      }),
    ).toBe('dark');
  });

  it('toggles dataset theme, aria state, label, and storage', () => {
    const root = createRoot('light');
    const button = new FakeButton();
    const label = new FakeLabel();
    const storage = createStorage();

    initThemeToggle({ root, button, label, storage, matchMedia: createMatchMedia(false) });
    button.click();

    expect(root.dataset.theme).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
    expect(button.attributes.get('aria-pressed')).toBe('true');
    expect(button.attributes.get('aria-label')).toBe('Switch to light theme');
    expect(label.textContent).toBe('Light mode');
    expect(storage.setItem).toHaveBeenCalledWith(CHRONOS_THEME_STORAGE_KEY, 'dark');
    expect(button.disabled).toBe(false);
    expect(button.attributes.has('aria-disabled')).toBe(false);
  });
});

describe('app shell sound behavior', () => {
  it('defaults muted when chronos-sound-muted is absent', () => {
    const button = new FakeButton();
    const label = new FakeLabel();
    const controller = initSoundToggle({
      button,
      label,
      storage: createStorage(),
      matchMedia: createMatchMedia(false),
    });

    expect(controller.getMuted()).toBe(true);
    expect(button.attributes.get('aria-pressed')).toBe('false');
    expect(button.attributes.get('aria-label')).toBe('Enable interaction sounds');
    expect(label.textContent).toBe('Sound off');
    expect(button.disabled).toBe(false);
    expect(button.attributes.has('aria-disabled')).toBe(false);
  });

  it('persists click and keyboard-activation state through the native button click event', () => {
    const button = new FakeButton();
    const label = new FakeLabel();
    const storage = createStorage();

    initSoundToggle({
      button,
      label,
      storage,
      matchMedia: createMatchMedia(false),
      getAudioContextConstructor: createAudioContextConstructor,
    });
    button.click();

    expect(storage.setItem).toHaveBeenCalledWith(CHRONOS_SOUND_MUTED_STORAGE_KEY, 'false');
    expect(button.attributes.get('aria-pressed')).toBe('true');
    expect(button.attributes.get('aria-label')).toBe('Disable interaction sounds');
    expect(label.textContent).toBe('Sound on');
  });

  it('does not play decorative audio when reduced motion is requested', () => {
    const getAudioContextConstructor = vi.fn(createAudioContextConstructor);
    const controller = initSoundToggle({
      button: new FakeButton(),
      label: new FakeLabel(),
      storage: createStorage({ [CHRONOS_SOUND_MUTED_STORAGE_KEY]: 'false' }),
      matchMedia: createMatchMedia(false, true),
      getAudioContextConstructor,
    });

    expect(controller.playChime()).toBe(false);
    expect(getAudioContextConstructor).not.toHaveBeenCalled();
  });

  it('fails silently when Web Audio is unsupported', () => {
    const controller = initSoundToggle({
      button: new FakeButton(),
      label: new FakeLabel(),
      storage: createStorage({ [CHRONOS_SOUND_MUTED_STORAGE_KEY]: 'false' }),
      matchMedia: createMatchMedia(false),
      getAudioContextConstructor: () => undefined,
    });

    expect(() => controller.playChime()).not.toThrow();
    expect(controller.playChime()).toBe(false);
  });
});
