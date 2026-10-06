import { createContext, useState, useEffect } from 'react'
import { DEFAULT_SUPPORT_INVENTORY, SUPPORT_ITEMS } from '../data/shopItems'
import { PIECES } from '../data/pieces'
import { getRunAchievements, getFinalResult } from '../data/achievements'
import { PUZZLE_HINTS } from '../data/puzzleHints'
import { CODEX_ENTRIES } from '../data/codex'
import { useGameAudio } from '../audio/useGameAudio'

export const GameContext = createContext(null)

const MAX_LIVES = 3
const SAVE_KEY  = 'dinoboot_save'

const DEFAULT_STATE = {
  collectedPieces: [],
  damagedPieces:   [],
  failedAttempts:  0,
  lives:           MAX_LIVES,
  score:           0,
  coins:           0,
  totalTimeSeconds: 0,
  bestResult:      null,
  newlyUnlockedAchievements: [],
  currentScreen:    'start',
  activePuzzle:     null,
  dinoState:        { pieceId: 'cpu', x: null, y: null, flipX: false },
  difficulty:       'normal',
  usedHints:        {},
  unlockedAchievements: [],
  discoveredCodex:  {},
  supportInventory: DEFAULT_SUPPORT_INVENTORY,
  supportNotes:     {},
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

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY) } catch (error) {
    console.error('Could not clear the saved DinoBoot game.', error)
  }
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY)
}

