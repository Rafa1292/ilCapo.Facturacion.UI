import { ModifierElement } from './modifierElement'

export interface ModifierGroup {
  id: number
  name: string
  minSelectable: number
  maxSelectable: number
  isRequired: boolean
  label: string
  delete: boolean
  elements?: ModifierElement[]
  createdBy?: number
  updatedBy?: number
}