import { Address } from './address'

export interface Client {
  id: number
  name: string
  phone: string
  mail: string
  cedula: string
  creditState: number
  creditLimit: number
  addressess: Address[]
  delete: boolean
  createdBy?: number
  updatedBy?: number
}