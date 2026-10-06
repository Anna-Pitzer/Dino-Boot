export const SUPPORT_ITEMS = [
  { id: 'scanner', category: 'suporte', name: 'Scanner', price: 70, icon: '🔎', desc: 'Revela uma dica prática sobre o puzzle em andamento.', limit: 1 },
  { id: 'manual_tecnico', category: 'suporte', name: 'Manual Técnico', price: 60, icon: '📘', desc: 'Consulta a explicação e a relação do componente com o puzzle.', limit: 1 },
  { id: 'kit_tecnico', category: 'suporte', name: 'Kit Técnico', price: 90, icon: '🧰', desc: 'Recupera 1 vida perdida. Só pode ser usado abaixo do máximo de vidas.', limit: 2 },
]

export const DEFAULT_SUPPORT_INVENTORY = {
  scanner: 0,
  manual_tecnico: 0,
  kit_tecnico: 0,
}
