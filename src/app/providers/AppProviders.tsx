import { ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { theme } from '../theme'
import { CssBaseline } from '@mui/material'
import { AuthProvider } from './auth/AuthProvider'
import { ModalProvider } from './modal/ModalProvider'

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ModalProvider>{children}</ModalProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
