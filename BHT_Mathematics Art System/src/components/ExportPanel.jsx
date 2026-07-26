import { useRef, useState } from 'react'
import { renderHighRes } from '../engine/patterns.js'
import { canvasToPngDownload, canvasToPdfDownload, createCanvasRecorder, downloadDataUrl } from '../utils/exportUtils.js'

const RES_SCALE = 3 // multiplier applied to current canvas size for "high-res" exports

export default function ExportPanel({ canvasStageRef, mode, params, palette }) {
  const [busy, setBusy] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState(null)
  const recorderRef = useRef(null)

  function getLiveCanvas() {
    return canvasStageRef.current && canvasStageRef.current.getCanvas()
  }

  function handleQuickPng() {
    const canvas = getLiveCanvas()
    if (canvas) canvasToPngDownload(canvas, `${mode}-artwork.png`)
  }

  async function handleHighRes(format) {
    const canvas = getLiveCanvas()
    if (!canvas) return
    setBusy(true)
    // Give the UI a tick to show the busy state before the (synchronous) render.
    await new Promise((r) => setTimeout(r, 30))
    try {
      const width = Math.round(canvas.clientWidth * RES_SCALE)
      const height = Math.round(canvas.clientHeight * RES_SCALE)
      const hiRes = renderHighRes(mode, params, palette, width, height)
      if (format === 'png') canvasToPngDownload(hiRes, `${mode}-artwork-highres.png`)
      else canvasToPdfDownload(hiRes, `${mode}-artwork.pdf`)
    } finally {
      setBusy(false)
    }
  }

  function startRecording() {
    const canvas = getLiveCanvas()
    if (!canvas) return
    try {
      const rec = createCanvasRecorder(canvas, 30)
      recorderRef.current = rec
      rec.start()
      setIsRecording(true)
      setRecordingUrl(null)
    } catch (err) {
      alert(err.message)
    }
  }

  async function stopRecording() {
    if (!recorderRef.current) return
    const url = await recorderRef.current.stop()
    setIsRecording(false)
    setRecordingUrl(url)
  }

  return (
    <section className="p-4">
      <h2 className="mb-3 font-mono text-[11px] tracking-[0.15em] text-inkDim">EXPORT</h2>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleQuickPng}
          className="rounded-md border border-line px-2 py-2 font-mono text-[10.5px] text-inkDim hover:border-accent hover:text-ink"
        >
          PNG (screen)
        </button>
        <button
          onClick={() => handleHighRes('png')}
          disabled={busy}
          className="rounded-md border border-line px-2 py-2 font-mono text-[10.5px] text-inkDim hover:border-accent hover:text-ink disabled:opacity-40"
        >
          PNG (3× hi-res)
        </button>
        <button
          onClick={() => handleHighRes('pdf')}
          disabled={busy}
          className="col-span-2 rounded-md border border-line px-2 py-2 font-mono text-[10.5px] text-inkDim hover:border-accent hover:text-ink disabled:opacity-40"
        >
          {busy ? 'RENDERING…' : 'EXPORT PDF (3× hi-res)'}
        </button>
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-mono text-[10.5px] text-inkDim">Record animation</span>
          {isRecording && <span className="font-mono text-[10px] text-accentRed">● REC</span>}
        </div>
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-full rounded-md border border-line px-2 py-2 font-mono text-[10.5px] text-inkDim hover:border-accentRed hover:text-accentRed"
          >
            ● START RECORDING
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full rounded-md border border-accentRed bg-accentRed/10 px-2 py-2 font-mono text-[10.5px] text-accentRed"
          >
            ■ STOP & SAVE
          </button>
        )}
        {recordingUrl && (
          <button
            onClick={() => downloadDataUrl(recordingUrl, `${mode}-recording.webm`)}
            className="mt-2 w-full rounded-md border border-accent px-2 py-2 font-mono text-[10.5px] text-accent"
          >
            ⬇ DOWNLOAD .WEBM
          </button>
        )}
        <p className="mt-2 text-[10px] leading-snug text-inkDim">
          Uses your browser's MediaRecorder API. Requires a Chromium or Firefox based browser.
        </p>
      </div>
    </section>
  )
}
