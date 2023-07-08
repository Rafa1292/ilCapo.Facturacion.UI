import { AccountHistory } from './accountHistory'
import { Bill } from './bill'
import { BillAccountHistory } from './billAccountHistory'
import { BillItem } from './billItem'

export interface BillFunctions {
  bill: Bill
  bills: Bill[]
  removeBillItem: (billItem: BillItem, billId: number , tableNumber: number) => void
  addAccountHistory: (accountHistory: AccountHistory) => void
  removeAccountHistory: (accountHistory: AccountHistory) => void
  printBill: () => void
  removeCombinedLinkedProduct: (saleItemProductId: number, productId: number, saleItemId: number) => void
  closeBill: (billHistories?: BillAccountHistory[]) => Promise<boolean>
  closeApartBill: (originalBill: Bill, billHistories: BillAccountHistory[]) => Promise<boolean>
  setBillAddress: (addressId: number) => void
  setDiscount : (discount: number) => void  
  setDeliveryMethod: (deliveryMethod: number) => void
  serve : () => void
  setCurrentBill: (currentBill: Bill) => void
  addDescriptionToBillProduct: (saleItemId: number, itemNumber: number, saleItemProductId: number, description: string) => void
  changeTableNumber: (tableNumber: number) =>void
  getBillsByWorkDayUser: (workDayUserId: number) => Promise<void>
  
  //Refactor
  fastPayAction: (accountHistory: AccountHistory, billId: number) => Promise<boolean>
  getBillFromDB: (tmpId: number) => void
  getBillById: (tmpId: number) => void
  getClient: (phone: string, tableNumber: number) => void
  getBillByTableNumber: (tableNumber: number) => Bill
  addBillItem: (billItem: BillItem, tableNumber: number) => void
  updateBillFromDB: (id: number) => void
  editLinkedProduct: (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => BillItem | undefined
  removeLinkedProduct: (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => void

}