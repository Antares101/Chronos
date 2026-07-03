export const CHRONOS_THEME_STORAGE_KEY = 'chronos-theme';
export const CHRONOS_SOUND_MUTED_STORAGE_KEY = 'chronos-sound-muted';

type AppTheme = 'light' | 'dark';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

type MatchMedia = (query: string) => Pick<MediaQueryList, 'matches'>;

type ThemeRootTarget = {
  dataset: {
    theme?: string;
  };
  style: {
    colorScheme?: string;
  };
};

type ButtonTarget = {
  disabled: boolean;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  addEventListener(type: 'click', listener: () => void): void;
};

type TextTarget = {
  textContent: string | null;
};

type AudioParamTarget = {
  setValueAtTime(value: number, startTime: number): void;
  exponentialRampToValueAtTime(value: number, endTime: number): void;
};

type AudioNodeTarget = {
  connect(destination: unknown): void;
};

type OscillatorTarget = AudioNodeTarget & {
  type: OscillatorType;
  frequency: Pick<AudioParamTarget, 'setValueAtTime'>;
  start(when?: number): void;
  stop(when?: number): void;
};

type GainTarget = AudioNodeTarget & {
  gain: AudioParamTarget;
};

type AudioContextTarget = {
  currentTime: number;
  destination: unknown;
  state?: string;
  resume?: () => Promise<void> | void;
  createGain(): GainTarget;
  createOscillator(): OscillatorTarget;
};

type AudioContextConstructor = new () => AudioContextTarget;

function isAppTheme(value: string | undefined | null): value is AppTheme {
  return value === 'dark' || value === 'light';
}

function readStorageValue(storage: StorageLike | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorageValue(storage: StorageLike | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // Persistence is progressive enhancement; visible state still updates.
  }
}

export function getPreferredTheme(matchMedia: MatchMedia | undefined): AppTheme {
  try {
    return matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function resolveInitialTheme(options: {
  root: ThemeRootTarget;
  storage?: StorageLike;
  matchMedia?: MatchMedia;
}): AppTheme {
  const storedTheme = readStorageValue(options.storage, CHRONOS_THEME_STORAGE_KEY);

  if (isAppTheme(storedTheme)) {
    return storedTheme;
  }

  if (isAppTheme(options.root.dataset.theme)) {
    return options.root.dataset.theme;
  }

  return getPreferredTheme(options.matchMedia);
}

export function applyThemeState(options: {
  root: ThemeRootTarget;
  button: ButtonTarget;
  label: TextTarget;
  theme: AppTheme;
}): void {
  options.root.dataset.theme = options.theme;
  options.root.style.colorScheme = options.theme;
  options.button.setAttribute('aria-pressed', String(options.theme === 'dark'));
  options.button.setAttribute(
    'aria-label',
    options.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
  options.label.textContent = options.theme === 'dark' ? 'Light mode' : 'Dark mode';
}

export function initThemeToggle(options: {
  root: ThemeRootTarget;
  button: ButtonTarget;
  label: TextTarget;
  storage?: StorageLike;
  matchMedia?: MatchMedia;
}): void {
  const getTheme = () => resolveInitialTheme(options);

  applyThemeState({ ...options, theme: getTheme() });
  options.button.disabled = false;
  options.button.removeAttribute('aria-disabled');

  options.button.addEventListener('click', () => {
    const nextTheme: AppTheme = getTheme() === 'dark' ? 'light' : 'dark';

    writeStorageValue(options.storage, CHRONOS_THEME_STORAGE_KEY, nextTheme);
    applyThemeState({ ...options, theme: nextTheme });
  });
}

export function initSoundToggle(options: {
  button: ButtonTarget;
  label: TextTarget;
  storage?: StorageLike;
  matchMedia?: MatchMedia;
  getAudioContextConstructor?: () => AudioContextConstructor | undefined;
}): {
  getMuted(): boolean;
  setMuted(nextMuted: boolean): void;
  playChime(): boolean;
} {
  const motionQuery = options.matchMedia?.('(prefers-reduced-motion: reduce)');
  let muted = readStorageValue(options.storage, CHRONOS_SOUND_MUTED_STORAGE_KEY) !== 'false';
  let audioContext: AudioContextTarget | null = null;

  const setMuted = (nextMuted: boolean) => {
    muted = nextMuted;
    options.button.setAttribute('aria-pressed', String(!muted));
    options.button.setAttribute(
      'aria-label',
      muted ? 'Enable interaction sounds' : 'Disable interaction sounds',
    );
    options.label.textContent = muted ? 'Sound off' : 'Sound on';
  };

  const getAudioContext = () => {
    if (audioContext) {
      return audioContext;
    }

    const AudioContextTarget = options.getAudioContextConstructor?.();

    if (!AudioContextTarget) {
      return null;
    }

    try {
      audioContext = new AudioContextTarget();
      return audioContext;
    } catch {
      return null;
    }
  };

  const playChime = () => {
    if (muted || motionQuery?.matches) {
      return false;
    }

    const context = getAudioContext();

    if (!context) {
      return false;
    }

    try {
      if (context.state === 'suspended') {
        void context.resume?.();
      }

      const now = context.currentTime;
      const gain = context.createGain();
      const first = context.createOscillator();
      const second = context.createOscillator();

      first.type = 'sine';
      second.type = 'triangle';
      first.frequency.setValueAtTime(523.25, now);
      second.frequency.setValueAtTime(783.99, now + 0.03);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      first.connect(gain);
      second.connect(gain);
      gain.connect(context.destination);
      first.start(now);
      second.start(now + 0.03);
      first.stop(now + 0.16);
      second.stop(now + 0.18);
      return true;
    } catch {
      return false;
    }
  };

  setMuted(muted);
  options.button.disabled = false;
  options.button.removeAttribute('aria-disabled');

  options.button.addEventListener('click', () => {
    const nextMuted = !muted;

    writeStorageValue(options.storage, CHRONOS_SOUND_MUTED_STORAGE_KEY, String(nextMuted));
    setMuted(nextMuted);
    playChime();
  });

  return {
    getMuted: () => muted,
    setMuted,
    playChime,
  };
}
