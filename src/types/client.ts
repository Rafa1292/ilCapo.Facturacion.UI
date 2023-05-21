import { Address } from './address'

export interface Client {
  id: number
  name: string
  phone: string
  addressess: Address[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}