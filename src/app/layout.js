// src/app/layout.js
import { SessionProvider } from '@/context/SessionContext';
import './globals.css';
import Script from "next/script";

export const metadata = {
  title: 'Unifoods',
  description: 'Business Management Suite',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://upload-widget.cloudinary.com/global/all.js"
          strategy="afterInteractive" 
        />
      </head>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
