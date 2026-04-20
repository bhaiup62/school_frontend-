import PageHeader from '@/components/ui/PageHeader'


const toppers2024 = [
  { rank: 1, name: 'Priya Sharma', class: 'Class XII (PCM)', percent: '98.4%', color: 'bg-yellow-100 border-yellow-300', badge: '🥇' },
  { rank: 2, name: 'Ankit Mishra', class: 'Class XII (Commerce)', percent: '97.2%', color: 'bg-slate-100 border-slate-300', badge: '🥈' },
  { rank: 3, name: 'Sneha Verma', class: 'Class X', percent: '96.8%', color: 'bg-orange-100 border-orange-300', badge: '🥉' },
  { rank: 4, name: 'Rohan Gupta', class: 'Class XII (PCB)', percent: '96.0%', color: 'bg-blue-50 border-blue-200', badge: '⭐' },
  { rank: 5, name: 'Kavya Singh', class: 'Class X', percent: '95.6%', color: 'bg-green-50 border-green-200', badge: '⭐' },
]

const overall = [
  { label: 'Class X Pass %', val: '99.2%', sub: '2024 Board' },
  { label: 'Class XII Pass %', val: '98.7%', sub: '2024 Board' },
  { label: 'Distinction (>90%)', val: '42%', sub: 'Class X & XII' },
  { label: 'First Division', val: '88%', sub: 'All classes' },
]

const yearwise = [
  { year: '2024', x: '99.2%', xii: '98.7%', dist: '42%' },
  { year: '2023', x: '98.8%', xii: '97.9%', dist: '38%' },
  { year: '2022', x: '98.1%', xii: '97.2%', dist: '35%' },
  { year: '2021', x: '97.5%', xii: '96.8%', dist: '32%' },
  { year: '2020', x: '97.0%', xii: '96.1%', dist: '30%' },
]

export default function ResultsPage() {
  return (
    <>
      <PageHeader
        title="Academic Results"
        subtitle="Celebrating our students' outstanding performance in CBSE Board Examinations."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Academics', href: '/academics' }, { label: 'Results' }]}
      />

      {/* Summary stats */}
      <section className="py-10 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {overall.map(({ label, val, sub }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-display font-bold text-gold-400">{val}</div>
              <div className="text-white text-sm font-medium mt-1">{label}</div>
              <div className="text-slate-400 text-xs">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Toppers */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Board Exam 2024</div>
            <h2 className="section-title">School Toppers</h2>
          </div>
          <div className="space-y-4">
            {toppers2024.map((t) => (
              <div key={t.rank} className={`flex items-center gap-5 rounded-2xl border-2 ${t.color} p-5`}>
                <div className="text-3xl">{t.badge}</div>
                <div className="flex-1">
                  <div className="font-display font-bold text-navy-800 text-lg">{t.name}</div>
                  <div className="text-slate-500 text-sm">{t.class}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-black text-navy-800">{t.percent}</div>
                  <div className="text-xs text-slate-400">Aggregate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Year-wise table */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="section-title">Year-wise Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-navy-800 text-white text-sm">
                  <th className="text-left px-6 py-3 font-semibold">Year</th>
                  <th className="text-center px-6 py-3 font-semibold">Class X Pass %</th>
                  <th className="text-center px-6 py-3 font-semibold">Class XII Pass %</th>
                  <th className="text-center px-6 py-3 font-semibold">Distinction %</th>
                </tr>
              </thead>
              <tbody>
                {yearwise.map((row, i) => (
                  <tr key={row.year} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-6 py-3 font-bold text-navy-700">{row.year}</td>
                    <td className="text-center px-6 py-3 text-sm text-green-700 font-semibold">{row.x}</td>
                    <td className="text-center px-6 py-3 text-sm text-blue-700 font-semibold">{row.xii}</td>
                    <td className="text-center px-6 py-3 text-sm text-gold-600 font-semibold">{row.dist}</td>
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
