import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders.tsx'
import { router } from './app/router/Router.tsx'

async function enableMocking() {
  if (!import.meta.env.DEV) return

  const { worker } = await import('@/mocks/browser')

  const base = import.meta.env.BASE_URL
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${base}mockServiceWorker.js`,
      options: { scope: base },
    },
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
})
