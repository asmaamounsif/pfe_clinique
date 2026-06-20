import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const schema = z.object({
  email:    z.string().min(1, "Email obligatoire").email("Format invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd]   = useState(false);
  const [apiErr, setApiErr]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setApiErr(null); setLoading(true);
    const res = await login(data.email, data.password);
    if (res.success) navigate('/', { replace: true });
    else { setApiErr(res.message || 'Identifiants invalides'); setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EEF2F7' }}>

      {/* Left panel */}
      <div style={{
        width: 480, flexShrink: 0, background: '#0F2744',
        display: 'flex', flexDirection: 'column', padding: '48px 52px',
        position: 'relative', overflow: 'hidden',
      }} className="hidden lg:flex lg:flex-col">

        {/* Grid pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} aria-hidden>
          <defs>
            <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>

        {/* Accent circle */}
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: '#0EA5E9', opacity: 0.06 }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <div style={{ color: '#F0F6FF', fontSize: 16, fontWeight: 600, letterSpacing: '0.01em' }}>Clinique Mounsif</div>
            <div style={{ color: '#3B7BC4', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Casablanca</div>
          </div>
        </div>

        {/* Main copy */}
        <div style={{ marginTop: 'auto', marginBottom: 'auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0EA5E9', marginBottom: 16 }}>
            Système d'information clinique
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 600, color: '#F0F6FF', lineHeight: 1.3, margin: '0 0 16px' }}>
            Gestion sécurisée<br />des dossiers patients
          </h2>
          <p style={{ color: '#7AAED9', fontSize: 14, lineHeight: 1.7, margin: '0 0 36px', maxWidth: 340 }}>
            Accès centralisé au dossier clinique partagé pour le personnel médical, administratif et les patients.
          </p>

          {/* Feature list */}
          {[
            ['Authentification par rôle (RBAC)', '#0EA5E9'],
            ['Chiffrement AES-256 des données', '#34D399'],
            ['Journal d\'audit complet (RGPD)', '#A78BFA'],
          ].map(([text, color]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#BDD6EC' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ fontSize: 11, color: '#3E5E7A', position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} Clinique Mounsif — Tous droits réservés
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1C2B3A', margin: '0 0 6px' }}>Connexion</h1>
            <p style={{ fontSize: 13.5, color: '#8FA3B8', margin: 0 }}>Renseignez vos identifiants d'accès</p>
          </div>

          {/* Error */}
          {apiErr && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderLeft: '3px solid #EF4444', borderRadius: 8,
              padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#B91C1C'
            }}>
              <svg width={16} height={16} style={{ marginTop: 1, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {apiErr}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A6077', marginBottom: 6 }}>
                Adresse email
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="nom@clinique.ma"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px', fontSize: 14,
                  border: `1px solid ${errors.email ? '#FCA5A5' : '#D1DCEA'}`,
                  borderRadius: 8, background: '#fff', color: '#1C2B3A',
                  outline: 'none',
                }}
              />
              {errors.email && <p style={{ marginTop: 5, fontSize: 11.5, color: '#EF4444' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 26 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A6077', marginBottom: 6 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 42px 10px 14px', fontSize: 14,
                    border: `1px solid ${errors.password ? '#FCA5A5' : '#D1DCEA'}`,
                    borderRadius: 8, background: '#fff', color: '#1C2B3A',
                    outline: 'none',
                  }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8FA3B8', padding: 0 }}>
                  <svg width={17} height={17} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    {showPwd
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                    }
                  </svg>
                </button>
              </div>
              {errors.password && <p style={{ marginTop: 5, fontSize: 11.5, color: '#EF4444' }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 8,
                background: loading ? '#5B8DB8' : '#0F2744',
                color: '#fff', fontSize: 14, fontWeight: 600,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = '#1A3A63')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = '#0F2744')}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
                  </svg>
                  Connexion en cours…
                </>
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Hint */}
          <div style={{ marginTop: 28, padding: '14px 16px', background: '#F8FAFD', border: '1px solid #E4EAF2', borderRadius: 8 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8FA3B8' }}>
              Comptes de démonstration
            </p>
            {[
              ['Directeur', 'admin@example.com'],
              ['Médecin', 'medecin@example.com'],
              ['Secrétaire', 'secretaire@example.com'],
              ['Infirmier', 'infirmier@example.com'],
              ['Patient', 'patient@example.com']
            ].map(([role, email]) => (
              <div key={role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4A6077', marginTop: 5 }}>
                <span style={{ fontWeight: 500 }}>{role}</span>
                <span style={{ fontFamily: 'DM Mono, monospace', color: '#8FA3B8' }}>{email}</span>
              </div>
            ))}
            <p style={{ margin: '8px 0 0', fontSize: 11, color: '#8FA3B8' }}>Mot de passe : <code style={{ fontFamily: 'DM Mono, monospace' }}>password</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
