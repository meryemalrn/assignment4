// Meryem Betül Abdulrahman, 2300009906
// Bonus 2: Depth. Experiments beyond the twelve forms. Run with `node js/depth.mjs`.

// ---------------------------------------------------------------------------
// D1. What does an array pattern really call on the value? Symbol.iterator, then next().
function spy(values) {
  let i = 0
  return {
    [Symbol.iterator]() {
      console.log('D1   [Symbol.iterator]() called')
      return {
        next() {
          const step = i < values.length ? { value: values[i++], done: false } : { value: undefined, done: true }
          console.log('D1   next() ->', JSON.stringify(step))
          return step
        },
        return() {
          console.log('D1   return() called: the pattern stopped early')
          return { done: true }
        },
      }
    },
  }
}
console.log('D1 two variables from four values:')
const [s1, s2] = spy(['a', 'b', 'c', 'd'])
console.log('D1 result:', s1, s2)
console.log('D1 with rest (runs to the end, no return()):')
const [r1, ...rMore] = spy(['a', 'b'])
console.log('D1 result:', r1, rMore)

// So anything iterable can stand on the right of an array pattern.
const [ch1, ch2, ...chRest] = 'Mri!'
console.log('D1 string:', ch1, ch2, chRest) // M r [ 'i', '!' ]
const [emoji, after] = '👍ok' // iterates by code point, not by UTF-16 unit
console.log('D1 emoji:', emoji, after, '| by index:', '👍ok'[0] === emoji) // 👍 o | by index: false
const [firstOfSet, secondOfSet] = new Set(['x', 'y', 'x'])
console.log('D1 Set:', firstOfSet, secondOfSet) // x y
const [[mapKey, mapValue]] = new Map([['TR', 'Ankara']])
console.log('D1 Map:', mapKey, mapValue) // TR Ankara
function* naturals() {
  let n = 1
  while (true) yield n++ // infinite: only safe because the pattern stops asking
}
const [n1, n2, n3] = naturals()
console.log('D1 infinite generator:', n1, n2, n3) // 1 2 3

// A plain object is not iterable, an array-like is not either.
try {
  const [x] = { 0: 'a', length: 1 }
  console.log(x)
} catch (error) {
  console.log('D1 array-like:', error.constructor.name + ':', error.message)
}
// An object pattern only needs property access, so it works on an array and on a string.
const { length, 0: firstChar, [length - 1]: lastChar } = 'Izmir'
console.log('D1 object pattern on a string:', length, firstChar, lastChar) // 5 I r
const { 1: middle, length: arrayLength } = ['a', 'b', 'c']
console.log('D1 object pattern on an array:', middle, arrayLength) // b 3
// Numbers and booleans are wrapped, so an object pattern on them does not throw.
const { toFixed, missingOnNumber } = 42
console.log('D1 object pattern on a number:', typeof toFixed, missingOnNumber) // function undefined

// ---------------------------------------------------------------------------
// D2. The order of evaluation.
let calls = 0
function expensive(label) {
  calls++
  console.log(`D2   default for ${label} computed`)
  return label.toUpperCase()
}
// A default is computed only when it is needed (lazily), each time it is needed.
const { a = expensive('a'), b = expensive('b') } = { a: 'given' }
console.log('D2 lazy:', a, b, 'calls =', calls) // given B calls = 1

// A default can use an EARLIER variable of the same pattern...
const { width = 10, height = width * 2, area = width * height } = { width: 3 }
console.log('D2 earlier variable:', width, height, area) // 3 6 18
// ...but not a LATER one: it is still in the temporal dead zone.
try {
  const { first = second, second = 1 } = {}
  console.log(first, second)
} catch (error) {
  console.log('D2 later variable:', error.constructor.name + ':', error.message)
}

// Left to right: key expression, then the read, then the default, one property at a time.
const log = []
const source = {
  get p() { log.push('read p'); return undefined },
  get q() { log.push('read q'); return 1 },
}
const key = (name) => { log.push(`key ${name}`); return name }
const dflt = (name) => { log.push(`default ${name}`); return 0 }
const { [key('p')]: p = dflt('p'), [key('q')]: q = dflt('q') } = source
console.log('D2 order:', log.join(' > '), '| values', p, q)

// In a parameter list the default is computed on EVERY call, so [] is a fresh array each time.
function addTag(tag, { tags = [] } = {}) {
  tags.push(tag)
  return tags
}
console.log('D2 fresh default per call:', addTag('x'), addTag('y')) // [ 'x' ] [ 'y' ]

// The swap works because the right side is fully built before anything is assigned.
let i = 1, j = 2
;[i, j] = [j, i + j]
console.log('D2 right side first:', i, j) // 2 3

// ---------------------------------------------------------------------------
// D3. Destructuring in other places.
// catch: the parameter of catch is a pattern too.
try {
  JSON.parse('{ not json')
} catch ({ name, message }) {
  console.log('D3 catch:', name, '-', message)
}

// Assignment targets do not have to be variables: any place you can assign to.
const robot = {}
const grid = [0, 0, 0]
;[robot.x, robot.y, grid[2]] = [5, 7, 9]
;({ speed: robot.speed = 1, name: robot['label'] } = { name: 'AutoTrack' })
console.log('D3 assignment targets:', robot, grid) // { x: 5, y: 7, speed: 1, label: 'AutoTrack' } [ 0, 0, 9 ]

// for...of gives values (patterns are useful); for...in gives keys as strings.
const pairs = [['a', 1], ['b', 2]]
for (const [letter, number] of pairs) console.log('D3 for...of:', letter, number)
for (const index in pairs) console.log('D3 for...in:', index, typeof index)
// A pattern in for...in "works" but destructures the KEY STRING, character by character.
for (const [c0, c1] in { ab: 1, xy: 2 }) console.log('D3 for...in with a pattern:', c0, c1)

// import { a as b } looks like { a: b } but is not destructuring: it is a live binding.
const fsModule = await import('node:fs')
const { readFileSync, existsSync: exists } = fsModule // this IS destructuring (of the namespace object)
console.log('D3 dynamic import:', typeof readFileSync, exists('package.json')) // function true

// ---------------------------------------------------------------------------
// D5. When destructuring makes code worse, and the refactoring.
const response = {
  data: { user: { profile: { contact: { emails: [{ address: 'mri@example.com', primary: true }] } } } },
  meta: { page: { total: 12 } },
}
// Worse: one deep pattern with renames. You must read it inside-out to see what the variables are.
const { data: { user: { profile: { contact: { emails: [{ address: addr, primary: isMain }] } } } }, meta: { page: { total: t } } } = response
console.log('D5 deep pattern:', addr, isMain, t) // mri@example.com true 12

// Better: one step per idea, each with a name, and a safe path with ?.
const contact = response.data.user.profile.contact
const [primaryEmail] = contact.emails
const totalPages = response.meta?.page?.total ?? 0
console.log('D5 refactored:', primaryEmail.address, primaryEmail.primary, totalPages) // mri@example.com true 12

// The deep pattern also fails hard when one level is missing; the refactored one can use ?.
try {
  const { data: { user: { settings: { theme } } } } = response
  console.log(theme)
} catch (error) {
  console.log('D5 deep pattern on a missing level:', error.message)
}
console.log('D5 optional chaining instead:', response.data.user.settings?.theme ?? 'default') // default
