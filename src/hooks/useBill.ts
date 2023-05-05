import { useState } from 'react'
import { Bill } from '../types/bill'
import { BillFunctions } from '../types/billFunctions'
import { BillItem } from '../types/billItem'
import { AccountHistory } from '../types/accountHistory'
import { BillAccountHistory } from '../types/billAccountHistory'

const initialBillAccounthistory: BillAccountHistory = {
  id: 0,
  billId: 0,
  accountHistoryId: 0,
  accountHistory: {} as AccountHistory,
  delete: false,
  createdBy: 0,
  updatedBy: 0
}

const initialBill: Bill = {
  id: 0,
  addressId: 0,
  clientId: 0,
  close: false,
  deliveryMethod: 0,
  tableNumber: 0,
  workDayUserId: 0,
  billItems: [],
  billAccountHistories: [],
  delete: false,
  createdBy: 0,
  updatedBy: 0
}


const useBill = (): BillFunctions => {
  const [bill, setBill] = useState<Bill>(initialBill)

  const addBillItem = (billItem: BillItem) => {
    if (bill.billItems.map(item => item.saleItemId).includes(billItem.saleItemId)) {
      const tmpBillItems = bill.billItems.filter(item => item.saleItemId !== billItem.saleItemId)
      const tmpBillItem = bill.billItems.find(item => item.saleItemId === billItem.saleItemId)
      if (tmpBillItem) {
        tmpBillItem.quantity += billItem.quantity
        tmpBillItem.billItemLinkedProducts = [...tmpBillItem.billItemLinkedProducts, ...billItem.billItemLinkedProducts]
        setBill({
          ...bill,
          billItems: [...tmpBillItems, tmpBillItem]
        })
      }
    }
    else {
      setBill({
        ...bill,
        billItems: [...bill.billItems, billItem]
      })
    }
  }

  const removeBillItem = (billItem: BillItem) => {
    setBill({
      ...bill,
      billItems: bill.billItems.filter(item => item.id !== billItem.id)
    })
  }

  const addAccountHistory = (accountHistory: AccountHistory) => {
    setBill({
      ...bill,
      billAccountHistories: [...bill.billAccountHistories, { ...initialBillAccounthistory, accountHistoryId: accountHistory.id, accountHistory: accountHistory }]
    })
  }

  const removeAccountHistory = (accountHistory: AccountHistory) => {
    setBill({
      ...bill,
      billAccountHistories: bill.billAccountHistories.filter(bilItemAccountHistory => bilItemAccountHistory.accountHistoryId !== accountHistory.id)
    })
  }

  const printBill = () => {
    console.log(bill)
  }

  return {
    bill,
    addBillItem,
    removeBillItem,
    addAccountHistory,
    removeAccountHistory,
    printBill
  }
}

export default useBill