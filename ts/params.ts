// Meryem Betül Abdulrahman, 2300009906
// Forms 11 and 12 in TypeScript, and the typing rules for patterns in parameters.

type TaskInput = { title: string; status?: 'todo' | 'done' }

// Form 11 (worked example): the type goes after the whole pattern.
function createTask({ title, status = 'todo' }: TaskInput) {
  return { title, status }
}
console.log('form 11:', createTask({ title: 'Read' }))

type SearchOptions = { query?: string; page?: number; pageSize?: number }
function search({ query = '', page = 1, pageSize = 20 }: SearchOptions = {}) {
  return `q="${query}" page=${page} size=${pageSize}`
}
console.log('form 11 no argument:', search())
console.log('form 11 some fields:', search({ page: 3 })) 

// Form 11b:
type Point = [x: number, y: number]
const distance = ([x1, y1]: Point, [x2, y2]: Point = [0, 0]): number => Math.hypot(x2 - x1, y2 - y1)
console.log('form 11b:', distance([3, 4]), distance([1, 1], [4, 5]))

type Player = { nick: string; points: number }
const players: Player[] = [{ nick: 'mri', points: 310 }, { nick: 'kaan', points: 275 }]
console.log('form 11b callback:', players.map(({ nick, points }) => `${nick}=${points}`))

const stock: Record<string, number> = { apple: 12, pear: 0, cherry: 40 }
for (const [fruit, count] of Object.entries(stock)) {
  console.log('form 12 object:', fruit.padEnd(6), count.toFixed(0))
}

const limits = { cpu: 4, memory: 8 }
for (const [name, limit] of Object.entries(limits)) {
  const again = limits[name as keyof typeof limits]
  console.log('form 12 keys are string:', name, limit === again)
}

const capitals = new Map<string, string>([['KR', 'Seoul'], ['JP', 'Tokyo']])
for (const [country, capital] of capitals) {
  console.log('form 12 map:', country, capital.length)
}

// Form 12: index and value with entries(): [number, string].
for (const [index, name] of ['Courtney', 'Kurt'].entries()) {
  console.log('form 12 array entries:', index + 1, name)
}

for (const { nick, points: score } of players) {
  console.log('form 12 objects:', nick, score)
}
