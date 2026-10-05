import { PIECES } from '../data/pieces'
import './DiagnosticPanel.css'

function getDiagnosticStatus(pieceId, collectedPieces, damagedPieces, outOfLives) {
  if (collectedPieces.includes(pieceId)) return 'OK'
  if (damagedPieces.includes(pieceId)) return 'ERROR'
  if (outOfLives) return 'LOCKED'
  return 'UNKNOWN'
}

export default function DiagnosticPanel({ collectedPieces, damagedPieces, outOfLives, onClose }) {
  const rows = PIECES.map(piece => {
    const status = getDiagnosticStatus(piece.id, collectedPieces, damagedPieces, outOfLives)

    const detailMap = {
      OK: `${piece.name} está estável e dentro dos parâmetros esperados do sistema.`,
      ERROR: `${piece.name} apresentou inconsistência e pode estar comprometendo a inicialização do sistema.`,
      LOCKED: `${piece.name} está indisponível no momento; a energia e a integridade do sistema precisam ser restauradas.`,
      UNKNOWN: `${piece.name} ainda não foi verificado ou localizado no mapa.`,
    }

    return {
      ...piece,
      status,
      detail: detailMap[status],
    }
  })
  const statusCounts = rows.reduce((counts, piece) => {
    const key = piece.status.toLowerCase()
    counts[key] += 1
    return counts
  }, { ok: 0, error: 0, unknown: 0, locked: 0 })

  return (
    <div className="diagnostic-backdrop" onClick={onClose}>
      <div
        className="diagnostic-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Painel de diagnóstico do sistema"
        onClick={event => event.stopPropagation()}
      >
        <div className="diagnostic-header">
          <div>
            <p className="diagnostic-kicker">SYSTEM CHECK</p>
            <h2>DIAGNÓSTICO</h2>
            <p className="diagnostic-subtitle">Estado dos componentes e subsistemas</p>
          </div>
          <button type="button" className="diagnostic-close" onClick={onClose} aria-label="Fechar diagnóstico">
            ✕
          </button>
        </div>

        <div className="diagnostic-summary" aria-label="Resumo do diagnóstico">
          <div className="diagnostic-summary-item ok">
            <span>ESTÁVEIS</span>
            <strong>{statusCounts.ok}</strong>
          </div>
          <div className="diagnostic-summary-item error">
            <span>COM FALHA</span>
            <strong>{statusCounts.error}</strong>
          </div>
          <div className="diagnostic-summary-item unknown">
            <span>NÃO VERIFICADOS</span>
            <strong>{statusCounts.unknown}</strong>
          </div>
          <div className="diagnostic-summary-item locked">
            <span>BLOQUEADOS</span>
            <strong>{statusCounts.locked}</strong>
          </div>
        </div>

        <div className="diagnostic-list">
          {rows.map(piece => (
            <div key={piece.id} className={`diagnostic-row status-${piece.status.toLowerCase()}`}>
              <img className="diagnostic-piece-image" src={piece.img} alt="" />
              <div className="diagnostic-name-block">
                <span className="diagnostic-name">{piece.name}</span>
                <span className="diagnostic-concept">{piece.concept}</span>
              </div>

              <div className="diagnostic-state">
                <span className={`diagnostic-badge ${piece.status.toLowerCase()}`}>{piece.status}</span>
              </div>

              <p className="diagnostic-detail">{piece.detail}</p>
            </div>
          ))}
        </div>
        <div className="diagnostic-footer">
          <span>ANÁLISE DE {rows.length} COMPONENTES</span>
          <button type="button" className="diagnostic-footer-close" onClick={onClose}>FECHAR</button>
        </div>
      </div>
    </div>
  )
}
