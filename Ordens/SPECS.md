# SPECS — DinoBoot RPG

Stack: React 19 + Vite. Cada spec é uma unidade de trabalho independente.

> Estado atual: o ciclo principal está implementado. O andamento das melhorias adicionais está indicado na tabela de status ao final deste documento.

## Visão geral do jogo

DinoBoot é um jogo web em estilo arcade/RPG de troubleshooting de hardware e sistemas operacionais. O jogador explora um mapa, coleta peças de hardware, resolve puzzles temáticos de cada componente, gasta moedas em uma loja de customização e tenta inicializar o sistema em um boot final.

### Loop principal
1. Abertura com tela inicial e carregamento de progresso salvo.
2. Exploração do mapa com movimentação do dinossauro e interações por pontos de interesse.
3. Resolução de 11 puzzles de componentes: CPU, RAM, SSD, GPU, placa-mãe, teclado, mouse, monitor, impressora, headset e pendrive.
4. Coleta de peças e manutenção de vidas, score e moedas.
5. Loja de setup após completar todos os itens, com customização por categoria.
6. Boot final do sistema com validação de ordem de inicialização e falha por peças danificadas.
7. Tela de vitória ou falha com resumo do tempo total, score e itens do setup.

### Mecânicas implementadas
- 3 vidas globais com redução por erro.
- 11 peças de hardware com estados: `available`, `collected`, `damaged` e `locked`.
- Sistema de score por peça resolvida e bônus por velocidade.
- Sistema de moedas `coins`, consumidas na loja e exibidas em HUD e tela final.
- Persistência no `localStorage` para continuar jogo após fechar a aba.
- Navegação por histórico do navegador e suporte a botão de voltar.
- Mapa com caminho automatizado do dinossauro até o alvo.
- Suporte de teclado no puzzle de teclado com setas e `Enter`.
- Tela final com apuração de tempo total, score e lista de falhas.
- Dificuldade selecionável entre Normal, Hard e Master; a cobertura varia por puzzle.
- Dicas por puzzle, com registro de uso e impacto nas recompensas.
- Medalhas por desempenho, persistência de desbloqueios e melhor score entre partidas.
- Mapa com iluminação progressiva conforme as peças são recuperadas e sinalização de componentes danificados.
- Painel de diagnóstico com resumo dos estados e detalhes dos componentes em layout responsivo.
- Dino Codex com progresso de descoberta, categorias navegáveis e registros bloqueados/desbloqueados.
- Efeitos sonoros arcade e preferências de áudio persistentes.

### Componentes do jogo
| Componente | Conceito do puzzle |
|---|---|
| CPU | Escalonamento Round Robin |
| RAM | Alocação de memória |
| SSD | Sistema de arquivos e organização de pastas |
| GPU | Instalação do driver correto |
| Placa-mãe | Conexão de periféricos e slots |
| Teclado | Eventos de entrada e decodificação de caracteres |
| Mouse | Movimentação do cursor e direção |
| Monitor | Resolução e taxa de atualização correta |
| Impressora | Ordenação da fila por prioridade |
| Headset | Conexão de entrada e saída de áudio |
| Pendrive | Montagem e localização do arquivo correto |

### Estados de jogo e regras
- `currentScreen`: `start`, `map`, `puzzle`, `shop`, `boot`, `victory`.
- `collectedPieces`: lista de peças resolvidas com sucesso.
- `damagedPieces`: itens que falharam em algum puzzle e continuam tentáveis.
- `lives === 0`: bloqueia novos pontos de interação e mantém apenas os danificados ativos.
- `completePuzzle(id, timeBonus)`: marca peça como coletada, soma pontos e moedas.
- `failPuzzle(id)`: adiciona a peça à lista de danificados e reduz 1 vida.
- `completeGame()`: conclui a jornada com sucesso, se o boot final estiver correto.

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
  - `coins: 0`
  - `totalTimeSeconds: 0`
  - `currentScreen: 'start'` — `'start' | 'map' | 'puzzle' | 'shop' | 'boot' | 'victory'`
  - `activePuzzle: null`
  - `dinoState: { pieceId, x, y, flipX }`
  - `selectedSetup: DEFAULT_SETUP`
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
- `resetGame()` remove a chave do save da partida e reseta o contexto.
- O save volta a ser criado quando uma nova partida começa.
- Apagar o save não deve apagar preferências independentes, como configurações de áudio.

