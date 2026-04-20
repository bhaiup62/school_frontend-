import PageHeader from '@/components/ui/PageHeader'
import { Target, Eye, Heart, Award, Users, BookOpen, GraduationCap } from 'lucide-react'

const team = [
  { name: 'Dr. Ramesh Tiwari', role: 'Principal', exp: '28 years', avatar: 'RT', color: 'bg-blue-100 text-blue-700' },
  { name: 'Mrs. Sunita Sharma', role: 'Vice Principal', exp: '20 years', avatar: 'SS', color: 'bg-purple-100 text-purple-700' },
  { name: 'Mr. Anil Gupta', role: 'Academic Director', exp: '18 years', avatar: 'AG', color: 'bg-green-100 text-green-700' },
]

const milestones = [
  { year: '1985', event: 'School founded by Late Pt. Shivkant Mishra with 120 students' },
  { year: '1992', event: 'CBSE affiliation obtained, classes extended to X' },
  { year: 1999, event: 'Senior Secondary added — Science & Commerce streams' },
  { year: '2005', event: 'New building constructed, capacity expanded to 2000 students' },
  { year: '2012', event: 'Computer labs, smart classrooms & e-learning introduced' },
  { year: '2018', event: 'Arts stream launched; school crosses 3000 student enrollment' },
  { year: '2024', event: 'Best School Award — Varanasi District by UP Government' },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Our School"
        subtitle="A legacy of four decades — shaping generations with knowledge, values, and purpose."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      {/* Mission Vision Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Our Mission', color: 'bg-blue-50 text-blue-600', text: 'To provide quality education that empowers every student with knowledge, skills, and values to become responsible citizens and future leaders.' },
              { icon: Eye, title: 'Our Vision', color: 'bg-gold-50 text-gold-600', text: 'To be the most respected educational institution in Varanasi, known for academic excellence, character building, and holistic development.' },
              { icon: Heart, title: 'Our Values', color: 'bg-red-50 text-red-600', text: 'Integrity, Respect, Excellence, Compassion, and Discipline. These five values guide every decision, interaction, and activity within our campus.' },
            ].map(({ icon: Icon, title, color, text }) => (
              <div key={title} className="text-center p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-navy-800 text-xl mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About content */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Our Story</div>
            <h2 className="section-title">Four Decades of Excellence</h2>
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>Founded in 1985 by the visionary educator Late Pt. Shivkant Mishra, Saraswati Public School began its journey with just 120 students and a dream to bring quality English-medium education to Varanasi.</p>
              <p>Today, we are home to over 3,500 students from Nursery to Class XII, guided by 120+ qualified teachers who are passionate about shaping young minds. Our CBSE-affiliated curriculum balances rigorous academics with co-curricular excellence.</p>
              <p>Our alumni include IIT and IIM graduates, doctors, engineers, civil servants, artists and entrepreneurs — each carrying forward the values and education they received within our walls.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: Award, val: '40+', label: 'Years' },
                { icon: Users, val: '3,500+', label: 'Students' },
                { icon: GraduationCap, val: '10,000+', label: 'Alumni' },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} className="bg-white rounded-xl p-4 text-center border border-slate-100">
                  <Icon className="w-5 h-5 text-gold-500 mx-auto mb-1" />
                  <div className="font-display font-bold text-navy-800 text-xl">{val}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Milestones */}
          <div>
            <h3 className="font-display font-bold text-navy-800 text-xl mb-6">School Milestones</h3>
            <div className="relative pl-6 border-l-2 border-gold-200 space-y-5">
              {milestones.map((m, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gold-400 border-2 border-white shadow" />
                  <div className="text-xs font-bold text-gold-600 mb-0.5">{m.year}</div>
                  <p className="text-sm text-slate-600">{m.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="section-title">School Leadership</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="card p-6 text-center">
                <div className={`w-16 h-16 rounded-full ${member.color} font-bold text-xl flex items-center justify-center mx-auto mb-3 font-display`}>
                  {member.avatar}
                </div>
                <h3 className="font-display font-bold text-navy-800 text-lg">{member.name}</h3>
                <p className="text-gold-600 text-sm font-medium">{member.role}</p>
                <p className="text-slate-400 text-xs mt-1">{member.exp} experience</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
