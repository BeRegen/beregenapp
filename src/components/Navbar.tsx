import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, LogOut, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  const NavItems = () => (
    <>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-green-700 text-white'
              : 'text-gray-100 hover:bg-green-700 hover:text-white'
          }`
        }
      >
        <Home className="w-5 h-5 mr-3" />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-green-700 text-white'
              : 'text-gray-100 hover:bg-green-700 hover:text-white'
          }`
        }
      >
        <User className="w-5 h-5 mr-3" />
        <span>Profile</span>
      </NavLink>
      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-3 rounded-lg transition-colors text-gray-100 hover:bg-green-700 hover:text-white w-full text-left"
      >
        <LogOut className="w-5 h-5 mr-3" />
        <span>Logout</span>
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-green-600 flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-white hover:bg-green-700 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-xl font-bold text-white">Task Manager</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full bg-green-600 w-64 transform transition-transform duration-300 ease-in-out z-40 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="hidden md:flex items-center justify-center h-16 mb-8">
            <h1 className="text-2xl font-bold text-white">Task Manager</h1>
          </div>
          <div className="flex flex-col space-y-2 flex-grow md:mt-0 mt-16">
            <NavItems />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;