export function GameProvider({ children }) {
  const {
    playButton,
    playPuzzleStart,
    playCollect,
    playLevelUp,
    playDamage,
    playCoin,
    playPurchase,
    playConfirm,
    playBack,
    playShop,
  } = useGameAudio()
  const saved = loadSave()
  const [saveEnabled, setSaveEnabled] = useState(Boolean(saved))

  const [collectedPieces, setCollectedPieces] = useState(saved?.collectedPieces ?? DEFAULT_STATE.collectedPieces)
  const [damagedPieces,   setDamagedPieces]   = useState(saved?.damagedPieces   ?? DEFAULT_STATE.damagedPieces)
  const [failedAttempts, setFailedAttempts] = useState(saved?.failedAttempts ?? DEFAULT_STATE.failedAttempts)
  const [lives,           setLives]           = useState(saved?.lives           ?? DEFAULT_STATE.lives)
  const [score,           setScore]           = useState(saved?.score           ?? DEFAULT_STATE.score)
  const [coins,           setCoins]           = useState(saved?.coins           ?? DEFAULT_STATE.coins)
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(saved?.totalTimeSeconds ?? DEFAULT_STATE.totalTimeSeconds)
  const [bestResult, setBestResult] = useState(saved?.bestResult ?? DEFAULT_STATE.bestResult)
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState(saved?.newlyUnlockedAchievements ?? DEFAULT_STATE.newlyUnlockedAchievements)
  const [currentScreen,   setCurrentScreen]   = useState(saved?.currentScreen   ?? DEFAULT_STATE.currentScreen)
  const [activePuzzle,    setActivePuzzle]    = useState(saved?.activePuzzle    ?? DEFAULT_STATE.activePuzzle)
  const [dinoState,       setDinoState]       = useState(saved?.dinoState       ?? DEFAULT_STATE.dinoState)
  const [difficulty,      setDifficulty]      = useState(saved?.difficulty      ?? DEFAULT_STATE.difficulty)
  const [usedHints,       setUsedHints]       = useState(saved?.usedHints       ?? DEFAULT_STATE.usedHints)
  const [unlockedAchievements, setUnlockedAchievements] = useState(saved?.unlockedAchievements ?? DEFAULT_STATE.unlockedAchievements)
  const [discoveredCodex, setDiscoveredCodex] = useState(saved?.discoveredCodex ?? DEFAULT_STATE.discoveredCodex)
  const [supportInventory, setSupportInventory] = useState(saved?.supportInventory ?? DEFAULT_STATE.supportInventory)
  const [supportNotes, setSupportNotes] = useState(saved?.supportNotes ?? DEFAULT_STATE.supportNotes)

  const outOfLives = lives === 0
  const finalResult = getFinalResult({
    collectedPieces,
    damagedPieces,
    failedAttempts,
    totalTimeSeconds,
    usedHints,
    score,
    coins,
    allPieceCount: PIECES.length,
  })

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
    if (!saveEnabled) {
      clearSave()
      return
    }
    writeSave({ collectedPieces, damagedPieces, failedAttempts, lives, score, coins, totalTimeSeconds, bestResult, newlyUnlockedAchievements, currentScreen, activePuzzle, dinoState, difficulty, usedHints, unlockedAchievements, discoveredCodex, supportInventory, supportNotes })
  }, [saveEnabled, collectedPieces, damagedPieces, failedAttempts, lives, score, coins, totalTimeSeconds, bestResult, newlyUnlockedAchievements, currentScreen, activePuzzle, dinoState, difficulty, usedHints, unlockedAchievements, discoveredCodex, supportInventory, supportNotes])

  function navigateTo(screen) {
    if (screen === 'shop') playShop()
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

  function startGame() {
    playButton()
    setSaveEnabled(true)
    navigateTo('map')
  }

  function openPuzzle(id) {
    if (outOfLives) return
    playPuzzleStart()
    setActivePuzzle(id)
    navigateTo('puzzle')
  }

  function getHintRewardMultiplier(puzzleId) {
    const hintsUsed = usedHints[puzzleId] ?? []
    return hintsUsed.length > 0 ? 0.75 : 1
  }

  function registerHintUsage(puzzleId, hintIndex, cost = 0) {
    setUsedHints(prev => {
      const current = Array.isArray(prev[puzzleId]) ? prev[puzzleId] : []
      if (current.includes(hintIndex)) return prev
      return { ...prev, [puzzleId]: [...current, hintIndex] }
    })

    if (cost > 0) {
      playCoin()
      setCoins(c => Math.max(0, c - cost))
    }
  }

  function completePuzzle(id, timeBonus = 0) {
    if (collectedPieces.includes(id)) return
    setDamagedPieces(prev => prev.filter(p => p !== id))
    setDiscoveredCodex(prev => ({ ...prev, [id]: true }))
    const newPieces = [...collectedPieces, id]
    const rewardMultiplier = getHintRewardMultiplier(id)
    const scoreGain = Math.round((100 + timeBonus) * rewardMultiplier)
    const coinGain = Math.round((50 + Math.floor(timeBonus / 2)) * rewardMultiplier)

    setCollectedPieces(newPieces)
    playCollect()
    if (newPieces.length === PIECES.length) playLevelUp()
    setScore(s => s + scoreGain)
    setCoins(c => c + coinGain)
    setActivePuzzle(null)
    navigateTo(newPieces.length === 11 ? 'shop' : 'map')
  }

  function spendCoins(amount) { setCoins(c => Math.max(0, c - amount)) }

  function failPuzzle(id) {
    playDamage()
    setDamagedPieces(prev => prev.includes(id) ? prev : [...prev, id])
    setFailedAttempts(prev => prev + 1)
    setLives(prev => Math.max(0, prev - 1))
    setActivePuzzle(null)
    navigateTo('map')
  }

  function buySupportItem(itemId) {
    const item = SUPPORT_ITEMS.find(entry => entry.id === itemId)
    if (!item) return false
    const currentCount = supportInventory[itemId] ?? 0
    if (currentCount >= item.limit) return false
    if (coins < item.price) return false

    setCoins(prev => Math.max(0, prev - item.price))
    setSupportInventory(prev => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }))
    playPurchase()
    return true
  }

  function useSupportItem(itemId) {
    const item = SUPPORT_ITEMS.find(entry => entry.id === itemId)
    if (!item) return { used: false, message: 'Item de suporte inválido.' }
    const owned = supportInventory[itemId] ?? 0
    if (owned <= 0) return { used: false, message: 'Você ainda não possui este item.' }

    if (itemId === 'kit_tecnico') {
      if (lives >= MAX_LIVES) return { used: false, message: 'Você já está com todas as vidas.' }
      setSupportInventory(prev => ({ ...prev, [itemId]: prev[itemId] - 1 }))
      setLives(prev => Math.min(MAX_LIVES, prev + 1))
      playConfirm()
      return { used: true, message: 'Kit técnico ativado: +1 vida.' }
    }

    if (!activePuzzle) return { used: false, message: 'Este item só pode ser usado durante um puzzle.' }

    const codexEntry = CODEX_ENTRIES.find(entry => entry.id === activePuzzle)
    const puzzleHints = PUZZLE_HINTS[activePuzzle]?.hints ?? []
    const note = itemId === 'scanner'
      ? `SCANNER: ${puzzleHints[0]?.text ?? 'Analise as instruções do componente antes de prosseguir.'}`
      : `MANUAL TÉCNICO: ${codexEntry?.explanation ?? 'Consulte as informações do componente.'} ${codexEntry?.relation ?? ''}`.trim()

    setSupportInventory(prev => ({ ...prev, [itemId]: prev[itemId] - 1 }))
    setSupportNotes(prev => ({
      ...prev,
      [activePuzzle]: [...(prev[activePuzzle] ?? []), note],
    }))

    playConfirm()
    return { used: true, message: note }
  }

  function goToBoot() {
    playConfirm()
    navigateTo('boot')
  }

  function completeGame(timeBonus = 0) {
    const runAchievements = getRunAchievements({
      collectedPieces,
      damagedPieces,
      failedAttempts,
      totalTimeSeconds,
      usedHints,
      allPieceCount: PIECES.length,
    })

    const newlyUnlocked = runAchievements.filter(id => !unlockedAchievements.includes(id))
    const finalScore = score + 200 + timeBonus
    const finalResult = getFinalResult({
      collectedPieces,
      damagedPieces,
      failedAttempts,
      totalTimeSeconds,
      usedHints,
      score: finalScore,
      coins,
      allPieceCount: PIECES.length,
    })

    setUnlockedAchievements(prev => Array.from(new Set([...prev, ...runAchievements])))
    setNewlyUnlockedAchievements(newlyUnlocked)
    setDiscoveredCodex(prev => ({ ...prev, boot: true }))
    setScore(finalScore)
    setBestResult(prev => {
      const nextBest = {
        score: finalScore,
        timeSeconds: totalTimeSeconds,
        coins,
        collectedPieces: collectedPieces.length,
        rank: finalResult.rank,
      }
      return !prev || finalScore > prev.score ? nextBest : prev
    })
    navigateTo('victory')
  }

  function closePuzzle() {
    playBack()
    setActivePuzzle(null)
    goBack()
  }

  function saveDinoState(state) { setDinoState(state) }

  function resetGame() {
    clearSave()
    setSaveEnabled(false)
    setCollectedPieces(DEFAULT_STATE.collectedPieces)
    setDamagedPieces(DEFAULT_STATE.damagedPieces)
    setFailedAttempts(DEFAULT_STATE.failedAttempts)
    setLives(DEFAULT_STATE.lives)
    setScore(DEFAULT_STATE.score)
    setCoins(DEFAULT_STATE.coins)
    setTotalTimeSeconds(DEFAULT_STATE.totalTimeSeconds)
    setCurrentScreen('start')
    setActivePuzzle(null)
    setDinoState(DEFAULT_STATE.dinoState)
    setDifficulty(DEFAULT_STATE.difficulty)
    setUsedHints(DEFAULT_STATE.usedHints)
    setNewlyUnlockedAchievements(DEFAULT_STATE.newlyUnlockedAchievements)
    setDiscoveredCodex(DEFAULT_STATE.discoveredCodex)
    setSupportInventory(DEFAULT_SUPPORT_INVENTORY)
    setSupportNotes(DEFAULT_STATE.supportNotes)
  }

  return (
    <GameContext.Provider value={{
      collectedPieces, damagedPieces, failedAttempts, lives, outOfLives,
      score, coins, totalTimeSeconds, bestResult, finalResult, discoveredCodex, newlyUnlockedAchievements, currentScreen, setCurrentScreen, activePuzzle, dinoState,
      difficulty, setDifficulty, usedHints, unlockedAchievements,
      supportInventory, supportNotes,
      startGame, navigateTo, openPuzzle, completePuzzle, failPuzzle,
      spendCoins, saveDinoState, goToBoot, completeGame,
      closePuzzle, goBack, resetGame, registerHintUsage,
      getHintRewardMultiplier, buySupportItem, useSupportItem,
      hasSupportItem: (itemId) => (supportInventory[itemId] ?? 0) > 0,
    }}>
      {children}
    </GameContext.Provider>
  )
}
