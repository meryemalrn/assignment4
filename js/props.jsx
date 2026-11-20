// Meryem Betül Abdulrahman, 2300009906
// Props and children in plain JavaScript (JSX). Run with `npx tsx js/props.jsx`.
import { renderToStaticMarkup } from 'react-dom/server'

const show = (label, element) => console.log(label, renderToStaticMarkup(element))

// ---------------------------------------------------------------------------
// P1. Props is ONE object; the parameter pattern takes it apart.
// These two components are the same thing written two ways.
function CardA(props) {
  return <section><h2>{props.title}</h2>{props.children}</section>
}
function CardB({ title, children }) {
  return <section><h2>{title}</h2>{children}</section>
}
show('P1 A:', <CardA title="Hi">text</CardA>)
show('P1 B:', <CardB title="Hi">text</CardB>)

// What does the one object look like? A component that prints what it receives.
function Spy(props) {
  console.log('P1 props object:', props)
  console.log('P1 keys:', Object.keys(props))
  return null
}
show('P1 spy renders:', <Spy title="Hi" count={3}>text</Spy>)

// A component is just a function: calling it by hand with an object gives the same element.
console.log('P1 plain call:', renderToStaticMarkup(CardB({ title: 'Hi', children: 'text' })))

// ---------------------------------------------------------------------------
// P2. children is only a prop.
show('P2 between tags:', <CardB title="Hi">text</CardB>)
show('P2 as attribute:', <CardB title="Hi" children="text" />)

// Both at the same time: the content between the tags wins.
show('P2 both:', <CardB title="Hi" children="from the attribute">from between the tags</CardB>)

// ---------------------------------------------------------------------------
// P3. What children can be.
function Box({ children }) {
  return <div>{children}</div>
}
function Describe({ children }) {
  const kind = Array.isArray(children) ? `array(${children.length})` : children === null ? 'null' : typeof children
  return <i>{kind}</i>
}
show('P3 string:', <Box>hello</Box>)
show('P3 number:', <Box>{42}</Box>)
show('P3 zero:', <Box>{0}</Box>)
show('P3 one element:', <Box><b>bold</b></Box>)
show('P3 several elements:', <Box><b>one</b><i>two</i></Box>)
show('P3 nothing:', <Box />)
show('P3 undefined:', <Box>{undefined}</Box>)
show('P3 null:', <Box>{null}</Box>)
show('P3 false:', <Box>{false}</Box>)
show('P3 true:', <Box>{true}</Box>)
show('P3 empty string:', <Box>{''}</Box>)
show('P3 array:', <Box>{['a', 'b', 3]}</Box>)
show('P3 function (not called):', <Box>{() => 'I am never called'}</Box>)

// What the component really gets in props.children for each of those:
show('P3 typeof string:', <Describe>hello</Describe>)
show('P3 typeof number:', <Describe>{42}</Describe>)
show('P3 typeof one element:', <Describe><b>bold</b></Describe>)
show('P3 typeof several:', <Describe><b>one</b><i>two</i></Describe>)
show('P3 typeof nothing:', <Describe />)
show('P3 typeof null:', <Describe>{null}</Describe>)
show('P3 typeof false:', <Describe>{false}</Describe>)
show('P3 typeof function:', <Describe>{() => 'x'}</Describe>)

// A function child works only when the component CALLS it ("render prop").
function Countdown({ from, children }) {
  const numbers = Array.from({ length: from }, (_, i) => from - i)
  return <ol>{numbers.map((n) => <li key={n}>{children(n)}</li>)}</ol>
}
show('P3 function (called):', <Countdown from={3}>{(n) => `T-${n}`}</Countdown>)

// The classic trap: `count && <tag>` renders the 0.
const count = 0
show('P3 zero && trap:', <Box>{count && <b>items</b>}</Box>)
show('P3 zero fixed:', <Box>{count > 0 && <b>items</b>}</Box>)

// ---------------------------------------------------------------------------
// P4. Separating children from the other props: ({ title, children, ...rest }).
function Panel({ title, children, ...rest }) {
  console.log('P4 rest object:', rest)
  return <section {...rest}><h2>{title}</h2>{children}</section>
}
show('P4 rest onto DOM:', <Panel title="Stats" id="stats" data-kind="panel" aria-label="Statistics">body</Panel>)

