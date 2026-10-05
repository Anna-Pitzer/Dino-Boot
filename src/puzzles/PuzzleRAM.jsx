import { useEffect, useState } from 'react'
import { useGame } from '../hooks/useGame'
import { useGameAudio } from '../audio/useGameAudio'
import { getDifficultyProfile } from '../data/difficulty'
import './PuzzleRAM.css'

const PEEK_PENALTY = 30
const TABS = ['COMO JOGAR', 'TEORIA']

export default function PuzzleRAM({ onSuccess, onFail, timerRef }) {
  const { difficulty } = useGame()
  const { playWrong } = useGameAudio()
  const profile = getDifficultyProfile('ram', difficulty)
  const BLOCKS = profile.blocks
  const PROGRAMS = profile.programs
  // blockId → programId
  const [allocations, setAllocations] = useState({})
  const [dragging, setDragging]       = useState(null) // programId
  const [rejects, setRejects]         = useState({})   // blockId → true (flash erro)
  const [helpOpen, setHelpOpen]       = useState(false)
  const [helpTab, setHelpTab]         = useState(0)
  const [peeked, setPeeked]           = useState(false)
  const [showAnswer, setShowAnswer]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)

  useEffect(() => {
    setAllocations({})
    setDragging(null)
    setRejects({})
    setSubmitted(false)
  }, [difficulty])

  const allocatedPrograms = new Set(Object.values(allocations))
  const freePrograms = PROGRAMS.filter(p => !allocatedPrograms.has(p.id))
  const allAllocated = freePrograms.length === 0

  function handleDrop(blockId) {
    if (!dragging) return
    const block   = BLOCKS.find(b => b.id === blockId)
    const program = PROGRAMS.find(p => p.id === dragging)
    if (!block || block.locked || allocations[blockId]) return

    if (program.size > block.size) {
      // flash de rejeição
      playWrong()
      setRejects(r => ({ ...r, [blockId]: true }))
      setTimeout(() => setRejects(r => { const n = { ...r }; delete n[blockId]; return n }), 600)
      setDragging(null)
      return
    }

    setAllocations(prev => ({ ...prev, [blockId]: dragging }))
    setDragging(null)
  }

  function removeAllocation(blockId) {
    setAllocations(prev => { const n = { ...n }; delete n[blockId]; return n })
    setAllocations(prev => {
      const n = { ...prev }
      delete n[blockId]
      return n
    })
  }

  function handleSubmit() {
    setSubmitted(true)
    setTimeout(() => onSuccess(), 800)
  }

  function handlePeek() {
    if (!peeked) {
      timerRef?.current?.addPenalty(PEEK_PENALTY)
      setPeeked(true)
    }
    setShowAnswer(a => !a)
  }

  // gabarito: melhor alocação possível
  const ANSWER = [
    { block: 'b2', program: 'S.O. (20MB)' },
    { block: 'b3', program: 'JOGO (30MB)' },
    { block: 'b5', program: 'EDITOR (10MB)' },
    { block: 'b6', program: 'NAVEGADOR (20MB)' },
  ]

  return (
    <div className="ram-puzzle">

      {/* Ajuda */}
      <div className="ram-help-bar">
        <button className="ram-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="ram-help-panel">
          <div className="ram-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`ram-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="ram-help-content">
              <p>1. Arraste os <strong>programas</strong> da área inferior para os <strong>blocos de memória</strong>.</p>
              <p>2. Um programa só cabe em um bloco se o bloco tiver tamanho <strong>≥</strong> ao programa.</p>
              <p>3. Blocos em <strong>cinza</strong> estão ocupados pelo sistema e não podem ser usados.</p>
              <p>4. Clique em um programa já alocado para <strong>devolvê-lo</strong>.</p>
              <p>5. Aloque todos os programas e clique em <strong>CONFIRMAR</strong>.</p>
            </div>
          )}
          {helpTab === 1 && (
            <div className="ram-help-content">
              <p><strong>Alocação de Memória</strong> é como o SO distribui a RAM entre os processos em execução.</p>
              <p>O algoritmo <strong>First Fit</strong> aloca no primeiro bloco livre suficientemente grande.</p>
              <p><strong>Fragmentação</strong> ocorre quando sobram blocos pequenos demais para qualquer programa.</p>
              <p>A RAM é <strong>volátil</strong>: perde os dados ao desligar. Por isso o SO precisa realocar tudo ao iniciar.</p>
              <p>Gerenciar bem a memória evita <strong>travamentos</strong> e erros de "memória insuficiente".</p>
            </div>
          )}
        </div>
      )}

      {/* Memória */}
      <div className="ram-section-label">MEMÓRIA RAM — {profile.total} MB</div>
      <div className="ram-memory">
        {BLOCKS.map(block => {
          const allocProg = allocations[block.id]
            ? PROGRAMS.find(p => p.id === allocations[block.id])
            : null
          const isReject = rejects[block.id]
          const pct = (block.size / profile.total) * 100

          return (
            <div
              key={block.id}
              className={`ram-block ${block.locked ? 'locked' : ''} ${allocProg ? 'filled' : 'empty'} ${isReject ? 'reject' : ''}`}
              style={{ '--pct': `${pct}%`, '--prog-color': allocProg?.color }}
              onDragOver={e => { if (!block.locked && !allocProg) e.preventDefault() }}
              onDrop={() => handleDrop(block.id)}
            >
              <span className="ram-block-size">{block.size}MB</span>
              {block.locked && <span className="ram-block-label">{block.label}</span>}
              {allocProg && (
                <button className="ram-block-prog" onClick={() => removeAllocation(block.id)}
                  style={{ background: allocProg.color }}>
                  {allocProg.name}
                  <span className="ram-block-prog-size">{allocProg.size}MB</span>
                </button>
              )}
              {!block.locked && !allocProg && (
                <span className="ram-block-free">LIVRE</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Gabarito */}
      <div className="ram-answer-bar">
        <button className="ram-peek-btn" onClick={handlePeek}>
          {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
        </button>
        {peeked && !showAnswer && <span className="ram-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
      </div>

      {showAnswer && (
        <div className="ram-answer">
          {ANSWER.map(a => (
            <div key={a.block} className="ram-answer-row">
              <span className="ram-answer-block">{a.block.toUpperCase()}</span>
              <span className="ram-answer-arrow">→</span>
              <span className="ram-answer-prog">{a.program}</span>
            </div>
          ))}
        </div>
      )}

      {/* Programas disponíveis */}
      <div className="ram-section-label">
        PROGRAMAS
        <span className="ram-prog-count">{allocatedPrograms.size}/{PROGRAMS.length} alocados</span>
      </div>
      <div className="ram-programs">
        {freePrograms.length === 0
          ? <span className="ram-empty">— todos os programas foram alocados —</span>
          : freePrograms.map(p => (
            <div
              key={p.id}
              className="ram-program"
              style={{ borderColor: p.color, color: p.color }}
              draggable
              onDragStart={() => setDragging(p.id)}
              onDragEnd={() => setDragging(null)}
            >
              <span className="ram-prog-name">{p.name}</span>
              <span className="ram-prog-size">{p.size}MB</span>
            </div>
          ))
        }
      </div>

      <div className="ram-actions">
        <button className="ram-btn reset" onClick={() => setAllocations({})}>↺ RESETAR</button>
        <button
          className={`ram-btn confirm ${submitted ? 'ok' : ''}`}
          onClick={handleSubmit}
          disabled={!allAllocated || submitted}
        >
          ✓ CONFIRMAR
        </button>
      </div>
    </div>
  )
}
