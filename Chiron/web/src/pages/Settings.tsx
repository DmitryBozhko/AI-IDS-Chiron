import { useEffect, useState, type FC } from 'react'
import { auth, db, isFirebaseConfigured } from '../firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'

type SettingsSection = 'user' | 'password' | 'mfa' | 'support'

type IconProps = { className?: string }
type IconComponent = FC<IconProps>

function GlyphIcon({ glyph, className }: { glyph: string; className?: string }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.25em', fontSize: '1.1em' }}
    >
      {glyph}
    </span>
  )
}

const UserIcon: IconComponent = ({ className }) => <GlyphIcon glyph="👤" className={className} />
const LockIcon: IconComponent = ({ className }) => <GlyphIcon glyph="🔒" className={className} />
const ShieldIcon: IconComponent = ({ className }) => <GlyphIcon glyph="🛡️" className={className} />
const HelpIcon: IconComponent = ({ className }) => <GlyphIcon glyph="❓" className={className} />
const EyeIcon: IconComponent = ({ className }) => <GlyphIcon glyph="👁" className={className} />
const EyeOffIcon: IconComponent = ({ className }) => <GlyphIcon glyph="🙈" className={className} />
const SaveIcon: IconComponent = ({ className }) => <GlyphIcon glyph="💾" className={className} />

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('user')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)

  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return
    const u = auth.currentUser
    if (!u) return

    
    setEmail(u.email ?? '')
    setFullName(u.displayName ?? '')

    
    if (!db) return
    ;(async () => {
      const ref = doc(db, 'users', u.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data() as { fullName?: string; email?: string }
        if (data.fullName) setFullName(data.fullName)
        if (data.email) setEmail(data.email)
      }
    })().catch(() => {})
  }, [])

  const handleSaveAccount = async () => {
    setSaving(true)
    setSaveMsg(null)
    setSaveErr(null)
    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('Firebase isn’t configured in this environment. Changes won’t persist.')
      }
      const u = auth.currentUser
      if (!u) throw new Error('You must be signed in to save changes.')

      // Update display name
      if (fullName && fullName !== (u.displayName ?? '')) {
        await updateProfile(u, { displayName: fullName })
      }

      
      if (email && email !== (u.email ?? '')) {
        try {
          await updateEmail(u, email)
        } catch (err: any) {
          if (err?.code === 'auth/requires-recent-login') {
            const pw = window.prompt('Re-enter your password to change email:')
            if (!pw) throw new Error('Email change cancelled.')
            const cred = EmailAuthProvider.credential(u.email!, pw)
            await reauthenticateWithCredential(u, cred)
            await updateEmail(u, email)
          } else {
            throw err
          }
        }
      }

      
      if (db) {
        await setDoc(
          doc(db, 'users', u.uid),
          { fullName, email, updatedAt: serverTimestamp() },
          { merge: true }
        )
      }

      setSaveMsg('✅ Profile saved!')
      setTimeout(() => setSaveMsg(null), 3000)
    } catch (e: any) {
      setSaveErr(e?.message ?? 'Failed to save changes.')
      setTimeout(() => setSaveErr(null), 4000)
    } finally {
      setSaving(false)
    }
  }

  const navigationItems: { id: SettingsSection; label: string; icon: IconComponent }[] = [
    { id: 'user', label: 'Account', icon: UserIcon },
    { id: 'password', label: 'Change Password', icon: LockIcon },
    { id: 'mfa', label: 'Multi-Factor Authentication', icon: ShieldIcon },
    { id: 'support', label: 'Support', icon: HelpIcon },
  ]

  const renderUserSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>

      {!isFirebaseConfigured && (
        <div className="rounded-md border border-yellow-600 bg-yellow-900/20 p-3 text-yellow-300 text-sm">
          Firebase isn’t configured in this environment. Changes won’t persist.
        </div>
      )}

      {saveMsg && (
        <div className="rounded-md border border-green-700 bg-green-900/20 p-3 text-green-300 text-sm">
          {saveMsg}
        </div>
      )}
      {saveErr && (
        <div className="rounded-md border border-red-700 bg-red-900/20 p-3 text-red-300 text-sm">
          {saveErr}
        </div>
      )}

      <div className="bg-neutral-800 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-300 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleSaveAccount}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-white ${
            saving ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <SaveIcon className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )

  const renderPasswordSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
      <div className="bg-neutral-800 rounded-lg p-6 space-y-4">
        <div>
          <label 
            htmlFor="currentPassword"
            className="block text-sm font-medium text-neutral-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-10 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              aria-label="Toggle Current Password Visibility"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
            >
              {showCurrentPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            id="pw-current"
            type={showCurrentPassword ? 'text' : 'password'}
            className="w-full px-3 py-2 pr-10 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            aria-label="Toggle Current Password Visibility"
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
          >
            {showCurrentPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>

        <div>
          <label 
            htmlFor="newPassword" 
            className="block text-sm font-medium text-neutral-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword" 
              type={showNewPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-10 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
            >
              {showNewPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
          <LockIcon className="w-4 h-4" />
          Update Password
        </button>
      </div>
    </div>
  )

  const renderMfaSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Multi-Factor Authentication</h3>
      <div className="bg-neutral-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Enable MFA:</p>
            <p className="text-sm text-neutral-400">Add an extra layer of security to your account.</p>
          </div>
          <button
            type="button"
            onClick={() => setMfaEnabled(!mfaEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              mfaEnabled ? 'bg-green-600' : 'bg-neutral-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                mfaEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {mfaEnabled && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm">MFA is enabled!</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderSupportSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Support</h3>
      <div className="bg-neutral-800 rounded-lg p-6 space-y-4">
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors">
            <span className="text-white">Contact Support</span>
            <span className="text-neutral-400">support@example.com</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'user':
        return renderUserSettings()
      case 'password':
        return renderPasswordSettings()
      case 'mfa':
        return renderMfaSettings()
      case 'support':
        return renderSupportSettings()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex">
      <aside className="w-64 bg-neutral-800 border-r border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <div className="max-w-2xl">{renderContent()}</div>
      </main>
    </div>
  )
}