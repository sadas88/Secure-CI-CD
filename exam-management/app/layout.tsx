import type { Metadata } from 'next';
import './globals.css';
import { ThemeProviderWrapper } from '@/components/ThemeProviderWrapper';

export const metadata: Metadata = {
  title: 'Examination Management System - Government Polytechnic, Mangaluru',
  description: 'Secure examination management system for Government Polytechnic, Mangaluru',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
