import { useState } from 'react'
import { Bill } from '../types/bill'
import { BillFunctions } from '../types/billFunctions'
import { BillItem } from '../types/billItem'
import { AccountHistory } from '../types/accountHistory'
import { BillAccountHistory } from '../types/billAccountHistory'
import { BillItemLinkedProduct } from '../types/billItemLinkedProduct'
import { useGet } from './useAPI'
import { Client } from '../types/client'

const initialBillAccounthistory: BillAccountHistory = {
  id: 0,
  billId: 0,
  accountHistoryId: 0,
  accountHistory: {} as AccountHistory,
  delete: false,
  createdBy: 0,
  updatedBy: 0
}

const initialClient: Client = {
  id: 0,
  name: '',
  phone: '',
  addressess: [],
  delete: false,
  createdBy: 0,
  updatedBy: 0
}

const initialBill: Bill = {
  id: 0,
  addressId: 0,
  client: initialClient,
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


const useBill = (tableNumber: number): BillFunctions => {
  const [bill, setBill] = useState<Bill>({...initialBill, tableNumber: tableNumber})

  const addBillItem = (billItem: BillItem) => {
    if (bill.billItems.map(item => item.saleItemId).includes(billItem.saleItemId)) {
      const tmpBillItems = bill.billItems.filter(item => item.saleItemId !== billItem.saleItemId)
      const tmpBillItem = bill.billItems.find(item => item.saleItemId === billItem.saleItemId)
      if (tmpBillItem) {
        tmpBillItem.quantity = tmpBillItem.quantity + 1
        billItem.billItemLinkedProducts = billItem.billItemLinkedProducts.map(x => { return { ...x, itemNumber: tmpBillItem.quantity } as BillItemLinkedProduct })
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
      billItems: bill.billItems.filter(item => item.saleItemId !== billItem.saleItemId)
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

  const removeLinkedProduct = (saleItemId: number, itemNumber: number, billItemLinkedProductId: number) => {
    for (const billItem of bill.billItems) {      
      if (billItem.saleItemId === saleItemId) {
        billItem.quantity = billItem.quantity - 1
        billItem.billItemLinkedProducts = billItem.billItemLinkedProducts.filter(linkedProduct => linkedProduct.itemNumber !== itemNumber).map(x => { return { ...x, itemNumber: x.itemNumber > itemNumber ? x.itemNumber -1 : x.itemNumber } as BillItemLinkedProduct })
        if (billItem.billItemLinkedProducts.length === 0) {
          removeBillItem(billItem)
        }
        else {
          setBill({
            ...bill,
            billItems: bill.billItems.map(item => item.saleItemId === saleItemId ? billItem : item)
          })
        }
      }
    }
  }

  const editLinkedProduct = (saleItemId: number, itemNumber: number): BillItem | undefined => {
    for (const billItem of bill.billItems) {      
      if (billItem.saleItemId === saleItemId) {
        const tmpBillItemLinkedProducts = billItem.billItemLinkedProducts.filter(linkedProduct => linkedProduct.itemNumber === itemNumber)
        billItem.billItemLinkedProducts = billItem.billItemLinkedProducts.filter(linkedProduct => linkedProduct.itemNumber !== itemNumber).map(x => { return { ...x, itemNumber: x.itemNumber > itemNumber ? x.itemNumber -1 : x.itemNumber } as BillItemLinkedProduct })
        if (billItem.billItemLinkedProducts.length === 0) {
          removeBillItem(billItem)
        }
        else {
          setBill({
            ...bill,
            billItems: bill.billItems.map(item => item.saleItemId === saleItemId ? {...billItem, quantity: billItem.quantity - 1} : item)
          })
        }
        return {...billItem, billItemLinkedProducts: tmpBillItemLinkedProducts}
      }
    }
    return undefined
  }

  const getClient = async (phone: string) => {
    const response = await useGet<Client>(`clients/phone/${phone}`, true)
    if (!response.error && response.data !== null) {
      const client = response.data
      setBill({
        ...bill,
        clientId: client.id,
        client: client
      })
    }
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
    printBill,
    removeLinkedProduct,
    editLinkedProduct,
    getClient
  }
}

export default useBill