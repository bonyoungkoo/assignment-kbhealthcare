import { colors } from '@/shared/theme/colors'
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
    },
    action: {
      disabled: colors.disabled.main,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%' },
        body: { height: '100%', margin: 0, display: 'block' },
        '#root': { height: '100%' },
      },
    },
  },
})
