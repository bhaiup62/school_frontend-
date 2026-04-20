'use client'
import { useState } from 'react'
import { Bell, Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const notices = [
  { date: '22 Mar 2025', tag: 'Exam', text: 'Class X & XII Pre-Board Examination Schedule — April 2025', type: 'important', link: '#' },
  { date: '20 Mar 2025', tag: 'Holiday', text: 'School Holiday on 25th March 2025 — Holi (Second Day)', type: 'info', link: '#' },
  { date: '18 Mar 2025', tag: 'Event', text: 'Annual Sports Day — 5th April 2025 at School Ground, 9 AM', type: 'event', link: '#' },
  { date: '15 Mar 2025', tag: 'Meeting', text: 'Parent-Teacher Meeting for Classes VI-X — 20th March 2025', type: 'important', link: '#' },
  { date: '12 Mar 2025', tag: 'Result', text: 'Half-Yearly Examination Results Declared — Check Portal', type: 'info', link: '#' },
  { date: '08 Mar 2025', tag: 'Admission', text: 'Admissions Open for 2025-26 Session — Limited Seats Available', type: 'event', link: '#' },
  { date: '01 Mar 2025', tag: 'Fee', text: 'Q4 Fee Payment Deadline: 31st March 2025 — Avoid Late Charges', type: 'important', link: '#' },
]

const tagColors: Record<string, string> = {
  important: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  event: 'bg-green-100 text-green-700',
}

export default function NoticeBoard() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? notices : notices.filter(n => n.type === filter)

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Stay Updated</div>
            <h2 className="section-title mb-0">Notice Board</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'important', 'info', 'event'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm capitalize font-medium transition-colors ${
                  filter === f ? 'bg-navy-700 text-white' : 'bg-white text-slate-600 border hover:border-navy-300'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {filtered.map((notice, i) => (
            <div key={i} className={`flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors ${i !== filtered.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <div className="w-10 h-10 bg-gold-50 rounded-xl flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-gold-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColors[notice.type]}`}>
                    {notice.tag}
                  </span>
                  <span className="text-xs text-slate-400">{notice.date}</span>
                </div>
                <p className="text-sm text-slate-700 font-medium">{notice.text}</p>
              </div>
              <a href={notice.link}
                className="shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-navy-100 rounded-lg transition-colors text-slate-500 hover:text-navy-700">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/downloads" className="btn-primary text-sm">
            View All Notices & Downloads <Download className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
