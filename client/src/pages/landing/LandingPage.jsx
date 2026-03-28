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
import { getDashboardPath } from '../../utils/dashboardPath.js'

export default function LandingPage() {
  const navigate    = useNavigate()
  const { accessToken, user } = useSelector(s => s.auth)

  // If logged in → redirect to dashboard
  useEffect(() => {
    if (accessToken) navigate(getDashboardPath(user), { replace: true })
  }, [accessToken, navigate, user])

  return (
    <div className="page-shell mesh-bg overflow-x-hidden">
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
