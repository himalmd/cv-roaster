import type { RecruiterPersona } from '../types'

const PERSONAS: { value: RecruiterPersona; label: string; description: string }[] = [
  { value: 'friendly_recruiter', label: '😊 Friendly Recruiter', description: 'Wants you to succeed' },
  { value: 'senior_hr', label: '📋 Senior HR Manager', description: 'Clarity & professionalism' },
  { value: 'startup_founder', label: '🚀 Startup Founder', description: 'Impact & ownership' },
  { value: 'corporate_hiring', label: '🏢 Corporate Hiring Manager', description: 'Structure & metrics' },
  { value: 'tech_lead', label: '⚙️ Tech Lead', description: 'Technical depth' },
]

interface Props {
  value: RecruiterPersona
  onChange: (p: RecruiterPersona) => void
}

export function RecruiterPersonaSelect({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Choose Reviewer</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as RecruiterPersona)}
          className="w-full appearance-none bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white cursor-pointer focus:outline-none focus:border-purple-400 transition-colors"
        >
          {PERSONAS.map((p) => (
            <option key={p.value} value={p.value} className="bg-gray-900">
              {p.label} — {p.description}
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
