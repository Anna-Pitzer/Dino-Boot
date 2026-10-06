import { useState, useRef } from 'react'
import { useGame } from '../hooks/useGame'
import { useGameAudio } from '../audio/useGameAudio'
import { PIECES } from '../data/pieces'
import { ACTS, getActProgress } from '../data/acts'
import { WAYPOINTS, findPath } from '../data/graph'
import dinoImg from '../assets/copia-dino.png'
import mapImg  from '../assets/ChatGPT Image 28 de set. de 2026, 08_38_57.png'
import hudDino from '../assets/copia-dino.png'
import DiagnosticPanel from '../components/DiagnosticPanel'
import './MapScreen.css'

const STEP_MS = 280

const delay = ms => new Promise(res => setTimeout(res, ms))

export default function MapScreen() {
  const { collectedPieces, damagedPieces, lives, outOfLives, score, coins, openPuzzle, resetGame, dinoState, saveDinoState, difficulty, setDifficulty, navigateTo } = useGame()
  const { playButton, playSelect } = useGameAudio()
  const [tooltip, setTooltip] = useState(null)
  const [diagnosticOpen, setDiagnosticOpen] = useState(false)
  const [dinoPos, setDinoPos] = useState(() => {
    if (dinoState.x !== null) return { x: dinoState.x, y: dinoState.y }
    const wp = WAYPOINTS.find(w => w.pieceId === 'cpu')
    return { x: wp.x, y: wp.y }
  })
  const [moving, setMoving]   = useState(false)
  const [flipX, setFlipX]     = useState(dinoState.flipX)
  const currentPiece = useRef(dinoState.pieceId)

  const collected = collectedPieces.length
  const total     = PIECES.length
  const recoveryProgress = collected / total
  const systemStatus = collected === 0 ? 'OFFLINE' : collected === total ? 'ONLINE' : 'RECOVERING'
  const actProgress = getActProgress(collectedPieces)
  const currentActIndex = collected === total
    ? actProgress.length - 1
    : actProgress.findIndex(act => !act.completed)
  const currentAct = currentActIndex >= 0 ? actProgress[currentActIndex] : actProgress[actProgress.length - 1]

  async function moveDino(toPieceId) {
    if (moving) return
    const path = findPath(currentPiece.current, toPieceId)
    if (!path || path.length < 2) {
      openPuzzle(toPieceId)
      return
    }

    setMoving(true)

    for (let i = 1; i < path.length; i++) {
      const wp   = WAYPOINTS.find(w => w.id === path[i])
      const prev = WAYPOINTS.find(w => w.id === path[i - 1])
      setFlipX(wp.x < prev.x)
      setDinoPos({ x: wp.x, y: wp.y })
      await delay(STEP_MS)
    }

    currentPiece.current = toPieceId
    const finalWp = WAYPOINTS.find(w => w.pieceId === toPieceId)
    saveDinoState({ pieceId: toPieceId, x: finalWp.x, y: finalWp.y, flipX })
    setMoving(false)
    openPuzzle(toPieceId)
  }

  function handlePointClick(piece, isCollected, isLocked) {
    if (isCollected || isLocked || moving) return
    moveDino(piece.id)
  }

  return (
    <div className="map-screen">
      <div className="arcade-cabinet">
        <div className="marquee">
          <img src={hudDino} alt="dino" className="hud-dino" />
          <h1>DINOBOOT</h1>
        </div>

        <div className="map-hud">
          <div className="hud-item stat-box">
            <span className="hud-label">SCORE</span>
            <span className="hud-value">{String(score).padStart(6, '0')}</span>
          </div>
          <div className="hud-item stat-box">
            <span className="hud-label">MOEDAS</span>
            <span className="hud-value hud-coins">🪙 {coins}</span>
          </div>
          <div className="hud-item stat-box">
            <span className="hud-label">PEÇAS</span>
            <span className="hud-value">{collected}/{total}</span>
          </div>
          <div className="hud-item stat-box">
            <span className="hud-label">VIDAS</span>
            <span className="hud-value hud-lives">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={i < lives ? 'life active' : 'life lost'}>♥</span>
              ))}
            </span>
          </div>
          {outOfLives && (
            <div className="hud-no-lives">⚠ SEM VIDAS — COMPLETE AS PEÇAS COLETADAS</div>
          )}
          <div className="hud-progress stat-box">
            <span className="hud-progress-label">PROGRESSO</span>
            <div className="hud-progress-track">
              <div className="hud-progress-bar" style={{ width: `${(collected / total) * 100}%` }} />
            </div>
          </div>
        </div>

        {diagnosticOpen && (
          <DiagnosticPanel
            collectedPieces={collectedPieces}
            damagedPieces={damagedPieces}
            outOfLives={outOfLives}
            onClose={() => setDiagnosticOpen(false)}
          />
        )}

        <div className="map-layout">
          <div className="screen-wrap">
            <div className="bezel">
              <div className="system-title">SYSTEM <i className={`system-status ${systemStatus.toLowerCase()}`}>{systemStatus}</i></div>

              <div className="map-world">
                <div
                  className={`map-area ${collected === 0 ? 'power-offline' : collected === total ? 'power-online' : 'power-recovering'}`}
                  style={{ backgroundImage: `url(${mapImg})` }}
                  aria-label={`Mapa: sistema ${systemStatus.toLowerCase()}, ${collected} de ${total} componentes recuperados`}
                >
                  <div
                    className="map-offline-shade"
                    style={{ opacity: 1 - recoveryProgress }}
                    aria-hidden="true"
                  />
                  <div
                    className="map-powered-glow"
                    style={{ opacity: recoveryProgress }}
                    aria-hidden="true"
                  />
                  {PIECES.map(piece => {
                    const isCollected = collectedPieces.includes(piece.id)
                    const isDamaged = damagedPieces.includes(piece.id) && !isCollected
                    if (!isCollected && !isDamaged) return null

                    return (
                      <span
                        key={`zone-${piece.id}`}
                        className={`map-zone-light ${isCollected ? 'recovered' : 'damaged'}`}
                        style={{ left: `${piece.position.x}%`, top: `${piece.position.y}%` }}
                        aria-hidden="true"
                      />
                    )
                  })}
                  <span className={`map-status-chip ${systemStatus.toLowerCase()}`}>
                    {systemStatus} · {Math.round(recoveryProgress * 100)}%
                  </span>

                  <div
                    className={`map-dino ${moving ? 'walking' : 'idle'} ${flipX ? 'flip' : ''}`}
                    style={{ left: `${dinoPos.x}%`, top: `${dinoPos.y}%` }}
                  >
                    <img src={dinoImg} alt="Dino" />
                  </div>

                  {PIECES.map(piece => {
                    const isCollected = collectedPieces.includes(piece.id)
                    const isDamaged   = damagedPieces.includes(piece.id)
                    const isLocked    = outOfLives && !isDamaged && !isCollected

                    let stateClass = 'available'
                    if (isCollected) stateClass = 'collected'
                    else if (isDamaged) stateClass = 'damaged'
                    else if (isLocked) stateClass = 'locked'

                    return (
                      <button
                        key={piece.id}
                        className={`map-point ${stateClass} ${moving ? 'no-hover' : ''}`}
                        style={{ left: `${piece.position.x}%`, top: `${piece.position.y}%` }}
                        onClick={() => handlePointClick(piece, isCollected, isLocked)}
                        onMouseEnter={() => setTooltip(piece.id)}
                        onMouseLeave={() => setTooltip(null)}
                        disabled={isCollected || isLocked || moving}
                      >
                        <img src={piece.img} alt={piece.name} className="map-point-img" />
                        {isCollected && <span className="map-point-check">✓</span>}
                        {isDamaged && !isCollected && <span className="map-point-damage">!</span>}
                        {isLocked && <span className="map-point-lock">🔒</span>}

                        {tooltip === piece.id && (
                          <div className="map-tooltip">
                            <strong>{piece.name}</strong>
                            <span>{piece.concept}</span>
                            {isCollected && <span className="tooltip-done">COLETADO</span>}
                            {isDamaged && !isCollected && <span className="tooltip-damaged">DANIFICADA — TENTE NOVAMENTE</span>}
                            {isLocked && <span className="tooltip-locked">SEM VIDAS</span>}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {collected === total && (
                  <div className="map-alert">
                    ★ TODAS AS PEÇAS COLETADAS — INICIE O BOOT FINAL! ★
                  </div>
                )}
              </div>

              <div className="arc-deck">
                <div className="arc-stick" aria-hidden="true" />

                <div className="arc-group">
                  <span className="arc-lbl">NÍVEL</span>
                  {['normal', 'hard', 'master'].map(level => (
                    <button
                      key={level}
                      className={`arc-b ${difficulty === level ? 'on' : ''}`}
                      onClick={() => { playSelect(); setDifficulty(level) }}
                      type="button"
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="arc-group">
                  <button className="arc-b" onClick={() => { playButton(); navigateTo('shop') }} type="button">LOJA</button>
                  <button className="arc-b g" onClick={() => { playButton(); setDiagnosticOpen(true) }} type="button">DIAGNÓSTICO</button>
                  <button className="arc-b" onClick={() => { playButton(); navigateTo('codex') }} type="button">CODEX</button>
                  <button className="arc-b m" onClick={() => { playButton(); resetGame() }} type="button">REINICIAR</button>
                </div>

                <div className="arc-credit">INSERT COIN</div>
              </div>
            </div>
          </div>

          <aside className="map-act-panel">
            <div className="map-act-header">
              <span>PROGRESSÃO EM ATOS</span>
              <strong>{currentAct?.name}</strong>
            </div>

            <div className="map-act-list">
              {ACTS.map((act, index) => {
                const status = actProgress[index]
                const actsCompleted = status?.completed
                const actsCurrent = index === currentActIndex

                return (
                  <div
                    key={act.id}
                    className={`map-act-card ${actsCompleted ? 'done' : ''} ${actsCurrent ? 'current' : ''}`}
                    style={{ borderColor: act.accent }}
                  >
                    <div className="map-act-step">ATO {index + 1}</div>
                    <div className="map-act-name">{act.name}</div>
                    <div className="map-act-focus">{act.focus}</div>
                    <div className="map-act-meta">
                      {status?.collectedCount ?? 0}/{status?.totalPieces || 0} peças
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
