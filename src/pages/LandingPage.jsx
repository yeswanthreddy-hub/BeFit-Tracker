import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import QuoteSection from '../components/home/QuoteSection'
import FeatureSection from '../components/home/FeatureSection'
import CategorySection from '../components/home/CategorySection'
import HowItWorks from '../components/home/HowItWorks'
import ProgressPreview from '../components/home/ProgressPreview'
import AboutSection from '../components/home/AboutSection'
import CTASection from '../components/home/CTASection'
import { HOME_LINKS } from '../components/layout/navigation'

const HOME_ACTIONS = [
  { to: '/login', label: 'Log in', variant: 'ghost' },
  { to: '/register', label: 'Get Started', variant: 'primary' },
]

function LandingPage() {
  return (
    <div className="landing">
      <Navbar links={HOME_LINKS} actions={HOME_ACTIONS} />

      <Hero />

      <QuoteSection />

      <FeatureSection />

      <CategorySection />

      <HowItWorks />

      <ProgressPreview />

      <AboutSection />

      <CTASection />

      <Footer />
    </div>
  )
}

export default LandingPage