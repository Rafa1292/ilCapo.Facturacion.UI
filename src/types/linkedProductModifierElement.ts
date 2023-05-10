
export interface LinkedProductModifierElement {
  id: number
  linkedProductModifierId: number
  modifierElementId: number
  price: number
  delete: boolean
  name: string
  quantity: number
  createdBy?: number
  updatedBy?: number
}