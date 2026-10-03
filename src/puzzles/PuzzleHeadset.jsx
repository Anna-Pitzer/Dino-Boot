import { useState } from 'react'
import './PuzzleHeadset.css'

const DEVICES = [
  { id: 'mic',      name: 'Microfone',       icon: '🎤', desc: 'Converte som em sinal elétrico' },
  { id: 'headset',  name: 'Headset',         icon: '🎧', desc: 'Transdutor de sinal para onda sonora' },
  { id: 'linein',   name: 'Cabo P2 Entrada', icon: '🔌', desc: 'Transmite sinal analógico bidirecional' },
  { id: 'speaker',  name: 'Caixa de Som',    icon: '🔊', desc: 'Amplifica e reproduz frequências' },
  { id: 'loopback', name: 'Áudio Virtual',   icon: '🔁', desc: 'Roteia sinal internamente no SO' },
  { id: 'webcam',   name: 'Webcam c/ Mic',   icon: '📷', desc: 'Captura vídeo e áudio simultaneamente' },
]

const CORRECT = { input: 'mic', output: 'headset' }
const SLOTS = [
  { id: 'input',  label: 'ENTRADA', sublabel: 'Captura de áudio',    color: 'slot-in',  icon: '🔴' },
  { id: 'output', label: 'SAÍDA',   sublabel: 'Reprodução de áudio', color: 'slot-out', icon: '🟢' },
]
const WRONG_PENALTY = 15
const PEEK_PENALTY  = 30
const TABS = ['COMO JOGAR', 'TEORIA']

