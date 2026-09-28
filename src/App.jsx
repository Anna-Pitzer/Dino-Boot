import { GameProvider } from './context/GameContext'
import { useGame } from './hooks/useGame'
import StartScreen from './screens/StartScreen'
import MapScreen from './screens/MapScreen'
import './App.css'

function GameRouter() {
  const { currentScreen } = useGame()

  if (currentScreen === 'start') return <StartScreen />
  if (currentScreen === 'map') return <MapScreen />
  if (currentScreen === 'puzzle') return <div className="screen-placeholder">🧩 PuzzleShell — SPEC-03</div>
  if (currentScreen === 'shop')   return <div className="screen-placeholder">🪙 ShopScreen — SPEC-18</div>
  if (currentScreen === 'boot')   return <div className="screen-placeholder">💻 PuzzleBoot — SPEC-15</div>
  if (currentScreen === 'victory') return <div className="screen-placeholder">🏆 VictoryScreen — SPEC-16</div>
  return null
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  )
}
