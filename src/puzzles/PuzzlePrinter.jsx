import { useState } from 'react'
import { useGameAudio } from '../audio/useGameAudio'
import './PuzzlePrinter.css'

// ── Fase 1: ordenar por prioridade (1=alta) e desempatar por páginas ──
const DOCS_P1 = [
  { id: 'manual',    name: 'manual_tecnico.pdf',  pages: 120, priority: 3, icon: '📚' },
  { id: 'memo',      name: 'memorando.docx',      pages:   2, priority: 2, icon: '📝' },
  { id: 'relatorio', name: 'relatorio_anual.pdf', pages:  48, priority: 1, icon: '📊' },
  { id: 'foto',      name: 'foto_perfil.png',     pages:   1, priority: 2, icon: '🖼️' },
  { id: 'planilha',  name: 'orcamento.xlsx',      pages:   8, priority: 1, icon: '📋' },
  { id: 'contrato',  name: 'contrato.pdf',        pages:  15, priority: 3, icon: '📄' },
]
// Regra: prioridade 1 > 2 > 3; empate → menor páginas primeiro
const ORDER_P1 = [...DOCS_P1]
  .sort((a, b) => a.priority !== b.priority ? a.priority - b.priority : a.pages - b.pages)
  .map(d => d.id)

// ── Fase 2: fila já ordenada + job urgente que chega ──
// A fila começa com 5 docs já em ordem correta; o job urgente deve ser inserido na posição certa
const QUEUE_P2_BASE = [
  { id: 'planilha',  name: 'orcamento.xlsx',      pages:  8, priority: 1, icon: '📋' },
  { id: 'relatorio', name: 'relatorio_anual.pdf', pages: 48, priority: 1, icon: '📊' },
  { id: 'foto',      name: 'foto_perfil.png',     pages:  1, priority: 2, icon: '🖼️' },
  { id: 'memo',      name: 'memorando.docx',      pages:  2, priority: 2, icon: '📝' },
  { id: 'manual',    name: 'manual_tecnico.pdf',  pages: 120, priority: 3, icon: '📚' },
]
const URGENT = { id: 'urgent', name: 'URGENTE_sistema.pdf', pages: 5, priority: 1, icon: '🚨' }
// Posição correta: prioridade 1, 5p < planilha(8p) → vem antes de todos → índice 0
const URGENT_CORRECT_IDX = 0

const PEEK_PENALTY = 30
const WRONG_PENALTY = 20
const TABS = ['COMO JOGAR', 'TEORIA']

const PRINT_STEPS = ['Enviando para spooler...', 'Processando PDL...', 'Imprimindo...', 'Concluído ✓']

const PRIORITY_LABEL = { 1: 'ALTA', 2: 'MÉDIA', 3: 'BAIXA' }
const PRIORITY_COLOR = { 1: 'pri-high', 2: 'pri-mid', 3: 'pri-low' }

