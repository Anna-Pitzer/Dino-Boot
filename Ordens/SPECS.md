# SPECS — DinoBoot RPG

Stack: React 19 + Vite. Cada spec é uma unidade de trabalho independente.

> Estado atual: todas as specs principais do ciclo de jogo já foram implementadas e integradas ao projeto.

---

## SPEC-01 — Estrutura base do jogo ✅

**Objetivo:** limpar o boilerplate e criar a estrutura de pastas e contexto global.

### Tarefas
- Remover conteúdo padrão do `App.jsx` e `App.css`
- Criar estrutura de pastas:
  ```
  src/
  ├── components/
  ├── screens/
  ├── puzzles/
  ├── hooks/
  ├── context/
  └── data/
  ```
- Criar `GameContext` com estado global:
  - `collectedPieces: []`
  - `damagedPieces: []`
  - `lives: 3`
  - `score: 0`
  - `currentScreen: 'start'` — `'start' | 'map' | 'puzzle' | 'boot' | 'victory'`
  - `activePuzzle: null`
- Criar `useGame()` hook para consumir o contexto

### Arquivos
- `src/context/GameContext.jsx`
- `src/hooks/useGame.js`
- `src/App.jsx` — renderiza a screen ativa

---

## SPEC-02 — Tela do mapa ✅

**Objetivo:** criar o mapa explorável onde o dinossauro se move e encontra os puzzles.

### Tarefas
- Criar componente `MapScreen`
- Renderizar o dinossauro (`copia-dino.png`)
- Posicionar 11 pontos de interação no mapa (um por peça/periférico)
- Cada ponto exibe o PNG do componente (`src/assets/pngs/`)
- Cada ponto mostra estado: `available` / `collected` / `damaged` / `locked`
- Ao clicar em um ponto disponível → dino se move pelos waypoints até o destino (BFS + `async/await`)
- Dino vira para o lado correto (`scaleX(-1)`) conforme direção do movimento
- Mostrar pontuação, peças coletadas e vidas no HUD
- HUD com brand (logo dino + "DINOBOOT"), botão ↩ MENU que chama `resetGame()`
- HUD exibe moedas 🪙 acumuladas durante o jogo
- Tela inicial (`StartScreen`) baseada no `retro_arcade_game_screen.html` antes do mapa
- Design arcade com scanlines, efeito CRT, moldura com stripe colorida, botões com profundidade

### Mecânica de moedas
- Cada puzzle concluído concede **50 moedas base** + bônus de velocidade (`floor(timeBonus / 2)`)
- Moedas exibidas no HUD em dourado 🪙
- Ao coletar todas as 11 peças → redireciona para `ShopScreen` (SPEC-18) em vez de direto para o boot
- `coins` vive no `GameContext`, resetado com `resetGame()`
- `spendCoins(amount)` disponível para a loja consumir

### Regras de vidas implementadas
- 3 vidas globais exibidas como corações ♥ no HUD
- Errar um puzzle → `failPuzzle(id)` → peça fica `damaged` + perde 1 vida
- Peça `damaged` pode ser tentada novamente (custa 1 vida por tentativa)
- `lives === 0` → novas peças ficam `locked` (não clicáveis), apenas danificadas permanecem tentáveis
- Peças `damaged` no boot final causam falha na inicialização

### Estados visuais dos pontos
| Estado | Visual |
|---|---|
| `available` | Borda laranja, brilho laranja |
| `collected` | Borda verde, opacidade reduzida, ✓ |
| `damaged` | Sepia + escuro + borda marrom, badge `!` piscando |
| `locked` | Cinza opaco, 🔒, não clicável |

### Arquivos
- `src/screens/StartScreen.jsx` + `StartScreen.css`
- `src/screens/MapScreen.jsx`
- `src/screens/MapScreen.css`
- `src/data/pieces.js` — array com id, nome, posição no mapa e puzzle associado

---

## SPEC-03 — Shell de puzzle ✅

**Objetivo:** criar o container genérico que envolve todos os puzzles.

