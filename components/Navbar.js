import React from 'react';
import Button from './Button';

const Navbar = ({ onLogout }) => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Expense Tracker</h1>
        <Button onClick={onLogout} variant="danger" className="shadow-md">
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;