import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { useGameAudio } from '../audio/useGameAudio'
import { PUZZLE_HINTS, DEFAULT_HINT_COST } from '../data/puzzleHints'
import './HintSystem.css'

export default function HintSystem({ puzzleId, onClose }) {
  const { coins, usedHints, registerHintUsage } = useGame()
  const { playSelect, playBack } = useGameAudio()
  const hints = PUZZLE_HINTS[puzzleId] ?? { cost: DEFAULT_HINT_COST, hints: [] }
  const usedHintIndexes = usedHints[puzzleId] ?? []

  const [revealedHint, setRevealedHint] = useState(null)

  function handleUseHint(index) {
    const hint = hints.hints[index]
    if (!hint) return

    if (usedHintIndexes.includes(index)) {
      playSelect()
      setRevealedHint(index)
      return
    }

    const cost = index === 0 ? 0 : hints.cost ?? DEFAULT_HINT_COST
    if (cost > 0 && coins < cost) return

    playSelect()
    registerHintUsage(puzzleId, index, cost)
    setRevealedHint(index)
  }

  function handleClose() {
    playBack()
    onClose()
  }

  const canReveal = revealedHint !== null || usedHintIndexes.length > 0

  return (
    <div className="hint-system-backdrop" onClick={handleClose}>
      <div className="hint-system" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="hint-system-header">
          <div>
            <span className="hint-system-label">DICAS</span>
            <h3>{puzzleId.toUpperCase()}</h3>
          </div>
          <button className="hint-close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="hint-system-summary">
          <span>Primeira dica grátis</span>
          <span>Dicas extras: {hints.cost ?? DEFAULT_HINT_COST} 🪙</span>
        </div>

        <div className="hint-list">
          {hints.hints.map((hint, index) => {
            const isUsed = usedHintIndexes.includes(index)
            const revealed = isUsed || revealedHint === index || (canReveal && index === 0 && usedHintIndexes.length === 0)
            const cost = index === 0 ? 0 : hints.cost ?? DEFAULT_HINT_COST

            return (
              <div key={hint.title} className={`hint-card ${revealed ? 'revealed' : ''}`}>
                <div className="hint-card-top">
                  <span className="hint-card-title">{hint.title}</span>
                  <span className="hint-cost-tag">{index === 0 ? 'GRATUITA' : `-${cost} 🪙`}</span>
                </div>

                <p className="hint-text">
                  {revealed ? hint.text : 'Use a dica para ver a orientação contextual desta etapa.'}
                </p>

                {!isUsed && (
                  <button
                    className="hint-use-btn"
                    onClick={() => handleUseHint(index)}
                    disabled={cost > 0 && coins < cost}
                  >
                    {cost > 0 ? `USAR DICA (-${cost} 🪙)` : 'USAR DICA'}
                  </button>
                )}

                {isUsed && <span className="hint-used">DICA UTILIZADA</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
