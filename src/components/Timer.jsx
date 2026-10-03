import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

const MAX_BONUS = 100
const BONUS_DECAY_PER_SEC = 2

const Timer = forwardRef(function Timer({ running }, ref) {
  const [seconds, setSeconds] = useState(0)
  const interval = useRef(null)

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(interval.current)
    }
    return () => clearInterval(interval.current)
  }, [running])

  useImperativeHandle(ref, () => ({
    getTimeBonus: () => Math.max(0, MAX_BONUS - seconds * BONUS_DECAY_PER_SEC),
    getSeconds: () => seconds,
    addPenalty: (secs) => setSeconds(s => s + secs),
  }))

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  return <span className="timer-display">{mins}:{secs}</span>
})

export default Timer
