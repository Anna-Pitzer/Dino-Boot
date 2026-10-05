import { createContext, useState, useEffect } from 'react'
import { DEFAULT_SETUP, SUPPORT_ITEMS, SUPPORT_NONE_ITEM } from '../data/shopItems'
import { PIECES } from '../data/pieces'
import { getRunAchievements, getFinalResult } from '../data/achievements'
import { useGameAudio } from '../audio/useGameAudio'

export const GameContext = createContext(null)

const MAX_LIVES = 3
const SAVE_KEY  = 'dinoboot_save'

const DEFAULT_SUPPORT_INVENTORY = {
  scanner: 0,
  manual_tecnico: 0,
  kit_tecnico: 0,
  checkpoint: 0,
}

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
  selectedSetup:    DEFAULT_SETUP,
  difficulty:       'normal',
  usedHints:        {},
  unlockedAchievements: [],
  discoveredCodex:  {},
  supportInventory: DEFAULT_SUPPORT_INVENTORY,
  supportCheckpoint: null,
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
    playEquip,
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
  const [selectedSetup,   setSelectedSetup]   = useState(saved?.selectedSetup   ?? DEFAULT_STATE.selectedSetup)
  const [difficulty,      setDifficulty]      = useState(saved?.difficulty      ?? DEFAULT_STATE.difficulty)
  const [usedHints,       setUsedHints]       = useState(saved?.usedHints       ?? DEFAULT_STATE.usedHints)
  const [unlockedAchievements, setUnlockedAchievements] = useState(saved?.unlockedAchievements ?? DEFAULT_STATE.unlockedAchievements)
  const [discoveredCodex, setDiscoveredCodex] = useState(saved?.discoveredCodex ?? DEFAULT_STATE.discoveredCodex)
  const [supportInventory, setSupportInventory] = useState(saved?.supportInventory ?? DEFAULT_STATE.supportInventory)
  const [supportCheckpoint, setSupportCheckpoint] = useState(saved?.supportCheckpoint ?? DEFAULT_STATE.supportCheckpoint)
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
    writeSave({ collectedPieces, damagedPieces, failedAttempts, lives, score, coins, totalTimeSeconds, bestResult, newlyUnlockedAchievements, currentScreen, activePuzzle, dinoState, selectedSetup, difficulty, usedHints, unlockedAchievements, discoveredCodex, supportInventory, supportCheckpoint, supportNotes })
  }, [saveEnabled, collectedPieces, damagedPieces, failedAttempts, lives, score, coins, totalTimeSeconds, bestResult, newlyUnlockedAchievements, currentScreen, activePuzzle, dinoState, selectedSetup, difficulty, usedHints, unlockedAchievements, discoveredCodex, supportInventory, supportCheckpoint, supportNotes])

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

  function selectSetupItem(category, itemId) {
    playEquip()
    setSelectedSetup(prev => ({ ...prev, [category]: itemId }))
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

    setSupportInventory(prev => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] ?? 0) - 1) }))
    playConfirm()

    if (itemId === 'kit_tecnico') {
      setLives(prev => Math.min(MAX_LIVES, prev + 1))
      return { used: true, message: 'Kit técnico ativado: +1 vida.' }
    }

    if (itemId === 'checkpoint') {
      const checkpoint = {
        collectedPieces: [...collectedPieces],
        damagedPieces: [...damagedPieces],
        lives,
        score,
        coins,
        currentScreen,
        totalTimeSeconds,
        selectedSetup: { ...selectedSetup },
        difficulty,
      }
      setSupportCheckpoint(checkpoint)
      return { used: true, message: 'Checkpoint salvo com o progresso atual.' }
    }

    if (!activePuzzle) {
      return { used: true, message: `${item.name} pronto para ser usado no próximo puzzle.` }
    }

    const piece = PIECES.find(entry => entry.id === activePuzzle)
    const note = itemId === 'scanner'
      ? `SCANNER: ${piece?.name ?? 'componente'} apresenta indicações de ${piece?.concept ?? 'diagnóstico'} e ajuda a focar a correção.`
      : `MANUAL TÉCNICO: ${piece?.concept ?? 'conceito'} — revise a lógica antes de prosseguir.`

    setSupportNotes(prev => ({
      ...prev,
      [activePuzzle]: [...(prev[activePuzzle] ?? []), note],
    }))

    return { used: true, message: note }
  }

  function restoreSupportCheckpoint() {
    if (!supportCheckpoint) return false
    setCollectedPieces(supportCheckpoint.collectedPieces)
    setDamagedPieces(supportCheckpoint.damagedPieces)
    setLives(supportCheckpoint.lives)
    setScore(supportCheckpoint.score)
    setCurrentScreen(supportCheckpoint.currentScreen || 'map')
    setTotalTimeSeconds(supportCheckpoint.totalTimeSeconds ?? 0)
    setSelectedSetup(supportCheckpoint.selectedSetup ?? DEFAULT_SETUP)
    setDifficulty(supportCheckpoint.difficulty ?? 'normal')
    setSupportCheckpoint(null)
    return true
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
    setSelectedSetup(DEFAULT_STATE.selectedSetup)
    setDifficulty(DEFAULT_STATE.difficulty)
    setUsedHints(DEFAULT_STATE.usedHints)
    setNewlyUnlockedAchievements(DEFAULT_STATE.newlyUnlockedAchievements)
    setDiscoveredCodex(DEFAULT_STATE.discoveredCodex)
    setSupportInventory(DEFAULT_SUPPORT_INVENTORY)
    setSupportCheckpoint(DEFAULT_STATE.supportCheckpoint)
    setSupportNotes(DEFAULT_STATE.supportNotes)
  }

  return (
    <GameContext.Provider value={{
      collectedPieces, damagedPieces, failedAttempts, lives, outOfLives,
      score, coins, totalTimeSeconds, bestResult, finalResult, discoveredCodex, newlyUnlockedAchievements, currentScreen, setCurrentScreen, activePuzzle, dinoState, selectedSetup,
      difficulty, setDifficulty, usedHints, unlockedAchievements,
      supportInventory, supportCheckpoint, supportNotes,
      startGame, navigateTo, openPuzzle, completePuzzle, failPuzzle,
      spendCoins, saveDinoState, selectSetupItem, goToBoot, completeGame,
      closePuzzle, goBack, resetGame, registerHintUsage,
      getHintRewardMultiplier, buySupportItem, useSupportItem, restoreSupportCheckpoint,
      hasSupportItem: (itemId) => (supportInventory[itemId] ?? 0) > 0,
      getSupportItem: (itemId) => SUPPORT_ITEMS.find(entry => entry.id === itemId) ?? SUPPORT_NONE_ITEM,
    }}>
      {children}
    </GameContext.Provider>
  )
}
