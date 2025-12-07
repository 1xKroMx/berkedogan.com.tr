import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { inject } from '@vercel/analytics'

// Initialize Vercel Web Analytics
inject()

const app = createApp(App)

app.use(router)

/* SEO: dynamic head management on each route change
   SEO: dinamik başlık yönetimi her rota değişiminde */
router.afterEach((to) => {
  const defaultTitle = 'Berke Doğan'
  const defaultDescription =
    'Portfolio of Berke Doğan, a full‑stack web developer crafting interactive, performant, and accessible web apps.'

  const title = (to.meta?.title as string) || defaultTitle
  const description = (to.meta?.description as string) || defaultDescription

  document.title = title

  const ensureMeta = (name: string, attr: 'name' | 'property' = 'name') => {
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    return el
  }

  ensureMeta('description').setAttribute('content', description)

  const canonicalBase = window.location.origin
  const canonicalHref = canonicalBase + to.fullPath
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', canonicalHref)

  // Open Graph
  ensureMeta('og:title', 'property').setAttribute('content', title)
  ensureMeta('og:description', 'property').setAttribute('content', description)
  ensureMeta('og:type', 'property').setAttribute('content', 'website')
  ensureMeta('og:url', 'property').setAttribute('content', canonicalHref)

  // Twitter
  ensureMeta('twitter:card').setAttribute('content', 'summary_large_image')
  ensureMeta('twitter:title').setAttribute('content', title)
  ensureMeta('twitter:description').setAttribute('content', description)

  // JSON-LD (replace or create a single script tag)
  const existingLd = document.getElementById('structured-data') as HTMLScriptElement | null
  const script = existingLd || document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'structured-data'
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Berke Doğan',
    url: canonicalBase,
    sameAs: [
      'https://github.com/1xKroMx',
      'https://www.linkedin.com/in/berke-doğan-972292359'
    ],
    jobTitle: 'Full-Stack Web Developer',
    description
  }
  script.textContent = JSON.stringify(ld)
  if (!existingLd) document.head.appendChild(script)
})

app.mount('#app')
