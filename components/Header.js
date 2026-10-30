'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <header className="header"><Link href="/" className="brand" aria-label="The Oasis Abeokuta home" onClick={() => setOpen(false)}><img src="/assets/logo.png" alt="The Oasis Abeokuta" width="163" height="73" /></Link><button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}><span /><span /><span /></button><nav id="navigation" className={open ? 'nav open' : 'nav'} aria-label="Main navigation"><Link href="/" aria-current={pathname === '/' ? 'page' : undefined} onClick={() => setOpen(false)}>Home</Link><Link href="/early-access" aria-current={pathname === '/early-access' ? 'page' : undefined} onClick={() => setOpen(false)}>Bookings</Link><Link href="/#about" onClick={() => setOpen(false)}>About</Link><Link href="/#contact" onClick={() => setOpen(false)}>Contact</Link><Link className="button nav-cta" href="/early-access" onClick={() => setOpen(false)}>Book an Early Stay <span aria-hidden="true">→</span></Link></nav></header>;
}
