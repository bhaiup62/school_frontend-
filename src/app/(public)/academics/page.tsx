import PageHeader from '@/components/ui/PageHeader'
import { BookOpen, Clock, Users, Award, Download } from 'lucide-react'
import Link from 'next/link'

const streams = [
  {
    name: 'Science (PCM)',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science / Physical Education'],
    career: 'Engineering, IIT/JEE, Architecture, BSc',
    color: 'border-blue-300 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Science (PCB)',
    subjects: ['Physics', 'Chemistry', 'Biology', 'English', 'Physical Education / IP'],
    career: 'Medicine, NEET, Pharmacy, Biotechnology',
    color: 'border-green-300 bg-green-50',
    badge: 'bg-green-100 text-green-700',
  },
  {
    name: 'Commerce',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics / IP'],
    career: 'CA, MBA, Banking, Finance, BCom',
    color: 'border-orange-300 bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Arts / Humanities',
    subjects: ['History', 'Geography', 'Political Science', 'English', 'Hindi / Sociology / Psychology'],
    career: 'UPSC/IAS, Law, Journalism, Education, BA',
    color: 'border-purple-300 bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
  },
]

const timetable = [
  { day: 'Monday', periods: ['English', 'Mathematics', 'Science', 'Hindi', 'Social Studies', 'Computer', 'Sports'] },
  { day: 'Tuesday', periods: ['Mathematics', 'English', 'Hindi', 'Science', 'GK', 'Art', 'Library'] },
  { day: 'Wednesday', periods: ['Science', 'Social Studies', 'English', 'Mathematics', 'Sanskrit', 'Music', 'Sports'] },
  { day: 'Thursday', periods: ['Hindi', 'Mathematics', 'English', 'Science', 'Computer', 'Social Studies', 'Art'] },
  { day: 'Friday', periods: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'GK', 'Sports'] },
  { day: 'Saturday', periods: ['English', 'Hindi', 'Mathematics', 'Art', 'Computer', 'Library', '—'] },
]

export default function AcademicsPage() {
  return (
    <>
      <PageHeader
        title="Academics"
        subtitle="Comprehensive CBSE curriculum from Nursery to Class XII with dedicated faculty and modern pedagogy."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Academics' }]}
      />

      {/* Key info */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, label: 'CBSE Affiliated', sub: 'Since 1992' },
            { icon: Users, label: '120+ Teachers', sub: 'Qualified & Trained' },
            { icon: Clock, label: '7:30 AM – 2:00 PM', sub: 'School Timing' },
            { icon: Award, label: '98% Pass Rate', sub: 'Board Results 2024' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Icon className="w-6 h-6 text-gold-500 mx-auto mb-2" />
              <div className="font-semibold text-navy-800 text-sm">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Senior Secondary Streams */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Class XI – XII</div>
            <h2 className="section-title">Senior Secondary Streams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {streams.map((stream) => (
              <div key={stream.name} className={`rounded-2xl border-2 ${stream.color} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-navy-800 text-xl">{stream.name}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${stream.badge}`}>Stream</span>
                </div>
                <div className="mb-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Subjects</div>
                  <div className="flex flex-wrap gap-1.5">
                    {stream.subjects.map(s => (
                      <span key={s} className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Career paths:</span> {stream.career}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Timetable */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-1">Sample Schedule</div>
              <h2 className="section-title mb-0">Weekly Timetable (Class VI–VIII)</h2>
            </div>
            <Link href="/downloads" className="btn-primary text-sm">
              <Download className="w-4 h-4" /> Download PDF
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-navy-800 text-white text-sm">
                  <th className="text-left px-4 py-3 font-semibold">Day</th>
                  {['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'].map(p => (
                    <th key={p} className="text-center px-3 py-3 font-semibold">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable.map((row, i) => (
                  <tr key={row.day} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-4 py-3 font-semibold text-navy-700 text-sm">{row.day}</td>
                    {row.periods.map((p, j) => (
                      <td key={j} className="text-center px-3 py-3 text-xs text-slate-600">{p}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