### Arquivos
- `src/context/GameContext.jsx` — persistência local e reset do progresso
- `src/hooks/useGame.js` — acesso aos dados globais do jogo

---

## SPEC-19 — Navegação, acessibilidade e tempo final ✅

**Objetivo:** entregar o fluxo completo e mais confortável de jogo, com suporte de navegação historicamente consistente e feedback final do tempo total do jogador.

### Tarefas
- Botão de voltar funcional em telas internas do jogo usando `history.back()` e sincronização com `popstate`
- Navegação centralizada no `GameContext` para transição entre telas (`navigateTo`, `goBack`, `resetGame`)
- Teclado do puzzle de teclado suportando setas do teclado e `Enter` para interagir com a sequência de comandos
- Ajuste de foco/uso por teclado em telas interativas sem quebrar o fluxo visual do jogo
- Contador global de tempo de jogo em segundos (`totalTimeSeconds`)
- Exibição do tempo total formatado em MM:SS na tela de vitória/falha do boot
- `VictoryScreen` exibindo pontuação, moedas, peças e tempo de jogo total

### Arquivos
- `src/App.jsx` — sincronização de navegação com histórico do navegador
- `src/context/GameContext.jsx` — controle de estados de navegação e cronômetro global
- `src/puzzles/PuzzleKeyboard.jsx` — suporte por teclado com setas e Enter
- `src/screens/VictoryScreen.jsx` — render do tempo total final

---

## SPEC-20 — Polimento visual final do jogo ✅

**Objetivo:** melhorar a aparência geral das telas do jogo sem mexer na tela inicial, mantendo o estilo arcade retrô com identidade mais forte.

### Tarefas
- Ajuste de paleta para reforçar contraste, neons e elementos marcantes
- Melhorias visuais em mapa, loja, painel de puzzles, boot e tela de resultado
- Aumento da legibilidade de HUD, textos, botões e indicadores de progresso
- Apresentação mais premium de cards, previews e telas de feedback
- Manutenção da consistência visual entre todas as telas do fluxo principal do jogo

---

## SPEC-21 — Sistema de Diagnóstico do Sistema ✅

**Objetivo:** criar uma ferramenta de diagnóstico que faça o jogador sentir que está investigando e solucionando problemas de um computador, em vez de apenas selecionando pontos no mapa.

### Tarefas

* Criar um painel/modal `DiagnosticPanel`.
* Adicionar botão `DIAGNÓSTICO` ao HUD do mapa.
* Exibir o estado atual dos principais componentes:

  * CPU
  * RAM
  * SSD
  * GPU
  * Placa-mãe
  * Teclado
  * Mouse
  * Monitor
  * Impressora
  * Headset
  * Pendrive
* Utilizar os estados reais das peças:

  * `OK` — peça coletada e sem dano.
  * `ERROR` — peça danificada.
  * `UNKNOWN` — peça ainda não encontrada.
  * `LOCKED` — peça indisponível.
* Exibir mensagens de diagnóstico contextualizadas.
* O diagnóstico não deve revelar automaticamente a solução completa de um puzzle.
* O painel deve ajudar o jogador a entender o problema sem substituir a resolução do puzzle.
* Atualizar o diagnóstico imediatamente após coletar ou danificar uma peça.
* Apresentar o estado geral em um resumo e os componentes em cards legíveis.
* Manter o conteúdo acessível em telas menores, com rolagem interna quando necessário.

### Exemplo

```text
╔══════════════════════════════════╗
║        SYSTEM DIAGNOSTIC         ║
╠══════════════════════════════════╣
║ CPU          ✓ OK                ║
║ RAM          ✓ OK                ║
║ SSD          ? UNKNOWN            ║
║ GPU          ✕ ERROR              ║
║ MOTHERBOARD  ✓ OK                ║
║ KEYBOARD     ? UNKNOWN            ║
╚══════════════════════════════════╝
```

