// src/app/admin-dashboard/staff/page.tsx
'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getStaffMembers, createStaffMember, updateStaffMember, deactivateStaffMember } from '@/services/admin/staffService'
import { Users, Plus, Mail, Phone, Briefcase, RefreshCw, X, User, Edit2, AlertTriangle } from 'lucide-react'

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

export default function StaffManagerPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active')

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', gender: 'Male', role: 'teacher'
  })

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    firstName: '', lastName: '', phone: '', gender: ''
  })

  const loadStaff = async () => {
    setIsRefreshing(true)
    try {
      const res = await getStaffMembers(roleFilter || undefined, statusFilter)
      setStaff(res.data || [])
    } catch (error) {
      console.error('Failed to load staff', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => { loadStaff() }, [roleFilter, statusFilter])

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createStaffMember(formData as any)
      setShowCreateModal(false)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', gender: 'Male', role: 'teacher' })
      loadStaff()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create staff member.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (member: any) => {
    setSelectedStaff(member)
    setEditFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      gender: member.gender
    })
    setShowEditModal(true)
  }

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateStaffMember(selectedStaff._id, { ...editFormData, role: selectedStaff.role })
      setShowEditModal(false)
      loadStaff()
    } catch (error: any) {
      alert('Failed to update staff member.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeactivate = async () => {
    if (!window.confirm(`Are you absolutely sure you want to deactivate ${selectedStaff.firstName}? They will lose all login access instantly.`)) return;
    setIsSubmitting(true)
    try {
      await deactivateStaffMember(selectedStaff._id, selectedStaff.role)
      setShowEditModal(false)
      loadStaff()
    } catch (error: any) {
      alert('Failed to deactivate staff member.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-end mb-2">
          <button onClick={loadStaff} disabled={isRefreshing} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} /> Refresh
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-600" /> Staff Directory
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage teachers, receptionists, and organizational roles.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="flex-1 md:flex-none border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none bg-slate-50">
              <option value="">All Staff</option>
              <option value="teacher">Teachers Only</option>
              <option value="receptionist">Receptionists Only</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'active' | 'inactive')}
              className="flex-1 md:flex-none border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none bg-slate-50"
            >
              <option value="active">Active Staff</option>
              <option value="inactive">Deactivated Staff</option>
            </select>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20">
              <Plus className="w-4 h-4" /> New Staff
            </button>
          </div>
        </div>

        {/* STAFF DATA GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
          ) : staff.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No staff members found</h3>
              <p className="text-slate-500 text-sm mt-1">Click "New Staff" to onboard your first employee.</p>
            </div>
          ) : (
            staff.map(member => (
              <div 
                key={member._id} 
                onClick={statusFilter === 'active' ? () => openEditModal(member) : undefined}
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all flex flex-col overflow-hidden group ${
                  statusFilter === 'active'
                    ? 'hover:border-indigo-400 hover:shadow-md hover:-translate-y-1 cursor-pointer'
                    : 'cursor-default'
                }`}
              >
                <div className="p-5 flex items-start gap-4 border-b border-slate-100 bg-slate-50/50 group-hover:bg-indigo-50/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0 border border-indigo-200">
                    {getInitials(member.firstName, member.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate flex items-center justify-between">
                      {member.firstName} {member.lastName}
                      {statusFilter === 'active' && (
                        <Edit2 className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{member.employeeId}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${member.role === 'teacher' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {member.role || 'Staff'}
                      </span>
                      {statusFilter === 'inactive' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                          INACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-center gap-3 text-sm text-slate-600"><Mail className="w-4 h-4 text-slate-400 shrink-0" /><span className="truncate font-medium">{member.email}</span></div>
                  <div className="flex items-center gap-3 text-sm text-slate-600"><Phone className="w-4 h-4 text-slate-400 shrink-0" /><span className="font-medium">{member.phone}</span></div>
                  <div className="flex items-center gap-3 text-sm text-slate-600"><User className="w-4 h-4 text-slate-400 shrink-0" /><span className="font-medium">{member.gender}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE STAFF MODAL (Unchanged) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          {/* ... Keep your existing CREATE modal JSX here (It is exactly the same as before) ... */}
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Onboard New Staff</h2>
              <button disabled={isSubmitting} onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 disabled:opacity-50"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateStaff} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">First Name *</label><input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" /></div>
                <div><label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Last Name *</label><input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Email *</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Phone *</label><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" /></div>
                <div><label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Gender *</label><select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-white"><option>Male</option><option>Female</option><option>Other</option></select></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Role *</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-indigo-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-indigo-50 text-indigo-900 font-bold"><option value="teacher">Teacher</option><option value="receptionist">Receptionist</option></select>
              </div>
              <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                <button type="button" disabled={isSubmitting} onClick={() => setShowCreateModal(false)} className="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20">Create Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT & DEACTIVATE MODAL */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><Edit2 className="w-4 h-4 text-indigo-600"/> Edit Profile: {selectedStaff.employeeId}</h2>
              <button disabled={isSubmitting} onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 disabled:opacity-50"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleUpdateStaff} className="p-6 space-y-5 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">First Name</label>
                  <input type="text" required value={editFormData.firstName} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Last Name</label>
                  <input type="text" required value={editFormData.lastName} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Phone Number</label>
                  <input type="tel" required value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Gender</label>
                  <select value={editFormData.gender} onChange={e => setEditFormData({...editFormData, gender: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 border border-red-200 bg-red-50 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Danger Zone</h3>
                <p className="text-xs text-red-600 mb-3">Deactivating this account will immediately revoke their login access and hide them from active lists. Data will not be deleted.</p>
                <button type="button" onClick={handleDeactivate} disabled={isSubmitting} className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-lg text-sm transition-colors border border-red-200">
                  Deactivate Staff Member
                </button>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                <button type="button" disabled={isSubmitting} onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-70 transition-colors shadow-lg shadow-indigo-600/20">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
