import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { useGameAudio } from '../audio/useGameAudio'
import { SHOP_ITEMS, CATEGORIES, SUPPORT_ITEMS } from '../data/shopItems'
import hudDino from '../assets/copia-dino.png'
import './ShopScreen.css'

export default function ShopScreen() {
  const { coins, score, collectedPieces, spendCoins, selectedSetup, selectSetupItem, goToBoot, supportInventory, buySupportItem, useSupportItem: activateSupportItem } = useGame()
  const { playButton, playSelect, playPurchase } = useGameAudio()
  const [activeCategory, setActiveCategory] = useState('gabinete')
  const [preview, setPreview] = useState(selectedSetup)
  const [supportMessage, setSupportMessage] = useState('')

  const categoryItems = activeCategory === 'suporte'
    ? SUPPORT_ITEMS
    : SHOP_ITEMS.filter(i => i.category === activeCategory)

  function getItem(id) { return SHOP_ITEMS.find(i => i.id === id) }

  function handleSelect(item) {
    if (item.category === 'suporte') return
    if (preview[item.category] === item.id) return
    playSelect()
    setPreview(prev => ({ ...prev, [item.category]: item.id }))
  }

  function handleBuy(item) {
    if (item.category === 'suporte') {
      const wasPurchased = buySupportItem(item.id)
      if (wasPurchased) {
        setSupportMessage(`${item.name} foi adicionado ao inventário.`)
      } else {
        setSupportMessage('Você não pode comprar este item agora.')
      }
      return
    }

    if (selectedSetup[item.category] === item.id) return
    const currentItem = getItem(selectedSetup[item.category])
    const refund = currentItem?.price ?? 0
    const cost   = item.price - refund
    if (cost > coins) return
    if (cost > 0) {
      spendCoins(cost)
      playPurchase()
    }
    selectSetupItem(item.category, item.id)
    setPreview(prev => ({ ...prev, [item.category]: item.id }))
  }

  function handleSupportUse(item) {
    const result = activateSupportItem(item.id)
    setSupportMessage(result.message)
  }

  function netCost(item) {
    const current = getItem(selectedSetup[item.category])
    return Math.max(0, item.price - (current?.price ?? 0))
  }

  const previewCase  = getItem(preview.gabinete)
  const previewPad   = getItem(preview.mousepad)
  const previewLamp  = getItem(preview.abajur)
  const previewDeco  = getItem(preview.decoracao)

  const setupSlots = [
    { category: 'gabinete', label: 'GABINETE', item: previewCase },
    { category: 'mousepad', label: 'MOUSEPAD', item: previewPad },
    { category: 'abajur', label: 'ILUMINAÇÃO', item: previewLamp },
    { category: 'decoracao', label: 'DECORAÇÃO', item: previewDeco },
  ]

  return (
    <main className="arc-root">
      <section className="arc-cab">
        <header className="arc-marquee">
          <img className="arc-hud-dino" src={hudDino} alt="" />
          <h1>MONTE SEU SETUP</h1>
        </header>

        <section className="arc-hud" aria-label="Status da partida">
          <div className="arc-stat"><small>SCORE</small><b>{String(score).padStart(6, '0')}</b></div>
          <div className="arc-stat"><small>MOEDAS</small><b>🪙 {coins}</b></div>
          <div className="arc-stat"><small>PEÇAS</small><b>{collectedPieces.length}/11</b></div>
          <div className="arc-bar">
            <small>RECUPERAÇÃO</small>
            <div className="arc-track" role="progressbar" aria-valuenow={collectedPieces.length} aria-valuemin={0} aria-valuemax={11}>
              <div className="arc-fill" style={{ width: `${(collectedPieces.length / 11) * 100}%` }} />
            </div>
          </div>
        </section>

        <div className="arc-content">
          <section className="arc-screen-wrap" aria-label="Prévia do setup">
            <div className="arc-bezel">
              <div className="arc-title">PREVIEW DO SETUP</div>
              <div className="arc-screen">
                <div className="arc-wall">
                  <div className={`arc-slot ${previewLamp.id === 'lamp-none' ? 'empty' : 'pop'}`}>
                    <span className="arc-ic">{previewLamp.icon}</span>
                    <span>{previewLamp.id === 'lamp-none' ? 'ILUMINAÇÃO' : previewLamp.name}</span>
                  </div>
                  <div className={`arc-slot ${previewDeco.id === 'deco-none' ? 'empty' : 'pop'}`}>
                    <span className="arc-ic">{previewDeco.icon}</span>
                    <span>{previewDeco.id === 'deco-none' ? 'DECORAÇÃO' : previewDeco.name}</span>
                  </div>
                  <div className="arc-slot">
                    <span className="arc-ic">🖥️</span>
                    <span>DINOBOOT OS</span>
                  </div>
                  <div className={`arc-slot ${previewCase ? 'pop' : 'empty'}`}>
                    <span className="arc-ic">{previewCase.icon}</span>
                    <span>{previewCase.name}</span>
                  </div>
                </div>
                <div className="arc-desk">
                  {setupSlots.map(({ category, label, item }) => (
                    <div className={`arc-slot ${item.id.endsWith('-none') ? 'empty' : 'pop'}`} key={category}>
                      <span className="arc-ic">{item.icon}</span>
                      <span>{item.id.endsWith('-none') ? label : item.name}</span>
                    </div>
                  ))}
                  <div className="arc-slot">
                    <span className="arc-ic">🦕</span>
                    <span>COMPANHEIRO</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="arc-confirm" type="button" onClick={goToBoot}>
              ▶ CONFIRMAR SETUP — IR PARA O BOOT
            </button>
          </section>

          <section className="arc-catalog" aria-label="Loja de itens para o setup">
            {supportMessage && <div className="arc-toast-message" role="status">{supportMessage}</div>}
            <nav className="arc-deck" aria-label="Categorias da loja">
              <div className="arc-group">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`arc-b ${activeCategory === cat.id ? 'on' : ''}`}
                    aria-pressed={activeCategory === cat.id}
                    onClick={() => { playButton(); setActiveCategory(cat.id) }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </nav>

            <div className="arc-list">
              {categoryItems.map(item => {
                const isSupport = item.category === 'suporte'
                const owned = isSupport ? (supportInventory[item.id] ?? 0) > 0 : selectedSetup[item.category] === item.id
                const count = isSupport ? (supportInventory[item.id] ?? 0) : 0
                const isPreviewing = !isSupport && preview[item.category] === item.id
                const cost = isSupport ? item.price : netCost(item)
                const canAfford = cost === 0 || coins >= cost

                return (
                  <article
                    key={item.id}
                    className={`arc-item ${owned ? 'eq' : ''} ${isPreviewing ? 'previewing' : ''} ${!canAfford && !owned ? 'unaffordable' : ''}`}
                    onClick={() => handleSelect(item)}
                    onKeyDown={event => {
                      if (!isSupport && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault()
                        handleSelect(item)
                      }
                    }}
                    role={isSupport ? undefined : 'button'}
                    tabIndex={isSupport ? undefined : 0}
                    aria-pressed={isSupport ? undefined : isPreviewing}
                  >
                    <span className="arc-ic" aria-hidden="true">{item.icon}</span>
                    <div className="arc-item-info">
                      <h3>{item.name}</h3>
                      <p>{item.desc}</p>
                      {isSupport && count > 0 && <span className="arc-tag">NO INVENTÁRIO: {count}</span>}
                      {!isSupport && isPreviewing && !owned && <span className="arc-tag preview-tag">EM PRÉVIA</span>}
                    </div>
                    <div className="arc-item-action">
                      {isSupport ? (
                        owned ? (
                          <button className="arc-buy own" type="button" onClick={event => { event.stopPropagation(); handleSupportUse(item) }}>
                            USAR ({count})
                          </button>
                        ) : (
                          <button className={`arc-buy ${!canAfford ? 'no' : ''}`} type="button" onClick={event => { event.stopPropagation(); handleBuy(item) }} disabled={!canAfford}>
                            🪙 {item.price}
                          </button>
                        )
                      ) : owned ? (
                        <span className="arc-tag">✓ EQUIPADO</span>
                      ) : (
                        <button className={`arc-buy ${!canAfford ? 'no' : ''}`} type="button" onClick={event => { event.stopPropagation(); handleBuy(item) }} disabled={!canAfford}>
                          {cost === 0 ? 'GRÁTIS' : `🪙 ${cost}`}
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
