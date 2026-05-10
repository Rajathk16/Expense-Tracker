'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../../../components/Input';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', monthlyIncome: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    if (!formData.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email.';
    if (!formData.password) errs.password = 'Password is required.';
    else if (formData.password.length < 6) errs.password = 'Minimum 6 characters.';
    if (formData.monthlyIncome && Number(formData.monthlyIncome) < 0) errs.monthlyIncome = 'Must be 0 or greater.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          monthlyIncome: Number(formData.monthlyIncome) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.message || 'Unable to create account.');
      } else {
        localStorage.setItem('user', JSON.stringify(data));
        router.push('/dashboard');
      }
    } catch {
      setApiError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827' }}>SpendSmart</span>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>Create account</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Fill in the details below to get started</p>
        </div>

        {/* Form card */}
        <div className="card">
          {apiError && <div className="alert alert-error">{apiError}</div>}

          <form onSubmit={handleSubmit}>
            <Input label="Full Name" name="name" placeholder="Arjun Sharma"
              value={formData.name} onChange={handleChange} error={errors.name} required />
            <Input label="Email" type="email" name="email" placeholder="you@example.com"
              value={formData.email} onChange={handleChange} error={errors.email} required />
            <Input label="Password" type="password" name="password" placeholder="Min. 6 characters"
              value={formData.password} onChange={handleChange} error={errors.password} required />
            <Input
              label="Monthly Income (₹)"
              type="number"
              name="monthlyIncome"
              placeholder="e.g. 50000"
              value={formData.monthlyIncome}
              onChange={handleChange}
              error={errors.monthlyIncome}
              hint="Optional — used to calculate your balance."
              min="0"
              step="1"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ marginTop: '0.25rem' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              style={{ color: '#2563eb', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}