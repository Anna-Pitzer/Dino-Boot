export const PUZZLE_HINTS = {
  cpu: {
    cost: 12,
    hints: [
      { title: 'DICA 1', text: 'Round Robin trabalha com um quantum fixo: cada processo ganha uma fatia de tempo antes de ceder a CPU.' },
      { title: 'DICA 2', text: 'Quando um processo não encerra no quantum, ele volta para o fim da fila e o próximo processo ganha sua vez.' },
    ],
  },
  ram: {
    cost: 12,
    hints: [
      { title: 'DICA 1', text: 'A memória deve ser dividida entre os programas sem exceder o tamanho de cada bloco disponível.' },
      { title: 'DICA 2', text: 'Procure sempre encaixar o programa no primeiro bloco livre grande o suficiente, sem bloquear o sistema.' },
    ],
  },
  ssd: {
    cost: 10,
    hints: [
      { title: 'DICA 1', text: 'O sistema de arquivos organiza os dados em pastas e subpastas, seguindo uma hierarquia clara.' },
      { title: 'DICA 2', text: 'Arquivos de inicialização ficam em /boot, enquanto configurações do sistema geralmente ficam em /etc.' },
    ],
  },
  gpu: {
    cost: 12,
    hints: [
      { title: 'DICA 1', text: 'Driver correto precisa combinar a versão do hardware e o fabricante exigido pelo dispositivo.' },
      { title: 'DICA 2', text: 'Inspecione o erro do equipamento antes de instalar qualquer driver; o fabricante e a versão são mais importantes que a aparência.' },
    ],
  },
  motherboard: {
    cost: 10,
    hints: [
      { title: 'DICA 1', text: 'Cada componente vai em um slot compatível: CPU no soquete, RAM em memória, SSD em M.2 e GPU em PCIe.' },
      { title: 'DICA 2', text: 'Antes de encaixar, confira o tipo de conexão e o nome do slot; encaixes incompatíveis geram falhas no boot.' },
    ],
  },
  keyboard: {
    cost: 10,
    hints: [
      { title: 'DICA 1', text: 'O teclado transforma pressionamentos em eventos; cada tecla tem um código associado que o sistema reconhece.' },
      { title: 'DICA 2', text: 'Reproduza a sequência na ordem correta dos códigos, não apenas nas letras visíveis.' },
    ],
  },
  mouse: {
    cost: 12,
    hints: [
      { title: 'DICA 1', text: 'O mouse transmite movimento e cliques em coordenadas; a posição do cursor precisa ser rastreada no mapa.' },
      { title: 'DICA 2', text: 'Siga o caminho de direção em sequência e ignore os obstáculos que bloqueiam o trajeto.' },
    ],
  },
  monitor: {
    cost: 12,
    hints: [
      { title: 'DICA 1', text: 'A resolução define a quantidade de pixels na tela, enquanto a taxa de atualização define a fluidez visual.' },
      { title: 'DICA 2', text: 'Escolha a configuração que combina a capacidade do monitor com o modo de imagem correto e a taxa suportada.' },
    ],
  },
  printer: {
    cost: 10,
    hints: [
      { title: 'DICA 1', text: 'Uma fila de impressão organiza as tarefas pela ordem em que chegam, com prioridade para certos trabalhos.' },
      { title: 'DICA 2', text: 'Revise a prioridade e o tempo de fila antes de confirmar: tarefas mais urgentes não devem ficar atrasadas.' },
    ],
  },
  headset: {
    cost: 10,
    hints: [
      { title: 'DICA 1', text: 'Dispositivos de áudio entram e saem por canais específicos; o sistema deve identificar a fonte e a saída correta.' },
      { title: 'DICA 2', text: 'Teste o fluxo do sinal: entrada precisa chegar ao computador e a saída precisa ser enviada ao sistema de áudio.' },
    ],
  },
  pendrive: {
    cost: 10,
    hints: [
      { title: 'DICA 1', text: 'Um pendrive precisa ser montado antes de ser acessado como uma unidade no sistema.' },
      { title: 'DICA 2', text: 'Depois da montagem, siga o caminho do arquivo correto dentro da árvore do dispositivo para extrair o conteúdo.' },
    ],
  },
}

export const DEFAULT_HINT_COST = 12
