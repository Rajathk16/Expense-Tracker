'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '0 1.5rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#111827' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
          </svg>
          SpendSmart
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/auth/login')}>Log In</button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/auth/signup')}>Sign Up</button>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#111827', lineHeight: 1.25, marginBottom: '1rem' }}>
            Personal Expense Tracker
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            Track your spending, set monthly budgets, and get a clear picture of where your money goes — all in one place.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/auth/signup')}>
              Get Started
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push('/auth/login')}>
              Log In
            </button>
          </div>

          {/* Feature list */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginTop: '4rem',
            textAlign: 'left',
          }}>
            {[
              { icon: '📊', title: 'Dashboard', desc: 'Income, balance, and spending at a glance.' },
              { icon: '🏷️', title: 'Categories', desc: 'Organise expenses by Food, Travel, Bills...' },
              { icon: '🎯', title: 'Budgets', desc: 'Set monthly limits and track progress.' },
              { icon: '✏️', title: 'CRUD', desc: 'Add, edit, and delete expenses any time.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ boxShadow: 'none' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', marginBottom: '0.25rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
        SpendSmart — built with Next.js, MongoDB & Express
      </footer>
    </div>
  );
}
