'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Input from '../../components/Input';

const CATEGORIES = [
  'Food & Dining','Transportation','Shopping','Entertainment',
  'Bills & Utilities','Healthcare','Education','Travel','Other',
];

export default function AddExpense() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '', category: '', description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/'); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) { router.push('/auth/login'); return; }

      const res = await fetch('/api/expenses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add expense.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar onLogout={handleLogout} />
      <div className="page-inner-sm">

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '0.75rem' }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>Add Expense</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.2rem' }}>Record a new spending item.</p>
        </div>

        <div className="card">
          {success && <div className="alert alert-success">Expense added! Redirecting...</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <Input
              label="Description"
              name="description"
              placeholder="e.g. Dinner at restaurant"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {loading ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}