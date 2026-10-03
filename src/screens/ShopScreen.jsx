import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { SHOP_ITEMS, CATEGORIES } from '../data/shopItems'
import './ShopScreen.css'

export default function ShopScreen() {
  const { coins, spendCoins, selectedSetup, selectSetupItem, goToBoot } = useGame()
  const [activeCategory, setActiveCategory] = useState('gabinete')
  const [preview, setPreview] = useState(selectedSetup)

  const categoryItems = SHOP_ITEMS.filter(i => i.category === activeCategory)

  function getItem(id) { return SHOP_ITEMS.find(i => i.id === id) }

  function handleSelect(item) {
    if (preview[item.category] === item.id) return
    setPreview(prev => ({ ...prev, [item.category]: item.id }))
  }

  function handleBuy(item) {
    if (selectedSetup[item.category] === item.id) return
    const currentItem = getItem(selectedSetup[item.category])
    const refund = currentItem?.price ?? 0
    const cost   = item.price - refund
    if (cost > coins) return
    if (cost > 0) spendCoins(cost)
    selectSetupItem(item.category, item.id)
    setPreview(prev => ({ ...prev, [item.category]: item.id }))
  }

  // Custo líquido de trocar para um item (considerando refund do atual)
  function netCost(item) {
    const current = getItem(selectedSetup[item.category])
    return Math.max(0, item.price - (current?.price ?? 0))
  }

  const previewCase  = getItem(preview.gabinete)
  const previewPad   = getItem(preview.mousepad)
  const previewLamp  = getItem(preview.abajur)
  const previewDeco  = getItem(preview.decoracao)

  return (
    <div className="shop-screen">
      <div className="shop-header">
        <div className="shop-title">🛒 MONTE SEU SETUP</div>
        <div className="shop-coins">🪙 {coins} moedas</div>
      </div>

      <div className="shop-body">

        {/* Preview */}
        <div className="shop-preview">
          <div className="shop-preview-label">PREVIEW DO SETUP</div>
          <div className="shop-desk">
            <div className="shop-desk-top">
              {previewLamp.id !== 'lamp-none' && (
                <div className="shop-desk-lamp">{previewLamp.icon}</div>
              )}
              {previewDeco.id !== 'deco-none' && (
                <div className="shop-desk-deco">{previewDeco.icon}</div>
              )}
            </div>
            <div className="shop-desk-main">
              <div className="shop-desk-case">{previewCase.icon}<span>{previewCase.name}</span></div>
            </div>
            <div className="shop-desk-bottom">
              <div className="shop-desk-pad">{previewPad.icon}<span>{previewPad.name}</span></div>
            </div>
          </div>
          <button className="shop-confirm-btn" onClick={goToBoot}>
            ▶ CONFIRMAR SETUP — IR PARA O BOOT
          </button>
        </div>

        {/* Loja */}
        <div className="shop-catalog">
          <div className="shop-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`shop-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="shop-items">
            {categoryItems.map(item => {
              const owned   = selectedSetup[item.category] === item.id
              const cost    = netCost(item)
              const canAfford = cost === 0 || coins >= cost

              return (
                <div
                  key={item.id}
                  className={[
                    'shop-item',
                    owned ? 'owned' : '',
                    preview[item.category] === item.id ? 'previewing' : '',
                    !canAfford && !owned ? 'unaffordable' : '',
                  ].join(' ')}
                  onClick={() => handleSelect(item)}
                >
                  <div className="shop-item-icon">{item.icon}</div>
                  <div className="shop-item-info">
                    <div className="shop-item-name">{item.name}</div>
                    <div className="shop-item-desc">{item.desc}</div>
                  </div>
                  <div className="shop-item-right">
                    {owned ? (
                      <span className="shop-badge owned">✓ EQUIPADO</span>
                    ) : item.price === 0 ? (
                      <button className="shop-buy-btn free" onClick={e => { e.stopPropagation(); handleBuy(item) }}>GRÁTIS</button>
                    ) : (
                      <button
                        className={`shop-buy-btn ${!canAfford ? 'disabled' : ''}`}
                        onClick={e => { e.stopPropagation(); handleBuy(item) }}
                        disabled={!canAfford}
                      >
                        🪙 {cost > 0 ? cost : '—'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
