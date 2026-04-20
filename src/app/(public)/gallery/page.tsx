'use client'
import PageHeader from '@/components/ui/PageHeader'
import { useState } from 'react'
import { X } from 'lucide-react'

const categories = ['All', 'Sports', 'Cultural', 'Academic', 'Infrastructure', 'Events']

const photos = [
  { id: 1, category: 'Sports', title: 'Annual Sports Day 2024', color: 'from-green-400 to-emerald-600', emoji: '🏃' },
  { id: 2, category: 'Cultural', title: 'Independence Day Celebration', color: 'from-orange-400 to-red-500', emoji: '🇮🇳' },
  { id: 3, category: 'Academic', title: 'Science Exhibition', color: 'from-blue-400 to-blue-600', emoji: '🔬' },
  { id: 4, category: 'Infrastructure', title: 'School Library', color: 'from-amber-400 to-orange-500', emoji: '📚' },
  { id: 5, category: 'Events', title: 'Prize Distribution 2024', color: 'from-purple-400 to-purple-600', emoji: '🏆' },
  { id: 6, category: 'Sports', title: 'Basketball Tournament', color: 'from-teal-400 to-cyan-600', emoji: '🏀' },
  { id: 7, category: 'Cultural', title: 'Annual Cultural Program', color: 'from-pink-400 to-rose-500', emoji: '🎭' },
  { id: 8, category: 'Academic', title: 'Computer Lab Session', color: 'from-indigo-400 to-blue-600', emoji: '💻' },
  { id: 9, category: 'Infrastructure', title: 'New Science Lab', color: 'from-cyan-400 to-teal-600', emoji: '⚗️' },
  { id: 10, category: 'Events', title: 'Teacher\'s Day 2024', color: 'from-yellow-400 to-amber-500', emoji: '👩‍🏫' },
  { id: 11, category: 'Sports', title: 'Cricket Match Finals', color: 'from-lime-400 to-green-600', emoji: '🏏' },
  { id: 12, category: 'Cultural', title: 'Republic Day Parade', color: 'from-red-400 to-rose-600', emoji: '🎺' },
  { id: 13, category: 'Academic', title: 'Math Olympiad Winners', color: 'from-violet-400 to-purple-600', emoji: '📐' },
  { id: 14, category: 'Infrastructure', title: 'School Auditorium', color: 'from-slate-400 to-slate-600', emoji: '🎪' },
  { id: 15, category: 'Events', title: 'Farewell Ceremony 2024', color: 'from-fuchsia-400 to-pink-600', emoji: '🎓' },
  { id: 16, category: 'Sports', title: 'Swimming Competition', color: 'from-sky-400 to-blue-500', emoji: '🏊' },
]

export default function GalleryPage() {
  const [filter, setFilter] = useState('All')
  const [lightbox, setLightbox] = useState<typeof photos[0] | null>(null)

  const filtered = filter === 'All' ? photos : photos.filter(p => p.category === filter)

  return (
    <>
      <PageHeader
        title="Photo Gallery"
        subtitle="Memories from our campus — sports, events, academics, and more."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]}
      />

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === c ? 'bg-navy-700 text-white' : 'bg-white text-slate-600 border hover:border-navy-300'}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((photo) => (
              <div key={photo.id} onClick={() => setLightbox(photo)}
                className="cursor-pointer rounded-2xl overflow-hidden aspect-square relative group shadow-sm hover:shadow-lg transition-shadow">
                <div className={`w-full h-full bg-gradient-to-br ${photo.color} flex flex-col items-center justify-center`}>
                  <span className="text-5xl mb-2">{photo.emoji}</span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2">
                      <p className="text-navy-800 text-xs font-semibold">{photo.title}</p>
                      <p className="text-slate-500 text-xs">{photo.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white hover:text-gold-400 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${lightbox.color} flex flex-col items-center justify-center`}>
              <span className="text-8xl">{lightbox.emoji}</span>
            </div>
            <div className="bg-white rounded-xl p-4 mt-3">
              <h3 className="font-display font-bold text-navy-800 text-lg">{lightbox.title}</h3>
              <p className="text-slate-500 text-sm">{lightbox.category} • Saraswati Public School</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
