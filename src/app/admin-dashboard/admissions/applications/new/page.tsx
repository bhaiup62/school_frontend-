'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getSessions, getClasses, createApplication } from '@/services/admin/admissionService'
import { 
  CheckCircle2, ChevronRight, ChevronLeft, Building2, 
  User, Users, ClipboardCheck, AlertCircle, ArrowLeft
} from 'lucide-react'

export default function NewApplicationWizard() {
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [sessions, setSessions] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // The massive payload state
  const [formData, setFormData] = useState({
    academicSession: '',
    appliedClass: '',
    childData: {
      firstName: '',
      lastName: '',
      dob: '',
      gender: 'Male' as 'Male' | 'Female' | 'Other',
      bloodGroup: '',
    },
    parentData: {
      fatherName: '',
      motherName: '',
      phone: '',
      email: '',
      occupation: '',
      annualIncome: '',
    }
  })

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [sesRes, clsRes] = await Promise.all([getSessions(), getClasses()])
        setSessions(sesRes.data)
        setClasses(clsRes.data)
        
        // Auto-select current active session if available
        const activeSession = sesRes.data.find((s: any) => s.isCurrentSession)
        if (activeSession) {
          setFormData(prev => ({ ...prev, academicSession: activeSession._id }))
        }
      } catch (err) {
        setError('Failed to load classes and sessions. Please refresh.')
      } finally {
        setLoadingInitial(false)
      }
    }
    fetchDropdowns()
  }, [])

  // Nested state updaters
  const updateChild = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, childData: { ...prev.childData, [field]: value } }))
  }
  
  const updateParent = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, parentData: { ...prev.parentData, [field]: value } }))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (step < 4) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')
    try {
      const payload = {
        ...formData,
        parentData: {
          ...formData.parentData,
          annualIncome: formData.parentData.annualIncome ? Number(formData.parentData.annualIncome) : 0
        }
      }
      
      const res = await createApplication(payload)
      // Redirect to the newly created application review page!
      router.push(`/admin-dashboard/admissions/applications/${res.data._id}`)
      
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to submit application. Please check rules and capacity.')
      setIsSubmitting(false)
    }
  }

  const STEPS = [
    { id: 1, title: 'Enrollment', icon: Building2 },
    { id: 2, title: 'Child Details', icon: User },
    { id: 3, title: 'Parent Info', icon: Users },
    { id: 4, title: 'Review', icon: ClipboardCheck },
  ]

  if (loadingInitial) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-4">
          <Link href="/admin-dashboard/admissions/applications" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Application Pipeline
          </Link>
        </div>
        
        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">New Admission Application</h1>
          <p className="text-slate-500 text-sm mt-1">Fill out the required information to enter a student into the pipeline.</p>
        </div>

        {/* ── Stepper Indicator ── */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0 rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-violet-600 z-0 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${((step - 1) / 3) * 100}%` }} 
            />
            
            {STEPS.map((s) => {
              const isActive = step === s.id
              const isCompleted = step > s.id
              
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/30' : 
                    isCompleted ? 'bg-violet-600 border-violet-600 text-white' : 
                    'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-bold absolute -bottom-6 whitespace-nowrap ${isActive ? 'text-violet-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* ── Form Area ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mt-10">
          <form onSubmit={handleNext}>
            
            {/* STEP 1: ENROLLMENT SETUP */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Enrollment Details</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Academic Session *</label>
                    <select required value={formData.academicSession} onChange={e => setFormData({...formData, academicSession: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white">
                      <option value="" disabled>Select Session</option>
                      {sessions.map(s => <option key={s._id} value={s._id}>{s.sessionName} {s.isCurrentSession ? '(Current)' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Applied Class *</label>
                    <select required value={formData.appliedClass} onChange={e => setFormData({...formData, appliedClass: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white">
                      <option value="" disabled>Select Class</option>
                      {classes.map(c => <option key={c._id} value={c._id}>{c.className} ({c.availableSeats} seats left)</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CHILD DETAILS */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Child Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">First Name *</label>
                    <input type="text" required value={formData.childData.firstName} onChange={e => updateChild('firstName', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Last Name *</label>
                    <input type="text" required value={formData.childData.lastName} onChange={e => updateChild('lastName', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Date of Birth *</label>
                    <input type="date" required value={formData.childData.dob} onChange={e => updateChild('dob', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Gender *</label>
                    <select required value={formData.childData.gender} onChange={e => updateChild('gender', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none bg-white">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Blood Group</label>
                    <input type="text" placeholder="e.g., O+" value={formData.childData.bloodGroup} onChange={e => updateChild('bloodGroup', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PARENT DETAILS */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Parent/Guardian Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Father's Name *</label>
                    <input type="text" required value={formData.parentData.fatherName} onChange={e => updateParent('fatherName', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Mother's Name *</label>
                    <input type="text" required value={formData.parentData.motherName} onChange={e => updateParent('motherName', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Primary Phone *</label>
                    <input type="tel" required value={formData.parentData.phone} onChange={e => updateParent('phone', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Email Address</label>
                    <input type="email" value={formData.parentData.email} onChange={e => updateParent('email', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Primary Occupation</label>
                    <input type="text" value={formData.parentData.occupation} onChange={e => updateParent('occupation', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Annual Income (₹)</label>
                    <input type="number" min="0" value={formData.parentData.annualIncome} onChange={e => updateParent('annualIncome', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Review Application</h2>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 uppercase text-xs font-bold mb-1">Applicant</p>
                      <p className="font-bold text-slate-900 text-lg">{formData.childData.firstName} {formData.childData.lastName}</p>
                      <p className="text-slate-600">DOB: {new Date(formData.childData.dob).toLocaleDateString()}</p>
                      <p className="text-slate-600">Gender: {formData.childData.gender}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase text-xs font-bold mb-1">Target Class</p>
                      <p className="font-bold text-violet-700 text-lg">
                        {classes.find(c => c._id === formData.appliedClass)?.className || 'Unknown'}
                      </p>
                      <p className="text-slate-600">Session: {sessions.find(s => s._id === formData.academicSession)?.sessionName || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 uppercase text-xs font-bold mb-1">Parents</p>
                      <p className="font-bold text-slate-800">{formData.parentData.fatherName} & {formData.parentData.motherName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase text-xs font-bold mb-1">Contact</p>
                      <p className="font-bold text-slate-800">{formData.parentData.phone}</p>
                      <p className="text-slate-600">{formData.parentData.email || 'No email provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button 
                type="button" 
                onClick={handlePrevious}
                disabled={step === 1 || isSubmitting}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {step < 4 ? (
                <button 
                  type="submit"
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-600/20"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm & Submit Application'} <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