### Arquivos

* `src/components/DiagnosticPanel.jsx`
* `src/components/DiagnosticPanel.css`

---

## SPEC-22 — Dificuldade Progressiva dos Puzzles

**Objetivo:** aumentar progressivamente a complexidade dos conceitos sem precisar criar novos tipos de puzzle.

### Tarefas

* Implementar níveis de dificuldade para os puzzles existentes:

  * `normal`
  * `hard`
  * `master`
* A dificuldade deve alterar a complexidade do desafio, não apenas diminuir o tempo disponível.
* Exemplos:

  * CPU: mais processos, tempos diferentes e maior complexidade de Round Robin.
  * RAM: mais blocos e situações de alocação mais complexas.
  * SSD: mais arquivos, pastas e caminhos.
  * GPU: mais drivers e informações de compatibilidade.
  * Placa-mãe: mais conexões e componentes.
  * Teclado: sequências maiores e códigos adicionais.
  * Mouse: caminhos mais longos.
  * Monitor: mais combinações de resolução e taxa de atualização.
  * Impressora: filas maiores e regras de prioridade mais complexas.
  * Headset: mais dispositivos de entrada e saída.
  * Pendrive: árvore de diretórios maior.
* O primeiro contato com cada conceito deve continuar acessível.
* Dificuldades superiores devem testar compreensão, e não apenas memorização.

### Arquivos

* Atualizar os arquivos existentes em `src/puzzles/`.
* Opcionalmente criar `src/data/puzzleDifficulty.js`.

---

## SPEC-23 — Sistema de Dicas

**Objetivo:** permitir que o jogador receba ajuda contextual sem entregar imediatamente a resposta.

### Tarefas

* Criar sistema de dicas reutilizável para os puzzles.
* Cada puzzle deve possuir pelo menos duas dicas.
* A primeira dica deve lembrar ou explicar o conceito.
* A segunda deve direcionar o raciocínio de forma mais específica.
* Dicas não devem simplesmente revelar a resposta.
* Adicionar botão `DICA` ao `PuzzleShell`.
* Registrar se o jogador utilizou dicas.
* O uso de dicas deve influenciar recompensas e medalhas.

### Integração com moedas

* A primeira dica pode ser gratuita.
* Dicas adicionais podem consumir moedas.
* O custo deve ser configurável por puzzle.
* O jogador deve visualizar o custo antes de confirmar.

### Exemplo

```text
DICA 1
"Round Robin trabalha com um quantum fixo."

DICA 2
"Quando um processo não termina durante o quantum,
ele volta para o final da fila."
```

### Arquivos

* `src/components/HintSystem.jsx`
* `src/components/HintSystem.css`
* `src/data/puzzleHints.js`

---

## SPEC-24 — Medalhas e Recompensas de Desempenho ✅

**Objetivo:** aumentar a rejogabilidade e recompensar diferentes estilos de jogo.

### Medalhas implementadas

* `PERFEITO` — concluir sem erros.
* `VELOZ` — concluir dentro do tempo-alvo.
* `ESPECIALISTA` — concluir sem utilizar dicas.
* `TÉCNICO` — concluir todos os puzzles.
* `BOOT MASTER` — concluir o boot final sem componentes danificados.

### Comportamento implementado

* As medalhas são calculadas automaticamente na conclusão do boot.
* `PERFEITO` exige zero tentativas com falha durante a partida; reparar uma peça depois de errar não apaga a falha.
* `VELOZ` é concedida em até 420 segundos.
* `ESPECIALISTA` exige concluir sem usar dicas.
* `TÉCNICO` exige coletar todas as peças.
* `BOOT MASTER` exige todas as peças coletadas e nenhuma peça danificada ao concluir.
* Medalhas desbloqueadas são registradas e persistidas no `localStorage`; reiniciar a partida não remove os desbloqueios.
* A tela final mostra as medalhas e destaca as obtidas na partida atual.
* O melhor resultado é mantido entre partidas, comparando o score final de boots concluídos; o score e o tempo do recorde são exibidos na tela final.

