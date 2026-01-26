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
})
