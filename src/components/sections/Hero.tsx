'use client'
import Link from 'next/link'
import { ArrowRight, PlayCircle, Award, Users, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'

const slides = [
  {
    heading: 'Nurturing Minds,',
    subHeading: 'Building Futures',
    desc: 'A legacy of excellence since 1985. CBSE affiliated school offering world-class education to students from Class I to XII.',
    bg: 'from-navy-900 via-navy-800 to-slate-900',
    badge: '🏆 Best School Award 2024 — Varanasi',
  },
  {
    heading: 'Where Knowledge',
    subHeading: 'Meets Character',
    desc: 'We believe in holistic development — academics, sports, arts, and values — shaping tomorrow\'s leaders today.',
    bg: 'from-slate-900 via-navy-900 to-navy-800',
    badge: '📚 CBSE Affiliated | Class I–XII',
  },
  {
    heading: 'Admissions Open',
    subHeading: 'Session 2025–26',
    desc: 'Limited seats available. Apply now for a transformative educational journey at Saraswati Public School.',
    bg: 'from-navy-800 via-navy-900 to-slate-800',
    badge: '🎓 Seats Filling Fast',
  },
]

export default function Hero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [])

  const slide = slides[active]

  return (
    <section className={`relative min-h-[92vh] bg-gradient-to-br ${slide.bg} flex items-center overflow-hidden transition-all duration-1000`}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col lg:flex-row items-center gap-16 w-full">
        {/* Left content */}
        <div className="flex-1 text-white">
          <span className="inline-block bg-gold-500/20 text-gold-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-gold-500/30">
            {slide.badge}
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-4">
            {slide.heading}<br />
            <span className="text-gold-400">{slide.subHeading}</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
            {slide.desc}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/admissions" className="btn-gold text-base">
              Apply for Admission <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/about" className="flex items-center gap-2 text-white border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              <PlayCircle className="w-5 h-5 text-gold-400" />
              Learn More
            </Link>
          </div>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-8 mt-12">
            {[
              { icon: Award, label: '40+ Years', sub: 'of Excellence' },
              { icon: Users, label: '3500+', sub: 'Students' },
              { icon: BookOpen, label: '98%', sub: 'Board Results' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <div className="font-bold text-white text-base">{label}</div>
                  <div className="text-slate-400 text-xs">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right card */}
        <div className="flex-1 max-w-sm w-full">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
            <div className="text-white font-display font-bold text-xl mb-6">Quick Enquiry</div>
            <div className="space-y-4">
              {[
                { placeholder: 'Parent / Guardian Name', type: 'text' },
                { placeholder: 'Student Name', type: 'text' },
                { placeholder: 'Mobile Number', type: 'tel' },
                { placeholder: 'Email Address', type: 'email' },
              ].map((inp) => (
                <input
                  key={inp.placeholder}
                  type={inp.type}
                  placeholder={inp.placeholder}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                />
              ))}
              <select className="w-full bg-white/10 border border-white/20 text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400">
                <option value="">Select Class</option>
                {['Nursery', 'KG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <button className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-3 rounded-xl transition-colors">
                Send Enquiry →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`transition-all rounded-full ${i === active ? 'w-8 h-2 bg-gold-400' : 'w-2 h-2 bg-white/30'}`} />
        ))}
      </div>
    </section>
  )
}
