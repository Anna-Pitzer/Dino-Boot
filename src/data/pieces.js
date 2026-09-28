import cpuImg        from '../assets/pngs/CPU.png'
import ramImg        from '../assets/pngs/RAM.png'
import ssdImg        from '../assets/pngs/SSD.png'
import gpuImg        from '../assets/pngs/GPU.png'
import motherboardImg from '../assets/pngs/PLACA MÃE.png'
import keyboardImg   from '../assets/pngs/TECLADO.png'
import mouseImg      from '../assets/pngs/MOUSE.png'
import monitorImg    from '../assets/pngs/MONITOR.png'
import printerImg    from '../assets/pngs/IMPRESSORA.png'
import headsetImg    from '../assets/pngs/HEADSET.png'
import pendriveImg   from '../assets/pngs/pendrive.png'

export const PIECES = [
  {
    id: 'cpu',
    name: 'CPU',
    concept: 'Escalonamento de Processos',
    img: cpuImg,
    position: { x: 26.6, y: 71.5 },
  },
  {
    id: 'ram',
    name: 'RAM',
    concept: 'Alocação de Memória',
    img: ramImg,
    position: { x: 48.9, y: 78 },
  },
  {
    id: 'ssd',
    name: 'SSD',
    concept: 'Sistema de Arquivos',
    img: ssdImg,
    position: { x: 77.7, y: 77.8 },
  },
  {
    id: 'gpu',
    name: 'GPU',
    concept: 'Drivers de Dispositivo',
    img: gpuImg,
    position: { x: 80.7, y: 53.9 },
  },
  {
    id: 'motherboard',
    name: 'Placa-mãe',
    concept: 'Gerenciamento de Dispositivos',
    img: motherboardImg,
    position: { x: 49.3, y: 43.7 },
  },
  {
    id: 'keyboard',
    name: 'Teclado',
    concept: 'Eventos de Entrada',
    img: keyboardImg,
    position: { x: 85.9, y: 30.2 },
  },
  {
    id: 'mouse',
    name: 'Mouse',
    concept: 'Posição do Cursor',
    img: mouseImg,
    position: { x: 60.4, y: 17.6 },
  },
  {
    id: 'monitor',
    name: 'Monitor',
    concept: 'Configuração de Vídeo',
    img: monitorImg,
    position: { x: 35.2, y: 17.2 },
  },
  {
    id: 'printer',
    name: 'Impressora',
    concept: 'Fila de Impressão',
    img: printerImg,
    position: { x: 12.5, y: 24.3 },
  },
  {
    id: 'headset',
    name: 'Headset',
    concept: 'Entrada e Saída de Áudio',
    img: headsetImg,
    position: { x: 13.5, y: 46.8 },
  },
  {
    id: 'pendrive',
    name: 'Pendrive',
    concept: 'Montagem de Dispositivos',
    img: pendriveImg,
    position: { x: 90.8, y: 56.3 },
  },
]
