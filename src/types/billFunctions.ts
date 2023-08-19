import { AccountHistory } from './accountHistory'
import { Bill } from './bill'
import { BillAccountHistory } from './billAccountHistory'
import { BillItem } from './billItem'

export interface BillFunctions {
  apartBill: Bill
  bills: Bill[]
  closeApartBill: (workDayUserIdClose: number, billId: number, billHistories: BillAccountHistory[]) => Promise<boolean>
  
  //Refactor  
  resetBillItems: (billId: number, tableNumber: number) => void
  addBillItem: (billItem: BillItem, billId: number, tableNumber: number, menuId: number) => void
  addDescriptionToBillProduct: (saleItemId: number, itemNumber: number, saleItemProductId: number, description: string, billId: number, tableNumber: number) => void
  addAccountHistory: (accountHistory: AccountHistory, billId: number) => void
  closeBill: (workDayUserIdClose: number, billId: number, billHistories?: BillAccountHistory[]) => Promise<boolean>
  changeTableNumber: (tableNumber: number, newTableNumber: number) =>void
  editLinkedProduct: (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => BillItem | undefined
  fastPayAction: (accountHistory: AccountHistory, billId: number, workDayUserIdClose: number) => Promise<boolean>
  getOpenBills: () => Promise<void>
  getBill: (billId: number, tableNumber: number) => Bill
  getBillFromDB: (tmpId: number) => void
  getBillById: (tmpId: number) => void
  getClient: (phone: string, billId: number, tableNumber: number, forApartBill?: boolean) => void
  getBillByTableNumber: (tableNumber: number) => Bill
  moveBillItem: (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => void
  moveBillItemBack : (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => void
  printBill: (billId: number, tableNumber: number) => void
  printCommand: (commandBill: Bill) => void
  removeCombinedLinkedProduct: (saleItemProductId: number, productId: number, saleItemId: number, billId: number, tableNumber: number) => void
  removeAccountHistory: (accountHistory: AccountHistory, billId: number) => void
  removeBillItem: (billItem: BillItem, billId: number , tableNumber: number) => void
  removeLinkedProduct: (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => void
  removeIncompleteBill : () => void
  serve : (billId: number) => void
  setBillAddress: (addressId: number, billId: number, tableNumber: number, forApartBill?: boolean) => void
  setDeliveryMethod: (deliveryMethod: number, billId: number, tableNumber: number) => void
  setDiscount : (discount: number, billId: number, tableNumber: number) => void  
  setBillItemDiscount: (discount: number, billItemId: number, billId: number, tableNumber: number) => void
  updateBillFromDB: (id: number) => void
}