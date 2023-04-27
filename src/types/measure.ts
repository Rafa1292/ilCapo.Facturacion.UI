export interface Measure {
  id: number
  name: string
  principalMeasure: boolean
  value: number
  magnitudeId: number
  abbreviation: string
  delete: boolean
  createdBy?: number
  updatedBy?: number
}