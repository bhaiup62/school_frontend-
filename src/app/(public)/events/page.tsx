import PageHeader from '@/components/ui/PageHeader'
import { Clock, MapPin } from 'lucide-react'

const events = [
  {
    date: { day: '05', month: 'APR', year: '2025' },
    title: 'Annual Sports Day',
    desc: 'A day of athletic events, races, team sports, and prize distribution for all classes. Parents are cordially invited.',
    time: '9:00 AM – 3:00 PM',
    location: 'School Ground',
    type: 'Sports',
    badge: 'bg-green-100 text-green-700',
  },
  {
    date: { day: '12', month: 'APR', year: '2025' },
    title: 'Science Exhibition 2025',
    desc: 'Students from Class VI–XII present their science projects and models. Open to parents and public.',
    time: '10:00 AM – 4:00 PM',
    location: 'School Auditorium',
    type: 'Academic',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    date: { day: '20', month: 'APR', year: '2025' },
    title: 'Annual Cultural Program',
    desc: 'Dance, drama, music, and skit performances by our talented students. A grand evening celebration.',
    time: '5:00 PM – 9:00 PM',
    location: 'School Hall',
    type: 'Cultural',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    date: { day: '28', month: 'APR', year: '2025' },
    title: 'Inter-School Debate Competition',
    desc: '12 schools from Varanasi district compete in Hindi and English debate categories.',
    time: '9:30 AM – 1:00 PM',
    location: 'Conference Room',
    type: 'Academic',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    date: { day: '15', month: 'MAY', year: '2025' },
    title: 'Summer Vacation Begins',
    desc: 'School closed for summer vacation. Classes resume 21st June 2025.',
    time: 'All Day',
    location: '—',
    type: 'Holiday',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    date: { day: '21', month: 'JUN', year: '2025' },
    title: 'School Reopens — New Session',
    desc: 'School reopens after summer vacation. New academic session 2025-26 begins.',
    time: '7:30 AM',
    location: 'All Classrooms',
    type: 'Academic',
    badge: 'bg-blue-100 text-blue-700',
  },
]

export default function EventsPage() {
  return (
    <>
      <PageHeader
        title="Events & Calendar"
        subtitle="Stay updated with all upcoming school events, holidays, and important dates."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Events' }]}
      />

      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="space-y-5">
            {events.map((event, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex">
                {/* Date block */}
                <div className="bg-navy-800 text-white flex flex-col items-center justify-center px-6 py-4 shrink-0 min-w-[80px]">
                  <div className="text-3xl font-display font-black leading-none">{event.date.day}</div>
                  <div className="text-gold-400 text-xs font-bold tracking-widest mt-0.5">{event.date.month}</div>
                  <div className="text-slate-400 text-xs">{event.date.year}</div>
                </div>
                {/* Content */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display font-bold text-navy-800 text-lg">{event.title}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${event.badge}`}>
                      {event.type}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-3">{event.desc}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
