import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { useGameAudio } from '../audio/useGameAudio'
import './PuzzleBoot.css'

const STEPS_CORRECT = [
  { id: 'connect',    label: 'Conectar componentes'   },
  { id: 'bios',       label: 'Inicializar BIOS/UEFI'  },
  { id: 'hardware',   label: 'Reconhecer hardware'    },
  { id: 'ssd',        label: 'Localizar SSD'          },
  { id: 'bootloader', label: 'Carregar bootloader'    },
  { id: 'kernel',     label: 'Carregar kernel'        },
  { id: 'processes',  label: 'Iniciar processos'      },
  { id: 'display',    label: 'Exibir tela do SO'      },
]

const BOOT_PHASES = [
  { key: 'bios', label: 'BIOS/UEFI', detail: 'Inicializando firmware e memória' },
  { key: 'hardware', label: 'Hardware', detail: 'Detectando dispositivos e barramentos' },
  { key: 'ssd', label: 'SSD', detail: 'Localizando sistema de arquivos' },
  { key: 'bootloader', label: 'Bootloader', detail: 'Carregando ambiente de inicialização' },
  { key: 'kernel', label: 'Kernel', detail: 'Executando módulos do sistema' },
  { key: 'processes', label: 'Processos', detail: 'Subindo serviços e daemons' },
  { key: 'display', label: 'Sistema', detail: 'Exibindo desktop e serviços finais' },
]

const DAMAGE_ERRORS = {
  cpu:         'ERRO: CPU danificada — falha no escalonamento',
  ram:         'ERRO: RAM danificada — falha na alocação de memória',
  ssd:         'ERRO: SSD danificada — sistema de arquivos inacessível',
  gpu:         'ERRO: GPU danificada — driver de vídeo não carregado',
  motherboard: 'ERRO: Placa-mãe danificada — componentes não reconhecidos',
  keyboard:    'ERRO: Teclado danificado — eventos de entrada falhos',
  mouse:       'ERRO: Mouse danificado — cursor não inicializado',
  monitor:     'ERRO: Monitor danificado — configuração de vídeo inválida',
  printer:     'ERRO: Impressora danificada — fila de impressão corrompida',
  headset:     'ERRO: Headset danificado — I/O de áudio indisponível',
  pendrive:    'ERRO: Pendrive danificado — montagem falhou',
}

