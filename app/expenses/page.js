'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Input from '../../components/Input';

const CATEGORIES = [
  'Food & Dining','Transportation','Shopping','Entertainment',
  'Bills & Utilities','Healthcare','Education','Travel','Other',
];
const CAT_ICON = {
  'Food & Dining':'🍔','Transportation':'🚗','Shopping':'🛍️','Entertainment':'🎬',
  'Bills & Utilities':'⚡','Healthcare':'🏥','Education':'📚','Travel':'✈️','Other':'📦',
};

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const fmtDate = (s) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Expenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', category: '', description: '', date: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/'); };

  const getToken = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      return u?.token || null;
    } catch { return null; }
  };

  const loadExpenses = async (cat) => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) { router.push('/auth/login'); return; }
      const url = (cat || filter) === 'all'
        ? '/api/expenses/all'
        : `/api/expenses/category/${(cat || filter).replace(/\s+/g, '-')}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setExpenses(await res.json());
      } else {
        setError('Failed to load expenses.');
      }
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadExpenses(filter); }, [filter]);

  const startEdit = (exp) => {
    setEditingId(exp._id);
    setEditForm({
      amount: String(exp.amount),
      category: exp.category,
      description: exp.description,
      date: new Date(exp.date).toISOString().split('T')[0],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ amount: '', category: '', description: '', date: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`/api/expenses/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: parseFloat(editForm.amount),
          category: editForm.category,
          description: editForm.description,
          date: editForm.date,
        }),
      });
      if (res.ok) {
        // Update state directly — no page reload
        setExpenses(prev => prev.map(exp =>
          exp._id === editingId
            ? { ...exp, amount: parseFloat(editForm.amount), category: editForm.category, description: editForm.description, date: editForm.date }
            : exp
        ));
        cancelEdit();
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to update expense.');
      }
    } catch { setError('Network error.'); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async () => {
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`/api/expenses/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setExpenses(prev => prev.filter(e => e._id !== deleteId));
        setDeleteId(null);
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to delete expense.');
        setDeleteId(null);
      }
    } catch {
      setError('Network error.');
      setDeleteId(null);
    }
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar onLogout={handleLogout} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', gap: '0.75rem', flexDirection: 'column' }}>
        <div className="spinner" /><p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar onLogout={handleLogout} />

      {/* Delete confirm modal */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '360px', width: '100%' }}>
            <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '0.4rem' }}>Delete this expense?</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.25rem' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-inner">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>All Expenses</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.2rem' }}>Manage and review your transactions</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/add-expense')}>+ Add Expense</button>
        </div>

        {/* Filter + summary bar */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>Category:</label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="all">All</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#374151' }}>
            <span style={{ fontWeight: 600, color: '#dc2626' }}>{fmt(total)}</span>
            <span style={{ color: '#9ca3af', marginLeft: '0.4rem' }}>· {expenses.length} record{expenses.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* List */}
        <div className="card card-flush">
          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {filter === 'all' ? 'No expenses yet.' : `No expenses in "${filter}".`}
              </p>
              {filter === 'all' && (
                <button className="btn btn-primary btn-sm" onClick={() => router.push('/add-expense')}>+ Add First Expense</button>
              )}
            </div>
          ) : (
            expenses.map((exp) => {
              const isEditing = editingId === exp._id;
              return (
                <div key={exp._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {isEditing ? (
                    /* Inline edit form */
                    <form onSubmit={handleEditSubmit} style={{ padding: '1rem 1.25rem', background: '#eff6ff', borderLeft: '3px solid #3b82f6' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', marginBottom: '0.85rem' }}>Editing expense</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label">Amount (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.amount}
                            onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))}
                            className="form-input"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <select
                            value={editForm.category}
                            onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                            className="form-input"
                            required
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                            className="form-input"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Date</label>
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                            className="form-input"
                            required
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button type="submit" disabled={editSaving} className="btn btn-primary btn-sm">
                          {editSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="list-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                        <div className="cat-pill" style={{ background: '#f3f4f6' }}>{CAT_ICON[exp.category] || '💸'}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {exp.description}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                            {exp.category} · {fmtDate(exp.date)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                        <span style={{ fontWeight: 600, color: '#dc2626', fontSize: '0.9rem' }}>-{fmt(exp.amount)}</span>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(exp)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(exp._id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {expenses.length > 0 && (
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.75rem', textAlign: 'right' }}>
            {expenses.length} result{expenses.length !== 1 ? 's' : ''}{filter !== 'all' ? ` in "${filter}"` : ''}
          </p>
        )}
      </div>
    </div>
  );
}