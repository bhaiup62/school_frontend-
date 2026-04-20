'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { 
  getEnquiries, createEnquiry, updateEnquiryStatus, deleteEnquiry, getClasses
} from '@/services/admin/admissionService'
import { 
  PhoneCall, Users, Plus, Filter, Search, 
  MoreVertical, Calendar, User, Mail, Trash2, X, AlertCircle, ArrowLeft
} from 'lucide-react'

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [form, setForm] = useState({
    parentName: '',
    phone: '',
    email: '',
    classInterestedIn: '',
    leadSource: 'Walk-in'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [enqRes, clsRes] = await Promise.all([
        getEnquiries(statusFilter !== 'All' ? { status: statusFilter as any } : {}),
        getClasses()
      ])
      setEnquiries(enqRes.data)
      setClasses(clsRes.data)
    } catch (error) {
      console.error('Failed to load enquiries', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEnquiry(form)
      setShowModal(false)
      setForm({ parentName: '', phone: '', email: '', classInterestedIn: '', leadSource: 'Walk-in' })
      loadData()
    } catch (error) {
      alert('Failed to create enquiry. Ensure you selected a class.')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateEnquiryStatus(id, { status: newStatus as any })
      loadData()
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return
    try {
      await deleteEnquiry(id)
      loadData()
    } catch (error) {
      alert('Failed to delete enquiry')
    }
  }

  // Stats
  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status === 'New').length,
    converted: enquiries.filter(e => e.status === 'Converted').length
  }

  const filteredEnquiries = enquiries.filter(e => 
    e.parentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.phone.includes(searchQuery)
  )

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Contacted': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Converted': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Dead': return 'bg-slate-100 text-slate-600 border-slate-200'
      default: return 'bg-slate-50 text-slate-600 border-slate-200'
    }
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
              <PhoneCall className="w-6 h-6 text-violet-600" /> Lead CRM & Enquiries
            </h1>
            <p className="text-slate-500 text-sm mt-1">Track prospective parents from first contact to application.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-violet-600/20">
            <Plus className="w-5 h-5" /> Log New Lead
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
            <div><p className="text-2xl font-bold text-slate-900">{stats.total}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</p></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div><p className="text-2xl font-bold text-slate-900">{stats.new}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New / Uncontacted</p></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <PhoneCall className="w-6 h-6 text-emerald-600" />
            </div>
            <div><p className="text-2xl font-bold text-slate-900">{stats.converted}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Converted</p></div>
          </div>
        </div>

        {/* ── CRM Table Area ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search by name or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 bg-white outline-none focus:border-violet-500 cursor-pointer">
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Dead">Dead</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Lead Details</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Contact Info</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Target Class</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center"><div className="inline-block animate-spin w-6 h-6 border-4 border-violet-600 border-t-transparent rounded-full" /></td></tr>
                ) : filteredEnquiries.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No leads found.</td></tr>
                ) : (
                  filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{enquiry.parentName}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(enquiry.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{enquiry.phone}</div>
                        {enquiry.email && <div className="text-xs text-slate-500 mt-0.5">{enquiry.email}</div>}
                      </td>
                      <td className="px-6 py-4 font-bold text-violet-700">
                        {enquiry.classInterestedIn?.className || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={enquiry.status} 
                          onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none ${getStatusColor(enquiry.status)}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                          <option value="Dead">Dead</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(enquiry._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── NEW ENQUIRY MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Log New Enquiry</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Parent Name</label>
                  <input type="text" required value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1"><PhoneCall className="w-3 h-3"/> Phone Number</label>
                  <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/> Email (Optional)</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Class</label>
                  <select required value={form.classInterestedIn} onChange={e => setForm({...form, classInterestedIn: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 outline-none bg-white">
                    <option value="" disabled>Select Class</option>
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>{c.className}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Lead Source</label>
                  <select required value={form.leadSource} onChange={e => setForm({...form, leadSource: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 outline-none bg-white">
                    <option value="Walk-in">Walk-in</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Website">Website Form</option>
                    <option value="Facebook">Facebook Ads</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors mt-4">Save Lead</button>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}
