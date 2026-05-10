'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = ({ onLogout }) => {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard',   label: 'Dashboard'    },
    { href: '/expenses',    label: 'Expenses'      },
    { href: '/budgets',     label: 'Budgets'       },
    { href: '/add-expense', label: 'Add Expense'   },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/dashboard" className="nav-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
          </svg>
          SpendSmart
        </Link>

        <div className="nav-links">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={`nav-link${pathname === href ? ' active' : ''}`}>
              {label}
            </Link>
          ))}
        </div>

        <button onClick={onLogout} className="btn btn-secondary btn-sm">
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;