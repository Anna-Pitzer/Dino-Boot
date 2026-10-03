import { useGame } from '../hooks/useGame'
import { PIECES } from '../data/pieces'
import './VictoryScreen.css'

const DAMAGE_LABELS = {
  cpu:         'CPU',
  ram:         'RAM',
  ssd:         'SSD',
  gpu:         'GPU',
  motherboard: 'Placa-mãe',
  keyboard:    'Teclado',
  mouse:       'Mouse',
  monitor:     'Monitor',
  printer:     'Impressora',
  headset:     'Headset',
  pendrive:    'Pendrive',
}

function formatTotalTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function VictoryScreen() {
  const { collectedPieces, damagedPieces, score, coins, totalTimeSeconds, resetGame } = useGame()
  const failed = damagedPieces.length > 0

  return (
    <div className={`vs-screen ${failed ? 'failed' : 'victory'}`}>
      <div className="vs-container">

        {failed ? (
          <>
            <div className="vs-icon">💀</div>
            <h1 className="vs-title error">FALHA NO BOOT</h1>
            <p className="vs-subtitle">O sistema não inicializou — componentes danificados detectados.</p>

            <div className="vs-damage-list">
              <div className="vs-section-label">COMPONENTES COM FALHA</div>
              {damagedPieces.map(id => (
                <div key={id} className="vs-damage-row">
                  <span className="vs-damage-icon">⚠</span>
                  <span>{DAMAGE_LABELS[id] ?? id}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="vs-icon">🦕</div>
            <h1 className="vs-title">BOOT CONCLUÍDO!</h1>
            <p className="vs-subtitle">O DinoBootOS inicializou com sucesso. Todos os sistemas operacionais.</p>

            <div className="vs-pieces">
              <div className="vs-section-label">PEÇAS COLETADAS</div>
              <div className="vs-pieces-grid">
                {PIECES.map(p => (
                  <div key={p.id} className={`vs-piece ${collectedPieces.includes(p.id) ? 'collected' : 'missing'}`}>
                    <img src={p.img} alt={p.name} />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="vs-stats">
          <div className="vs-stat">
            <span className="vs-stat-label">SCORE FINAL</span>
            <span className="vs-stat-value">{String(score).padStart(6, '0')}</span>
          </div>
          <div className="vs-stat">
            <span className="vs-stat-label">TEMPO TOTAL</span>
            <span className="vs-stat-value">{formatTotalTime(totalTimeSeconds)}</span>
          </div>
          <div className="vs-stat">
            <span className="vs-stat-label">MOEDAS</span>
            <span className="vs-stat-value coins">🪙 {coins}</span>
          </div>
          <div className="vs-stat">
            <span className="vs-stat-label">PEÇAS</span>
            <span className="vs-stat-value">{collectedPieces.length} / {PIECES.length}</span>
          </div>
        </div>

        <button className="vs-btn" onClick={resetGame}>↩ JOGAR NOVAMENTE</button>
      </div>
    </div>
  )
}
