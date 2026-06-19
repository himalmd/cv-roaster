import { useRef } from 'react'
import { toPng } from 'html-to-image'
import type { RoastResult } from '../types'

interface Props {
  result: RoastResult
}

export function ShareCard({ result }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  async function download() {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `cv-roast-card-${Date.now()}.png`
      a.click()
    } catch {
      alert('Could not generate image. Try a different browser.')
    }
  }

  const scoreColor =
    result.roastScore >= 75 ? '#f87171' : result.roastScore >= 50 ? '#fb923c' : '#facc15'

  return (
    <div className="space-y-4">
      {/* Shareable card (rendered off-screen at fixed size) */}
      <div
        ref={cardRef}
        style={{
          width: 600,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f0f19 50%, #1a0a2e 100%)',
          padding: 48,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* bg glow */}
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 16, color: '#a78bfa', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            🔥 AI CV Roaster
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Get roasted. Get hired.</div>
        </div>

        {/* score */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 28 }}>
          <div style={{ fontSize: 96, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
            {result.roastScore}
          </div>
          <div style={{ paddingBottom: 12 }}>
            <div style={{ fontSize: 28, color: '#94a3b8' }}>/100</div>
            <div style={{
              display: 'inline-block', marginTop: 4,
              padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
              color: '#c4b5fd',
            }}>
              {result.roastLevel ?? 'Roasted'} 🌶️
            </div>
          </div>
        </div>

        {/* verdict */}
        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 24,
          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
          fontSize: 18, fontWeight: 600, color: '#e2e8f0',
        }}>
          {result.finalVerdict}
        </div>

        {/* roast excerpt */}
        <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6 }}>
          "{result.roastSummary?.slice(0, 180)}{result.roastSummary?.length > 180 ? '...' : ''}"
        </div>

        {/* ATS badge */}
        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <div style={{
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
            fontSize: 12, color: '#6ee7b7', fontWeight: 600,
          }}>
            📊 ATS Score: {result.atsScore}/100
          </div>
          <div style={{
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)',
            fontSize: 12, color: '#f9a8d4', fontWeight: 600,
          }}>
            🔥 Roast Score: {result.roastScore}/100
          </div>
        </div>

        {/* watermark */}
        <div style={{ marginTop: 32, fontSize: 10, color: '#334155' }}>
          aicvroaster.app • {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* download button */}
      <button
        onClick={download}
        className="w-full py-3 rounded-xl font-semibold text-sm border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition-all"
      >
        📸 Download Share Card
      </button>
    </div>
  )
}