### Tarefas
- Criar componente `PuzzleShell` que recebe `puzzleId`
- Exibir: nome da peça, conceito de SO, cronômetro e vidas restantes
- Renderizar o puzzle correto via mapa `puzzleId → componente`
- Ao concluir com sucesso: chamar `completePuzzle(id, timeBonus)`
- Ao errar: chamar `failPuzzle(id)` → desconta vida + marca peça como danificada
- Mostrar feedback visual de acerto (verde) e erro (vermelho/shake)
- Botão de voltar ao mapa

### Arquivos
- `src/components/PuzzleShell.jsx`
- `src/components/PuzzleShell.css`
- `src/components/Timer.jsx` — cronômetro reutilizável

---

## SPEC-04 — Puzzle 1: CPU (Escalonamento Round Robin) ✅

**Objetivo:** jogador monta a fila de processos com Round Robin.

### Tarefas
- Mostrar 4 processos com seus tempos (A=4, B=2, C=6, D=1)
- Exibir regra: quantum = 2 ciclos
- Permitir arrastar processos para montar a fila (drag and drop)
- Botão "Executar" simula a sequência e valida

### Lógica de validação
Calcular a ordem de execução Round Robin e comparar com a fila montada pelo jogador.

### Arquivos
- `src/puzzles/PuzzleCPU.jsx`
- `src/puzzles/PuzzleCPU.css`

---

## SPEC-05 — Puzzle 2: RAM (Alocação de Memória) ✅

**Objetivo:** jogador aloca programas nos blocos de memória.

### Tarefas
- Mostrar blocos de memória com tamanhos variados (livres e ocupados)
- Mostrar programas com seus tamanhos (SO=20MB, Navegador=20MB, Jogo=30MB, Editor=10MB)
- Drag and drop: programa → bloco
- Bloquear alocação se o bloco for menor que o programa
- Validar quando todos os programas estiverem alocados

### Arquivos
- `src/puzzles/PuzzleRAM.jsx`
- `src/puzzles/PuzzleRAM.css`

---

## SPEC-06 — Puzzle 3: SSD (Sistema de Arquivos) ✅

**Objetivo:** jogador organiza arquivos em pastas e localiza um arquivo específico.

### Tarefas
- Mostrar arquivos soltos: `foto.png`, `trabalho.docx`, `sistema.conf`, `jogo.exe`, `musica.mp3`
- Mostrar pastas: `Documentos`, `Imagens`, `Sistema`, `Programas`, `Música`
- Drag and drop: arquivo → pasta correta
- Após organização, mostrar árvore de diretórios
- Pedir que o jogador clique no arquivo `/boot/boot.cfg`

### Arquivos
- `src/puzzles/PuzzleSSD.jsx`
- `src/puzzles/PuzzleSSD.css`

---

## SPEC-07 — Puzzle 4: GPU (Driver) ✅

**Objetivo:** jogador identifica e instala o driver correto.

### Tarefas
- Mostrar lista de dispositivos com estados (OK / ERRO)
- GPU aparece com ícone de erro
- Mostrar 3 drivers com versões diferentes
- Jogador clica/arrasta o driver correto para a GPU
- Validar compatibilidade (versão do driver = versão da GPU)

### Arquivos
- `src/puzzles/PuzzleGPU.jsx`
- `src/puzzles/PuzzleGPU.css`

---

## SPEC-08 — Puzzle 5: Placa-mãe (Conexão de Componentes) ✅

**Objetivo:** jogador conecta CPU, RAM, GPU e SSD nos encaixes corretos.

### Tarefas
- Mostrar placa-mãe simplificada com 4 slots identificados
- Mostrar os 4 componentes soltos
- Drag and drop: componente → slot correto
- Feedback visual imediato para conexão errada (vermelho) e correta (verde)

### Arquivos
- `src/puzzles/PuzzleMotherboard.jsx`
- `src/puzzles/PuzzleMotherboard.css`

---

## SPEC-09 — Puzzle 6: Teclado (Eventos de Entrada) ✅

**Objetivo:** jogador conecta teclas a códigos ASCII e decifra uma sequência.

### Tarefas
- Fase 1: mostrar pares tecla ↔ código para o jogador conectar (drag ou clique)
- Fase 2: mostrar sequência de códigos (ex: 68 65 67) e jogador digita ou seleciona as teclas