### Arquivos

* `src/data/achievements.js`
* `src/components/AchievementBadge.jsx`
* `src/components/AchievementBadge.css`
* Atualizar `GameContext.jsx`
* Atualizar `VictoryScreen.jsx`

---

## SPEC-25 — Evolução Visual do Mapa ✅

**Objetivo:** fazer o mapa demonstrar visualmente o progresso do jogador.

### Comportamento implementado

* O estado visual deriva de `collectedPieces` e `damagedPieces` do `GameContext`.
* Com zero peças recuperadas, o mapa apresenta escurecimento e o status `OFFLINE`.
* Durante a recuperação, a iluminação geral aumenta proporcionalmente ao número de peças coletadas e o status exibe a porcentagem.
* Cada componente coletado recebe uma luz verde localizada na sua área do mapa.
* Componentes atualmente danificados recebem uma luz vermelha; a marcação some quando o componente é recuperado.
* Com todas as peças coletadas, o mapa chega à iluminação máxima e exibe `ONLINE · 100%`.
* As luzes são overlays decorativos: não alteram posições, dimensões ou interação dos pontos do mapa.

### Regras

* Os efeitos não devem prejudicar a legibilidade nem cobrir os controles dos puzzles.
* Os overlays usam elementos CSS leves e não adicionam dependências.
* Não há animação contínua de flutuação/deslocamento dos elementos da tela.

---

## SPEC-26 — Expansão da Loja com Itens de Suporte

**Objetivo:** fazer as moedas terem utilidade durante toda a campanha, mantendo a customização como elemento principal.

### Categorias existentes

Manter:

* Gabinete
* Mousepad
* Abajur
* Decoração de mesa

### Nova categoria: Itens de Suporte

Exemplos:

* `Scanner` — fornece uma informação adicional sobre um puzzle.
* `Manual Técnico` — desbloqueia uma explicação conceitual.
* `Kit Técnico` — permite recuperar uma vida, seguindo as regras de balanceamento.
* `Checkpoint` — permite preservar determinado progresso.

### Regras

* Itens de suporte devem ser limitados e balanceados.
* Não utilizar dinheiro real.
* O jogador deve conseguir terminar o jogo sem comprar itens de suporte.
* Itens de suporte não podem tornar a vitória automática.
* Itens cosméticos continuam disponíveis normalmente.
* A loja deve continuar funcionando como sistema de personalização.

### Arquivos

* Atualizar `src/data/shopItems.js`
* Atualizar `src/screens/ShopScreen.jsx`
* Atualizar `src/screens/ShopScreen.css`
* Atualizar `src/context/GameContext.jsx` quando necessário.

---

## SPEC-27 — Boot Final Cinematográfico

**Objetivo:** transformar o boot final na conclusão visual da jornada.

### Tarefas

Manter as 8 etapas de inicialização existentes:

1. Conectar componentes
2. Inicializar BIOS/UEFI
3. Reconhecer hardware
4. Localizar SSD
5. Carregar bootloader
6. Carregar kernel
7. Iniciar processos
8. Exibir tela do SO

Após a confirmação da ordem correta:

* Executar uma sequência visual de boot.
* Mostrar BIOS/UEFI.
* Mostrar detecção de hardware.
* Mostrar SSD.
* Mostrar bootloader.
* Mostrar kernel.
* Mostrar processos.
* Mostrar carregamento do sistema operacional.
* Utilizar barras ou indicadores de progresso.
* Mostrar status individual dos componentes.
* Se houver peça danificada, apresentar o erro correspondente no momento apropriado.
* Se tudo estiver correto, finalizar com uma mensagem de sistema pronto.

### Exemplo

```text
DINOBOOT BIOS v1.0

[CPU ............. OK]
[RAM ............. OK]
[GPU ............. OK]
[SSD ............. OK]

Detecting hardware...
████████████████ 100%

Loading bootloader...
████████████████ 100%

Loading kernel...
████████████████ 100%

Starting processes...

SYSTEM READY
```

### Integração

