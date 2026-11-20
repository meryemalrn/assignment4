// Meryem Betül Abdulrahman, 2300009906
// The same four array forms as js/arrays.mjs, now typed. Run with `npx tsx ts/arrays.ts`.

// Form 1 (worked example): the return type of the function is a tuple.
function minMax(numbers: number[]): [number, number] {
  return [Math.min(...numbers), Math.max(...numbers)]
}
const [lowest, highest] = minMax([4, 9, 2])
console.log('form 1:', lowest, highest) // form 1: 2 9

// Form 1: a tuple with a different type in each position. `name` is string, `grade` is number.
function topStudent(): [name: string, grade: number] {
  return ['Deniz', 94]
}
const [topName, topGrade] = topStudent()
console.log('form 1 mixed tuple:', topName.toUpperCase(), topGrade.toFixed(1)) // DENIZ 94.0

// Form 2: skip an item and collect the rest. From a string[] every item is `string | undefined`
// (noUncheckedIndexedAccess), and the rest is `string[]`.
const queue: string[] = ['Bella', 'Mortimer', 'Cassandra', 'Alexander']
const [, second, ...others] = queue
console.log('form 2:', second?.toUpperCase(), others) // form 2: MORTIMER [ 'Cassandra', 'Alexander' ]

// Form 2 with a tuple: the positions are known, so there is no `undefined`, and the rest is a tuple too.
const record: [id: number, name: string, ...tags: string[]] = [7, 'Bella', 'vip', 'new']
const [recordId, recordName, ...tags] = record // number, string, string[]
console.log('form 2 tuple:', recordId + 1, recordName.length, tags) // 8 5 [ 'vip', 'new' ]

// Form 3: swap. The variables keep their declared type, so both sides must fit.
let left: string = 'dots'
let right: string = 'stripes'
;[left, right] = [right, left]
console.log('form 3:', left, right) // form 3: stripes dots

// Form 4: defaults. The default removes `undefined` from the type: `size` is string, not string | undefined.
const sizes: string[] = ['L']
const [size = 'M', color = 'black'] = sizes
console.log('form 4:', size.toLowerCase(), color.toUpperCase()) // form 4: l BLACK

// Form 4: when null is in the type, the default does not remove it (and does not replace it at run time).
const maybe: (string | null)[] = [null]
const [value = 'default'] = maybe // string | null
console.log('form 4 null:', value, value?.length) // form 4 null: null undefined
