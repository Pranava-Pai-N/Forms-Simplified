import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './hooks/useAuth'
import { routeTree } from './routeTree.gen'
import './index.css'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

const router = createRouter({
  routeTree,
  context: {
    user: undefined,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AppRouter() {
  const { user } = useAuth()

  return <RouterProvider router={router} context={{ user }} />
}

const rootEl = document.getElementById('root')

if (!rootEl) throw new Error('root element missing')

createRoot(rootEl).render(
  <AuthProvider>
    <Toaster richColors position="top-right" theme="dark" duration={3000} />
    <AppRouter />
  </AuthProvider>,
)
