'use client'
import PageHeader from '@/components/ui/PageHeader'
import { CheckCircle, FileText, CreditCard, UserCheck, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const steps = [
  { icon: FileText, title: 'Fill Application Form', desc: 'Download or fill the online enquiry form with student and parent details.' },
  { icon: CreditCard, title: 'Pay Registration Fee', desc: 'Pay ₹500 registration fee at the school office or via online transfer.' },
  { icon: UserCheck, title: 'Entrance Assessment', desc: 'Students of Class III and above appear for a brief assessment test.' },
  { icon: CheckCircle, title: 'Document Verification', desc: 'Submit original documents for verification at the admission office.' },
  { icon: CreditCard, title: 'Fee Payment & Confirmation', desc: 'Pay first quarter fee to confirm the seat and receive admission kit.' },
]

const fees = [
  { class: 'Nursery – KG', admission: '₹5,000', quarterly: '₹4,500', annual: '₹2,000' },
  { class: 'Class I – V', admission: '₹6,000', quarterly: '₹5,500', annual: '₹2,500' },
  { class: 'Class VI – VIII', admission: '₹7,000', quarterly: '₹6,500', annual: '₹3,000' },
  { class: 'Class IX – X', admission: '₹8,000', quarterly: '₹7,500', annual: '₹3,500' },
  { class: 'Class XI – XII', admission: '₹10,000', quarterly: '₹9,000', annual: '₹4,000' },
]

const docs = [
  'Birth Certificate (original + photocopy)',
  'Previous school Transfer Certificate (TC)',
  'Mark sheet / Report Card of last class',
  'Aadhar Card (student)',
  'Aadhar Card (father and mother)',
  '4 passport-size photographs (student)',
  'Caste Certificate (if applicable)',
  'Medical fitness certificate',
]

export default function AdmissionsPage() {
  const [form, setForm] = useState({ name: '', parent: '', mobile: '', email: '', cls: '', msg: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <PageHeader
        title="Admissions 2025–26"
        subtitle="Applications are open for all classes. Secure your child's future — limited seats available."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admissions' }]}
      />

      {/* Alert */}
      <div className="bg-gold-50 border-b border-gold-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 text-sm text-gold-800">
          <AlertCircle className="w-4 h-4 text-gold-600 shrink-0" />
          <strong>Important:</strong> Admissions for Session 2025-26 are now open. Last date for registration: <strong>30th April 2025</strong>. Limited seats available.
        </div>
      </div>

      {/* Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">How to Apply</div>
            <h2 className="section-title">Admission Process</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative">
                <div className="card p-5 text-center h-full">
                  <div className="w-10 h-10 bg-navy-700 rounded-full text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                    {i + 1}
                  </div>
                  <Icon className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-navy-800 text-sm mb-1">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee structure */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Fee Details</div>
            <h2 className="section-title">Fee Structure 2025–26</h2>
            <p className="text-xs text-slate-400 mt-1">* All amounts in INR. Annual charges include development & exam fees.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-navy-800 text-white text-sm">
                  <th className="text-left px-5 py-3 font-semibold">Class</th>
                  <th className="text-center px-5 py-3 font-semibold">Admission Fee</th>
                  <th className="text-center px-5 py-3 font-semibold">Quarterly Fee</th>
                  <th className="text-center px-5 py-3 font-semibold">Annual Charges</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((row, i) => (
                  <tr key={row.class} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-5 py-3 font-semibold text-navy-700 text-sm">{row.class}</td>
                    <td className="text-center px-5 py-3 text-sm text-slate-700">{row.admission}</td>
                    <td className="text-center px-5 py-3 text-sm text-slate-700">{row.quarterly}</td>
                    <td className="text-center px-5 py-3 text-sm text-slate-700">{row.annual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Documents + Form */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Documents */}
          <div>
            <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Checklist</div>
            <h2 className="section-title">Required Documents</h2>
            <ul className="space-y-3">
              {docs.map((doc, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <div>
            <div className="text-gold-500 font-semibold text-sm tracking-widest uppercase mb-2">Get In Touch</div>
            <h2 className="section-title">Admission Enquiry</h2>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-display font-bold text-navy-800 text-xl mb-2">Enquiry Submitted!</h3>
                <p className="text-slate-500 text-sm">Our admission team will contact you within 24 hours. Thank you for your interest in Saraswati Public School.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {[
                  { label: 'Student Name', key: 'name', type: 'text' },
                  { label: 'Parent / Guardian Name', key: 'parent', type: 'text' },
                  { label: 'Mobile Number', key: 'mobile', type: 'tel' },
                  { label: 'Email Address', key: 'email', type: 'email' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                    <input type={type} required
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-navy-400 transition-colors bg-white"
                      placeholder={label}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Applying for Class</label>
                  <select required value={form.cls} onChange={e => setForm({ ...form, cls: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-navy-400 bg-white">
                    <option value="">Select Class</option>
                    {['Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Message (Optional)</label>
                  <textarea rows={3} value={form.msg} onChange={e => setForm({ ...form, msg: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-navy-400 bg-white resize-none"
                    placeholder="Any specific queries..." />
                </div>
                <button type="submit" className="w-full btn-gold justify-center">
                  Submit Enquiry →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
