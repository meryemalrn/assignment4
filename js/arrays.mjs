// Meryem Betül Abdulrahman, 2300009906
// Array destructuring (forms 1 to 4). Plain JavaScript: run with `node js/arrays.mjs`.

// Form 1 (worked example): take values out of an array by position.
function minMax(numbers) {
  return [Math.min(...numbers), Math.max(...numbers)]
}
const [lowest, highest] = minMax([4, 9, 2])
console.log('form 1:', lowest, highest) // form 1: 2 9

const result = minMax([4, 9, 2])
const lowestPlain = result[0]
const highestPlain = result[1]
console.log('form 1 plain:', lowestPlain, highestPlain) 

const [one, two, three] = [10, 20]
console.log('form 1 missing:', one, two, three) 

// Form 2: skip an item and collect the rest, [, second, ...others]
const queue = ['Bella', 'Mortimer', 'Cassandra', 'Alexander']
const [, second, ...others] = queue
console.log('form 2:', second, others) // form 2: Mortimer [ 'Cassandra', 'Alexander' ]

const [only, ...nothingLeft] = ['Bella']
console.log('form 2 empty rest:', only, nothingLeft) 
console.log('form 2 rest is a copy:', others !== queue, queue.length) 


const [head, ...tail] = queue 
const rebuilt = [head, ...tail] 
console.log('form 2 rest vs spread:', tail.length, rebuilt.length)

// Form 3: swap two variables without a temporary, [a, b] = [b, a]
let left = 'dots'
let right = 'stripes'
;[left, right] = [right, left]
console.log('form 3:', left, right) 

let gold = 'Sarı', silver = 'Gri', bronze = 'Kahve'
;[gold, silver, bronze] = [bronze, gold, silver]
console.log('form 3 rotate:', gold, silver, bronze) 

// Form 4: default values, const [a = 1] = []
const [size = 'M', color = 'black'] = ['L']
console.log('form 4:', size, color) 

const [m1 = 'default'] = []
const [m2 = 'default'] = [undefined]
const [m3 = 'default'] = [null]
console.log('form 4 missing/undefined/null:', m1, m2, m3)
