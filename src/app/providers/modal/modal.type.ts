import type React from 'react'

export type AlertOptions = {
  title?: string
  content: React.ReactNode
  confirmText?: string
  onClose?: () => void
}

export type ConfirmOptions = {
  title?: string
  content: React.ReactNode
  confirmText?: string
  cancelText?: string
  confirmDisabled?: boolean
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void | Promise<void>
}

type AlertState = {
  type: 'alert'
  options: AlertOptions
  resolve: () => void
}

type ConfirmState = {
  type: 'confirm'
  options: ConfirmOptions
  resolve: (value: boolean) => void
}

export type ModalState = AlertState | ConfirmState | null

export type ModalApi = {
  alert: (options: AlertOptions) => Promise<void>
  confirm: (options: ConfirmOptions) => Promise<boolean>
  update: (patch: Partial<AlertOptions & ConfirmOptions>) => void
  close: () => void
}
