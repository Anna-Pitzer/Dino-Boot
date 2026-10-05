export const SHOP_ITEMS = [
  // Gabinete
  { id: 'case-simple',  category: 'gabinete',   name: 'Mini-ITX Simples',   price: 0,   icon: '🖥️',  desc: 'Compacto e funcional' },
  { id: 'case-gamer',   category: 'gabinete',   name: 'Torre Gamer RGB',    price: 80,  icon: '🎮',  desc: 'LEDs em todos os lados' },
  { id: 'case-retro',   category: 'gabinete',   name: 'Gabinete Retrô',     price: 60,  icon: '📺',  desc: 'Estilo anos 80' },

  // Mousepad
  { id: 'pad-small',    category: 'mousepad',   name: 'Pequeno Liso',       price: 0,   icon: '▪️',  desc: 'Básico e eficiente' },
  { id: 'pad-large',    category: 'mousepad',   name: 'Grande Estampado',   price: 40,  icon: '🗺️',  desc: 'Mapa do DinoBootOS' },
  { id: 'pad-xl',       category: 'mousepad',   name: 'XL com LED',         price: 70,  icon: '✨',  desc: 'Iluminação RGB nas bordas' },

  // Abajur
  { id: 'lamp-none',    category: 'abajur',     name: 'Sem Abajur',         price: 0,   icon: '⬛',  desc: 'Sem iluminação extra' },
  { id: 'lamp-retro',   category: 'abajur',     name: 'Abajur Retrô',       price: 30,  icon: '💡',  desc: 'Luz quente e aconchegante' },
  { id: 'lamp-neon',    category: 'abajur',     name: 'Luz de Néon',        price: 55,  icon: '🌈',  desc: 'Néon roxo e ciano' },

  // Decoração
  { id: 'deco-none',    category: 'decoracao',  name: 'Nenhuma',            price: 0,   icon: '⬛',  desc: 'Mesa limpa' },
  { id: 'deco-plant',   category: 'decoracao',  name: 'Plantinha',          price: 20,  icon: '🌱',  desc: 'Um toque de natureza' },
  { id: 'deco-figure',  category: 'decoracao',  name: 'Action Figure',      price: 35,  icon: '🦕',  desc: 'Dino de coleção' },
  { id: 'deco-mug',     category: 'decoracao',  name: 'Caneca',             price: 15,  icon: '☕',  desc: 'Café para codar' },
]

export const SUPPORT_ITEMS = [
  { id: 'scanner', category: 'suporte', name: 'Scanner', price: 70, icon: '🔎', desc: 'Revela uma pista extra sobre o puzzle atual.', limit: 1 },
  { id: 'manual_tecnico', category: 'suporte', name: 'Manual Técnico', price: 60, icon: '📘', desc: 'Desbloqueia uma explicação conceitual do componente.', limit: 1 },
  { id: 'kit_tecnico', category: 'suporte', name: 'Kit Técnico', price: 90, icon: '🧰', desc: 'Restaura 1 vida quando o sistema estiver instável.', limit: 2 },
  { id: 'checkpoint', category: 'suporte', name: 'Checkpoint', price: 110, icon: '💾', desc: 'Guarda o progresso atual para recuperar a partida.', limit: 1 },
]

export const SHOP_ITEMS_WITH_SUPPORT = [...SHOP_ITEMS, ...SUPPORT_ITEMS]

export const CATEGORIES = [
  { id: 'gabinete',  label: 'GABINETE'   },
  { id: 'mousepad',  label: 'MOUSEPAD'   },
  { id: 'abajur',    label: 'ABAJUR'     },
  { id: 'decoracao', label: 'DECORAÇÃO'  },
  { id: 'suporte',   label: 'SUPORTE'    },
]

export const DEFAULT_SETUP = {
  gabinete:  'case-simple',
  mousepad:  'pad-small',
  abajur:    'lamp-none',
  decoracao: 'deco-none',
  suporte:   'support-none',
}

export const SUPPORT_NONE_ITEM = {
  id: 'support-none',
  category: 'suporte',
  name: 'Sem item de suporte',
  price: 0,
  icon: '⬜',
  desc: 'Nenhum item de suporte ativado',
  limit: 0,
}

export const SHOP_ITEMS_FULL = [...SHOP_ITEMS, ...SUPPORT_ITEMS, SUPPORT_NONE_ITEM]
