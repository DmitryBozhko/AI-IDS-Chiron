import React, { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, isFirebaseConfigured, provider } from '../firebase'
import GoogleButton from 'react-google-button'
import { useNavigate } from 'react-router-dom'
import { setAuthCompleteFlag } from '../context/AuthRoute'
import { STORAGE_DEMO_USER } from '../constants/storage'

const ACCOUNTS_KEY = 'chiron:localAccounts'

function loadAccounts(): Record<string, string> {
    if (typeof window === 'undefined') return {}
    try {
        const raw = window.localStorage.getItem(ACCOUNTS_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

function saveAccounts(next: Record<string, string>) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next))
}

function saveLocalUserId(uid: string) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_DEMO_USER, uid)
}

export interface ILoginProps {
    onLoginSuccess?: () => void;
    errorMessage?: string;
}

const LoginPage: React.FunctionComponent<ILoginProps> = () => {
    const navigate = useNavigate()
    const [authing, setAuthing]= useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [formError, setFormError] = useState<string | null>(null)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [creatingAccount, setCreatingAccount] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const firebaseReady = Boolean(isFirebaseConfigured && auth && provider)

    const completeLogin = () => {
        setAuthCompleteFlag()
        setFormError(null)
        navigate('/')
    }

    const handleLocalLogin = (event: React.FormEvent) => {
        event.preventDefault()
        if (!username.trim() || !password.trim()) {
            setFormError('Enter both a username and password to continue.')
            setSuccessMessage(null)
            return
        }

        const normalized = username.trim().toLowerCase()
        const nextAccounts = loadAccounts()
        if (nextAccounts[normalized] && nextAccounts[normalized] === password) {
            saveLocalUserId(normalized)
            completeLogin()
            return
        }
        setFormError('Account not found or password incorrect.')
        setSuccessMessage(null)
    }

    const handleCreateAccount = (event: React.FormEvent) => {
        event.preventDefault()
        if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
            setFormError('Fill out username and both password fields.')
            setSuccessMessage(null)
            return
        }
        if (password !== confirmPassword) {
            setFormError('Passwords do not match.')
            setSuccessMessage(null)
            return
        }

        const normalized = username.trim().toLowerCase()
        const existing = loadAccounts()
        if (existing[normalized]) {
            setFormError('That username already exists. Please sign in instead.')
            setSuccessMessage(null)
            return
        }

        const nextAccounts = { ...existing, [normalized]: password }
        saveAccounts(nextAccounts)
        setSuccessMessage('Account created! You can sign in now.')
        setFormError(null)
        setCreatingAccount(false)
    }

    const signInWithGoogle = async () => {
        if (!firebaseReady || !auth || !provider) {
        saveLocalUserId('google-user')
        completeLogin();
        return;
        }

        setAuthing(true);


        setAuthing(true);
        const result= await signInWithPopup(auth, provider).then((result) => {
            if (result.user?.uid) {
                saveLocalUserId(result.user.uid)
            }
            completeLogin();
            return result;
        }).catch((error) => {
            setAuthing(false);
        })
            
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1d1f2c 0%, #0f172a 100%)',
                padding: '1rem',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 420,
                    background: '#fff',
                    borderRadius: 16,
                    padding: '2.5rem',
                    boxShadow: '0 25px 65px rgba(15,23,42,0.25)',
                    display: 'grid',
                    gap: '1.5rem',
                }}
            >
                <header style={{ textAlign: 'center', display: 'grid', gap: '0.35rem' }}>
                    <img src="/ChironLogo-removebg.png" alt="Chiron logo" style={{ width: 72, justifySelf: 'center' }} />
                    <p style={{ textTransform: 'uppercase', fontSize: '.75rem', letterSpacing: '.15em', color: '#2563eb', margin: 0 }}>Welcome to</p>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>Chiron</h1>
                    <p style={{ margin: 0, color: '#64748b' }}>Sign in to start answering controls.</p>
                </header>

                <form onSubmit={creatingAccount ? handleCreateAccount : handleLocalLogin} style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600 }}>
                        Username
                        <input
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="you@example.com"
                            style={{
                                fontSize: '1rem',
                                padding: '0.65rem 0.85rem',
                                borderRadius: 8,
                                border: '1px solid #cbd5f5',
                            }}
                        />
                    </label>
                    <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600 }}>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            style={{
                                fontSize: '1rem',
                                padding: '0.65rem 0.85rem',
                                borderRadius: 8,
                                border: '1px solid #cbd5f5',
                            }}
                        />
                    </label>
                    {creatingAccount && (
                        <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600 }}>
                            Confirm password
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Confirm your password"
                                style={{
                                    fontSize: '1rem',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: 8,
                                    border: '1px solid #cbd5f5',
                                }}
                            />
                        </label>
                    )}
                    {formError && (
                        <div style={{ color: '#b91c1c', fontSize: '.9rem' }}>{formError}</div>
                    )}
                    {successMessage && (
                        <div style={{ color: '#0f766e', fontSize: '.9rem', background: '#ccfbf1', padding: '0.75rem 1rem', borderRadius: 8 }}>
                            {successMessage}
                        </div>
                    )}
                    <button
                        type="submit"
                        style={{
                            padding: '0.75rem 1rem',
                            background: '#2563eb',
                            color: '#fff',
                            borderRadius: 8,
                            border: 'none',
                            fontSize: '1rem',
                            cursor: 'pointer',
                        }}
                    >
                        {creatingAccount ? 'Create account' : 'Continue'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setCreatingAccount(prev => !prev)
                            setFormError(null)
                            setSuccessMessage(null)
                        }}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#2563eb',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {creatingAccount ? 'Already have an account? Sign in' : 'Need an account? Create one'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '.85rem' }}>or</div>

                <GoogleButton
                    onClick={() => signInWithGoogle()}
                    disabled={firebaseReady ? authing : false}
                    data-testid="google-login-button"
                />

                {!firebaseReady && (
                    <div style={{ color: '#b45309', fontSize: '.9rem', background: '#fef3c7', padding: '0.75rem 1rem', borderRadius: 8 }}>
                        Firebase is not configured. Username + password will sign you in locally.
                    </div>
                )}
            </div>
        </div>
    )
}

export default LoginPage;
