import { onAuthStateChanged, signOut, type Auth, type User } from 'firebase/auth'
import { auth as firebaseAuth, isFirebaseConfigured } from '../firebase'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface IAuthRouteProps {
    children?: React.ReactNode;
    onAuthSuccess?: () => void;
}

const authInstance = firebaseAuth
const firebaseEnabled = Boolean(isFirebaseConfigured && authInstance)
export const AUTH_COMPLETE_KEY = 'chiron:authComplete'
export const AUTH_CHANGE_EVENT = 'chiron-auth-change'

function dispatchAuthChange() {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export function setAuthCompleteFlag() {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(AUTH_COMPLETE_KEY, 'true')
    dispatchAuthChange()
}

export function clearAuthCompleteFlag() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(AUTH_COMPLETE_KEY)
    dispatchAuthChange()
}

const AuthRoute: React.FC<IAuthRouteProps> = ({ children, onAuthSuccess }) => {
    const shouldBypass = useMemo(() => !firebaseEnabled || !authInstance, [])

    useEffect(() => {
        if (shouldBypass) {
            onAuthSuccess?.()
        }
    }, [shouldBypass, onAuthSuccess])

    if (shouldBypass || !authInstance) {
        return <>{children}</>
    }

    const user = useAuthState(authInstance)

    if (!user) {
        return <p>loading...</p>
    }
    
    return <>{children}</>
}

function useAuthState(auth: Auth) {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
            if (nextUser) {
                setUser(nextUser)
            } else {
                setUser(null)
                navigate('/login')
            }
        })
        return unsubscribe
    }, [auth, navigate])

    return user
}

export function logout() {
    if (!authInstance) {
        clearAuthCompleteFlag()
        window.location.href = '/login'
        return
    }

    signOut(authInstance).then(() => {
        clearAuthCompleteFlag()
        window.location.href = '/login'
    }).catch((error) => {
        console.error('Error signing out:', error)
    })
}

export function getCurrentUserID() {
    return authInstance?.currentUser?.uid
}
export function getCurrentUserDisplayName() {
    return authInstance?.currentUser?.displayName
}

export default AuthRoute
