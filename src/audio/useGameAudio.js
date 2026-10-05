import { useContext } from 'react'
import { GameAudioContext } from './GameAudioContext'

export function useGameAudio() {
  const audio = useContext(GameAudioContext)
  if (!audio) throw new Error('useGameAudio must be used inside GameAudioProvider')
  return audio
}
