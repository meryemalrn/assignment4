// Meryem Betül Abdulrahman, 2300009906
// Object destructuring (forms 5 to 10). Run with `node js/objects.mjs`.

// Form 5 (worked example): take properties out of an object by name.
const task = { id: 't1', title: 'Buy milk', status: 'todo' }
const { title, status } = task
console.log('form 5:', title, status) // form 5: Buy milk todo

// Form 5 with `let`, and a property that does not exist: undefined, no error.
const laptop = { brand: 'Lenovo', ramGb: 16 }
let { brand, ramGb, gpu } = laptop
ramGb = 32 // `let` variables can be reassigned; the object is not touched
console.log('form 5 let:', brand, ramGb, gpu, laptop.ramGb) // form 5 let: Lenovo 32 undefined 16

// Form 6: rename while you take it, { title: heading }
const course = { code: 'SEN0416', name: 'Game Programming' }
const { code: courseCode, name: courseName } = course
console.log('form 6:', courseCode, courseName) // form 6: SEN0416 Game Programming
console.log('form 6 old name:', typeof code) // form 6 old name: undefined  (there is no variable `code`)

// Form 7: default values, { priority = 'normal' }
const ticket = { subject: 'Login fails', priority: undefined, assignee: null }
const { subject, priority = 'normal', assignee = 'nobody', labels = [] } = ticket
console.log('form 7:', subject, priority, assignee, labels) // form 7: Login fails normal null []

// Form 7 + form 6 together: rename AND default, { priority: level = 'normal' }
const { priority: level = 'normal' } = ticket
console.log('form 7 rename+default:', level) // form 7 rename+default: normal

// Form 8: rest, { id, ...others }
const student = { id: 42, name: 'Deniz', city: 'Izmir', year: 3 }
const { id, ...others } = student
console.log('form 8:', id, others) // form 8: 42 { name: 'Deniz', city: 'Izmir', year: 3 }
console.log('form 8 original untouched:', Object.keys(student).length) // 4

// Rest collects (pattern, left side); spread expands (expression, right side).
const updated = { ...others, year: 4 }
console.log('form 8 spread:', updated) // { name: 'Deniz', city: 'Izmir', year: 4 }

// Form 9: nested patterns, { owner: { name } } and arrays inside objects
const order = {
  customer: { fullName: 'Jensen Huang', address: { city: 'California' } },
  items: ['keyboard', 'mouse', 'monitor'],
}
const { customer: { fullName, address: { city } }, items: [firstItem, ...otherItems] } = order
console.log('form 9:', fullName, city, firstItem, otherItems) // form 9: Jensen Huang California keyboard [ 'mouse', 'monitor' ]
console.log('form 9 no variable for the path:', typeof customer, typeof items) // undefined undefined

// Form 9: a missing parent throws; a default for the parent (= {}) makes it safe.
try {
  const { shipping: { carrier } } = order
  console.log(carrier)
} catch (error) {
  console.log('form 9 missing parent:', error.message)
}
const { shipping: { carrier = 'none' } = {} } = order
console.log('form 9 safe:', carrier) // form 9 safe: none

// Form 10: computed key, { [key]: value }
const scores = { math: 85, physics: 72, 'web-programming': 95 }
const wanted = 'physics'
const { [wanted]: wantedScore } = scores
console.log('form 10:', wantedScore) // form 10: 72

// Form 10: the key can be any expression, and a name that is not an identifier works as a string.
const { ['web-' + 'programming']: webScore, 'web-programming': sameScore, [`chem`]: chem = 0 } = scores
console.log('form 10 expression:', webScore, sameScore, chem) // form 10 expression: 95 95 0
