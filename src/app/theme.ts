import { colors } from '@/shared/theme/colors'
import { createTheme } from '@mui/material/styles'

const fontFamily = [
  'Pretendard Variable',
  'Pretendard',
  'system-ui',
  '-apple-system',
  'Segoe UI',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  '"Noto Sans KR"',
  '"Apple SD Gothic Neo"',
  '"Malgun Gothic"',
  'sans-serif',
].join(',')

export const theme = createTheme({
  typography: {
    fontFamily,
  },
  palette: {
    primary: { main: colors.primary.main },
    action: {
      disabled: colors.disabled.main,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%' },
        body: { height: '100%', margin: 0, display: 'block', fontFamily },
        '#root': { height: '100%' },
      },
    },
  },
})
