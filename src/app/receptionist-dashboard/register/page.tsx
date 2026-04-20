'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReceptionistLayout from '@/components/receptionist/ReceptionistLayout'
import { registerStudent, registerParent, linkChildToParent } from '@/services/receptionistService'
import { UserPlus, CheckCircle, AlertTriangle, ArrowRight, User, Users, Link as LinkIcon, RefreshCcw, HeartPulse, Bus, History, FileText, Phone } from 'lucide-react'
import Link from 'next/link'

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C', 'D', 'E']
const GENDERS = ['male', 'female', 'other']
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Other']
const CASTES = ['General', 'OBC', 'SC', 'ST']
const TRANSPORT_MODES = ['parents', 'self', 'school_bus', 'private_van']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'student' | 'parent' | 'done'>('student')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [studentId, setStudentId] = useState('')
  const [parentId, setParentId] = useState('')
  
  // 🛡️ Full Enterprise Form State
  const [studentForm, setStudentForm] = useState({
    // Core & Personal
    firstName: '', lastName: '', class: '', section: '', rollNumber: '',
    dateOfBirth: '', gender: '', bloodGroup: '', aadharNumber: '',
    nationality: 'Indian', motherTongue: 'Hindi', religion: '', caste: 'General',
    // Contact & Family
    phone: '', email: '', address: '', city: 'Varanasi', pincode: '',
    fatherName: '', fatherOccupation: '',
    motherName: '', motherOccupation: '',
    guardianName: '', guardianPhone: '', annualFamilyIncome: '',
    // Medical & Transport
    allergies: '', physicalDisabilities: '', emergencyContactName: '', emergencyContactPhone: '',
    transportMode: 'parents', transportRoute: '',
    // Previous Academic
    schoolName: '', board: '', lastClass: '', percentage: '', tcNumber: '',
    // Documents
    birthCertificate: false, aadharCard: false, previousMarksheet: false, transferCertificate: false
  })
  
  const [parentForm, setParentForm] = useState({
    firstName: '', lastName: '', relation: 'father',
    phone: '', email: '', address: '', city: 'Varanasi', pincode: ''
  })
  
  const [skipParent, setSkipParent] = useState(false)

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentForm.firstName || !studentForm.lastName || !studentForm.class || !studentForm.section || !studentForm.dateOfBirth || !studentForm.gender) {
      setMessage({ type: 'error', text: 'Please fill all required core fields (Name, Class, Section, DOB, Gender)' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    // Structure payload for the nested enterprise backend
    const payload = {
      firstName: studentForm.firstName, lastName: studentForm.lastName,
      class: studentForm.class, section: studentForm.section,
      rollNumber: studentForm.rollNumber ? parseInt(studentForm.rollNumber) : undefined,
      dateOfBirth: studentForm.dateOfBirth, gender: studentForm.gender,
      bloodGroup: studentForm.bloodGroup, aadharNumber: studentForm.aadharNumber,
      nationality: studentForm.nationality, motherTongue: studentForm.motherTongue,
      religion: studentForm.religion, caste: studentForm.caste,
      phone: studentForm.phone, email: studentForm.email,
      address: studentForm.address, city: studentForm.city, pincode: studentForm.pincode,
      
      parents: {
        fatherName: studentForm.fatherName, fatherOccupation: studentForm.fatherOccupation,
        motherName: studentForm.motherName, motherOccupation: studentForm.motherOccupation,
        guardianName: studentForm.guardianName, phone: studentForm.guardianPhone,
        annualFamilyIncome: studentForm.annualFamilyIncome
      },
      previousAcademicHistory: {
        schoolName: studentForm.schoolName, board: studentForm.board,
        lastClass: studentForm.lastClass, percentage: studentForm.percentage, tcNumber: studentForm.tcNumber
      },
      medicalRecord: {
        allergies: studentForm.allergies, physicalDisabilities: studentForm.physicalDisabilities,
        emergencyContactName: studentForm.emergencyContactName, emergencyContactPhone: studentForm.emergencyContactPhone
      },
      transport: { mode: studentForm.transportMode, route: studentForm.transportRoute },
      documentChecklist: {
        birthCertificate: studentForm.birthCertificate, aadharCard: studentForm.aadharCard,
        previousMarksheet: studentForm.previousMarksheet, transferCertificate: studentForm.transferCertificate
      }
    }

    try {
      const res = await registerStudent(payload)
      setStudentId(res.data.admissionNumber)
      
      // Auto-fill parent details to save time
      setParentForm(prev => ({
        ...prev,
        firstName: studentForm.fatherName || studentForm.guardianName || '',
        lastName: studentForm.lastName || '',
        phone: studentForm.guardianPhone || studentForm.phone || '',
        email: studentForm.email || '',
        address: studentForm.address || '',
        pincode: studentForm.pincode || '',
      }))

      setMessage({ type: 'success', text: `Student registered successfully! ID: ${res.data.admissionNumber}` })
      setStep('parent')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parentForm.firstName || !parentForm.lastName || !parentForm.phone) {
      setMessage({ type: 'error', text: 'Please fill all required parent fields' })
      return
    }
    
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const res = await registerParent(parentForm)
      const newParentId = res.data.parentId
      setParentId(newParentId)
      
      await linkChildToParent(newParentId, studentId)
      setMessage({ type: 'success', text: 'Parent registered and linked to student!' })
      setStep('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleSkipParent = () => {
    setSkipParent(true)
    setStep('done')
    setMessage({ type: '', text: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setStep('student')
    setStudentId('')
    setParentId('')
    setStudentForm({
      firstName: '', lastName: '', class: '', section: '', rollNumber: '', dateOfBirth: '', gender: '', bloodGroup: '', aadharNumber: '', nationality: 'Indian', motherTongue: 'Hindi', religion: '', caste: 'General', phone: '', email: '', address: '', city: 'Varanasi', pincode: '', fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '', guardianName: '', guardianPhone: '', annualFamilyIncome: '', allergies: '', physicalDisabilities: '', emergencyContactName: '', emergencyContactPhone: '', transportMode: 'parents', transportRoute: '', schoolName: '', board: '', lastClass: '', percentage: '', tcNumber: '', birthCertificate: false, aadharCard: false, previousMarksheet: false, transferCertificate: false
    })
    setParentForm({ firstName: '', lastName: '', relation: 'father', phone: '', email: '', address: '', city: 'Varanasi', pincode: '' })
    setSkipParent(false)
    setMessage({ type: '', text: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <ReceptionistLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Steps */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 sticky top-0 z-40 bg-opacity-95 backdrop-blur-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-800">New Admission Registration</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <div className={`flex flex-col items-center gap-2 z-10 w-24 ${step === 'student' ? 'text-teal-600' : 'text-emerald-500'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${step === 'student' ? 'bg-teal-100 text-teal-600 border-2 border-teal-200' : 'bg-emerald-500 text-white border-2 border-emerald-500'}`}>
                {step !== 'student' ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Student</span>
            </div>
            
            <div className="hidden sm:block flex-1 h-1 bg-slate-100 rounded-full mx-2 relative top-[-10px]">
               <div className={`h-full rounded-full transition-all duration-500 ${step === 'student' ? 'w-0' : 'w-full bg-emerald-400'}`}></div>
            </div>

            <div className={`flex flex-col items-center gap-2 z-10 w-24 ${step === 'parent' ? 'text-teal-600' : step === 'done' ? 'text-emerald-500' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${step === 'parent' ? 'bg-teal-100 text-teal-600 border-2 border-teal-200' : step === 'done' ? 'bg-emerald-500 text-white border-2 border-emerald-500' : 'bg-slate-50 text-slate-300 border-2 border-slate-100'}`}>
                {step === 'done' ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Parent</span>
            </div>

            <div className="hidden sm:block flex-1 h-1 bg-slate-100 rounded-full mx-2 relative top-[-10px]">
               <div className={`h-full rounded-full transition-all duration-500 ${step === 'done' ? 'w-full bg-emerald-400' : 'w-0'}`}></div>
            </div>

            <div className={`flex flex-col items-center gap-2 z-10 w-24 ${step === 'done' ? 'text-emerald-500' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${step === 'done' ? 'bg-emerald-500 text-white border-2 border-emerald-500' : 'bg-slate-50 text-slate-300 border-2 border-slate-100'}`}>
                {step === 'done' ? <CheckCircle className="w-5 h-5" /> : '3'}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm font-bold text-sm animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* ==========================================
            STEP 1: ENTERPRISE STUDENT REGISTRATION
            ========================================== */}
        {step === 'student' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <form onSubmit={handleStudentSubmit} className="divide-y divide-slate-100">
              
              {/* SECTION A: Core Personal */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100"><User className="w-5 h-5 text-teal-600" /></div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">Core Personal Details</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">First Name <span className="text-rose-500">*</span></label>
                    <input type="text" value={studentForm.firstName} onChange={e => setStudentForm(f => ({ ...f, firstName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Last Name <span className="text-rose-500">*</span></label>
                    <input type="text" value={studentForm.lastName} onChange={e => setStudentForm(f => ({ ...f, lastName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Date of Birth <span className="text-rose-500">*</span></label>
                    <input type="date" value={studentForm.dateOfBirth} onChange={e => setStudentForm(f => ({ ...f, dateOfBirth: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Gender <span className="text-rose-500">*</span></label>
                    <select value={studentForm.gender} onChange={e => setStudentForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none" required>
                      <option value="">Select</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Blood Group</label>
                    <input type="text" value={studentForm.bloodGroup} onChange={e => setStudentForm(f => ({ ...f, bloodGroup: e.target.value }))} placeholder="e.g. O+" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Religion</label>
                    <select value={studentForm.religion} onChange={e => setStudentForm(f => ({ ...f, religion: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none">
                      <option value="">Select</option>
                      {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Category/Caste</label>
                    <select value={studentForm.caste} onChange={e => setStudentForm(f => ({ ...f, caste: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none">
                      {CASTES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Aadhar Number</label>
                    <input type="text" value={studentForm.aadharNumber} onChange={e => setStudentForm(f => ({ ...f, aadharNumber: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION B: Academic Placement */}
              <div className="p-8 space-y-6 bg-slate-50/30">
                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Admission Class <span className="text-rose-500">*</span></label>
                    <select value={studentForm.class} onChange={e => setStudentForm(f => ({ ...f, class: e.target.value }))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-teal-700 focus:ring-2 focus:ring-teal-500 outline-none" required>
                      <option value="">Select</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Section <span className="text-rose-500">*</span></label>
                    <select value={studentForm.section} onChange={e => setStudentForm(f => ({ ...f, section: e.target.value }))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-teal-700 focus:ring-2 focus:ring-teal-500 outline-none" required>
                      <option value="">Select</option>
                      {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Roll Number</label>
                    <input type="number" value={studentForm.rollNumber} onChange={e => setStudentForm(f => ({ ...f, rollNumber: e.target.value }))} placeholder="Auto Generate if blank" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION C: Family & Contact */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100"><Users className="w-5 h-5 text-indigo-600" /></div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">Family & Contact Details</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Father's Name</label>
                     <input type="text" value={studentForm.fatherName} onChange={e => setStudentForm(f => ({ ...f, fatherName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Father's Occupation</label>
                     <input type="text" value={studentForm.fatherOccupation} onChange={e => setStudentForm(f => ({ ...f, fatherOccupation: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Mother's Name</label>
                     <input type="text" value={studentForm.motherName} onChange={e => setStudentForm(f => ({ ...f, motherName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Mother's Occupation</label>
                     <input type="text" value={studentForm.motherOccupation} onChange={e => setStudentForm(f => ({ ...f, motherOccupation: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Guardian's Name (if applicable)</label>
                     <input type="text" value={studentForm.guardianName} onChange={e => setStudentForm(f => ({ ...f, guardianName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Guardian's Phone</label>
                     <input type="tel" value={studentForm.guardianPhone} onChange={e => setStudentForm(f => ({ ...f, guardianPhone: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                   </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Primary Phone (SMS Alerts)</label>
                    <input type="tel" value={studentForm.phone} onChange={e => setStudentForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Primary Email Address</label>
                    <input type="email" value={studentForm.email} onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Street Address</label>
                    <input type="text" value={studentForm.address} onChange={e => setStudentForm(f => ({ ...f, address: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">City</label>
                    <input type="text" value={studentForm.city} onChange={e => setStudentForm(f => ({ ...f, city: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pincode</label>
                    <input type="text" value={studentForm.pincode} onChange={e => setStudentForm(f => ({ ...f, pincode: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION D: Medical & Transport */}
              <div className="p-8 space-y-6 bg-slate-50/30">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Medical */}
                  <div>
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center border border-rose-100"><HeartPulse className="w-4 h-4 text-rose-500" /></div>
                       <h3 className="font-display font-bold text-slate-800">Medical Alerts</h3>
                     </div>
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Known Allergies</label>
                         <input type="text" value={studentForm.allergies} onChange={e => setStudentForm(f => ({ ...f, allergies: e.target.value }))} placeholder="None" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Emergency Contact Name</label>
                         <input type="text" value={studentForm.emergencyContactName} onChange={e => setStudentForm(f => ({ ...f, emergencyContactName: e.target.value }))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Emergency Phone</label>
                         <input type="tel" value={studentForm.emergencyContactPhone} onChange={e => setStudentForm(f => ({ ...f, emergencyContactPhone: e.target.value }))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                       </div>
                     </div>
                  </div>

                  {/* Transport */}
                  <div>
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100"><Bus className="w-4 h-4 text-amber-600" /></div>
                       <h3 className="font-display font-bold text-slate-800">Transportation</h3>
                     </div>
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Mode of Transport</label>
                         <select value={studentForm.transportMode} onChange={e => setStudentForm(f => ({ ...f, transportMode: e.target.value }))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none">
                           {TRANSPORT_MODES.map(m => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
                         </select>
                       </div>
                       {studentForm.transportMode === 'school_bus' && (
                         <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Bus Route / Stop</label>
                           <input type="text" value={studentForm.transportRoute} onChange={e => setStudentForm(f => ({ ...f, transportRoute: e.target.value }))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                         </div>
                       )}
                     </div>
                  </div>
                </div>
              </div>

              {/* SECTION E: Previous Academic History */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200"><History className="w-5 h-5 text-slate-600" /></div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">Previous Academic Record</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Previous School Name</label>
                    <input type="text" value={studentForm.schoolName} onChange={e => setStudentForm(f => ({ ...f, schoolName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Board Affiliation</label>
                    <input type="text" value={studentForm.board} onChange={e => setStudentForm(f => ({ ...f, board: e.target.value }))} placeholder="CBSE, ICSE, State" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Transfer Certificate (TC) Number</label>
                    <input type="text" value={studentForm.tcNumber} onChange={e => setStudentForm(f => ({ ...f, tcNumber: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION F: Documents Checklist */}
              <div className="p-8 space-y-6 bg-slate-50/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100"><FileText className="w-5 h-5 text-emerald-600" /></div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">Documents Collected</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { key: 'birthCertificate', label: 'Birth Certificate' },
                     { key: 'aadharCard', label: 'Aadhar Card Copy' },
                     { key: 'previousMarksheet', label: 'Previous Marksheet' },
                     { key: 'transferCertificate', label: 'Original TC' },
                   ].map((doc) => (
                     <label key={doc.key} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-teal-300 transition-colors">
                       <input type="checkbox" checked={(studentForm as any)[doc.key]} onChange={e => setStudentForm(f => ({ ...f, [doc.key]: e.target.checked }))} 
                         className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
                       <span className="text-sm font-bold text-slate-700">{doc.label}</span>
                     </label>
                   ))}
                </div>
              </div>

              <div className="p-8 bg-slate-50">
                <button type="submit" disabled={loading}
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
                  {loading ? 'Processing...' : 'Register Student & Proceed to Parent'} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==========================================
            STEP 2: PARENT REGISTRATION 
            ========================================== */}
        {step === 'parent' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm"><LinkIcon className="w-5 h-5 text-teal-600" /></div>
              <div>
                 <h3 className="font-display font-bold text-slate-800 text-lg">Link Parent Account</h3>
                 <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mt-0.5">Target: Student {studentId}</p>
              </div>
            </div>

            <form onSubmit={handleParentSubmit} className="p-8 space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                 <User className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-sm font-medium text-blue-800">
                    We have auto-filled this form using the contact details you provided for the student. Please verify and complete the parent registration to create their portal access.
                 </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">First Name <span className="text-rose-500">*</span></label>
                  <input type="text" value={parentForm.firstName} onChange={e => setParentForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Last Name <span className="text-rose-500">*</span></label>
                  <input type="text" value={parentForm.lastName} onChange={e => setParentForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Relationship <span className="text-rose-500">*</span></label>
                  <select value={parentForm.relation} onChange={e => setParentForm(f => ({ ...f, relation: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none cursor-pointer">
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Phone Number <span className="text-rose-500">*</span></label>
                  <input type="tel" value={parentForm.phone} onChange={e => setParentForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                  <input type="email" value={parentForm.email} onChange={e => setParentForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Street Address</label>
                  <input type="text" value={parentForm.address} onChange={e => setParentForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">City</label>
                  <input type="text" value={parentForm.city} onChange={e => setParentForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pincode</label>
                  <input type="text" value={parentForm.pincode} onChange={e => setParentForm(f => ({ ...f, pincode: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={handleSkipParent}
                  className="sm:w-1/3 bg-white border border-slate-200 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Skip Parent Creation
                </button>
                <button type="submit" disabled={loading}
                  className="sm:w-2/3 bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
                  {loading ? 'Processing...' : 'Register Parent & Link Child'} <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-50">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-800 mb-3">Admission Complete!</h2>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 max-w-md mx-auto mb-8 text-left">
               <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-2">Registration Summary</p>
               <p className="text-base font-semibold text-slate-700 mb-2">
                 Student ID: <span className="font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded ml-2">{studentId}</span>
               </p>
               {parentId ? (
                 <p className="text-base font-semibold text-slate-700">
                   Parent ID: <span className="font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded ml-2">{parentId}</span>
                 </p>
               ) : (
                 <p className="text-base font-semibold text-amber-600 flex items-center gap-1.5 mt-2">
                   <AlertTriangle className="w-4 h-4" /> No Parent Linked
                 </p>
               )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={handleReset}
                className="bg-teal-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4" /> Register Another
              </button>
              <Link href="/receptionist-dashboard/students"
                className="bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center">
                Return to Directory
              </Link>
            </div>
          </div>
        )}

      </div>
    </ReceptionistLayout>
  )
}