export default function PuzzleHeadset({ onSuccess, onFail, timerRef }) {
  const [slots, setSlots]           = useState({ input: null, output: null })
  const [dragging, setDragging]     = useState(null)
  const [wrongSlot, setWrongSlot]   = useState(null)
  const [correctFlash, setCorrectFlash] = useState(null)
  const [helpOpen, setHelpOpen]     = useState(false)
  const [helpTab, setHelpTab]       = useState(0)
  const [peeked, setPeeked]         = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const placedIds   = new Set(Object.values(slots).filter(Boolean))
  const freeDevices = DEVICES.filter(d => !placedIds.has(d.id))

  function handleDrop(slotId) {
    if (!dragging) return
    if (slots[slotId]) {
      setWrongSlot(slotId)
      setTimeout(() => setWrongSlot(null), 600)
      setDragging(null)
      return
    }
    if (CORRECT[slotId] !== dragging) {
      setWrongSlot(slotId)
      setTimeout(() => setWrongSlot(null), 600)
      timerRef?.current?.addPenalty(WRONG_PENALTY)
      setDragging(null)
      return
    }
    const next = { ...slots, [slotId]: dragging }
    setCorrectFlash(slotId)
    setTimeout(() => setCorrectFlash(null), 600)
    setSlots(next)
    setDragging(null)
    if (SLOTS.every(s => next[s.id] !== null)) setTimeout(onSuccess, 700)
  }

  function handlePeek() {
    if (!peeked) { timerRef?.current?.addPenalty(PEEK_PENALTY); setPeeked(true) }
    setShowAnswer(a => !a)
  }

  return (
    <div className="hs-puzzle">

      <div className="hs-help-bar">
        <button className="hs-help-toggle" onClick={() => setHelpOpen(o => !o)}>
          {helpOpen ? '▲ FECHAR' : '? AJUDA'}
        </button>
      </div>

      {helpOpen && (
        <div className="hs-help-panel">
          <div className="hs-help-tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`hs-help-tab ${helpTab === i ? 'active' : ''}`} onClick={() => setHelpTab(i)}>{t}</button>
            ))}
          </div>
          {helpTab === 0 && (
            <div className="hs-help-content">
              <p>1. <strong>Arraste</strong> o dispositivo correto para cada slot.</p>
              <p>2. <strong>ENTRADA</strong> recebe dispositivos que <em>capturam</em> áudio.</p>
              <p>3. <strong>SAÍDA</strong> recebe dispositivos que <em>reproduzem</em> áudio.</p>
              <p>4. Leia as descrições — alguns dispositivos são ambíguos.</p>
              <p>5. Dispositivo errado: <strong>+{WRONG_PENALTY}s</strong>.</p>
            </div>
          )}
          {helpTab === 1 && (
            <div className="hs-help-content">
              <p>O SO gerencia áudio via <strong>ALSA</strong> (Linux) ou <strong>WDM/WASAPI</strong> (Windows).</p>
              <p>Dispositivos de <strong>entrada</strong> convertem som físico em sinal digital (ADC).</p>
              <p>Dispositivos de <strong>saída</strong> convertem sinal digital em som físico (DAC).</p>
              <p>Configuração incorreta causa ausência de sinal ou <strong>feedback</strong> de áudio.</p>
            </div>
          )}
        </div>
      )}

      <div className="hs-answer-bar">
        <button className="hs-peek-btn" onClick={handlePeek}>
          {showAnswer ? '▲ ESCONDER GABARITO' : `👁 VER GABARITO${!peeked ? ` (+${PEEK_PENALTY}s)` : ''}`}
        </button>
        {peeked && !showAnswer && <span className="hs-peeked-warn">⚠ +{PEEK_PENALTY}s aplicados</span>}
      </div>
      {showAnswer && (
        <div className="hs-answer">
          <span className="hs-answer-row">🔴 ENTRADA ← 🎤 Microfone</span>
          <span className="hs-answer-row">🟢 SAÍDA ← 🎧 Headset</span>
        </div>
      )}

      <div className="hs-body">
        <div className="hs-devices-col">
          <div className="hs-col-label">DISPOSITIVOS</div>
          {freeDevices.map(dev => (
            <div
              key={dev.id}
              className={`hs-device ${dragging === dev.id ? 'dragging' : ''}`}
              draggable
              onDragStart={() => setDragging(dev.id)}
              onDragEnd={() => setDragging(null)}
            >
              <span className="hs-device-icon">{dev.icon}</span>
              <div className="hs-device-info">
                <span className="hs-device-name">{dev.name}</span>
                <span className="hs-device-desc">{dev.desc}</span>
              </div>
              <span className="hs-device-drag">⠿</span>
            </div>
          ))}
          {freeDevices.length === 0 && <div className="hs-devices-empty">— todos conectados —</div>}
        </div>

        <div className="hs-soundcard">
          <div className="hs-soundcard-label">🎛 PLACA DE SOM</div>
          {SLOTS.map(slot => {
            const placedDev = DEVICES.find(d => d.id === slots[slot.id])
            return (
              <div
                key={slot.id}
                className={[
                  'hs-slot', slot.color,
                  wrongSlot === slot.id    ? 'wrong'   : '',
                  correctFlash === slot.id ? 'correct' : '',
                  placedDev ? 'filled' : '',
                ].join(' ')}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(slot.id)}
              >
                <div className="hs-slot-header">
                  <span className="hs-slot-dot">{slot.icon}</span>
                  <div>
                    <div className="hs-slot-label">{slot.label}</div>
                    <div className="hs-slot-sublabel">{slot.sublabel}</div>
                  </div>
                </div>
                {placedDev ? (
                  <div className="hs-slot-device" onClick={() => setSlots(p => ({ ...p, [slot.id]: null }))}>
                    <span className="hs-slot-device-icon">{placedDev.icon}</span>
                    <span className="hs-slot-device-name">{placedDev.name}</span>
                    <span className="hs-slot-remove">✕</span>
                  </div>
                ) : (
                  <div className="hs-slot-empty">
                    {dragging ? '↓ solte aqui' : 'arraste um dispositivo'}
                  </div>
                )}
              </div>
            )
          })}
          <div className="hs-soundcard-status">
            <div className={`hs-status-led ${slots.input && slots.output ? 'on' : ''}`} />
            <span>{slots.input && slots.output ? 'DISPOSITIVOS CONECTADOS' : 'AGUARDANDO...'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
