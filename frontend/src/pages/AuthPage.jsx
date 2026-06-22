import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function AuthPage() {
    const { login, register, signInWithGoogle } = useAuth();
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const googleRef = useRef(null);
    const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!googleClientId) return undefined;

        const renderGoogle = () => {
            if (!window.google?.accounts?.id || !googleRef.current) return;
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: async ({ credential }) => {
                    setError('');
                    setIsSubmitting(true);
                    try {
                        await signInWithGoogle(credential);
                    } catch (err) {
                        setError(getErrorMessage(err, 'Google sign-in failed'));
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            });
            googleRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleRef.current, {
                theme: 'outline', size: 'large', width: 360, text: 'continue_with'
            });
        };

        if (window.google?.accounts?.id) {
            renderGoogle();
            return undefined;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = renderGoogle;
        document.head.appendChild(script);
        return () => { script.onload = null; };
    }, [googleClientId, signInWithGoogle]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            if (mode === 'register') await register(form);
            else await login({ email: form.email, password: form.password });
        } catch (err) {
            setError(getErrorMessage(err, 'Unable to continue'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const switchMode = () => {
        setMode((current) => current === 'login' ? 'register' : 'login');
        setError('');
    };

    return (
        <main className="auth-page">
            <section className="auth-story" aria-label="TaskFlow introduction">
                <div className="auth-brand"><div className="brand-mark"><span /></div>TaskFlow</div>
                <div className="story-content">
                    <span className="eyebrow"><Icon name="spark" size={16} /> A calmer way to get things done</span>
                    <h1>Make room for<br /><em>what matters.</em></h1>
                    <p>Plan your day, focus on the next step, and watch small wins turn into meaningful progress.</p>
                    <div className="story-card">
                        <div className="story-check"><Icon name="check" size={18} /></div>
                        <div><strong>Prepare project proposal</strong><span>Work / Today at 4:00 PM</span></div>
                        <span className="priority-pill">High</span>
                    </div>
                </div>
                <p className="story-foot">Simple enough for today. Powerful enough for every day.</p>
            </section>

            <section className="auth-panel">
                <div className="auth-card">
                    <div className="mobile-brand"><div className="brand-mark"><span /></div>TaskFlow</div>
                    <span className="auth-kicker">{mode === 'login' ? 'Welcome back' : 'Start fresh'}</span>
                    <h2>{mode === 'login' ? 'Sign in to TaskFlow' : 'Create your account'}</h2>
                    <p>{mode === 'login' ? 'Your plans are right where you left them.' : 'A focused day starts with one small step.'}</p>

                    {googleClientId ? <div ref={googleRef} className="google-signin" /> : (
                        <div className="google-disabled" title="Add VITE_GOOGLE_CLIENT_ID to enable Google Sign-In">
                            <Icon name="google" size={19} /> Continue with Google <span>Setup required</span>
                        </div>
                    )}

                    <div className="auth-divider"><span>or continue with email</span></div>
                    {error && <div className="form-error" role="alert"><Icon name="alert" size={17} />{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        {mode === 'register' && (
                            <label>Full name
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Amit Kumar"
                                    autoComplete="name"
                                    required
                                />
                            </label>
                        )}
                        <label>Email address
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </label>
                        <label>Password
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
                                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                                minLength={8}
                                required
                            />
                        </label>
                        <button className="primary-button auth-submit" disabled={isSubmitting}>
                            {isSubmitting ? <span className="button-spinner" /> : <>{mode === 'login' ? 'Sign in' : 'Create account'}<Icon name="arrow" size={18} /></>}
                        </button>
                    </form>
                    <p className="auth-switch">
                        {mode === 'login' ? 'New to TaskFlow?' : 'Already have an account?'}
                        <button type="button" onClick={switchMode}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button>
                    </p>
                </div>
            </section>
        </main>
    );
}
