'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Agarwal',
    role: 'Parent of Class VIII Student',
    text: 'My daughter has transformed completely after joining Saraswati Public School. The teachers are dedicated and the environment is so nurturing. She loves coming to school every day.',
    avatar: 'PA',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Rajesh Kumar Singh',
    role: 'Parent of Class X Student',
    text: 'Excellent faculty, great infrastructure, and the focus on board exam preparation is very systematic. My son scored 95% in his half-yearly exams. Highly recommend this school.',
    avatar: 'RK',
    color: 'bg-green-100 text-green-700',
  },
  {
    name: 'Ananya Verma',
    role: 'Class XII Student (PCM)',
    text: 'The science labs and the dedicated coaching for JEE here is phenomenal. Our teachers go beyond the textbook. I feel well-prepared for my board exams and engineering entrance.',
    avatar: 'AV',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Suresh Mishra',
    role: 'Parent of Class V Student',
    text: 'The school\'s focus on both academics and co-curricular activities is exactly what a child needs. My son has developed confidence and communication skills I never expected at this age.',
    avatar: 'SM',
    color: 'bg-orange-100 text-orange-700',
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)

  return (
    <section className="py-20 bg-navy-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">What People Say</div>
          <h2 className="section-title">Parent & Student Reviews</h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 relative">
            <Quote className="absolute top-6 right-8 w-12 h-12 text-gold-100" />
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-full ${testimonials[active].color} font-bold text-lg flex items-center justify-center font-display`}>
                {testimonials[active].avatar}
              </div>
              <div>
                <div className="font-display font-semibold text-navy-800 text-lg">{testimonials[active].name}</div>
                <div className="text-slate-500 text-sm">{testimonials[active].role}</div>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="text-gold-400 text-lg">★</span>
                ))}
              </div>
            </div>
            <p className="text-slate-600 text-base leading-relaxed italic">
              "{testimonials[active].text}"
            </p>
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={() => setActive(p => (p - 1 + testimonials.length) % testimonials.length)}
              className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-navy-700 hover:text-white hover:border-navy-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`transition-all rounded-full ${i === active ? 'w-6 h-2.5 bg-navy-700' : 'w-2.5 h-2.5 bg-slate-300'}`} />
              ))}
            </div>
            <button onClick={() => setActive(p => (p + 1) % testimonials.length)}
              className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-navy-700 hover:text-white hover:border-navy-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
