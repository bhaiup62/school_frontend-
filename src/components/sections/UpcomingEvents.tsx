import Link from 'next/link'
import { Clock, MapPin, ArrowRight } from 'lucide-react'

const events = [
  {
    date: { day: '05', month: 'APR' },
    title: 'Annual Sports Day',
    time: '9:00 AM – 3:00 PM',
    location: 'School Ground',
    type: 'Sports',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  {
    date: { day: '12', month: 'APR' },
    title: 'Science Exhibition 2025',
    time: '10:00 AM – 4:00 PM',
    location: 'School Auditorium',
    type: 'Academic',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    date: { day: '20', month: 'APR' },
    title: 'Annual Cultural Program',
    time: '5:00 PM – 9:00 PM',
    location: 'School Hall',
    type: 'Cultural',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    date: { day: '28', month: 'APR' },
    title: 'Inter-School Debate Competition',
    time: '9:30 AM – 1:00 PM',
    location: 'Conference Room',
    type: 'Academic',
    color: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
  },
]

export default function UpcomingEvents() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Calendar</div>
            <h2 className="section-title mb-0">Upcoming Events</h2>
          </div>
          <Link href="/events" className="btn-primary text-sm">
            View All Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.map((event) => (
            <div key={event.title} className={`card border-2 ${event.color} p-5`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="text-center bg-white rounded-xl shadow-sm border border-slate-100 px-3 py-2 shrink-0">
                  <div className="text-2xl font-display font-black text-navy-800 leading-none">{event.date.day}</div>
                  <div className="text-xs font-bold text-gold-500 tracking-widest mt-0.5">{event.date.month}</div>
                </div>
                <div className="flex-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${event.badge}`}>
                    {event.type}
                  </span>
                  <h3 className="font-display font-bold text-navy-800 text-base mt-1 leading-tight">{event.title}</h3>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {event.time}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
