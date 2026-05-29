'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Grainient from '@/components/Grainient';
import { BookOpen } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but sign in failed. Please login.');
        setLoading(false);
        return;
      }

      router.push('/colleges');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Shared field input style
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 16px',
    borderRadius: '12px',
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontStyle: 'italic',
    fontSize: '15px',
    outline: 'none',
    background: 'rgba(255,245,220,0.55)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(140,100,40,0.28)',
    color: '#3A2917',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontStyle: 'italic',
    fontSize: '12px',
    letterSpacing: '0.08em',
    color: '#8B653B',
    marginBottom: '7px',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(139,100,16,0.55)';
    e.target.style.boxShadow = '0 0 0 3px rgba(139,100,16,0.09)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(140,100,40,0.28)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '32px 16px',
      }}
    >
      {/* Layer 1 — WebGL Grainient fill */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Grainient
          color1="#c4a882"
          color2="#f0dfc0"
          color3="#3a2a1e"
          timeSpeed={0.12}
          warpStrength={0.9}
          warpFrequency={3.5}
          warpSpeed={1.2}
          grainAmount={0.055}
          contrast={1.3}
          saturation={0.8}
          zoom={0.88}
        />
        {/* Layer 2 — warm parchment overlay for legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(240,230,204,0.45)',
          }}
        />
      </div>
      {/* Layer 3 — grain texture overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}
      >
        {/* ── Auth card ── */}
        <div
          style={{
            background:
              'linear-gradient(145deg, rgba(255,253,245,0.92) 0%, rgba(250,242,230,0.88) 50%, rgba(245,237,228,0.84) 100%)',
            border: '1px solid rgba(140,100,40,0.22)',
            borderRadius: '24px',
            boxShadow:
              '0 4px 32px rgba(31,21,12,0.09), 0 1px 4px rgba(31,21,12,0.05), inset 0 1px 0 rgba(255,253,245,0.8)',
            padding: '40px 40px 36px',
            backdropFilter: 'blur(16px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Dark brown top bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #3A2917 0%, #543D23 40%, #8B653B 60%, #543D23 80%, #3A2917 100%)',
              borderRadius: '24px 24px 0 0',
            }}
          />

          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <BookOpen style={{ width: '20px', height: '20px', color: '#543D23' }} />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '18px',
                letterSpacing: '0.02em',
                color: '#3A2917',
              }}
            >
              CollegePathya
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontStyle: 'italic',
              fontSize: '2.4rem',
              letterSpacing: '-0.02em',
              color: '#3A2917',
              textAlign: 'center',
              marginBottom: '6px',
              lineHeight: 1.1,
            }}
          >
            Begin Here
          </h1>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: '1.05rem',
              color: '#8B653B',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            Every journey starts with a single step
          </p>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(139,100,16,0.3))',
              }}
            />
            <span style={{ color: '#543D23', fontSize: '11px', opacity: 0.6, fontStyle: 'italic' }}>◆</span>
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to left, transparent, rgba(139,100,16,0.3))',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: 'rgba(254,226,226,0.7)',
                border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '18px',
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '13px',
                color: '#b91c1c',
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            {/* Name */}
            <div>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                style={fieldStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={fieldStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  style={{ ...fieldStyle, paddingRight: '52px' }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    color: '#8B653B',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = '#3A2917')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#8B653B')
                  }
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  style={{ ...fieldStyle, paddingRight: '52px' }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    color: '#8B653B',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = '#3A2917')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#8B653B')
                  }
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '14px',
                letterSpacing: '0.08em',
                border: '1px solid rgba(140,100,40,0.28)',
                background: 'rgba(255,245,220,0.45)',
                backdropFilter: 'blur(12px)',
                color: '#3A2917',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.25s',
                marginTop: '4px',
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <motion.div
                    style={{
                      width: '13px',
                      height: '13px',
                      borderRadius: '50%',
                      border: '2px solid rgba(58,41,23,0.2)',
                      borderTopColor: '#3A2917',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Divider + Google */}
          <div style={{ marginTop: '22px' }}>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '1px',
                    background: 'rgba(140,100,40,0.15)',
                  }}
                />
              </div>
              <div
                style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
              >
                <span
                  style={{
                    background: 'rgba(250,242,230,0.95)',
                    padding: '0 12px',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    color: '#8B653B',
                  }}
                >
                  or continue with
                </span>
              </div>
            </div>

            <button
              onClick={() => signIn('google', { callbackUrl: '/colleges' })}
              style={{
                width: '100%',
                padding: '11px 24px',
                borderRadius: '12px',
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '13px',
                letterSpacing: '0.08em',
                background: 'rgba(255,245,220,0.45)',
                border: '1px solid rgba(140,100,40,0.22)',
                color: '#8B653B',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,100,16,0.45)';
                e.currentTarget.style.color = '#3A2917';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(140,100,40,0.22)';
                e.currentTarget.style.color = '#8B653B';
              }}
            >
              Google
            </button>
          </div>

          <p
            style={{
              textAlign: 'center',
              marginTop: '22px',
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontStyle: 'italic',
              fontSize: '14px',
              color: '#8B653B',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/login"
              style={{ color: '#543D23', textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = '0.7')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = '1')}
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}