* O setup escolhido na loja deve aparecer no computador durante a conclusão.
* O resultado deve refletir os componentes realmente coletados.
* Componentes danificados devem produzir os erros correspondentes.
* A animação não pode ignorar o estado real do jogo.

### Arquivos

* Atualizar `src/puzzles/PuzzleBoot.jsx`
* Atualizar `src/puzzles/PuzzleBoot.css`

---

## SPEC-28 — Sistema de Finais e Ranking

**Objetivo:** criar diferentes resultados finais de acordo com o desempenho do jogador.

### Finais

#### Final S

* Nenhum erro.
* Excelente tempo.
* Nenhuma dica utilizada ou requisitos equivalentes de desempenho.

#### Final A

* Boot concluído sem componentes danificados.

#### Final B

* Jornada concluída com desempenho intermediário.

#### Final C

* Boot concluído com desempenho baixo.

#### Final FAIL

* Boot não inicializado devido a componentes danificados.

### Tarefas

* Criar cálculo centralizado do resultado final.
* Exibir classificação na tela final.
* Mostrar os critérios responsáveis pela classificação.
* Exibir:

  * score;
  * tempo;
  * moedas;
  * peças coletadas;
  * medalhas;
  * dicas utilizadas;
  * falhas;
  * componentes danificados.
* Manter compatibilidade com a tela atual de vitória/falha.

### Arquivos

* `src/data/endings.js`
* Atualizar `src/screens/VictoryScreen.jsx`
* Atualizar `src/screens/VictoryScreen.css`

---

## SPEC-29 — DINO CODEX

**Objetivo:** criar uma enciclopédia interna para registrar os conceitos aprendidos durante os puzzles.

### Estrutura

```text
DINO CODEX

HARDWARE
 ├─ CPU
 ├─ RAM
 ├─ GPU
 ├─ SSD
 └─ Placa-mãe

SISTEMAS OPERACIONAIS
 ├─ Processos
 ├─ Memória
 ├─ Sistema de arquivos
 └─ Boot

PERIFÉRICOS
 ├─ Teclado
 ├─ Mouse
 ├─ Monitor
 ├─ Impressora
 └─ Áudio
```

### Tarefas

* Criar tela ou painel `CodexScreen`.
* Cada conceito começa bloqueado.
* Resolver o puzzle correspondente desbloqueia a entrada.
* Cada entrada deve conter:

  * nome;
  * categoria;
  * explicação curta;
  * relação com o puzzle;
  * status de descoberta.
* Permitir consultar entradas já desbloqueadas durante o jogo.
* O Codex não deve revelar automaticamente a solução de um puzzle.
* Persistir descobertas no `localStorage`.
* Exibir o progresso de entradas descobertas e permitir navegar pelas categorias.
* Diferenciar visualmente entradas bloqueadas e descobertas, mantendo a leitura responsiva em dispositivos móveis.

### Arquivos

* `src/screens/CodexScreen.jsx`
* `src/screens/CodexScreen.css`
* `src/data/codex.js`

---

## SPEC-30 — Estrutura de Progressão em Atos

**Objetivo:** organizar os 11 componentes existentes em uma progressão conceitual clara.

### ATO 1 — DESCUBRA

**Foco:** fundamentos.

* CPU
* RAM
* SSD

O jogador aprende conceitos fundamentais de processamento, memória e armazenamento.

### ATO 2 — MONTE

**Foco:** construção do computador.

* Placa-mãe
* GPU
* Monitor

O jogador começa a compreender como os componentes trabalham juntos.

### ATO 3 — CONECTE

**Foco:** interação e periféricos.

* Teclado
* Mouse
* Headset
* Impressora
* Pendrive

O jogador trabalha com entrada, saída, dispositivos e armazenamento externo.

### ATO 4 — INICIALIZE

**Foco:** integração.

* Puzzle final de Boot.

O jogador utiliza os conhecimentos adquiridos para inicializar o sistema.

### Regras

* A organização em atos deve ser refletida visualmente quando possível.
* Não reescrever completamente o mapa existente.
* Utilizar os estados atuais das peças para controlar a progressão.
* Manter os 11 puzzles existentes.
* Os atos devem organizar a experiência, não substituir os puzzles.

