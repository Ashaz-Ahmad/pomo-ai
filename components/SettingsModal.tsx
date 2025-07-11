import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  initialWork: number;
  initialShortBreak: number;
  initialLongBreak: number;
  initialLongBreakInterval: number;
  onSave: (settings: {
    work: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
  }) => void;
  onClose: () => void;
  disableSave?: boolean;
  mode?: 'work' | 'shortBreak' | 'longBreak';
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  initialWork,
  initialShortBreak,
  initialLongBreak,
  initialLongBreakInterval,
  onSave,
  onClose,
  disableSave,
  mode = 'work',
}) => {
  const [work, setWork] = useState(initialWork.toString());
  const [shortBreak, setShortBreak] = useState(initialShortBreak.toString());
  const [longBreak, setLongBreak] = useState(initialLongBreak.toString());
  const [longBreakInterval, setLongBreakInterval] = useState(initialLongBreakInterval.toString());

  const handleSave = () => {
    // Validate and convert to numbers
    const w = parseInt(work, 10);
    const s = parseInt(shortBreak, 10);
    const l = parseInt(longBreak, 10);
    const li = parseInt(longBreakInterval, 10);
    if (isNaN(w) || isNaN(s) || isNaN(l) || isNaN(li) || w < 1 || s < 1 || l < 1 || li < 1) return;
    onSave({ work: w, shortBreak: s, longBreak: l, longBreakInterval: li });
  };

  if (!isOpen) return null;

  // Theme color for Save button
  let saveButtonColor = 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-red-500/25';
  if (mode === 'shortBreak') saveButtonColor = 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-blue-500/25';
  if (mode === 'longBreak') saveButtonColor = 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-purple-500/25';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Timer Settings</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1" htmlFor="work">Pomodoro (work) duration (minutes)</label>
              <input
                id="work"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={1}
                maxLength={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-slate-800 placeholder-slate-500"
                value={work}
                onChange={e => setWork(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="25"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1" htmlFor="shortBreak">Short break duration (minutes)</label>
              <input
                id="shortBreak"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={1}
                maxLength={2}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-slate-800 placeholder-slate-500"
                value={shortBreak}
                onChange={e => setShortBreak(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="5"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1" htmlFor="longBreak">Long break duration (minutes)</label>
              <input
                id="longBreak"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={1}
                maxLength={2}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-slate-800 placeholder-slate-500"
                value={longBreak}
                onChange={e => setLongBreak(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="15"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1" htmlFor="longBreakInterval">Long break after how many work sessions?</label>
              <input
                id="longBreakInterval"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={1}
                maxLength={2}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-slate-800 placeholder-slate-500"
                value={longBreakInterval}
                onChange={e => setLongBreakInterval(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="4"
                required
              />
            </div>
          </div>
          <div className="flex flex-col justify-end gap-2 mt-8">
            <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded px-3 py-2 mb-2 flex items-center gap-2">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0ZM12 7v.01"/></svg>
              Duration settings will be applied to all tasks. Changing them will reset the timers across all tasks.
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg text-white font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${saveButtonColor}`}
                disabled={disableSave}
                title={disableSave ? 'Pause the timer to save settings.' : undefined}
              >
                Save
              </button>
            </div>
            {disableSave && (
              <div className="text-sm text-red-500 text-center mt-2">
                Pause the timer to save settings.
              </div>
            )}
          </div>
        </form>
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
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