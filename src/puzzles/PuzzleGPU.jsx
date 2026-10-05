import { useEffect, useState } from 'react'
import { useGame } from '../hooks/useGame'
import { useGameAudio } from '../audio/useGameAudio'
import { getDifficultyProfile } from '../data/difficulty'
import './PuzzleGPU.css'

const PEEK_PENALTY = 30
const TABS = ['COMO JOGAR', 'TEORIA']

export default function PuzzleGPU({ onSuccess, onFail, timerRef }) {
  const { difficulty } = useGame()
  const { playWrong } = useGameAudio()
  const profile = getDifficultyProfile('gpu', difficulty)
  const DEVICES = profile.devices
  const DRIVERS = profile.drivers
  const CORRECT_DRIVERS = Object.fromEntries(
    DEVICES.filter(d => d.status === 'error').map(d => [d.id, DRIVERS.find(dr => dr.forDevice === d.id && dr.vendor === d.requiredVendor && dr.version === d.version)?.id])
  )
  const [dragging, setDragging]         = useState(null)
  const [slots, setSlots]               = useState({ gpu: null, network: null })
  const [rejects, setRejects]           = useState({})
  const [inspected, setInspected]       = useState(null) // deviceId sendo inspecionado
  const [confirmed, setConfirmed]       = useState(false)
  const [helpOpen, setHelpOpen]         = useState(false)
  const [helpTab, setHelpTab]           = useState(0)
  const [peeked, setPeeked]             = useState(false)
  const [showAnswer, setShowAnswer]     = useState(false)

  const errorDevices = DEVICES.filter(d => d.status === 'error')
  const allInstalled = errorDevices.every(d => slots[d.id] !== null)
  const usedDrivers  = new Set(Object.values(slots).filter(Boolean))

  function handleDrop(e, deviceId) {
    e.preventDefault()
    if (!dragging || slots[deviceId]) return
    const driver  = DRIVERS.find(d => d.id === dragging)
    const correct = CORRECT_DRIVERS[deviceId]

    if (driver.id !== correct) {
      playWrong()
      setRejects(r => ({ ...r, [deviceId]: true }))
      timerRef?.current?.addPenalty(20)
      setTimeout(() => setRejects(r => { const n = { ...r }; delete n[deviceId]; return n }), 700)
      setDragging(null)
      return
    }

    setSlots(s => ({ ...s, [deviceId]: driver.id }))
    setDragging(null)
  }

  function removeSlot(deviceId) {
    setSlots(s => ({ ...s, [deviceId]: null }))
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
    <div className="gpu-puzzle">

      {/* Ajuda */}
      <div className="gpu-help-bar">
        <button className="gpu-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="gpu-help-panel">
          <div className="gpu-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`gpu-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="gpu-help-content">
              <p>1. Dois dispositivos estão com <strong>erro</strong> — identifique quais são.</p>
              <p>2. Clique em um dispositivo com erro para <strong>inspecionar</strong> sua versão e fabricante requerido.</p>
              <p>3. Analise os drivers e encontre o que tem <strong>versão e fabricante corretos</strong> para cada dispositivo.</p>
              <p>4. <strong>Arraste</strong> o driver para o slot do dispositivo correto.</p>
              <p>5. Driver errado custa <strong>+20s</strong>. Gabarito custa <strong>+30s</strong>.</p>
            </div>
          )}
          {helpTab === 1 && (
            <div className="gpu-help-content">
              <p><strong>Drivers</strong> são programas que permitem ao SO se comunicar com o hardware.</p>
              <p>A <strong>versão</strong> do driver deve ser compatível com a versão do dispositivo.</p>
              <p>O <strong>fabricante</strong> (vendor) também importa — drivers de terceiros podem ser instáveis.</p>
              <p>Instalar o driver errado pode causar <strong>tela azul</strong>, falhas gráficas ou perda de rede.</p>
              <p>No Linux, o comando <strong>lspci</strong> lista dispositivos e suas versões para identificar o driver correto.</p>
            </div>
          )}
        </div>
      )}

      <div className="gpu-layout">

        {/* Coluna esquerda — dispositivos */}
        <div className="gpu-col">
          <div className="gpu-section-label">GERENCIADOR DE DISPOSITIVOS</div>
          <div className="gpu-devices">
            {DEVICES.map(dev => {
              const slotDriver = slots[dev.id] ? DRIVERS.find(d => d.id === slots[dev.id]) : null
              const isRejecting = rejects[dev.id]
              const isFixed = confirmed && dev.status === 'error'

              return (
                <div
                  key={dev.id}
                  className={`gpu-device ${dev.status} ${slotDriver ? 'installing' : ''} ${isFixed ? 'fixed' : ''} ${dev.status === 'error' ? 'clickable' : ''}`}
                  onClick={() => dev.status === 'error' && setInspected(inspected === dev.id ? null : dev.id)}
                >
                  <span className="gpu-device-icon">{dev.icon}</span>
                  <span className="gpu-device-name">{dev.name}</span>
                  <span className={`gpu-device-status ${isFixed ? 'ok' : dev.status}`}>
                    {isFixed ? '✓ OK' : slotDriver ? '⟳ AGUARDANDO...' : dev.status === 'ok' ? '✓ OK' : '✗ ERRO'}
                  </span>

                  {/* Painel de inspeção */}
                  {dev.status === 'error' && inspected === dev.id && (
                    <div className="gpu-inspect">
                      <span>VERSÃO: <strong>{dev.version}</strong></span>
                      <span>VENDOR: <strong>{dev.requiredVendor}</strong></span>
                    </div>
                  )}

                  {/* Slot de drop */}
                  {dev.status === 'error' && (
                    <div
                      className={`gpu-slot ${isRejecting ? 'reject' : ''} ${slotDriver ? 'filled' : ''}`}
                      onDragOver={e => { if (!slotDriver) e.preventDefault() }}
                      onDrop={e => handleDrop(e, dev.id)}
                      onClick={e => e.stopPropagation()}
                    >
                      {slotDriver
                        ? <span className="gpu-slot-filled">
                            {slotDriver.name} v{slotDriver.version} — {slotDriver.vendor}
                            <button className="gpu-slot-remove" onClick={() => removeSlot(dev.id)}>✕</button>
                          </span>
                        : <span className="gpu-slot-empty">← solte o driver aqui</span>
                      }
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Coluna direita — drivers */}
        <div className="gpu-col">
          <div className="gpu-section-label">DRIVERS DISPONÍVEIS</div>

          <div className="gpu-answer-bar">
            <button className="gpu-peek-btn" onClick={handlePeek}>
              {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
            </button>
            {peeked && !showAnswer && <span className="gpu-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
          </div>

          {showAnswer && (
            <div className="gpu-answer">
              <span>GPU → <strong>GPU Driver v4.2 — OpenVGA</strong></span>
              <span>REDE → <strong>Net Driver v2.0 — NetCore</strong></span>
            </div>
          )}

          <div className="gpu-drivers">
            {DRIVERS.map(d => (
              <div
                key={d.id}
                className={`gpu-driver ${usedDrivers.has(d.id) ? 'used' : ''}`}
                draggable={!usedDrivers.has(d.id)}
                onDragStart={() => setDragging(d.id)}
                onDragEnd={() => setDragging(null)}
              >
                <div className="gpu-driver-header">
                  <span className="gpu-driver-name">{d.name}</span>
                  <span className="gpu-driver-version">v{d.version}</span>
                </div>
                <div className="gpu-driver-meta">
                  <span className="gpu-driver-vendor">{d.vendor}</span>
                  <span className="gpu-driver-for">para: {d.forDevice.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="gpu-actions">
            <button
              className={`gpu-btn confirm ${confirmed ? 'ok' : ''}`}
              onClick={handleConfirm}
              disabled={!allInstalled || confirmed}
            >
              ⚡ INSTALAR DRIVERS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
