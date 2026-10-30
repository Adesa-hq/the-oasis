export default function Icon({
  name,
  ...props
}) {
  const paths = {
    calendar: <><rect x="4" y="6" width="24" height="23" rx="3" /><path d="M4 13h24M10 3v7M22 3v7" /></>,
    crown: <><path d="m3 10 5 16h17l5-16-8 6-6-11-6 11Z" /><circle cx="3" cy="9" r="1" /><circle cx="16" cy="4" r="1" /><circle cx="30" cy="9" r="1" /></>,
    person: <><circle cx="16" cy="9" r="6" /><path d="M4 29v-3a12 10 0 0 1 24 0v3" /></>,
    location: <><path d="m3 21 9-9 6 3L29 3M21 3h8v8M5 24v6h4v-9M15 21v9h4V19M25 16v14h4V13" /></>,
    shield: <><path d="m16 2 12 4v11c0 7-12 13-12 13S4 24 4 17V6Z" /><path d="m10 16 4 4 8-9" /></>,
    check: <><circle cx="16" cy="16" r="14" /><path d="m9 16 5 5 10-11" /></>
  };
  return <svg width="44" height="44" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
