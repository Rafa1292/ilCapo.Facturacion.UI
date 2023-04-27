export interface Input {
  id: number
  name: string
  lowerPrice: number
  currentPrice: number
  upperPrice: number
  lastPrice: number
  expectedPrice: number
  stock: number
  presentation: number
  suggestedStock: number
  currentProviderId: number
  measureId: number
  inputCategoryId: number
  delete: boolean
  createdBy?: number
  updatedBy?: number
}