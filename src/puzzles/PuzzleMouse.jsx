import { useState, useEffect, useRef } from 'react'
import './PuzzleMouse.css'

const COLS = 9
const ROWS = 6

const START    = { x: 0, y: 0 }
const MEMORIZE_SECS = 4

// Obstáculos fixos (não podem ser pisados)
const OBSTACLES = [
  { x: 3, y: 0 }, { x: 6, y: 1 },
  { x: 1, y: 2 }, { x: 4, y: 2 },
  { x: 7, y: 3 }, { x: 2, y: 4 },
  { x: 5, y: 4 }, { x: 0, y: 5 },
]

// Sequência construída para nunca bater nos obstáculos acima:
// {0,0}→{1,0}→{2,0}→{2,1}→{2,2}→{3,2}→{3,3}→{4,3}→{5,3}→{5,2}→{6,2}→{6,3}→{7,3} — mas 7,3 é obs
// Caminho limpo: (0,0)→(1,0)→(2,0)→(2,1)→(2,2)→(3,2)→(3,3)→(4,3)→(5,3)→(5,2)→(6,2)→(6,3)
const SEQUENCE = ['→', '→', '↓', '↓', '→', '↓', '→', '→', '↑', '→', '↓']

const PEEK_PENALTY = 30
const TABS = ['COMO JOGAR', 'TEORIA']

function isObstacle(pos) {
  return OBSTACLES.some(o => o.x === pos.x && o.y === pos.y)
}

function applyMove(pos, arrow) {
  const next = { ...pos }
  if (arrow === '→') next.x = Math.min(COLS - 1, next.x + 1)
  if (arrow === '←') next.x = Math.max(0, next.x - 1)
  if (arrow === '↓') next.y = Math.min(ROWS - 1, next.y + 1)
  if (arrow === '↑') next.y = Math.max(0, next.y - 1)
  return next
}

function calcTarget() {
  let pos = { ...START }
  for (const arrow of SEQUENCE) {
    const next = applyMove(pos, arrow)
    if (!isObstacle(next)) pos = next
  }
  return pos
}

const TARGET = calcTarget()

