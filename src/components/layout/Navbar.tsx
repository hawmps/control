import { NavLink } from 'react-router-dom';
import { FileText, Package, Shield, Settings } from 'lucide-react';

// Security controls tracking navigation items
const navItems = [
  { path: '/', label: 'Control Status', icon: Shield },
  { path: '/items-management', label: 'Manage Environments', icon: Package },
  { path: '/controls', label: 'Security Controls', icon: FileText },
  { path: '/manage-status', label: 'Manage Status', icon: Settings },
];

interface NavbarProps {
  appName?: string;
}

export default function Navbar({ 
  appName = 'Security Control Tracker'
}: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <NavLink 
              to="/" 
              className="h-10 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <span className="text-white font-bold text-lg">{appName}</span>
            </NavLink>
            
            {/* Navigation Items */}
            <div className="hidden md:flex space-x-1">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`
                  }
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}