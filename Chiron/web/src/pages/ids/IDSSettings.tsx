//Both Chiron and Ai-IDS settings are in UnifiedSettings.tsx this is no longer relevant

// import React, { useEffect, useState } from 'react'
// import { idsSettings, idsUpdateSettings } from '../../services/idsApi'

// const IDSSettings: React.FC = () => {
//   const [settings, setSettings] = useState<any>({})
//   const [loading, setLoading] = useState(false)
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState(false)
//   const loadSettings = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       const data = await idsSettings()
//       setSettings(data || {})
//     } catch (e: any) {
//       setError(e?.error || e?.message || 'Failed to load settings')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSave = async () => {
//     try {
//       setSaving(true)
//       setError(null)
//       setSuccess(false)
//       await idsUpdateSettings(settings)
//       setSuccess(true)
//       setTimeout(() => setSuccess(false), 3000)
//     } catch (e: any) {
//       setError(e?.error || e?.message || 'Failed to save settings')
//     } finally {
//       setSaving(false)
//     }
//   }

//   useEffect(() => {
//     loadSettings()
//   }, [])

//   const handleChange = (key: string, value: any) => {
//     setSettings((prev: any) => ({ ...prev, [key]: value }))
//   }

//   if (loading) {
//     return (
//       <div style={{ padding: '2rem' }}>
//         <h1>IDS Settings</h1>
//         <div style={{ color: '#6b7280', marginTop: '2rem' }}>Loading settings...</div>
//       </div>
//     )
//   }

//   return (
//     <div style={{ padding: '2rem' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
//         <h1>IDS Settings</h1>
//         <button
//           onClick={handleSave}
//           disabled={saving}
//           style={{
//             padding: '0.5rem 1.5rem',
//             background: '#2563eb',
//             color: '#fff',
//             border: 'none',
//             borderRadius: 8,
//             cursor: saving ? 'not-allowed' : 'pointer',
//             fontWeight: 600,
//           }}
//         >
//           {saving ? 'Saving...' : 'Save Settings'}
//         </button>
//       </div>
//       {error && (
//         <div style={{ padding: '1rem', background: '#fee', color: '#c00', borderRadius: 8, marginBottom: '1rem' }}>
//           {error}
//         </div>
//       )}
//       {success && (
//         <div style={{ padding: '1rem', background: '#f0fdf4', color: '#16a34a', borderRadius: 8, marginBottom: '1rem' }}>
//           Settings saved successfully!
//         </div>
//       )}
//       <div style={{ display: 'grid', gap: '1.5rem', maxWidth: 800 }}>
//         <div style={{ padding: '1.5rem', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
//           <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Network Configuration</h2>
//           <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
//             Network Interface
//             <input
//               type="text"
//               value={settings.interface || ''}
//               onChange={(e) => handleChange('interface', e.target.value)}
//               placeholder="eth0"
//               style={{
//                 marginTop: '0.5rem',
//                 width: '100%',
//                 padding: '0.5rem',
//                 border: '1px solid #d1d5db',
//                 borderRadius: 6,
//                 fontSize: '1rem',
//               }}
//             />
//           </label>
//           <p style={{ fontSize: '.85rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
//             Network interface to monitor (e.g., eth0, wlan0)
//           </p>
//         </div>
//         <div style={{ padding: '1.5rem', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
//           <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Detection Settings</h2>
//           <div style={{ display: 'grid', gap: '1rem' }}>
//             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               <input
//                 type="checkbox"
//                 checked={settings.enable_anomaly_detection ?? true}
//                 onChange={(e) => handleChange('enable_anomaly_detection', e.target.checked)}
//                 style={{ width: 20, height: 20 }}
//               />
//               <span>Enable ML-based Anomaly Detection</span>
//             </label>
//             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               <input
//                 type="checkbox"
//                 checked={settings.enable_signature_detection ?? true}
//                 onChange={(e) => handleChange('enable_signature_detection', e.target.checked)}
//                 style={{ width: 20, height: 20 }}
//               />
//               <span>Enable Signature-based Detection</span>
//             </label>
//             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               <input
//                 type="checkbox"
//                 checked={settings.auto_block ?? false}
//                 onChange={(e) => handleChange('auto_block', e.target.checked)}
//                 style={{ width: 20, height: 20 }}
//               />
//               <span>Automatically block high-risk IPs</span>
//             </label>
//           </div>
//         </div>
//         <div style={{ padding: '1.5rem', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
//           <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Alert Thresholds</h2>
//           <div style={{ display: 'grid', gap: '1rem' }}>
//             <label style={{ display: 'block' }}>
//               <span style={{ fontWeight: 600 }}>Low Severity Threshold</span>
//               <input
//                 type="number"
//                 step="0.1"
//                 value={settings.threshold_low || 0.3}
//                 onChange={(e) => handleChange('threshold_low', parseFloat(e.target.value))}
//                 style={{
//                   marginTop: '0.5rem',
//                   width: '100%',
//                   padding: '0.5rem',
//                   border: '1px solid #d1d5db',
//                   borderRadius: 6,
//                   fontSize: '1rem',
//                 }}
//               />
//             </label>
//             <label style={{ display: 'block' }}>
//               <span style={{ fontWeight: 600 }}>Medium Severity Threshold</span>
//               <input
//                 type="number"
//                 step="0.1"
//                 value={settings.threshold_medium || 0.6}
//                 onChange={(e) => handleChange('threshold_medium', parseFloat(e.target.value))}
//                 style={{
//                   marginTop: '0.5rem',
//                   width: '100%',
//                   padding: '0.5rem',
//                   border: '1px solid #d1d5db',
//                   borderRadius: 6,
//                   fontSize: '1rem',
//                 }}
//               />
//             </label>
//             <label style={{ display: 'block' }}>
//               <span style={{ fontWeight: 600 }}>High Severity Threshold</span>
//               <input
//                 type="number"
//                 step="0.1"
//                 value={settings.threshold_high || 0.8}
//                 onChange={(e) => handleChange('threshold_high', parseFloat(e.target.value))}
//                 style={{
//                   marginTop: '0.5rem',
//                   width: '100%',
//                   padding: '0.5rem',
//                   border: '1px solid #d1d5db',
//                   borderRadius: 6,
//                   fontSize: '1rem',
//                 }}
//               />
//             </label>
//           </div>
//         </div>
//         <div style={{ padding: '1.5rem', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
//           <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Data Retention</h2>
//           <div style={{ display: 'grid', gap: '1rem' }}>
//             <label style={{ display: 'block' }}>
//               <span style={{ fontWeight: 600 }}>Alert Retention (days)</span>
//               <input
//                 type="number"
//                 value={settings.alert_retention_days || 7}
//                 onChange={(e) => handleChange('alert_retention_days', parseInt(e.target.value))}
//                 style={{
//                   marginTop: '0.5rem',
//                   width: '100%',
//                   padding: '0.5rem',
//                   border: '1px solid #d1d5db',
//                   borderRadius: 6,
//                   fontSize: '1rem',
//                 }}
//               />
//             </label>
//             <label style={{ display: 'block' }}>
//               <span style={{ fontWeight: 600 }}>Block Retention (days)</span>
//               <input
//                 type="number"
//                 value={settings.block_retention_days || 10}
//                 onChange={(e) => handleChange('block_retention_days', parseInt(e.target.value))}
//                 style={{
//                   marginTop: '0.5rem',
//                   width: '100%',
//                   padding: '0.5rem',
//                   border: '1px solid #d1d5db',
//                   borderRadius: 6,
//                   fontSize: '1rem',
//                 }}
//               />
//             </label>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default IDSSettings