export default function PuzzleMouse({ onSuccess, onFail, timerRef }) {
  // 'memorize' → sequência visível com countdown | 'execute' → sequência oculta
  const [phase, setPhase]           = useState('memorize')
  const [countdown, setCountdown]   = useState(MEMORIZE_SECS)

  const [cursor, setCursor]         = useState({ ...START })
  const [step, setStep]             = useState(0)
  const [wrongArrow, setWrongArrow] = useState(null)
  const [trail, setTrail]           = useState([{ ...START }])
  const [hitObstacle, setHitObstacle] = useState(null)
  const [done, setDone]             = useState(false)

  const [helpOpen, setHelpOpen]     = useState(false)
  const [helpTab, setHelpTab]       = useState(0)
  const [peeked, setPeeked]         = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  // Countdown da fase de memorização
  useEffect(() => {
    if (phase !== 'memorize') return
    if (countdown <= 0) { setPhase('execute'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  function handleArrow(arrow) {
    if (done || phase === 'memorize') return
    const expected = SEQUENCE[step]

    if (arrow !== expected) {
      setWrongArrow(arrow)
      setTimeout(() => setWrongArrow(null), 500)
      timerRef?.current?.addPenalty(15)
      return
    }

    const next = applyMove(cursor, arrow)

    if (isObstacle(next)) {
      // bate no obstáculo → reseta posição e step
      setHitObstacle(next)
      setTimeout(() => setHitObstacle(null), 600)
      timerRef?.current?.addPenalty(20)
      setCursor({ ...START })
      setTrail([{ ...START }])
      setStep(0)
      return
    }

    setCursor(next)
    setTrail(t => [...t, next])
    const nextStep = step + 1

    if (nextStep === SEQUENCE.length) {
      setDone(true)
      setTimeout(() => onSuccess(), 700)
    } else {
      setStep(nextStep)
    }
  }

  function handleReset() {
    setCursor({ ...START })
    setStep(0)
    setTrail([{ ...START }])
    setDone(false)
    setWrongArrow(null)
  }

  function handlePeek() {
    if (!peeked) {
      timerRef?.current?.addPenalty(PEEK_PENALTY)
      setPeeked(true)
    }
    setShowAnswer(a => !a)
  }

  function skipMemorize() {
    setPhase('execute')
    setCountdown(0)
  }

  return (
    <div className="mouse-puzzle">

      {/* Ajuda */}
      <div className="mouse-help-bar">
        <button className="mouse-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="mouse-help-panel">
          <div className="mouse-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`mouse-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="mouse-help-content">
              <p>1. <strong>Memorize</strong> a sequência de setas — ela some em {MEMORIZE_SECS}s.</p>
              <p>2. Execute os movimentos na <strong>ordem correta</strong> usando o D-pad.</p>
              <p>3. Seta errada: <strong>+15s</strong>. Bater em obstáculo ⬛: <strong>+20s e reinicia</strong>.</p>
              <p>4. Leve o cursor até o <strong>alvo ✕</strong> para concluir.</p>
            </div>
          )}
          {helpTab === 1 && (
            <div className="mouse-help-content">
              <p>O <strong>mouse</strong> envia eventos de movimento ao SO via <strong>interrupção de hardware</strong>.</p>
              <p>O driver converte deslocamentos físicos (dx, dy) em <strong>coordenadas de tela</strong>.</p>
              <p>O SO mantém a posição do cursor em um <strong>buffer de eventos</strong> e repassa ao processo ativo.</p>
              <p>A <strong>aceleração do cursor</strong> é aplicada pelo driver para ajustar velocidade × distância.</p>
            </div>
          )}
        </div>
      )}

      {/* Phase label */}
      {phase === 'memorize' ? (
        <div className="mouse-phase-label memorize">
          MEMORIZE A SEQUÊNCIA — {countdown}s
          <button className="mouse-skip-btn" onClick={skipMemorize}>PULAR →</button>
        </div>
      ) : (
        <div className="mouse-phase-label">EXECUTE A SEQUÊNCIA — LEVE O CURSOR AO ALVO</div>
      )}

      {/* Gabarito (só na fase execute) */}
      {phase === 'execute' && (
        <>
          <div className="mouse-answer-bar">
            <button className="mouse-peek-btn" onClick={handlePeek}>
              {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
            </button>
            {peeked && !showAnswer && <span className="mouse-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
          </div>
          {showAnswer && (
            <div className="mouse-answer">
              {SEQUENCE.map((a, i) => <span key={i} className="mouse-answer-step">{a}</span>)}
            </div>
          )}
        </>
      )}

      {/* Sequência — visível só na fase memorize */}
      <div className="mouse-sequence">
        {phase === 'memorize'
          ? SEQUENCE.map((arrow, i) => (
              <div key={i} className="mouse-seq-cell visible">{arrow}</div>
            ))
          : SEQUENCE.map((_, i) => (
              <div
                key={i}
                className={[
                  'mouse-seq-cell',
                  i < step ? 'done' : i === step ? 'current' : 'hidden',
                ].join(' ')}
              >
                {i < step ? '✓' : i === step ? '?' : '·'}
              </div>
            ))
        }
      </div>

      {/* Grid */}
      <div className="mouse-grid" style={{ '--cols': COLS, '--rows': ROWS }}>
        {Array.from({ length: ROWS }).map((_, row) =>
          Array.from({ length: COLS }).map((_, col) => {
            const isCursor   = cursor.x === col && cursor.y === row
            const isTarget   = TARGET.x === col && TARGET.y === row
            const isTrail    = trail.some(p => p.x === col && p.y === row) && !isCursor
            const isObs      = isObstacle({ x: col, y: row })
            const isHit      = hitObstacle?.x === col && hitObstacle?.y === row
            return (
              <div
                key={`${col}-${row}`}
                className={[
                  'mouse-cell',
                  isCursor  ? 'cursor'   : '',
                  isTarget  ? 'target'   : '',
                  isTrail   ? 'trail'    : '',
                  isObs     ? 'obstacle' : '',
                  isHit     ? 'hit'      : '',
                  done && isCursor ? 'success' : '',
                ].join(' ')}
              >
                {isCursor && !isObs && <span className="mouse-cursor-icon">🖱</span>}
                {isTarget && !isCursor && <span className="mouse-target-icon">✕</span>}
                {isObs && <span className="mouse-obs-icon">⬛</span>}
              </div>
            )
          })
        )}
      </div>

      {/* D-pad — sem hint */}
      <div className="mouse-controls">
        <div className="mouse-dpad">
          <div />
          <button className={`mouse-arrow ${wrongArrow === '↑' ? 'wrong' : ''}`} onClick={() => handleArrow('↑')} disabled={done || phase === 'memorize'}>↑</button>
          <div />
          <button className={`mouse-arrow ${wrongArrow === '←' ? 'wrong' : ''}`} onClick={() => handleArrow('←')} disabled={done || phase === 'memorize'}>←</button>
          <div className="mouse-dpad-center" />
          <button className={`mouse-arrow ${wrongArrow === '→' ? 'wrong' : ''}`} onClick={() => handleArrow('→')} disabled={done || phase === 'memorize'}>→</button>
          <div />
          <button className={`mouse-arrow ${wrongArrow === '↓' ? 'wrong' : ''}`} onClick={() => handleArrow('↓')} disabled={done || phase === 'memorize'}>↓</button>
          <div />
        </div>
      </div>

      <div className="mouse-actions">
        <button className="mouse-btn reset" onClick={handleReset} disabled={done || phase === 'memorize'}>↺ RESETAR</button>
        <span className="mouse-progress">{step}/{SEQUENCE.length} movimentos</span>
      </div>
    </div>
  )
}
