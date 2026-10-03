import { useGame } from '../hooks/useGame'
import { hasSave } from '../context/GameContext'
import './StartScreen.css'

export default function StartScreen() {
  const { score, startGame, resetGame } = useGame()
  const saveExists = hasSave()

  return (
    <div className="start-screen">
      <div className="arcade-container">
        <div className="screen">
          <h1 className="title">DINOBOOT</h1>
          <p className="subtitle">» SISTEMAS OPERACIONAIS RPG «</p>

          <div className="score-board">
            <div className="score-item">
              LEVEL<br />
              <span className="score-value">01</span>
            </div>
            <div className="score-item">
              SCORE<br />
              <span className="score-value">{String(score).padStart(5, '0')}</span>
            </div>
            <div className="score-item">
              PEÇAS<br />
              <span className="score-value">11</span>
            </div>
          </div>
        </div>

        <div className="led-lights">
          <div className="led red" />
          <div className="led orange" />
          <div className="led blue" />
        </div>

        <div className="button-group">
          {saveExists ? (
            <button className="arcade-button primary" onClick={startGame}>
              ▶ CONTINUAR
            </button>
          ) : (
            <button className="arcade-button primary" onClick={startGame}>
              ▶ NOVO JOGO
            </button>
          )}
          {saveExists && (
            <button className="arcade-button danger" onClick={() => { if (confirm('Apagar progresso salvo?')) resetGame() }}>
              ✕ RESETAR
            </button>
          )}
          <button className="arcade-button" onClick={() => alert('📊 COMO JOGAR\n\n• Explore o mapa\n• Clique nas peças para resolver puzzles\n• Colete todas as 11 peças\n• Inicialize o computador!')}>
            ⓘ COMO JOGAR
          </button>
        </div>

        <div className="arcade-panel">
          <div className="insert-coin">★ INSIRA A MOEDA PARA CONTINUAR ★</div>
          ★ ★ ★ PRESSIONE START ★ ★ ★
        </div>
      </div>
    </div>
  )
}
