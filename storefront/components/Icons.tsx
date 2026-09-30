const base = { width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": true } as const;
export const SearchIcon = () => (<svg {...base}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const BagIcon = () => (<svg {...base}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>);
export const CloseIcon = () => (<svg {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const ArrowIcon = () => (<svg {...base} width={16} height={16}><path d="M7 17 17 7M8 7h9v9" /></svg>);
export const PlusIcon = () => (<svg {...base} width={16} height={16}><path d="M12 5v14M5 12h14" /></svg>);
export const MinusIcon = () => (<svg {...base} width={16} height={16}><path d="M5 12h14" /></svg>);
