import { useState } from 'react'
import './PuzzleCPU.css'

const QUANTUM = 2

const PROCESSES = [
  { id: 'A', burst: 4, color: '#F26101' },
  { id: 'B', burst: 2, color: '#91BED4' },
  { id: 'C', burst: 6, color: '#a855f7' },
  { id: 'D', burst: 3, color: '#4caf50' },
  { id: 'E', burst: 2, color: '#f5c518' },
]

function calcRoundRobin(processes, quantum) {
  const queue = processes.map(p => ({ ...p, remaining: p.burst }))
  const order = []
  let i = 0
  while (queue.some(p => p.remaining > 0)) {
    const p = queue[i % queue.length]
    if (p.remaining > 0) {
      const run = Math.min(p.remaining, quantum)
      for (let t = 0; t < run; t++) order.push(p.id)
      p.remaining -= run
    }
    i++
  }
  return order
}

const CORRECT = calcRoundRobin(PROCESSES, QUANTUM)

function buildTokens() {
  const tokens = []
  PROCESSES.forEach(p => {
    for (let i = 0; i < p.burst; i++) {
      tokens.push({ key: `${p.id}-${i}`, id: p.id, color: p.color })
    }
  })
  return tokens
}

const TABS = ['COMO JOGAR', 'TEORIA']
const PEEK_PENALTY = 30

