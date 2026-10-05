import { useState } from 'react'
import { useGameAudio } from './useGameAudio'
import './AudioSettings.css'

function VolumeControl({ label, value, onChange, disabled = false }) {
  const percent = Math.round(value * 100)

  return (
    <label className={`audio-setting-volume ${disabled ? 'disabled' : ''}`}>
      <span>{label}</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        disabled={disabled}
        aria-label={`${label}: ${percent}%`}
        onChange={event => onChange(Number(event.target.value))}
      />
      <output>{percent}%</output>
    </label>
  )
}

export default function AudioSettings() {
  const [open, setOpen] = useState(false)
  const {
    preferences,
    setSfxEnabled,
    setMusicEnabled,
    setSfxVolume,
    setMusicVolume,
    playButton,
  } = useGameAudio()

  function togglePanel() {
    if (!open) playButton()
    setOpen(previous => !previous)
  }

  return (
    <div className="audio-settings">
      {open && (
        <section className="audio-settings-panel" aria-label="Configurações de áudio">
          <header className="audio-settings-header">
            <h2>ÁUDIO</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar configurações de áudio">
              ×
            </button>
          </header>

          <label className="audio-setting-toggle">
            <span>Sons</span>
            <input
              type="checkbox"
              checked={preferences.sfxEnabled}
              onChange={event => setSfxEnabled(event.target.checked)}
            />
            <strong>{preferences.sfxEnabled ? 'ON' : 'OFF'}</strong>
          </label>
          <VolumeControl label="SFX" value={preferences.sfxVolume} onChange={setSfxVolume} />

          <label className="audio-setting-toggle">
            <span>Música</span>
            <input
              type="checkbox"
              checked={preferences.musicEnabled}
              onChange={event => setMusicEnabled(event.target.checked)}
            />
            <strong>{preferences.musicEnabled ? 'ON' : 'OFF'}</strong>
          </label>
          <VolumeControl label="MÚSICA" value={preferences.musicVolume} onChange={setMusicVolume} />
          <p className="audio-settings-note">
            Trilha de fundo indisponível. As preferências serão usadas quando uma trilha adequada for adicionada.
          </p>
        </section>
      )}

      <button
        className="audio-settings-trigger"
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Fechar configurações de áudio' : 'Abrir configurações de áudio'}
        onClick={togglePanel}
      >
        ♫
      </button>
    </div>
  )
}