// Order decides who wins: the LAST one written wins.
function SpreadFirst({ children, ...rest }) {
  return <section {...rest} className="panel">{children}</section> // explicit prop last: component wins
}
function SpreadLast({ children, ...rest }) {
  return <section className="panel" {...rest}>{children}</section> // spread last: caller wins
}
show('P4 spread first:', <SpreadFirst className="mine">x</SpreadFirst>)
show('P4 spread last:', <SpreadLast className="mine">x</SpreadLast>)
// The same rule in a plain object literal, without React:
console.log('P4 plain objects:', { ...{ className: 'mine' }, className: 'panel' }, { className: 'panel', ...{ className: 'mine' } })

// Merging on purpose instead of letting one win:
function Merged({ className = '', children, ...rest }) {
  return <section {...rest} className={`panel ${className}`.trim()}>{children}</section>
}
show('P4 merged:', <Merged className="mine">x</Merged>)

// What happens when `title` is NOT taken out before the spread: it leaks onto the DOM element.
function Leaky({ children, ...rest }) {
  return <section {...rest}>{children}</section>
}
show('P4 leaky:', <Leaky title="Stats" id="stats">body</Leaky>)

// Spreading rest WITH children inside it also works, because children is only a prop (P2).
function Lazy(props) {
  return <section {...props} />
}
show('P4 children through spread:', <Lazy id="lazy">passed through</Lazy>)

// ---------------------------------------------------------------------------
// P5. Props or children? The same dialog built twice.
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
show('P5 props:', <DialogWithProps header="Delete file?" body="This cannot be undone." footer={<button>OK</button>} />)
show(
  'P5 children:',
  <DialogWithChildren>
    <header>Delete file?</header>
    <main>This cannot be undone.</main>
    <footer><button>OK</button></footer>
  </DialogWithChildren>,
)
// With props the component controls the structure: a missing footer still leaves the frame.
show('P5 props, footer forgotten:', <DialogWithProps header="Delete file?" body="This cannot be undone." />)
// With children the caller controls it: the order can be wrong and the component cannot know.
show('P5 children, wrong order:', <DialogWithChildren><footer>OK</footer><header>Delete file?</header></DialogWithChildren>)

// ---------------------------------------------------------------------------
// P6. Defaults (form 7 inside form 11).
function Badge({ label = 'new', color = 'gray' }) {
  return <span className={color}>{label}</span>
}
show('P6 missing:', <Badge />)
show('P6 undefined:', <Badge label={undefined} />)
show('P6 null:', <Badge label={null} color={null} />)
show('P6 empty string:', <Badge label="" />)
show('P6 zero:', <Badge label={0} />)

// A default for children works the same way.
function Greeting({ children = 'Hello, stranger' }) {
  return <p>{children}</p>
}
show('P6 children default:', <Greeting />)
show('P6 children given:', <Greeting>Hello, Mri</Greeting>)
show('P6 children null:', <Greeting>{null}</Greeting>)

// When null should also fall back, use ?? in the body.
function BadgeSafe({ label }) {
  return <span>{label ?? 'new'}</span>
}
show('P6 null with ??:', <BadgeSafe label={null} />)

// ---------------------------------------------------------------------------
// P7 (types) is in ts/props.tsx. Below: the experiments from the hints.

// key is not a prop. React keeps it for itself.
function Row({ key, name }) {
  return <li>{String(key)}:{name}</li>
}
show('Hint key:', <ul><Row key="r1" name="first" /></ul>)

// Rest props with a name that already exists: `title` was taken out, so rest does not have it.
function Titled({ title, ...rest }) {
  return <section {...rest} data-had-title={'title' in rest ? 'yes' : 'no'}>{title}</section>
}
show('Hint rest + existing name:', <Titled title="Stats" id="s" />)

// A component that changes its props.
function Mutator(props) {
  try {
    props.title = 'changed'
  } catch (error) {
    console.log('Hint mutate props:', error.constructor.name + ':', error.message)
  }
  return <b>{props.title}</b>
}
show('Hint mutate renders:', <Mutator title="original" />)

// Reassigning the destructured variable is allowed: it is a local variable, not the prop.
function Shouter({ title }) {
  title = title.toUpperCase()
  return <b>{title}</b>
}
show('Hint reassign local:', <Shouter title="original" />)
