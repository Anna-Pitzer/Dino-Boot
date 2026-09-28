import { createContext, useState } from 'react'

export const GameContext = createContext(null)

const MAX_LIVES = 3

export function GameProvider({ children }) {
  const [collectedPieces, setCollectedPieces] = useState([])
  const [damagedPieces, setDamagedPieces] = useState([])
  const [lives, setLives] = useState(MAX_LIVES)
  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(0)
  const [currentScreen, setCurrentScreen] = useState('start')
  const [activePuzzle, setActivePuzzle] = useState(null)

  const outOfLives = lives === 0

  function startGame() {
    setCurrentScreen('map')
  }

  function openPuzzle(id) {
    // sem vidas: só pode abrir peças já danificadas (para ver o estado), mas não tentar
    if (outOfLives) return
    setActivePuzzle(id)
    setCurrentScreen('puzzle')
  }

  function completePuzzle(id, timeBonus = 0) {
    if (collectedPieces.includes(id)) return
    setDamagedPieces(prev => prev.filter(p => p !== id))
    const newPieces = [...collectedPieces, id]
    setCollectedPieces(newPieces)
    setScore(s => s + 100 + timeBonus)
    setCoins(c => c + 50 + Math.floor(timeBonus / 2))
    setActivePuzzle(null)
    if (newPieces.length === 11) {
      setCurrentScreen('shop')
    } else {
      setCurrentScreen('map')
    }
  }

  function spendCoins(amount) {
    setCoins(c => Math.max(0, c - amount))
  }

  function failPuzzle(id) {
    // marca peça como danificada
    setDamagedPieces(prev => prev.includes(id) ? prev : [...prev, id])
    // desconta vida
    setLives(prev => Math.max(0, prev - 1))
    setActivePuzzle(null)
    setCurrentScreen('map')
  }

  function completeGame(timeBonus = 0) {
    setScore(s => s + 200 + timeBonus)
    setCurrentScreen('victory')
  }

  function closePuzzle() {
    setActivePuzzle(null)
    setCurrentScreen('map')
  }

  function resetGame() {
    setCollectedPieces([])
    setDamagedPieces([])
    setLives(MAX_LIVES)
    setScore(0)
    setCoins(0)
    setCurrentScreen('start')
    setActivePuzzle(null)
  }

  return (
    <GameContext.Provider value={{
      collectedPieces,
      damagedPieces,
      lives,
      outOfLives,
      score,
      coins,
      currentScreen,
      activePuzzle,
      startGame,
      openPuzzle,
      completePuzzle,
      failPuzzle,
      spendCoins,
      completeGame,
      closePuzzle,
      resetGame,
    }}>
      {children}
    </GameContext.Provider>
  )
}
