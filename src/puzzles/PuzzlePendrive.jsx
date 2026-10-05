import { useState } from 'react'
import { useGameAudio } from '../audio/useGameAudio'
import './PuzzlePendrive.css'

const DEVICES = [
  { id: 'usb01', label: 'USB-01',   size: '32GB', type: 'pendrive', correct: true  },
  { id: 'sda1',  label: 'sda1',     size: '500GB', type: 'hd',      correct: false },
  { id: 'sda2',  label: 'sda2',     size: '100GB', type: 'partição', correct: false },
  { id: 'sr0',   label: 'sr0',      size: '—',    type: 'cd-rom',   correct: false },
]

const FILE_TREE = [
  { path: '/media/USB-01/',           type: 'dir',  name: 'USB-01' },
  { path: '/media/USB-01/fotos/',     type: 'dir',  name: 'fotos' },
  { path: '/media/USB-01/fotos/ferias.jpg', type: 'file', name: 'ferias.jpg' },
  { path: '/media/USB-01/docs/',      type: 'dir',  name: 'docs' },
  { path: '/media/USB-01/docs/relatorio.pdf', type: 'file', name: 'relatorio.pdf' },
  { path: '/media/USB-01/mapa.dat',   type: 'file', name: 'mapa.dat', target: true },
  { path: '/media/USB-01/boot.cfg',   type: 'file', name: 'boot.cfg' },
]

const WRONG_PENALTY = 15
const PEEK_PENALTY  = 30
const TABS = ['COMO JOGAR', 'TEORIA']

