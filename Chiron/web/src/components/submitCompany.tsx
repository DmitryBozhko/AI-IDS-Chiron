import { Business, BusinessInvite, Certificates } from '../types'
import React, { useState, KeyboardEvent } from 'react'
import { db } from '../firebase'
import { setDoc, doc } from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { useBusinessContext } from '../context/BusinessContext'
import { getCurrentUserDisplayName } from '../context/AuthRoute'
import './submitCompany.css'

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

interface SubmitCompanyProps {
    business: Business;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export default function SubmitCompany({ business, onSuccess, onError }: SubmitCompanyProps) {
    const { currentUserId } = useBusinessContext()
    const currentUserName = getCurrentUserDisplayName()
    const [companyData, setCompanyData] = useState<Business>({
        ...business,
        id: business.id || nanoid(),
    })
    const [selectedCertificates, setSelectedCertificates] = useState<string[]>(companyData.certificates || [])
    const [emailInput, setEmailInput] = useState<string>('')
    const [selectedRole, setSelectedRole] = useState<'owner' | 'editor' | 'viewer'>('viewer')
    const [invites, setInvites] = useState<BusinessInvite[]>(
        business.invites?.map(inv => ({
            email: inv.email,
            role: inv.role,
            invitedAt: inv.invitedAt,
            status: inv.status,
            invitedBy: inv.invitedBy,
        })) || [],
    )
    const [emailError, setEmailError] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string>('')
    const formattedDate = new Date().toISOString()

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextName = e.target.value
        setCompanyData(prev => ({ ...prev, name: nextName }))
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCompanyData(prev => ({ ...prev, description: e.target.value }))
    }

    const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addEmail()
        }
    }

    const toggleCertificate = (cert: string) => {
        setSelectedCertificates(prev => (
            prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
        ))
    }

    const addEmail = () => {
        const trimmedEmail = emailInput.trim()
        if (!trimmedEmail) return
        if (!isValidEmail(trimmedEmail)) {
            setEmailError('Please enter a valid email address')
            return
        }
        if (invites.some(inv => inv.email === trimmedEmail)) {
            setEmailError('This email is already added')
            return
        }
        const newInvite: BusinessInvite = {
            email: trimmedEmail,
            role: selectedRole,
            status: 'pending',
            invitedAt: formattedDate,
            invitedBy: currentUserId ?? undefined,
        }
        setInvites(prev => [...prev, newInvite])
        setEmailInput('')
        setEmailError('')
    }

    const removeEmail = (emailToRemove: string) => {
        setInvites(prev => prev.filter(inv => inv.email !== emailToRemove))
    }

    const handleRoleChange = (role: BusinessInvite['role'], email: string) => {
        setInvites(prev => prev.map(inv => inv.email === email ? { ...inv, role } : inv))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!db) {
            const error = new Error('Database not initialized')
            setSubmitError(error.message)
            onError?.(error)
            return
        }
        if (!currentUserId) {
            const error = new Error('You must be signed in to create a company')
            setSubmitError(error.message)
            onError?.(error)
            return
        }
        if (!companyData.name?.trim()) {
            const error = new Error('Company name is required')
            setSubmitError(error.message)
            onError?.(error)
            return
        }

        setIsSubmitting(true)
        setSubmitError('')

        try {
            const invitesToSave: BusinessInvite[] = invites.map(inv => ({
                email: inv.email,
                role: inv.role,
                status: inv.status || 'pending',
                invitedAt: inv.invitedAt || formattedDate,
                invitedBy: inv.invitedBy ?? currentUserId ?? undefined,
            }))

            const ownerMember = currentUserId
                ? {
                    uid: currentUserId,
                    role: 'owner' as const,
                    displayName: currentUserName ?? 'Workspace owner',
                }
                : null

            const existingMembers = Array.isArray(companyData.members) ? companyData.members : []
            const membersToSave = ownerMember
                ? (() => {
                    const already = existingMembers.find(member => member.uid === ownerMember.uid)
                    if (already) {
                        return existingMembers.map(member =>
                            member.uid === ownerMember.uid
                                ? { ...member, role: 'owner', displayName: member.displayName ?? ownerMember.displayName }
                                : member,
                        )
                    }
                    return [...existingMembers, ownerMember]
                })()
                : existingMembers

            const businessData = {
                controlState: [],
                createdAt: formattedDate,
                description: companyData.description ?? '',
                evidence: [],
                invites: invitesToSave,
                certificates: selectedCertificates,
                members: membersToSave,
                name: companyData.name,
                poams: [],
                updatedAt: formattedDate,
            }

            await setDoc(doc(db, 'businesses', companyData.id), businessData)
            onSuccess?.()
        } catch (err) {
            console.error('Error adding document: ', err)
            const error = err instanceof Error ? err : new Error('Failed to create company')
            setSubmitError(error.message)
            onError?.(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form id='create-company-form' className="create-company-form" onSubmit={handleSubmit}>
            <div className="create-company-card">
                <div className="create-company-field">
                    <label htmlFor="companyName">Company name</label>
                    <input
                        id="companyName"
                        className="create-company-input"
                        type="text"
                        name="companyName"
                        placeholder="Company name"
                        value={companyData.name}
                        onChange={handleNameChange}
                        required
                    />
                </div>
                <div className="create-company-field">
                    <label htmlFor="companyDescription">Description</label>
                    <textarea
                        id="companyDescription"
                        className="create-company-textarea"
                        placeholder="Give teammates context about this workspace (optional)"
                        value={companyData.description || ''}
                        onChange={handleDescriptionChange}
                    />
                </div>
            </div>

            <div className="create-company-card">
                <header>
                    <h3>Invite teammates</h3>
                    <p>You are automatically listed as the owner. Add teammates now or later from settings.</p>
                </header>

                <div className="invite-row">
                    <input
                        className="create-company-input"
                        type="text"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={handleEmailKeyDown}
                        placeholder="Add members by email"
                    />
                    <select
                        className="create-company-select"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as BusinessInvite['role'])}
                        aria-label="Role for new invite"
                    >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="owner">Owner</option>
                    </select>
                    <button type="button" className="primary-btn" onClick={addEmail}>
                        Add
                    </button>
                </div>

                {emailError && <div className="field-error">{emailError}</div>}

                <div className="invite-chip-grid">
                    {invites.map(inv => (
                        <div key={inv.email} className="invite-chip">
                            <span>{inv.email}</span>
                            <select
                                value={inv.role}
                                onChange={(e) => handleRoleChange(e.target.value as BusinessInvite['role'], inv.email)}
                                aria-label={`Role for ${inv.email}`}
                            >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="owner">Owner</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => removeEmail(inv.email)}
                                aria-label={`Remove ${inv.email}`}
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="create-company-card">
                <header>
                    <h3>Compliance focus</h3>
                    <p>Highlight frameworks you plan to track. This can be updated later.</p>
                </header>
                <div className="certification-grid">
                    {Certificates.map(cert => (
                        <button
                            key={cert}
                            type="button"
                            className={`certification-pill ${selectedCertificates.includes(cert) ? 'is-selected' : ''}`}
                            onClick={() => toggleCertificate(cert)}
                            aria-pressed={selectedCertificates.includes(cert)}
                        >
                            {cert}
                        </button>
                    ))}
                </div>
                {!selectedCertificates.length && (
                    <span className="helper-text">Optional but helpful for organizing evidence.</span>
                )}
            </div>

            <footer className="create-company-footer">
                {submitError && <div className="field-error">{submitError}</div>}
                <button type="submit" className="primary-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create company'}
                </button>
            </footer>
        </form>
    )
}
