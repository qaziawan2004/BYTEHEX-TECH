import { useState } from 'react'

export default function ExportPanel({ stageRef }) {
  const [scale, setScale] = useState(2)
  const [busy, setBusy] = useState(null) // 'png' | 'pdf' | null
  const [progress, setProgress] = useState(0)
  const [recording, setRecording] = useState(false)
  const [note, setNote] = useState('')

  async function handlePNG() {
    if (!stageRef.current) return
    setBusy('png'); setProgress(0); setNote('')
    await stageRef.current.exportPNG(scale, setProgress)
    setBusy(null)
    setNote('PNG saved.')
  }
  async function handlePDF() {
    if (!stageRef.current) return
    setBusy('pdf'); setProgress(0); setNote('')
    await stageRef.current.exportPDF(scale, setProgress)
    setBusy(null)
    setNote('PDF saved.')
  }
  function toggleRecording() {
    if (!stageRef.current) return
    if (!stageRef.current.canRecord()) {
      setNote('Video recording is not supported in this browser.')
      return
    }
    if (recording) {
      stageRef.current.stopRecording()
      setRecording(false)
      setNote('Recording saved as .webm')
    } else {
      stageRef.current.startRecording()
      setRecording(true)
      setNote('Recording…')
    }
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.14em] font-mono text-ink/60 uppercase mb-2">Export</p>
      <div className="flex gap-1.5 mb-2">
        {[1, 2, 4].map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={'flex-1 py-2 sm:py-1.5 rounded-sm border text-[11px] font-mono ' + (scale === s ? 'border-plot text-plot bg-plot/10' : 'border-ink/15 text-ink/60')}
          >{s}×</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <button disabled={!!busy} onClick={handlePNG} className="btn-outline">
          {busy === 'png' ? `PNG ${progress}%` : 'PNG'}
        </button>
        <button disabled={!!busy} onClick={handlePDF} className="btn-outline">
          {busy === 'pdf' ? `PDF ${progress}%` : 'PDF'}
        </button>
      </div>
      <button onClick={toggleRecording} className={'w-full btn-outline ' + (recording ? 'border-rust text-rust bg-rust/10' : '')}>
        {recording ? '● Stop recording' : 'Record video'}
      </button>
      {note && <p className="text-[11px] text-ink/50 mt-2">{note}</p>}
    </div>
  )
}
