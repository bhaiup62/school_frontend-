'use client'
import PageHeader from '@/components/ui/PageHeader'
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="We'd love to hear from you. Reach us by phone, email, or visit us in person."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      {/* Contact info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {[
              { icon: Phone, title: 'Phone', lines: ['+91 98765 43210', '+91 98765 43211'], color: 'bg-blue-50 text-blue-600' },
              { icon: Mail, title: 'Email', lines: ['info@saraswatischool.edu.in', 'admissions@saraswatischool.edu.in'], color: 'bg-green-50 text-green-600' },
              { icon: MapPin, title: 'Address', lines: ['Civil Lines, Near Collectorate', 'Varanasi, UP — 221001'], color: 'bg-orange-50 text-orange-600' },
              { icon: Clock, title: 'Office Hours', lines: ['Mon–Sat: 9:00 AM – 4:00 PM', 'Sunday: Closed'], color: 'bg-purple-50 text-purple-600' },
            ].map(({ icon: Icon, title, lines, color }) => (
              <div key={title} className="card p-6 text-center">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-navy-800 text-base mb-2">{title}</h3>
                {lines.map((line, i) => (
                  <p key={i} className="text-slate-500 text-sm">{line}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map placeholder */}
            <div>
              <h2 className="section-title">Find Us</h2>
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-80 bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center">
                <MapPin className="w-12 h-12 text-navy-700 mb-3" />
                <p className="font-display font-bold text-navy-800 text-lg">Saraswati Public School</p>
                <p className="text-slate-500 text-sm">Civil Lines, Varanasi, UP 221001</p>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                  className="mt-4 btn-primary text-sm">
                  Open in Google Maps
                </a>
              </div>
              {/* Departments */}
              <div className="mt-6 bg-navy-50 rounded-2xl p-5">
                <h3 className="font-semibold text-navy-800 mb-3 text-sm">Department Contacts</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { dept: 'Admissions Office', phone: '+91 98765 43212' },
                    { dept: 'Accounts / Fee', phone: '+91 98765 43213' },
                    { dept: 'Transport Office', phone: '+91 98765 43214' },
                    { dept: 'Principal Office', phone: '+91 98765 43210' },
                  ].map(({ dept, phone }) => (
                    <div key={dept} className="flex justify-between">
                      <span className="text-slate-600">{dept}</span>
                      <span className="text-navy-700 font-medium">{phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="section-title">Send a Message</h2>
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                  <h3 className="font-display font-bold text-navy-800 text-xl mb-2">Message Sent!</h3>
                  <p className="text-slate-500 text-sm">Thank you for contacting us. We will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Your Name', key: 'name', type: 'text' },
                      { label: 'Phone Number', key: 'phone', type: 'tel' },
                    ].map(({ label, key, type }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                        <input type={type} required value={form[key as keyof typeof form]}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                          placeholder={label}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-navy-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                    <input type="email" required value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="Your email"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-navy-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                    <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-navy-400">
                      <option value="">Select Subject</option>
                      <option>Admission Enquiry</option>
                      <option>Fee Related</option>
                      <option>Academic Query</option>
                      <option>Transport Enquiry</option>
                      <option>Complaint / Feedback</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
                    <textarea required rows={4} value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-navy-400 resize-none" />
                  </div>
                  <button type="submit" className="w-full btn-gold justify-center">
                    <MessageSquare className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
