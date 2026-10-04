// Registry file expects @radix-ui/react-collapsible; this repo installs the
// `radix-ui` umbrella package, which exposes the same primitive.
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.Trigger
const CollapsiblePanel = CollapsiblePrimitive.Content
// The registry also names the panel `CollapsibleContent`; keep both spellings.
const CollapsibleContent = CollapsiblePrimitive.Content

export { Collapsible, CollapsibleTrigger, CollapsiblePanel, CollapsibleContent }