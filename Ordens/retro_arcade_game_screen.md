# Retro Arcade Game Screen

Tela de menu estilo arcade retrô feita em HTML puro com CSS.

## Visual

- Fundo com gradiente azul escuro (`#304269` → `#1a2540`)
- Fonte pixelada: **Press Start 2P** (Google Fonts)
- Container central com borda arredondada e sombra profunda
- Tela interna (`screen`) com gradiente azul claro simulando um monitor

## Componentes

### Placar (`score-board`)
| Campo | Valor |
|-------|-------|
| LEVEL | 01 |
| SCORE | 12450 |
| LIVES | 3 |

### LEDs animados
Três luzes piscando com delays escalonados:
- 🔴 Vermelho
- 🟠 Laranja (`#F26101`)
- 🔵 Azul (`#91BED4`)

### Botões
| Botão | Ação |
|-------|------|
| ▶ PLAY GAME | Efeito visual de clique |
| ★ HIGH SCORES | Alert com ranking de 3 jogadores |

## Animações CSS

| Nome | Efeito |
|------|--------|
| `flicker` | Título pisca levemente (opacity 1 → 0.8) |
| `glow` | Brilho laranja pulsante no título |
| `blink` | Subtítulo some e aparece a cada 1.5s |
| `pulse` | Botão PLAY escala levemente (1 → 1.05) |
| `ledBlink` | LEDs piscam com opacity 1 → 0.3 |

## Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul escuro | `#304269` | Bordas, fundo |
| Azul mais escuro | `#1a2540` | Gradiente base |
| Laranja | `#F26101` | Destaque, título, botão primário |
| Azul claro | `#91BED4` | Tela, LEDs |
| Azul muito claro | `#D9E8F5` | Tela, textos suaves |

## Responsividade

Deve ter
