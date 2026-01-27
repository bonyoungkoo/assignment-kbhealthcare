import { useCallback, useMemo, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import type { AlertOptions, ConfirmOptions, ModalApi, ModalState } from './modal.type'
import { ModalContext } from './ModalContext'

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ModalState>(null)

  const close = useCallback(() => {
    setState(null)
  }, [])

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>(resolve => {
      setState({ type: 'alert', options, resolve })
    })
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setState({ type: 'confirm', options, resolve })
    })
  }, [])

  const api = useMemo<ModalApi>(() => ({ alert, confirm, close }), [alert, confirm, close])

  const handleAlertClose = async () => {
    if (state?.type !== 'alert') return
    state.options.onClose?.()
    state.resolve()
    close()
  }

  const handleConfirmApprove = () => {
    if (state?.type !== 'confirm') return
    state.options.onConfirm?.()
    state.resolve(true)
    close()
  }

  const handleConfirmReject = () => {
    if (state?.type !== 'confirm') return
    state.options.onCancel?.()
    state.resolve(false)
    close()
  }

  const open = !!state
  const title = state?.options.title ?? '알림'

  return (
    <ModalContext.Provider value={api}>
      {children}

      <Dialog
        open={open}
        onClose={() => {
          if (!state) return
          if (state.type === 'alert') handleAlertClose()
          else handleConfirmReject()
        }}
        fullWidth
        maxWidth="xs"
        disableAutoFocus
      >
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>{state?.options.content}</DialogContent>

        <DialogActions>
          {state?.type === 'confirm' ? (
            <>
              <Button onClick={handleConfirmReject}>{state.options.cancelText ?? '취소'}</Button>
              <Button variant="contained" onClick={handleConfirmApprove}>
                {state.options.confirmText ?? '확인'}
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={handleAlertClose}>
              {state?.options.confirmText ?? '확인'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ModalContext.Provider>
  )
}
