import { AccountHistory } from './accountHistory'
import { Bill } from './bill'
import { BillItem } from './billItem'

export interface BillFunctions {
  bill: Bill
  addBillItem: (billItem: BillItem) => void
  removeBillItem: (billItem: BillItem) => void
  addAccountHistory: (accountHistory: AccountHistory) => void
  removeAccountHistory: (accountHistory: AccountHistory) => void
  printBill: () => void
  removeLinkedProduct: (saleItemId: number, itemNumber: number, billItemLinkedProductId: number) => void
  editLinkedProduct: (saleItemId: number, itemNumber: number ) => BillItem | undefined
}