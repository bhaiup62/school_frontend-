'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getApplications } from '@/services/admin/admissionService'
import { 
  FileText, Search, Filter, Eye, CreditCard, 
  CheckCircle2, Clock, XCircle, AlertCircle, TrendingUp, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// The exact pipeline stages from our backend model
const PIPELINE_STAGES = [
  'All',
  'Draft', 
  'Submitted', 
  'Document Verified', 
  'Test Scheduled', 
  'Offered', 
  'Waitlisted', 
  'Rejected', 
  'Admitted'
]

export default function ApplicationsPipelinePage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [activeStage, setActiveStage] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const loadApplications = async () => {
    setLoading(true)
    try {
      const filters = activeStage !== 'All' ? { pipelineStatus: activeStage as any } : {}
      const res = await getApplications(filters)
      setApplications(res.data)
    } catch (error) {
      console.error('Failed to load applications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [activeStage])

  const filteredApps = applications.filter(app => {
    const childName = `${app.childData.firstName} ${app.childData.lastName}`.toLowerCase()
    const appNo = app.applicationNumber.toLowerCase()
    const search = searchQuery.toLowerCase()
    return childName.includes(search) || appNo.includes(search)
  })

  // Helper for Payment Badge
  const getPaymentBadge = (status: string) => {
    if (status === 'Paid') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100"><CheckCircle2 className="w-3 h-3"/> Paid</span>
    if (status === 'Failed') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100"><XCircle className="w-3 h-3"/> Failed</span>
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100"><Clock className="w-3 h-3"/> Pending</span>
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-4">
          <Link href="/admin-dashboard/admissions" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admissions Hub
          </Link>
        </div>
        
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-violet-600" /> Application Pipeline
            </h1>
            <p className="text-slate-500 text-sm mt-1">Review documents, schedule tests, and process enrollments.</p>
          </div>
          <Link 
            href="/admin-dashboard/admissions/applications/new" 
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-violet-600/20"
          >
            Create New Application
          </Link>
        </div>

        {/* ── Pipeline Stage Tabs (The Funnel) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex overflow-x-auto hide-scrollbar">
          {PIPELINE_STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeStage === stage 
                  ? 'bg-violet-50 text-violet-700 shadow-sm border border-violet-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
              }`}
            >
              {stage === 'All' && <TrendingUp className="w-4 h-4" />}
              {stage === 'Admitted' && <CheckCircle2 className="w-4 h-4" />}
              {stage === 'Rejected' && <XCircle className="w-4 h-4" />}
              {stage}
            </button>
          ))}
        </div>

        {/* ── Applications Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by App No. or Child Name..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" 
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">App Number</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Applicant</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Class</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Payment</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Stage</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center"><div className="inline-block animate-spin w-6 h-6 border-4 border-violet-600 border-t-transparent rounded-full" /></td></tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No applications found in this stage.</p>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-violet-700">{app.applicationNumber}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{app.childData.firstName} {app.childData.lastName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Parent: {app.parentData.fatherName || app.parentData.motherName}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {app.appliedClass?.className || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentBadge(app.payment?.status || 'Pending')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {app.pipelineStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin-dashboard/admissions/applications/${app._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-violet-700 hover:border-violet-200 hover:bg-violet-50 transition-all font-bold text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
