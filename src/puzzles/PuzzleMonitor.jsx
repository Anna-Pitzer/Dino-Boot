import { useState } from 'react'
import './PuzzleMonitor.css'

// Especificações do monitor alvo
const MONITOR = {
  brand:       'DinoView Pro',
  panel:       'IPS',
  resolution:  '1920×1080',
  refreshRate: '144Hz',
  orientation: 'Paisagem',
}

const PHASES = [
  {
    label:    'FASE 1 — RESOLUÇÃO',
    hint:     `O monitor suporta até ${MONITOR.resolution}. Selecione a resolução correta.`,
    options: [
      { id: 'a', label: '3840×2160', correct: false, distort: 'scale-up'   },
      { id: 'b', label: '1920×1080', correct: true,  distort: 'none'       },
      { id: 'c', label: '1280×720',  correct: false, distort: 'scale-down' },
      { id: 'd', label: '800×600',   correct: false, distort: 'pixelated'  },
    ],
  },
  {
    label:    'FASE 2 — TAXA DE ATUALIZAÇÃO',
    hint:     `O monitor opera a ${MONITOR.refreshRate}. Selecione a taxa correta.`,
    options: [
      { id: 'a', label: '60Hz',  correct: false, distort: 'flicker'  },
      { id: 'b', label: '240Hz', correct: false, distort: 'blur'     },
      { id: 'c', label: '144Hz', correct: true,  distort: 'none'     },
      { id: 'd', label: '30Hz',  correct: false, distort: 'stutter'  },
    ],
  },
  {
    label:    'FASE 3 — ORIENTAÇÃO',
    hint:     `O monitor deve operar em modo ${MONITOR.orientation}. Selecione a orientação correta.`,
    options: [
      { id: 'a', label: 'Paisagem',         correct: true,  distort: 'none'    },
      { id: 'b', label: 'Retrato',          correct: false, distort: 'rotated' },
      { id: 'c', label: 'Paisagem invertida', correct: false, distort: 'flipped' },
      { id: 'd', label: 'Retrato invertido', correct: false, distort: 'rotated-flip' },
    ],
  },
]

const PEEK_PENALTY = 30
const WRONG_PENALTY = 15
const TABS = ['COMO JOGAR', 'TEORIA']

// Conteúdo do preview — linhas de "tela"
const PREVIEW_LINES = [
  { w: '70%', h: 8,  top: 12 },
  { w: '50%', h: 6,  top: 28 },
  { w: '85%', h: 6,  top: 42 },
  { w: '40%', h: 6,  top: 56 },
  { w: '60%', h: 6,  top: 70 },
]

