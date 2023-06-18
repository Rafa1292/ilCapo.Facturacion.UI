import { AccountHistory } from './accountHistory'
import { Bill } from './bill'
import { BillAccountHistory } from './billAccountHistory'
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
  getClient: (phone: string) => void
  getBill: () => void
  removeCombinedLinkedProduct: (saleItemProductId: number, productId: number, saleItemId: number) => void
  fastPayAction: (accountHistory: AccountHistory) => Promise<boolean>
  closeBill: (billHistories?: BillAccountHistory[]) => Promise<boolean>
  closeApartBill: (originalBill: Bill, billHistories: BillAccountHistory[]) => Promise<boolean>
  restartBill: () => void
  setBillAddress: (addressId: number) => void
  setDiscount : (discount: number) => void  
  setDeliveryMethod: (deliveryMethod: number) => void
  serve : () => void
  setCurrentBill: (currentBill: Bill) => void
}