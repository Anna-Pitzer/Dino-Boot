export const DIFFICULTY_LEVELS = ['normal', 'hard', 'master']

export const DIFFICULTY_LABELS = {
  normal: 'NORMAL',
  hard: 'HARD',
  master: 'MASTER',
}

export function getDifficultyProfile(puzzleId, difficulty = 'normal') {
  const level = DIFFICULTY_LEVELS.includes(difficulty) ? difficulty : 'normal'

  const profiles = {
    cpu: {
      normal: {
        quantum: 2,
        processes: [
          { id: 'A', burst: 4, color: '#F26101' },
          { id: 'B', burst: 2, color: '#91BED4' },
          { id: 'C', burst: 6, color: '#a855f7' },
          { id: 'D', burst: 3, color: '#4caf50' },
          { id: 'E', burst: 2, color: '#f5c518' },
        ],
      },
      hard: {
        quantum: 2,
        processes: [
          { id: 'A', burst: 5, color: '#F26101' },
          { id: 'B', burst: 2, color: '#91BED4' },
          { id: 'C', burst: 7, color: '#a855f7' },
          { id: 'D', burst: 3, color: '#4caf50' },
          { id: 'E', burst: 4, color: '#f5c518' },
          { id: 'F', burst: 2, color: '#ef4444' },
        ],
      },
      master: {
        quantum: 2,
        processes: [
          { id: 'A', burst: 5, color: '#F26101' },
          { id: 'B', burst: 3, color: '#91BED4' },
          { id: 'C', burst: 6, color: '#a855f7' },
          { id: 'D', burst: 2, color: '#4caf50' },
          { id: 'E', burst: 4, color: '#f5c518' },
          { id: 'F', burst: 5, color: '#ef4444' },
          { id: 'G', burst: 3, color: '#06b6d4' },
        ],
      },
    },
    ram: {
      normal: {
        total: 110,
        blocks: [
          { id: 'b1', size: 10, locked: true, label: 'KERNEL' },
          { id: 'b2', size: 20, locked: false },
          { id: 'b3', size: 30, locked: false },
          { id: 'b4', size: 15, locked: false },
          { id: 'b5', size: 10, locked: false },
          { id: 'b6', size: 25, locked: false },
        ],
        programs: [
          { id: 'so', name: 'S.O.', size: 20, color: '#F26101' },
          { id: 'navegador', name: 'NAVEGADOR', size: 20, color: '#91BED4' },
          { id: 'jogo', name: 'JOGO', size: 30, color: '#a855f7' },
          { id: 'editor', name: 'EDITOR', size: 10, color: '#4caf50' },
        ],
      },
      hard: {
        total: 130,
        blocks: [
          { id: 'b1', size: 12, locked: true, label: 'KERNEL' },
          { id: 'b2', size: 24, locked: false },
          { id: 'b3', size: 18, locked: false },
          { id: 'b4', size: 30, locked: false },
          { id: 'b5', size: 16, locked: false },
          { id: 'b6', size: 10, locked: false },
          { id: 'b7', size: 20, locked: false },
        ],
        programs: [
          { id: 'so', name: 'S.O.', size: 20, color: '#F26101' },
          { id: 'navegador', name: 'NAVEGADOR', size: 20, color: '#91BED4' },
          { id: 'jogo', name: 'JOGO', size: 30, color: '#a855f7' },
          { id: 'editor', name: 'EDITOR', size: 10, color: '#4caf50' },
          { id: 'ide', name: 'IDE', size: 12, color: '#f5c518' },
        ],
      },
      master: {
        total: 150,
        blocks: [
          { id: 'b1', size: 12, locked: true, label: 'KERNEL' },
          { id: 'b2', size: 18, locked: false },
          { id: 'b3', size: 22, locked: false },
          { id: 'b4', size: 16, locked: false },
          { id: 'b5', size: 30, locked: false },
          { id: 'b6', size: 14, locked: false },
          { id: 'b7', size: 24, locked: false },
          { id: 'b8', size: 14, locked: false },
        ],
        programs: [
          { id: 'so', name: 'S.O.', size: 18, color: '#F26101' },
          { id: 'navegador', name: 'NAVEGADOR', size: 20, color: '#91BED4' },
          { id: 'jogo', name: 'JOGO', size: 30, color: '#a855f7' },
          { id: 'editor', name: 'EDITOR', size: 10, color: '#4caf50' },
          { id: 'ide', name: 'IDE', size: 14, color: '#f5c518' },
          { id: 'chat', name: 'CHAT', size: 12, color: '#06b6d4' },
        ],
      },
    },
    keyboard: {
      normal: {
        pairs: [
          { key: 'A', code: 65 },
          { key: 'B', code: 66 },
          { key: 'C', code: 67 },
          { key: 'D', code: 68 },
          { key: 'E', code: 69 },
          { key: 'F', code: 70 },
        ],
        sequence: [66, 79, 79, 84],
        extraKeys: ['A', 'B', 'O', 'T', 'C', 'D', 'E', 'F', 'G', 'H'],
      },
      hard: {
        pairs: [
          { key: 'A', code: 65 },
          { key: 'B', code: 66 },
          { key: 'C', code: 67 },
          { key: 'D', code: 68 },
          { key: 'E', code: 69 },
          { key: 'F', code: 70 },
          { key: 'G', code: 71 },
          { key: 'H', code: 72 },
        ],
        sequence: [70, 79, 82, 84, 69],
        extraKeys: ['A', 'B', 'O', 'T', 'E', 'F', 'R', 'G', 'H', 'I'],
      },
      master: {
        pairs: [
          { key: 'A', code: 65 },
          { key: 'B', code: 66 },
          { key: 'C', code: 67 },
          { key: 'D', code: 68 },
          { key: 'E', code: 69 },
          { key: 'F', code: 70 },
          { key: 'G', code: 71 },
          { key: 'H', code: 72 },
          { key: 'I', code: 73 },
        ],
        sequence: [66, 79, 79, 84, 83, 84, 65, 82, 84],
        extraKeys: ['A', 'B', 'O', 'T', 'S', 'R', 'G', 'H', 'I', 'U'],
      },
    },
    mouse: {
      normal: {
        memorizeSecs: 4,
        sequence: ['→', '→', '↓', '↓', '→', '↓', '→', '→', '↑', '→', '↓'],
        obstacles: [
          { x: 3, y: 0 }, { x: 6, y: 1 },
          { x: 1, y: 2 }, { x: 4, y: 2 },
          { x: 7, y: 3 }, { x: 2, y: 4 },
          { x: 5, y: 4 }, { x: 0, y: 5 },
        ],
      },
      hard: {
        memorizeSecs: 4,
        sequence: ['→', '→', '↓', '→', '↓', '→', '→', '↑', '→', '↓', '→', '→', '↑'],
        obstacles: [
          { x: 2, y: 0 }, { x: 5, y: 0 }, { x: 3, y: 1 },
          { x: 6, y: 2 }, { x: 1, y: 3 }, { x: 4, y: 3 },
          { x: 7, y: 4 }, { x: 2, y: 5 },
        ],
      },
      master: {
        memorizeSecs: 3,
        sequence: ['→', '↓', '→', '→', '↑', '→', '↓', '→', '→', '↓', '→', '↑', '→', '→'],
        obstacles: [
          { x: 1, y: 0 }, { x: 4, y: 0 }, { x: 7, y: 1 },
          { x: 2, y: 2 }, { x: 5, y: 2 }, { x: 3, y: 3 },
          { x: 6, y: 3 }, { x: 1, y: 4 }, { x: 5, y: 4 },
        ],
      },
    },
    ssd: {
      normal: {
        files: [
          { id: 'foto', name: 'foto.png', folder: 'Imagens', icon: '🖼️' },
          { id: 'trabalho', name: 'trabalho.docx', folder: 'Documentos', icon: '📄' },
          { id: 'sistema', name: 'sistema.conf', folder: 'Sistema', icon: '⚙️' },
          { id: 'jogo', name: 'jogo.exe', folder: 'Programas', icon: '🎮' },
          { id: 'musica', name: 'musica.mp3', folder: 'Música', icon: '🎵' },
        ],
      },
      hard: {
        files: [
          { id: 'foto', name: 'foto.png', folder: 'Imagens', icon: '🖼️' },
          { id: 'trabalho', name: 'trabalho.docx', folder: 'Documentos', icon: '📄' },
          { id: 'sistema', name: 'sistema.conf', folder: 'Sistema', icon: '⚙️' },
          { id: 'jogo', name: 'jogo.exe', folder: 'Programas', icon: '🎮' },
          { id: 'musica', name: 'musica.mp3', folder: 'Música', icon: '🎵' },
          { id: 'video', name: 'video.mp4', folder: 'Imagens', icon: '🎬' },
          { id: 'relatorio', name: 'relatorio.pdf', folder: 'Documentos', icon: '📋' },
          { id: 'driver', name: 'driver.exe', folder: 'Programas', icon: '💾' },
        ],
      },
      master: {
        files: [
          { id: 'foto', name: 'foto.png', folder: 'Imagens', icon: '🖼️' },
          { id: 'trabalho', name: 'trabalho.docx', folder: 'Documentos', icon: '📄' },
          { id: 'sistema', name: 'sistema.conf', folder: 'Sistema', icon: '⚙️' },
          { id: 'jogo', name: 'jogo.exe', folder: 'Programas', icon: '🎮' },
          { id: 'musica', name: 'musica.mp3', folder: 'Música', icon: '🎵' },
          { id: 'video', name: 'video.mp4', folder: 'Imagens', icon: '🎬' },
          { id: 'relatorio', name: 'relatorio.pdf', folder: 'Documentos', icon: '📋' },
          { id: 'driver', name: 'driver.exe', folder: 'Programas', icon: '💾' },
          { id: 'backup', name: 'backup.zip', folder: 'Documentos', icon: '🗜️' },
          { id: 'theme', name: 'theme.cfg', folder: 'Sistema', icon: '🎨' },
        ],
      },
    },
    gpu: {
      normal: {
        devices: [
          { id: 'cpu', name: 'CPU', status: 'ok', icon: '🧠', version: null },
          { id: 'ram', name: 'RAM', status: 'ok', icon: '💾', version: null },
          { id: 'gpu', name: 'GPU', status: 'error', icon: '🎮', version: '4.2', requiredVendor: 'OpenVGA' },
          { id: 'ssd', name: 'SSD', status: 'ok', icon: '💿', version: null },
          { id: 'network', name: 'REDE', status: 'error', icon: '🌐', version: '2.0', requiredVendor: 'NetCore' },
          { id: 'audio', name: 'ÁUDIO', status: 'ok', icon: '🔊', version: null },
        ],
        drivers: [
          { id: 'd1', name: 'GPU Driver', version: '4.2', vendor: 'BetaVGA', forDevice: 'gpu' },
          { id: 'd2', name: 'GPU Driver', version: '3.8', vendor: 'OpenVGA', forDevice: 'gpu' },
          { id: 'd3', name: 'GPU Driver', version: '4.2', vendor: 'OpenVGA', forDevice: 'gpu' },
          { id: 'd4', name: 'Net Driver', version: '2.0', vendor: 'NetAlpha', forDevice: 'network' },
          { id: 'd5', name: 'Net Driver', version: '1.9', vendor: 'NetCore', forDevice: 'network' },
          { id: 'd6', name: 'Net Driver', version: '2.0', vendor: 'NetCore', forDevice: 'network' },
        ],
      },
      hard: {
        devices: [
          { id: 'cpu', name: 'CPU', status: 'ok', icon: '🧠', version: null },
          { id: 'ram', name: 'RAM', status: 'ok', icon: '💾', version: null },
          { id: 'gpu', name: 'GPU', status: 'error', icon: '🎮', version: '4.2', requiredVendor: 'OpenVGA' },
          { id: 'ssd', name: 'SSD', status: 'ok', icon: '💿', version: null },
          { id: 'network', name: 'REDE', status: 'error', icon: '🌐', version: '2.0', requiredVendor: 'NetCore' },
          { id: 'audio', name: 'ÁUDIO', status: 'ok', icon: '🔊', version: null },
          { id: 'wifi', name: 'WIFI', status: 'error', icon: '📶', version: '3.1', requiredVendor: 'WlanFlow' },
        ],
        drivers: [
          { id: 'd1', name: 'GPU Driver', version: '4.2', vendor: 'BetaVGA', forDevice: 'gpu' },
          { id: 'd2', name: 'GPU Driver', version: '3.8', vendor: 'OpenVGA', forDevice: 'gpu' },
          { id: 'd3', name: 'GPU Driver', version: '4.2', vendor: 'OpenVGA', forDevice: 'gpu' },
          { id: 'd4', name: 'Net Driver', version: '2.0', vendor: 'NetAlpha', forDevice: 'network' },
          { id: 'd5', name: 'Net Driver', version: '1.9', vendor: 'NetCore', forDevice: 'network' },
          { id: 'd6', name: 'Net Driver', version: '2.0', vendor: 'NetCore', forDevice: 'network' },
          { id: 'd7', name: 'WLAN Driver', version: '3.1', vendor: 'WlanFlow', forDevice: 'wifi' },
          { id: 'd8', name: 'WLAN Driver', version: '2.7', vendor: 'WlanFlow', forDevice: 'wifi' },
        ],
      },
      master: {
        devices: [
          { id: 'cpu', name: 'CPU', status: 'ok', icon: '🧠', version: null },
          { id: 'ram', name: 'RAM', status: 'ok', icon: '💾', version: null },
          { id: 'gpu', name: 'GPU', status: 'error', icon: '🎮', version: '4.2', requiredVendor: 'OpenVGA' },
          { id: 'ssd', name: 'SSD', status: 'ok', icon: '💿', version: null },
          { id: 'network', name: 'REDE', status: 'error', icon: '🌐', version: '2.0', requiredVendor: 'NetCore' },
          { id: 'audio', name: 'ÁUDIO', status: 'ok', icon: '🔊', version: null },
          { id: 'wifi', name: 'WIFI', status: 'error', icon: '📶', version: '3.1', requiredVendor: 'WlanFlow' },
          { id: 'bluetooth', name: 'BLUETOOTH', status: 'error', icon: '🧩', version: '5.2', requiredVendor: 'BlueCore' },
        ],
        drivers: [
          { id: 'd1', name: 'GPU Driver', version: '4.2', vendor: 'BetaVGA', forDevice: 'gpu' },
          { id: 'd2', name: 'GPU Driver', version: '3.8', vendor: 'OpenVGA', forDevice: 'gpu' },
          { id: 'd3', name: 'GPU Driver', version: '4.2', vendor: 'OpenVGA', forDevice: 'gpu' },
          { id: 'd4', name: 'Net Driver', version: '2.0', vendor: 'NetAlpha', forDevice: 'network' },
          { id: 'd5', name: 'Net Driver', version: '1.9', vendor: 'NetCore', forDevice: 'network' },
          { id: 'd6', name: 'Net Driver', version: '2.0', vendor: 'NetCore', forDevice: 'network' },
          { id: 'd7', name: 'WLAN Driver', version: '3.1', vendor: 'WlanFlow', forDevice: 'wifi' },
          { id: 'd8', name: 'WLAN Driver', version: '2.7', vendor: 'WlanFlow', forDevice: 'wifi' },
          { id: 'd9', name: 'BT Driver', version: '5.2', vendor: 'BlueCore', forDevice: 'bluetooth' },
          { id: 'd10', name: 'BT Driver', version: '5.0', vendor: 'BlueCore', forDevice: 'bluetooth' },
        ],
      },
    },
    motherboard: {
      normal: { components: [
        { id: 'cpu', name: 'CPU', icon: '🧠', color: '#F26101' },
        { id: 'ram', name: 'RAM', icon: '💾', color: '#91BED4' },
        { id: 'gpu', name: 'GPU', icon: '🎮', color: '#a855f7' },
        { id: 'ssd', name: 'SSD', icon: '💿', color: '#4caf50' },
      ], slots: [
        { id: 'slot-cpu', label: 'SOCKET LGA1700', accepts: 'cpu', hint: 'Processador principal' },
        { id: 'slot-ram', label: 'DDR5 DIMM A1', accepts: 'ram', hint: 'Memória volátil' },
        { id: 'slot-gpu', label: 'PCIe x16 SLOT 1', accepts: 'gpu', hint: 'Placa de vídeo' },
        { id: 'slot-ssd', label: 'M.2 NVMe SLOT', accepts: 'ssd', hint: 'Armazenamento rápido' },
      ] },
      hard: { components: [
        { id: 'cpu', name: 'CPU', icon: '🧠', color: '#F26101' },
        { id: 'ram', name: 'RAM', icon: '💾', color: '#91BED4' },
        { id: 'gpu', name: 'GPU', icon: '🎮', color: '#a855f7' },
        { id: 'ssd', name: 'SSD', icon: '💿', color: '#4caf50' },
        { id: 'wifi', name: 'WIFI', icon: '📶', color: '#06b6d4' },
      ], slots: [
        { id: 'slot-cpu', label: 'SOCKET LGA1700', accepts: 'cpu', hint: 'Processador principal' },
        { id: 'slot-ram', label: 'DDR5 DIMM A1', accepts: 'ram', hint: 'Memória volátil' },
        { id: 'slot-gpu', label: 'PCIe x16 SLOT 1', accepts: 'gpu', hint: 'Placa de vídeo' },
        { id: 'slot-ssd', label: 'M.2 NVMe SLOT', accepts: 'ssd', hint: 'Armazenamento rápido' },
        { id: 'slot-wifi', label: 'PCIe Wi-Fi', accepts: 'wifi', hint: 'Conectividade sem fio' },
      ] },
      master: { components: [
        { id: 'cpu', name: 'CPU', icon: '🧠', color: '#F26101' },
        { id: 'ram', name: 'RAM', icon: '💾', color: '#91BED4' },
        { id: 'gpu', name: 'GPU', icon: '🎮', color: '#a855f7' },
        { id: 'ssd', name: 'SSD', icon: '💿', color: '#4caf50' },
        { id: 'wifi', name: 'WIFI', icon: '📶', color: '#06b6d4' },
        { id: 'bt', name: 'BLUETOOTH', icon: '🧩', color: '#f5c518' },
      ], slots: [
        { id: 'slot-cpu', label: 'SOCKET LGA1700', accepts: 'cpu', hint: 'Processador principal' },
        { id: 'slot-ram', label: 'DDR5 DIMM A1', accepts: 'ram', hint: 'Memória volátil' },
        { id: 'slot-gpu', label: 'PCIe x16 SLOT 1', accepts: 'gpu', hint: 'Placa de vídeo' },
        { id: 'slot-ssd', label: 'M.2 NVMe SLOT', accepts: 'ssd', hint: 'Armazenamento rápido' },
        { id: 'slot-wifi', label: 'PCIe Wi-Fi', accepts: 'wifi', hint: 'Conectividade sem fio' },
        { id: 'slot-bt', label: 'Bluetooth M.2', accepts: 'bt', hint: 'Conectividade local' },
      ] },
    },
  }

  return profiles[puzzleId]?.[level] ?? profiles.cpu.normal
}
