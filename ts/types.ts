// Meryem Betül Abdulrahman, 2300009906
// What only TypeScript adds (topics T1 to T5). See the handout.

// ---------------------------------------------------------------------------
// T1 (worked example): `{ a: string }` inside a pattern is a RENAME, not a type.
const point = { x: 1, y: 2 }
const { x: horizontal } = point // x is renamed to horizontal; there is no variable x
console.log('T1:', horizontal) // T1: 1

// The confusion: this line compiles! It does not say "x is a number".
// It makes a variable called `number` that holds point.x.
const { x: number } = point
console.log('T1 confusion:', number, typeof number) // T1 confusion: 1 number

// The correct way: the pattern first, then ONE type for the whole pattern.
const { x, y }: { x: number; y: number } = point
console.log('T1 correct:', x, y) // T1 correct: 1 2

// Rename and type together: rename inside, type after.
type Point = { x: number; y: number }
const { x: px, y: py }: Point = point
console.log('T1 rename + type:', px, py) // T1 rename + type: 1 2

// ---------------------------------------------------------------------------
// T2: tuple return types and `as const`.
// Without an annotation the return type is an ARRAY of a union: (string | number)[]
function parseLoose(text: string) {
  const [name = '', age = '0'] = text.split(':')
  return [name, Number(age)]
}
const [looseName, looseAge] = parseLoose('Mri:21') // both: string | number | undefined
console.log('T2 loose:', looseName, looseAge, typeof looseName) // T2 loose: Mri 21 string

// With a tuple return type each position has its own type.
function parseTuple(text: string): [string, number] {
  const [name = '', age = '0'] = text.split(':')
  return [name, Number(age)]
}
const [tupleName, tupleAge] = parseTuple('Mri:21') // string, number
console.log('T2 tuple:', tupleName.toUpperCase(), tupleAge + 1) // T2 tuple: MRI 22

// `as const` on the return does the same without writing the type: readonly [string, number].
function parseConst(text: string) {
  const [name = '', age = '0'] = text.split(':')
  return [name, Number(age)] as const
}
const [constName, constAge] = parseConst('Mri:21') // string, number
console.log('T2 as const return:', constName.toUpperCase(), constAge + 1) // T2 as const return: MRI 22

// `as const` on a literal array: a readonly tuple of LITERAL types.
const plain = ['GET', 200] // (string | number)[]
const frozen = ['GET', 200] as const // readonly ['GET', 200]
const [plainMethod] = plain // string | number | undefined
const [method, code] = frozen // 'GET', 200
const onlyGet: 'GET' = method // compiles only because of `as const`
console.log('T2 as const literal:', plainMethod, onlyGet, code) // T2 as const literal: GET GET 200
// `as const` is types only: nothing is frozen at run time.
console.log('T2 frozen at run time?', Object.isFrozen(frozen)) // T2 frozen at run time? false

// ---------------------------------------------------------------------------
// T3: noUncheckedIndexedAccess. An item taken out of an array may be missing.
const items: string[] = ['pen', 'ruler']
const [first] = items // string | undefined
// first.toUpperCase() does not compile here: 'first' is possibly 'undefined'.

// Way 1: check it (narrowing).
if (first !== undefined) {
  console.log('T3 check:', first.toUpperCase()) // T3 check: PEN
}
// Way 2: a default in the pattern.
const [firstOrDefault = 'nothing'] = items // string
console.log('T3 default:', firstOrDefault.toUpperCase()) // T3 default: PEN
// Way 3: optional chaining and ?? at the place of use.
const empty: string[] = []
const [missing] = empty
console.log('T3 ?. and ??:', missing?.toUpperCase() ?? 'NOTHING') // T3 ?. and ??: NOTHING
// Way 4: when the length is really fixed, say so with a tuple. No undefined then.
const pair: [string, string] = ['pen', 'ruler']
const [firstOfPair] = pair // string
console.log('T3 tuple:', firstOfPair.toUpperCase()) // T3 tuple: PEN
// The rest is never undefined: it is an array (maybe empty).
const [, ...restItems] = items // string[]
console.log('T3 rest:', restItems.length) // T3 rest: 1

// ---------------------------------------------------------------------------
// T4: defaults and optional fields.
type Config = {
  host: string // required
  port?: number // optional
  timeout?: number // optional, gets a default below
  proxy: string | null // required, may be null
}
const config: Config = { host: 'localhost', proxy: null }
const { host, port, timeout = 3000, proxy = 'direct' } = config
// host:    string
// port:    number | undefined   (optional, no default)
// timeout: number               (optional + default: undefined is gone)
// proxy:   string | null        (the default never runs for null, so null stays in the type)
const doubled: number = timeout * 2 // compiles: timeout is a plain number
console.log('T4:', host, port, timeout, doubled, proxy) // T4: localhost undefined 3000 6000 null
// `port * 2` would not compile; it needs a default or a check:
console.log('T4 port:', (port ?? 80) * 2) // T4 port: 160

// The default must fit the type of the field; a default of another type widens the variable.
const { port: portText = 'none' } = config // number | string
console.log('T4 widened:', portText) // T4 widened: none

// ---------------------------------------------------------------------------
// T5: one compile error that destructuring causes.
type User = { name: string; email: string }
const user: User = { name: 'Mri', email: 'mri@example.com' }
// @ts-expect-error TS2339: Property 'mail' does not exist on type 'User'.
const { mail } = user
console.log('T5 wrong name:', mail) // T5 wrong name: undefined

// The fix: use the real field name, and rename it if `mail` is the name you want.
const { email: mailFixed } = user
console.log('T5 fixed:', mailFixed) // T5 fixed: mri@example.com
