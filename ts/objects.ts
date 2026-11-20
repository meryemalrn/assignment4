// Meryem Betül Abdulrahman, 2300009906
// The same six object forms as js/objects.mjs, now typed.

type Task = { id: string; title: string; status: 'todo' | 'in-progress' | 'done' }

// Form 5 (worked example)
const task: Task = { id: 't1', title: 'Buy milk', status: 'todo' }
const { title, status } = task
console.log('form 5:', title, status) // form 5: Buy milk todo

// Form 5 with `let`: the variable takes the type of the field, so `ramGb` only accepts numbers.
type Laptop = { brand: string; ramGb: number; gpu?: string }
const laptop: Laptop = { brand: 'Lenovo', ramGb: 16 }
let { brand, ramGb, gpu } = laptop // string, number, string | undefined
ramGb = 32
console.log('form 5 let:', brand, ramGb, gpu, laptop.ramGb) // form 5 let: Lenovo 32 undefined 16

// Form 6: rename. The part after the colon is the NEW VARIABLE NAME, never a type.
type Course = { code: string; name: string }
const course: Course = { code: 'SEN0416', name: 'Game Programming' }
const { code: courseCode, name: courseName } = course
console.log('form 6:', courseCode, courseName) // form 6: SEN0416 Game Programming

// Form 6: when you really want to write the type, it goes after the WHOLE pattern.
const { code: sameCode }: { code: string } = course
console.log('form 6 typed:', sameCode) // form 6 typed: SEN0416

// Form 7: defaults. Optional field + default = the variable is never undefined.
type Ticket = { subject: string; priority?: 'low' | 'normal' | 'high'; assignee: string | null; labels?: string[] }
const ticket: Ticket = { subject: 'Login fails', assignee: null }
const { subject, priority = 'normal', assignee = 'nobody', labels = [] } = ticket
// priority: 'low' | 'normal' | 'high'   assignee: string | null (null stays!)   labels: string[]
console.log('form 7:', subject, priority, assignee, labels) // form 7: Login fails normal null []

// Form 8: rest. TypeScript works out the type of the rest: it is Student without `id`.
type Student = { id: number; name: string; city: string; year: number }
const student: Student = { id: 42, name: 'Deniz', city: 'Izmir', year: 3 }
const { id, ...others } = student // others: { name: string; city: string; year: number }
const withoutId: Omit<Student, 'id'> = others // proves the type: this line compiles
console.log('form 8:', id, withoutId) // form 8: 42 { name: 'Deniz', city: 'Izmir', year: 3 }

// Form 9: nested patterns. One type for the whole shape, written after the pattern.
type Order = {
  customer: { fullName: string; address: { city: string } }
  items: string[]
  shipping?: { carrier?: string }
}
const order: Order = {
  customer: { fullName: 'Jensen Huang', address: { city: 'California' } },
  items: ['keyboard', 'mouse', 'monitor'],
}
const { customer: { fullName, address: { city } }, items: [firstItem, ...otherItems] } = order
console.log('form 9:', fullName, city, firstItem ?? '(none)', otherItems)

// Form 9:
const { shipping: { carrier = 'none' } = {} } = order
console.log('form 9 safe:', carrier) 

// Form 10: computed key. The key must be known to be a key of the object: `keyof`.
type Scores = { math: number; physics: number; 'web-programming': number }
const scores: Scores = { math: 85, physics: 72, 'web-programming': 95 }
const wanted: keyof Scores = 'physics'
const { [wanted]: wantedScore } = scores 
console.log('form 10:', wantedScore) // form 10: 72

function pick<T, K extends keyof T>(source: T, key: K): T[K] {
  const { [key]: picked } = source
  return picked
}
console.log('form 10 generic:', pick(scores, 'web-programming'), pick(course, 'name').length) // 95 16

// Form 10 with a Record: any string is allowed as key, so the value may be missing.
const visits: Record<string, number> = { home: 12 }
const page: string = 'about'
const { [page]: pageVisits = 0 } = visits // number (the default removed undefined)
console.log('form 10 record:', pageVisits) // form 10 record: 0
