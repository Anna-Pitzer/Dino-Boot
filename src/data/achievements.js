export const ACHIEVEMENT_DEFS = [
  {
    id: 'perfect',
    name: 'PERFEITO',
    icon: '✨',
    description: 'Concluir o jogo sem erros.',
    accent: '#4CAF50',
  },
  {
    id: 'veloz',
    name: 'VELOZ',
    icon: '⚡',
    description: 'Completar dentro do tempo-alvo.',
    accent: '#F5C518',
  },
  {
    id: 'especialista',
    name: 'ESPECIALISTA',
    icon: '🧠',
    description: 'Concluir sem usar dicas.',
    accent: '#91BED4',
  },
  {
    id: 'tecnico',
    name: 'TÉCNICO',
    icon: '🛠️',
    description: 'Coletar todas as peças.',
    accent: '#F26101',
  },
  {
    id: 'boot-master',
    name: 'BOOT MASTER',
    icon: '🦕',
    description: 'Finalizar o boot sem componentes danificados.',
    accent: '#A855F7',
  },
]

export const ACHIEVEMENT_LOOKUP = Object.fromEntries(
  ACHIEVEMENT_DEFS.map(item => [item.id, item])
)

export function getRunAchievements({
  collectedPieces = [],
  damagedPieces = [],
  failedAttempts = 0,
  totalTimeSeconds = 0,
  usedHints = {},
  allPieceCount = 11,
}) {
  const achievements = []
  const usedHintTotal = Object.values(usedHints).reduce((total, hints) => total + (Array.isArray(hints) ? hints.length : 0), 0)

  if (failedAttempts === 0 && damagedPieces.length === 0) achievements.push('perfect')
  if (totalTimeSeconds > 0 && totalTimeSeconds <= 420) achievements.push('veloz')
  if (usedHintTotal === 0) achievements.push('especialista')
  if ((collectedPieces.length ?? 0) >= allPieceCount) achievements.push('tecnico')
  if (damagedPieces.length === 0 && (collectedPieces.length ?? 0) >= allPieceCount) achievements.push('boot-master')

  return achievements
}

export function getFinalResult({
  collectedPieces = [],
  damagedPieces = [],
  failedAttempts = 0,
  totalTimeSeconds = 0,
  usedHints = {},
  score = 0,
  coins = 0,
  allPieceCount = 11,
}) {
  const usedHintTotal = Object.values(usedHints).reduce((total, hints) => total + (Array.isArray(hints) ? hints.length : 0), 0)
  const collectedCount = collectedPieces.length ?? 0
  const damageCount = damagedPieces.length ?? 0

  if (damageCount > 0) {
    return {
      rank: 'FAIL',
      label: 'FINAL FAIL',
      accent: '#ff766d',
      summary: 'Boot não inicializado: componentes danificados impediram a carga do sistema.',
      criteria: [
        `Componentes danificados: ${damageCount}`,
        `Falhas: ${failedAttempts}`,
        `Peças coletadas: ${collectedCount}/${allPieceCount}`,
      ],
      score,
      timeSeconds: totalTimeSeconds,
      coins,
      pieces: collectedCount,
      medals: 0,
      hintsUsed: usedHintTotal,
      failedAttempts,
      damagedPieces: damageCount,
    }
  }

  const noHints = usedHintTotal === 0
  const noFailures = failedAttempts === 0
  const fastRun = totalTimeSeconds > 0 && totalTimeSeconds <= 420
  const allPieces = collectedCount >= allPieceCount

  if (noFailures && fastRun && noHints && allPieces) {
    return {
      rank: 'S',
      label: 'FINAL S',
      accent: '#f5c518',
      summary: 'Execução impecável: sem erros, sem dicas, com tempo excelente e todas as peças recuperadas.',
      criteria: [
        'Nenhum erro durante a partida.',
        'Tempo dentro do alvo.',
        'Sem uso de dicas.',
        'Todas as peças recuperadas.',
      ],
      score,
      timeSeconds: totalTimeSeconds,
      coins,
      pieces: collectedCount,
      medals: 0,
      hintsUsed: usedHintTotal,
      failedAttempts,
      damagedPieces: 0,
    }
  }

  if (noFailures && allPieces) {
    return {
      rank: 'A',
      label: 'FINAL A',
      accent: '#4cd77a',
      summary: 'Boot concluído com excelência e sem componentes danificados.',
      criteria: [
        'Boot concluído sem falha.',
        'Nenhum componente danificado.',
        'Todos os itens recuperados.',
      ],
      score,
      timeSeconds: totalTimeSeconds,
      coins,
      pieces: collectedCount,
      medals: 0,
      hintsUsed: usedHintTotal,
      failedAttempts,
      damagedPieces: 0,
    }
  }

  if (allPieces || totalTimeSeconds <= 900) {
    return {
      rank: 'B',
      label: 'FINAL B',
      accent: '#91BED4',
      summary: 'Jornada concluída com bom desempenho e boa estabilidade do sistema.',
      criteria: [
        'Boot inicializado com sucesso.',
        'Desempenho intermediário.',
        'Sistema estável o suficiente para concluir a partida.',
      ],
      score,
      timeSeconds: totalTimeSeconds,
      coins,
      pieces: collectedCount,
      medals: 0,
      hintsUsed: usedHintTotal,
      failedAttempts,
      damagedPieces: 0,
    }
  }

  return {
    rank: 'C',
    label: 'FINAL C',
    accent: '#ff8f42',
    summary: 'Boot concluído, mas com desempenho abaixo do ideal.',
    criteria: [
      'Sistema inicializado com dificuldades.',
      'Tempo ou eficiência abaixo da média.',
      'Jornada concluída, mas com margem para melhorar.',
    ],
    score,
    timeSeconds: totalTimeSeconds,
    coins,
    pieces: collectedCount,
    medals: 0,
    hintsUsed: usedHintTotal,
    failedAttempts,
    damagedPieces: 0,
  }
}
