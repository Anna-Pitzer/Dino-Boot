import { useRef, useState, useCallback } from 'react'
import { useGame } from '../hooks/useGame'
import { PIECES } from '../data/pieces'
import Timer from './Timer'
import './PuzzleShell.css'

import PuzzleCPU         from '../puzzles/PuzzleCPU'
import PuzzleRAM         from '../puzzles/PuzzleRAM'
import PuzzleSSD         from '../puzzles/PuzzleSSD'
import PuzzleGPU         from '../puzzles/PuzzleGPU'
import PuzzleMotherboard from '../puzzles/PuzzleMotherboard'
import PuzzleKeyboard    from '../puzzles/PuzzleKeyboard'
import PuzzleMouse       from '../puzzles/PuzzleMouse'
import PuzzleMonitor     from '../puzzles/PuzzleMonitor'
import PuzzlePrinter     from '../puzzles/PuzzlePrinter'
import PuzzleHeadset     from '../puzzles/PuzzleHeadset'
import PuzzlePendrive    from '../puzzles/PuzzlePendrive'

// mapa puzzleId → componente
const PUZZLE_MAP = {
  cpu:         PuzzleCPU,
  ram:         PuzzleRAM,
  ssd:         PuzzleSSD,
  gpu:         PuzzleGPU,
  motherboard: PuzzleMotherboard,
  keyboard:    PuzzleKeyboard,
  mouse:       PuzzleMouse,
  monitor:     PuzzleMonitor,
  printer:     PuzzlePrinter,
  headset:     PuzzleHeadset,
  pendrive:    PuzzlePendrive,
}

export default function PuzzleShell() {
  const { activePuzzle, lives, coins, completePuzzle, failPuzzle, closePuzzle } = useGame()
  const timerRef = useRef(null)
  const [feedback, setFeedback] = useState(null) // 'success' | 'error' | null
  const [running, setRunning] = useState(true)

  const piece = PIECES.find(p => p.id === activePuzzle)
  const PuzzleComponent = PUZZLE_MAP[activePuzzle]

  const handleSuccess = useCallback(() => {
    setRunning(false)
    setFeedback('success')
    const bonus = timerRef.current?.getTimeBonus() ?? 0
    setTimeout(() => completePuzzle(activePuzzle, bonus), 1200)
  }, [activePuzzle, completePuzzle])

  const handleFail = useCallback(() => {
    setRunning(false)
    setFeedback('error')
    setTimeout(() => failPuzzle(activePuzzle), 1200)
  }, [activePuzzle, failPuzzle])

  if (!piece) return null

  return (
    <div className={`puzzle-shell ${feedback ?? ''}`}>

      {/* Header */}
      <div className="puzzle-header">
        <div className="puzzle-header-left">
          <img src={piece.img} alt={piece.name} className="puzzle-piece-img" />
          <div className="puzzle-piece-info">
            <span className="puzzle-piece-name">{piece.name}</span>
            <span className="puzzle-piece-concept">{piece.concept}</span>
          </div>
        </div>

        <div className="puzzle-header-center">
          <span className="puzzle-timer-label">TEMPO</span>
          <Timer ref={timerRef} running={running && !feedback} />
        </div>

        <div className="puzzle-header-right">
          <div className="puzzle-stat">
            <span className="puzzle-stat-label">VIDAS</span>
            <span className="puzzle-stat-value">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={i < lives ? 'ph-life active' : 'ph-life lost'}>♥</span>
              ))}
            </span>
          </div>
          <div className="puzzle-stat">
            <span className="puzzle-stat-label">MOEDAS</span>
            <span className="puzzle-stat-value coins">🪙 {coins}</span>
          </div>
        </div>
      </div>

      {/* Feedback overlay */}
      {feedback === 'success' && (
        <div className="puzzle-feedback success">
          <span>✓ PEÇA COLETADA!</span>
        </div>
      )}
      {feedback === 'error' && (
        <div className="puzzle-feedback error">
          <span>✗ PEÇA DANIFICADA!</span>
        </div>
      )}

      {/* Puzzle content */}
      <div className="puzzle-content">
        {PuzzleComponent
          ? <PuzzleComponent onSuccess={handleSuccess} onFail={handleFail} timerRef={timerRef} />
          : (
            <div className="puzzle-placeholder">
              <img src={piece.img} alt={piece.name} className="puzzle-placeholder-img" />
              <p className="puzzle-placeholder-name">{piece.name}</p>
              <p className="puzzle-placeholder-concept">{piece.concept}</p>
              <p className="puzzle-placeholder-tag">EM DESENVOLVIMENTO</p>
              <div className="puzzle-placeholder-btns">
                <button className="puzzle-btn success-btn" onClick={handleSuccess}>
                  ✓ SIMULAR ACERTO
                </button>
                <button className="puzzle-btn error-btn" onClick={handleFail}>
                  ✗ SIMULAR ERRO
                </button>
              </div>
            </div>
          )
        }
      </div>

      {/* Footer */}
      <div className="puzzle-footer">
        <button className="puzzle-back-btn" onClick={closePuzzle} disabled={!!feedback}>
          ↩ VOLTAR AO MAPA
        </button>
      </div>

    </div>
  )
}
