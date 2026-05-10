'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

const CAT_COLOR = {
  'Food & Dining':     { badge: 'badge-red',    icon: '🍔' },
  'Transportation':    { badge: 'badge-blue',   icon: '🚗' },
  'Shopping':          { badge: 'badge-amber',  icon: '🛍️' },
  'Entertainment':     { badge: 'badge-purple', icon: '🎬' },
  'Bills & Utilities': { badge: 'badge-green',  icon: '⚡' },
  'Healthcare':        { badge: 'badge-red',    icon: '🏥' },
  'Education':         { badge: 'badge-blue',   icon: '📚' },
  'Travel':            { badge: 'badge-amber',  icon: '✈️' },
  'Other':             { badge: 'badge-gray',   icon: '📦' },
};
const getCat = (c) => CAT_COLOR[c] || { badge: 'badge-gray', icon: '💸' };

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/'); };

  useEffect(() => {
    const load = async () => {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (!stored?.token) { router.push('/auth/login'); return; }
      try {
        const [pR, eR, sR] = await Promise.all([
          fetch('/api/user/profile',   { headers: { Authorization: `Bearer ${stored.token}` } }),
          fetch('/api/expenses/all',   { headers: { Authorization: `Bearer ${stored.token}` } }),
          fetch('/api/expenses/summary',{ headers: { Authorization: `Bearer ${stored.token}` } }),
        ]);
        if (!pR.ok) throw new Error('Unable to load profile');
        if (!eR.ok) throw new Error('Unable to load expenses');
        if (!sR.ok) throw new Error('Unable to load summary');
        const [p, e, s] = await Promise.all([pR.json(), eR.json(), sR.json()]);
        setProfile(p);
        setExpenses(Array.isArray(e) ? e : []);
        setSummary(s);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const monthExp = expenses.filter(e => {
    const d = new Date(e.date), n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });

  const totalSpent    = summary?.totalSpent || expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const thisMonth     = monthExp.reduce((s, e) => s + Number(e.amount || 0), 0);
  const uniqueCats    = new Set(expenses.map(e => e.category)).size;
  const income        = Number(profile?.monthlyIncome || 0);
  const balance       = income - totalSpent;
  const spentPct      = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0;

  const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const maxMonthly = summary?.monthly?.length ? Math.max(...summary.monthly.map(m => m.total)) : 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar onLogout={handleLogout} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', gap: '0.75rem' }}>
        <div className="spinner" />
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar onLogout={handleLogout} />
      <div className="page-inner">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Dashboard</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.2rem' }}>
              Welcome back{profile?.name ? `, ${profile.name}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/profile')}>Profile</button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/add-expense')}>+ Add Expense</button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="stat">
            <div className="stat-label">Monthly Income</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>{fmt(income)}</div>
            <div className="stat-sub">Your budgeting baseline</div>
          </div>
          <div className="stat">
            <div className="stat-label">Balance</div>
            <div className="stat-value" style={{ color: balance >= 0 ? '#16a34a' : '#dc2626' }}>{fmt(balance)}</div>
            <div className="progress" style={{ marginTop: '0.6rem' }}>
              <div className="progress-bar" style={{ width: `${spentPct}%`, background: spentPct > 85 ? '#ef4444' : '#3b82f6' }} />
            </div>
            <div className="stat-sub">{spentPct.toFixed(0)}% of income spent</div>
          </div>
          <div className="stat">
            <div className="stat-label">This Month</div>
            <div className="stat-value" style={{ color: '#2563eb' }}>{fmt(thisMonth)}</div>
            <div className="stat-sub">{monthExp.length} transaction{monthExp.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Categories Used</div>
            <div className="stat-value" style={{ color: '#9333ea' }}>{uniqueCats}</div>
            <div className="stat-sub">Unique categories</div>
          </div>
        </div>

        {/* Charts row */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* By category */}
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', marginBottom: '1rem' }}>Spending by Category</div>
              {summary.byCategory.length === 0
                ? <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No data yet.</p>
                : summary.byCategory.slice(0, 7).map(cat => {
                    const pct = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
                    const meta = getCat(cat._id);
                    return (
                      <div key={cat._id} style={{ marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                          <span style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>{meta.icon}</span>{cat._id}
                          </span>
                          <span style={{ fontWeight: 600, color: '#374151' }}>{fmt(cat.total)}</span>
                        </div>
                        <div className="progress">
                          <div className="progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
            </div>

            {/* Monthly */}
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', marginBottom: '1rem' }}>Monthly Spending</div>
              {summary.monthly.length === 0
                ? <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No data yet.</p>
                : summary.monthly.slice(0, 6).map(m => {
                    const pct = maxMonthly > 0 ? (m.total / maxMonthly) * 100 : 0;
                    return (
                      <div key={`${m._id.year}-${m._id.month}`} style={{ marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                          <span style={{ color: '#374151' }}>{MONTH[m._id.month - 1]} {m._id.year}</span>
                          <span style={{ fontWeight: 600, color: '#374151' }}>{fmt(m.total)}</span>
                        </div>
                        <div className="progress">
                          <div className="progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        )}

        {/* Recent expenses */}
        <div className="card card-flush">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>Recent Expenses</div>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/expenses')}>View All →</button>
          </div>

          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>No expenses added yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => router.push('/add-expense')}>+ Add First Expense</button>
            </div>
          ) : (
            expenses.slice(0, 6).map((exp) => {
              const meta = getCat(exp.category);
              return (
                <div className="list-row" key={exp._id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div className="cat-pill" style={{ background: '#f3f4f6' }}>{meta.icon}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                        {exp.category} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#dc2626', flexShrink: 0 }}>-{fmt(exp.amount)}</span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}