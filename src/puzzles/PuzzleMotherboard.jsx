import { useState } from 'react'
import { useGameAudio } from '../audio/useGameAudio'
import './PuzzleMotherboard.css'

const COMPONENTS = [
  { id: 'cpu',  name: 'CPU',  icon: '🧠', color: '#F26101' },
  { id: 'ram',  name: 'RAM',  icon: '💾', color: '#91BED4' },
  { id: 'gpu',  name: 'GPU',  icon: '🎮', color: '#a855f7' },
  { id: 'ssd',  name: 'SSD',  icon: '💿', color: '#4caf50' },
]

const SLOTS = [
  { id: 'slot-cpu', label: 'SOCKET LGA1700',  accepts: 'cpu',  hint: 'Processador principal' },
  { id: 'slot-ram', label: 'DDR5 DIMM A1',    accepts: 'ram',  hint: 'Memória volátil' },
  { id: 'slot-gpu', label: 'PCIe x16 SLOT 1', accepts: 'gpu',  hint: 'Placa de vídeo' },
  { id: 'slot-ssd', label: 'M.2 NVMe SLOT',   accepts: 'ssd',  hint: 'Armazenamento rápido' },
]

const PEEK_PENALTY = 30
const TABS = ['COMO JOGAR', 'TEORIA']

