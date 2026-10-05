export const ACTS = [
  {
    id: 'descubra',
    name: 'ATO 1 — DESCUBRA',
    focus: 'Fundamentos',
    pieceIds: ['cpu', 'ram', 'ssd'],
    accent: '#ff8f42',
  },
  {
    id: 'monte',
    name: 'ATO 2 — MONTE',
    focus: 'Construção do computador',
    pieceIds: ['motherboard', 'gpu', 'monitor'],
    accent: '#91BED4',
  },
  {
    id: 'conecte',
    name: 'ATO 3 — CONECTE',
    focus: 'Interação e periféricos',
    pieceIds: ['keyboard', 'mouse', 'headset', 'printer', 'pendrive'],
    accent: '#4cd77a',
  },
  {
    id: 'inicialize',
    name: 'ATO 4 — INICIALIZE',
    focus: 'Integração final',
    pieceIds: [],
    accent: '#f5c518',
  },
]

export function getActProgress(collectedPieces = []) {
  const collectedSet = new Set(collectedPieces)

  return ACTS.map(act => {
    const collectedCount = act.pieceIds.filter(id => collectedSet.has(id)).length
    const totalPieces = act.pieceIds.length
    const completed = totalPieces === 0 ? collectedPieces.length >= 11 : collectedCount === totalPieces

    return {
      ...act,
      completed,
      current: false,
      collectedCount,
      totalPieces,
    }
  })
}
