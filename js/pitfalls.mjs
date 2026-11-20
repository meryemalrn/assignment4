// Meryem Betül Abdulrahman, 2300009906
// Things that surprise people. Run with `node js/pitfalls.mjs`.

// Pitfall 1 (worked example): destructuring undefined or null throws a TypeError.
try {
  const { a } = undefined
  console.log(a)
} catch (error) {
  console.log('pitfall 1:', error.constructor.name) // pitfall 1: TypeError
  console.log('pitfall 1 message:', error.message)
}
try {
  const [first] = null
  console.log(first)
} catch (error) {
  console.log('pitfall 1 array/null:', error.message)
}
// The fix: a fallback on the right side.
const { a: safeA } = undefined ?? {}
console.log('pitfall 1 fixed:', safeA)

// Pitfall 2: a default only applies to undefined, not to null
const settings = { theme: undefined, fontSize: null, volume: 0, nickname: '' }
const { theme = 'dark', fontSize = 14, volume = 50, nickname = 'guest', lang = 'tr' } = settings
console.log('pitfall 2:', theme, fontSize, volume, JSON.stringify(nickname), lang)
// use ?? after the destructuring.
const { fontSize: rawFontSize } = settings
console.log('pitfall 2 fixed:', rawFontSize ?? 14) // pitfall 2 fixed: 14

// Pitfall 3: assigning without const/let needs parentheses, ({ a } = obj)
let width, height
const box = { width: 30, height: 20 }
try {
  // The statement `{ width, height } = box` cannot even be parsed, so it is built from a string here.
  new Function('box', 'let width, height; { width, height } = box')
} catch (error) {
  console.log('pitfall 3:', error.constructor.name + ':', error.message)
}
;({ width, height } = box)
console.log('pitfall 3 fixed:', width, height) // pitfall 3 fixed: 30 20

// Pitfall 4: it copies references, not deep copies (nested objects are shared)
const team = { name: 'AutoTrack', members: ['Mri', 'Kaan'], lead: { name: 'Mri' } }
const { members, lead, ...restOfTeam } = team
members.push('Zeynep')
lead.name = 'Zeynep'
console.log('pitfall 4:', team.members, team.lead) // the ORIGINAL changed
const { name: teamName } = team
let copyOfName = teamName
copyOfName = 'Other'
console.log('pitfall 4 primitive:', team.name, copyOfName) // AutoTrack Other
console.log('pitfall 4 same object:', members === team.members, restOfTeam !== team) // true true

// Pitfall 5: in objects the order does not matter, in arrays it does
const rgb = [255, 128, 0]
const [red, green, blue] = rgb
const [blueWrong, greenWrong, redWrong] = rgb // names in another order: values do NOT follow the names
console.log('pitfall 5 array:', red, green, blue, '|', redWrong, greenWrong, blueWrong) // 255 128 0 | 0 128 255
const colorObject = { r: 255, g: 128, b: 0 }
const { b, g, r } = colorObject
console.log('pitfall 5 object:', r, g, b) // pitfall 5 object: 255 128 0

// Pitfall 6: a rename is not a second variable, and the "type-looking" rename
const user = { name: 'Mri', age: 21 }
const { name: string, age: number } = user 
console.log('pitfall 6:', string, number, typeof name, typeof age)

// Pitfall 7: a line that starts with [ continues the line before it when there is no semicolon
try {
  new Function(`
    let first = 'a'
    let second = 'b'
    [first, second] = [second, first]
    return [first, second]
  `)()
} catch (error) {
  console.log('pitfall 7:', error.constructor.name + ':', error.message)
}