export default function PuzzleMotherboard({ onSuccess, onFail, timerRef }) {
  const { playWrong } = useGameAudio()
  const [slots, setSlots]           = useState({}) // slotId → componentId
  const [dragging, setDragging]     = useState(null)
  const [rejects, setRejects]       = useState({})
  const [corrects, setCorrects]     = useState({})
  const [helpOpen, setHelpOpen]     = useState(false)
  const [helpTab, setHelpTab]       = useState(0)
  const [peeked, setPeeked]         = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [confirmed, setConfirmed]   = useState(false)

  const placedComponents = new Set(Object.values(slots))
  const freeComponents   = COMPONENTS.filter(c => !placedComponents.has(c.id))
  const allFilled        = SLOTS.every(s => slots[s.id])

  function handleDrop(e, slotId) {
    e.preventDefault()
    if (!dragging || slots[slotId]) return

    const slot = SLOTS.find(s => s.id === slotId)
    const comp = COMPONENTS.find(c => c.id === dragging)

    if (slot.accepts !== comp.id) {
      playWrong()
      setRejects(r => ({ ...r, [slotId]: true }))
      timerRef?.current?.addPenalty(15)
      setTimeout(() => setRejects(r => { const n = { ...r }; delete n[slotId]; return n }), 700)
      setDragging(null)
      return
    }

    setSlots(s => ({ ...s, [slotId]: comp.id }))
    setCorrects(c => ({ ...c, [slotId]: true }))
    setDragging(null)
  }

  function removeFromSlot(slotId) {
    const compId = slots[slotId]
    if (!compId) return
    setSlots(s => { const n = { ...s }; delete n[slotId]; return n })
    setCorrects(c => { const n = { ...c }; delete n[slotId]; return n })
  }

  function handleConfirm() {
    setConfirmed(true)
    setTimeout(() => onSuccess(), 900)
  }

  function handlePeek() {
    if (!peeked) {
      timerRef?.current?.addPenalty(PEEK_PENALTY)
      setPeeked(true)
    }
    setShowAnswer(a => !a)
  }

  return (
    <div className="mb-puzzle">

      {/* Ajuda */}
      <div className="mb-help-bar">
        <button className="mb-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="mb-help-panel">
          <div className="mb-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`mb-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="mb-help-content">
              <p>1. Veja os <strong>componentes</strong> disponíveis na área inferior.</p>
              <p>2. Leia os <strong>nomes dos slots</strong> na placa-mãe para identificar qual componente pertence a cada um.</p>
              <p>3. <strong>Arraste</strong> cada componente para o slot correto.</p>
              <p>4. Encaixe errado causa <strong>+15s</strong> de penalidade.</p>
              <p>5. Clique em um componente já encaixado para <strong>removê-lo</strong>.</p>
              <p>6. Com todos encaixados, clique em <strong>LIGAR</strong>.</p>
            </div>
          )}
          {helpTab === 1 && (
            <div className="mb-help-content">
              <p>A <strong>placa-mãe</strong> é o circuito central que conecta todos os componentes do computador.</p>
              <p>O <strong>socket LGA1700</strong> é o encaixe físico da CPU — cada geração tem um socket diferente.</p>
              <p>Os slots <strong>DDR5 DIMM</strong> são para memória RAM — a geração do slot deve ser compatível com a RAM.</p>
              <p>O slot <strong>PCIe x16</strong> é usado pela GPU — oferece alta largura de banda para dados gráficos.</p>
              <p>O slot <strong>M.2 NVMe</strong> conecta SSDs modernos diretamente ao barramento PCIe, sem cabo.</p>
            </div>
          )}
        </div>
      )}

      {/* Gabarito */}
      <div className="mb-answer-bar">
        <button className="mb-peek-btn" onClick={handlePeek}>
          {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
        </button>
        {peeked && !showAnswer && <span className="mb-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
      </div>
      {showAnswer && (
        <div className="mb-answer">
          {SLOTS.map(s => {
            const comp = COMPONENTS.find(c => c.id === s.accepts)
            return (
              <div key={s.id} className="mb-answer-row">
                <span className="mb-answer-slot">{s.label}</span>
                <span className="mb-answer-arrow">→</span>
                <span className="mb-answer-comp" style={{ color: comp.color }}>{comp.icon} {comp.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Placa-mãe */}
      <div className="mb-section-label">PLACA-MÃE</div>
      <div className="mb-board">
        {/* Decoração visual da placa */}
        <div className="mb-board-bg">
          <div className="mb-board-chip">BIOS</div>
          <div className="mb-board-chip small">VRM</div>
          <div className="mb-board-chip small">PWR</div>
        </div>

        <div className="mb-slots">
          {SLOTS.map(slot => {
            const comp     = slots[slot.id] ? COMPONENTS.find(c => c.id === slots[slot.id]) : null
            const isReject = rejects[slot.id]
            const isOk     = corrects[slot.id]

            return (
              <div
                key={slot.id}
                className={`mb-slot ${isReject ? 'reject' : ''} ${isOk ? 'ok' : ''} ${confirmed && isOk ? 'confirmed' : ''}`}
                onDragOver={e => { if (!comp) e.preventDefault() }}
                onDrop={e => handleDrop(e, slot.id)}
              >
                <div className="mb-slot-label">{slot.label}</div>
                <div className="mb-slot-hint">{slot.hint}</div>
                <div className="mb-slot-bay">
                  {comp
                    ? <button
                        className="mb-slot-comp"
                        style={{ borderColor: comp.color, color: comp.color }}
                        onClick={() => !confirmed && removeFromSlot(slot.id)}
                      >
                        <span className="mb-slot-comp-icon">{comp.icon}</span>
                        <span className="mb-slot-comp-name">{comp.name}</span>
                        {!confirmed && <span className="mb-slot-comp-remove">✕</span>}
                      </button>
                    : <span className="mb-slot-empty">solte aqui</span>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Componentes disponíveis */}
      <div className="mb-section-label">
        COMPONENTES
        <span className="mb-count">{placedComponents.size}/{COMPONENTS.length} encaixados</span>
      </div>
      <div className="mb-components">
        {freeComponents.length === 0
          ? <span className="mb-empty">— todos os componentes foram encaixados —</span>
          : freeComponents.map(comp => (
            <div
              key={comp.id}
              className="mb-component"
              style={{ borderColor: comp.color }}
              draggable
              onDragStart={() => setDragging(comp.id)}
              onDragEnd={() => setDragging(null)}
            >
              <span className="mb-comp-icon">{comp.icon}</span>
              <span className="mb-comp-name" style={{ color: comp.color }}>{comp.name}</span>
            </div>
          ))
        }
      </div>

      <div className="mb-actions">
        <button className="mb-btn reset" onClick={() => { setSlots({}); setCorrects({}) }} disabled={confirmed}>
          ↺ RESETAR
        </button>
        <button
          className={`mb-btn confirm ${confirmed ? 'ok' : ''}`}
          onClick={handleConfirm}
          disabled={!allFilled || confirmed}
        >
          ⚡ LIGAR
        </button>
      </div>
    </div>
  )
}