export default function PuzzlePendrive({ onSuccess, onFail, timerRef }) {
  const { playWrong } = useGameAudio()
  const [phase, setPhase]           = useState(1) // 1=selecionar, 2=montar, 3=navegar
  const [selected, setSelected]     = useState(null)
  const [wrongDev, setWrongDev]     = useState(null)
  const [mounted, setMounted]       = useState(false)
  const [openDirs, setOpenDirs]     = useState(new Set())
  const [wrongFile, setWrongFile]   = useState(null)
  const [helpOpen, setHelpOpen]     = useState(false)
  const [helpTab, setHelpTab]       = useState(0)
  const [peeked, setPeeked]         = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  function handleSelectDevice(dev) {
    if (phase !== 1) return
    if (!dev.correct) {
      playWrong()
      setWrongDev(dev.id)
      setTimeout(() => setWrongDev(null), 600)
      timerRef?.current?.addPenalty(WRONG_PENALTY)
      return
    }
    setSelected(dev.id)
    setPhase(2)
  }

  function handleMount() {
    setMounted(true)
    setTimeout(() => setPhase(3), 800)
  }

  function toggleDir(path) {
    setOpenDirs(prev => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }

  function handleFileClick(node) {
    if (node.type === 'dir') { toggleDir(node.path); return }
    if (node.target) { setTimeout(onSuccess, 400); return }
    playWrong()
    setWrongFile(node.path)
    setTimeout(() => setWrongFile(null), 600)
    timerRef?.current?.addPenalty(WRONG_PENALTY)
  }

  function handlePeek() {
    if (!peeked) { timerRef?.current?.addPenalty(PEEK_PENALTY); setPeeked(true) }
    setShowAnswer(a => !a)
  }

  // Renderiza a árvore de forma hierárquica
  function renderTree() {
    const root = FILE_TREE[0]
    return renderNode(root, 0)
  }

  function renderNode(node, depth) {
    if (node.type === 'dir') {
      const isOpen = openDirs.has(node.path)
      const children = FILE_TREE.filter(n =>
        n.path !== node.path &&
        n.path.startsWith(node.path) &&
        n.path.slice(node.path.length).split('/').filter(Boolean).length === 1
      )
      return (
        <div key={node.path} className="pd-tree-node" style={{ paddingLeft: depth * 14 }}>
          <div className="pd-tree-row dir" onClick={() => toggleDir(node.path)}>
            <span className="pd-tree-arrow">{isOpen ? '▾' : '▸'}</span>
            <span className="pd-tree-icon">📁</span>
            <span className="pd-tree-name">{node.name}/</span>
          </div>
          {isOpen && children.map(c => renderNode(c, depth + 1))}
        </div>
      )
    }
    return (
      <div
        key={node.path}
        className={[
          'pd-tree-node',
          wrongFile === node.path ? 'wrong' : '',
          node.target ? 'target-file' : '',
        ].join(' ')}
        style={{ paddingLeft: depth * 14 }}
        onClick={() => handleFileClick(node)}
      >
        <div className="pd-tree-row file">
          <span className="pd-tree-arrow"> </span>
          <span className="pd-tree-icon">{node.target ? '🗺️' : '📄'}</span>
          <span className="pd-tree-name">{node.name}</span>
        </div>
      </div>
    )
  }

  const selectedDev = DEVICES.find(d => d.id === selected)

  return (
    <div className="pd-puzzle">

      <div className="pd-help-bar">
        <button className="pd-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="pd-help-panel">
          <div className="pd-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`pd-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="pd-help-content">
              <p>1. <strong>Selecione</strong> o dispositivo correto na lista.</p>
              <p>2. Clique em <strong>MONTAR</strong> para montar o pendrive.</p>
              <p>3. <strong>Navegue</strong> pela árvore de arquivos e clique em <strong>mapa.dat</strong>.</p>
              <p>4. Dispositivo ou arquivo errado: <strong>+{WRONG_PENALTY}s</strong>.</p>
            </div>
          )}
          {helpTab === 1 && (
            <div className="pd-help-content">
              <p><strong>Montar</strong> um dispositivo significa associá-lo a um ponto do sistema de arquivos (ex: <code>/media/USB-01/</code>).</p>
              <p>No Linux, dispositivos removíveis aparecem em <strong>/dev/</strong> e são montados em <strong>/media/</strong> ou <strong>/mnt/</strong>.</p>
              <p>Sem montagem, o SO não consegue acessar os arquivos do dispositivo.</p>
            </div>
          )}
        </div>
      )}

      <div className="pd-answer-bar">
        <button className="pd-peek-btn" onClick={handlePeek}>
          {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
        </button>
        {peeked && !showAnswer && <span className="pd-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
      </div>
      {showAnswer && (
        <div className="pd-answer">
          <span className="pd-answer-row">1. Selecionar: USB-01 (pendrive, 32GB)</span>
          <span className="pd-answer-row">2. Clicar em MONTAR</span>
          <span className="pd-answer-row">3. Clicar em mapa.dat em /media/USB-01/</span>
        </div>
      )}

      {/* Progresso */}
      <div className="pd-phases">
        {['SELECIONAR', 'MONTAR', 'NAVEGAR'].map((label, i) => (
          <div key={i} className={`pd-phase-dot ${i + 1 < phase ? 'done' : i + 1 === phase ? 'active' : ''}`}>
            {i + 1 < phase ? '✓' : i + 1}
          </div>
        ))}
        <span className="pd-phase-label">
          {phase === 1 ? 'FASE 1 — SELECIONE O DISPOSITIVO'
            : phase === 2 ? 'FASE 2 — MONTE O PENDRIVE'
            : 'FASE 3 — LOCALIZE O ARQUIVO'}
        </span>
      </div>

      {/* ── FASE 1 ── */}
      {phase === 1 && (
        <div className="pd-device-list">
          <div className="pd-list-header">
            <span>DISPOSITIVO</span><span>TIPO</span><span>TAMANHO</span><span>STATUS</span>
          </div>
          {DEVICES.map(dev => (
            <div
              key={dev.id}
              className={['pd-device-row', wrongDev === dev.id ? 'wrong' : ''].join(' ')}
              onClick={() => handleSelectDevice(dev)}
            >
              <span className="pd-dev-label">
                <span className="pd-dev-icon">{dev.type === 'pendrive' ? '💾' : dev.type === 'cd-rom' ? '💿' : '🖴'}</span>
                /dev/{dev.label}
              </span>
              <span className="pd-dev-type">{dev.type}</span>
              <span className="pd-dev-size">{dev.size}</span>
              <span className="pd-dev-status">não montado</span>
            </div>
          ))}
        </div>
      )}

      {/* ── FASE 2 ── */}
      {phase === 2 && (
        <div className="pd-mount-area">
          <div className="pd-mount-card">
            <div className="pd-mount-icon">💾</div>
            <div className="pd-mount-info">
              <div className="pd-mount-name">/dev/{selectedDev?.label}</div>
              <div className="pd-mount-detail">{selectedDev?.type} · {selectedDev?.size} · não montado</div>
              <div className="pd-mount-point">ponto de montagem: <strong>/media/USB-01/</strong></div>
            </div>
          </div>
          <button className={`pd-mount-btn ${mounted ? 'mounted' : ''}`} onClick={handleMount} disabled={mounted}>
            {mounted ? '✓ MONTADO!' : '⬆ MONTAR DISPOSITIVO'}
          </button>
        </div>
      )}

      {/* ── FASE 3 ── */}
      {phase === 3 && (
        <div className="pd-nav-area">
          <div className="pd-nav-header">
            <span className="pd-nav-path">📂 /media/USB-01/</span>
            <span className="pd-nav-hint">Clique em <strong>mapa.dat</strong> para extrair</span>
          </div>
          <div className="pd-tree">
            {renderTree()}
          </div>
        </div>
      )}

    </div>
  )
}
