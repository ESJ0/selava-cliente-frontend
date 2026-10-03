import { ArrowRight, Sparkles } from 'lucide-react'
import { ButtonLink } from './Button'
import { Card } from './Card'

export function HomeHero({ hasSession = false }: { hasSession?: boolean }) {
  return (
    <Card className="home-hero" aria-labelledby="hero-title">
      <div className="hero-decoration" aria-hidden="true"><span /><span /><span /></div>
      <div className="hero-eyebrow"><Sparkles size={16} aria-hidden="true" /><span>SELAVA</span><span className="eyebrow-dot">•</span><span>Lavandería y Dry Clean</span></div>
      <h2 id="hero-title">Tu ropa limpia, cuidada y lista cuando la necesitas.</h2>
      <p>Deja el cuidado de tus prendas en nuestras manos.<br className="desktop-break" /> Más tiempo para ti, frescura para cada día.</p>
      <ButtonLink to={hasSession ? '/mis-pedidos' : '/servicios'}>
        {hasSession ? 'Ver mis pedidos' : 'Conoce nuestros servicios'}<ArrowRight size={17} aria-hidden="true" />
      </ButtonLink>
    </Card>
  )
}