export default function PuzzleCPU({ onSuccess, onFail, timerRef }) {
  const [available, setAvailable] = useState(buildTokens)
  const [queue, setQueue]         = useState([])
  const [result, setResult]       = useState(null)
  const [dragSrc, setDragSrc]     = useState(null)
  const [helpOpen, setHelpOpen]   = useState(false)
  const [helpTab, setHelpTab]     = useState(0)
  const [peeked, setPeeked]       = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const process = p => PROCESSES.find(x => x.id === p)

  /* ── drag handlers ── */
  function onDragStart(from, key) {
    setDragSrc({ from, key })
  }

  function onDropQueue(e) {
    e.preventDefault()
    if (!dragSrc) return
    if (dragSrc.from === 'available') {
      const token = available.find(t => t.key === dragSrc.key)
      if (!token) return
      setAvailable(prev => prev.filter(t => t.key !== dragSrc.key))
      setQueue(prev => [...prev, token])
    }
    setDragSrc(null)
  }

  function onDropAvailable(e) {
    e.preventDefault()
    if (!dragSrc || dragSrc.from !== 'queue') return
    const token = queue.find(t => t.key === dragSrc.key)
    if (!token) return
    setQueue(prev => prev.filter(t => t.key !== dragSrc.key))
    setAvailable(prev => [...prev, token])
    setDragSrc(null)
  }

  function removeFromQueue(key) {
    const token = queue.find(t => t.key === key)
    if (!token) return
    setQueue(prev => prev.filter(t => t.key !== key))
    setAvailable(prev => [...prev, token])
  }

  function handlePeek() {
    if (!peeked) {
      timerRef?.current?.addPenalty(PEEK_PENALTY)
      setPeeked(true)
    }
    setShowAnswer(a => !a)
  }

  /* ── validação ── */
  function handleExecute() {
    const playerSeq = queue.map(t => t.id)
    const ok = playerSeq.length === CORRECT.length &&
               playerSeq.every((v, i) => v === CORRECT[i])
    setResult(ok ? 'ok' : 'fail')
    if (!ok) {
      // penalidade + reseta fila ao errar
      timerRef?.current?.addPenalty(20)
      setTimeout(() => {
        setAvailable(buildTokens())
        setQueue([])
        setResult(null)
        onFail()
      }, 900)
    } else {
      setTimeout(() => onSuccess(), 800)
    }
  }

  function handleReset() {
    setAvailable(buildTokens())
    setQueue([])
    setResult(null)
  }

  return (
    <div className="cpu-puzzle">

      {/* Painel de ajuda */}
      <div className="cpu-help-bar">
        <button className="cpu-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲' : '▼'} {helpOpen ? 'FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="cpu-help-panel">
          <div className="cpu-help-tabs">
            {TABS.map((t, i) => (
              <button
                key={t}
                className={`cpu-help-tab ${helpTab === i ? 'active' : ''}`}
                onClick={() => setHelpTab(i)}
              >{t}</button>
            ))}
          </div>

          {helpTab === 0 && (
            <div className="cpu-help-content">
              <p>1. Leia os processos e seus <strong>burst times</strong> (tempo de execução).</p>
              <p>2. <strong>Arraste</strong> os tokens coloridos para a <strong>FILA DE EXECUÇÃO</strong> na ordem correta do Round Robin.</p>
              <p>3. Cada processo executa no máximo <strong>{QUANTUM} ciclos</strong> por vez antes de ceder a CPU.</p>
              <p>4. Se o processo terminar antes do quantum, ele sai da fila.</p>
              <p>5. Quando a fila estiver completa, clique em <strong>▶ EXECUTAR</strong>.</p>
              <p>6. Clique em um token na fila para <strong>devolvê-lo</strong> aos disponíveis.</p>
            </div>
          )}

          {helpTab === 1 && (
            <div className="cpu-help-content">
              <p><strong>Escalonamento de Processos</strong> é a forma como o SO decide qual processo usa a CPU e por quanto tempo.</p>
              <p><strong>Round Robin</strong> é um algoritmo preemptivo: cada processo recebe uma fatia de tempo (quantum). Se não terminar, volta para o fim da fila.</p>
              <p><strong>Burst time</strong> é o tempo total que um processo precisa de CPU para concluir.</p>
              <p>Round Robin garante <strong>justiça</strong>: nenhum processo fica esperando para sempre.</p>
              <p>Quanto menor o quantum, mais trocas de contexto — maior o overhead. Quanto maior, mais parecido com FIFO.</p>
            </div>
          )}
        </div>
      )}

      <div className="cpu-info">
        <span className="cpu-rule">QUANTUM = {QUANTUM} CICLOS</span>
        <div className="cpu-processes">
          {PROCESSES.map(p => (
            <div key={p.id} className="cpu-proc-badge" style={{ borderColor: p.color, color: p.color }}>
              {p.id} <span>burst={p.burst}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tokens disponíveis */}
      <div className="cpu-section-label">PROCESSOS DISPONÍVEIS</div>
      <div
        className="cpu-available"
        onDragOver={e => e.preventDefault()}
        onDrop={onDropAvailable}
      >
        {available.length === 0
          ? <span className="cpu-empty">— arraste de volta para devolver —</span>
          : available.map(t => (
            <div
              key={t.key}
              className="cpu-token"
              style={{ background: t.color }}
              draggable
              onDragStart={() => onDragStart('available', t.key)}
            >
              {t.id}
            </div>
          ))
        }
      </div>

      {/* Fila montada */}
      <div className="cpu-section-label">
        FILA DE EXECUÇÃO
        <span className="cpu-queue-count">{queue.length}/{CORRECT.length}</span>
      </div>
      <div
        className={`cpu-queue ${result === 'ok' ? 'ok' : result === 'fail' ? 'fail' : ''}`}
        onDragOver={e => e.preventDefault()}
        onDrop={onDropQueue}
      >
        {queue.length === 0
          ? <span className="cpu-empty">← arraste os processos aqui em ordem</span>
          : queue.map((t, idx) => (
            <div
              key={t.key}
              className="cpu-token in-queue"
              style={{ background: t.color }}
              draggable
              onDragStart={() => onDragStart('queue', t.key)}
              onClick={() => removeFromQueue(t.key)}
              title="Clique para remover"
            >
              {t.id}
              <span className="cpu-token-idx">{idx + 1}</span>
            </div>
          ))
        }
      </div>

      {/* Gabarito ocultável */}
      <div className="cpu-answer-bar">
        <button className="cpu-peek-btn" onClick={handlePeek}>
          {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO ${!peeked ? `(+${PEEK_PENALTY}s)` : ''}`}
        </button>
        {peeked && !showAnswer && <span className="cpu-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
      </div>

      {showAnswer && (
        <>
          <div className="cpu-timeline-label">SEQUÊNCIA ESPERADA (Round Robin)</div>
          <div className="cpu-timeline">
            {CORRECT.map((id, i) => {
              const p = process(id)
              return (
                <div key={i} className="cpu-timeline-slot" style={{ borderColor: p.color }}>
                  <span style={{ color: p.color }}>{id}</span>
                  <span className="cpu-timeline-t">t{i + 1}</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="cpu-actions">
        <button className="cpu-btn reset" onClick={handleReset}>↺ RESETAR</button>
        <button
          className="cpu-btn execute"
          onClick={handleExecute}
          disabled={queue.length !== CORRECT.length || !!result}
        >
          ▶ EXECUTAR
        </button>
      </div>
    </div>
  )
}
