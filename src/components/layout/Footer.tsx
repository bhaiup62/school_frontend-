import Link from 'next/link'
import { GraduationCap, Phone, Mail, MapPin, Facebook, Youtube, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
              <GraduationCap className="text-navy-900 w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm">Saraswati Public</div>
              <div className="text-xs text-gold-400 tracking-wide">SCHOOL</div>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Nurturing minds and building futures since 1985. Affiliated to CBSE Board, committed to holistic education.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/about', label: 'About Us' },
              { href: '/academics', label: 'Academics' },
              { href: '/admissions', label: 'Admissions' },
              { href: '/faculty', label: 'Our Faculty' },
              { href: '/events', label: 'Events' },
              { href: '/gallery', label: 'Gallery' },
              { href: '/results', label: 'Results' },
              { href: '/downloads', label: 'Downloads' },
            ].map(link => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-400 hover:text-gold-400 transition-colors">
                  → {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Notices */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Latest Notices</h4>
          <ul className="space-y-3 text-sm">
            {[
              'Annual Sports Day — 5th April 2025',
              'Class X Board Exam Schedule Released',
              'Parent-Teacher Meeting — 20th March',
              'Summer Vacation: 15 May – 20 June',
              'Admissions Open 2025-26 Session',
            ].map((notice, i) => (
              <li key={i} className="text-slate-400 border-b border-navy-800 pb-2 last:border-0 hover:text-gold-400 cursor-pointer transition-colors">
                📢 {notice}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Contact Us</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-3">
              <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
              Civil Lines, Near Collectorate, Varanasi, UP — 221001
            </li>
            <li className="flex gap-3">
              <Phone className="w-4 h-4 text-gold-400 shrink-0" />
              +91 98765 43210
            </li>
            <li className="flex gap-3">
              <Mail className="w-4 h-4 text-gold-400 shrink-0" />
              info@saraswatischool.edu.in
            </li>
          </ul>
          <div className="mt-5 bg-navy-800 rounded-xl p-4 text-xs text-slate-400">
            <div className="text-gold-400 font-semibold mb-1">School Timing</div>
            Mon – Sat: 7:30 AM – 2:00 PM<br />
            Office: 9:00 AM – 4:00 PM
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-800 py-4 px-4 text-center text-xs text-slate-500">
        © 2025 Saraswati Public School. All rights reserved. &nbsp;|&nbsp; Designed by{' '}
        <span className="text-gold-400 font-semibold">Goth Developers</span>
      </div>
    </footer>
  )
}
