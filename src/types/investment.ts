import { InvestmentAccountHistory } from './investmentAccountHistory'
import { InvestmentDetail } from './investmentDetail'

export interface Investment {
  id: number
  amount: number
  iva: number
  isNull: boolean
  providerId: number
  discount: number
  workDayUserId: number
  investmentDetails: InvestmentDetail[]
  investmentAccountHistories: InvestmentAccountHistory[]
  pendingPay: boolean
  delete: boolean
  createdBy?: number
  updatedBy?: number
}