---

## SPEC-31 — Integração das Novas Mecânicas

**Objetivo:** garantir que todos os novos sistemas funcionem juntos sem quebrar o ciclo de jogo existente.

### Sistemas integrados

* Sistema de diagnóstico.
* Dificuldade progressiva.
* Sistema de dicas.
* Medalhas.
* Evolução visual do mapa.
* Itens de suporte da loja.
* Boot cinematográfico.
* Finais/ranking.
* DINO CODEX.
* Progressão em atos.

### Regras

* Não remover as mecânicas já implementadas.
* Não alterar os conceitos educacionais dos 11 puzzles existentes.
* Manter persistência no `localStorage`.
* Manter `GameContext` como fonte central do estado global.
* Evitar duplicação de estados.
* Novos sistemas devem ser reutilizáveis e desacoplados sempre que possível.
* Recursos opcionais, como dicas e Codex, não podem ser obrigatórios para terminar o jogo.
* A experiência principal deve continuar sendo:

```text
EXPLORAR
    ↓
RESOLVER PROBLEMAS
    ↓
RECUPERAR COMPONENTES
    ↓
PREPARAR O SISTEMA
    ↓
INICIALIZAR O COMPUTADOR
```

### SPEC-32 — Sistema de Efeitos Sonoros Arcade

**Objetivo:**
Adicionar efeitos sonoros ao DinoBoot para reforçar a sensação de jogo arcade/retro, utilizando a biblioteca `react-sounds` e priorizando seus sons com características de arcade/game.

#### 32.1 — Biblioteca

Utilizar:

```bash
npm install react-sounds howler
```

A implementação deve utilizar os recursos do `react-sounds` para reproduzir os efeitos sonoros.

**Regra importante:**
Os efeitos devem ter preferência por sons de estilo:

* Arcade
* Retro
* 8-bit
* Game
* Coin
* Power-up
* Success
* Error
* Click
* Beep
* Level-up

Não utilizar sons excessivamente realistas ou que quebrem a estética arcade do DinoBoot.

#### 32.2 — Sistema centralizado de áudio

Criar um sistema centralizado de áudio para que os componentes do jogo não precisem configurar sons individualmente.

Criar uma estrutura semelhante a:

```text
src/
├── audio/
│   ├── GameAudio.ts
│   └── audioConfig.ts
```

O sistema deve disponibilizar funções semânticas, por exemplo:

```text
playButton()
playCollect()
playCorrect()
playWrong()
playDamage()
playCoin()
playLevelUp()
playPuzzleStart()
playPuzzleComplete()
playBoot()
playVictory()
playGameOver()
```

Os componentes devem chamar essas funções em vez de acessar diretamente a biblioteca.

#### 32.3 — Sons de interação

Adicionar efeitos sonoros para ações importantes:

| Evento                      | Efeito                    |
| --------------------------- | ------------------------- |
| Clicar em botão             | Click/beep arcade curto   |
| Selecionar opção            | Beep eletrônico           |
| Confirmar ação              | Confirmation sound        |
| Voltar                      | Som curto de cancelamento |
| Interagir com ponto do mapa | Beep/arcade               |
| Coletar peça                | Coin/collect              |
| Ganhar moedas               | Coin                      |
| Perder vida                 | Error/damage              |
| Resposta correta            | Success                   |
| Resposta errada             | Error                     |
| Completar puzzle            | Victory/level-up          |
| Iniciar puzzle              | Arcade start              |
| Abrir loja                  | Interface/game sound      |
| Comprar item                | Coin/purchase             |
| Equipar item                | Confirmation              |
| Iniciar boot final          | Power-up/boot sound       |
| Falha no boot               | Error/system failure      |
| Vitória                     | Victory/level-up          |

#### 32.4 — Som das peças

Cada uma das 11 peças deve emitir um efeito de coleta quando for obtida:

* CPU
* RAM
* SSD
* GPU
* Placa-mãe
* Teclado
* Mouse
* Monitor
* Impressora
* Headset
* Pendrive

