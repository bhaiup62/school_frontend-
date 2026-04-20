'use client'
import { useState } from 'react'

interface FacultyMember {
  name: string; subject: string; dept: string; exp: string; qual: string; avatar: string; color: string;
}

export default function FacultyClient({ faculty, depts }: { faculty: FacultyMember[], depts: string[] }) {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? faculty : faculty.filter(f => f.dept === active)

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap gap-2 mb-10">
          {depts.map(d => (
            <button key={d} onClick={() => setActive(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${active === d ? 'bg-navy-700 text-white' : 'bg-white text-slate-600 border hover:border-navy-300'}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((member) => (
            <div key={member.name} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow text-center">
              <div className={`w-14 h-14 rounded-full ${member.color} font-bold text-lg flex items-center justify-center mx-auto mb-3 font-display`}>
                {member.avatar}
              </div>
              <h3 className="font-display font-bold text-navy-800 text-base">{member.name}</h3>
              <p className="text-gold-600 text-sm font-medium">{member.subject}</p>
              <p className="text-slate-400 text-xs mt-1">{member.qual}</p>
              <div className="mt-3 inline-block bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">
                {member.exp} experience
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
