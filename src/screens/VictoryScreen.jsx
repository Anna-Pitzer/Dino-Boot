import { useEffect } from 'react'
import { useGame } from '../hooks/useGame'
import { useGameAudio } from '../audio/useGameAudio'
import { PIECES } from '../data/pieces'
import { ACHIEVEMENT_DEFS, getFinalResult, getRunAchievements } from '../data/achievements'
import AchievementBadge from '../components/AchievementBadge'
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
  const { collectedPieces, damagedPieces, failedAttempts, score, coins, totalTimeSeconds, bestResult, newlyUnlockedAchievements, resetGame, usedHints, unlockedAchievements } = useGame()
  const { playVictory, playBack } = useGameAudio()

  useEffect(() => {
    playVictory()
  }, [playVictory])
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
  const failed = finalResult.rank === 'FAIL'
  const runAchievements = getRunAchievements({
    collectedPieces,
    damagedPieces,
    failedAttempts,
    totalTimeSeconds,
    usedHints,
    allPieceCount: PIECES.length,
  })

  const displayAchievements = ACHIEVEMENT_DEFS.map(achievement => ({
    ...achievement,
    unlocked: unlockedAchievements.includes(achievement.id) || runAchievements.includes(achievement.id),
  }))

  return (
    <div className={`vs-screen ${failed ? 'failed' : 'victory'}`}>
      <div className="vs-container">

        {failed ? (
          <>
            <div className="vs-icon">💀</div>
            <h1 className="vs-title error">FALHA NO BOOT</h1>
            <p className="vs-subtitle">O sistema não inicializou — componentes danificados detectados.</p>

            <div className="vs-rank-card" style={{ borderColor: finalResult.accent, boxShadow: `0 0 20px ${finalResult.accent}40` }}>
              <div className="vs-rank-badge" style={{ background: finalResult.accent }}>{finalResult.rank}</div>
              <div className="vs-rank-copy">
                <div className="vs-rank-label">{finalResult.label}</div>
                <p>{finalResult.summary}</p>
              </div>
            </div>

            <div className="vs-criteria">
              <div className="vs-section-label">CRITÉRIOS DA CLASSIFICAÇÃO</div>
              <ul className="vs-criteria-list">
                {finalResult.criteria.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

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

            <div className="vs-rank-card" style={{ borderColor: finalResult.accent, boxShadow: `0 0 20px ${finalResult.accent}40` }}>
              <div className="vs-rank-badge" style={{ background: finalResult.accent }}>{finalResult.rank}</div>
              <div className="vs-rank-copy">
                <div className="vs-rank-label">{finalResult.label}</div>
                <p>{finalResult.summary}</p>
              </div>
            </div>

            <div className="vs-criteria">
              <div className="vs-section-label">CRITÉRIOS DA CLASSIFICAÇÃO</div>
              <ul className="vs-criteria-list">
                {finalResult.criteria.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

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

            <div className="vs-achievements">
              <div className="vs-section-label">MEDALHAS</div>
              {newlyUnlockedAchievements.length > 0 && (
                <p className="vs-achievement-feedback" role="status">
                  ★ NOVAS MEDALHAS DESBLOQUEADAS NESTA PARTIDA ★
                </p>
              )}
              <div className="vs-achievements-grid">
                {displayAchievements.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={achievement.unlocked}
                    newlyUnlocked={newlyUnlockedAchievements.includes(achievement.id)}
                  />
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

        {bestResult && (
          <div className="vs-best-result">
            <span className="vs-best-result-label">MELHOR RESULTADO</span>
            <span className="vs-best-result-score">{String(bestResult.score).padStart(6, '0')}</span>
            <span className="vs-best-result-time">TEMPO {formatTotalTime(bestResult.timeSeconds)}</span>
          </div>
        )}

        <button className="vs-btn" onClick={() => { playBack(); resetGame() }}>↩ JOGAR NOVAMENTE</button>
      </div>
    </div>
  )
}
