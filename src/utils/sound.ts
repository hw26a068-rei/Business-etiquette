const LOCAL_STORAGE_SE_KEY = 'manner_game_se_volume';

export const getSeVolume = (): number => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SE_KEY);
    return saved !== null ? parseFloat(saved) : 0.5;
  } catch {
    return 0.5;
  }
};

export const setSeVolume = (volume: number) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_SE_KEY, String(volume));
    if (typeof window !== 'undefined') {
      (window as any).mannerGameSeVolume = volume;
      window.dispatchEvent(new CustomEvent('se-volume-change', { detail: volume }));
    }
  } catch (e) {
    console.error(e);
  }
};

export const playSe = (src: string) => {
  try {
    const audio = new Audio(src);
    const vol = typeof window !== 'undefined' ? ((window as any).mannerGameSeVolume ?? getSeVolume()) : 0.5;
    audio.volume = vol;
    audio.play().catch(err => {
      console.warn('Failed to play SE:', err);
    });
  } catch (e) {
    console.warn(e);
  }
};

export const playClickSound = () => {
  playSe('/クリック.wav');
};
