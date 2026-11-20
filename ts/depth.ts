// Meryem Betül Abdulrahman, 2300009906
// Bonus 2: Depth, type level (D4). Taking TYPES apart in the same spirit. Run with `npx tsx ts/depth.ts`.

// `infer` is destructuring for types: a pattern on the right of `extends`, with names for the parts.
type First<T extends readonly unknown[]> = T extends readonly [infer Head, ...unknown[]] ? Head : never
type Rest<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Tail] ? Tail : []
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer End] ? End : never

type Row = [id: number, name: string, active: boolean]
type RowFirst = First<Row> // number
type RowRest = Rest<Row> // [name: string, active: boolean]
type RowLast = Last<Row> // boolean

// A type-level test: this alias only compiles when A and B are the same type.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
const checks: [
  Equal<RowFirst, number>,
  Equal<RowRest, [string, boolean]>,
  Equal<RowLast, boolean>,
  Equal<First<[]>, never>,
] = [true, true, true, true]
console.log('D4 First/Rest/Last checks:', checks) // [ true, true, true, true ]

// The value-level twin of each type: the same shape of pattern.
const row: Row = [1, 'Deniz', true]
const [head, ...tail] = row // head: First<Row>, tail: Rest<Row>
const headTyped: RowFirst = head
const tailTyped: RowRest = tail
console.log('D4 value twin:', headTyped, tailTyped) // 1 [ 'Deniz', true ]

// Object version: take the type of one property out, like { data: X }.
type Unwrap<T> = T extends { data: infer D } ? D : never
type ApiResult = { data: { total: number; rows: Row[] }; status: number }
const payload: Unwrap<ApiResult> = { total: 1, rows: [row] }
console.log('D4 Unwrap:', payload.total, payload.rows.length) // 1 1

// Parameters<F> and ReturnType<F> are the built-in versions for functions.
function createTask({ title, status = 'todo' }: { title: string; status?: 'todo' | 'done' }, urgent = false) {
  return { title, status, urgent }
}
type Args = Parameters<typeof createTask> // [{ title: string; status?: 'todo' | 'done' }, urgent?: boolean]
type TaskOptions = First<Args> // the options object type, taken out of the function
const options: TaskOptions = { title: 'Write the guide' }
const args: Args = [options, true]
const [{ title }, urgent = false] = args // a pattern on a value typed by a type-level pattern
const made: ReturnType<typeof createTask> = createTask(...args) // spread: the opposite job of rest
console.log('D4 Parameters:', title, urgent, made) // Write the guide true { title: 'Write the guide', status: 'todo', urgent: true }

// A generic function whose result type is built from the keys you ask for (form 8 at type level).
function omit<T extends object, K extends keyof T>(source: T, ...keys: K[]): Omit<T, K> {
  const copy = { ...source }
  for (const key of keys) delete copy[key]
  return copy
}
const slim = omit({ id: 1, name: 'Deniz', password: 'secret' }, 'password') // { id: number; name: string }
console.log('D4 omit:', slim, Object.keys(slim)) // { id: 1, name: 'Deniz' } [ 'id', 'name' ]
