import { Address } from './address'

export interface Client {
  id: number
  name: string
  phone: string
  mail: string
  cedula: string
  addressess: Address[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}