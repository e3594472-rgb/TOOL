let audioContext

function context() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  audioContext ||= new AudioContext()
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

function note(ctx, frequency, start, duration, gainValue) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.025)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration)
}

export function playRevealSound(enabled) {
  if (!enabled) return
  const ctx = context()
  if (!ctx) return
  const now = ctx.currentTime
  note(ctx, 523.25, now, 0.42, 0.09)
  note(ctx, 659.25, now + 0.11, 0.5, 0.085)
  note(ctx, 783.99, now + 0.22, 0.65, 0.075)
}

export function primeSound(enabled) {
  if (enabled) context()
}