### Arquivos
- `src/puzzles/PuzzleKeyboard.jsx`
- `src/puzzles/PuzzleKeyboard.css`

---

## SPEC-10 — Puzzle 7: Mouse (Movimentação do Cursor) ✅

**Objetivo:** jogador executa sequência de movimentos para levar o cursor ao alvo.

### Tarefas
- Mostrar grid com cursor e alvo
- Mostrar sequência de setas (→ → ↓ ↓ ← ↑ →)
- Jogador clica nas setas na ordem correta
- Cursor se move no grid a cada clique correto
- Validar quando cursor chega ao alvo

### Arquivos
- `src/puzzles/PuzzleMouse.jsx`
- `src/puzzles/PuzzleMouse.css`

---

## SPEC-11 — Puzzle 8: Monitor (Configuração de Vídeo) ✅

**Objetivo:** jogador seleciona a configuração compatível com o monitor.

### Tarefas
- Mostrar especificações do monitor (ex: suporta 1920×1080 @ 60Hz)
- Mostrar 4 opções de configuração (resolução + taxa + orientação)
- Configurações erradas mostram preview distorcido
- Jogador seleciona a correta e confirma

### Arquivos
- `src/puzzles/PuzzleMonitor.jsx`
- `src/puzzles/PuzzleMonitor.css`

---

## SPEC-12 — Puzzle 9: Impressora (Fila de Impressão) ✅

**Objetivo:** jogador organiza a fila de documentos por prioridade.

### Tarefas
- Mostrar documentos com páginas e prioridade
- Apresentar a regra (ex: menor número de páginas primeiro)
- Drag and drop para reordenar a fila
- Botão "Imprimir" valida a ordem

### Arquivos
- `src/puzzles/PuzzlePrinter.jsx`
- `src/puzzles/PuzzlePrinter.css`

---

## SPEC-13 — Puzzle 10: Headset (I/O de Áudio) ✅

**Objetivo:** jogador conecta microfone à entrada e headset à saída.

### Tarefas
- Mostrar dispositivos: Microfone, Headset, dispositivo virtual (distração)
- Mostrar dois slots: Entrada e Saída
- Drag and drop: dispositivo → slot correto
- Validar quando ambos os slots estiverem corretos

### Arquivos
- `src/puzzles/PuzzleHeadset.jsx`
- `src/puzzles/PuzzleHeadset.css`

---

## SPEC-14 — Puzzle 11: Pendrive (Montagem) ✅

**Objetivo:** jogador monta o pendrive e localiza o arquivo solicitado.

### Tarefas
- Mostrar pendrive "conectado, não montado"
- Jogador seleciona o dispositivo correto (entre outros listados)
- Clica em "Montar"
- Navega na árvore `/media/USB-01/` e clica em `mapa.dat`

### Arquivos
- `src/puzzles/PuzzlePendrive.jsx`
- `src/puzzles/PuzzlePendrive.css`

---

## SPEC-15 — Puzzle Final: Boot do Sistema ✅

**Objetivo:** jogador ordena as 8 etapas de inicialização do computador.

### Tarefas
- Disponível somente após coletar todas as 11 peças
- Mostrar 8 etapas embaralhadas para o jogador ordenar via drag and drop
- Animação de boot ao confirmar a ordem correta
- **Peças danificadas causam falha:** cada peça `damaged` gera um erro na sequência de boot
- Erros de boot são exibidos um a um com mensagem específica da peça (ex: "ERRO: CPU danificada — falha no escalonamento")
- Se houver erros, o sistema não inicializa — exibe tela de falha com lista dos componentes com problema
- Exibir tela de vitória somente se nenhuma peça estiver danificada

### Etapas (ordem correta)
1. Conectar componentes
2. Inicializar BIOS/UEFI
3. Reconhecer hardware
4. Localizar SSD
5. Carregar bootloader
6. Carregar kernel
7. Iniciar processos
8. Exibir tela do SO

### Arquivos
- `src/puzzles/PuzzleBoot.jsx`
- `src/puzzles/PuzzleBoot.css`

---