O som deve transmitir a sensação de **item coletado em um jogo arcade**.

#### 32.5 — Feedback dos puzzles

Os efeitos sonoros devem acompanhar o feedback visual:

**Resposta correta:**

```text
ação do jogador
→ efeito de sucesso
→ animação de acerto
→ atualização da pontuação
```

**Resposta incorreta:**

```text
ação do jogador
→ efeito de erro
→ animação de erro
→ perda de vida, quando aplicável
```

O som não deve substituir o feedback visual ou textual.

#### 32.6 — Sistema de volume

Adicionar controles independentes:

```text
SFX:  [████████░░] 80%
Música: [██████░░░░] 60%
```

Também disponibilizar:

```text
Sons: ON/OFF
Música: ON/OFF
```

As preferências devem ser salvas no `localStorage`.

Exemplo:

```text
dinoboot_audio_sfx
dinoboot_audio_music
dinoboot_sfx_volume
dinoboot_music_volume
```

#### 32.7 — Evitar excesso de sons

Não reproduzir sons em todas as pequenas mudanças visuais.

Os efeitos devem ser utilizados principalmente para:

* interação;
* confirmação;
* erro;
* recompensa;
* coleta;
* progressão;
* vitória;
* derrota.

O objetivo é deixar o jogo mais responsivo, e não criar uma camada sonora cansativa.

#### 32.8 — Estética sonora

A identidade sonora deve combinar com o visual do DinoBoot:

**Arcade + retro + tecnologia + computador + videogame.**

Priorizar sons curtos, eletrônicos e marcantes.

Evitar:

* sons cinematográficos realistas;
* efeitos longos;
* sons muito graves;
* sons excessivamente assustadores;
* efeitos que pareçam pertencer a outro gênero de jogo.

#### 32.9 — Música de fundo

Caso o `react-sounds` não forneça uma música de fundo adequada ao estilo do DinoBoot, **não criar uma música genérica apenas para preencher espaço**.

O sistema deve permitir adicionar música posteriormente sem precisar modificar a arquitetura dos efeitos sonoros.

#### 32.10 — Compatibilidade com o navegador

Respeitar as políticas de reprodução de áudio dos navegadores.

O jogo não deve tentar reproduzir áudio automaticamente antes da primeira interação do usuário quando isso for bloqueado pelo navegador.

O primeiro botão/interação do jogo pode inicializar o sistema de áudio.

#### 32.11 — Integração com o jogo

Integrar o sistema aos principais fluxos existentes:

```text
StartScreen
    ↓
MapScreen
    ↓
PuzzleShell
    ↓
Puzzle
    ↓
Shop
    ↓
Boot
    ↓
Victory / Failure
```

Cada tela deve utilizar o sistema centralizado quando houver uma ação que necessite de feedback sonoro.

#### 32.12 — Performance

Os efeitos devem ser carregados de forma eficiente.

Não carregar todos os áudios de uma vez se a biblioteca permitir carregamento sob demanda.

O sistema não deve causar:

* travamentos;
* atraso perceptível nas interações;
* aumento desnecessário do tempo de carregamento;
* reprodução duplicada de sons.

#### 32.13 — Critério de aceitação

A implementação será considerada concluída quando:

* [x] `react-sounds` estiver instalado;
* [x] os efeitos utilizados forem compatíveis com a estética arcade/retro;
* [x] existir um sistema centralizado de áudio;
* [x] botões possuírem feedback sonoro;
* [x] coleta de peças possuir feedback sonoro;
* [x] respostas corretas possuírem feedback sonoro;
* [x] respostas erradas possuírem feedback sonoro;
* [x] perda de vida possuir feedback sonoro;
* [x] moedas possuírem feedback sonoro;
* [x] conclusão de puzzles possuir feedback sonoro;
* [x] loja possuir feedback sonoro;
* [x] boot final possuir efeitos sonoros;
* [x] vitória possuir efeito sonoro próprio;
* [x] derrota/falha possuir efeito sonoro próprio;
* [x] existir controle de SFX;
* [x] existir opção de ativar/desativar sons;
* [x] preferências de áudio persistirem no `localStorage`;
* [x] os sons não forem executados em excesso;
* [x] a estética sonora permanecer consistente com o estilo arcade do DinoBoot.


