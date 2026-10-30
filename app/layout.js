import './globals.css';
import Header from '../components/Header';
export const metadata = {
  metadataBase: new URL('https://theoasisabeokuta.com'),
  title: {
    default: 'The Oasis Abeokuta | Living Without Limits',
    template: '%s | The Oasis Abeokuta'
  },
  description: 'A modern residential experience coming to Abeokuta. Be among the first to experience Oasis Apartments. Register for early access.',
  openGraph: {
    type: 'website',
    siteName: 'The Oasis Abeokuta',
    title: 'The Oasis Abeokuta | Living Without Limits',
    description: 'A modern residential experience coming to Abeokuta. Register for early access.',
    images: [{ url: '/assets/oasis-share-logo.jpeg', width: 1280, height: 640, alt: 'The Oasis Abeokuta logo' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Oasis Abeokuta | Living Without Limits',
    description: 'A modern residential experience coming to Abeokuta. Register for early access.',
    images: ['/assets/oasis-share-logo.jpeg']
  },
  icons: { icon: '/assets/oasis-share-logo.jpeg', apple: '/assets/oasis-share-logo.jpeg' }
};
export default function RootLayout({
  children
}) {
  return <html lang="en"><body id="page-top"><a className="skip-link" href="#main">Skip to content</a><Header />{children}<footer id="contact"><a href="/" aria-label="The Oasis Abeokuta home"><img src="/assets/logo.png" alt="The Oasis Abeokuta" width="163" height="73" /></a><p>A new standard of living. Coming to Abeokuta.</p><a href="/early-access">Be Among the First to Book <span aria-hidden="true">→</span></a><small>© {new Date().getFullYear()} The Oasis Abeokuta. All rights reserved.</small></footer><a className="back-to-top" href="#page-top" aria-label="Back to top" title="Back to top"><span aria-hidden="true" /></a></body></html>;
}
