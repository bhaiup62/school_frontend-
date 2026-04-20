import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs: { label: string; href?: string }[]
}

export default function PageHeader({ title, subtitle, breadcrumbs }: PageHeaderProps) {
  return (
    <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 w-72 h-72 bg-gold-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <nav className="flex items-center gap-1 text-sm text-slate-400 mb-4">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-gold-400 transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-gold-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">{title}</h1>
        {subtitle && <p className="text-slate-300 text-lg max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  )
}
