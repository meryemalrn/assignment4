// Meryem Betül Abdulrahman, 2300009906
// Destructuring in parameters and loops (forms 11 and 12). Run with `node js/params.mjs`.

// Form 11 (worked example): an options object in the parameter list, with defaults.
function createTask({ title, status = 'todo' } = {}) {
  return { title, status }
}
console.log('form 11:', createTask({ title: 'Read' })) // form 11: { title: 'Read', status: 'todo' }

// Form 11: the two kinds of default. `= {}` is for the WHOLE argument, `status = 'todo'` for one field.
console.log('form 11 no argument:', createTask()) // { title: undefined, status: 'todo' }
console.log('form 11 undefined:', createTask(undefined)) // { title: undefined, status: 'todo' }
try {
  createTask(null) // null is not undefined, so `= {}` is not used, and null cannot be destructured
} catch (error) {
  console.log('form 11 null:', error.constructor.name)
}

// Without `= {}` a call with no argument throws.
function createTaskStrict({ title, status = 'todo' }) {
  return { title, status }
}
try {
  createTaskStrict()
} catch (error) {
  console.log('form 11 no "= {}":', error.message)
}

// Form 11b:
const distance = ([x1, y1], [x2, y2] = [0, 0]) => Math.hypot(x2 - x1, y2 - y1)
console.log('form 11b:', distance([3, 4]), distance([1, 1], [4, 5])) // form 11b: 5 5

const players = [{ nick: 'mri', points: 310 }, { nick: 'kaan', points: 275 }]
console.log('form 11b callback:', players.map(({ nick, points }) => `${nick}=${points}`)) // [ 'mri=310', 'kaan=275' ]

// Form 12:
const stock = { apple: 12, pear: 0, cherry: 40 }
for (const [fruit, count] of Object.entries(stock)) {
  console.log('form 12 object:', fruit, count)
}

const capitals = new Map([['KR', 'Seoul'], ['JP', 'Tokyo']])
for (const [country, capital] of capitals) {
  console.log('form 12 map:', country, capital)
}

for (const [index, name] of ['Courtney', 'Kurt'].entries()) {
  console.log('form 12 array entries:', index, name)
}

for (const { nick, points: score = 0 } of players) {
  console.log('form 12 objects:', nick, score)
}
