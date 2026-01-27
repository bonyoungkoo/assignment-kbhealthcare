import { createContext } from 'react'
import type { ModalApi } from './modal.type'

export const ModalContext = createContext<ModalApi | null>(null)
