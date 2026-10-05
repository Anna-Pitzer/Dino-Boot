import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SoundProvider, playSound, setSoundEnabled } from 'react-sounds'
import { AUDIO_STORAGE_KEYS, DEFAULT_AUDIO_PREFERENCES, GAME_SOUNDS } from './audioConfig'
import { GameAudioContext } from './GameAudioContext'

function readBooleanPreference(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const value = window.localStorage.getItem(key)
    if (value === null) return fallback
    return value === 'true'
  } catch (error) {
    console.error(`Could not read audio preference "${key}".`, error)
    return fallback
  }
}

function readVolumePreference(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const stored = window.localStorage.getItem(key)
    if (stored === null) return fallback
    const value = Number(stored)
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback
  } catch (error) {
    console.error(`Could not read audio preference "${key}".`, error)
    return fallback
  }
}

function savePreference(key, value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, String(value))
  } catch (error) {
    console.error(`Could not save audio preference "${key}".`, error)
  }
}

function AudioBridge({ children }) {
  const audioUnlocked = useRef(false)
  const [preferences, setPreferences] = useState(() => ({
    sfxEnabled: readBooleanPreference(AUDIO_STORAGE_KEYS.sfxEnabled, DEFAULT_AUDIO_PREFERENCES.sfxEnabled),
    musicEnabled: readBooleanPreference(AUDIO_STORAGE_KEYS.musicEnabled, DEFAULT_AUDIO_PREFERENCES.musicEnabled),
    sfxVolume: readVolumePreference(AUDIO_STORAGE_KEYS.sfxVolume, DEFAULT_AUDIO_PREFERENCES.sfxVolume),
    musicVolume: readVolumePreference(AUDIO_STORAGE_KEYS.musicVolume, DEFAULT_AUDIO_PREFERENCES.musicVolume),
  }))

  useEffect(() => {
    function enablePlaybackAfterInteraction() {
      if (audioUnlocked.current) return
      audioUnlocked.current = true
    }

    const events = ['pointerdown', 'keydown', 'touchstart']
    events.forEach(event => window.addEventListener(event, enablePlaybackAfterInteraction, { once: true }))
    return () => events.forEach(event => window.removeEventListener(event, enablePlaybackAfterInteraction))
  }, [])

  useEffect(() => {
    setSoundEnabled(preferences.sfxEnabled)
  }, [preferences.sfxEnabled])

  useEffect(() => savePreference(AUDIO_STORAGE_KEYS.sfxEnabled, preferences.sfxEnabled), [preferences.sfxEnabled])
  useEffect(() => savePreference(AUDIO_STORAGE_KEYS.musicEnabled, preferences.musicEnabled), [preferences.musicEnabled])
  useEffect(() => savePreference(AUDIO_STORAGE_KEYS.sfxVolume, preferences.sfxVolume), [preferences.sfxVolume])
  useEffect(() => savePreference(AUDIO_STORAGE_KEYS.musicVolume, preferences.musicVolume), [preferences.musicVolume])

  const trigger = useCallback((semanticName, volume = preferences.sfxVolume) => {
    if (!audioUnlocked.current || !preferences.sfxEnabled || volume <= 0) return
    playSound(GAME_SOUNDS[semanticName], { volume }).catch(error => {
      console.error(`Could not play DinoBoot sound "${semanticName}".`, error)
    })
  }, [audioUnlocked, preferences.sfxEnabled, preferences.sfxVolume])

  const playButton = useCallback(() => trigger('button'), [trigger])
  const playSelect = useCallback(() => trigger('select'), [trigger])
  const playConfirm = useCallback(() => trigger('confirm'), [trigger])
  const playBack = useCallback(() => trigger('back'), [trigger])
  const playCollect = useCallback(() => trigger('collect'), [trigger])
  const playCorrect = useCallback(() => trigger('correct'), [trigger])
  const playWrong = useCallback(() => trigger('wrong'), [trigger])
  const playDamage = useCallback(() => trigger('damage'), [trigger])
  const playCoin = useCallback(() => trigger('coin'), [trigger])
  const playLevelUp = useCallback(() => trigger('levelUp'), [trigger])
  const playPuzzleStart = useCallback(() => trigger('puzzleStart'), [trigger])
  const playPuzzleComplete = useCallback(() => trigger('puzzleComplete'), [trigger])
  const playBoot = useCallback(() => trigger('boot'), [trigger])
  const playVictory = useCallback(() => trigger('victory'), [trigger])
  const playGameOver = useCallback(() => trigger('gameOver'), [trigger])
  const playShop = useCallback(() => trigger('shop'), [trigger])
  const playPurchase = useCallback(() => trigger('purchase'), [trigger])
  const playEquip = useCallback(() => trigger('equip'), [trigger])

  const updatePreference = useCallback((key, value) => {
    setPreferences(previous => ({ ...previous, [key]: value }))
  }, [])

  const value = useMemo(() => ({
    preferences,
    setSfxEnabled: value => updatePreference('sfxEnabled', value),
    setMusicEnabled: value => updatePreference('musicEnabled', value),
    setSfxVolume: value => updatePreference('sfxVolume', value),
    setMusicVolume: value => updatePreference('musicVolume', value),
    playButton,
    playSelect,
    playConfirm,
    playBack,
    playCollect,
    playCorrect,
    playWrong,
    playDamage,
    playCoin,
    playLevelUp,
    playPuzzleStart,
    playPuzzleComplete,
    playBoot,
    playVictory,
    playGameOver,
    playShop,
    playPurchase,
    playEquip,
  }), [
    preferences,
    updatePreference,
    playButton,
    playSelect,
    playConfirm,
    playBack,
    playCollect,
    playCorrect,
    playWrong,
    playDamage,
    playCoin,
    playLevelUp,
    playPuzzleStart,
    playPuzzleComplete,
    playBoot,
    playVictory,
    playGameOver,
    playShop,
    playPurchase,
    playEquip,
  ])

  return <GameAudioContext.Provider value={value}>{children}</GameAudioContext.Provider>
}

export function GameAudioProvider({ children }) {
  const initialEnabled = readBooleanPreference(
    AUDIO_STORAGE_KEYS.sfxEnabled,
    DEFAULT_AUDIO_PREFERENCES.sfxEnabled,
  )
  return (
    <SoundProvider initialEnabled={initialEnabled}>
      <AudioBridge>{children}</AudioBridge>
    </SoundProvider>
  )
}
