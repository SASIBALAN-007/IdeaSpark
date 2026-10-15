import { useEffect, useState } from 'react'
import LogoutButton from './Logout'
import Sidebar from './Sidebar'

const sectors = [
  'Fintech', 'Agritech', 'Healthtech', 'Edtech', 'Climate', 'Logistics',
  'Deep tech', 'D2C brands', 'SaaS', 'Gaming', 'Mobility', 'Food',
]

const steps = [
  { n: '1', title: 'Build your profile', text: 'Tell investors what you are building, what stage you are at and how much you are raising.' },
  { n: '2', title: 'Get discovered', text: 'Investors browse by sector, stage and ticket size, and the right ones find your pitch.' },
  { n: '3', title: 'Start the conversation', text: 'Message investors directly, share your deck and take it from a first hello to a real deal.' },
]

const features = [
  'Browse investors who back your sector and stage',
  'Ask for investment with one clear, honest pitch',
  'Keep all your ideas in one place and update them anytime',
  'Manage your account and your conversations in one workspace',
]

const SparkIcon = ({ className = '', size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19" />
  </svg>
)

const btnDark =
  'inline-block rounded-xl border-2 border-black bg-black px-7 py-3.5 text-base font-semibold text-white transition duration-150 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
const btnLight =
  'inline-block rounded-xl border-2 border-black bg-white px-7 py-3.5 text-base font-semibold text-black transition duration-150 hover:-translate-y-0.5 hover:bg-black hover:text-white hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'

export default function IdeaSpark({ onLogout, onGetStarted = () => {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close the sidebar with the Escape key
  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (e) => e.key === 'Escape' && setSidebarOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen])

  const handleLogout = () => {
    setSidebarOpen(false)
    if (onLogout) onLogout()
  }

  // Close the drawer after the user taps a link inside the sidebar
  const closeOnLinkClick = (e) => {
    if (e.target.closest('a')) setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-['Plus_Jakarta_Sans',Helvetica,Arial,sans-serif] text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
html{scroll-behavior:smooth}
.is-outline{-webkit-text-stroke:2px #000;color:transparent}
.is-marquee{animation:is-marquee 32s linear infinite}
.is-marquee:hover{animation-play-state:paused}
@keyframes is-marquee{to{transform:translateX(-50%)}}
@keyframes is-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.is-rise{animation:is-rise .7s cubic-bezier(.2,.7,.2,1) both}
.is-rise-2{animation-delay:.12s}.is-rise-3{animation-delay:.24s}
@media (prefers-reduced-motion:reduce){.is-marquee,.is-rise{animation:none}}`}</style>

      {/* Dark overlay behind the sidebar; click it to close */}
      <div
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {/* Sliding sidebar drawer */}
      <aside
        aria-hidden={!sidebarOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : 'invisible -translate-x-full'}`}
      >
        <div className="flex justify-end border-b border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" onClick={closeOnLinkClick}>
          <Sidebar onLogout={handleLogout} />
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b-2 border-black bg-white px-5 py-3 md:px-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black transition hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h10M4 17h16" /></svg>
          </button>
          <a href="#top" className="group flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <SparkIcon className="transition-transform duration-500 group-hover:rotate-90" />
            <span>Idea Spark</span>
          </a>
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-[15px] font-semibold">
          <a href="#how" className="underline-offset-4 hover:underline">How it works</a>
          <a href="#features" className="underline-offset-4 hover:underline">Features</a>
          <button type="button" onClick={onGetStarted} className="rounded-xl border-2 border-black bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
            Get started
          </button>
          <LogoutButton onLogout={handleLogout} />
        </nav>
      </header>

      {/* Hero */}
      <section id="top" className="relative border-b-2 border-black px-5 pb-14 pt-16 md:px-10 md:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(#000_1.2px,transparent_1.2px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,#000,transparent_85%)]" />
        <div className="relative mx-auto max-w-6xl">
          <h1 className="is-rise text-[clamp(40px,8.2vw,104px)] font-extrabold leading-[0.95] tracking-[-0.035em]">
            Ideas need money.
            <br />
            <span className="is-outline">Money needs ideas.</span>
          </h1>
          <p className="is-rise is-rise-2 mt-8 max-w-xl text-lg leading-relaxed md:text-xl">
            Idea Spark is the bridge between your startup and the investors who can fund it. Share your idea once and get found by the right people.
          </p>
          <div className="is-rise is-rise-3 mt-10 flex flex-wrap gap-4">
            <button type="button" onClick={onGetStarted} className={btnDark}>Pitch your startup</button>
            <a href="#how" className={btnLight}>See how it works</a>
          </div>

          {/* The bridge: one spark crosses over, funding comes back */}
          <div className="mt-16 overflow-x-auto">
            <svg viewBox="0 0 1000 260" className="block w-full min-w-[540px]" role="img" aria-label="A spark travels across a bridge from a startup to an investor, and funding travels back">
              <path id="is-arc" d="M190 120 Q500 -70 810 120" fill="none" stroke="#000" strokeWidth="4" />
              <path id="is-back" d="M810 150 L190 150" fill="none" stroke="#000" strokeWidth="4" />
              <path d="M270 82 V150 M350 54 V150 M430 40 V150 M500 36 V150 M570 40 V150 M650 54 V150 M730 82 V150" stroke="#000" strokeWidth="2" />
              <rect x="20" y="120" width="170" height="110" rx="16" fill="#fff" stroke="#000" strokeWidth="4" />
              <text x="105" y="182" textAnchor="middle" fontSize="24" fontWeight="800" fill="#000" fontFamily="Plus Jakarta Sans, Arial, sans-serif">Startup</text>
              <rect x="810" y="120" width="170" height="110" rx="16" fill="#000" />
              <text x="895" y="182" textAnchor="middle" fontSize="24" fontWeight="800" fill="#fff" fontFamily="Plus Jakarta Sans, Arial, sans-serif">Investor</text>
              <circle r="11" fill="#000">
                <animateMotion dur="3.6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".45 0 .55 1"><mpath href="#is-arc" /></animateMotion>
              </circle>
              <circle r="8" fill="#fff" stroke="#000" strokeWidth="3">
                <animateMotion dur="3.6s" repeatCount="indefinite" begin="1.8s"><mpath href="#is-back" /></animateMotion>
              </circle>
              <text x="500" y="22" textAnchor="middle" fontSize="17" fontWeight="500" fill="#000" fontFamily="Plus Jakarta Sans, Arial, sans-serif">your idea goes over</text>
              <text x="500" y="186" textAnchor="middle" fontSize="17" fontWeight="500" fill="#000" fontFamily="Plus Jakarta Sans, Arial, sans-serif">the funding comes back</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Sector ticker */}
      <div className="overflow-hidden border-b-2 border-black bg-black py-4 text-white" aria-label="Sectors on Idea Spark">
        <div className="is-marquee flex w-max items-center whitespace-nowrap text-3xl font-extrabold tracking-tight md:text-5xl">
          {[0, 1].map((k) => (
            <div key={k} className="flex items-center" aria-hidden={k === 1}>
              {sectors.map((s) => (
                <span key={s + k} className="flex items-center">
                  <span className="px-6">{s}</span>
                  <SparkIcon size={28} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how" className="border-b-2 border-black px-5 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">Three steps from idea to investor.</h2>
          <ol className="mt-12 overflow-hidden rounded-3xl border-2 border-black">
            {steps.map((s) => (
              <li key={s.n} className="group grid items-center gap-4 border-b-2 border-black px-6 py-8 transition-colors duration-200 last:border-b-0 hover:bg-black hover:text-white md:grid-cols-[120px_1fr_1.2fr] md:gap-8 md:px-10">
                <span className="text-6xl font-extrabold leading-none transition-transform duration-200 group-hover:translate-x-2 md:text-7xl">{s.n}</span>
                <h3 className="text-2xl font-bold tracking-tight md:text-3xl">{s.title}</h3>
                <p className="max-w-md text-base leading-relaxed md:text-lg">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features for startups */}
      <section id="features" className="border-b-2 border-black px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl bg-black p-8 text-white md:grid-cols-2 md:p-14">
          <h2 className="text-4xl font-extrabold leading-[1.02] tracking-tight md:text-5xl">Stop cold emailing. Get found.</h2>
          <div>
            <ul className="space-y-5 text-lg leading-snug">
              {features.map((f) => (
                <li key={f} className="flex gap-4">
                  <SparkIcon size={22} className="mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onGetStarted}
              className="mt-10 inline-block rounded-xl border-2 border-white bg-white px-7 py-3.5 text-base font-semibold text-black transition duration-150 hover:-translate-y-0.5 hover:bg-black hover:text-white hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Pitch your idea
            </button>
          </div>
        </div>
      </section>

      {/* Final call */}
      <section id="join" className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-[clamp(36px,7.5vw,96px)] font-extrabold leading-[0.98] tracking-[-0.035em]">Every big company started with a spark.</h2>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <button type="button" onClick={onGetStarted} className={btnDark}>Join Idea Spark</button>
            <p className="max-w-xs text-base leading-snug">Free to set up. Takes a few minutes.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="overflow-hidden bg-black px-5 pt-14 text-white md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                <SparkIcon />
                <span>Idea Spark</span>
              </div>
              <p className="mt-4 max-w-[16rem] text-base leading-relaxed">The bridge between startups and investors.</p>
            </div>
            <div>
              <h4 className="mb-4 text-base font-bold">Platform</h4>
              <ul className="flex flex-col gap-2.5 text-base">
                <li><a href="#how" className="underline-offset-4 hover:underline">How it works</a></li>
                <li><a href="#features" className="underline-offset-4 hover:underline">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-base font-bold">Company</h4>
              <ul className="flex flex-col gap-2.5 text-base">
                <li><a href="#top" className="underline-offset-4 hover:underline">About</a></li>
                <li><a href="#join" className="underline-offset-4 hover:underline">Contact</a></li>
                <li><a href="#top" className="underline-offset-4 hover:underline">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-base font-bold">Legal</h4>
              <ul className="flex flex-col gap-2.5 text-base">
                <li><a href="#top" className="underline-offset-4 hover:underline">Privacy</a></li>
                <li><a href="#top" className="underline-offset-4 hover:underline">Terms</a></li>
              </ul>
            </div>
          </div>
          <p className="mt-12 text-sm">&copy; 2026 Idea Spark. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}