export default function PuzzlePrinter({ onSuccess, onFail, timerRef }) {
  const { playWrong } = useGameAudio()
  const [phase, setPhase]           = useState(1)

  // Fase 1
  const [queue1, setQueue1]         = useState([...DOCS_P1])
  const [dragging1, setDragging1]   = useState(null)
  const [dragOver1, setDragOver1]   = useState(null)
  const [wrongFlash1, setWrongFlash1] = useState(false)

  // Fase 2
  const [queue2, setQueue2]         = useState([...QUEUE_P2_BASE])
  const [urgentPlaced, setUrgentPlaced] = useState(false)
  const [draggingUrgent, setDraggingUrgent] = useState(false)
  const [dragOver2, setDragOver2]   = useState(null)
  const [wrongFlash2, setWrongFlash2] = useState(false)

  // Impressão
  const [printing, setPrinting]     = useState(false)
  const [printStep, setPrintStep]   = useState(0)

  // Ajuda / gabarito
  const [helpOpen, setHelpOpen]     = useState(false)
  const [helpTab, setHelpTab]       = useState(0)
  const [peeked, setPeeked]         = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  // ── Fase 1: drag & drop ───────────────────────────────────
  function drop1(targetId) {
    if (!dragging1 || dragging1 === targetId) { setDragOver1(null); return }
    setQueue1(prev => {
      const next = [...prev]
      const fi = next.findIndex(d => d.id === dragging1)
      const ti = next.findIndex(d => d.id === targetId)
      const [item] = next.splice(fi, 1)
      next.splice(ti, 0, item)
      return next
    })
    setDragging1(null); setDragOver1(null)
  }

  function confirmPhase1() {
    const ok = queue1.every((d, i) => d.id === ORDER_P1[i])
    if (!ok) {
      playWrong()
      setWrongFlash1(true)
      setTimeout(() => setWrongFlash1(false), 700)
      timerRef?.current?.addPenalty(WRONG_PENALTY)
      return
    }
    setPhase(2)
  }

  // ── Fase 2: inserir job urgente ───────────────────────────
  function dropUrgent(targetIdx) {
    if (!draggingUrgent) return
    // Insere antes do targetIdx
    setQueue2(prev => {
      const next = [...prev]
      next.splice(targetIdx, 0, URGENT)
      return next
    })
    setUrgentPlaced(true)
    setDraggingUrgent(false)
    setDragOver2(null)
  }

  function removeUrgent() {
    if (!urgentPlaced) return
    setQueue2(prev => prev.filter(d => d.id !== 'urgent'))
    setUrgentPlaced(false)
  }

  function confirmPhase2() {
    const idx = queue2.findIndex(d => d.id === 'urgent')
    if (idx !== URGENT_CORRECT_IDX) {
      playWrong()
      setWrongFlash2(true)
      setTimeout(() => setWrongFlash2(false), 700)
      timerRef?.current?.addPenalty(WRONG_PENALTY)
      return
    }
    setPrinting(true)
    let step = 0
    const iv = setInterval(() => {
      step++
      if (step < PRINT_STEPS.length) setPrintStep(step)
      else { clearInterval(iv); setTimeout(() => onSuccess(), 400) }
    }, 500)
  }

  function handlePeek() {
    if (!peeked) { timerRef?.current?.addPenalty(PEEK_PENALTY); setPeeked(true) }
    setShowAnswer(a => !a)
  }

  const correctP1 = [...DOCS_P1].sort((a, b) =>
    a.priority !== b.priority ? a.priority - b.priority : a.pages - b.pages
  )

  return (
    <div className="prt-puzzle">

      {/* Ajuda */}
      <div className="prt-help-bar">
        <button className="prt-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="prt-help-panel">
          <div className="prt-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`prt-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="prt-help-content">
              {phase === 1 ? <>
                <p>1. Ordene a fila pela <strong>prioridade</strong> (ALTA → MÉDIA → BAIXA).</p>
                <p>2. Jobs com a <strong>mesma prioridade</strong>: menor nº de páginas primeiro (SJF).</p>
                <p>3. Clique em <strong>CONFIRMAR FILA</strong> para validar. Erro custa <strong>+{WRONG_PENALTY}s</strong>.</p>
              </> : <>
                <p>1. Um job urgente chegou. <strong>Arraste-o</strong> para a posição correta na fila.</p>
                <p>2. Respeite a regra: prioridade ALTA, desempate por páginas.</p>
                <p>3. Clique no job urgente já inserido para <strong>removê-lo</strong> e reposicionar.</p>
                <p>4. Clique em <strong>IMPRIMIR</strong> para validar. Erro custa <strong>+{WRONG_PENALTY}s</strong>.</p>
              </>}
            </div>
          )}
          {helpTab === 1 && (
            <div className="prt-help-content">
              <p>O SO gerencia a impressora via <strong>spooler</strong> — fila de jobs em disco.</p>
              <p><strong>Prioridade</strong> define qual job é processado primeiro independente do tamanho.</p>
              <p><strong>SJF</strong> (Shortest Job First) desempata jobs de mesma prioridade pelo menor tempo estimado.</p>
              <p>Jobs <strong>urgentes</strong> podem ser inseridos no meio da fila sem cancelar os anteriores.</p>
            </div>
          )}
        </div>
      )}

      {/* Progresso de fases */}
      <div className="prt-phases">
        {[1, 2].map(n => (
          <div key={n} className={`prt-phase-dot ${n < phase ? 'done' : n === phase ? 'active' : ''}`}>
            {n < phase ? '✓' : n}
          </div>
        ))}
        <span className="prt-phase-label">
          {phase === 1 ? 'FASE 1 — ORDENE POR PRIORIDADE + SJF' : 'FASE 2 — INSIRA O JOB URGENTE'}
        </span>
      </div>

      {/* Gabarito */}
      <div className="prt-answer-bar">
        <button className="prt-peek-btn" onClick={handlePeek}>
          {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
        </button>
        {peeked && !showAnswer && <span className="prt-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
      </div>
      {showAnswer && phase === 1 && (
        <div className="prt-answer">
          {correctP1.map((d, i) => (
            <span key={d.id} className="prt-answer-row">
              {i + 1}. {d.icon} {d.name}
              <span className={`prt-answer-pri ${PRIORITY_COLOR[d.priority]}`}>{PRIORITY_LABEL[d.priority]}</span>
              <span className="prt-answer-pages">{d.pages}p</span>
            </span>
          ))}
        </div>
      )}
      {showAnswer && phase === 2 && (
        <div className="prt-answer">
          <span className="prt-answer-row">
            🚨 URGENTE_sistema.pdf → <strong>posição 1</strong>
          </span>
          <span className="prt-answer-row" style={{color:'#91BED4', fontSize:'7px'}}>
            Prioridade ALTA · 5p &lt; planilha(8p) → urgente vem primeiro na fila
          </span>
        </div>
      )}

      <div className="prt-body">

        {/* ── FASE 1 ── */}
        {phase === 1 && (
          <>
            <div className="prt-queue">
              <div className="prt-queue-header">
                <span>FILA DE IMPRESSÃO</span>
                <span className="prt-queue-rule">PRIORIDADE → PÁGINAS</span>
              </div>
              {queue1.map((doc, i) => (
                <div
                  key={doc.id}
                  className={[
                    'prt-doc',
                    dragging1 === doc.id ? 'dragging' : '',
                    dragOver1 === doc.id ? 'drag-over' : '',
                    wrongFlash1 ? 'wrong' : '',
                  ].join(' ')}
                  draggable
                  onDragStart={() => setDragging1(doc.id)}
                  onDragEnd={() => { setDragging1(null); setDragOver1(null) }}
                  onDragOver={e => { e.preventDefault(); if (doc.id !== dragging1) setDragOver1(doc.id) }}
                  onDrop={() => drop1(doc.id)}
                >
                  <span className="prt-doc-pos">{i + 1}</span>
                  <span className="prt-doc-icon">{doc.icon}</span>
                  <span className="prt-doc-name">{doc.name}</span>
                  <span className={`prt-doc-pri ${PRIORITY_COLOR[doc.priority]}`}>{PRIORITY_LABEL[doc.priority]}</span>
                  <span className="prt-doc-pages">{doc.pages}p</span>
                  <span className="prt-doc-drag">⠿</span>
                </div>
              ))}
              <button className="prt-confirm-btn" onClick={confirmPhase1}>
                CONFIRMAR FILA →
              </button>
            </div>

            <div className="prt-printer-col">
              <div className={`prt-printer ${wrongFlash1 ? 'error' : ''}`}>
                <div className="prt-printer-top">
                  <div className="prt-printer-slot" />
                  <div className={`prt-printer-led ${wrongFlash1 ? 'red' : ''}`} />
                </div>
                <div className="prt-printer-body">
                  <div className="prt-printer-brand">🖨 DINOPRINT</div>
                  <div className="prt-printer-status">
                    {wrongFlash1 ? '⚠ ORDEM INCORRETA' : 'AGUARDANDO FILA...'}
                  </div>
                </div>
              </div>
              <div className="prt-legend">
                <div className="prt-legend-row"><span className="prt-doc-pri pri-high">ALTA</span> prioridade 1</div>
                <div className="prt-legend-row"><span className="prt-doc-pri pri-mid">MÉDIA</span> prioridade 2</div>
                <div className="prt-legend-row"><span className="prt-doc-pri pri-low">BAIXA</span> prioridade 3</div>
              </div>
            </div>
          </>
        )}

        {/* ── FASE 2 ── */}
        {phase === 2 && (
          <>
            <div className="prt-queue">
              <div className="prt-queue-header">
                <span>FILA ATUAL</span>
                <span className="prt-queue-rule">ARRASTE O JOB URGENTE</span>
              </div>

              {/* Zona de drop antes do índice 0 */}
              <div
                className={`prt-drop-zone ${dragOver2 === -1 ? 'active' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver2(-1) }}
                onDragLeave={() => setDragOver2(null)}
                onDrop={() => { dropUrgent(0); setDragOver2(null) }}
              >
                ↓ inserir aqui
              </div>

              {queue2.map((doc, i) => (
                <div key={doc.id}>
                  <div
                    className={[
                      'prt-doc',
                      doc.id === 'urgent' ? 'urgent' : '',
                      wrongFlash2 && doc.id === 'urgent' ? 'wrong' : '',
                    ].join(' ')}
                    onClick={doc.id === 'urgent' ? removeUrgent : undefined}
                    style={doc.id === 'urgent' ? { cursor: 'pointer' } : {}}
                  >
                    <span className="prt-doc-pos">{i + 1}</span>
                    <span className="prt-doc-icon">{doc.icon}</span>
                    <span className="prt-doc-name">{doc.name}</span>
                    <span className={`prt-doc-pri ${PRIORITY_COLOR[doc.priority]}`}>{PRIORITY_LABEL[doc.priority]}</span>
                    <span className="prt-doc-pages">{doc.pages}p</span>
                    {doc.id === 'urgent' && <span className="prt-doc-remove">✕</span>}
                  </div>
                  {/* Zona de drop após cada item */}
                  {doc.id !== 'urgent' && (
                    <div
                      className={`prt-drop-zone ${dragOver2 === i ? 'active' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver2(i) }}
                      onDragLeave={() => setDragOver2(null)}
                      onDrop={() => { dropUrgent(i + 1); setDragOver2(null) }}
                    >
                      ↓ inserir aqui
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="prt-printer-col">
              {/* Job urgente para arrastar */}
              {!urgentPlaced && (
                <div
                  className="prt-doc urgent prt-urgent-source"
                  draggable
                  onDragStart={() => setDraggingUrgent(true)}
                  onDragEnd={() => setDraggingUrgent(false)}
                >
                  <span className="prt-doc-icon">🚨</span>
                  <div className="prt-urgent-info">
                    <span className="prt-doc-name">URGENTE_sistema.pdf</span>
                    <span className="prt-urgent-sub">prioridade ALTA · 5p</span>
                  </div>
                  <span className="prt-doc-drag">⠿</span>
                </div>
              )}

              <div className={`prt-printer ${printing ? 'active' : ''} ${wrongFlash2 ? 'error' : ''}`}>
                <div className="prt-printer-top">
                  <div className="prt-printer-slot" />
                  <div className={`prt-printer-led ${printing ? 'blink' : ''} ${wrongFlash2 ? 'red' : ''}`} />
                </div>
                <div className="prt-printer-body">
                  <div className="prt-printer-brand">🖨 DINOPRINT</div>
                  <div className="prt-printer-status">
                    {printing ? PRINT_STEPS[printStep] : wrongFlash2 ? '⚠ POSIÇÃO ERRADA' : 'AGUARDANDO...'}
                  </div>
                </div>
                {printing && <div className="prt-paper-out"><div className="prt-paper" /></div>}
              </div>

              <button
                className="prt-print-btn"
                onClick={confirmPhase2}
                disabled={!urgentPlaced || printing}
              >
                {printing ? '⏳ IMPRIMINDO...' : '🖨 IMPRIMIR'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
