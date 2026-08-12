import { useCallback, useEffect, useRef, useState } from 'react'

export function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored === null ? initialValue : JSON.parse(stored)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The app remains usable if storage is unavailable.
    }
  }, [key, value])

  return [value, setValue]
}

export function useTimedReveal() {
  const [isRevealing, setIsRevealing] = useState(false)
  const timers = useRef([])

  const cancel = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setIsRevealing(false)
  }, [])

  useEffect(() => cancel, [cancel])

  const reveal = useCallback((duration, onComplete) => {
    cancel()
    setIsRevealing(true)
    const timer = setTimeout(() => {
      setIsRevealing(false)
      onComplete()
    }, duration)
    timers.current.push(timer)
  }, [cancel])

  return { isRevealing, reveal, cancel }
}

export function useNameRoll() {
  const [isRolling, setIsRolling] = useState(false)
  const [preview, setPreview] = useState('')
  const timers = useRef([])

  const cancel = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setIsRolling(false)
    setPreview('')
  }, [])

  useEffect(() => cancel, [cancel])

  const roll = useCallback((names, finalName, onComplete) => {
    cancel()
    setIsRolling(true)
    let elapsed = 0
    const steps = 13
    for (let step = 0; step < steps; step += 1) {
      const delay = 45 + step * 9
      elapsed += delay
      const timer = setTimeout(() => {
        const pool = names.filter((name) => name !== preview)
        setPreview(pool[Math.floor(Math.random() * pool.length)] || names[0])
      }, elapsed)
      timers.current.push(timer)
    }
    elapsed += 150
    const finish = setTimeout(() => {
      setPreview(finalName)
      setIsRolling(false)
      onComplete()
    }, elapsed)
    timers.current.push(finish)
  }, [cancel, preview])

  return { isRolling, preview, roll, cancel }
}
