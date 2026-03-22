import { useEffect }       from 'react'
import { useNavigate }      from 'react-router-dom'
import { useSelector }      from 'react-redux'
import LandingNavbar        from '../../components/landing/LandingNavbar.jsx'
import HeroSection          from '../../components/landing/HeroSection.jsx'
import FeaturesSection      from '../../components/landing/FeaturesSection.jsx'
import CategoriesSection    from '../../components/landing/CategoriesSection.jsx'
import AISection            from '../../components/landing/AISection.jsx'
import HowItWorksSection    from '../../components/landing/HowItWorksSection.jsx'
import CTASection           from '../../components/landing/CTASection.jsx'
import LandingFooter        from '../../components/landing/LandingFooter.jsx'

export default function LandingPage() {
  const navigate    = useNavigate()
  const accessToken = useSelector(s => s.auth.accessToken)

  // If logged in → redirect to dashboard
  useEffect(() => {
    if (accessToken) navigate('/home', { replace: true })
  }, [accessToken])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <AISection />
      <HowItWorksSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
