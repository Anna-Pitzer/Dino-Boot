export const CODEX_ENTRIES = [
  {
    id: 'cpu',
    name: 'CPU',
    category: 'HARDWARE',
    explanation: 'A CPU interpreta instruções, executa operações lógicas e coordena o processamento do sistema.',
    relation: 'Relaciona-se ao puzzle da CPU: você precisa organizar a lógica de execução e a ordem de processamento.',
  },
  {
    id: 'ram',
    name: 'RAM',
    category: 'SISTEMAS OPERACIONAIS',
    explanation: 'A RAM armazena temporariamente dados e instruções em uso, permitindo acesso rápido ao sistema.',
    relation: 'Relaciona-se ao puzzle da RAM: a memória precisa estar organizada para manter processos em execução.',
  },
  {
    id: 'gpu',
    name: 'GPU',
    category: 'HARDWARE',
    explanation: 'A GPU acelera tarefas visuais e de processamento paralelo, tornando gráficos e cálculos mais rápidos.',
    relation: 'Relaciona-se ao puzzle da GPU: o processamento visual depende de fluxo e sincronização.',
  },
  {
    id: 'ssd',
    name: 'SSD',
    category: 'SISTEMAS OPERACIONAIS',
    explanation: 'O SSD guarda dados persistentemente e permite leitura e gravação rápidas para o sistema operacional.',
    relation: 'Relaciona-se ao puzzle do SSD: o armazenamento precisa manter arquivos e dados estáveis.',
  },
  {
    id: 'motherboard',
    name: 'Placa-mãe',
    category: 'HARDWARE',
    explanation: 'A placa-mãe conecta os componentes e permite que comunicação e energia circulem entre eles.',
    relation: 'Relaciona-se ao puzzle da placa-mãe: a estrutura do sistema precisa estar conectada corretamente.',
  },
  {
    id: 'keyboard',
    name: 'Teclado',
    category: 'PERIFÉRICOS',
    explanation: 'O teclado transforma ações humanas em entradas que o sistema entende e processa.',
    relation: 'Relaciona-se ao puzzle do teclado: cada comando precisa ser recebido e interpretado com precisão.',
  },
  {
    id: 'mouse',
    name: 'Mouse',
    category: 'PERIFÉRICOS',
    explanation: 'O mouse informa ao sistema a posição do cursor e facilita a interação do usuário.',
    relation: 'Relaciona-se ao puzzle do mouse: a navegação depende de coordenadas e ações precisas.',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    category: 'PERIFÉRICOS',
    explanation: 'O monitor exibe resultados visuais, estados do sistema e mensagens importantes para o usuário.',
    relation: 'Relaciona-se ao puzzle do monitor: a interface precisa mostrar informações claras e consistentes.',
  },
  {
    id: 'printer',
    name: 'Impressora',
    category: 'PERIFÉRICOS',
    explanation: 'A impressora aceita tarefas de saída e organiza requisições em fila para processamento.',
    relation: 'Relaciona-se ao puzzle da impressora: a fila de trabalho precisa seguir uma ordem correta.',
  },
  {
    id: 'headset',
    name: 'Headset',
    category: 'PERIFÉRICOS',
    explanation: 'O headset permite entrada e saída de áudio, ajudando na interação e na reprodução sonora.',
    relation: 'Relaciona-se ao puzzle do headset: o sistema deve gerenciar áudio e feedback de forma estável.',
  },
  {
    id: 'pendrive',
    name: 'Pendrive',
    category: 'PERIFÉRICOS',
    explanation: 'O pendrive funciona como um dispositivo portátil de armazenamento externo e transferência de dados.',
    relation: 'Relaciona-se ao puzzle do pendrive: a montagem e a leitura de dispositivos externos ajudam a completar a carga do sistema.',
  },
  {
    id: 'boot',
    name: 'Boot',
    category: 'SISTEMAS OPERACIONAIS',
    explanation: 'O boot inicializa os componentes e carrega o sistema operacional a partir da organização correta do hardware.',
    relation: 'Relaciona-se ao boot final: toda a lógica aprendida converge na inicialização do DinoBootOS.',
  },
]

export const CODEX_BY_CATEGORY = CODEX_ENTRIES.reduce((accumulator, entry) => {
  const current = accumulator[entry.category] ?? []
  current.push(entry)
  accumulator[entry.category] = current
  return accumulator
}, {})
