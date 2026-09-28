import { useState, useRef } from 'react'
import { useGame } from '../hooks/useGame'
import { PIECES } from '../data/pieces'
import { WAYPOINTS, findPath } from '../data/graph'
import dinoImg from '../assets/copia-dino.png'
import mapImg  from '../assets/ChatGPT Image 28 de set. de 2026, 08_38_57.png'
import hudDino from '../assets/copia-dino.png'
import './MapScreen.css'

const STEP_MS = 280
const START_PIECE = 'cpu'

const delay = ms => new Promise(res => setTimeout(res, ms))

export default function MapScreen() {
  const { collectedPieces, damagedPieces, lives, outOfLives, score, coins, openPuzzle, resetGame } = useGame()
  const [tooltip, setTooltip] = useState(null)
  const [dinoPos, setDinoPos] = useState(() => {
    const wp = WAYPOINTS.find(w => w.pieceId === START_PIECE)
    return { x: wp.x, y: wp.y }
  })
  const [moving, setMoving]   = useState(false)
  const [flipX, setFlipX]     = useState(false)
  const currentPiece = useRef(START_PIECE)

  const collected = collectedPieces.length
  const total     = PIECES.length

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
    setMoving(false)
    openPuzzle(toPieceId)
  }

  function handlePointClick(piece, isCollected, isLocked) {
    if (isCollected || isLocked || moving) return
    moveDino(piece.id)
  }

  return (
    <div className="map-screen">
      <div className="map-hud">
        <div className="hud-brand">
          <img src={hudDino} alt="dino" className="hud-dino" />
          <span className="hud-brand-name">DINOBOOT</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">SCORE</span>
          <span className="hud-value">{String(score).padStart(6, '0')}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">MOEDAS</span>
          <span className="hud-value hud-coins">🪙 {coins}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">PEÇAS</span>
          <span className="hud-value">{collected}/{total}</span>
        </div>
        <div className="hud-item">
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
        <div className="hud-progress">
          <span className="hud-progress-label">PROGRESSO</span>
          <div className="hud-progress-track">
            <div className="hud-progress-bar" style={{ width: `${(collected / total) * 100}%` }} />
          </div>
        </div>
        <button className="hud-back-btn" onClick={resetGame}>↩ MENU</button>
      </div>

      <div className="map-world">
        <div className="map-title">— EXPLORE O MAPA —</div>

        <div className="map-area" style={{ backgroundImage: `url(${mapImg})` }}>

          {/* Dino */}
          <div
            className={`map-dino ${moving ? 'walking' : 'idle'} ${flipX ? 'flip' : ''}`}
            style={{ left: `${dinoPos.x}%`, top: `${dinoPos.y}%` }}
          >
            <img src={dinoImg} alt="Dino" />
          </div>

          {/* Pontos */}
          {PIECES.map(piece => {
            const isCollected = collectedPieces.includes(piece.id)
            const isDamaged   = damagedPieces.includes(piece.id)
            const isLocked    = outOfLives && !isDamaged && !isCollected

            let stateClass = 'available'
            if (isCollected)              stateClass = 'collected'
            else if (isDamaged)           stateClass = 'damaged'
            else if (isLocked)            stateClass = 'locked'

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
    </div>
  )
}
