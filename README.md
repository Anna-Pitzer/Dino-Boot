<img width="100%" src="https://capsule-render.vercel.app/api?type=slice&height=150&color=F26101&reversal=false"/>

# DinoBoot

## Alunos:

- Arthur Torres Candido | Matrícula: 06014213
- Júlio César da Silva Paula | Matrícula: 06016514
- Kayke Silva de Mattos Soares | Matrícula: 06013747
- Maria Anna Silva Pitzer | Matrícula: 06014353

Curso: Ciência da Computação | Turma: A

Visualize o jogo: https://anna-pitzer.github.io/Dino-Boot/

Aplicação web em estilo RPG/arcade inspirada em manutenção de hardware e troubleshooting de sistemas operacionais. O projeto simula a jornada de recuperar e montar um setup computacional, passando por mapa, puzzles, loja de customização e boot final do sistema.

> **Estado do projeto:** o ciclo principal do jogo está implementado e integrado, incluindo mapa, puzzles, loja, Codex, diagnóstico, áudio, persistência, navegação e tela final com tempo total do jogador.

## Funcionalidades

- Mapa com exploração, caminho do dinossauro e pontos interativos por peça
- Mapa com iluminação progressiva, zonas recuperadas/danificadas e indicador de estado do sistema
- 11 puzzles temáticos de componentes de hardware: CPU, RAM, SSD, GPU, placa-mãe, teclado, mouse, monitor, impressora, headset e pendrive
- Sistema de vidas, score, moedas, progresso e tempo total de jogo
- Medalhas por desempenho, feedback de desbloqueio e melhor score persistidos entre partidas
- Loja de customização do setup com categorias de gabinete, mousepad, abajur e decoração
- Painel de diagnóstico com resumo do estado, componentes e orientações para investigar falhas
- Dino Codex com entradas por categoria, indicadores de progresso e conceitos desbloqueados durante a partida
- Efeitos sonoros arcade, com controles independentes de SFX e música e preferências salvas no navegador
- Persistência do progresso em localStorage para continuar uma partida salva
- Opção de reiniciar que apaga o save da partida; preferências de áudio são mantidas
- Navegação com botão de voltar, histórico do navegador e suporte de teclado no puzzle de teclado
- Boot final com ordenação de etapas, detecção de peças danificadas e tela de falha/vitória
- Visual em estilo arcade retrô com interface neon, HUD de status e feedback visual de acerto/erro

## Tecnologias

- **Frontend:** React 19, Vite, JavaScript
- **Estilização:** CSS customizado com identidade arcade/neon
- **Áudio:** react-sounds e Howler
- **Persistência:** localStorage (progresso e preferências de áudio)
- **Execução:** Vite dev server + build de produção

## Estrutura

```text
DinoBoot/
├── src/
│   ├── assets/               # imagens e ícones do jogo
│   ├── audio/                # efeitos sonoros e configurações de áudio
│   ├── components/           # shell, diagnóstico e componentes reutilizáveis
│   ├── context/              # GameContext e estado global
│   ├── data/                 # peças, grafo, Codex, progressão e itens
│   ├── hooks/                # hooks do projeto
│   ├── puzzles/              # puzzles por componente
│   ├── screens/              # mapa, loja, vitória e telas principais
│   ├── App.jsx               # roteamento das telas
│   ├── App.css               # estilos globais
│   ├── main.jsx              # bootstrap da aplicação
│   └── index.css             # reset e base visual
├── public/                   # arquivos públicos
├── Ordens/                   # documentação e especificações do projeto
├── index.html                # entrada do Vite
├── package.json              # scripts e dependências
├── vite.config.js            # configuração do Vite
├── eslint.config.js          # regras de lint
├── README.md                 # documentação principal
└── .gitignore
```

## Requisitos

- Node.js 20+ ou compatível com Vite 8
- npm

## Configuração e execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

A aplicação geralmente fica disponível em:

```text
http://localhost:5173
```

### 3. Build de produção

```bash
npm run build
```

### 4. Pré-visualizar build

```bash
npm run preview
```

## Fluxo do jogo

1. Tela inicial com apresentação do projeto e carregamento do save
2. Exploração do mapa com movimentação do dinossauro até cada peça
3. Resolução dos 11 puzzles de componentes eletrônicos e manutenção de vidas
4. Geração automática de score e moedas conforme progresso e tempo
5. Puzzle final de boot do sistema validando a sequência de inicialização
6. Tela final com medalhas conquistadas, score, tempo total e melhor resultado salvo

## Puzzles incluídos

- CPU
- RAM
- SSD
- GPU
- Placa-mãe
- Teclado
- Mouse
- Monitor
- Impressora
- Headset
- Pendrive
- Boot final

## Melhorias aplicadas

- Navegação com histórico do navegador
- Botão de voltar funcional nas telas internas
- Suporte ao teclado no puzzle de teclado usando setas e Enter
- Tempo total acumulado exibido ao final
- Diagnóstico redesenhado com resumo por estado, cards de componentes e layout responsivo
- Codex redesenhado com progresso de descoberta, navegação por categoria e cards de hardware
- Controles de áudio globais e efeitos arcade nas interações importantes
- Visual refinado para mapa, loja, boot e tela final

## Observações

- A tela inicial foi mantida com identidade mais simples para preservar o foco no jogo principal.
- O jogo usa localStorage para guardar o progresso e permitir continuar a partida; reiniciar remove o save, sem apagar preferências de áudio.
- A música de fundo ainda não está disponível; o controle fica preparado sem tocar uma trilha genérica.

## Referência de documentação

Acompanhe os detalhes do roadmap e das specs em:

- [Ordens/SPECS.md](Ordens/SPECS.md)

<img width="100%" src="https://capsule-render.vercel.app/api?type=slice&height=150&color=F26101&reversal=false&section=footer"/>
