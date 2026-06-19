import { useEffect, useState } from 'react'

interface Props {
  label: string
  value: number
  delay?: number
}

export function ProgressBar({ label, value, delay = 0 }: Props) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  const color =
    value >= 75
      ? 'from-green-500 to-emerald-400'
      : value >= 50
      ? 'from-yellow-500 to-amber-400'
      : 'from-red-500 to-rose-400'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="font-bold text-white">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
