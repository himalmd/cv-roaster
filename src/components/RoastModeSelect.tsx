import type { RoastMode } from '../types'

const MODES: { value: RoastMode; label: string; description: string }[] = [
  { value: 'friendly', label: '😊 Friendly Roast', description: 'Gentle & encouraging' },
  { value: 'recruiter', label: '💼 Recruiter Roast', description: 'Professional sarcasm' },
  { value: 'brutal', label: '💀 Brutal Roast', description: 'No mercy, all honesty' },
]

interface Props {
  value: RoastMode
  onChange: (mode: RoastMode) => void
}

export function RoastModeSelect({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Roast Mode</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as RoastMode)}
          className="w-full appearance-none bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white cursor-pointer focus:outline-none focus:border-purple-400 transition-colors"
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value} className="bg-gray-900">
              {m.label} — {m.description}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
