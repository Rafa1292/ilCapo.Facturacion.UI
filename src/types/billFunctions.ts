import { AccountHistory } from './accountHistory'
import { Bill } from './bill'
import { BillAccountHistory } from './billAccountHistory'
import { BillItem } from './billItem'

export interface BillFunctions {
  bill: Bill
  bills: Bill[]
  removeBillItem: (billItem: BillItem, billId: number , tableNumber: number) => void
  printBill: () => void
  removeCombinedLinkedProduct: (saleItemProductId: number, productId: number, saleItemId: number) => void
  closeApartBill: (originalBill: Bill, billHistories: BillAccountHistory[]) => Promise<boolean>
  setBillAddress: (addressId: number) => void
  setDiscount : (discount: number) => void  
  setDeliveryMethod: (deliveryMethod: number) => void
  setCurrentBill: (currentBill: Bill) => void
  addBillItem: (billItem: BillItem, tableNumber: number) => void
  
  //Refactor
  closeBill: (workDayUserIdClose: number, billId: number, billHistories?: BillAccountHistory[]) => Promise<boolean>
  serve : (billId: number) => void
  removeAccountHistory: (accountHistory: AccountHistory, billId: number) => void
  addAccountHistory: (accountHistory: AccountHistory, billId: number) => void
  getOpenBills: () => Promise<void>
  changeTableNumber: (tableNumber: number, newTableNumber: number) =>void
  addDescriptionToBillProduct: (saleItemId: number, itemNumber: number, saleItemProductId: number, description: string, billId: number, tableNumber: number) => void
  fastPayAction: (accountHistory: AccountHistory, billId: number, workDayUserIdClose: number) => Promise<boolean>
  getBillFromDB: (tmpId: number) => void
  getBillById: (tmpId: number) => void
  getClient: (phone: string, tableNumber: number) => void
  getBillByTableNumber: (tableNumber: number) => Bill
  updateBillFromDB: (id: number) => void
  editLinkedProduct: (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => BillItem | undefined
  removeLinkedProduct: (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => void
}