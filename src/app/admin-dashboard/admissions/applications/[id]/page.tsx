'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  getApplicationById, updatePayment, updateDocumentStatus, 
  scheduleTest, updateTestScore, updateOfferStatus, confirmAdmission 
} from '@/services/admin/admissionService'
import { 
  User, Users, CheckCircle2, XCircle, Clock, CreditCard, FileText, 
  CalendarDays, Award, ArrowRight, ShieldCheck, AlertCircle, Cloud, FileUp, ArrowLeft
} from 'lucide-react'

export default function ApplicationReviewPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string

  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0) // Trigger refetch

  // Action States
  const [transactionId, setTransactionId] = useState('')
  const [testDate, setTestDate] = useState('')
  const [testScore, setTestScore] = useState<number | ''>('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await getApplicationById(applicationId)
        setApp(res.data)
      } catch (error) {
        console.error('Failed to fetch application:', error)
      } finally {
        setLoading(false)
      }
    }
    if (applicationId) fetchApp()
  }, [applicationId, refresh])

  const triggerRefresh = () => setRefresh(prev => prev + 1)

  // ── Action Handlers ──
  const handlePayment = async () => {
    if (!transactionId) return alert('Enter a transaction ID')
    try {
      await updatePayment(applicationId, { transactionId })
      triggerRefresh()
    } catch (e) { alert('Payment update failed') }
  }

  const handleDocVerify = async (docType: string, status: 'Verified' | 'Rejected') => {
    try {
      await updateDocumentStatus(applicationId, { documentType: docType, status })
      triggerRefresh()
    } catch (e) { alert('Document update failed') }
  }

  const handleScheduleTest = async () => {
    if (!testDate) return alert('Select a date')
    try {
      await scheduleTest(applicationId, { interviewDate: testDate })
      triggerRefresh()
    } catch (e) { alert('Scheduling failed') }
  }

  const handleUpdateScore = async () => {
    if (testScore === '') return alert('Enter a score')
    try {
      await updateTestScore(applicationId, { testScore: Number(testScore) })
      triggerRefresh()
    } catch (e) { alert('Score update failed') }
  }

  const handleOfferAction = async (action: 'Offer' | 'Waitlist' | 'Reject') => {
    try {
      await updateOfferStatus(applicationId, { action })
      triggerRefresh()
    } catch (e) { alert('Status update failed') }
  }

  const handleConfirmAdmission = async () => {
    if (!confirm('Are you sure? This will deduct a seat and create a permanent Student profile.')) return
    setIsProcessing(true)
    try {
      await confirmAdmission(applicationId)
      alert('Success! Student has been officially admitted.')
      triggerRefresh()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Admission failed')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" /></div></AdminLayout>
  }

  if (!app) {
    return <AdminLayout><div className="text-center py-20 text-slate-500">Application not found.</div></AdminLayout>
  }

  // Helper for pipeline progress
  const stages = ['Draft', 'Submitted', 'Document Verified', 'Test Scheduled', 'Offered', 'Admitted']
  const currentStageIndex = stages.indexOf(app.pipelineStatus)

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-4">
          <Link href="/admin-dashboard/admissions/applications" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Application Pipeline
          </Link>
        </div>
        
        {/* ── Header & Progress Bar ── */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-md">{app.applicationNumber}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                  app.pipelineStatus === 'Admitted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  app.pipelineStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {app.pipelineStatus}
                </span>
              </div>
              <h1 className="text-3xl font-display font-bold text-slate-900">{app.childData.firstName} {app.childData.lastName}</h1>
              <p className="text-slate-500 font-medium">Applying for: <strong className="text-slate-700">{app.appliedClass?.className}</strong> ({app.academicSession?.sessionName})</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative pt-4">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100">
              <div style={{ width: `${Math.max(5, (currentStageIndex / (stages.length - 1)) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-violet-500 transition-all duration-500"></div>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400">
              {stages.map((s, i) => (
                <span key={s} className={currentStageIndex >= i ? 'text-violet-700' : ''}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* ── Left Column: Details ── */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100"><User className="w-4 h-4 text-violet-500"/> Applicant Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">DOB</span> <span className="font-medium text-slate-900">{new Date(app.childData.dob).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Gender</span> <span className="font-medium text-slate-900">{app.childData.gender}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Blood Group</span> <span className="font-medium text-slate-900">{app.childData.bloodGroup || 'N/A'}</span></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100"><Users className="w-4 h-4 text-violet-500"/> Parent Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Father</span> <span className="font-medium text-slate-900">{app.parentData.fatherName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mother</span> <span className="font-medium text-slate-900">{app.parentData.motherName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone</span> <span className="font-medium text-slate-900">{app.parentData.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Email</span> <span className="font-medium text-slate-900 truncate max-w-[150px]">{app.parentData.email || 'N/A'}</span></div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Actions (The Pipeline Engine) ── */}
          <div className="md:col-span-2 space-y-6">
            
            {/* 1. Payment Verification */}
            <div className={`p-6 rounded-2xl border ${app.payment?.status === 'Paid' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-500"/> Application Fee Payment</h3>
                {app.payment?.status === 'Paid' && <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm"><CheckCircle2 className="w-4 h-4"/> Paid</span>}
              </div>
              {app.payment?.status !== 'Paid' ? (
                <div className="flex gap-3">
                  <input type="text" placeholder="Enter Txn ID / Receipt No" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500" />
                  <button onClick={handlePayment} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">Mark as Paid</button>
                </div>
              ) : (
                <p className="text-sm text-slate-600">Transaction ID: <strong className="text-slate-900">{app.payment?.transactionId}</strong></p>
              )}
            </div>

            {/* 2. Document Verification */}
            {app.payment?.status === 'Paid' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><ShieldCheck className="w-5 h-5 text-blue-500"/> Document Verification</h3>
                
                {app.documents?.length === 0 ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-sm text-slate-600">No physical documents uploaded yet. Override verification?</span>
                    <button onClick={() => handleDocVerify('Manual Override', 'Verified')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">Verify All Manually</button>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-white p-2 border border-blue-100">
                        <FileUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900 flex items-center gap-2">
                          <Cloud className="w-4 h-4" />
                          File Uploads Coming Soon
                        </p>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                          AWS S3 / Cloudinary integration will be added here globally in a future update. For now, please use the Manual Override button to advance the pipeline.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {app.pipelineStatus === 'Submitted' && app.documents?.length === 0 && (
                  <div className="mt-4 p-3 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-2 border border-amber-200">
                    <AlertCircle className="w-4 h-4" /> You must verify documents to move to the Assessment phase.
                  </div>
                )}
              </div>
            )}

            {/* 3. Assessment & Interview */}
            {['Document Verified', 'Test Scheduled', 'Offered', 'Admitted'].includes(app.pipelineStatus) && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><CalendarDays className="w-5 h-5 text-amber-500"/> Assessment & Interview</h3>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Schedule Date</label>
                    <div className="flex gap-2">
                      <input type="datetime-local" value={testDate || (app.assessment?.interviewDate ? new Date(app.assessment.interviewDate).toISOString().slice(0, 16) : '')} onChange={e => setTestDate(e.target.value)} disabled={app.pipelineStatus !== 'Document Verified'} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none disabled:bg-slate-50" />
                      {app.pipelineStatus === 'Document Verified' && (
                        <button onClick={handleScheduleTest} className="bg-amber-600 hover:bg-amber-700 text-white px-3 rounded-xl text-sm font-bold transition-colors">Save</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Test Score (%)</label>
                    <div className="flex gap-2">
                      <input type="number" min="0" max="100" placeholder="0-100" value={testScore !== '' ? testScore : (app.assessment?.testScore ?? '')} onChange={e => setTestScore(e.target.value)} disabled={app.pipelineStatus !== 'Test Scheduled'} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none disabled:bg-slate-50" />
                      {app.pipelineStatus === 'Test Scheduled' && (
                        <button onClick={handleUpdateScore} className="bg-amber-600 hover:bg-amber-700 text-white px-3 rounded-xl text-sm font-bold transition-colors">Save</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Final Decision & Admission */}
            {['Test Scheduled', 'Offered', 'Waitlisted', 'Admitted'].includes(app.pipelineStatus) && (
              <div className={`p-6 rounded-2xl border ${app.pipelineStatus === 'Admitted' ? 'bg-violet-50 border-violet-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-violet-500"/> Final Decision</h3>
                
                {app.pipelineStatus === 'Test Scheduled' && (
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleOfferAction('Offer')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">Send Offer Letter</button>
                    <button onClick={() => handleOfferAction('Waitlist')} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">Put on Waitlist</button>
                    <button onClick={() => handleOfferAction('Reject')} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">Reject Applicant</button>
                  </div>
                )}

                {app.pipelineStatus === 'Offered' && (
                  <div className="text-center p-6 border-2 border-dashed border-violet-300 rounded-xl bg-violet-50/50">
                    <h4 className="text-lg font-display font-bold text-violet-900 mb-2">Ready for Admission!</h4>
                    <p className="text-sm text-violet-700 mb-6">The parent has accepted the offer. Clicking the button below will deduct 1 seat from the class and generate a permanent Student Profile.</p>
                    <button 
                      onClick={handleConfirmAdmission} 
                      disabled={isProcessing}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl text-base font-bold transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 mx-auto w-full sm:w-auto disabled:opacity-70"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Final Admission'} <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {app.pipelineStatus === 'Admitted' && (
                  <div className="flex items-center gap-3 text-emerald-700 bg-emerald-100/50 p-4 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                      <p className="font-bold text-sm">Admission Successfully Completed</p>
                      <p className="text-xs mt-0.5">This student has been moved to the active Student Directory.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