const WRONG_PENALTY = 20
const PEEK_PENALTY = 30
const TABS = ['COMO JOGAR', 'TEORIA']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PuzzleBoot({ onSuccess, onFail, timerRef }) {
  const { damagedPieces } = useGame()
  const { playBoot, playWrong, playButton } = useGameAudio()

  const [queue, setQueue] = useState(() => shuffle(STEPS_CORRECT))
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [booting, setBooting] = useState(false)
  const [bootLog, setBootLog] = useState([])
  const [bootFailed, setBootFailed] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpTab, setHelpTab] = useState(0)
  const [peeked, setPeeked] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [activePhase, setActivePhase] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)

  function handleDragStart(id) { setDragging(id) }
  function handleDragOver(e, id) { e.preventDefault(); setDragOver(id) }
  function handleDragEnd() { setDragging(null); setDragOver(null) }

  function handleDrop(targetId) {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return }
    setQueue(prev => {
      const next = [...prev]
      const fromIdx = next.findIndex(s => s.id === dragging)
      const toIdx = next.findIndex(s => s.id === targetId)
      ;[next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]]
      return next
    })
    setDragging(null)
    setDragOver(null)
  }

  function handleConfirm() {
    if (confirmed) return
    const isCorrect = queue.every((s, i) => s.id === STEPS_CORRECT[i].id)
    if (!isCorrect) {
      playWrong()
      timerRef?.current?.addPenalty(WRONG_PENALTY)
      setConfirmed('wrong')
      setTimeout(() => setConfirmed(false), 600)
      return
    }
    setConfirmed(true)
    runBootSequence()
  }

  async function runBootSequence() {
    playBoot()
    setBooting(true)
    const log = []

    for (let i = 0; i < BOOT_PHASES.length; i++) {
      setActivePhase(i)
      for (let progress = 0; progress <= 100; progress += 10) {
        setPhaseProgress(progress)
        await new Promise(resolve => setTimeout(resolve, 70))
      }

      log.push({ text: `[ OK ] ${BOOT_PHASES[i].label} — ${BOOT_PHASES[i].detail}`, ok: true })
      setBootLog([...log])
    }

    await new Promise(r => setTimeout(r, 250))
    const errors = damagedPieces.map(id => DAMAGE_ERRORS[id]).filter(Boolean)
    if (errors.length > 0) {
      for (const err of errors) {
        await new Promise(r => setTimeout(r, 400))
        log.push({ text: err, ok: false })
        setBootLog([...log])
      }
      await new Promise(r => setTimeout(r, 600))
      log.push({ text: 'SISTEMA NÃO INICIALIZADO — COMPONENTES COM FALHA', ok: false })
      setBootLog([...log])
      setBootFailed(true)
      setTimeout(() => onFail?.(), 1500)
      return
    }

    await new Promise(r => setTimeout(r, 350))
    log.push({ text: 'BOOT CONCLUÍDO — BEM-VINDO AO DINOBOOT OS!', ok: true })
    setBootLog([...log])
    setTimeout(() => onSuccess(), 1200)
  }

  function handlePeek() {
    if (!peeked) {
      timerRef?.current?.addPenalty(PEEK_PENALTY)
      setPeeked(true)
    }
    setShowAnswer(a => !a)
  }

  if (booting) {
    return (
      <div className="pb-puzzle">
        <div className={`pb-terminal ${bootFailed ? 'failed' : ''}`}>
          <div className="pb-terminal-bar">
            <span className="pb-terminal-title">DINOBOOT BIOS v1.0</span>
          </div>

          <div className="pb-terminal-body">
            <div className="pb-phase-list">
              {BOOT_PHASES.map((phase, index) => {
                const isDone = index < activePhase || (bootFailed && index <= activePhase)
                const isActive = index === activePhase && !bootFailed
                return (
                  <div key={phase.key} className={`pb-phase ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="pb-phase-header">
                      <span>{phase.label}</span>
                      <span>{isDone ? 'OK' : isActive ? `${phaseProgress}%` : 'WAIT'}</span>
                    </div>
                    <div className="pb-phase-bar">
                      <span style={{ width: isDone ? '100%' : isActive ? `${phaseProgress}%` : '0%' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pb-status-grid">
              {BOOT_PHASES.map((phase, index) => (
                <div key={`${phase.key}-status`} className={`pb-status-item ${index <= activePhase ? 'online' : ''}`}>
                  [{index <= activePhase ? 'OK' : 'WAIT'}] {phase.label}
                </div>
              ))}
            </div>

            <div className="pb-log-box">
              {bootLog.map((line, i) => (
                <div key={i} className={`pb-log-line ${line.ok ? 'ok' : 'err'}`}>
                  {line.text}
                </div>
              ))}
              {!bootFailed && bootLog.length < BOOT_PHASES.length + 1 && (
                <div className="pb-cursor">_</div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-puzzle">
      <div className="pb-help-bar">
        <button className="pb-help-toggle" onClick={() => { playButton(); setHelpOpen(o => !o) }}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="pb-help-panel">
          <div className="pb-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`pb-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="pb-help-content">
              <p>1. <strong>Arraste</strong> as etapas para colocá-las na ordem correta.</p>
              <p>2. Clique em <strong>INICIAR BOOT</strong> para confirmar.</p>
              <p>3. Ordem errada: <strong>+{WRONG_PENALTY}s</strong> de penalidade.</p>
              <p>4. Peças <strong>danificadas</strong> causam falha no boot mesmo com a ordem correta.</p>
            </div>
          )}
          {helpTab === 1 && (
            <div className="pb-help-content">
              <p>O processo de boot segue uma sequência rígida definida pelo <strong>firmware</strong>.</p>
              <p>O <strong>BIOS/UEFI</strong> é o primeiro software executado — inicializa o hardware e localiza o bootloader.</p>
              <p>O <strong>bootloader</strong> (ex: GRUB) carrega o kernel do SO na memória.</p>
              <p>O <strong>kernel</strong> inicializa drivers e processos do sistema antes de exibir a tela de login.</p>
            </div>
          )}
        </div>
      )}

      <div className="pb-answer-bar">
        <button className="pb-peek-btn" onClick={handlePeek}>
          {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
        </button>
        {peeked && !showAnswer && <span className="pb-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
      </div>
      {showAnswer && (
        <div className="pb-answer">
          {STEPS_CORRECT.map((s, i) => (
            <span key={s.id} className="pb-answer-row">{i + 1}. {s.label}</span>
          ))}
        </div>
      )}

      {damagedPieces.length > 0 && (
        <div className="pb-damage-warn">
          ⚠ {damagedPieces.length} peça(s) danificada(s) — o boot pode falhar!
        </div>
      )}

      <div className="pb-header">
        <span>ORDENE AS ETAPAS DE INICIALIZAÇÃO</span>
      </div>

      <div className={`pb-queue ${confirmed === 'wrong' ? 'shake' : ''}`}>
        {queue.map((step, i) => (
          <div
            key={step.id}
            className={[
              'pb-step',
              dragging === step.id ? 'dragging' : '',
              dragOver === step.id ? 'drag-over' : '',
            ].join(' ')}
            draggable
            onDragStart={() => handleDragStart(step.id)}
            onDragOver={e => handleDragOver(e, step.id)}
            onDrop={() => handleDrop(step.id)}
            onDragEnd={handleDragEnd}
          >
            <span className="pb-step-num">{i + 1}</span>
            <span className="pb-step-label">{step.label}</span>
            <span className="pb-step-drag">⠿</span>
          </div>
        ))}
      </div>

      <button
        className="pb-confirm-btn"
        onClick={handleConfirm}
        disabled={!!confirmed}
      >
        {confirmed === 'wrong' ? '✗ ORDEM INCORRETA' : '▶ INICIAR BOOT'}
      </button>
    </div>
  )
}
