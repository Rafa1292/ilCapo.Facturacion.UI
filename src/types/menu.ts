export interface Menu {
    id: number
    name: string
    comissionPercentage: number
    delete: boolean
    createdAt?: Date
    updatedAt?: Date
    createdBy?: number
    updatedBy?: number
  }