'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Input from '../../components/Input';

const CATEGORIES = [
  'Food & Dining','Transportation','Shopping','Entertainment',
  'Bills & Utilities','Healthcare','Education','Travel','Other',
];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAT_ICON = {
  'Food & Dining':'🍔','Transportation':'🚗','Shopping':'🛍️','Entertainment':'🎬',
  'Bills & Utilities':'⚡','Healthcare':'🏥','Education':'📚','Travel':'✈️','Other':'📦',
};

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

export default function Budgets() {
  const router = useRouter();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    monthlyLimit: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/'); };

  const loadBudgets = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) { router.push('/auth/login'); return; }
      const res = await fetch('/api/budgets/all', { headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) setBudgets(await res.json());
      else setError('Failed to load budgets.');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadBudgets(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) { router.push('/auth/login'); return; }
      const res = await fetch('/api/budgets/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          category: formData.category,
          monthlyLimit: parseFloat(formData.monthlyLimit),
          year: parseInt(formData.year),
          month: parseInt(formData.month),
        }),
      });
      if (res.ok) {
        setFormData({ category: '', monthlyLimit: '', year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
        setShowForm(false);
        loadBudgets();
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to add budget.');
      }
    } catch { setError('Network error.'); }
    finally { setAdding(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar onLogout={handleLogout} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="spinner" /><p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar onLogout={handleLogout} />
      <div className="page-inner">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>Budgets</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.2rem' }}>Set monthly spending limits by category.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Budget'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Add form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.25rem', borderColor: '#93c5fd' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', marginBottom: '1rem' }}>New Budget</div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="form-input" required>
                    <option value="">Select</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Input label="Monthly Limit (₹)" name="monthlyLimit" type="number" step="0.01" placeholder="e.g. 5000"
                  value={formData.monthlyLimit} onChange={handleChange} required />
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select name="month" value={formData.month} onChange={handleChange} className="form-input" required>
                    {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <Input label="Year" name="year" type="number" value={formData.year} onChange={handleChange} required />
              </div>
              <button type="submit" disabled={adding} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                {adding ? 'Saving...' : 'Save Budget'}
              </button>
            </form>
          </div>
        )}

        {/* Budget list */}
        {budgets.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
              No budgets set yet. Create one to start tracking your spending limits.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Create Budget</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {budgets.map(budget => (
              <div key={budget._id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                  }}>
                    {CAT_ICON[budget.category] || '📦'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{budget.category}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{MONTHS[budget.month - 1]} {budget.year}</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#16a34a' }}>{fmt(budget.monthlyLimit)}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>monthly limit</div>
                <div className="progress">
                  <div className="progress-bar green" style={{ width: '0%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}