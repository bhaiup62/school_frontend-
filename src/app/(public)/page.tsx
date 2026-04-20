import Hero from '@/components/sections/Hero'
import StatsBar from '@/components/sections/StatsBar'
import NoticeBoard from '@/components/sections/NoticeBoard'
import Features from '@/components/sections/Features'
import Courses from '@/components/sections/Courses'
import Testimonials from '@/components/sections/Testimonials'
import UpcomingEvents from '@/components/sections/UpcomingEvents'
import CTABanner from '@/components/sections/CTABanner'

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Features />
      <NoticeBoard />
      <Courses />
      <UpcomingEvents />
      <Testimonials />
      <CTABanner />
    </>
  )
}
