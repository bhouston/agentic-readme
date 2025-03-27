/**
 * Root layout for the Agentic README Service
 */

import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agentic README Service',
  description: 'Automatically generate high-quality, AI-friendly README files for npm libraries',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}