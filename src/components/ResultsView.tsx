import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { RoastResult } from '../types'
import { ProgressBar } from './ProgressBar'
import { ShareCard } from './ShareCard'
import { generatePDF } from '../lib/generatePDF'

interface Props {
  result: RoastResult
  fileName: string
  onReset: () => void
}

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame: number
    let current = 0
    function tick() {
      current = Math.min(current + Math.ceil((score - current) / 8) || 1, score)
      setDisplay(current)
      if (current < score) frame = requestAnimationFrame(tick)
    }
    const t = setTimeout(() => { frame = requestAnimationFrame(tick) }, 200)
    return () => { clearTimeout(t); cancelAnimationFrame(frame) }
  }, [score])

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-5xl font-black tabular-nums ${color}`} style={{ textShadow: '0 0 30px currentColor' }}>
        {display}
      </div>
      <div className="text-gray-500 text-sm">/100</div>
      <div className="text-xs text-gray-400 font-medium mt-1">{label}</div>
    </div>
  )
}

const VERDICT_STYLE: Record<string, string> = {
  high: 'border-green-500/40 bg-green-500/10 text-green-300',
  medium: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  low: 'border-red-500/40 bg-red-500/10 text-red-300',
  purple: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
}

function verdictStyle(verdict: string) {
  const v = verdict.toLowerCase()
  if (v.includes('interview') || v.includes('ready') || v.includes('high')) return VERDICT_STYLE.high
  if (v.includes('minor') || v.includes('potential') || v.includes('detected')) return VERDICT_STYLE.medium
  if (v.includes('surgery') || v.includes('emergency') || v.includes('critical')) return VERDICT_STYLE.low
  return VERDICT_STYLE.purple
}

export function ResultsView({ result, fileName, onReset }: Props) {
  const [showShare, setShowShare] = useState(false)
  const launched = useRef(false)

  useEffect(() => {
    if (launched.current || result.roastScore < 70) return
    launched.current = true
    const end = Date.now() + 2000
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
    ;(function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }, [result.roastScore])

  return (
    <div className="animate-slide-up space-y-5 max-w-2xl mx-auto">

      {/* Score Cards */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">🔥 Roast Score</p>
            <ScoreGauge score={result.roastScore} label={result.roastLevel ?? 'Roasted'} color="text-rose-400" />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">📊 ATS Score</p>
            <ScoreGauge score={result.atsScore ?? 0} label="ATS Compatibility" color="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Final Verdict */}
      {result.finalVerdict && (
        <div className={`rounded-2xl border p-5 text-center ${verdictStyle(result.finalVerdict)}`}>
          <p className="text-lg font-bold">{result.finalVerdict}</p>
        </div>
      )}

      {/* Recruiter Reaction */}
      {result.recruiterReaction && (
        <div className="glass-card p-5 border-purple-500/20 bg-purple-500/5">
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-2 font-semibold">👔 Recruiter Reaction</p>
          <p className="text-white text-base italic">{result.recruiterReaction}</p>
        </div>
      )}

      {/* CV Roast */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold gradient-text mb-4">🔥 CV Roast</h2>
        <p className="text-gray-300 leading-relaxed mb-5">{result.roastSummary}</p>
        <div className="space-y-3">
          {result.funnyObservations?.map((obs, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <span className="text-red-400 shrink-0">💬</span>
              <p className="text-gray-300 text-sm">{obs}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {result.strengths?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-emerald-400 mb-4">💪 What Your CV Does Well</h2>
          <div className="space-y-2">
            {result.strengths.map((s, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                <span className="text-green-400 shrink-0">✓</span>
                <p className="text-gray-300 text-sm">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATS Breakdown */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-sky-400 mb-2">📊 ATS Compatibility</h2>
        <p className="text-gray-500 text-sm mb-5">How well your CV performs against Applicant Tracking Systems</p>
        <div className="space-y-4">
          <ProgressBar label="Keyword Optimization" value={result.atsBreakdown?.keywordOptimization ?? 0} delay={100} />
          <ProgressBar label="Formatting Compatibility" value={result.atsBreakdown?.formattingCompatibility ?? 0} delay={250} />
          <ProgressBar label="Section Completeness" value={result.atsBreakdown?.sectionCompleteness ?? 0} delay={400} />
        </div>
      </div>

      {/* Missing Keywords */}
      {result.missingKeywords?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">🔍 Missing Keywords</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.missingKeywords.map(({ keyword, reason }, i) => (
              <div key={i} className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
                <p className="text-yellow-300 font-semibold text-sm mb-1">🏷 {keyword}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Before / After */}
      {result.beforeAfterExamples?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">✨ Suggested Rewrites</h2>
          <div className="space-y-5">
            {result.beforeAfterExamples.map(({ before, after }, i) => (
              <div key={i} className="space-y-2">
                <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1">Before</p>
                  <p className="text-gray-400 text-sm italic">"{before}"</p>
                </div>
                <div className="flex justify-center">
                  <span className="text-gray-500 text-lg">↓</span>
                </div>
                <div className="p-3 rounded-xl bg-green-500/8 border border-green-500/20">
                  <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1">After</p>
                  <p className="text-gray-300 text-sm">"{after}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-green-400 mb-4">✅ How To Improve</h2>
        <div className="space-y-3">
          {result.suggestions?.map((sug, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/15 hover:border-green-500/30 transition-colors">
              <span className="text-green-400 font-bold shrink-0 text-sm">{i + 1}.</span>
              <p className="text-gray-300 text-sm">{sug}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Share */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-purple-400 mb-4">📸 Share Your Roast</h2>
        {showShare ? (
          <div className="overflow-x-auto">
            <ShareCard result={result} />
          </div>
        ) : (
          <button
            onClick={() => setShowShare(true)}
            className="w-full py-3 rounded-xl font-semibold text-sm border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition-all"
          >
            📸 Generate Share Card
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => generatePDF(result, fileName)}
          className="py-3 rounded-xl font-semibold text-sm border border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 hover:border-sky-400 transition-all"
        >
          📄 Download PDF Report
        </button>
        <button
          onClick={onReset}
          className="py-3 rounded-xl font-semibold text-sm border border-white/15 text-gray-300 hover:border-purple-400/60 hover:text-white transition-all"
        >
          🔁 Roast Another CV
        </button>
      </div>

    </div>
  )
}
