import { AccountHistory } from './accountHistory'
import { Bill } from './bill'
import { BillAccountHistory } from './billAccountHistory'
import { BillItem } from './billItem'

export interface BillFunctions {
  bill: Bill
  bills: Bill[]
  addBillItem: (billItem: BillItem, tableNumber: number) => void
  removeCombinedLinkedProduct: (saleItemProductId: number, productId: number, saleItemId: number) => void
  closeApartBill: (originalBill: Bill, billHistories: BillAccountHistory[]) => Promise<boolean>
  setDiscount : (discount: number) => void  
  
  //Refactor
  addDescriptionToBillProduct: (saleItemId: number, itemNumber: number, saleItemProductId: number, description: string, billId: number, tableNumber: number) => void
  addAccountHistory: (accountHistory: AccountHistory, billId: number) => void
  closeBill: (workDayUserIdClose: number, billId: number, billHistories?: BillAccountHistory[]) => Promise<boolean>
  changeTableNumber: (tableNumber: number, newTableNumber: number) =>void
  editLinkedProduct: (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => BillItem | undefined
  fastPayAction: (accountHistory: AccountHistory, billId: number, workDayUserIdClose: number) => Promise<boolean>
  getOpenBills: () => Promise<void>
  getBillFromDB: (tmpId: number) => void
  getBillById: (tmpId: number) => void
  getClient: (phone: string, tableNumber: number) => void
  getBillByTableNumber: (tableNumber: number) => Bill
  printBill: () => void
  removeAccountHistory: (accountHistory: AccountHistory, billId: number) => void
  removeBillItem: (billItem: BillItem, billId: number , tableNumber: number) => void
  removeLinkedProduct: (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => void
  serve : (billId: number) => void
  setBillAddress: (addressId: number, billId: number, tableNumber: number) => void
  setDeliveryMethod: (deliveryMethod: number, billId: number, tableNumber: number) => void
  updateBillFromDB: (id: number) => void
}