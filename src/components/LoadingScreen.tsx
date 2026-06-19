import { useEffect, useState } from 'react'

const MESSAGES = [
  'Reading your CV...',
  'Summoning the roast overlords...',
  'Preparing devastating observations...',
  'Consulting with recruiters who have seen too much...',
  'Crafting your personalized humiliation...',
  'Adding finishing touches to the roast...',
]

export function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="relative mb-8">
        <div className="text-8xl animate-bounce-slow">🔥</div>
        <div className="absolute inset-0 animate-ping opacity-20 text-8xl">🔥</div>
      </div>
      <h2 className="text-2xl font-bold gradient-text mb-3">Roasting in progress...</h2>
      <p className="text-gray-400 text-center max-w-xs transition-all duration-500 key-{msgIndex}">
        {MESSAGES[msgIndex]}
      </p>
      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
