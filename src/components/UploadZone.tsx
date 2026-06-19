import { useRef, useState } from 'react'

interface Props {
  onFile: (file: File) => void
  file: File | null
  error: string | null
}

const MAX_SIZE = 5 * 1024 * 1024

export function UploadZone({ onFile, file, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(f: File) {
    if (f.size > MAX_SIZE) {
      alert('File exceeds 5MB limit.')
      return
    }
    if (
      !f.name.endsWith('.pdf') &&
      !f.name.endsWith('.docx') &&
      f.type !== 'application/pdf' &&
      f.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      alert('Only PDF and DOCX files are supported.')
      return
    }
    onFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200
        ${dragging
          ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
          : file
          ? 'border-green-400/60 bg-green-500/5'
          : 'border-white/20 bg-white/5 hover:border-purple-400/60 hover:bg-purple-500/5'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {file ? (
        <div className="animate-fade-in">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-green-400 font-semibold text-lg">{file.name}</p>
          <p className="text-gray-400 text-sm mt-1">
            {(file.size / 1024).toFixed(1)} KB — Click to change
          </p>
        </div>
      ) : (
        <>
          <div className="text-5xl mb-4">📁</div>
          <p className="text-white font-semibold text-lg">
            Drop your CV here
          </p>
          <p className="text-gray-400 mt-1 text-sm">
            or click to browse — PDF & DOCX, max 5MB
          </p>
        </>
      )}

      {error && (
        <p className="mt-3 text-red-400 text-sm font-medium">{error}</p>
      )}
    </div>
  )
}
