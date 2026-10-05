import { CODEX_BY_CATEGORY } from '../data/codex'
import { PIECES } from '../data/pieces'
import { useGame } from '../hooks/useGame'
import { useGameAudio } from '../audio/useGameAudio'
import './CodexScreen.css'

const PIECE_BY_ID = Object.fromEntries(PIECES.map(piece => [piece.id, piece]))
const CODEX_CATEGORIES = Object.keys(CODEX_BY_CATEGORY)
const CODEX_ENTRIES = Object.values(CODEX_BY_CATEGORY).flat()

export default function CodexScreen() {
  const { discoveredCodex, navigateTo } = useGame()
  const { playBack } = useGameAudio()
  const discoveredCount = CODEX_ENTRIES.filter(entry => discoveredCodex[entry.id]).length
  const totalEntries = CODEX_ENTRIES.length
  const completionPercent = Math.round((discoveredCount / totalEntries) * 100)

  return (
    <div className="codex-screen">
      <div className="codex-panel">
        <header className="codex-header">
          <div className="codex-heading">
            <span className="codex-emblem" aria-hidden="true">▤</span>
            <div>
              <span className="codex-kicker">ARQUIVO DO SISTEMA · DATABASE 01</span>
              <h1>DINO CODEX</h1>
              <p>Conhecimento recuperado durante a restauração do DinoBootOS.</p>
            </div>
          </div>
          <button className="codex-close" type="button" onClick={() => { playBack(); navigateTo('map') }}>
            <span aria-hidden="true">←</span> VOLTAR AO MAPA
          </button>
        </header>

        <section className="codex-progress" aria-label={`Progresso do Codex: ${discoveredCount} de ${totalEntries} entradas`}>
          <div className="codex-progress-copy">
            <span>ARQUIVO DESBLOQUEADO</span>
            <strong>{String(discoveredCount).padStart(2, '0')} <i>/ {String(totalEntries).padStart(2, '0')}</i></strong>
          </div>
          <div className="codex-progress-track" role="progressbar" aria-valuenow={discoveredCount} aria-valuemin={0} aria-valuemax={totalEntries}>
            <span style={{ width: `${completionPercent}%` }} />
          </div>
          <span className="codex-progress-percent">{completionPercent}%</span>
        </section>

        <nav className="codex-index" aria-label="Categorias do Codex">
          {CODEX_CATEGORIES.map(category => (
            <a key={category} href={`#codex-${category.toLowerCase().replaceAll(' ', '-')}`}>
              {category}
              <span>{CODEX_BY_CATEGORY[category].length}</span>
            </a>
          ))}
        </nav>

        <div className="codex-groups">
          {Object.entries(CODEX_BY_CATEGORY).map(([category, entries], categoryIndex) => (
            <section
              key={category}
              id={`codex-${category.toLowerCase().replaceAll(' ', '-')}`}
              className={`codex-group category-${categoryIndex % 3}`}
            >
              <div className="codex-group-heading">
                <span className="codex-group-index">0{categoryIndex + 1}</span>
                <h2>{category}</h2>
                <span className="codex-group-count">{entries.length} REGISTROS</span>
              </div>

              <div className="codex-list">
                {entries.map(entry => {
                  const unlocked = !!discoveredCodex[entry.id]
                  const piece = PIECE_BY_ID[entry.id]

                  return (
                    <article key={entry.id} className={`codex-card ${unlocked ? 'unlocked' : 'locked'}`}>
                      <div className="codex-card-icon" aria-hidden="true">
                        {piece ? <img src={piece.img} alt="" /> : <span>⌁</span>}
                      </div>
                      <div className="codex-card-head">
                        <div className="codex-entry-title">
                          <span className="codex-entry-name">{entry.name}</span>
                          <span className="codex-entry-id">SYS // {entry.id.toUpperCase()}</span>
                        </div>
                        <span className={`codex-status ${unlocked ? 'discovered' : 'locked'}`}>
                          <i aria-hidden="true" />{unlocked ? 'REGISTRADO' : 'BLOQUEADO'}
                        </span>
                      </div>

                      {unlocked ? (
                        <>
                          <p className="codex-explanation">{entry.explanation}</p>
                          <p className="codex-relation"><strong>CONEXÃO COM O JOGO</strong>{entry.relation}</p>
                        </>
                      ) : (
                        <div className="codex-locked-copy">
                          <p>Conteúdo criptografado.</p>
                          <span>Recupere este componente no mapa para desbloquear o registro.</span>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
        <footer className="codex-footer">
          <span>DINOBOOTOS KNOWLEDGE ARCHIVE</span>
          <span>{discoveredCount} / {totalEntries} ENTRADAS RECUPERADAS</span>
        </footer>
      </div>
    </div>
  )
}
