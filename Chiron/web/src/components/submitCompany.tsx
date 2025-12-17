import { Business, BusinessInvite, Certificates } from '../types'
import React, { useState, KeyboardEvent } from 'react'
import { db } from '../firebase'
import { setDoc, doc } from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { useBusinessContext } from '../context/BusinessContext'
import { getCurrentUserDisplayName } from '../context/AuthRoute'

// Email validation helper
const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


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
        id: business.id || nanoid() // Generate unique ID if not provided
    });
    const [companyName, setCompanyName] = useState<string>(business.name || '');
    const [selectedCertificates, setSelectedCertificates] = useState<string[]>(companyData.certificates || []);
    const [emailInput, setEmailInput] = useState<string>('');
    // Default role selector for newly added invites
    const [selectedRole, setSelectedRole] = useState<'owner' | 'editor' | 'viewer'>('viewer');
    // Keep invites as full objects so we track role per-invite
    const [invites, setInvites] = useState<BusinessInvite[]>(
        business.invites?.map(inv => ({
            email: inv.email,
            role: inv.role,
            invitedAt: inv.invitedAt,
            status: inv.status,
            invitedBy: inv.invitedBy,
        })) || []
    );
    const [emailError, setEmailError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCompanyName(e.target.value);
        setCompanyData(prev => ({ ...prev, name: e.target.value }));
    };

    const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addEmail();
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCompanyData(prev => ({ ...prev, description: e.target.value }));
    };

    const toggleCertificate = (cert: string) => {
        setSelectedCertificates(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);
    };

    const addEmail = () => {
        const trimmedEmail = emailInput.trim();
        if (!trimmedEmail) return;
        if (!isValidEmail(trimmedEmail)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        if (invites.some(inv => inv.email === trimmedEmail)) {
            setEmailError('This email is already added');
            return;
        }

        const newInvite: BusinessInvite = {
            email: trimmedEmail,
            role: selectedRole,
            status: 'pending',
            invitedAt: formattedDate,
            invitedBy: currentUserId ?? undefined,
        };
        setInvites(prev => [...prev, newInvite]);
        setEmailInput('');
        setEmailError('');
    };

    const removeEmail = (emailToRemove: string) => {
        setInvites(prev => prev.filter(inv => inv.email !== emailToRemove));
    };

    // Change role for a specific invite
    const handleRoleChange = (role: BusinessInvite['role'], email: string) => {
        setInvites(prev => prev.map(inv => inv.email === email ? { ...inv, role } : inv));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!db) {
            const error = new Error("Database not initialized");
            setSubmitError(error.message);
            onError?.(error);
            return;
        }

        if (!currentUserId) {
            const error = new Error("You must be signed in to create a company");
            setSubmitError(error.message);
            onError?.(error);
            return;
        }

        if (!companyData.name.trim()) {
            const error = new Error("Company name is required");
            setSubmitError(error.message);
            onError?.(error);
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Use the invites state (ensure invitedAt/status are set)
            const invitesToSave: BusinessInvite[] = invites.map(inv => ({
                email: inv.email,
                role: inv.role,
                status: inv.status || 'pending',
                invitedAt: inv.invitedAt || formattedDate,
                invitedBy: inv.invitedBy ?? currentUserId ?? undefined,
            }));

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
                                : member
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
                updatedAt: formattedDate
            };

            await setDoc(doc(db, "businesses", companyData.id), businessData);
            onSuccess?.();
        } catch (err) {
            console.error("Error adding document: ", err);
            const error = err instanceof Error ? err : new Error('Failed to create company');
            setSubmitError(error.message);
            onError?.(error);
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
    <form id='create-company-form' onSubmit={handleSubmit}>
        <input
            type="text"
            name="companyName"
            placeholder="Company name"
            value={companyData.name}
            onChange={handleNameChange}
            required
        />
        <br />
        <textarea
            placeholder="Company description (optional)"
            value={companyData.description || ''}
            onChange={handleDescriptionChange}
            style={{ width: '100%', height: '100px' }}
        />
        <br />
        <div style={{ marginBottom: '1rem' }}>
            <p style={{ display: 'block', marginBottom: '0.5rem' }}>Invite teammates by email. You are automatically listed as the company owner.</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    placeholder="Add members by email (press Enter or comma to add)"
                    style={{ flex: 1, padding: '0.5rem' }}
                />
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as BusinessInvite['role'])}
                    aria-label="Role for new invite"
                    style={{ padding: '0.45rem' }}
                >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                </select>
                <button type="button" onClick={addEmail} style={{ padding: '0.45rem 0.75rem' }}>Add</button>
            </div>

            {emailError && <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.5rem' }}>{emailError}</div>}

            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem', 
                marginTop: '0.5rem' 
            }}>
                {invites.map((inv, index) => (
                    <div
                        key={inv.email}
                        style={{
                            backgroundColor: '#3279e4ff',
                            borderRadius: '16px',
                            padding: '0.25rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>{inv.email}</span>
                        <select
                            value={inv.role}
                            onChange={(e) => handleRoleChange(e.target.value as BusinessInvite['role'], inv.email)}
                            aria-label={`Role for ${inv.email}`}
                            style={{ padding: '0.25rem' }}
                        >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="owner">Owner</option>
                        </select>

                        <button
                            type="button"
                            onClick={() => removeEmail(inv.email)}
                            style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: '0',
                                fontSize: '1.2rem',
                                lineHeight: '1',
                                color: '#666'
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
        <h3 > Certifications </h3><br />
        <div id = "certificatesList" >
            <div style={ { display: 'grid', gap: '1rem' } }>
                { Certificates.map((cert) => (        /* ls of certs must be changed to be dynamicly fetched from db*/
                    <label key={cert} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            id={cert}
                            type="checkbox"
                            value={cert}
                            checked={selectedCertificates.includes(cert)}
                            onChange={() => toggleCertificate(cert)}
                        />
                        {cert}
                    </label>
                ))}
                <br />
            </div>
        </div>
        <footer>
            {submitError && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    {submitError}
                </div>
            )}
            <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: isSubmitting ? '#ccc' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
            >
                {isSubmitting ? 'Creating...' : 'Create company'}
            </button>
        </footer>
    </form>
    )
}
