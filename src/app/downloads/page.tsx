import PageHeader from '@/components/ui/PageHeader'
import { FileText, Download, Bell } from 'lucide-react'

const downloads = [
  { category: 'Admission', files: [
    { name: 'Admission Form 2025-26', size: '245 KB', type: 'PDF', date: '01 Mar 2025' },
    { name: 'Fee Structure 2025-26', size: '180 KB', type: 'PDF', date: '01 Mar 2025' },
    { name: 'Document Checklist', size: '95 KB', type: 'PDF', date: '01 Mar 2025' },
  ]},
  { category: 'Academic', files: [
    { name: 'Annual Academic Calendar 2025-26', size: '310 KB', type: 'PDF', date: '15 Feb 2025' },
    { name: 'Timetable — Class IX-X', size: '150 KB', type: 'PDF', date: '10 Feb 2025' },
    { name: 'Timetable — Class XI-XII', size: '160 KB', type: 'PDF', date: '10 Feb 2025' },
    { name: 'Syllabus — Class VI-VIII (2025)', size: '520 KB', type: 'PDF', date: '05 Feb 2025' },
  ]},
  { category: 'Exam', files: [
    { name: 'Pre-Board Exam Schedule — Class X', size: '120 KB', type: 'PDF', date: '20 Mar 2025' },
    { name: 'Pre-Board Exam Schedule — Class XII', size: '125 KB', type: 'PDF', date: '20 Mar 2025' },
    { name: 'Exam Guidelines & Rules', size: '200 KB', type: 'PDF', date: '01 Jan 2025' },
  ]},
  { category: 'Circulars', files: [
    { name: 'Annual Sports Day Circular', size: '110 KB', type: 'PDF', date: '22 Mar 2025' },
    { name: 'Parent-Teacher Meeting Notice', size: '98 KB', type: 'PDF', date: '15 Mar 2025' },
    { name: 'Summer Vacation Notice 2025', size: '95 KB', type: 'PDF', date: '10 Mar 2025' },
  ]},
]

const notices = [
  { date: '22 Mar 2025', tag: 'Exam', text: 'Class X & XII Pre-Board Examination Schedule — April 2025' },
  { date: '20 Mar 2025', tag: 'Holiday', text: 'School Holiday on 25th March 2025 — Holi (Second Day)' },
  { date: '18 Mar 2025', tag: 'Event', text: 'Annual Sports Day — 5th April 2025 at School Ground, 9 AM' },
  { date: '15 Mar 2025', tag: 'Meeting', text: 'Parent-Teacher Meeting for Classes VI-X — 20th March 2025' },
  { date: '12 Mar 2025', tag: 'Result', text: 'Half-Yearly Examination Results Declared — Check Portal' },
  { date: '08 Mar 2025', tag: 'Admission', text: 'Admissions Open for 2025-26 Session — Limited Seats Available' },
  { date: '01 Mar 2025', tag: 'Fee', text: 'Q4 Fee Payment Deadline: 31st March 2025' },
  { date: '22 Feb 2025', tag: 'Circular', text: 'Annual Cultural Program Date Announced — 20th April 2025' },
]

const tagColors: Record<string, string> = {
  Exam: 'bg-red-100 text-red-700',
  Holiday: 'bg-blue-100 text-blue-700',
  Event: 'bg-green-100 text-green-700',
  Meeting: 'bg-orange-100 text-orange-700',
  Result: 'bg-purple-100 text-purple-700',
  Admission: 'bg-gold-100 text-yellow-700',
  Fee: 'bg-rose-100 text-rose-700',
  Circular: 'bg-slate-100 text-slate-700',
}

export default function DownloadsPage() {
  return (
    <>
      <PageHeader
        title="Downloads & Notices"
        subtitle="Access all school circulars, forms, timetables, syllabi, and important notices."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Downloads' }]}
      />

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Downloads */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="section-title">Downloads</h2>
            {downloads.map((section) => (
              <div key={section.category} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-navy-800 text-white px-5 py-3 text-sm font-semibold">{section.category}</div>
                {section.files.map((file, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i !== section.files.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors`}>
                    <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{file.name}</div>
                      <div className="text-xs text-slate-400">{file.type} • {file.size} • {file.date}</div>
                    </div>
                    <button className="shrink-0 w-9 h-9 bg-navy-50 hover:bg-navy-700 hover:text-white text-navy-700 rounded-xl flex items-center justify-center transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Notice board */}
          <div>
            <h2 className="section-title">Notice Board</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {notices.map((notice, i) => (
                <div key={i} className={`p-4 ${i !== notices.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-3.5 h-3.5 text-gold-500" />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColors[notice.tag] || 'bg-slate-100 text-slate-600'}`}>
                      {notice.tag}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto">{notice.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notice.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