## SPEC-16 — Tela de Vitória / Falha de Boot ✅

**Objetivo:** exibir resultado final após o puzzle de boot.

### Tarefas
- **Vitória** (sem peças danificadas): mostrar pontuação, tempo total e todas as peças coletadas
- **Falha de boot** (com peças danificadas): mostrar tela de erro com lista das peças danificadas e mensagem de falha
- Botão "Jogar novamente" reseta o `GameContext`

### Arquivos
- `src/screens/VictoryScreen.jsx`
- `src/screens/VictoryScreen.css`

---

## SPEC-18 — Loja de Customização do Setup ✅

**Objetivo:** após coletar todas as peças, o jogador gasta moedinhas para montar e personalizar o setup antes do boot final.

### Fluxo
1. Ao coletar a última peça → tela da loja abre antes do boot
2. Jogador gasta moedinhas em itens das categorias abaixo
3. Confirma o setup → vai para o puzzle de boot (SPEC-15)
4. O setup montado aparece na tela de vitória (SPEC-16)

### Moedas
- Cada puzzle concluído com sucesso concede moedinhas (ex: 50 base + bônus de velocidade)
- Exibidas no HUD do mapa junto com score
- Não são consumidas ao errar — só ao comprar na loja

### Categorias de itens
| Categoria | Exemplos |
|---|---|
| Gabinete | Mini-ITX simples, Torre gamer RGB, Gabinete retrô |
| Mousepad | Pequeno liso, Grande estampado, XL com LED |
| Abajur | Nenhum, Abajur retrô, Luz de néon |
| Decoração de mesa | Planta, Action figure, Caneca, Nenhuma |

### Regras
- Cada categoria tem pelo menos 1 opção gratuita (padrão)
- Itens premium custam moedinhas
- Jogador pode comprar apenas 1 item por categoria
- Preview em tempo real do setup ao selecionar item
- Botão "Confirmar Setup" → avança para o boot

### Arquivos
- `src/screens/ShopScreen.jsx`
- `src/screens/ShopScreen.css`
- `src/data/shopItems.js` — catálogo de itens com id, nome, categoria, preço, imagem
- `src/context/GameContext.jsx` — adicionar `coins`, `selectedSetup`, `spendCoins(amount)`, `selectSetupItem(category, itemId)`

---

## SPEC-17 — Sistema de Pontuação e Persistência ✅

**Objetivo:** calcular e salvar pontuação entre sessões.

### Tarefas
- Pontuação base: 100 pontos por peça coletada
- Bônus de velocidade: quanto menor o tempo, maior o bônus
- Salvar `collectedPieces` e `score` no `localStorage`
- Carregar estado salvo ao iniciar o jogo
- Função `resetGame()` limpa o `localStorage` e reseta o contexto

### Arquivos
- `src/context/GameContext.jsx` — persistência local e reset do progresso
- `src/hooks/useGame.js` — acesso aos dados globais do jogo

---

## Ordem de implementação recomendada (estado atual)

| Prioridade original | Spec | Status |
|---|---|---|
| 1 | SPEC-01 | ✅ Concluída |
| 2 | SPEC-02 | ✅ Concluída |
| 3 | SPEC-03 | ✅ Concluída |
| 4 | SPEC-09 | ✅ Concluída |
| 5 | SPEC-10 | ✅ Concluída |
| 6 | SPEC-06 | ✅ Concluída |
| 7 | SPEC-07 | ✅ Concluída |
| 8 | SPEC-05 | ✅ Concluída |
| 9 | SPEC-04 | ✅ Concluída |
| 10 | SPEC-11 | ✅ Concluída |
| 11 | SPEC-13 | ✅ Concluída |
| 12 | SPEC-14 | ✅ Concluída |
| 13 | SPEC-12 | ✅ Concluída |
| 14 | SPEC-08 | ✅ Concluída |
| 15 | SPEC-18 | ✅ Concluída |
| 16 | SPEC-15 | ✅ Concluída |
| 17 | SPEC-16 | ✅ Concluída |
| 18 | SPEC-17 | ✅ Concluída |

> O projeto já está em estado funcional com todos os módulos principais do ciclo principal do jogo concluídos.
