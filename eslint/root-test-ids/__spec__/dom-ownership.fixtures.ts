export const ownershipModule = `
import { Surface } from "@/shared/ui/surface"
const Owned = () => <div />
export const Repeated = () => <><Owned /><Owned /></>
export const Shadowed = ({ Surface }) => <Surface />
export const Mutable = ({ Provider }) => { let Comp = "div"; Comp = Provider; return <Comp /> }
export const Provider = ({ children }) => children
const First = () => <Second />
const Second = () => <First />
export const Recursive = () => <First />
`
