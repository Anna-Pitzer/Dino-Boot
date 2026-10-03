import { createContext, useState, useEffect } from 'react'
import { DEFAULT_SETUP } from '../data/shopItems'

export const GameContext = createContext(null)

const MAX_LIVES = 3
const SAVE_KEY  = 'dinoboot_save'

const DEFAULT_STATE = {
  collectedPieces: [],
  damagedPieces:   [],
  lives:           MAX_LIVES,
  score:           0,
  coins:           0,
  totalTimeSeconds: 0,
  currentScreen:    'start',
  activePuzzle:     null,
  dinoState:        { pieceId: 'cpu', x: null, y: null, flipX: false },
  selectedSetup:    DEFAULT_SETUP,
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function writeSave(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)) } catch {}
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY)
}

export function GameProvider({ children }) {
  const saved = loadSave()

  const [collectedPieces, setCollectedPieces] = useState(saved?.collectedPieces ?? DEFAULT_STATE.collectedPieces)
  const [damagedPieces,   setDamagedPieces]   = useState(saved?.damagedPieces   ?? DEFAULT_STATE.damagedPieces)
  const [lives,           setLives]           = useState(saved?.lives           ?? DEFAULT_STATE.lives)
  const [score,           setScore]           = useState(saved?.score           ?? DEFAULT_STATE.score)
  const [coins,           setCoins]           = useState(saved?.coins           ?? DEFAULT_STATE.coins)
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(saved?.totalTimeSeconds ?? DEFAULT_STATE.totalTimeSeconds)
  const [currentScreen,   setCurrentScreen]   = useState(saved?.currentScreen   ?? DEFAULT_STATE.currentScreen)
  const [activePuzzle,    setActivePuzzle]    = useState(saved?.activePuzzle    ?? DEFAULT_STATE.activePuzzle)
  const [dinoState,       setDinoState]       = useState(saved?.dinoState       ?? DEFAULT_STATE.dinoState)
  const [selectedSetup,   setSelectedSetup]   = useState(saved?.selectedSetup   ?? DEFAULT_STATE.selectedSetup)

  const outOfLives = lives === 0

  useEffect(() => {
    const playingScreens = ['map', 'puzzle', 'shop', 'boot']
    if (!playingScreens.includes(currentScreen)) return

    const interval = window.setInterval(() => {
      setTotalTimeSeconds(prev => prev + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [currentScreen])

  // Persiste sempre que qualquer estado relevante muda
  useEffect(() => {
    writeSave({ collectedPieces, damagedPieces, lives, score, coins, totalTimeSeconds, currentScreen, activePuzzle, dinoState, selectedSetup })
  }, [collectedPieces, damagedPieces, lives, score, coins, totalTimeSeconds, currentScreen, activePuzzle, dinoState, selectedSetup])

  function navigateTo(screen) {
    setCurrentScreen(screen)
    if (typeof window !== 'undefined') {
      const currentState = window.history.state
      if (currentState?.screen !== screen) {
        window.history.pushState({ screen }, '', window.location.pathname)
      }
    }
  }

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
      return
    }
    setActivePuzzle(null)
    setCurrentScreen('map')
  }

  function startGame() { navigateTo('map') }

  function openPuzzle(id) {
    if (outOfLives) return
    setActivePuzzle(id)
    navigateTo('puzzle')
  }

  function completePuzzle(id, timeBonus = 0) {
    if (collectedPieces.includes(id)) return
    setDamagedPieces(prev => prev.filter(p => p !== id))
    const newPieces = [...collectedPieces, id]
    setCollectedPieces(newPieces)
    setScore(s => s + 100 + timeBonus)
    setCoins(c => c + 50 + Math.floor(timeBonus / 2))
    setActivePuzzle(null)
    navigateTo(newPieces.length === 11 ? 'shop' : 'map')
  }

  function spendCoins(amount) { setCoins(c => Math.max(0, c - amount)) }

  function failPuzzle(id) {
    setDamagedPieces(prev => prev.includes(id) ? prev : [...prev, id])
    setLives(prev => Math.max(0, prev - 1))
    setActivePuzzle(null)
    navigateTo('map')
  }

  function selectSetupItem(category, itemId) { setSelectedSetup(prev => ({ ...prev, [category]: itemId })) }

  function goToBoot() { navigateTo('boot') }

  function completeGame(timeBonus = 0) {
    setScore(s => s + 200 + timeBonus)
    navigateTo('victory')
  }

  function closePuzzle() {
    setActivePuzzle(null)
    goBack()
  }

  function saveDinoState(state) { setDinoState(state) }

  function resetGame() {
    localStorage.removeItem(SAVE_KEY)
    setCollectedPieces(DEFAULT_STATE.collectedPieces)
    setDamagedPieces(DEFAULT_STATE.damagedPieces)
    setLives(DEFAULT_STATE.lives)
    setScore(DEFAULT_STATE.score)
    setCoins(DEFAULT_STATE.coins)
    setTotalTimeSeconds(DEFAULT_STATE.totalTimeSeconds)
    setCurrentScreen('start')
    setActivePuzzle(null)
    setDinoState(DEFAULT_STATE.dinoState)
    setSelectedSetup(DEFAULT_STATE.selectedSetup)
  }

  return (
    <GameContext.Provider value={{
      collectedPieces, damagedPieces, lives, outOfLives,
      score, coins, totalTimeSeconds, currentScreen, setCurrentScreen, activePuzzle, dinoState, selectedSetup,
      startGame, openPuzzle, completePuzzle, failPuzzle,
      spendCoins, saveDinoState, selectSetupItem, goToBoot, completeGame,
      closePuzzle, goBack, resetGame,
    }}>
      {children}
    </GameContext.Provider>
  )
}
