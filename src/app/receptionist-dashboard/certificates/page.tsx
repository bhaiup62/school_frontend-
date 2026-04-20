'use client'
import { useState } from 'react'
import ReceptionistLayout from '@/components/receptionist/ReceptionistLayout'
import { getStudentDetails, generateBonafideCertificate, generateCharacterCertificate } from '@/services/receptionistService'
import type { StudentDetail, CertificateData } from '@/services/receptionistService'
import { FileText, Search, Printer, AlertTriangle, CheckCircle, User, X, ShieldCheck } from 'lucide-react'

export default function CertificatesPage() {
  const [admissionNo, setAdmissionNo] = useState('')
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admissionNo.trim()) return
    setLoading(true)
    setStudent(null)
    setCertificate(null)
    setMessage({ type: '', text: '' })
    try {
      const res = await getStudentDetails(admissionNo.trim())
      setStudent(res.data)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Student not found in active records.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (type: 'bonafide' | 'character') => {
    if (!student) return
    setGenerating(true)
    setCertificate(null)
    setMessage({ type: '', text: '' })
    try {
      const fn = type === 'bonafide' ? generateBonafideCertificate : generateCharacterCertificate
      const res = await fn(student.admissionNumber)
      
      // 🛡️ FIX: Backend now perfectly sends { success: true, data: { certificate properties } }
      setCertificate(res.data) 
      setMessage({ type: 'success', text: `${type === 'bonafide' ? 'Bonafide' : 'Character'} Certificate generated successfully!` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to generate certificate.' })
    } finally {
      setGenerating(false)
    }
  }

  const printCertificate = () => {
    window.print()
  }

  const clearSearch = () => {
    setStudent(null)
    setCertificate(null)
    setAdmissionNo('')
    setMessage({ type: '', text: '' })
  }

  return (
    <ReceptionistLayout>
      <div className="space-y-6 max-w-5xl mx-auto print:m-0 print:p-0">
        
        {/* UI Container (Hidden during Print) */}
        <div className="print:hidden space-y-6">
          
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                  <FileText className="w-8 h-8" /> Certificate Generator
                </h1>
                <p className="text-teal-100 font-medium">
                  Generate official Bonafide and Character certificates instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter Student Admission Number (e.g., SPS-2024-0001)..."
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
                />
              </div>
              <button type="submit" disabled={loading || !admissionNo.trim()}
                className="bg-teal-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm shadow-teal-500/20">
                {loading ? 'Searching...' : 'Find Student'}
              </button>
            </form>
          </div>

          {/* Global Messages */}
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm animate-in fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          {/* Student Found ID Card */}
          {student && !certificate && (
            <div className="bg-white rounded-3xl border border-teal-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-teal-50 border-b border-teal-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-teal-200 shadow-sm"><User className="w-5 h-5 text-teal-600" /></div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">Student Profile Found</h3>
                </div>
                <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-xl shadow-sm border border-slate-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                <div className="space-y-4 text-center md:text-left">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{student.firstName} {student.lastName}</h2>
                    <p className="text-slate-500 font-mono tracking-wider font-semibold mt-1">{student.admissionNumber}</p>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold shadow-sm">
                      Class {student.class}-{student.section}
                    </span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold shadow-sm">
                      Roll No: {student.rollNumber}
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shadow-sm">
                      {student.parents?.fatherName || 'Father N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                  <button onClick={() => handleGenerate('bonafide')} disabled={generating}
                    className="flex-1 md:flex-none bg-teal-600 text-white px-6 py-4 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-teal-500/20 flex flex-col items-center gap-2">
                    <ShieldCheck className="w-6 h-6" />
                    <span>Generate Bonafide</span>
                  </button>
                  <button onClick={() => handleGenerate('character')} disabled={generating}
                    className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-4 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 flex flex-col items-center gap-2">
                    <FileText className="w-6 h-6" />
                    <span>Generate Character</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Action Bar (When Generated) */}
          {certificate && (
            <div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg animate-in fade-in">
              <p className="text-white font-bold ml-2">Preview Document Ready</p>
              <div className="flex gap-3">
                <button onClick={clearSearch} className="px-4 py-2 bg-slate-700 text-white hover:bg-slate-600 rounded-xl text-sm font-bold transition-colors">
                  Cancel
                </button>
                <button onClick={printCertificate} className="px-6 py-2 bg-teal-500 text-white hover:bg-teal-400 rounded-xl text-sm font-bold transition-colors shadow-md flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print Document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            PRINTABLE CERTIFICATE PREVIEW (A4 Styled)
            ======================================================== */}
        {certificate && (
          <div id="certificate-print" className="bg-white rounded-none md:rounded-3xl border border-slate-200 overflow-hidden shadow-2xl mx-auto w-full max-w-[21cm] min-h-[29.7cm] flex items-center justify-center p-8 print:p-0 print:border-none print:shadow-none print:max-w-full print:min-h-0">
            <div className="w-full h-full border-8 border-double border-slate-800 p-10 md:p-16 relative">
              
              {/* Watermark Logo (Optional Visual) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                 <ShieldCheck className="w-96 h-96" />
              </div>

              {/* Certificate Header */}
              <div className="text-center mb-12 relative z-10">
                <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 mb-2 uppercase tracking-wider">{certificate.schoolName}</h1>
                <p className="text-base text-slate-600 font-medium">{certificate.schoolAddress}</p>
                <div className="w-64 h-1 bg-slate-800 mx-auto mt-6 mb-1"></div>
                <div className="w-48 h-0.5 bg-slate-400 mx-auto"></div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-display font-black text-center text-slate-800 mb-10 uppercase tracking-[0.2em] border-y-2 border-slate-200 py-4 relative z-10">
                {certificate.type} Certificate
              </h2>
              
              <div className="flex justify-between items-center text-sm font-bold text-slate-600 mb-8 relative z-10">
                <p>Ref No: <span className="font-mono text-slate-800 ml-1">{certificate.certificateNo}</span></p>
                <p>Date: <span className="text-slate-800 ml-1">{certificate.issueDate}</span></p>
              </div>
              
              {/* Certificate Body */}
              <div className="text-lg leading-[2.5] text-slate-800 text-justify relative z-10 font-medium">
                <p className="indent-12">
                  This is to certify that <strong>{certificate.studentName}</strong>, 
                  {' '}{certificate.sonDaughterOf} <strong>{certificate.fatherName}</strong>, 
                  {' '}is a bonafide student of our institution. 
                </p>
                
                <p className="mt-4">
                  According to the school records, the student's date of birth is <strong>{certificate.dateOfBirth}</strong>. 
                  They are currently enrolled in Class <strong>{certificate.class}</strong>, Section <strong>'{certificate.section}'</strong> 
                  for the ongoing academic session, bearing Admission Number <strong>{certificate.admissionNumber}</strong> and Roll Number <strong>{certificate.rollNumber}</strong>.
                </p>
                
                {certificate.characterRemarks && (
                  <p className="mt-4">
                    <strong>Character & Conduct:</strong> {certificate.characterRemarks}
                  </p>
                )}
                
                <p className="mt-8 italic text-slate-600">
                  * This certificate is issued upon the request of the parent/guardian for the purpose of <strong>{certificate.purpose}</strong>.
                </p>
              </div>
              
              {/* Signatures */}
              <div className="mt-32 flex justify-between items-end relative z-10">
                <div className="text-center">
                  <div className="w-40 border-t border-slate-800 pt-2 mx-auto">
                    <p className="text-base font-bold text-slate-800">Class Teacher</p>
                  </div>
                </div>
                
                {/* School Seal Placeholder */}
                <div className="w-24 h-24 rounded-full border-2 border-slate-300 border-dashed flex items-center justify-center opacity-50 relative -top-6">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">School<br/>Seal</span>
                </div>

                <div className="text-center">
                  <div className="w-48 border-t border-slate-800 pt-2 mx-auto">
                    <p className="text-base font-bold text-slate-800">Principal</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">{certificate.schoolName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Print Styles to enforce A4 size and hide navigation */}
      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white !important; margin: 0; padding: 0; }
          nav, header, footer, aside, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; background: white !important; }
          
          #certificate-print {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 21cm !important;
            height: 29.7cm !important;
            margin: 0 !important;
            padding: 1.5cm !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
    </ReceptionistLayout>
  )
}