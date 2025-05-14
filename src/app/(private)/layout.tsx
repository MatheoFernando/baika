import { ReactNode } from 'react';

export const metadata = {
  title: 'Dashboard',
  description: 'Dashboard with Tailwind CSS and Next.js 15',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <div className="flex min-h-screen">
 
          <main className="flex-1">
            {children}
           
          </main>
        </div>
      </body>
    </html>
  );
}