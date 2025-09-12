import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps {
  appName?: string;
}

export default function Layout({ 
  appName
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 rounded-br-md">
        Skip to main content
      </a>
      <Navbar 
        appName={appName}
      />
      <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}