### Critérios de aceitação

* As 11 peças continuam funcionando.
* Todos os puzzles existentes continuam acessíveis.
* A loja continua funcionando.
* A persistência continua funcionando.
* O boot continua validando componentes danificados.
* A tela final continua mostrando o resultado.
* As novas mecânicas não introduzem dependências obrigatórias desnecessárias.
* O jogador deve perceber claramente a evolução entre o início e o boot final.

---

## Ordem de implementação recomendada — Novas melhorias

| Prioridade | Spec    | Descrição                  |
| ---------- | ------- | -------------------------- |
| 21         | SPEC-21 | Sistema de Diagnóstico     |
| 22         | SPEC-23 | Sistema de Dicas           |
| 23         | SPEC-29 | DINO CODEX                 |
| 24         | SPEC-25 | Evolução Visual do Mapa    |
| 25         | SPEC-22 | Dificuldade Progressiva    |
| 26         | SPEC-24 | Medalhas e Recompensas     |
| 27         | SPEC-26 | Itens de Suporte na Loja   |
| 28         | SPEC-30 | Progressão em Atos         |
| 29         | SPEC-28 | Finais e Ranking           |
| 30         | SPEC-27 | Boot Final Cinematográfico |
| 31         | SPEC-31 | Integração e Testes Finais |
| 32         | SPEC-32 | Efeitos Sonoros Arcade     |

---

## Estado atualizado do projeto

As **SPEC-01 até SPEC-20 permanecem inalteradas**.

As **SPEC-21 até SPEC-31** descrevem sistemas de diagnóstico, dificuldade, dicas, recompensas, Codex, evolução visual, itens de suporte, progressão em atos, finais alternativos e uma apresentação mais forte do boot final. A **SPEC-32** adiciona a camada de efeitos sonoros arcade.

As melhorias relacionadas às ideias 1–5 da lista anterior **não fazem parte destas novas specs**, pois serão implementadas separadamente pela outra IA.

O objetivo destas novas specs é transformar os 11 puzzles já existentes em uma experiência mais integrada, progressiva, educativa e rejogável, sem substituir o ciclo principal já implementado.


### Arquivos
- `src/App.css` — base visual global
- `src/components/PuzzleShell.css` — estilo do shell dos puzzles
- `src/screens/MapScreen.css` — refinamento do mapa e HUD
- `src/screens/ShopScreen.css` — loja e preview do setup
- `src/screens/VictoryScreen.css` — tela final de resultado
- `src/puzzles/PuzzleBoot.css` — terminal e feedback do boot

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
| 19 | SPEC-19 | ✅ Concluída |
| 20 | SPEC-20 | ✅ Concluída |
| 21 | SPEC-21 | ✅ Concluída |
| 22 | SPEC-23 | ✅ Concluída |
| 23 | SPEC-29 | ✅ Concluída |
| 24 | SPEC-25 | ✅ Concluída |
| 25 | SPEC-22 | 🟡 Parcial — dificuldade integrada, cobertura ainda varia entre puzzles |
| 26 | SPEC-24 | ✅ Concluída |
| 27 | SPEC-26 | ✅ Concluída |
| 28 | SPEC-30 | ✅ Concluída |
| 29 | SPEC-28 | 🟡 Parcial — classificação implementada; revisar critérios e resultados de borda |
| 30 | SPEC-27 | ✅ Concluída |
| 31 | SPEC-31 | 🟡 Parcial — fluxos integrados e build verificada; falta suíte de testes de integração |
| 32 | SPEC-32 | ✅ Concluída — efeitos, controles e preferências persistentes; trilha adiada conforme 32.9 |

> As specs 21–31 não estão em ordem numérica de implementação; consulte a coluna “Spec”. “Concluída” indica que o comportamento descrito foi integrado ao jogo; “Parcial” indica que ainda há critérios ou validações pendentes.
