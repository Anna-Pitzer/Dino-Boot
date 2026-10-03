import { useEffect } from 'react'
import { GameProvider } from './context/GameContext'
import { useGame } from './hooks/useGame'
import StartScreen  from './screens/StartScreen'
import MapScreen    from './screens/MapScreen'
import PuzzleShell  from './components/PuzzleShell'
import ShopScreen   from './screens/ShopScreen'
import PuzzleBoot   from './puzzles/PuzzleBoot'
import VictoryScreen from './screens/VictoryScreen'
import './App.css'

function BootWrapper() {
  const { completeGame, resetGame } = useGame()
  return <PuzzleBoot onSuccess={() => completeGame()} onFail={resetGame} />
}

function GameRouter() {
  const { currentScreen, setCurrentScreen } = useGame()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = () => {
      const nextScreen = window.history.state?.screen ?? 'start'
      setCurrentScreen(nextScreen)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [setCurrentScreen])

  if (currentScreen === 'start')   return <StartScreen />
  if (currentScreen === 'map')     return <MapScreen />
  if (currentScreen === 'puzzle')  return <PuzzleShell />
  if (currentScreen === 'shop')    return <ShopScreen />
  if (currentScreen === 'boot')    return <BootWrapper />
  if (currentScreen === 'victory') return <VictoryScreen />
  return null
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  )
}
