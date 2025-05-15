import { ReactNode } from 'react';
import Script from 'next/script';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard with Tailwind CSS and Next.js 15",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-ao">
      <head>
        {/* Leaflet CSS */}
        <link 
          rel="stylesheet" 
          href="/vendors/leaflet/leaflet.css" 
        />
        <link 
          rel="stylesheet" 
          href="/vendors/leaflet.markercluster/MarkerCluster.css" 
        />
        <link 
          rel="stylesheet" 
          href="/vendors/leaflet.markercluster/MarkerCluster.Default.css" 
        />
        
        {/* Google Fonts - Adicionais além da Geist */}
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link 
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700%7cPoppins:300,400,500,600,700,800,900&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Simplebar CSS */}
        <link 
          rel="stylesheet" 
          href="/vendors/simplebar/simplebar.min.css" 
        />
        
        {/* Theme CSS */}
        <link 
          rel="stylesheet" 
          href="/assets/css/theme.css" 
          id="style-default" 
        />
        <link 
          rel="stylesheet" 
          href="/assets/css/user.css" 
          id="user-style-default" 
        />
      </head>
      <body className="bg-gray-100 font-sans">
        <div className="flex min-h-screen">
          <main className="flex-1">
            {children}
          </main>
        </div>
        
        {/* Scripts */}
        <Script src="/assets/js/config.js" strategy="beforeInteractive" />
        <Script src="/vendors/simplebar/simplebar.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}