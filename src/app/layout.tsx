import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import { ThemedToaster } from '@/components/layout/ThemedToaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'CollegePathya | Find Your Perfect College',
  description:
    'Search, compare, and predict admissions across thousands of colleges using real JEE and EAMCET cutoff data. Multilingual support in Telugu, Hindi, Kannada.',
  keywords: ['college predictor', 'JEE', 'EAMCET', 'college search', 'engineering colleges', 'India'],
  authors: [{ name: 'CollegePathya' }],
  openGraph: {
    title: 'CollegePathya | Find Your Perfect College',
    description: 'Search, compare, and predict admissions across Indian colleges with real cutoff data.',
    type: 'website',
    locale: 'en_IN',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F5EDE4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Rajdhani:wght@300;400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-bg-primary">
        <Providers>
          {children}
          <ThemedToaster />
        </Providers>
      </body>
    </html>
  );
}