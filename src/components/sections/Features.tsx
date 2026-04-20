import { Microscope, Palette, Dumbbell, Music, Bus, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: Microscope,
    title: 'Science Labs',
    desc: 'Fully equipped Physics, Chemistry and Biology labs with modern instruments for hands-on learning.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Palette,
    title: 'Art & Culture',
    desc: 'Dedicated art rooms, craft studios, and regular cultural programs to nurture creativity.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Dumbbell,
    title: 'Sports Facilities',
    desc: 'Cricket ground, basketball court, volleyball, and trained sports coaches.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Music,
    title: 'Music & Dance',
    desc: 'Classical and western music training, Bharatanatyam, folk and contemporary dance classes.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Bus,
    title: 'Safe Transport',
    desc: 'GPS-tracked school buses with CCTV covering all major routes in Varanasi city.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: ShieldCheck,
    title: 'Safe Campus',
    desc: '24/7 CCTV surveillance, trained security staff, and a strictly safe environment for every student.',
    color: 'bg-red-50 text-red-600',
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Why Choose Us</div>
          <h2 className="section-title">World-Class Facilities</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            We provide an enriching environment where every student can discover and develop their potential.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card p-6 hover:scale-[1.01] transition-transform">
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-navy-800 text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
