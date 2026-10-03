import { useState } from 'react'
import './PuzzleSSD.css'

const FILES = [
  { id: 'foto',     name: 'foto.png',       folder: 'Imagens',    icon: '🖼️' },
  { id: 'trabalho', name: 'trabalho.docx',  folder: 'Documentos', icon: '📄' },
  { id: 'sistema',  name: 'sistema.conf',   folder: 'Sistema',    icon: '⚙️' },
  { id: 'jogo',     name: 'jogo.exe',       folder: 'Programas',  icon: '🎮' },
  { id: 'musica',   name: 'musica.mp3',     folder: 'Música',     icon: '🎵' },
  { id: 'video',    name: 'video.mp4',      folder: 'Imagens',    icon: '🎬' },
  { id: 'relatorio',name: 'relatorio.pdf',  folder: 'Documentos', icon: '📋' },
  { id: 'driver',   name: 'driver.exe',     folder: 'Programas',  icon: '💾' },
]

const FOLDERS = ['Documentos', 'Imagens', 'Sistema', 'Programas', 'Música']

const TREE = [
  { path: '/',                    label: '/',              indent: 0, clickable: false },
  { path: '/boot',                label: 'boot/',          indent: 1, clickable: false },
  { path: '/boot/grub',           label: 'grub/',          indent: 2, clickable: false },
  { path: '/boot/grub/grub.cfg',  label: 'grub.cfg',       indent: 3, clickable: true, correct: false },
  { path: '/boot/boot.cfg',       label: 'boot.cfg',       indent: 2, clickable: true, correct: true },
  { path: '/boot/initrd.img',     label: 'initrd.img',     indent: 2, clickable: true, correct: false },
  { path: '/home',                label: 'home/',          indent: 1, clickable: false },
  { path: '/home/user',           label: 'user/',          indent: 2, clickable: false },
  { path: '/home/user/boot.txt',  label: 'boot.txt',       indent: 3, clickable: true, correct: false },
  { path: '/etc',                 label: 'etc/',           indent: 1, clickable: false },
  { path: '/etc/boot.conf',       label: 'boot.conf',      indent: 2, clickable: true, correct: false },
  { path: '/etc/hosts',           label: 'hosts',          indent: 2, clickable: true, correct: false },
  { path: '/var',                 label: 'var/',           indent: 1, clickable: false },
  { path: '/var/log',             label: 'log/',           indent: 2, clickable: false },
  { path: '/var/log/boot.log',    label: 'boot.log',       indent: 3, clickable: true, correct: false },
  { path: '/var/log/sys.log',     label: 'sys.log',        indent: 3, clickable: true, correct: false },
  { path: '/media',               label: 'media/',         indent: 1, clickable: false },
  { path: '/media/boot.cfg',      label: 'boot.cfg',       indent: 2, clickable: true, correct: false },
]

const PEEK_PENALTY = 30
const TABS = ['COMO JOGAR', 'TEORIA']

