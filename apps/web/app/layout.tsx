import type { Metadata } from 'next';
import Link from 'next/link';
import './style.css';
export const metadata: Metadata = {title:'Funktion360 ID',description:'Din fælles Funktion360-konto',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}) {
  return <html lang="da"><body><a className="skip" href="#main">Spring til indhold</a><header><Link href="/">Funktion360 <strong>ID</strong></Link><nav aria-label="Hovedmenu"><Link href="/login">Log ind</Link><Link href="/account">Min konto</Link></nav></header><main id="main">{children}</main><footer>Én personlig konto · Dine produkter · Dine organisationer</footer></body></html>;
}
