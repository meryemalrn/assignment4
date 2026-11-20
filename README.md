# Destructuring Field Guide

Name: Meryem Betül Abdulrahman
Student number: 2300009906

Bonuses claimed: **Bonus 1: LaTeX** (`latex/guide.pdf`), **Bonus 2: Depth** (`js/depth.mjs`, `ts/depth.ts`), **Bonus 3: Real code**. Each one has its own section near the end.

## Contents

- [Run](#run)
- [The idea in one minute](#the-idea-in-one-minute)
- [Field guide](#field-guide): forms 1 to 12
- [Pitfalls](#pitfalls)
- [TypeScript topics](#typescript-topics-t1-to-t5): T1 to T5
- [Props and children](#props-and-children): P1 to P7
- [JavaScript vs TypeScript](#javascript-vs-typescript)
- [Bonus 1: LaTeX](#bonus-1-latex)
- [Bonus 2: Depth](#bonus-2-depth)
- [Bonus 3: Real code](#bonus-3-real-code)
- [Logs](#logs)

## Run

```
npm install
npm run all      # runs the JS and TS examples
npm run check    # type-checks in strict mode
npm run all > output.txt   # how output.txt was made
```

Every output in this guide is copied from `output.txt`, which is the real output of `npm run all`
(Node.js v22, TypeScript 5.8, React 19). Two React warnings go to stderr, so they are not in
`output.txt`; they are quoted in [Logs](#logs).

| File | What is in it |
|---|---|
| `js/arrays.mjs`, `ts/arrays.ts` | forms 1 to 4 |
| `js/objects.mjs`, `ts/objects.ts` | forms 5 to 10 |
| `js/params.mjs`, `ts/params.ts` | forms 11 and 12 |
| `js/pitfalls.mjs` | seven pitfalls |
| `ts/types.ts` | topics T1 to T5 |
| `js/props.jsx`, `ts/props.tsx` | props and children, P1 to P7 |
| `js/depth.mjs`, `ts/depth.ts` | Bonus 2 (added to the `js` and `ts` scripts in `package.json`) |

## The idea in one minute

Destructuring is a **pattern on the left** that has the same shape as the **value on the right**.
The pattern says where each variable gets its value from.

- An **array pattern** `[a, b]` goes by **position**.
- An **object pattern** `{ a, b }` goes by **name**.

The best way to understand any pattern is to rewrite it as plain assignments, one line per variable.
Every entry below does that under "As plain assignments".

Two things use the same three dots and do opposite jobs:

| | Where | Job | Example |
|---|---|---|---|
| **rest** | in a pattern (left side, parameter list) | **collects** what is left into a new array or object | `const [head, ...tail] = queue` |
| **spread** | in an expression (right side, call, JSX) | **expands** an array or object into separate items or fields | `const rebuilt = [head, ...tail]` |

```text
form 2 rest vs spread: 3 4
```

`tail` collected 3 items; `[head, ...tail]` expanded them again into an array of 4.

## Field guide

### Form 1: values by position, `const [x, y] = f()`

**Syntax:** `const [first, second] = arrayOrIterable`

**Example** (from `js/arrays.mjs`):

```js
function minMax(numbers) {
  return [Math.min(...numbers), Math.max(...numbers)]
}
const [lowest, highest] = minMax([4, 9, 2])
console.log('form 1:', lowest, highest)

const [one, two, three] = [10, 20]
console.log('form 1 missing:', one, two, three)
```

**Output:**

```text
form 1: 2 9
form 1 missing: 10 20 undefined
```

**As plain assignments:**

```js
const result = minMax([4, 9, 2])
const lowest = result[0]
const highest = result[1]
```

**Use it when:** a function gives back several values in a fixed order (`useState`, `useReducer`,
`minMax`, `Object.entries` items). The caller chooses the names, which is why hooks return arrays.

**Watch out:** only the position counts; the names mean nothing to JavaScript. A missing item is
`undefined` and there is no error, so a typo in the order is silent. In TypeScript, give the function
a tuple return type (`[number, number]`), otherwise it is an array and every variable may be `undefined` (T2, T3).

### Form 2: skip an item and collect the rest, `const [, second, ...others] = list`

**Syntax:** `const [, second, ...others] = list` (an empty slot skips, `...name` collects)

**Example** (from `js/arrays.mjs`):

```js
const queue = ['Bella', 'Mortimer', 'Cassandra', 'Alexander']
const [, second, ...others] = queue
console.log('form 2:', second, others)

const [only, ...nothingLeft] = ['Bella']
console.log('form 2 empty rest:', only, nothingLeft)
console.log('form 2 rest is a copy:', others !== queue, queue.length)
```

**Output:**

```text
form 2: Mortimer [ 'Cassandra', 'Alexander' ]
form 2 empty rest: Bella []
form 2 rest is a copy: true 4
```

**As plain assignments:**

```js
const second = queue[1]
const others = queue.slice(2)
```

**Use it when:** you need the head of a list and the tail separately, or you only care about one
position (for example the second capture group of a regular expression match).

**Watch out:** the skipped item is gone, it is **not** in `others` (I guessed wrong here, see Logs 1).
Rest collects only what comes **after** the positions already used. Rest must be the last element,
it is always a new array, and when nothing is left it is `[]`, never `undefined`. Many commas in a
row (`[, , , fourth]`) are hard to count; use an index instead.

### Form 3: swap two variables, `[a, b] = [b, a]`

**Syntax:** `[a, b] = [b, a]` (an assignment, no `const` or `let`; the variables exist already)

**Example** (from `js/arrays.mjs`):

```js
let left = 'dots'
let right = 'stripes'
;[left, right] = [right, left]
console.log('form 3:', left, right)

let gold = 'Sarı', silver = 'Gri', bronze = 'Kahve'
;[gold, silver, bronze] = [bronze, gold, silver]
console.log('form 3 rotate:', gold, silver, bronze)
```

**Output:**

```text
form 3: stripes dots
form 3 rotate: Kahve Sarı Gri
```

**As plain assignments:**

```js
const temporary = [right, left] // the right side is built first, from the OLD values
left = temporary[0]
right = temporary[1]
```

**Use it when:** you swap or rotate values (sorting algorithms, two pointers) and do not want a temporary variable.

**Watch out:** the variables must be `let`. A line that starts with `[` is glued to the line before
it when that line has no semicolon, so write `;[left, right] = ...` or end the line above with `;`
(pitfall 7 shows the real error). It works because the whole right side is evaluated before any assignment.

### Form 4: default values in an array, `const [a = 1, b = 2] = []`

**Syntax:** `const [a = defaultA, b = defaultB] = list`

**Example** (from `js/arrays.mjs`):

```js
const [size = 'M', color = 'black'] = ['L']
console.log('form 4:', size, color)

const [m1 = 'default'] = []
const [m2 = 'default'] = [undefined]
const [m3 = 'default'] = [null]
console.log('form 4 missing/undefined/null:', m1, m2, m3)
```

**Output:**

```text
form 4: L black
form 4 missing/undefined/null: default default null
```

**As plain assignments:**

```js
const list = ['L']
const size = list[0] !== undefined ? list[0] : 'M'
const color = list[1] !== undefined ? list[1] : 'black'
```

**Use it when:** the list may be shorter than the pattern, for example the parts of `text.split(':')`.

**Watch out:** the test is `=== undefined` and nothing else. A missing item and an explicit
`undefined` get the default; `null`, `0`, `''` and `false` do not. In TypeScript the default removes
`undefined` from the type but leaves `null` in it.

### Form 5: properties by name, `let { a, b } = t`

**Syntax:** `const { a, b } = object` or `let { a, b } = object`

**Example** (from `js/objects.mjs`):

```js
const laptop = { brand: 'Lenovo', ramGb: 16 }
let { brand, ramGb, gpu } = laptop
ramGb = 32 // `let` variables can be reassigned; the object is not touched
console.log('form 5 let:', brand, ramGb, gpu, laptop.ramGb)
```

**Output:**

```text
form 5: Buy milk todo
form 5 let: Lenovo 32 undefined 16
```

(The first line is the worked example of the starter, `const { title, status } = task`.)

**As plain assignments:**

```js
let brand = laptop.brand
let ramGb = laptop.ramGb
let gpu = laptop.gpu
```

**Use it when:** you read several fields of the same object, and the field names are good variable names.

**Watch out:** the variable name **must be** the property name; a typo gives `undefined` in
JavaScript and a compile error in TypeScript (T5). The variables are copies: `ramGb = 32` did not
change `laptop.ramGb`. The value on the right must not be `undefined` or `null` (pitfall 1).

### Form 6: rename while you take it, `const { a: alpha } = t`

**Syntax:** `const { propertyName: newVariableName } = object`

**Example** (from `js/objects.mjs`):

```js
const course = { code: 'SEN0416', name: 'Game Programming' }
const { code: courseCode, name: courseName } = course
console.log('form 6:', courseCode, courseName)
console.log('form 6 old name:', typeof code)
```

**Output:**

```text
form 6: SEN0416 Game Programming
form 6 old name: undefined
```

**As plain assignments:**

```js
const courseCode = course.code
const courseName = course.name
```

**Use it when:** the property name is already taken in this scope (two objects that both have
`name` or `id`), or the name is too general here (`data`, `value`, `name`).

**Watch out:** the direction is `source: target`, the opposite of an object literal, where
`{ courseCode: code }` would mean "property `courseCode` gets the value of `code`". After the
pattern only `courseCode` exists; `code` is not a variable. In TypeScript the colon here is **never**
a type (T1).

### Form 7: default values in an object, `const { a = 1 } = t`

**Syntax:** `const { a = defaultA } = object`, with a rename: `const { a: alpha = defaultA } = object`

**Example** (from `js/objects.mjs`):

```js
const ticket = { subject: 'Login fails', priority: undefined, assignee: null }
const { subject, priority = 'normal', assignee = 'nobody', labels = [] } = ticket
console.log('form 7:', subject, priority, assignee, labels)

const { priority: level = 'normal' } = ticket
console.log('form 7 rename+default:', level)
```

**Output:**

```text
form 7: Login fails normal null []
form 7 rename+default: normal
```

**As plain assignments:**

```js
const priority = ticket.priority !== undefined ? ticket.priority : 'normal'
const assignee = ticket.assignee !== undefined ? ticket.assignee : 'nobody' // null !== undefined, so null stays
const labels = ticket.labels !== undefined ? ticket.labels : []
```

**Use it when:** a field is optional (options objects, API responses, React props) and you want one
place that says what the fallback is.

**Watch out:** `assignee` is `null`, not `'nobody'`: the default is only for `undefined`. APIs and
databases usually send `null` for "no value", so for those use `??` after the destructuring. With a
rename the order is `property: variable = default`.

### Form 8: rest in an object, `const { a, ...others } = t`

**Syntax:** `const { a, ...others } = object`

**Example** (from `js/objects.mjs`):

```js
const student = { id: 42, name: 'Deniz', city: 'Izmir', year: 3 }
const { id, ...others } = student
console.log('form 8:', id, others)
console.log('form 8 original untouched:', Object.keys(student).length)

const updated = { ...others, year: 4 } // spread: the opposite job
console.log('form 8 spread:', updated)
```

**Output:**

```text
form 8: 42 { name: 'Deniz', city: 'Izmir', year: 3 }
form 8 original untouched: 4
form 8 spread: { name: 'Deniz', city: 'Izmir', year: 4 }
```

**As plain assignments:**

```js
const id = student.id
const others = { name: student.name, city: student.city, year: student.year } // every own key except id
```

**Use it when:** you want an object "without" some fields (drop `password` before sending, drop
`id` before an update), or a component passes "everything else" on to a DOM element (P4).

**Watch out:** `others` is a new object but a **shallow** copy; nested objects are shared (pitfall 4).
It takes only own enumerable properties, so methods from a class prototype are not in it. Rest must
be last. `...others` in the pattern collects; `...others` in `{ ...others, year: 4 }` expands.

### Form 9: nested patterns, `const { p: { x }, list: [first] } = t`

**Syntax:** `const { outer: { inner }, list: [first, ...more] } = object`

**Example** (from `js/objects.mjs`):

```js
const order = {
  customer: { fullName: 'Jensen Huang', address: { city: 'California' } },
  items: ['keyboard', 'mouse', 'monitor'],
}
const { customer: { fullName, address: { city } }, items: [firstItem, ...otherItems] } = order
console.log('form 9:', fullName, city, firstItem, otherItems)
console.log('form 9 no variable for the path:', typeof customer, typeof items)

try {
  const { shipping: { carrier } } = order
} catch (error) {
  console.log('form 9 missing parent:', error.message)
}
const { shipping: { carrier = 'none' } = {} } = order
console.log('form 9 safe:', carrier)
```

**Output:**

```text
form 9: Jensen Huang California keyboard [ 'mouse', 'monitor' ]
form 9 no variable for the path: undefined undefined
form 9 missing parent: Cannot read properties of undefined (reading 'carrier')
form 9 safe: none
```

**As plain assignments:**

```js
const fullName = order.customer.fullName
const city = order.customer.address.city
const firstItem = order.items[0]
const otherItems = order.items.slice(1)
```

**Use it when:** you need two or three values from a known, stable shape, one or two levels deep.

**Watch out:** `customer:` and `items:` are only **paths**; they do not become variables. It is form 6
where the "new name" is another pattern. If a parent is missing the whole statement throws, so give
the parent a default: `{ shipping: { carrier = 'none' } = {} }`. Deeper than two levels it becomes
hard to read; see D5 in Bonus 2 for a refactoring.

### Form 10: a computed key, `const { [key]: value } = t`

**Syntax:** `const { [expression]: variable } = object` (the rename part is required)

**Example** (from `js/objects.mjs`):

```js
const scores = { math: 85, physics: 72, 'web-programming': 95 }
const wanted = 'physics'
const { [wanted]: wantedScore } = scores
console.log('form 10:', wantedScore)

const { ['web-' + 'programming']: webScore, 'web-programming': sameScore, [`chem`]: chem = 0 } = scores
console.log('form 10 expression:', webScore, sameScore, chem)
```

**Output:**

```text
form 10: 72
form 10 expression: 95 95 0
```

**As plain assignments:**

```js
const wantedScore = scores[wanted]
const webScore = scores['web-' + 'programming']
```

**Use it when:** the property name is only known at run time (a column name, a form field name), or
it is not a valid identifier (`'web-programming'`), and you take it together with other fields or with a rest:
`const { [field]: removed, ...remaining } = row` removes a field whose name is in a variable.

**Watch out:** you must give a variable name after the colon; `{ [wanted] }` is a syntax error
because JavaScript cannot guess the name. For one single value, `scores[wanted]` is shorter and
clearer. In TypeScript the key must be typed as `keyof` the object.

### Form 11: patterns in parameters, with defaults, `function f({ a = 1, b } = {})`

**Syntax:** `function f({ a = 1, b } = {}) { ... }`; TypeScript: `function f({ a = 1, b }: Options = {})`

**Example** (from `js/params.mjs`):

```js
function createTask({ title, status = 'todo' } = {}) {
  return { title, status }
}
console.log('form 11:', createTask({ title: 'Read' }))
console.log('form 11 no argument:', createTask())

function createTaskStrict({ title, status = 'todo' }) { // no "= {}"
  return { title, status }
}
try { createTaskStrict() } catch (error) { console.log('form 11 no "= {}":', error.message) }

const distance = ([x1, y1], [x2, y2] = [0, 0]) => Math.hypot(x2 - x1, y2 - y1)
console.log('form 11b:', distance([3, 4]), distance([1, 1], [4, 5]))
```

**Output:**

```text
form 11: { title: 'Read', status: 'todo' }
form 11 no argument: { title: undefined, status: 'todo' }
form 11 undefined: { title: undefined, status: 'todo' }
form 11 null: TypeError
form 11 no "= {}": Cannot destructure property 'title' of 'undefined' as it is undefined.
form 11b: 5 5
form 11b callback: [ 'mri=310', 'kaan=275' ]
```

**As plain assignments:**

```js
function createTask(options) {
  if (options === undefined) options = {}                              // the "= {}" part
  const title = options.title
  const status = options.status !== undefined ? options.status : 'todo' // the "status = 'todo'" part
  return { title, status }
}
```

**Use it when:** a function has more than two or three parameters or optional ones. The call site
reads like named arguments, `createTask({ title: 'Read' })`, and the order does not matter. Every
React component is this form.

**Watch out:** there are **two** kinds of default with two jobs: `status = 'todo'` is for one missing
field, `= {}` is for the whole missing argument. Without `= {}` a call with no argument throws
(output above). `createTask(null)` throws too, because `null` does not trigger `= {}`.

### Form 12: patterns in loops, `for (const [k, v] of Object.entries(o))`

**Syntax:** `for (const [key, value] of Object.entries(object))`, `for (const [key, value] of map)`,
`for (const { a, b } of arrayOfObjects)`

**Example** (from `js/params.mjs`):

```js
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
```

**Output:**

```text
form 12 object: apple 12
form 12 object: pear 0
form 12 object: cherry 40
form 12 map: KR Seoul
form 12 map: JP Tokyo
form 12 array entries: 0 Courtney
form 12 array entries: 1 Kurt
form 12 objects: mri 310
form 12 objects: kaan 275
```

**As plain assignments:**

```js
for (const entry of Object.entries(stock)) {
  const fruit = entry[0]
  const count = entry[1]
}
```

**Use it when:** each item of the loop is a pair or a small record. `Object.entries` and `Map` both
produce `[key, value]` pairs, so form 1 fits exactly.

**Watch out:** an object is not iterable itself: `for (const [k, v] of stock)` throws; you need
`Object.entries(stock)`. A `Map` **is** iterable and needs no `Object.entries`. It must be
`for...of`; with `for...in` the pattern is applied to the key string (D3 in Bonus 2). In TypeScript
the key from `Object.entries` is always `string`, never the narrow key type.

## Pitfalls

All from `js/pitfalls.mjs`.

### Pitfall 1: destructuring `undefined` or `null` throws

```js
const { a } = undefined
const [first] = null
const { a: safeA } = undefined ?? {} // the fix
```

```text
pitfall 1: TypeError
pitfall 1 message: Cannot destructure property 'a' of 'undefined' as it is undefined.
pitfall 1 array/null: null is not iterable
pitfall 1 fixed: undefined
```

**Why:** a pattern is property access in disguise (`undefined.a`), and `undefined` and `null` are the
only two values that have no properties at all. The array pattern fails differently because it
asks for an iterator instead of a property. **Fix:** a fallback on the right (`?? {}`), or `= {}`
on a parameter.

### Pitfall 2: a default only applies to `undefined`, not to `null`

```js
const settings = { theme: undefined, fontSize: null, volume: 0, nickname: '' }
const { theme = 'dark', fontSize = 14, volume = 50, nickname = 'guest', lang = 'tr' } = settings
```

```text
pitfall 2: dark null 0 "" tr
pitfall 2 fixed: 14
```

**Why:** the language defines the default as "use it when the value is exactly `undefined`".
`undefined` means "nothing was given"; `null`, `0` and `''` are values somebody gave on purpose, so
they are kept. **Fix:** when `null` should also fall back, take the value out and use `??`:
`rawFontSize ?? 14`.

### Pitfall 3: assigning without `const`/`let` needs parentheses

```js
let width, height
{ width, height } = box      // SyntaxError
;({ width, height } = box)   // correct
```

```text
pitfall 3: SyntaxError: Unexpected token '='
pitfall 3 fixed: 30 20
```

**Why:** at the start of a statement `{` opens a **block**, not a pattern. The parser reads
`{ width, height }` as a block with two expressions and then finds an `=` it cannot place.
Parentheses force it to read an expression. (A SyntaxError stops the whole file from loading, so the
example builds the bad statement from a string with `new Function` to be able to catch it.)

### Pitfall 4: it copies references, not deep copies

```js
const team = { name: 'AutoTrack', members: ['Mri', 'Kaan'], lead: { name: 'Mri' } }
const { members, lead, ...restOfTeam } = team
members.push('Zeynep')
lead.name = 'Zeynep'
console.log('pitfall 4:', team.members, team.lead)
```

```text
pitfall 4: [ 'Mri', 'Kaan', 'Zeynep' ] { name: 'Zeynep' }
pitfall 4 primitive: AutoTrack Other
pitfall 4 same object: true true
```

**Why:** `const { members } = team` is `const members = team.members`, and assigning an array or
object copies the reference, not the content. Both names point at the same array, so a change
through one is visible through the other. Strings and numbers are values, so changing the variable
does not touch the object. Even the rest object is only a new **outer** object. **Fix:** copy before
you change: `[...members, 'Zeynep']`, or `structuredClone(team)` for a deep copy.

### Pitfall 5: in objects the order does not matter, in arrays it does

```js
const rgb = [255, 128, 0]
const [red, green, blue] = rgb
const [blueWrong, greenWrong, redWrong] = rgb
const { b, g, r } = { r: 255, g: 128, b: 0 }
```

```text
pitfall 5 array: 255 128 0 | 0 128 255
pitfall 5 object: 255 128 0
```

**Why:** an array pattern asks for "item 0, item 1, item 2" and puts them into whatever names stand
there, so `redWrong` got the blue value without any error. An object pattern asks for properties by
name, so the order in which you write them cannot matter.

### Pitfall 6: a rename that looks like a type

```js
const user = { name: 'Mri', age: 21 }
const { name: string, age: number } = user
console.log('pitfall 6:', string, number, typeof name, typeof age)
```

```text
pitfall 6: Mri 21 undefined undefined
```

**Why:** inside a pattern a colon always means "rename" (form 6). This made two variables called
`string` and `number`; `name` and `age` do not exist. It is valid JavaScript **and** valid
TypeScript, so nothing warns you (T1).

### Pitfall 7: a line that starts with `[` and no semicolon before it

```js
let first = 'a'
let second = 'b'
[first, second] = [second, first]
```

```text
pitfall 7: ReferenceError: Cannot access 'second' before initialization
```

**Why:** without a semicolon, the parser joins the lines: `let second = 'b'[first, second] = ...`.
Now `'b'[...]` is an index into the string, and `second` is used inside its own declaration. **Fix:**
start the line with `;` or use semicolons.

## TypeScript topics (T1 to T5)

All from `ts/types.ts`.

### T1: `{ a: string }` in a pattern is a rename, not a type

```ts
const point = { x: 1, y: 2 }
const { x: number } = point                      // compiles! makes a variable called `number`
console.log('T1 confusion:', number, typeof number)

const { x, y }: { x: number; y: number } = point // correct: the type goes AFTER the whole pattern
type Point = { x: number; y: number }
const { x: px, y: py }: Point = point            // rename inside, type after
```

```text
T1: 1
T1 confusion: 1 number
T1 correct: 1 2
T1 rename + type: 1 2
```

JavaScript had already given the colon inside a pattern a meaning (rename) before TypeScript existed,
so TypeScript could not reuse it for types. The rule: **a pattern never contains types.** You write
the pattern, then one colon, then one type that describes the whole value. The confusing line
prints `1 number`: the variable is named `number` and holds `1`, whose `typeof` happens to be
`'number'`. When you then use `x`, the compiler says `error TS2304: Cannot find name 'x'.`

### T2: tuple return types and `as const`

```ts
function parseLoose(text: string) { ...; return [name, Number(age)] }                  // (string | number)[]
function parseTuple(text: string): [string, number] { ...; return [name, Number(age)] } // tuple
function parseConst(text: string) { ...; return [name, Number(age)] as const }          // readonly [string, number]

const plain = ['GET', 200]            // (string | number)[]
const frozen = ['GET', 200] as const  // readonly ['GET', 200]
const [method, code] = frozen         // 'GET', 200
const onlyGet: 'GET' = method
```

```text
T2 loose: Mri 21 string
T2 tuple: MRI 22
T2 as const return: MRI 22
T2 as const literal: GET GET 200
T2 frozen at run time? false
```

TypeScript infers an **array** for `[name, Number(age)]`, because arrays normally grow and shrink.
An array type forgets which position has which type, so after destructuring both variables are
`string | number | undefined` and you cannot call `.toUpperCase()` on the first. A tuple type keeps
the positions. `as const` gives a `readonly` tuple with the narrowest types: `method` is the literal
type `'GET'`, not `string`. With `plain` the same assignment fails with
`error TS2322: Type 'string | number | undefined' is not assignable to type '"GET"'.`
A tuple also knows its length: `const [a, b, c] = frozen` gives
`error TS2493: Tuple type 'readonly ["GET", 200]' of length '2' has no element at index '2'.`
`as const` exists only for the compiler: `Object.isFrozen(frozen)` is `false`.

### T3: `noUncheckedIndexedAccess`

```ts
const items: string[] = ['pen', 'ruler']
const [first] = items                         // string | undefined
if (first !== undefined) first.toUpperCase()  // way 1: check
const [firstOrDefault = 'nothing'] = items    // way 2: default -> string
missing?.toUpperCase() ?? 'NOTHING'           // way 3: ?. and ??
const pair: [string, string] = ['pen', 'ruler']
const [firstOfPair] = pair                    // way 4: tuple -> string
const [, ...restItems] = items                // string[]
```

```text
T3 check: PEN
T3 default: PEN
T3 ?. and ??: NOTHING
T3 tuple: PEN
T3 rest: 1
```

The type `string[]` says nothing about the length, so the array may be empty and `first` may really
be `undefined` at run time. With this option on, TypeScript tells the truth and types it as
`string | undefined`; using it directly gives `error TS18048: 'first' is possibly 'undefined'.`
Four ways out, from the output above: check it, give it a default, use `?.`/`??`, or declare a
tuple when the length is fixed. The rest variable is never `undefined`, only possibly empty.

### T4: defaults and optional fields

```ts
type Config = { host: string; port?: number; timeout?: number; proxy: string | null }
const config: Config = { host: 'localhost', proxy: null }
const { host, port, timeout = 3000, proxy = 'direct' } = config
```

| Variable | Field in the type | Default | Type of the variable |
|---|---|---|---|
| `host` | `string` (required) | none | `string` |
| `port` | `number` optional | none | `number \| undefined` |
| `timeout` | `number` optional | `3000` | `number` |
| `proxy` | `string \| null` | `'direct'` | `string \| null` |
| `portText` | `number` optional | `'none'` | `string \| number` |

```text
T4: localhost undefined 3000 6000 null
T4 port: 160
T4 widened: none
```

`?` on a field adds `undefined` to its type; a default takes `undefined` away again, because the
default runs in exactly that case. It does not take `null` away, since a default never runs for
`null` (pitfall 2), and the output shows `proxy` is still `null`. Using `port` without a default
gives `error TS18048: 'port' is possibly 'undefined'.` A default of another type is allowed and
widens the variable to a union.

### T5: one compile error that destructuring causes

```ts
type User = { name: string; email: string }
const user: User = { name: 'Mri', email: 'mri@example.com' }
// @ts-expect-error TS2339: Property 'mail' does not exist on type 'User'.
const { mail } = user
const { email: mailFixed } = user // the fix
```

```text
T5 wrong name: undefined
T5 fixed: mri@example.com
```

**Message:** `error TS2339: Property 'mail' does not exist on type 'User'.`
In an object pattern the variable name is also the property name, so a wrong name is a read of a
property that does not exist. JavaScript runs it and gives `undefined` (first output line), which is
the silent bug the compiler protects against. **Fix:** use the real name, and rename it with form 6
if you want another variable name. This is the only suppression in the project.

## Props and children

Code: `js/props.jsx` (all experiments) and `ts/props.tsx` (the same with types, and P7). Everything
is rendered with `renderToStaticMarkup`, and the outputs are the real HTML strings.

**The two ideas.** A component is a function with **one** parameter, an object called props.
JSX is a way of writing that object:

- each **attribute** becomes a field: `title="Hi"` becomes `props.title`
- the **content between the tags** becomes one more field with a fixed name: `props.children`

So `children` is not a second argument or a separate channel. It is a prop that has its own syntax
for being *written*. What makes it different is not how it arrives but **what it is for**: other
props are named, separate values that configure the component; `children` is the one open slot for
content that the caller composes.

### P1: props is one object

```jsx
function CardA(props) {
  return <section><h2>{props.title}</h2>{props.children}</section>
}
function CardB({ title, children }) {
  return <section><h2>{title}</h2>{children}</section>
}
function Spy(props) {
  console.log('P1 props object:', props)
  return null
}
show('P1 spy renders:', <Spy title="Hi" count={3}>text</Spy>)
console.log('P1 plain call:', renderToStaticMarkup(CardB({ title: 'Hi', children: 'text' })))
```

```text
P1 A: <section><h2>Hi</h2>text</section>
P1 B: <section><h2>Hi</h2>text</section>
P1 props object: { title: 'Hi', count: 3, children: 'text' }
P1 keys: [ 'title', 'count', 'children' ]
P1 spy renders: 
P1 plain call: <section><h2>Hi</h2>text</section>
```

`CardA` and `CardB` render the same HTML. `CardB` is **form 11** (a pattern in the parameter list)
whose pattern is **form 5** (properties by name). Written as plain assignments, `CardB` is `CardA`:

```js
function CardB(props) {
  const title = props.title
  const children = props.children
  ...
}
```

The `Spy` output shows the one object: the two attributes and `children` sit next to each other as
ordinary keys. The last line calls the component as a normal function with a hand-made object, and
the result is the same, which shows there is nothing else going on.

One difference from form 11 elsewhere: a component does not need `= {}`, because React always passes
an object, even for `<Card />`.

### P2: children is only a prop

```jsx
show('P2 between tags:', <CardB title="Hi">text</CardB>)
show('P2 as attribute:', <CardB title="Hi" children="text" />)
show('P2 both:', <CardB title="Hi" children="from the attribute">from between the tags</CardB>)
```

```text
P2 between tags: <section><h2>Hi</h2>text</section>
P2 as attribute: <section><h2>Hi</h2>text</section>
P2 both: <section><h2>Hi</h2>from between the tags</section>
```

The first two are identical: JSX compiles `<CardB title="Hi">text</CardB>` to
`jsx(CardB, { title: 'Hi', children: 'text' })`, which is exactly what the attribute form writes by
hand. When both are given, **the content between the tags wins**, because it is written into the
props object last. In TypeScript the "both" line does not compile at all:
`error TS2710: 'children' are specified twice. The attribute named 'children' will be overwritten.`
Nobody writes `children="..."` in real code, but knowing that it works is what makes `{...props}`
pass children along (end of P4).

### P3: what children can be

```jsx
function Box({ children }) {
  return <div>{children}</div>
}
```

| Written between the tags | `props.children` is | What appears |
|---|---|---|
| `hello` | a string | `<div>hello</div>` |
| `{42}` | a number | `<div>42</div>` |
| `{0}` | a number | `<div>0</div>` (zero **is** rendered) |
| `<b>bold</b>` | one element object | `<div><b>bold</b></div>` |
| `<b>one</b><i>two</i>` | an **array** of 2 elements | `<div><b>one</b><i>two</i></div>` |
| nothing, `<Box />` | `undefined` | `<div></div>` |
| `{undefined}` | `undefined` | `<div></div>` |
| `{null}` | `null` | `<div></div>` |
| `{false}`, `{true}` | a boolean | `<div></div>` |
| `{''}` | an empty string | `<div></div>` |
| `{['a', 'b', 3]}` | an array | `<div>ab3</div>` |
| `{() => '...'}` | a function | `<div></div>` and a warning |

```text
P3 string: <div>hello</div>
P3 number: <div>42</div>
P3 zero: <div>0</div>
P3 one element: <div><b>bold</b></div>
P3 several elements: <div><b>one</b><i>two</i></div>
P3 nothing: <div></div>
P3 undefined: <div></div>
P3 null: <div></div>
P3 false: <div></div>
P3 true: <div></div>
P3 empty string: <div></div>
P3 array: <div>ab3</div>
P3 function (not called): <div></div>
P3 typeof string: <i>string</i>
P3 typeof number: <i>number</i>
P3 typeof one element: <i>object</i>
P3 typeof several: <i>array(2)</i>
P3 typeof nothing: <i>undefined</i>
P3 typeof null: <i>null</i>
P3 typeof false: <i>boolean</i>
P3 typeof function: <i>function</i>
P3 function (called): <ol><li>T-3</li><li>T-2</li><li>T-1</li></ol>
P3 zero && trap: <div>0</div>
P3 zero fixed: <div></div>
```

What I take from this:

- **`children` has no fixed type.** One child is the child itself; two or more are an array
  (`array(2)`). Code that does `children.map(...)` breaks with one child, and `children.length` on a
  string counts characters. This is why React has `Children.toArray`.
- **`undefined`, `null`, `true` and `false` render nothing.** That is what makes
  `{isAdmin && <AdminPanel />}` work: when the condition is `false`, React draws nothing.
- **`0` is not in that list.** `{count && <b>items</b>}` with `count = 0` puts a `0` on the screen,
  because `0 && x` is `0` and React renders numbers. Write `count > 0 && ...`.
- **A function is not rendered and not called.** React prints the warning
  `Functions are not valid as a React child.` and draws nothing. A function child is useful only if
  the component calls it itself (`Countdown` calls `children(n)`): then `children` is a callback
  that happens to be written between the tags, a "render prop".

### P4: separating children from the other props

```jsx
function Panel({ title, children, ...rest }) {
  console.log('P4 rest object:', rest)
  return <section {...rest}><h2>{title}</h2>{children}</section>
}
show('P4 rest onto DOM:', <Panel title="Stats" id="stats" data-kind="panel" aria-label="Statistics">body</Panel>)
```

```text
P4 rest object: { id: 'stats', 'data-kind': 'panel', 'aria-label': 'Statistics' }
P4 rest onto DOM: <section id="stats" data-kind="panel" aria-label="Statistics"><h2>Stats</h2>body</section>
```

The pattern is **form 8 inside form 11**. It sorts the one object into three groups: what the
component uses itself (`title`), the content (`children`), and everything it does not know about
(`rest`). Then `{...rest}` is a **spread**: it expands those fields back into attributes of the
`<section>`. Rest in the parameter list, spread in the JSX: the same dots, opposite jobs. The
component does not have to list `id`, `aria-label` and every other HTML attribute.

**Order decides which one wins:**

```jsx
<section {...rest} className="panel">   // SpreadFirst: the explicit prop is written last
<section className="panel" {...rest}>   // SpreadLast: the spread is written last
```

```text
P4 spread first: <section class="panel">x</section>
P4 spread last: <section class="mine">x</section>
P4 plain objects: { className: 'panel' } { className: 'mine' }
P4 merged: <section class="panel mine">x</section>
```

Both were called with `className="mine"`. JSX attributes build an object from left to right and a
later key overwrites an earlier one, exactly like the plain object literals in the third line. So:

- **spread first, explicit prop after** = the component has the last word (the caller cannot change `className`)
- **explicit prop first, spread after** = the explicit prop is only a default that the caller can override

Often neither is what you want, and you take the prop out and combine it (`Merged`).

**What goes wrong:**

```text
P4 leaky: <section title="Stats" id="stats">body</section>
P4 children through spread: <section id="lazy">passed through</section>
Hint rest + existing name: <section id="s" data-had-title="no">Stats</section>
```

- `Leaky` did not take `title` out, so it stayed in `rest` and landed on the DOM as an HTML
  `title` attribute (a tooltip). Rest contains **everything you did not name**; props that are
  meant for the component must be taken out before the spread.
- `Lazy` is `<section {...props} />` with no mention of children, and the text still appears.
  `children` was inside the spread, because it is only a prop (P2).
- A name that was taken out is not in `rest` any more (`data-had-title="no"`), so a prop can never
  be both a variable and inside rest.

### P5: props or children?

The same dialog twice:

```jsx
function DialogWithProps({ header, footer, body }) {
  return (
    <div className="dialog">
      <header>{header}</header>
      <main>{body}</main>
      <footer>{footer}</footer>
    </div>
  )
}
function DialogWithChildren({ children }) {
  return <div className="dialog">{children}</div>
}
```

```text
P5 props: <div class="dialog"><header>Delete file?</header><main>This cannot be undone.</main><footer><button>OK</button></footer></div>
P5 children: <div class="dialog"><header>Delete file?</header><main>This cannot be undone.</main><footer><button>OK</button></footer></div>
P5 props, footer forgotten: <div class="dialog"><header>Delete file?</header><main>This cannot be undone.</main><footer></footer></div>
P5 children, wrong order: <div class="dialog"><footer>OK</footer><header>Delete file?</header></div>
```

The first two lines are the same HTML, so the difference is not in the result. It is in **who
controls the structure**:

| | Named props (`header`, `footer`) | `children` only |
|---|---|---|
| Who decides the layout | the component | the caller |
| Number of slots | several, each with a name | one |
| Can the type check it | yes: `header: ReactNode` can be required | only "some content" |
| When a part is missing | the frame stays (empty `<footer>` above) | nothing is there |
| When the order is wrong | impossible, the component places them | the component cannot know (last line) |
| Call site | attributes with JSX inside, harder to read when long | reads like HTML |

**I would choose named props** when the component has a fixed design with several separate places
to fill (a dialog, a page layout with a sidebar, a table row), when a part needs to be required, or
when the component must put its own markup around each part. **I would choose children** when the
component is a wrapper around one piece of free content (`Card`, `Button`, a provider) and has no
reason to care what is inside. Most real components mix both: data and the small named slots as
props, the main content as children, as `Panel` in P4 does with `title` and `children`.

### P6: defaults

```jsx
function Badge({ label = 'new', color = 'gray' }) {
  return <span className={color}>{label}</span>
}
show('P6 missing:', <Badge />)
show('P6 undefined:', <Badge label={undefined} />)
show('P6 null:', <Badge label={null} color={null} />)
```

```text
P6 missing: <span class="gray">new</span>
P6 undefined: <span class="gray">new</span>
P6 null: <span></span>
P6 empty string: <span class="gray"></span>
P6 zero: <span class="gray">0</span>
P6 children default: <p>Hello, stranger</p>
P6 children given: <p>Hello, Mri</p>
P6 children null: <p></p>
P6 null with ??: <span>new</span>
```

This is **form 7 inside form 11**, and it follows pitfall 2 exactly. A missing prop and an explicit
`undefined` get the default. `null` does not: the variable is `null`, and on the screen that is an
**empty badge with no class** (`<span></span>`), because React renders nothing for `null` (P3) and
leaves out an attribute whose value is `null`. So one wrong value from an API makes the badge
disappear without any error. `''` and `0` are also kept. `children` takes a default like any other
prop, with the same `null` behaviour. When `null` should fall back too, use `??` in the body
(last line).

### P7: types

All from `ts/props.tsx`.

```tsx
// (a) by hand
type NoteProps = { tone: 'info' | 'warn'; children?: ReactNode }
function Note({ tone, children }: NoteProps) { ... }

// (b) PropsWithChildren<P> = P & { children?: ReactNode }
function Alert({ tone, children }: PropsWithChildren<{ tone: 'info' | 'warn' }>) { ... }

// (c) children required
function Required({ children }: { children: ReactNode }) { ... }

// (d) everything a real <button> accepts
type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'ghost' }
function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return <button {...rest} className={`btn btn-${variant} ${className}`.trim()}>{children}</button>
}
```

```text
P7a with children: <p class="info">Saved.</p>
P7a without children: <p class="warn"></p>
P7b PropsWithChildren: <p class="warn">Disk is almost full.</p>
P7b without children: <p class="info"></p>
P7c required: <strong>must be here</strong>
P7d ComponentProps: <button type="submit" disabled="" aria-label="Save" class="btn btn-ghost">Save</button>
P7d defaults: <button class="btn btn-primary">OK</button>
P7 ComponentProps<typeof Alert>: <p class="info">typed as props of Alert</p>
```

| Type | What it allows | What the compiler rejects (real messages) |
|---|---|---|
| `children?: ReactNode` | any renderable content, or none: string, number, element, array, `null`, `undefined`, boolean | a function: `<Box>{() => 'x'}</Box>` gives `TS2322: Type '() => string' is not assignable to type 'ReactNode'.` |
| no `children` in the type | no content at all | `<NoKids title="a">text</NoKids>` gives `TS2322 ... Property 'children' does not exist on type 'IntrinsicAttributes & { title: string; }'.` |
| `PropsWithChildren<P>` | the same as adding `children?: ReactNode` to `P` yourself; children stay optional | everything `P` rejects: `<Alert tone="danger">` gives `TS2322: Type '"danger"' is not assignable to type '"info" \| "warn"'.` |
| `children: ReactNode` (no `?`) | content is required | `<Required />` gives `TS2741: Property 'children' is missing in type '{}' but required in type '{ children: ReactNode; }'.` |
| `children: string` | text only, so `.toUpperCase()` is safe | `<Title><b>x</b></Title>` gives `TS2745: This JSX tag's 'children' prop expects type 'string' which requires multiple children, but only a single child was provided.` |
| `children: (n: number) => ReactNode` | a function child, typed parameter (render prop) | plain text as content |
| `ComponentProps<'button'>` | every attribute of a real `<button>`: `type`, `disabled`, `onClick`, `aria-*`, `className`, and `children` | wrong values and invented attributes: `<Button type="link">` gives `TS2322: Type '"link"' is not assignable to type '"button" \| "submit" \| "reset" \| undefined'.` |

Notes:

- The type goes **after the whole pattern** (T1); `children` is listed in it like any other field,
  which is P2 again at the type level.
- `PropsWithChildren` is not magic; it is one intersection type. I would use it for wrappers and
  write `children` by hand when it must be required or must be something narrower than `ReactNode`.
- `ComponentProps<'button'>` is what makes the rest/spread of P4 type-safe: `rest` has the type
  "all button attributes except the ones I took out", so spreading it onto `<button>` is always valid.
  In `Panel` I had to write `Omit<ComponentProps<'section'>, 'title'>` because `<section>` already
  has a `title` attribute of type `string` and I wanted my own.
- `ComponentProps<typeof Alert>` reads the props type back out of a component (last output line).

### Extra experiments from the hints

```jsx
function Row({ key, name }) { return <li>{String(key)}:{name}</li> }
show('Hint key:', <ul><Row key="r1" name="first" /></ul>)

function Mutator(props) {
  try { props.title = 'changed' } catch (error) { console.log('Hint mutate props:', ...) }
  return <b>{props.title}</b>
}
function Shouter({ title }) {
  title = title.toUpperCase()
  return <b>{title}</b>
}
```

```text
Hint key: <ul><li>undefined:first</li></ul>
Hint mutate props: TypeError: Cannot assign to read only property 'title' of object '#<Object>'
Hint mutate renders: <b>original</b>
Hint reassign local: <b>ORIGINAL</b>
```

- **`key` is not a prop.** I passed `key="r1"` and the component got `undefined`. React takes `key`
  for itself (to match list items between renders) and does not put it in the props object, and it
  prints a warning that says so (Logs 6). If the component needs the value, pass it again under
  another name, for example `id`.
- **Props are read-only.** In development React freezes the props object, so `props.title = ...`
  throws a `TypeError` (in an ES module, which is strict mode). A component must treat props as input.
- **Reassigning a destructured variable is fine**: `title = title.toUpperCase()` changes a local
  variable (form 5: the variable is a copy), not the props object. This is one more practical
  difference between `props.title` and `{ title }`. But pitfall 4 still applies: if a prop is an
  array or object, `items.push(...)` changes the parent's data.

## JavaScript vs TypeScript

| # | Form | What stays the same | What you must add in TypeScript | Error when you get it wrong |
|---|---|---|---|---|
| 1 | 1, `const [x, y] = f()` | the pattern | a tuple return type on `f`, `[number, string]`, or `as const` | without it items are a union: `TS2322: Type 'string \| number \| undefined' is not assignable to type '"GET"'.` |
| 2 | 1 on a tuple | the pattern | nothing; the tuple knows its length | too many variables: `TS2493: Tuple type 'readonly ["GET", 200]' of length '2' has no element at index '2'.` |
| 3 | 2, `const [first, ...rest] = items` | the pattern | a check, a default or `?.` before using `first` (`noUncheckedIndexedAccess`) | `TS18048: 'first' is possibly 'undefined'.` |
| 4 | 3, `[a, b] = [b, a]` | the pattern | nothing, but both variables must accept each other's type | `TS2322: Type 'number' is not assignable to type 'string'.` |
| 5 | 4 and 7, defaults | the pattern | nothing; the default removes `undefined` from the type (not `null`) | no default on an optional field: `TS18048: 'port' is possibly 'undefined'.` |
| 6 | 5, `const { a, b } = t` | the pattern | nothing when `t` has a type; names are checked against it | `TS2339: Property 'mail' does not exist on type 'User'.` |
| 7 | 6, `{ a: alpha }` | the pattern, and the meaning of the colon (rename) | the type after the whole pattern: `const { a: alpha }: T = t`, never inside | `{ x: number }` compiles and renames; using `x` after it: `TS2304: Cannot find name 'x'.` |
| 8 | 8, `{ a, ...others }` | the pattern | nothing; `others` gets the type `Omit<T, 'a'>` | reading the removed field from `others` is a `TS2339` |
| 9 | 9, nested | the pattern | `= {}` for an optional parent | `TS2339: Property 'carrier' does not exist on type '{ carrier?: string \| undefined; } \| undefined'.` |
| 10 | 10, `{ [key]: value }` | the pattern | the key typed as `keyof T` (or `K extends keyof T`) | a plain `string` key: `TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ cpu: number; memory: number; }'.` |
| 11 | 11, parameters | the pattern and both defaults | a type after the pattern, before `= {}`: `({ a = 1, b }: Options = {})` | no type: `TS7031: Binding element 'b' implicitly has an 'any' type.` `= {}` with a required field: `TS2741: Property 'q' is missing in type '{}' but required in type '{ q: string; }'.` |
| 12 | 12, loops | the pattern | usually nothing; a cast `name as keyof typeof o` to index the object with the key | the same `TS7053` as row 10, because `Object.entries` keys are `string` |
| 13 | props, `({ title, children })` | the pattern | `children` in the props type: `children?: ReactNode` or `PropsWithChildren` | `TS2322 ... Property 'children' does not exist on type 'IntrinsicAttributes & { title: string; }'.` |

In short: **the pattern never changes.** TypeScript adds one type after the whole pattern, and it
makes you deal with every `undefined` that JavaScript would have passed along silently.

## Bonus 1: LaTeX

The whole field guide is also a LaTeX document: `latex/guide.tex` (the source) and
`latex/guide.pdf` (the PDF). It is the guide itself, not a shorter copy: every entry, the pitfalls,
T1 to T5, props and children, the table, the bonus sections and the log.

**How it is made.** I did not want two copies of the guide that slowly drift apart, so
`latex/md2tex.mjs` (plain Node, no packages) turns this README into `guide.tex`. Headings become
`\section`/`\subsection` with labels, fenced code becomes `listings` blocks with my own
`JavaScript` and `TypeScript` language definitions, Markdown tables become `xltabular` tables with
`booktabs` rules (they break across pages and repeat the header), and links inside the README become
links inside the PDF. The contents page and the PDF bookmarks are generated by `hyperref`.

**Commands I used:**

```
npm run latex            # README.md -> latex/guide.tex
cd latex
xelatex guide.tex        # first run writes the contents
xelatex guide.tex        # second run puts page numbers into the contents
```

`latexmk -xelatex guide.tex` does both runs in one command. Without a local TeX installation:
upload `guide.tex` to Overleaf and choose **Menu > Compiler > XeLaTeX**.

**Why XeLaTeX and not pdfLaTeX:** the guide contains UTF-8 characters (Turkish letters, the emoji in
D1). pdfLaTeX with `listings` cannot read multi-byte characters inside code; XeLaTeX reads UTF-8
natively and loads the OpenType Latin Modern fonts with `fontspec`. Latin Modern has no emoji glyph,
so the generator writes `(thumbs-up)` instead of the emoji. (I first tried LuaLaTeX, see Logs 13.)

**Care taken:** inline code gets break points after punctuation (`.`, `(`, `<`, `=` ...), long code
lines wrap with a small arrow, table column widths follow the amount of text in each column, and the
build log has no overfull boxes (`grep -c Overfull guide.log` prints `0`).

## Bonus 2: Depth

## Bonus 3: Real code

Bonus 3: Real code

Destructuring in code that somebody else wrote, from three sources:

- the **Task Manager starter** from Assignment 3 (`starter/src/`)
- two **libraries in this project's `node_modules`**: React 19.3.1 and TypeScript 5.8.3. These are
  the versions pinned in `package-lock.json`, so the line numbers are the same after `npm install`.
- the open-source project **[shadcn/ui](https://github.com/shadcn-ui/ui)**, commit `45bbf9b`
  (20 November 2026), folder `apps/v4/registry/new-york-v4/ui/`

| # | File and line | Forms | My verdict |
|---|---|---|---|
| 1 | Task Manager `src/App.tsx:37` | 1 | good, the reason hooks return arrays |
| 2 | Task Manager `src/TaskRow.tsx:5` | 11 + 5 | good, **React props case** |
| 3 | Task Manager `src/App.tsx:8` and `:21` | 11 + 5 | fine, the type is written inline |
| 4 | shadcn/ui `button.tsx:40-58` | 11 + 7 + 8, spread | good, a textbook rest/spread component |
| 5 | shadcn/ui `dialog.tsx:50-69`, `card.tsx:4` | 11 + 8 | good, **children taken out or passed through** |
| 6 | React `cjs/react-jsx-runtime.development.js:249-251` | 8, written out | the reason `key` is not a prop |
| 7 | TypeScript `lib/_tsc.js:2768` | 5 | good |
| 8 | shadcn/ui `chart.tsx:118-145` | 11 + 7 | **worse**, and it drops props silently |

### Case 1: `useReducer` in the Task Manager (form 1)

`starter/src/App.tsx`, line 37:

```tsx
const [tasks, dispatch] = useReducer(taskReducer, [])
```

**Form 1.** Without destructuring:

```tsx
const reducerResult = useReducer(taskReducer, [])
const tasks = reducerResult[0]
const dispatch = reducerResult[1]
```

`useReducer` returns a pair, and the caller picks the names. That is why React returns an array here
and not an object: a second reducer in the same component would be
`const [filter, dispatchFilter] = useReducer(...)`, with no clash. With an object it would need two
renames (form 6), `{ state: filter, dispatch: dispatchFilter }`. `@types/react` types the result as a
tuple, so `tasks` is not `Task[] | undefined` even with `noUncheckedIndexedAccess` on (T3).

### Case 2: `TaskRow` props in the Task Manager (forms 11 and 5, React props)

`starter/src/TaskRow.tsx`, lines 3 and 5:

```tsx
type TaskRowProps = { task: Task; onNext: () => void; onDelete: () => void }

export default function TaskRow({ task, onNext, onDelete }: TaskRowProps) {
```

**Form 11 with a form 5 pattern**, and the type after the whole pattern (T1). Without destructuring:

```tsx
export default function TaskRow(props: TaskRowProps) {
  const task = props.task
  const onNext = props.onNext
  const onDelete = props.onDelete
```

**What is a prop and what is children here.** The call site is `src/App.tsx`, lines 25 to 30:

```tsx
<TaskRow
  key={t.id}
  task={t}
  onNext={() => dispatch({ type: 'advance', id: t.id })}
  onDelete={() => dispatch({ type: 'remove', id: t.id })}
/>
```

- **Props:** `task`, `onNext` and `onDelete`, the three attributes that `TaskRowProps` lists.
- **Children:** none. The tag closes itself, so `props.children` is `undefined`, and since
  `TaskRowProps` has no `children` field, `<TaskRow ...>text</TaskRow>` would not even compile (P7,
  the row "no `children` in the type").
- **`key={t.id}` is not a prop.** It is not in `TaskRowProps`, and still there is no error, because
  React's JSX types allow `key` on every component separately
  (`interface IntrinsicAttributes extends React.Attributes {}`, `@types/react/index.d.ts:4259`).
  React keeps the value for itself; case 6 shows the code that does it.

`TaskRow` takes out `task` but not its fields: it uses `task.title` and `task.status`. A nested
pattern, `{ task: { title, status }, onNext, onDelete }` (form 9), would also work. I think one level
is better here: the row stays able to pass the whole task on, and the signature stays short.

### Case 3: inline prop types in the Task Manager (forms 11 and 5)

`starter/src/App.tsx`, lines 8 and 21:

```tsx
function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
```

**Forms 11 and 5.** Without destructuring: `function TaskList(props: { ... })` and then
`props.tasks` and `props.dispatch` in the body. The type is written inline after the pattern, so
every name appears twice on one line. That is fine for one or two props; from three on, I would
name the type, as `TaskRow` does with `TaskRowProps`.

Two lines in `src/taskReducer.ts` look similar but are **spread, not destructuring**: line 18
`[...tasks, { id: action.id, ... }]` and line 21 `{ ...t, status: NEXT[t.status] }`. The dots are on
the right side and build a **new** array and object, which is how the reducer avoids changing the
old state. Line 21 also uses the order rule from P4: `status` comes after `...t`, so it overwrites
`t.status`.

### Case 4: `Button` in shadcn/ui (forms 11, 7, 8 and spread)

`apps/v4/registry/new-york-v4/ui/button.tsx`, lines 40 to 61 (the long class strings above it are
left out):

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

**Form 11 with defaults (form 7) and a rest (form 8)**, then a spread on line 58. This is P4 in a
real library:

- `variant`, `size` and `asChild` are for the component only. Taking them out keeps them out of
  `props`, so they do not land on the DOM as unknown attributes (the "Leaky" case in P4).
- `className` is taken out and **merged** with `cn(...)`, the "Merged" case in P4. Because it is no
  longer inside `props`, the spread at the end cannot overwrite the merged value.
- `{...props}` comes **last**, so for everything else the caller wins: `onClick`, `type`,
  `disabled`, `aria-*`.
- **Children:** `Button` never names `children`. In `<Button>Save</Button>` the text stays inside
  `props` and reaches the element through the spread, exactly like `Lazy` in P4. That works because
  children is only a prop (P2).
- The type is `React.ComponentProps<"button">` plus the component's own options (P7).

Without destructuring, the five names of the pattern become this:

```tsx
function Button(allProps: ButtonProps) {
  const className = allProps.className
  const variant = allProps.variant !== undefined ? allProps.variant : "default"
  const size = allProps.size !== undefined ? allProps.size : "default"
  const asChild = allProps.asChild !== undefined ? allProps.asChild : false
  const props = { ...allProps }
  delete props.className
  delete props.variant
  delete props.size
  delete props.asChild
```

One detail from pitfall 2: the variant types from `VariantProps` also allow `null`, and the
defaults `= "default"` do not apply to `null`.

### Case 5: `DialogContent` and `Card` in shadcn/ui (children taken out or passed through)

`apps/v4/registry/new-york-v4/ui/dialog.tsx`, lines 50 to 57, and where the parts go (lines 61 to 70):

```tsx
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  ...
      <DialogPrimitive.Content data-slot="dialog-content" className={cn("...", className)} {...props}>
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close ...>
```

**Forms 11, 5, 7 and 8.** Here the difference between props and children is visible:

- **Props:** `showCloseButton` is a setting (a boolean with a default), `className` is merged, and
  the rest goes to the inner element.
- **Children:** the content of the dialog. `DialogContent` takes it out **on purpose**, because it
  has to put its own close button **after** the content (line 69 and then line 70). If children
  stayed inside `props`, the component could not decide where it goes.

Compare `card.tsx`, line 4:

```tsx
function Card({ className, ...props }: React.ComponentProps<"div">) {
```

`Card` does not mention `children` at all. It has nothing to add around the content, so the children
travel inside `props` and the spread on line 12 puts them into the `<div>`. Same library, two
choices, and the reason is the one from P5: take children out when the component must control where
they go.

Without destructuring, `DialogContent` would start with `const children = allProps.children`, a
`showCloseButton` line with the `!== undefined` test, and a copy of `allProps` with three `delete`s.

### Case 6: how React removes `key` (form 8, written out)

`node_modules/react/cjs/react-jsx-runtime.development.js`, lines 249 to 251 (inside the function
that builds an element):

```js
if ("key" in config) {
  maybeKey = {};
  for (var propName in config)
    "key" !== propName && (maybeKey[propName] = config[propName]);
} else maybeKey = config;
```

This is **form 8 without destructuring**. `config` is the object of all the attributes written in
JSX. When it contains `key`, React builds a new object with every property except `key`, and that new
object becomes the props (the variable name `maybeKey` is reused for it). With destructuring the
same lines would be:

```js
const { key, ...props } = config
```

That is the whole reason behind the warning in Logs 6: the component never sees `key`, because
React takes it out before it calls the component. I also searched React's shipped CommonJS files
for destructuring patterns (`const {`, `var [`) and found none; the build writes these things out
by hand, like the loop above.

### Case 7: the TypeScript compiler (form 5)

`node_modules/typescript/lib/_tsc.js`, line 2768:

```js
function writeStackEvent(index, endTime, results) {
  const { phase, name, args, time, separateBeginAndEnd } = eventStack[index];
```

**Form 5** on an array item. Without destructuring:

```js
const event = eventStack[index];
const phase = event.phase;
const name = event.name;
const args = event.args;
const time = event.time;
const separateBeginAndEnd = event.separateBeginAndEnd;
```

All five values are used in the function, so one line replaces six. This file is compiled
JavaScript. In TypeScript with this project's `tsconfig.json`, the same line would be a compile
error, because `eventStack[index]` may be `undefined` (T3).

### Case 8: where destructuring makes the code worse (`chart.tsx`)

`apps/v4/registry/new-york-v4/ui/chart.tsx`, lines 118 to 145:

```tsx
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<
      TooltipValueType,
      TooltipNameType
    >,
    "accessibilityLayer"
  >) {
```

**Form 11 with defaults (form 7).** I think this one is worse than it needs to be, for three reasons:

1. **The signature is 28 lines long** before the body starts. Thirteen names, three of them with
   defaults, mixed in one list. To find out what `color` or `formatter` is, you have to read an
   intersection of four types.
2. **It drops props without telling anybody.** The type includes `React.ComponentProps<"div">`, so
   the compiler accepts `id`, `style`, `onClick` and every other `<div>` attribute. But the pattern
   has no rest (`...props`), and I found no spread in the body, so all of them are thrown away. The
   type promises more than the component does. This is the opposite risk of `Button`: there, the rest
   carries everything on; here, anything not named in the pattern disappears.
3. **Every name is written twice**, once in the pattern and once in the type, but in different
   places and in a different order.

A refactoring: name the type, and take the values out in the body, grouped by what they are for:

```tsx
type ChartTooltipContentProps = Omit<
  RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>,
  "accessibilityLayer"
> & {
  active?: boolean
  color?: string
  className?: string
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  nameKey?: string
  labelKey?: string
}

function ChartTooltipContent(props: ChartTooltipContentProps) {
  const { active, payload, label, labelFormatter, formatter, color } = props // from Recharts
  const { indicator = "dot", hideLabel = false, hideIndicator = false } = props // display options
  const { className, labelClassName, nameKey, labelKey } = props // styling and keys
```

This is a sketch: I did not compile it against Recharts, and I added `active` and `color` by hand
because I could not check which of the four original types they come from. The point is the
shape. The type now lists only what the component really uses, so passing `id` is a compile error instead
of being silently ignored. If the `<div>` attributes are wanted, the other fix is to keep the type
and add `...rest` to the pattern and `{...rest}` to the outer `<div>`.


Code: `js/depth.mjs` (D1, D2, D3, D5) and `ts/depth.ts` (D4). Both are part of `npm run all`.

### D1: what does an array pattern really call?

I wrote an iterable that logs every call, and destructured it.

```js
const [s1, s2] = spy(['a', 'b', 'c', 'd'])
const [r1, ...rMore] = spy(['a', 'b'])
```

```text
D1 two variables from four values:
D1   [Symbol.iterator]() called
D1   next() -> {"value":"a","done":false}
D1   next() -> {"value":"b","done":false}
D1   return() called: the pattern stopped early
D1 result: a b
D1 with rest (runs to the end, no return()):
D1   [Symbol.iterator]() called
D1   next() -> {"value":"a","done":false}
D1   next() -> {"value":"b","done":false}
D1   next() -> {"done":true}
D1 result: a [ 'b' ]
```

An array pattern does **not** use indexes. It calls `value[Symbol.iterator]()` once and then
`next()` once per variable; it never looks at `length`. With two variables it asked for exactly two
values and never touched `'c'` and `'d'`. What surprised me is the `return()` call: when the pattern
stops before the iterator is finished, it tells the iterator to clean up (the specification calls
this IteratorClose). With a rest element the iterator runs to `done: true`, so there is no `return()`.

Consequences, all from real output:

```text
D1 string: M r [ 'i', '!' ]
D1 emoji: 👍 o | by index: false
D1 Set: x y
D1 Map: TR Ankara
D1 infinite generator: 1 2 3
D1 array-like: TypeError: {(intermediate value)(intermediate value)} is not iterable
D1 object pattern on a string: 5 I r
D1 object pattern on an array: b 3
D1 object pattern on a number: function undefined
```

- Anything iterable works: strings, `Set`, `Map`, generators. An **infinite** generator is safe,
  because the pattern only asks three times (a rest element there would never finish).
- A string is iterated by code point, so `'👍ok'` gives the whole emoji, while `'👍ok'[0]` is half of it.
- An "array-like" object with `0` and `length` is **not** enough: no `Symbol.iterator`, so `TypeError`.
  This is also why `const [k, v] of stock` fails for a plain object (form 12).
- An **object** pattern needs only property access, so it works on arrays (`{ 1: middle }`), strings
  (`{ length }`) and even numbers (wrapped in a `Number` object). That is why pitfall 1 has two
  different messages: `Cannot destructure property` for objects, `is not iterable` for arrays.

### D2: the order of evaluation

```js
const { a = expensive('a'), b = expensive('b') } = { a: 'given' }
const { width = 10, height = width * 2, area = width * height } = { width: 3 }
const { first = second, second = 1 } = {}
const { [key('p')]: p = dflt('p'), [key('q')]: q = dflt('q') } = source // getters that log
function addTag(tag, { tags = [] } = {}) { tags.push(tag); return tags }
;[i, j] = [j, i + j]
```

```text
D2   default for b computed
D2 lazy: given B calls = 1
D2 earlier variable: 3 6 18
D2 later variable: ReferenceError: Cannot access 'second' before initialization
D2 order: key p > read p > default p > key q > read q | values 0 1
D2 fresh default per call: [ 'x' ] [ 'y' ]
D2 right side first: 2 3
```

- **Defaults are lazy.** `expensive('a')` never ran because `a` was given. A default is an
  expression that is evaluated only when the value is `undefined`, so a function call with a side
  effect there happens sometimes and not other times; I would keep side effects out of defaults.
- **A default can use an earlier variable** of the same pattern (`height = width * 2`), because the
  pattern is processed left to right and each variable is initialised before the next one starts.
- **It cannot use a later one**: `second` is declared but not yet initialised (temporal dead zone),
  which gives a `ReferenceError`, not `undefined`.
- **The exact order** per property is: compute the key, read the property, then (only if needed)
  compute the default; then the next property. The log line shows it, and shows no `default q`.
- **In a parameter list the default is evaluated on every call**, so `tags = []` is a new array each
  time. (In Python a default list is created once and shared; here it is not.)
- **The right side is finished first**: `[i, j] = [j, i + j]` used the old `i` and `j` for both
  items, which is why the swap of form 3 needs no temporary variable.

### D3: destructuring in other places

```js
try { JSON.parse('{ not json') } catch ({ name, message }) { ... }

;[robot.x, robot.y, grid[2]] = [5, 7, 9]
;({ speed: robot.speed = 1, name: robot['label'] } = { name: 'AutoTrack' })

for (const [letter, number] of pairs) ...
for (const index in pairs) ...
for (const [c0, c1] in { ab: 1, xy: 2 }) ...

const { readFileSync, existsSync: exists } = await import('node:fs')
```

```text
D3 catch: SyntaxError - Expected property name or '}' in JSON at position 2 (line 1 column 3)
D3 assignment targets: { x: 5, y: 7, speed: 1, label: 'AutoTrack' } [ 0, 0, 9 ]
D3 for...of: a 1
D3 for...of: b 2
D3 for...in: 0 string
D3 for...in: 1 string
D3 for...in with a pattern: a b
D3 for...in with a pattern: x y
D3 dynamic import: function true
```

- **`catch ({ name, message })`**: the catch parameter is a binding like any other, so it takes a
  pattern. It is short, but you lose the error object itself (no `stack`, cannot rethrow it), and if
  somebody throws `null` the pattern throws a new error inside the catch.
- **Assignment targets**: in the assignment form (no `const`), each target can be anything you can
  assign to: `robot.x`, `grid[2]`, `robot['label']`. Here the rename syntax `name: robot['label']`
  finally reads naturally: "take `name`, put it in `robot.label`".
- **`for...in` against `for...of`**: `for...of` gives the values, so a pattern takes them apart.
  `for...in` gives the keys as strings. A pattern in `for...in` is legal but destructures the **key
  string** character by character (`ab` gives `a b`), which is never what you want.
- **`import { a as b }` is not destructuring**, although it looks like it: the rename word is `as`
  (not `:`), there are no defaults and no nesting, and the imported name is a live binding to the
  module's variable, not a copy. `export const { a, b } = obj` on the other hand is real
  destructuring inside a declaration, and so is taking names from `await import(...)`, where the
  module arrives as an ordinary object (last output line).

### D4: destructuring at the type level

```ts
type First<T extends readonly unknown[]> = T extends readonly [infer Head, ...unknown[]] ? Head : never
type Rest<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Tail] ? Tail : []
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer End] ? End : never
type Unwrap<T> = T extends { data: infer D } ? D : never

type Row = [id: number, name: string, active: boolean]
const [head, ...tail] = row // head: First<Row>, tail: Rest<Row>

type Args = Parameters<typeof createTask>
type TaskOptions = First<Args>
const [{ title }, urgent = false] = args
```

```text
D4 First/Rest/Last checks: [ true, true, true, true ]
D4 value twin: 1 [ 'Deniz', true ]
D4 Unwrap: 1 1
D4 Parameters: Write the guide true { title: 'Write the guide', status: 'todo', urgent: true }
D4 omit: { id: 1, name: 'Deniz' } [ 'id', 'name' ]
```

`infer` is destructuring for types. `T extends [infer Head, ...unknown[]]` is a pattern with the
shape of the type, and `infer Head` is the "variable" that receives the part at that position:
form 1 for `First`, form 2 for `Rest`, form 5 for `Unwrap`. The difference from values is that a
type pattern can **fail to match**, so it needs the `? ... : never` branch (`First<[]>` is `never`).
The `checks` array is a compile-time test: the `Equal` type only yields `true` when two types are
identical, so the file would not compile if `First<Row>` were not `number`. `Last` has no value
twin: a value pattern cannot put rest first (`[...init, last]` is a syntax error), but a type can.
`Parameters<F>` is the built-in `infer` for a function's parameter list, and it is how
`ComponentProps<typeof Alert>` in P7 works: it infers the type of the first parameter of the component.

### D5: when destructuring makes code worse

```js
// Worse
const { data: { user: { profile: { contact: { emails: [{ address: addr, primary: isMain }] } } } }, meta: { page: { total: t } } } = response

// Better
const contact = response.data.user.profile.contact
const [primaryEmail] = contact.emails
const totalPages = response.meta?.page?.total ?? 0
```

```text
D5 deep pattern: mri@example.com true 12
D5 refactored: mri@example.com true 12
D5 deep pattern on a missing level: Cannot read properties of undefined (reading 'theme')
D5 optional chaining instead: default
```

Both versions give the same values. The deep pattern is worse for three reasons. First, you have to
read it from the inside out to find which names are variables (`addr`, `isMain`, `t`) and which are
only paths (the other eight names). Second, the renames are short because the line is already too
long, so the names got worse. Third, it is fragile: one missing level throws, and a pattern has no
`?.`; the only tool is `= {}` at every level, which makes it longer still. The refactoring uses a
pattern only where it helps (`[primaryEmail]`), gives the intermediate object a name, and uses
optional chaining for the part that may be missing. My rule after this: one level is good, two is
acceptable, and more than one rename in a pattern is a sign to use plain assignments.

On performance: an object pattern is the same property reads as the plain assignments. An array
pattern goes through the iterator protocol (D1), which is more work than `list[0]` and `list[1]`;
engines optimise the common case of a real array, so I would only think about it in a very hot loop,
and I did not measure a difference worth reporting.



Bonus 3: Real code

Destructuring in code that somebody else wrote, from three sources:

- the **Task Manager starter** from Assignment 3 (`starter/src/`)
- two **libraries in this project's `node_modules`**: React 19.3.1 and TypeScript 5.8.3. These are
  the versions pinned in `package-lock.json`, so the line numbers are the same after `npm install`.
- the open-source project **[shadcn/ui](https://github.com/shadcn-ui/ui)**, commit `45bbf9b`
  (20 November 2026), folder `apps/v4/registry/new-york-v4/ui/`

| # | File and line | Forms | My verdict |
|---|---|---|---|
| 1 | Task Manager `src/App.tsx:37` | 1 | good, the reason hooks return arrays |
| 2 | Task Manager `src/TaskRow.tsx:5` | 11 + 5 | good, **React props case** |
| 3 | Task Manager `src/App.tsx:8` and `:21` | 11 + 5 | fine, the type is written inline |
| 4 | shadcn/ui `button.tsx:40-58` | 11 + 7 + 8, spread | good, a textbook rest/spread component |
| 5 | shadcn/ui `dialog.tsx:50-69`, `card.tsx:4` | 11 + 8 | good, **children taken out or passed through** |
| 6 | React `cjs/react-jsx-runtime.development.js:249-251` | 8, written out | the reason `key` is not a prop |
| 7 | TypeScript `lib/_tsc.js:2768` | 5 | good |
| 8 | shadcn/ui `chart.tsx:118-145` | 11 + 7 | **worse**, and it drops props silently |

### Case 1: `useReducer` in the Task Manager (form 1)

`starter/src/App.tsx`, line 37:

```tsx
const [tasks, dispatch] = useReducer(taskReducer, [])
```

**Form 1.** Without destructuring:

```tsx
const reducerResult = useReducer(taskReducer, [])
const tasks = reducerResult[0]
const dispatch = reducerResult[1]
```

`useReducer` returns a pair, and the caller picks the names. That is why React returns an array here
and not an object: a second reducer in the same component would be
`const [filter, dispatchFilter] = useReducer(...)`, with no clash. With an object it would need two
renames (form 6), `{ state: filter, dispatch: dispatchFilter }`. `@types/react` types the result as a
tuple, so `tasks` is not `Task[] | undefined` even with `noUncheckedIndexedAccess` on (T3).

### Case 2: `TaskRow` props in the Task Manager (forms 11 and 5, React props)

`starter/src/TaskRow.tsx`, lines 3 and 5:

```tsx
type TaskRowProps = { task: Task; onNext: () => void; onDelete: () => void }

export default function TaskRow({ task, onNext, onDelete }: TaskRowProps) {
```

**Form 11 with a form 5 pattern**, and the type after the whole pattern (T1). Without destructuring:

```tsx
export default function TaskRow(props: TaskRowProps) {
  const task = props.task
  const onNext = props.onNext
  const onDelete = props.onDelete
```

**What is a prop and what is children here.** The call site is `src/App.tsx`, lines 25 to 30:

```tsx
<TaskRow
  key={t.id}
  task={t}
  onNext={() => dispatch({ type: 'advance', id: t.id })}
  onDelete={() => dispatch({ type: 'remove', id: t.id })}
/>
```

- **Props:** `task`, `onNext` and `onDelete`, the three attributes that `TaskRowProps` lists.
- **Children:** none. The tag closes itself, so `props.children` is `undefined`, and since
  `TaskRowProps` has no `children` field, `<TaskRow ...>text</TaskRow>` would not even compile (P7,
  the row "no `children` in the type").
- **`key={t.id}` is not a prop.** It is not in `TaskRowProps`, and still there is no error, because
  React's JSX types allow `key` on every component separately
  (`interface IntrinsicAttributes extends React.Attributes {}`, `@types/react/index.d.ts:4259`).
  React keeps the value for itself; case 6 shows the code that does it.

`TaskRow` takes out `task` but not its fields: it uses `task.title` and `task.status`. A nested
pattern, `{ task: { title, status }, onNext, onDelete }` (form 9), would also work. I think one level
is better here: the row stays able to pass the whole task on, and the signature stays short.

### Case 3: inline prop types in the Task Manager (forms 11 and 5)

`starter/src/App.tsx`, lines 8 and 21:

```tsx
function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
```

**Forms 11 and 5.** Without destructuring: `function TaskList(props: { ... })` and then
`props.tasks` and `props.dispatch` in the body. The type is written inline after the pattern, so
every name appears twice on one line. That is fine for one or two props; from three on, I would
name the type, as `TaskRow` does with `TaskRowProps`.

Two lines in `src/taskReducer.ts` look similar but are **spread, not destructuring**: line 18
`[...tasks, { id: action.id, ... }]` and line 21 `{ ...t, status: NEXT[t.status] }`. The dots are on
the right side and build a **new** array and object, which is how the reducer avoids changing the
old state. Line 21 also uses the order rule from P4: `status` comes after `...t`, so it overwrites
`t.status`.

### Case 4: `Button` in shadcn/ui (forms 11, 7, 8 and spread)

`apps/v4/registry/new-york-v4/ui/button.tsx`, lines 40 to 61 (the long class strings above it are
left out):

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

**Form 11 with defaults (form 7) and a rest (form 8)**, then a spread on line 58. This is P4 in a
real library:

- `variant`, `size` and `asChild` are for the component only. Taking them out keeps them out of
  `props`, so they do not land on the DOM as unknown attributes (the "Leaky" case in P4).
- `className` is taken out and **merged** with `cn(...)`, the "Merged" case in P4. Because it is no
  longer inside `props`, the spread at the end cannot overwrite the merged value.
- `{...props}` comes **last**, so for everything else the caller wins: `onClick`, `type`,
  `disabled`, `aria-*`.
- **Children:** `Button` never names `children`. In `<Button>Save</Button>` the text stays inside
  `props` and reaches the element through the spread, exactly like `Lazy` in P4. That works because
  children is only a prop (P2).
- The type is `React.ComponentProps<"button">` plus the component's own options (P7).

Without destructuring, the five names of the pattern become this:

```tsx
function Button(allProps: ButtonProps) {
  const className = allProps.className
  const variant = allProps.variant !== undefined ? allProps.variant : "default"
  const size = allProps.size !== undefined ? allProps.size : "default"
  const asChild = allProps.asChild !== undefined ? allProps.asChild : false
  const props = { ...allProps }
  delete props.className
  delete props.variant
  delete props.size
  delete props.asChild
```

One detail from pitfall 2: the variant types from `VariantProps` also allow `null`, and the
defaults `= "default"` do not apply to `null`.

### Case 5: `DialogContent` and `Card` in shadcn/ui (children taken out or passed through)

`apps/v4/registry/new-york-v4/ui/dialog.tsx`, lines 50 to 57, and where the parts go (lines 61 to 70):

```tsx
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  ...
      <DialogPrimitive.Content data-slot="dialog-content" className={cn("...", className)} {...props}>
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close ...>
```

**Forms 11, 5, 7 and 8.** Here the difference between props and children is visible:

- **Props:** `showCloseButton` is a setting (a boolean with a default), `className` is merged, and
  the rest goes to the inner element.
- **Children:** the content of the dialog. `DialogContent` takes it out **on purpose**, because it
  has to put its own close button **after** the content (line 69 and then line 70). If children
  stayed inside `props`, the component could not decide where it goes.

Compare `card.tsx`, line 4:

```tsx
function Card({ className, ...props }: React.ComponentProps<"div">) {
```

`Card` does not mention `children` at all. It has nothing to add around the content, so the children
travel inside `props` and the spread on line 12 puts them into the `<div>`. Same library, two
choices, and the reason is the one from P5: take children out when the component must control where
they go.

Without destructuring, `DialogContent` would start with `const children = allProps.children`, a
`showCloseButton` line with the `!== undefined` test, and a copy of `allProps` with three `delete`s.

### Case 6: how React removes `key` (form 8, written out)

`node_modules/react/cjs/react-jsx-runtime.development.js`, lines 249 to 251 (inside the function
that builds an element):

```js
if ("key" in config) {
  maybeKey = {};
  for (var propName in config)
    "key" !== propName && (maybeKey[propName] = config[propName]);
} else maybeKey = config;
```

This is **form 8 without destructuring**. `config` is the object of all the attributes written in
JSX. When it contains `key`, React builds a new object with every property except `key`, and that new
object becomes the props (the variable name `maybeKey` is reused for it). With destructuring the
same lines would be:

```js
const { key, ...props } = config
```

That is the whole reason behind the warning in Logs 6: the component never sees `key`, because
React takes it out before it calls the component. I also searched React's shipped CommonJS files
for destructuring patterns (`const {`, `var [`) and found none; the build writes these things out
by hand, like the loop above.

### Case 7: the TypeScript compiler (form 5)

`node_modules/typescript/lib/_tsc.js`, line 2768:

```js
function writeStackEvent(index, endTime, results) {
  const { phase, name, args, time, separateBeginAndEnd } = eventStack[index];
```

**Form 5** on an array item. Without destructuring:

```js
const event = eventStack[index];
const phase = event.phase;
const name = event.name;
const args = event.args;
const time = event.time;
const separateBeginAndEnd = event.separateBeginAndEnd;
```

All five values are used in the function, so one line replaces six. This file is compiled
JavaScript. In TypeScript with this project's `tsconfig.json`, the same line would be a compile
error, because `eventStack[index]` may be `undefined` (T3).

### Case 8: where destructuring makes the code worse (`chart.tsx`)

`apps/v4/registry/new-york-v4/ui/chart.tsx`, lines 118 to 145:

```tsx
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<
      TooltipValueType,
      TooltipNameType
    >,
    "accessibilityLayer"
  >) {
```

**Form 11 with defaults (form 7).** I think this one is worse than it needs to be, for three reasons:

1. **The signature is 28 lines long** before the body starts. Thirteen names, three of them with
   defaults, mixed in one list. To find out what `color` or `formatter` is, you have to read an
   intersection of four types.
2. **It drops props without telling anybody.** The type includes `React.ComponentProps<"div">`, so
   the compiler accepts `id`, `style`, `onClick` and every other `<div>` attribute. But the pattern
   has no rest (`...props`), and I found no spread in the body, so all of them are thrown away. The
   type promises more than the component does. This is the opposite risk of `Button`: there, the rest
   carries everything on; here, anything not named in the pattern disappears.
3. **Every name is written twice**, once in the pattern and once in the type, but in different
   places and in a different order.

A refactoring: name the type, and take the values out in the body, grouped by what they are for:

```tsx
type ChartTooltipContentProps = Omit<
  RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>,
  "accessibilityLayer"
> & {
  active?: boolean
  color?: string
  className?: string
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  nameKey?: string
  labelKey?: string
}

function ChartTooltipContent(props: ChartTooltipContentProps) {
  const { active, payload, label, labelFormatter, formatter, color } = props // from Recharts
  const { indicator = "dot", hideLabel = false, hideIndicator = false } = props // display options
  const { className, labelClassName, nameKey, labelKey } = props // styling and keys
```

This is a sketch: I did not compile it against Recharts, and I added `active` and `color` by hand
because I could not check which of the four original types they come from. The point is the
shape. The type now lists only what the component really uses, so passing `id` is a compile error instead
of being silently ignored. If the `<div>` attributes are wanted, the other fix is to keep the type
and add `...rest` to the pattern and `{...rest}` to the outer `<div>`.


Bonus 3: Real code

Destructuring in code that somebody else wrote, from three sources:

- the **Task Manager starter** from Assignment 3 (`starter/src/`)
- two **libraries in this project's `node_modules`**: React 19.3.1 and TypeScript 5.8.3. These are
  the versions pinned in `package-lock.json`, so the line numbers are the same after `npm install`.
- the open-source project **[shadcn/ui](https://github.com/shadcn-ui/ui)**, commit `45bbf9b`
  (20 November 2026), folder `apps/v4/registry/new-york-v4/ui/`

| # | File and line | Forms | My verdict |
|---|---|---|---|
| 1 | Task Manager `src/App.tsx:37` | 1 | good, the reason hooks return arrays |
| 2 | Task Manager `src/TaskRow.tsx:5` | 11 + 5 | good, **React props case** |
| 3 | Task Manager `src/App.tsx:8` and `:21` | 11 + 5 | fine, the type is written inline |
| 4 | shadcn/ui `button.tsx:40-58` | 11 + 7 + 8, spread | good, a textbook rest/spread component |
| 5 | shadcn/ui `dialog.tsx:50-69`, `card.tsx:4` | 11 + 8 | good, **children taken out or passed through** |
| 6 | React `cjs/react-jsx-runtime.development.js:249-251` | 8, written out | the reason `key` is not a prop |
| 7 | TypeScript `lib/_tsc.js:2768` | 5 | good |
| 8 | shadcn/ui `chart.tsx:118-145` | 11 + 7 | **worse**, and it drops props silently |

## Logs

Things that went wrong, wrong guesses and surprises while making this project.

1. **Wrong guess about form 2.** In `js/arrays.mjs` I first wrote the expected output as a comment:
   `// form 2: Mortimer, [Bella Cassandra Alexander]`. The real output is
   `form 2: Mortimer [ 'Cassandra', 'Alexander' ]`. I thought `...others` meant "everything
   except `second`". It means "everything **after** the positions already used", so the skipped
   `Bella` is thrown away, not collected. I corrected the comment.

2. **The missing semicolon before a swap.** Writing the swap of form 3 without the leading `;` gives
   `ReferenceError: Cannot access 'second' before initialization` (reproduced in pitfall 7). The
   message says nothing about semicolons, which makes it hard to find. I learned that a line
   starting with `[` or `(` continues the line before it.

3. **`{ width, height } = box` does not parse.** `SyntaxError: Unexpected token '='`. Because it is a
   syntax error, the whole file refused to run and `try/catch` around it did not help; a `try` can
   only catch errors that happen while the code runs. To show it in `pitfalls.mjs` I had to build the
   statement from a string with `new Function(...)`.

4. **The rename that looks like a type compiles.** I expected `const { x: number } = point` to be a
   compile error in TypeScript. It is not; `npm run check` passed, and the error only came on the
   next line where I used `x`: `error TS2304: Cannot find name 'x'.` The mistake and the message are
   in two different places, which is why this one confuses people (T1).

5. **`children` twice: fine in JS, an error in TS.** `<Card title="Hi" children="a">b</Card>` runs
   in `js/props.jsx` and the content between the tags wins. The same line in `ts/props.tsx` stopped
   the type check: `error TS2710: 'children' are specified twice. The attribute named 'children'
   will be overwritten.` So I kept that experiment only in the `.jsx` file.

6. **`key` is not a prop.** I destructured `key` in a component and got `undefined`, with this on
   stderr: ``Row: `key` is not a prop. Trying to access it will result in `undefined` being
   returned. If you need to access the same value within the child component, you should pass it as
   a different prop. (https://react.dev/link/special-props)``

7. **A function as children renders nothing, and the warning is not in `output.txt`.** React printed
   `Functions are not valid as a React child. This may happen if you return children instead of
   <children /> from render. Or maybe you meant to call this function rather than return it.`
   I looked for it in `output.txt` and it was missing: `npm run all > output.txt` redirects only
   stdout, and React warnings go to stderr through `console.error`. That is why items 6 and 7 are
   quoted here and not in the output file.

8. **Props are frozen.** A component that did `props.title = 'changed'` threw
   `TypeError: Cannot assign to read only property 'title' of object '#<Object>'`. I expected the
   assignment to work silently. React freezes the props object in development, and an ES module is
   in strict mode, where writing to a frozen object throws instead of being ignored.

9. **`null` makes the badge disappear.** I expected `<Badge label={null} color={null} />` to show
   the defaults. Real output: `<span></span>`, no text and no class. The default is not used for
   `null`, and React then renders nothing for `null`. No error anywhere (P6, pitfall 2).

10. **`Object.entries` keys cannot index the object in TypeScript.** In `ts/params.ts`,
    `limits[name]` inside the loop failed with `error TS7053: Element implicitly has an 'any' type
    because expression of type 'string' can't be used to index type '{ cpu: number; memory: number; }'.`
    `Object.entries` types its keys as `string`, because an object may have more keys at run time
    than its type lists. I used `name as keyof typeof limits`.

11. **An experiment that proved nothing.** For D3 I tried to show that `import { a: b } from "x"`
    is a syntax error by putting it into `new Function(...)` and catching the `SyntaxError`. It did
    print `SyntaxError`, but then I realised an `import` statement is never allowed inside a function
    body, so the correct `import { a as b }` would have thrown the same error. The test could not
    fail, so I removed it and kept only the explanation.

12. **The array pattern calls `return()`.** In D1 I expected only `next()` calls. The log showed a
    `return()` call after the second `next()`: the pattern closes an iterator that it did not finish.

13. **LuaLaTeX could not load any font.** My first compile of the LaTeX guide stopped at the very
    first font: `! Font \TU/lmr/m/n/10.95=[lmroman10-regular]:+tlig; at 10.95pt not loadable:
    metric data not found or bad.` followed by `Package fontspec Error: The font "LatinModernRoman"
    cannot be found.` LuaLaTeX finds fonts through its own font cache, and that cache was not
    working on the machine. XeLaTeX finds the same fonts through the system and compiled the file
    at once, so I switched. The first successful build then had 15 `Overfull \hbox` warnings, all
    from long inline code (`noUncheckedIndexedAccess` in a narrow table column); ragged-right text and
    break points before capital letters inside code brought them to 0.