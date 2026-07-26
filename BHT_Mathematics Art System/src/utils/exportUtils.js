import { jsPDF } from 'jspdf'

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function canvasToPngDownload(canvas, filename = 'artwork.png') {
  downloadDataUrl(canvas.toDataURL('image/png'), filename)
}

export function canvasToPdfDownload(canvas, filename = 'artwork.pdf') {
  const w = canvas.width
  const h = canvas.height
  const orientation = w >= h ? 'landscape' : 'portrait'
  const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h] })
  const dataUrl = canvas.toDataURL('image/png')
  pdf.addImage(dataUrl, 'PNG', 0, 0, w, h)
  pdf.save(filename)
}

// Wraps MediaRecorder around a canvas's captureStream for simple
// start/stop video recording, resolving to a downloadable blob URL.
export function createCanvasRecorder(canvas, fps = 30) {
  if (!canvas.captureStream) {
    throw new Error('This browser does not support canvas recording.')
  }
  const stream = canvas.captureStream(fps)
  const mimeCandidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
  const mimeType = mimeCandidates.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || ''
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
  const chunks = []

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }

  return {
    recorder,
    start() {
      chunks.length = 0
      recorder.start(200)
    },
    stop() {
      return new Promise((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType || 'video/webm' })
          resolve(URL.createObjectURL(blob))
        }
        recorder.stop()
      })
    },
  }
}
