import PageHeader from '@/components/ui/PageHeader'

const faculty = [
  { name: 'Dr. Ramesh Tiwari', subject: 'Principal', dept: 'Administration', exp: '28 yrs', qual: 'PhD (Education)', avatar: 'RT', color: 'bg-slate-100 text-slate-700' },
  { name: 'Mrs. Sunita Sharma', subject: 'Vice Principal / English', dept: 'Languages', exp: '20 yrs', qual: 'MA English, B.Ed', avatar: 'SS', color: 'bg-blue-100 text-blue-700' },
  { name: 'Mr. Anil Gupta', subject: 'Mathematics', dept: 'Science & Math', exp: '18 yrs', qual: 'MSc Maths, B.Ed', avatar: 'AG', color: 'bg-green-100 text-green-700' },
  { name: 'Mrs. Rekha Pandey', subject: 'Physics', dept: 'Science & Math', exp: '15 yrs', qual: 'MSc Physics, B.Ed', avatar: 'RP', color: 'bg-purple-100 text-purple-700' },
  { name: 'Mr. Vikas Srivastava', subject: 'Chemistry', dept: 'Science & Math', exp: '12 yrs', qual: 'MSc Chemistry, B.Ed', avatar: 'VS', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Mrs. Pooja Mishra', subject: 'Biology', dept: 'Science & Math', exp: '10 yrs', qual: 'MSc Biology, B.Ed', avatar: 'PM', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Mr. Deepak Singh', subject: 'Hindi', dept: 'Languages', exp: '16 yrs', qual: 'MA Hindi, B.Ed', avatar: 'DS', color: 'bg-orange-100 text-orange-700' },
  { name: 'Mrs. Nisha Verma', subject: 'Social Studies', dept: 'Humanities', exp: '11 yrs', qual: 'MA History, B.Ed', avatar: 'NV', color: 'bg-rose-100 text-rose-700' },
  { name: 'Mr. Rahul Jaiswal', subject: 'Computer Science', dept: 'Technology', exp: '8 yrs', qual: 'MCA, B.Ed', avatar: 'RJ', color: 'bg-cyan-100 text-cyan-700' },
  { name: 'Mrs. Kavita Rai', subject: 'Sanskrit', dept: 'Languages', exp: '14 yrs', qual: 'MA Sanskrit, B.Ed', avatar: 'KR', color: 'bg-amber-100 text-amber-700' },
  { name: 'Mr. Sanjay Chaturvedi', subject: 'Physical Education', dept: 'Sports', exp: '13 yrs', qual: 'BPEd, MPEd', avatar: 'SC', color: 'bg-lime-100 text-lime-700' },
  { name: 'Mrs. Priya Dubey', subject: 'Music & Arts', dept: 'Co-Curricular', exp: '9 yrs', qual: 'BA Music, Diploma Arts', avatar: 'PD', color: 'bg-fuchsia-100 text-fuchsia-700' },
]

const depts = ['All', 'Administration', 'Science & Math', 'Languages', 'Humanities', 'Technology', 'Sports', 'Co-Curricular']

import FacultyClient from './FacultyClient'

export default function FacultyPage() {
  return (
    <>
      <PageHeader
        title="Our Faculty"
        subtitle="Meet our 120+ dedicated educators who are passionate about shaping young minds."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Faculty' }]}
      />
      {/* Stats */}
      <section className="py-10 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { val: '120+', label: 'Total Teachers' },
            { val: '85%', label: 'Postgraduate Qualified' },
            { val: '15 yrs', label: 'Avg. Experience' },
            { val: '100%', label: 'B.Ed / Trained' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-display font-bold text-gold-400">{val}</div>
              <div className="text-slate-300 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>
      <FacultyClient faculty={faculty} depts={depts} />
    </>
  )
}
