# PUZZLES — RPG de Sistemas Operacionais

Documento de planejamento e implementação.

**Conceito:** o jogador controla um dinossauro em um mapa cartunesco, resolve puzzles sobre Sistemas Operacionais, coleta peças do computador e, ao final, inicializa o sistema.

---

## Regras Gerais

- **Objetivo:** coletar todas as peças espalhadas pelo mapa
- **Pontuação:** peças coletadas + tempo nos puzzles
- **Fim de jogo:** todas as peças coletadas + puzzle final concluído
- Cada puzzle deve estar relacionado à peça que o jogador está recuperando
- Puzzles devem ser curtos, visuais e interativos (sem múltipla escolha)

---

## Peças Principais

### Puzzle 1 — CPU: Escalonamento de Processos
**Conceito:** Round Robin

- Mostrar 4 processos com tempos diferentes
- Apresentar a regra (ex: quantum = 2 ciclos)
- Jogador arrasta processos para montar a fila
- Sistema executa e valida a sequência

> Exemplo: A=4, B=2, C=6, D=1 — Quantum=2

---

### Puzzle 2 — RAM: Alocação de Memória
**Conceito:** Gerenciamento de memória

- Mostrar blocos livres e ocupados
- Jogador arrasta programas para blocos compatíveis
- Não permite alocar em bloco menor que o necessário
- Opcional: fragmentação para aumentar dificuldade

> Exemplo: SO=20MB, Navegador=20MB, Jogo=30MB, Editor=10MB

---

### Puzzle 3 — SSD: Sistema de Arquivos
**Conceito:** Diretórios e caminhos

- Arquivos espalhados: `foto.png`, `trabalho.docx`, `sistema.conf`, `jogo.exe`, `musica.mp3`
- Pastas: `Documentos`, `Imagens`, `Sistema`, `Programas`, `Música`
- Jogador arrasta arquivos para as pastas corretas
- Depois, navega na árvore de diretórios para encontrar um arquivo específico

> Exemplo: encontrar `/boot/boot.cfg`

---

### Puzzle 4 — GPU: Driver do Dispositivo
**Conceito:** Drivers e comunicação SO ↔ hardware

- Mostrar dispositivos e seus estados
- GPU aparece com erro
- Jogador escolhe o driver correto entre versões incompatíveis
- Opcional: comparar versão do hardware com a do driver

> Exemplo: GPU X200 → Driver X200 = correto; X100/X300 = incompatível

---

### Puzzle 5 — Placa-mãe: Gerenciamento de Dispositivos
**Conceito:** Reconhecimento e conexão de hardware

- Componentes desconectados: CPU, RAM, GPU, SSD
- Jogador arrasta cada um para o encaixe correto
- Feedback visual para conexões erradas

> Exemplo: CPU→socket, RAM→slot, GPU→PCIe, SSD→M.2

---

## Periféricos

### Puzzle 6 — Teclado: Interpretar Entradas
**Conceito:** Eventos de entrada

- Conectar teclas aos seus códigos ASCII
- Depois, decifrar uma sequência de códigos

> Exemplo: 65→A, 66→B, 67→C, 68→D

---

### Puzzle 7 — Mouse: Eventos e Posição do Cursor
**Conceito:** Entrada e posição do cursor

- Cursor em posição inicial, alvo no mapa
- Jogador executa sequência de movimentos na ordem correta

> Exemplo: → → ↓ ↓ ← ↑ →

---

### Puzzle 8 — Monitor: Configuração de Saída de Vídeo
**Conceito:** Dispositivos de saída

- Mostrar especificações do monitor
- Jogador seleciona resolução, taxa de atualização e orientação compatíveis
- Configurações erradas distorcem a imagem

> Exemplo: Monitor suporta 1920×1080 @ 60Hz

---

### Puzzle 9 — Impressora: Fila de Impressão
**Conceito:** Spooling e gerenciamento de I/O

- Documentos com número de páginas e prioridade
- Jogador organiza a fila conforme a regra apresentada

> Exemplo: A=3 páginas, B=1, C=5 — ordenar por prioridade ou chegada

---

### Puzzle 10 — Headset: Entrada e Saída de Áudio
**Conceito:** Dispositivos de I/O

- Conectar microfone à entrada de voz
- Conectar headset à saída de som
- Opcional: dispositivo de áudio virtual como distração

> Exemplo: Microfone→Entrada, Headset→Saída

---

### Puzzle 11 — Pendrive: Montagem e Acesso
**Conceito:** Armazenamento e montagem de dispositivos

- Pendrive conectado mas não montado
- Jogador seleciona o dispositivo → monta → navega → localiza o arquivo

> Exemplo: USB-01 → Montar → `/media/USB-01` → encontrar `mapa.dat`

---

## Puzzle Final — Inicialização do Computador

Usa todas as peças coletadas. Jogador ordena as etapas do boot:

1. Conectar os componentes
2. Inicializar BIOS/UEFI
3. Reconhecer o hardware
4. Localizar o SSD
5. Carregar o bootloader
6. Carregar o kernel
7. Iniciar os processos do sistema
8. Exibir tela de SO iniciado

**Condição de vitória:** etapas na ordem correta → sistema inicializado.

---

## Resumo da Campanha

| # | Peça / Periférico | Puzzle | Conceito |
|---|---|---|---|
| 1 | CPU | Escalonamento de processos | Round Robin |
| 2 | RAM | Alocação de memória | Gerenciamento de memória |
| 3 | SSD | Sistema de arquivos | Diretórios e arquivos |
| 4 | GPU | Driver | Drivers |
| 5 | Placa-mãe | Gerenciamento de dispositivos | Hardware e SO |
| 6 | Teclado | Interpretar entradas | Eventos de entrada |
| 7 | Mouse | Movimentação do cursor | Eventos de entrada |
| 8 | Monitor | Configuração de vídeo | Saída de dados |
| 9 | Impressora | Fila de impressão | Spooling / I/O |
| 10 | Headset | Entrada e saída de áudio | I/O |
| 11 | Pendrive | Montagem e acesso | Armazenamento |
| 12 | Todas | Inicialização | Boot + Kernel |

---

## Progressão Sugerida (do mais simples ao mais complexo)

1. Teclado — tutorial de entrada
2. Mouse — movimentação simples
3. SSD — organização de arquivos
4. GPU — escolha de driver
5. RAM — alocação
6. CPU — escalonamento
7. Monitor — configuração
8. Headset — I/O
9. Pendrive — montagem
10. Impressora — fila de impressão
11. Placa-mãe — conexão de componentes
12. Puzzle final — boot do sistema

---

## Checklist de Implementação

- [ ] Criar ponto de interação de cada puzzle no mapa
- [ ] Definir qual peça é liberada por cada puzzle
- [ ] Criar tela/área de puzzle
- [ ] Criar estado concluído / não concluído
- [ ] Impedir coleta dupla da mesma peça
- [ ] Feedback visual para erro e acerto
- [ ] Cronômetro
- [ ] Pontuação por peça coletada
- [ ] Bônus de velocidade
- [ ] Salvar peças já coletadas
- [ ] Criar puzzle final após todas as peças coletadas
- [ ] Exibir tela de vitória ao inicializar o computador

---

> **Nota de design:** o jogador deve aprender o conceito pela interação. O texto explica a regra, mas a solução é encontrada manipulando processos, memória, arquivos, dispositivos ou conexões.
