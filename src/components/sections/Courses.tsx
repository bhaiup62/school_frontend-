import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

const courses = [
  {
    level: 'Pre-Primary',
    classes: 'Nursery, LKG, UKG',
    desc: 'Play-based learning focused on cognitive, physical and emotional development.',
    subjects: ['Environmental Awareness', 'Language Skills', 'Number Skills', 'Drawing & Craft'],
    color: 'border-pink-200 bg-pink-50',
    badge: 'bg-pink-100 text-pink-700',
  },
  {
    level: 'Primary',
    classes: 'Class I – V',
    desc: 'Building strong foundations in core subjects with activity-based learning.',
    subjects: ['English', 'Hindi', 'Mathematics', 'EVS', 'GK & Computer'],
    color: 'border-blue-200 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    level: 'Middle School',
    classes: 'Class VI – VIII',
    desc: 'Developing analytical thinking with a broader NCERT/CBSE curriculum.',
    subjects: ['Science', 'Mathematics', 'Social Studies', 'English', 'Hindi', 'Sanskrit'],
    color: 'border-green-200 bg-green-50',
    badge: 'bg-green-100 text-green-700',
  },
  {
    level: 'Secondary',
    classes: 'Class IX – X',
    desc: 'CBSE Board preparation with dedicated doubt-clearing sessions and mock tests.',
    subjects: ['Science', 'Mathematics', 'English', 'Hindi', 'Social Science', 'IT'],
    color: 'border-orange-200 bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    level: 'Senior Secondary',
    classes: 'Class XI – XII',
    desc: 'Stream-based education (Science / Commerce / Arts) for board and competitive exams.',
    subjects: ['Physics / Accounts / History', 'Chemistry / BST / Pol. Sci', 'Maths / Economics', 'Biology / IP'],
    color: 'border-purple-200 bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
  },
]

export default function Courses() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Curriculum</div>
          <h2 className="section-title">Academic Programs</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            CBSE-affiliated curriculum designed for holistic development from Nursery to Class XII.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.level} className={`rounded-2xl border-2 ${course.color} p-6`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${course.badge}`}>
                    {course.classes}
                  </span>
                  <h3 className="font-display font-bold text-navy-800 text-xl mt-2">{course.level}</h3>
                </div>
                <BookOpen className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 mb-4">{course.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {course.subjects.map(s => (
                  <span key={s} className="text-xs bg-white/70 border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {/* CTA card */}
          <div className="rounded-2xl border-2 border-navy-200 bg-navy-800 p-6 flex flex-col justify-between text-white">
            <div>
              <div className="text-gold-400 font-semibold text-sm mb-2">Ready to join?</div>
              <h3 className="font-display font-bold text-2xl mb-3">Apply for Admission 2025-26</h3>
              <p className="text-slate-300 text-sm">Limited seats. Early applications get priority.</p>
            </div>
            <Link href="/admissions" className="mt-6 btn-gold self-start">
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
