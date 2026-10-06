import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { useGameAudio } from '../audio/useGameAudio'
import { PIECES } from '../data/pieces'
import { SUPPORT_ITEMS } from '../data/shopItems'
import hudDino from '../assets/copia-dino.png'
import './ShopScreen.css'

export default function ShopScreen({ onClose }) {
  const {
    coins,
    score,
    collectedPieces,
    lives,
    activePuzzle,
    supportInventory,
    buySupportItem,
    useSupportItem: activateSupportItem,
    goToBoot,
    navigateTo,
  } = useGame()
  const { playBack } = useGameAudio()
  const [supportMessage, setSupportMessage] = useState('')
  const isFinalShop = collectedPieces.length === PIECES.length && !onClose

  function handleBuy(item) {
    const wasPurchased = buySupportItem(item.id)
    setSupportMessage(wasPurchased
      ? `${item.name} foi adicionado ao inventário.`
      : 'Não foi possível comprar este item. Confira suas moedas e o limite do inventário.')
  }

  function handleSupportUse(item) {
    const result = activateSupportItem(item.id)
    setSupportMessage(result.message)
  }

  function handleClose() {
    playBack()
    if (onClose) {
      onClose()
    } else if (isFinalShop) {
      goToBoot()
    } else {
      navigateTo('map')
    }
  }

  return (
    <main
      className={`arc-root ${onClose ? 'arc-overlay' : ''}`}
      role={onClose ? 'dialog' : undefined}
      aria-modal={onClose ? 'true' : undefined}
      aria-label={onClose ? 'Loja de suporte' : undefined}
    >
      <section className="arc-cab">
        <header className="arc-marquee">
          <img className="arc-hud-dino" src={hudDino} alt="" />
          <h1>LOJA DE SUPORTE</h1>
        </header>

        <section className="arc-hud" aria-label="Status da partida">
          <div className="arc-stat"><small>SCORE</small><b>{String(score).padStart(6, '0')}</b></div>
          <div className="arc-stat"><small>MOEDAS</small><b>🪙 {coins}</b></div>
          <div className="arc-stat"><small>VIDAS</small><b>{'♥'.repeat(lives)}{'♡'.repeat(3 - lives)}</b></div>
          <div className="arc-bar">
            <small>RECUPERAÇÃO</small>
            <div className="arc-track" role="progressbar" aria-valuenow={collectedPieces.length} aria-valuemin={0} aria-valuemax={PIECES.length}>
              <div className="arc-fill" style={{ width: `${(collectedPieces.length / PIECES.length) * 100}%` }} />
            </div>
          </div>
        </section>

        <div className="arc-content">
          <section className="arc-catalog" aria-label="Itens de suporte úteis durante a partida">
            <div className="arc-store-intro">
              <h2>ITENS ÚTEIS NA PARTIDA</h2>
              <p>Compre ferramentas de suporte e use-as quando precisar.</p>
            </div>
            {supportMessage && <div className="arc-toast-message" role="status">{supportMessage}</div>}

            <div className="arc-list">
              {SUPPORT_ITEMS.map(item => {
                const count = supportInventory[item.id] ?? 0
                const owned = count > 0
                const canAfford = coins >= item.price
                const needsPuzzle = item.id === 'scanner' || item.id === 'manual_tecnico'
                const canUse = owned && (needsPuzzle ? Boolean(activePuzzle) : lives < 3)
                const useLabel = needsPuzzle && !activePuzzle
                  ? 'USE NO PUZZLE'
                  : item.id === 'kit_tecnico' && lives === 3
                    ? 'VIDAS CHEIAS'
                    : `USAR (${count})`

                return (
                  <article
                    key={item.id}
                    className={`arc-item ${owned ? 'eq' : ''} ${!canAfford && !owned ? 'unaffordable' : ''}`}
                  >
                    <span className="arc-ic" aria-hidden="true">{item.icon}</span>
                    <div className="arc-item-info">
                      <h3>{item.name}</h3>
                      <p>{item.desc}</p>
                      {owned && <span className="arc-tag">NO INVENTÁRIO: {count}</span>}
                    </div>
                    <div className="arc-item-action">
                      {owned ? (
                        <button
                          className="arc-buy own"
                          type="button"
                          onClick={() => handleSupportUse(item)}
                          disabled={!canUse}
                          title={!canUse ? 'Este item não pode ser usado agora.' : undefined}
                        >
                          {useLabel}
                        </button>
                      ) : (
                        <button
                          className={`arc-buy ${!canAfford ? 'no' : ''}`}
                          type="button"
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford}
                        >
                          🪙 {item.price}
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </div>

        <button className="arc-confirm" type="button" onClick={handleClose}>
          {onClose
            ? '↩ VOLTAR AO PUZZLE'
            : isFinalShop
              ? '▶ INICIAR O BOOT FINAL'
              : '↩ VOLTAR AO MAPA'}
        </button>
      </section>
    </main>
  )
}
