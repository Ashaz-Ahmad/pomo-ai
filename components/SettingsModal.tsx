import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  initialWork: number;
  initialShortBreak: number;
  initialLongBreak: number;
  initialLongBreakInterval: number;
  initialSoundEnabled: boolean;
  initialSoundVolume: number;
  onSave: (settings: {
    work: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
    soundEnabled: boolean;
    soundVolume: number;
  }) => void;
  onClose: () => void;
  disableSave?: boolean;
  mode?: 'work' | 'shortBreak' | 'longBreak';
}

// Shared AudioContext for all sounds
let sharedAudioContext: AudioContext | null = null;
function getAudioContext() {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioContextClass();
  }
  return sharedAudioContext;
}

const createTone = (frequency: number, duration: number, volume: number = 0.3) => {
  const audioContext = getAudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
  return audioContext;
};
const playWorkCompletionSound = (volume: number = 0.3) => {
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - ascending chord
  const duration = 0.5;
  const gap = 0.3;
  const repeat = 6;
  const repeatGap = 0.25;
  for (let r = 0; r < repeat; r++) {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        createTone(freq, duration, volume);
      }, r * ((frequencies.length * (duration + gap)) + repeatGap * 1000) + index * (duration + gap) * 1000);
    });
  }
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  initialWork,
  initialShortBreak,
  initialLongBreak,
  initialLongBreakInterval,
  initialSoundEnabled,
  initialSoundVolume,
  onSave,
  onClose,
  disableSave,
  mode = 'work',
}) => {
  const [work, setWork] = useState(initialWork.toString());
  const [shortBreak, setShortBreak] = useState(initialShortBreak.toString());
  const [longBreak, setLongBreak] = useState(initialLongBreak.toString());
  const [longBreakInterval, setLongBreakInterval] = useState(initialLongBreakInterval.toString());
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);
  const [soundVolume, setSoundVolume] = useState(initialSoundVolume);

  // Reset state when modal opens with new props
  useEffect(() => {
    if (isOpen) {
      setWork(initialWork.toString());
      setShortBreak(initialShortBreak.toString());
      setLongBreak(initialLongBreak.toString());
      setLongBreakInterval(initialLongBreakInterval.toString());
      setSoundEnabled(initialSoundEnabled);
      setSoundVolume(initialSoundVolume);
    }
  }, [isOpen, initialWork, initialShortBreak, initialLongBreak, initialLongBreakInterval, initialSoundEnabled, initialSoundVolume]);

  const handleSave = () => {
    // Validate and convert to numbers
    const w = parseInt(work, 10);
    const s = parseInt(shortBreak, 10);
    const l = parseInt(longBreak, 10);
    const li = parseInt(longBreakInterval, 10);
    if (isNaN(w) || isNaN(s) || isNaN(l) || isNaN(li) || w < 1 || s < 1 || l < 1 || li < 1) return;
    onSave({ 
      work: w, 
      shortBreak: s, 
      longBreak: l, 
      longBreakInterval: li,
      soundEnabled,
      soundVolume
    });
  };

  if (!isOpen) return null;

  // Theme color for Save button
  let saveButtonColor = 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-red-500/25';
  if (mode === 'shortBreak') saveButtonColor = 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-blue-500/25';
  if (mode === 'longBreak') saveButtonColor = 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-purple-500/25';

  // Theme colors for sound settings
  let toggleColor = 'bg-red-500';
  let toggleFocusRing = 'focus:ring-red-500/20';
  let sliderThumbColor = '#ef4444'; // red-500
  let testButtonColor = 'bg-red-500 hover:bg-red-600';
  
  if (mode === 'shortBreak') {
    toggleColor = 'bg-blue-500';
    toggleFocusRing = 'focus:ring-blue-500/20';
    sliderThumbColor = '#3b82f6'; // blue-500
    testButtonColor = 'bg-blue-500 hover:bg-blue-600';
  } else if (mode === 'longBreak') {
    toggleColor = 'bg-purple-500';
    toggleFocusRing = 'focus:ring-purple-500/20';
    sliderThumbColor = '#a855f7'; // purple-500
    testButtonColor = 'bg-purple-500 hover:bg-purple-600';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-60">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 p-4 sm:p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-slate-800 dark:text-slate-100">Timer Settings</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-2 sm:space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1" htmlFor="work">Pomodoro (work) duration (minutes)</label>
              <input
                id="work"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={1}
                maxLength={3}
                className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                value={work}
                onChange={e => setWork(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="25"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1" htmlFor="shortBreak">Short break duration (minutes)</label>
              <input
                id="shortBreak"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={1}
                maxLength={2}
                className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                value={shortBreak}
                onChange={e => setShortBreak(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="5"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1" htmlFor="longBreak">Long break duration (minutes)</label>
              <input
                id="longBreak"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={1}
                maxLength={2}
                className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                value={longBreak}
                onChange={e => setLongBreak(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="15"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1" htmlFor="longBreakInterval">Long break after how many work sessions?</label>
              <input
                id="longBreakInterval"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={1}
                maxLength={2}
                className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                value={longBreakInterval}
                onChange={e => setLongBreakInterval(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="4"
                required
              />
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded px-3 py-2 flex items-center gap-2">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0ZM12 7v.01"/></svg>
              Duration settings will be applied to all tasks. Changing them will reset the timers across all tasks.
            </div>
            {/* Sound Settings section follows */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 sm:pt-4 mt-2 sm:mt-4">
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-6 text-slate-800 dark:text-slate-100">Sound Settings</h3>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <label className="text-slate-700 dark:text-slate-300 font-medium" htmlFor="soundEnabled">
                  Enable timer sounds (recommended)
                </label>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 ${toggleFocusRing} ${
                    soundEnabled ? toggleColor : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  aria-label={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {soundEnabled && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1" htmlFor="soundVolume">
                    Sound volume: {Math.round(soundVolume * 100)}%
                  </label>
                  <input
                    id="soundVolume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      accentColor: sliderThumbColor,
                      '--slider-thumb-color': sliderThumbColor,
                    } as React.CSSProperties & { '--slider-thumb-color': string }}
                    value={soundVolume}
                    onChange={e => setSoundVolume(parseFloat(e.target.value))}
                  />
                  <div className="grid grid-cols-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="text-left">0%</span>
                    <span className="text-center">50%</span>
                    <span className="text-right">100%</span>
                  </div>
                  {/* Test Sound Button */}
                  <button
                    type="button"
                    className={`mt-2 px-3 py-2 rounded-md ${testButtonColor} text-white font-semibold shadow`}
                    onClick={() => playWorkCompletionSound(soundVolume)}
                  >
                    Test Sound
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-end gap-2 mt-4 sm:mt-8">
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                type="button"
                className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-3 py-2 rounded-md text-white font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${saveButtonColor}`}
                disabled={disableSave}
                title={disableSave ? 'Pause the timer to save settings.' : undefined}
              >
                Save
              </button>
            </div>
            {disableSave && (
              <div className="text-sm text-red-500 dark:text-red-400 text-center mt-2">
                Pause the timer to save settings.
              </div>
            )}
          </div>
        </form>
        <button
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close settings"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SettingsModal; 