export default function PuzzleMonitor({ onSuccess, onFail, timerRef }) {
  const [phase, setPhase]           = useState(0)
  const [selected, setSelected]     = useState(null)
  const [confirmed, setConfirmed]   = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)

  const [helpOpen, setHelpOpen]     = useState(false)
  const [helpTab, setHelpTab]       = useState(0)
  const [peeked, setPeeked]         = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const current = PHASES[phase]
  const selectedOpt = current.options.find(o => o.id === selected)

  function handleSelect(opt) {
    if (confirmed) return
    setSelected(opt.id)
  }

  function handleConfirm() {
    if (!selected || confirmed) return
    const opt = current.options.find(o => o.id === selected)

    if (!opt.correct) {
      setWrongFlash(true)
      setTimeout(() => setWrongFlash(false), 700)
      timerRef?.current?.addPenalty(WRONG_PENALTY)
      setSelected(null)
      return
    }

    setConfirmed(true)
    setTimeout(() => {
      setConfirmed(false)
      setSelected(null)
      if (phase < PHASES.length - 1) {
        setPhase(p => p + 1)
      } else {
        onSuccess()
      }
    }, 800)
  }

  function handlePeek() {
    if (!peeked) {
      timerRef?.current?.addPenalty(PEEK_PENALTY)
      setPeeked(true)
    }
    setShowAnswer(a => !a)
  }

  return (
    <div className="mon-puzzle">

      {/* Ajuda */}
      <div className="mon-help-bar">
        <button className="mon-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="mon-help-panel">
          <div className="mon-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`mon-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="mon-help-content">
              <p>1. Leia as <strong>especificações do monitor</strong> no painel esquerdo.</p>
              <p>2. Clique em uma opção para ver o <strong>preview</strong> de como a tela ficaria.</p>
              <p>3. Selecione a opção <strong>compatível</strong> e clique em CONFIRMAR.</p>
              <p>4. Opção errada custa <strong>+{WRONG_PENALTY}s</strong> de penalidade.</p>
              <p>5. São <strong>3 fases</strong>: resolução, taxa de atualização e orientação.</p>
            </div>
          )}
          {helpTab === 1 && (
            <div className="mon-help-content">
              <p><strong>Resolução</strong> define quantos pixels são exibidos (largura × altura).</p>
              <p><strong>Taxa de atualização</strong> (Hz) indica quantos frames por segundo o monitor pode exibir. Taxas baixas causam flickering.</p>
              <p>O driver de vídeo negocia com o monitor via <strong>EDID</strong> (Extended Display Identification Data) para descobrir as capacidades suportadas.</p>
              <p><strong>Orientação</strong> é configurada pelo SO e pode ser rotacionada via driver para monitores verticais.</p>
            </div>
          )}
        </div>
      )}

      {/* Progresso de fases */}
      <div className="mon-phases">
        {PHASES.map((p, i) => (
          <div key={i} className={`mon-phase-dot ${i < phase ? 'done' : i === phase ? 'active' : ''}`}>
            {i < phase ? '✓' : i + 1}
          </div>
        ))}
        <span className="mon-phase-label">{current.label}</span>
      </div>

      {/* Gabarito */}
      <div className="mon-answer-bar">
        <button className="mon-peek-btn" onClick={handlePeek}>
          {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
        </button>
        {peeked && !showAnswer && <span className="mon-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
      </div>
      {showAnswer && (
        <div className="mon-answer">
          {PHASES.map((p, i) => (
            <span key={i} className="mon-answer-row">
              {i + 1}. {p.options.find(o => o.correct).label}
            </span>
          ))}
        </div>
      )}

      <div className="mon-body">

        {/* Painel esquerdo — specs + opções */}
        <div className="mon-left">
          <div className="mon-specs">
            <div className="mon-spec-title">📺 {MONITOR.brand}</div>
            <div className="mon-spec-row"><span>Painel</span><span>{MONITOR.panel}</span></div>
            <div className="mon-spec-row"><span>Resolução</span><span>{MONITOR.resolution}</span></div>
            <div className="mon-spec-row"><span>Taxa</span><span>{MONITOR.refreshRate}</span></div>
            <div className="mon-spec-row"><span>Orientação</span><span>{MONITOR.orientation}</span></div>
          </div>

          <div className="mon-hint">{current.hint}</div>

          <div className="mon-options">
            {current.options.map(opt => (
              <button
                key={opt.id}
                className={[
                  'mon-option',
                  selected === opt.id ? 'selected' : '',
                  confirmed && opt.correct ? 'correct' : '',
                  wrongFlash && selected === opt.id ? 'wrong' : '',
                ].join(' ')}
                onClick={() => handleSelect(opt)}
                disabled={confirmed}
              >
                <span className="mon-opt-id">{opt.id.toUpperCase()}</span>
                <span className="mon-opt-label">{opt.label}</span>
              </button>
            ))}
          </div>

          <button
            className="mon-confirm-btn"
            onClick={handleConfirm}
            disabled={!selected || confirmed}
          >
            {confirmed ? '✓ CORRETO!' : 'CONFIRMAR →'}
          </button>
        </div>

        {/* Painel direito — preview */}
        <div className="mon-right">
          <div className="mon-monitor-frame">
            <div className={[
              'mon-screen',
              selectedOpt ? `distort-${selectedOpt.distort}` : '',
              wrongFlash ? 'flash-red' : '',
              confirmed ? 'flash-green' : '',
            ].join(' ')}>
              {/* Barra de título */}
              <div className="mon-screen-bar">
                <span className="mon-screen-dot red" />
                <span className="mon-screen-dot yellow" />
                <span className="mon-screen-dot green" />
                <span className="mon-screen-title">DINOBOOT OS</span>
              </div>
              {/* Conteúdo simulado */}
              <div className="mon-screen-content">
                {PREVIEW_LINES.map((l, i) => (
                  <div key={i} className="mon-screen-line" style={{ width: l.w, height: l.h, marginTop: i === 0 ? 0 : 6 }} />
                ))}
                <div className="mon-screen-icon">🦕</div>
              </div>
              {/* Label de distorção */}
              {selectedOpt && selectedOpt.distort !== 'none' && (
                <div className="mon-distort-label">{distortLabel(selectedOpt.distort)}</div>
              )}
            </div>
            <div className="mon-monitor-stand" />
            <div className="mon-monitor-base" />
          </div>
          <div className="mon-preview-caption">
            {selectedOpt
              ? selectedOpt.correct
                ? '✓ Configuração compatível'
                : `⚠ ${distortLabel(selectedOpt.distort)}`
              : 'Selecione uma opção para ver o preview'
            }
          </div>
        </div>

      </div>
    </div>
  )
}

function distortLabel(distort) {
  const map = {
    'scale-up':      'Resolução acima do suportado — imagem cortada',
    'scale-down':    'Resolução abaixo do nativo — imagem borrada',
    'pixelated':     'Resolução muito baixa — pixels visíveis',
    'flicker':       'Taxa baixa — flickering visível',
    'blur':          'Taxa acima do suportado — artefatos',
    'stutter':       'Taxa muito baixa — stutter severo',
    'rotated':       'Orientação incorreta — tela girada 90°',
    'flipped':       'Orientação invertida — tela de cabeça para baixo',
    'rotated-flip':  'Orientação incorreta — girada e invertida',
  }
  return map[distort] ?? distort
}
