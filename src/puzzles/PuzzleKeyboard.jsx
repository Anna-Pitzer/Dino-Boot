import { useEffect, useState } from 'react'
import { useGameAudio } from '../audio/useGameAudio'
import './PuzzleKeyboard.css'

// Fase 1: pares embaralhados para conectar
const PAIRS = [
  { key: 'A', code: 65 },
  { key: 'B', code: 66 },
  { key: 'C', code: 67 },
  { key: 'D', code: 68 },
  { key: 'E', code: 69 },
  { key: 'F', code: 70 },
]

// Fase 2: sequência a decifrar → "BOOT"
const SEQUENCE = [66, 79, 79, 84]
const EXTRA_KEYS = ['A', 'B', 'O', 'T', 'C', 'D', 'E', 'F', 'G', 'H']

const PEEK_PENALTY = 30
const TABS = ['COMO JOGAR', 'TEORIA']

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function PuzzleKeyboard({ onSuccess, onFail, timerRef }) {
  const { playWrong } = useGameAudio()
  const [phase, setPhase] = useState(1)

  // Fase 1
  const [shuffledCodes] = useState(() => shuffle(PAIRS.map(p => p.code)))
  const [connections, setConnections] = useState({}) // key → code
  const [selected, setSelected] = useState(null)     // { side: 'key'|'code', value }
  const [wrongFlash, setWrongFlash] = useState(null)

  // Fase 2
  const [typed, setTyped] = useState([])
  const [wrongKey, setWrongKey] = useState(null)

  // Ajuda
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpTab, setHelpTab] = useState(0)
  const [peeked, setPeeked] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [navFocus, setNavFocus] = useState({ side: 'key', index: 0 })

  // ── Fase 1 ──────────────────────────────────────────────
  const connectedKeys  = new Set(Object.keys(connections))
  const connectedCodes = new Set(Object.values(connections))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
        event.preventDefault()
      }

      if (phase === 1) {
        const keyList = PAIRS.map(item => item.key)
        const codeList = shuffledCodes

        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          setNavFocus(prev => ({
            side: prev.side === 'key' ? 'code' : 'key',
            index: prev.index,
          }))
          return
        }

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          const currentList = navFocus.side === 'key' ? keyList : codeList
          const direction = event.key === 'ArrowDown' ? 1 : -1
          setNavFocus(prev => ({
            ...prev,
            index: (prev.index + direction + currentList.length) % currentList.length,
          }))
          return
        }

        if (event.key === 'Enter') {
          const currentList = navFocus.side === 'key' ? keyList : codeList
          const currentValue = currentList[navFocus.index]
          handleSelect(navFocus.side, currentValue)
        }

        return
      }

      if (phase === 2) {
        const keyList = EXTRA_KEYS
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          const direction = (event.key === 'ArrowRight' || event.key === 'ArrowDown') ? 1 : -1
          setNavFocus(prev => ({
            side: 'key',
            index: (prev.index + direction + keyList.length) % keyList.length,
          }))
          return
        }

        if (event.key === 'Enter') {
          handleKeyPress(EXTRA_KEYS[navFocus.index])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, navFocus, shuffledCodes, handleSelect, handleKeyPress])

  function handleSelect(side, value) {
    if (side === 'key' && connectedKeys.has(value)) {
      // desfaz conexão
      setConnections(prev => { const n = { ...prev }; delete n[value]; return n })
      return
    }
    if (side === 'code' && connectedCodes.has(value)) {
      // desfaz conexão pelo código
      const key = Object.keys(connections).find(k => connections[k] === value)
      setConnections(prev => { const n = { ...prev }; delete n[key]; return n })
      return
    }

    if (!selected) {
      setSelected({ side, value })
      return
    }

    if (selected.side === side) {
      setSelected({ side, value })
      return
    }

    const keyVal  = selected.side === 'key'  ? selected.value : value
    const codeVal = selected.side === 'code' ? selected.value : value

    const correct = PAIRS.find(p => p.key === keyVal)?.code === codeVal
    if (!correct) {
      playWrong()
      setWrongFlash(keyVal)
      setTimeout(() => setWrongFlash(null), 600)
      timerRef?.current?.addPenalty(10)
      setSelected(null)
      return
    }

    setConnections(prev => ({ ...prev, [keyVal]: codeVal }))
    setSelected(null)
  }

  function handlePhase1Confirm() {
    const allCorrect = PAIRS.every(p => connections[p.key] === p.code)
    if (!allCorrect) {
      playWrong()
      // flash nas erradas
      PAIRS.forEach(p => {
        if (connections[p.key] !== p.code) {
          setWrongFlash(p.key)
          setTimeout(() => setWrongFlash(null), 800)
        }
      })
      return
    }
    setPhase(2)
  }

  function handlePeek() {
    if (!peeked) {
      timerRef?.current?.addPenalty(PEEK_PENALTY)
      setPeeked(true)
    }
    setShowAnswer(a => !a)
  }

  // ── Fase 2 ──────────────────────────────────────────────
  function handleKeyPress(key) {
    const expected = SEQUENCE[typed.length]
    const keyCode  = key.charCodeAt(0)

    if (keyCode === expected) {
      const next = [...typed, key]
      setTyped(next)
      if (next.length === SEQUENCE.length) {
        setTimeout(() => onSuccess(), 600)
      }
    } else {
      playWrong()
      setWrongKey(key)
      setTimeout(() => setWrongKey(null), 500)
      timerRef?.current?.addPenalty(10)
    }
  }

  return (
    <div className="kb-puzzle">

      {/* Ajuda */}
      <div className="kb-help-bar">
        <button className="kb-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="kb-help-panel">
          <div className="kb-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`kb-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="kb-help-content">
              {phase === 1 ? <>
                <p>1. Clique em uma <strong>tecla</strong> e depois no <strong>código ASCII</strong> correspondente.</p>
                <p>2. Par errado custa <strong>+10s</strong>. Clique em um par já conectado para <strong>desfazê-lo</strong>.</p>
                <p>3. Conecte todos os pares e clique em <strong>PRÓXIMA FASE</strong>.</p>
              </> : <>
                <p>1. Veja a sequência de <strong>códigos ASCII</strong> acima.</p>
                <p>2. Clique nas teclas na <strong>ordem correta</strong> para digitar a palavra.</p>
                <p>3. Tecla errada custa <strong>+10s</strong>.</p>
              </>}
            </div>
          )}
          {helpTab === 1 && (
            <div className="kb-help-content">
              <p><strong>ASCII</strong> (American Standard Code for Information Interchange) é uma tabela que mapeia caracteres a números.</p>
              <p>Cada tecla pressionada gera um <strong>keyCode</strong> que o SO captura via <strong>interrupção de hardware</strong>.</p>
              <p>O driver do teclado converte o <strong>scan code</strong> do hardware em <strong>key event</strong> para o sistema operacional.</p>
              <p>Letras maiúsculas: A=65, B=66, C=67… Z=90.</p>
            </div>
          )}
        </div>
      )}

      {/* ── FASE 1 ── */}
      {phase === 1 && (
        <>
          <div className="kb-phase-label">FASE 1 — CONECTE TECLAS AOS CÓDIGOS ASCII</div>

          <div className="kb-answer-bar">
            <button className="kb-peek-btn" onClick={handlePeek}>
              {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
            </button>
            {peeked && !showAnswer && <span className="kb-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
          </div>

          {showAnswer && (
            <div className="kb-answer">
              {PAIRS.map(p => (
                <span key={p.key} className="kb-answer-row">{p.key} → {p.code}</span>
              ))}
            </div>
          )}

          <div className="kb-connect-area">
            {/* Coluna de teclas */}
            <div className="kb-col">
              <div className="kb-col-label">TECLAS</div>
              {PAIRS.map((p, index) => (
                <button
                  key={p.key}
                  className={[
                    'kb-item kb-key',
                    connectedKeys.has(p.key) ? 'connected' : '',
                    selected?.side === 'key' && selected.value === p.key ? 'selected' : '',
                    wrongFlash === p.key ? 'wrong' : '',
                    phase === 1 && navFocus.side === 'key' && navFocus.index === index ? 'focused' : '',
                  ].join(' ')}
                  onClick={() => handleSelect('key', p.key)}
                >
                  {p.key}
                  {connectedKeys.has(p.key) && <span className="kb-badge">✓ {connections[p.key]}</span>}
                </button>
              ))}
            </div>

            {/* Linha de conexão visual */}
            <div className="kb-wire-col">
              {PAIRS.map(p => (
                <div key={p.key} className={`kb-wire ${connectedKeys.has(p.key) ? 'active' : ''}`} />
              ))}
            </div>

            {/* Coluna de códigos */}
            <div className="kb-col">
              <div className="kb-col-label">CÓDIGOS</div>
              {shuffledCodes.map((code, index) => (
                <button
                  key={code}
                  className={[
                    'kb-item kb-code',
                    connectedCodes.has(code) ? 'connected' : '',
                    selected?.side === 'code' && selected.value === code ? 'selected' : '',
                    phase === 1 && navFocus.side === 'code' && navFocus.index === index ? 'focused' : '',
                  ].join(' ')}
                  onClick={() => handleSelect('code', code)}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="kb-actions">
            <button className="kb-btn reset" onClick={() => { setConnections({}); setSelected(null) }}>↺ RESETAR</button>
            <button
              className="kb-btn confirm"
              onClick={handlePhase1Confirm}
              disabled={connectedKeys.size < PAIRS.length}
            >
              PRÓXIMA FASE →
            </button>
          </div>
        </>
      )}

      {/* ── FASE 2 ── */}
      {phase === 2 && (
        <>
          <div className="kb-phase-label">FASE 2 — DECIFRE A SEQUÊNCIA</div>
          <p className="kb-phase-hint">Clique nas teclas na ordem correta para formar a palavra</p>

          <div className="kb-sequence">
            {SEQUENCE.map((code, i) => (
              <div key={i} className={`kb-seq-cell ${i < typed.length ? 'done' : i === typed.length ? 'current' : ''}`}>
                <span className="kb-seq-code">{code}</span>
                <span className="kb-seq-char">{i < typed.length ? typed[i] : '?'}</span>
              </div>
            ))}
          </div>

          <div className="kb-keyboard">
            {EXTRA_KEYS.map((key, index) => (
              <button
                key={key}
                className={`kb-key-btn ${wrongKey === key ? 'wrong' : ''} ${phase === 2 && navFocus.index === index ? 'focused' : ''}`}
                onClick={() => handleKeyPress(key)}
                disabled={typed.length === SEQUENCE.length}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="kb-typed-display">
            {typed.length > 0 && <span>Digitado: <strong>{typed.join('')}</strong></span>}
          </div>
        </>
      )}
    </div>
  )
}
