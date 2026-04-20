import { Trophy, Users, BookOpen, Medal, Building2, Star } from 'lucide-react'

const stats = [
  { icon: Trophy, value: '40+', label: 'Years of Excellence' },
  { icon: Users, value: '3,500+', label: 'Current Students' },
  { icon: BookOpen, value: '120+', label: 'Qualified Teachers' },
  { icon: Medal, value: '98%', label: 'Board Pass Rate' },
  { icon: Building2, value: '25+', label: 'Classrooms & Labs' },
  { icon: Star, value: '500+', label: 'Alumni Achievers' },
]

export default function StatsBar() {
  return (
    <section className="bg-navy-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center group">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center group-hover:bg-gold-500/30 transition-colors">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-white">{value}</div>
              <div className="text-slate-400 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
