import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusinessContext } from '../context/BusinessContext'
import { storage, db, isFirebaseConfigured } from '../firebase'
import { ref as storageRef, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, runTransaction } from 'firebase/firestore'
import { EvidenceDoc, BusinessMember } from '../types'

export default function EvidenceLibrary() {
    const { selectedBusiness, currentUserId, canManageSelected } = useBusinessContext()
    const [loadingId, setLoadingId] = useState<string | null>(null)

    if (!selectedBusiness) {
        return (
            <div className="card card--padded">
                <p>Select a company to view its Evidence Library.</p>
            </div>
        )
    }
    const items = selectedBusiness.evidence ?? []
    const members = selectedBusiness.members ?? []

    async function handleDownload(item: any) {
        try {
            if (item.url) {
                window.open(item.url, '_blank')
                return
            }
            if (!item.path) return
            if (!isFirebaseConfigured || !storage) {
                // nothing we can do in demo mode
                return
            }
            const ref = storageRef(storage, item.path)
            const url = await getDownloadURL(ref)
            window.open(url, '_blank')
        } catch (err) {
            console.error('Failed to download evidence', err)
        }
    }

    async function handleRemove(item: any) {
        if (!selectedBusiness) return
        if (!currentUserId) return
        const isUploader = item.uploadedBy === currentUserId
        if (!isUploader && !canManageSelected) return

        setLoadingId(item.id)
        try {
            // delete storage object if present
            if (item.path && isFirebaseConfigured && storage) {
                try {
                    const objRef = storageRef(storage, item.path)
                    await deleteObject(objRef)
                } catch (err) {
                    console.warn('Failed to delete storage object (may not exist or permissions), continuing to remove metadata', err)
                }
            }

            if (!isFirebaseConfigured || !db) {
                // demo mode: remove from local state by updating Firestore is not available
                // Here we won't persist but the BusinessContext will not reflect change until reload.
                return
            }

            const businessRef = doc(db, 'businesses', selectedBusiness.id)
            await runTransaction(db, async (tx) => {
                const snap = await tx.get(businessRef)
                if (!snap.exists()) throw new Error('Business not found')
                const data = snap.data() as any
                const newEvidence = (data.evidence ?? []).filter((it: any) => it.id !== item.id)
                tx.update(businessRef, { evidence: newEvidence })
            })
        } catch (err) {
            console.error('Failed to remove evidence', err)
        } finally {
            setLoadingId(null)
        }
    }

    if (items.length === 0) {
        return (
            <div className="card card--padded">
                <h2 style={{ marginTop: 0 }}>Evidence Library</h2>
                <p style={{ color: 'var(--muted)' }}>No evidence uploaded yet for this company.</p>
            </div>
        )
    }

    return (
        <section className="card card--padded" style={{ padding: '1rem', display: 'grid', gap: 12 }}>

            <div className="toolbar">
                <h1 style={{ marginRight: 'auto' }}>Evidence Library</h1>
                <button className="chip">All families</button>
                <button className="chip">Compliance</button>
                <button className="chip">Type</button>
                <button className="btn" style={{ marginLeft: 'auto' }}>Reset filters</button>
            </div>
            

            <div className="table">
                <div className="table__head">
                    <div>Title</div>
                    <div>Timestamp</div>
                    <div>Category</div>
                    <div style={{ paddingRight: '150px' }}>Uploaded by</div>
                    <div style={{ textAlign: 'right', paddingRight: '30px'}}>Actions</div>
                    <div></div>
                </div>

                {items.map((item: EvidenceDoc) => {
                    const uploader = members.find((u: BusinessMember) => u.uid === item.uploadedBy)
                    const userName = uploader?.displayName ?? uploader?.email ?? item.uploadedBy ?? 'Unknown'

                    return (
                        <div className="table__row" key={item.id}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', display: 'inline-block' }}>
                                <div className="table__cell--title" style={{}}>{item.id?.split('_', 2)[1]}</div>
                            </div>
                            <div className="table__cell--sub">{item.uploadedAt}</div>
                            <div className="table__cell--sub">{item.path?.split('/', 2)[1]}</div>
                            <div className="table__cell--sub">{userName}</div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Link to={`/controls/${item.path?.split('/', 2)[1]}`} className="btn">›</Link>
                            </div>
                        </div>
                    )
                })}
                    
            </div>
        </section>
    )
}