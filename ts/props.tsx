// Meryem Betül Abdulrahman, 2300009906
// Props and children in TypeScript. Run with `npx tsx ts/props.tsx`.
import type { ComponentProps, PropsWithChildren, ReactElement, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const show = (label: string, element: ReactElement) => console.log(label, renderToStaticMarkup(element))

// ---------------------------------------------------------------------------
// P1. Props is one object. The type describes that object; it goes after the whole pattern.
type CardProps = { title: string; children?: ReactNode }

function CardA(props: CardProps) {
  return <section><h2>{props.title}</h2>{props.children}</section>
}
// Worked example: the type goes after the whole pattern, and children is in the type too.
function Card({ title, children }: CardProps) {
  return <section><h2>{title}</h2>{children}</section>
}
show('P1 A:', <CardA title="Hi">text</CardA>)
show('P1 B:', <Card title="Hi">text</Card>)

// ---------------------------------------------------------------------------
// P2. children is only a prop: the type checker treats it like any other field of CardProps.
show('P2 between tags:', <Card title="Hi">text</Card>)
show('P2 as attribute:', <Card title="Hi" children="text" />)
// Both at once does not compile in TSX (it runs in js/props.jsx): TS2710, see the README.

// ---------------------------------------------------------------------------
// P3. What children can be: ReactNode is the type that allows all the renderable values.
function Box({ children }: { children?: ReactNode }) {
  return <div>{children}</div>
}
show('P3 string:', <Box>hello</Box>)
show('P3 number:', <Box>{42}</Box>)
show('P3 one element:', <Box><b>bold</b></Box>)
show('P3 several elements:', <Box><b>one</b><i>two</i></Box>)
show('P3 nothing:', <Box />)
show('P3 undefined:', <Box>{undefined}</Box>)
show('P3 null:', <Box>{null}</Box>)
show('P3 false:', <Box>{false}</Box>)
// <Box>{() => 'x'}</Box> does not compile: a function is not a ReactNode.

// A function as children needs its own type: children is then a required function, not a ReactNode.
type CountdownProps = { from: number; children: (n: number) => ReactNode }
function Countdown({ from, children }: CountdownProps) {
  const numbers = Array.from({ length: from }, (_, i) => from - i)
  return <ol>{numbers.map((n) => <li key={n}>{children(n)}</li>)}</ol>
}
show('P3 function (called):', <Countdown from={3}>{(n) => `T-${n}`}</Countdown>)

// children can be narrowed: only a string is accepted here.
function Title({ children }: { children: string }) {
  return <h1>{children.toUpperCase()}</h1>
}
show('P3 string only:', <Title>field guide</Title>)

// ---------------------------------------------------------------------------
// P4. Separating children from the other props, with ComponentProps for the rest.
type PanelProps = { title: string } & Omit<ComponentProps<'section'>, 'title'>

function Panel({ title, children, ...rest }: PanelProps) {
  // rest: every <section> attribute except title and children
  return <section {...rest}><h2>{title}</h2>{children}</section>
}
show('P4 rest onto DOM:', <Panel title="Stats" id="stats" data-kind="panel" aria-label="Statistics">body</Panel>)

function SpreadFirst({ children, ...rest }: ComponentProps<'section'>) {
  return <section {...rest} className="panel">{children}</section>
}
function SpreadLast({ children, ...rest }: ComponentProps<'section'>) {
  return <section className="panel" {...rest}>{children}</section>
}
show('P4 spread first:', <SpreadFirst className="mine">x</SpreadFirst>)
show('P4 spread last:', <SpreadLast className="mine">x</SpreadLast>)

// ---------------------------------------------------------------------------
// P5. Props or children? The types show the difference: named slots or one open slot.
type DialogWithPropsProps = { header: ReactNode; body: ReactNode; footer?: ReactNode }
function DialogWithProps({ header, body, footer }: DialogWithPropsProps) {
  return (
    <div className="dialog">
      <header>{header}</header>
      <main>{body}</main>
      <footer>{footer}</footer>
    </div>
  )
}
function DialogWithChildren({ children }: PropsWithChildren) {
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

// ---------------------------------------------------------------------------
// P6. Defaults. Optional in the type + default in the pattern = never undefined in the body.
type BadgeProps = { label?: string | null; color?: 'gray' | 'red' | 'green' }
function Badge({ label = 'new', color = 'gray' }: BadgeProps) {
  // label: string | null (null was allowed by the type, and the default does not replace it)
  // color: 'gray' | 'red' | 'green'
  return <span className={color}>{label}</span>
}
show('P6 missing:', <Badge />)
show('P6 undefined:', <Badge label={undefined} />)
show('P6 null:', <Badge label={null} />)
show('P6 given:', <Badge label="sale" color="red" />)

// ---------------------------------------------------------------------------
// P7. Types: children?: ReactNode, PropsWithChildren and ComponentProps<'button'>.

// (a) children?: ReactNode written by hand. Optional: <Note /> is allowed.
type NoteProps = { tone: 'info' | 'warn'; children?: ReactNode }
function Note({ tone, children }: NoteProps) {
  return <p className={tone}>{children}</p>
}
show('P7a with children:', <Note tone="info">Saved.</Note>)
show('P7a without children:', <Note tone="warn" />)

// (b) PropsWithChildren<P> = P & { children?: ReactNode }. The same thing, written by React.
type AlertOwnProps = { tone: 'info' | 'warn' }
function Alert({ tone, children }: PropsWithChildren<AlertOwnProps>) {
  return <p className={tone}>{children}</p>
}
show('P7b PropsWithChildren:', <Alert tone="warn">Disk is almost full.</Alert>)
show('P7b without children:', <Alert tone="info" />)

// (c) children REQUIRED: write it without the question mark.
function Required({ children }: { children: ReactNode }) {
  return <strong>{children}</strong>
}
show('P7c required:', <Required>must be here</Required>)
// <Required /> does not compile: TS2741, see the README.

// (d) ComponentProps<'button'>: everything a real <button> accepts, children included.
type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'ghost' }
function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return <button {...rest} className={`btn btn-${variant} ${className}`.trim()}>{children}</button>
}
show('P7d ComponentProps:', <Button type="submit" disabled aria-label="Save" variant="ghost">Save</Button>)
show('P7d defaults:', <Button>OK</Button>)

// ComponentProps also works on your own component: it reads the props type back out of it.
type ReadBack = ComponentProps<typeof Alert> // { tone: 'info' | 'warn' } & { children?: ReactNode }
const readBack: ReadBack = { tone: 'info', children: 'typed as props of Alert' }
show('P7 ComponentProps<typeof Alert>:', <Alert {...readBack} />)
