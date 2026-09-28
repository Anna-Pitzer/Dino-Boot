export const WAYPOINTS = [
  { id: 0,  x: 26.7, y: 71.5, pieceId: 'cpu' },
  { id: 1,  x: 48.8, y: 78,   pieceId: 'ram' },
  { id: 2,  x: 77,   y: 79.8, pieceId: 'ssd' },
  { id: 3,  x: 80.7, y: 53.9, pieceId: 'gpu' },
  { id: 4,  x: 49.3, y: 43.7, pieceId: 'motherboard' },
  { id: 5,  x: 85.9, y: 30.2, pieceId: 'keyboard' },
  { id: 6,  x: 60.4, y: 17.6, pieceId: 'mouse' },
  { id: 7,  x: 35.2, y: 17.2, pieceId: 'monitor' },
  { id: 8,  x: 12.5, y: 24.3, pieceId: 'printer' },
  { id: 9,  x: 13.5, y: 46.8, pieceId: 'headset' },
  { id: 10, x: 90.8, y: 56.3, pieceId: 'pendrive' },
  { id: 11, x: 33.6, y: 71.5 },
  { id: 12, x: 42.3, y: 74.9 },
  { id: 14, x: 41.6, y: 56.9 },
  { id: 15, x: 57.1, y: 77.3 },
  { id: 17, x: 79.4, y: 72.8 },
  { id: 18, x: 82.7, y: 61.1 },
  { id: 19, x: 73.9, y: 58.9 },
  { id: 20, x: 58.1, y: 56.3 },
  { id: 21, x: 88.3, y: 50   },
  { id: 22, x: 84.9, y: 37.8 },
  { id: 23, x: 77.7, y: 35.2 },
  { id: 24, x: 62.7, y: 44.7 },
  { id: 25, x: 52.8, y: 36.5 },
  { id: 26, x: 58.7, y: 25.8 },
  { id: 28, x: 46.4, y: 38   },
  { id: 29, x: 35,   y: 46.8 },
  { id: 30, x: 23,   y: 50.9 },
  { id: 31, x: 17.3, y: 52.4 },
  { id: 32, x: 26.1, y: 66.1 },
  { id: 33, x: 19,   y: 26.3 },
  { id: 34, x: 31.1, y: 24.3 },
  { id: 35, x: 34,   y: 67.6 },
  { id: 36, x: 37.7, y: 24.1 },
  { id: 37, x: 69.3, y: 80   },
]

export const CONNECTIONS = [
  [11, 12], [12, 1],  [11, 0],  [14, 4],  [15, 1],
  [2,  17], [17, 18], [18, 10], [18, 3],  [3,  19],
  [18, 19], [19, 20], [20, 4],  [10, 3],  [10, 21],
  [21, 3],  [21, 22], [22, 5],  [5,  23], [22, 23],
  [23, 24], [24, 20], [20, 14], [24, 25], [26, 25],
  [26, 6],  [25, 28], [4,  28], [4,  25], [28, 29],
  [14, 29], [4,  29], [4,  24], [29, 30], [14, 35],
  [35, 0],  [32, 31], [32, 0],  [31, 30], [31, 9],
  [32, 35], [28, 36], [36, 34], [36, 7],  [34, 7],
  [34, 33], [8,  33], [15, 37], [37, 2],
]

// BFS — retorna array de waypoint ids do origem ao destino
export function findPath(fromPieceId, toPieceId) {
  const start = WAYPOINTS.find(w => w.pieceId === fromPieceId)?.id
  const end   = WAYPOINTS.find(w => w.pieceId === toPieceId)?.id
  if (start == null || end == null) return []
  if (start === end) return [start]

  // monta adjacência
  const adj = {}
  WAYPOINTS.forEach(w => { adj[w.id] = [] })
  CONNECTIONS.forEach(([a, b]) => {
    adj[a].push(b)
    adj[b].push(a)
  })

  // BFS
  const visited = new Set([start])
  const queue   = [[start]]
  while (queue.length) {
    const path = queue.shift()
    const node = path[path.length - 1]
    for (const neighbor of adj[node]) {
      if (neighbor === end) return [...path, neighbor]
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push([...path, neighbor])
      }
    }
  }
  return []
}