export default function PuzzleSSD({ onSuccess, onFail, timerRef }) {
  const [phase, setPhase]           = useState(1)
  const [placements, setPlacements] = useState({}) // fileId → folderName
  const [dragging, setDragging]     = useState(null)
  const [rejects, setRejects]       = useState({})
  const [wrongClick, setWrongClick] = useState(null)
  const [helpOpen, setHelpOpen]     = useState(false)
  const [helpTab, setHelpTab]       = useState(0)
  const [peeked, setPeeked]         = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const placedFiles = new Set(Object.keys(placements))
  const allPlaced   = placedFiles.size === FILES.length

  // verifica se todos foram colocados na pasta certa
  const allCorrect = FILES.every(f => placements[f.id] === f.folder)

  function handleDrop(folderName) {
    if (!dragging) return
    const file = FILES.find(f => f.id === dragging)
    if (!file) return

    if (file.folder !== folderName) {
      setRejects(r => ({ ...r, [folderName]: true }))
      setTimeout(() => setRejects(r => { const n = { ...r }; delete n[folderName]; return n }), 600)
      setDragging(null)
      return
    }

    setPlacements(prev => ({ ...prev, [dragging]: folderName }))
    setDragging(null)
  }

  function removeFile(fileId) {
    setPlacements(prev => { const n = { ...prev }; delete n[fileId]; return n })
  }

  function handlePhase1Confirm() {
    if (!allCorrect) {
      // encontra pastas erradas e flash
      const wrong = {}
      Object.entries(placements).forEach(([fid, folder]) => {
        const file = FILES.find(f => f.id === fid)
        if (file.folder !== folder) wrong[folder] = true
      })
      setRejects(wrong)
      setTimeout(() => setRejects({}), 800)
      return
    }
    setPhase(2)
  }

  function handleTreeClick(node) {
    if (!node.clickable) return
    if (node.correct) {
      setTimeout(() => onSuccess(), 600)
    } else {
      setWrongClick(node.path)
      setTimeout(() => setWrongClick(null), 700)
      timerRef?.current?.addPenalty(20)
    }
  }

  function handlePeek() {
    if (!peeked) {
      timerRef?.current?.addPenalty(PEEK_PENALTY)
      setPeeked(true)
    }
    setShowAnswer(a => !a)
  }

  const freeFiles = FILES.filter(f => !placedFiles.has(f.id))

  return (
    <div className="ssd-puzzle">

      {/* Ajuda */}
      <div className="ssd-help-bar">
        <button className="ssd-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="ssd-help-panel">
          <div className="ssd-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`ssd-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="ssd-help-content">
              {phase === 1 ? <>
                <p>1. <strong>Arraste</strong> cada arquivo para a pasta correta.</p>
                <p>2. Se a pasta estiver <strong>errada</strong>, o arquivo volta e a pasta pisca em vermelho.</p>
                <p>3. Clique em um arquivo já alocado para <strong>devolvê-lo</strong>.</p>
                <p>4. Quando todos estiverem corretos, clique em <strong>PRÓXIMA FASE</strong>.</p>
              </> : <>
                <p>1. Navegue pela <strong>árvore de diretórios</strong>.</p>
                <p>2. Clique no arquivo <strong>/boot/boot.cfg</strong> para inicializar o sistema.</p>
                <p>3. Clicar no arquivo errado custa <strong>+10s</strong> de penalidade.</p>
              </>}
            </div>
          )}
          {helpTab === 1 && (
            <div className="ssd-help-content">
              <p><strong>Sistema de Arquivos</strong> organiza dados no disco em hierarquia de diretórios.</p>
              <p>No Linux, tudo parte da raiz <strong>/</strong>. Cada pasta tem um propósito: <strong>/boot</strong> contém arquivos de inicialização, <strong>/etc</strong> configurações do sistema.</p>
              <p><strong>Inodes</strong> armazenam metadados dos arquivos (permissões, tamanho, datas).</p>
              <p>O arquivo <strong>boot.cfg</strong> instrui o bootloader sobre qual kernel carregar.</p>
              <p>Organizar arquivos corretamente evita <strong>fragmentação</strong> e facilita a manutenção.</p>
            </div>
          )}
        </div>
      )}

      {/* Fase 1 */}
      {phase === 1 && (
        <>
          <div className="ssd-phase-label">FASE 1 — ORGANIZE OS ARQUIVOS</div>

          {/* Gabarito */}
          <div className="ssd-answer-bar">
            <button className="ssd-peek-btn" onClick={handlePeek}>
              {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
            </button>
            {peeked && !showAnswer && <span className="ssd-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
          </div>
          {showAnswer && (
            <div className="ssd-answer">
              {FILES.map(f => (
                <div key={f.id} className="ssd-answer-row">
                  <span className="ssd-answer-file">{f.icon} {f.name}</span>
                  <span className="ssd-answer-arrow">→</span>
                  <span className="ssd-answer-folder">📁 {f.folder}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pastas */}
          <div className="ssd-section-label">PASTAS</div>
          <div className="ssd-folders">
            {FOLDERS.map(folder => {
              const inside = FILES.filter(f => placements[f.id] === folder)
              return (
                <div
                  key={folder}
                  className={`ssd-folder ${rejects[folder] ? 'reject' : ''} ${inside.length ? 'has-files' : ''}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(folder)}
                >
                  <span className="ssd-folder-name">📁 {folder}</span>
                  <div className="ssd-folder-files">
                    {inside.map(f => (
                      <button key={f.id} className="ssd-folder-file" onClick={() => removeFile(f.id)}>
                        {f.icon} {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Arquivos soltos */}
          <div className="ssd-section-label">
            ARQUIVOS SOLTOS
            <span className="ssd-count">{freeFiles.length} restantes</span>
          </div>
          <div className="ssd-files">
            {freeFiles.length === 0
              ? <span className="ssd-empty">— todos os arquivos foram organizados —</span>
              : freeFiles.map(f => (
                <div
                  key={f.id}
                  className="ssd-file"
                  draggable
                  onDragStart={() => setDragging(f.id)}
                  onDragEnd={() => setDragging(null)}
                >
                  <span className="ssd-file-icon">{f.icon}</span>
                  <span className="ssd-file-name">{f.name}</span>
                </div>
              ))
            }
          </div>

          <div className="ssd-actions">
            <button className="ssd-btn reset" onClick={() => setPlacements({})}>↺ RESETAR</button>
            <button className="ssd-btn confirm" onClick={handlePhase1Confirm} disabled={!allPlaced}>
              PRÓXIMA FASE →
            </button>
          </div>
        </>
      )}

      {/* Fase 2 */}
      {phase === 2 && (
        <>
          <div className="ssd-phase-label">FASE 2 — LOCALIZE O ARQUIVO DE BOOT</div>
          <p className="ssd-phase-hint">Clique em <strong>/boot/boot.cfg</strong> para inicializar o sistema</p>

          <div className="ssd-tree">
            {TREE.map(node => (
              <div
                key={node.path}
                className={`ssd-tree-node ${node.clickable ? 'clickable' : ''} ${wrongClick === node.path ? 'wrong' : ''}`}
                style={{ paddingLeft: `${node.indent * 20 + 12}px` }}
                onClick={() => handleTreeClick(node)}
              >
                <span className="ssd-tree-icon">
                  {!node.clickable ? '📁' : node.label.includes('.cfg') ? '⚙️' : node.label.includes('.log') ? '📋' : '📄'}
                </span>
                <span className="ssd-tree-label">{node.label}</span>
                {node.clickable && <span className="ssd-tree-path">{node.path}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
