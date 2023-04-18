import { UserInfo } from './userInfo'

export interface User {
  id: number
  email: string
  password: string
  userInfo: UserInfo
  delete: boolean
  createdBy?: number
  updatedBy?: number
}