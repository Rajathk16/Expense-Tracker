'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Input from '../../components/Input';

const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', monthlyIncome: '' });

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/'); };

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('user'))?.token || null; }
    catch { return null; }
  };

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) { router.push('/auth/login'); return; }
      try {
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Unable to load profile');
        const data = await res.json();
        setProfile(data);
        setFormData({ name: data.name || '', monthlyIncome: data.monthlyIncome ?? 0 });
      } catch (err) {
        setError(err.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          monthlyIncome: Number(formData.monthlyIncome) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Unable to update profile');
      }
      const updated = await res.json();
      setProfile(updated);
      // Keep token in localStorage, update user info
      const stored = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...stored, name: updated.name }));
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar onLogout={handleLogout} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', gap: '0.75rem', flexDirection: 'column' }}>
        <div className="spinner" />
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar onLogout={handleLogout} />
      <div className="page-inner-sm">

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '0.75rem' }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>My Profile</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.2rem' }}>Manage your account details and monthly income.</p>
        </div>

        {/* Account info card */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            Account Information
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Name</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>{profile?.name || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Email</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>{profile?.email || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Monthly Income</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#16a34a' }}>{fmt(profile?.monthlyIncome)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Member Since</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Edit form card */}
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            Update Details
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSave}>
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
            <Input
              label="Monthly Income (₹)"
              name="monthlyIncome"
              type="number"
              value={formData.monthlyIncome}
              onChange={handleChange}
              hint="Used to calculate your balance on the dashboard."
              min="0"
              step="1"
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
                disabled={saving}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ marginTop: '1rem', borderColor: '#fecaca' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Sign Out
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            You will be logged out and redirected to the homepage.
          </p>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
