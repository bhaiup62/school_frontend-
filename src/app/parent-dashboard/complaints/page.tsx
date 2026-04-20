'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, Plus, Clock, CheckCircle, AlertCircle, 
  Send, ChevronDown, Filter, Search 
} from 'lucide-react'
import * as parentService from '@/services/parentService'

type Complaint = parentService.Complaint

const categoryOptions = [
  { value: 'academic', label: 'Academic' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'transport', label: 'Transport' },
  { value: 'fees', label: 'Fees' },
  { value: 'other', label: 'Other' },
]

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
]

const statusColors: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default function ParentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    category: 'academic',
    subject: '',
    description: '',
    relatedStudent: '',
    relatedTeacher: '',
    priority: 'normal',
  })

  useEffect(() => {
    loadData()
  }, [filterStatus])

  const loadData = async () => {
    try {
      const [complaintsRes, childrenRes] = await Promise.all([
        parentService.getMyComplaints({ status: filterStatus || undefined }),
        parentService.getChildren(),
      ])
      setComplaints(complaintsRes.data || [])
      setChildren(childrenRes.data || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.description) return

    setSubmitting(true)
    try {
      await parentService.submitComplaint(form)
      setShowNewModal(false)
      setForm({
        category: 'academic',
        subject: '',
        description: '',
        relatedStudent: '',
        relatedTeacher: '',
        priority: 'normal',
      })
      loadData()
    } catch (err) {
      console.error('Failed to submit complaint:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddComment = async () => {
    if (!selectedComplaint || !newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await parentService.addComplaintComment(selectedComplaint.ticketNumber, newComment)
      setSelectedComplaint(res.data)
      setNewComment('')
      loadData()
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredComplaints = complaints.filter(c =>
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-600">Submit and track your complaints</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              <p className="text-sm text-gray-600">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ticket or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {filteredComplaints.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-600">You haven&apos;t submitted any complaints yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                onClick={() => setSelectedComplaint(complaint)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-blue-600">{complaint.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[complaint.status]}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        priorityOptions.find(p => p.value === complaint.priority)?.color || 'bg-gray-100'
                      }`}>
                        {complaint.priority}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{complaint.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{complaint.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Category: {complaint.category}</span>
                      <span>•</span>
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                      {complaint.comments.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{complaint.comments.length} comments</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Submit New Complaint</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {priorityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief subject of your complaint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide detailed description of your complaint..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Student (Optional)</label>
                  <select
                    value={form.relatedStudent}
                    onChange={(e) => setForm({ ...form, relatedStudent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select student</option>
                    {children.map((child: any) => (
                      <option key={child.admissionNumber} value={child.admissionNumber}>
                        {child.firstName} {child.lastName} ({child.class}-{child.section})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Teacher (Optional)</label>
                <input
                  type="text"
                  value={form.relatedTeacher}
                  onChange={(e) => setForm({ ...form, relatedTeacher: e.target.value })}
                  placeholder="Teacher name if applicable"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-blue-600 font-medium">{selectedComplaint.ticketNumber}</span>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedComplaint.subject}</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedComplaint.status]}`}>
                  {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900">{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 text-gray-900 capitalize">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                    priorityOptions.find(p => p.value === selectedComplaint.priority)?.color
                  }`}>
                    {selectedComplaint.priority}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <span className="ml-2 text-gray-900">{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                </div>
                {selectedComplaint.resolvedAt && (
                  <div>
                    <span className="text-gray-500">Resolved:</span>
                    <span className="ml-2 text-gray-900">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {selectedComplaint.resolution && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-sm font-medium text-green-800 mb-1">Resolution</h3>
                  <p className="text-green-700">{selectedComplaint.resolution}</p>
                </div>
              )}

              {/* Comments */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Comments ({selectedComplaint.comments.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedComplaint.comments.map((comment, i) => (
                    <div key={i} className={`p-3 rounded-lg ${
                      comment.byRole === 'parent' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.byRole}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>

                {selectedComplaint.status !== 'closed' && selectedComplaint.status !== 'resolved' && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
