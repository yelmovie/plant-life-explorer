// Tab stays within the certificate's three buttons.
export const shownItems=(root,selector)=>[...root.querySelectorAll(selector)].filter(el=>el.getClientRects().length);
export function wrapTabAtEnds(event,items){const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
