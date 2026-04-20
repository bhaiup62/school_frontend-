import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'

export default function CTABanner() {
  return (
    <section className="py-20 bg-navy-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-gold-400 font-semibold text-sm tracking-widest uppercase mb-3">Admissions Open 2025–26</div>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Give Your Child the Best Start
        </h2>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
          Join thousands of families who trust Saraswati Public School for quality education, strong values, and a bright future.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/admissions" className="btn-gold text-base">
            Apply for Admission <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/contact" className="flex items-center gap-2 text-white border border-white/30 px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold">
            <Phone className="w-5 h-5 text-gold-400" />
            Call Us Now
          </Link>
        </div>
      </div>
    </section>
  )
}
