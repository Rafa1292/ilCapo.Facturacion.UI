import { useContext, useState } from 'react'
import { Bill } from '../types/bill'
import { BillFunctions } from '../types/billFunctions'
import { BillItem } from '../types/billItem'
import { AccountHistory } from '../types/accountHistory'
import { BillAccountHistory } from '../types/billAccountHistory'
import { BillItemLinkedProduct } from '../types/billItemLinkedProduct'
import { useGet, useGetList, usePatch, usePost } from './useAPI'
import { Client } from '../types/client'
import { LinkedProduct } from '../types/linkedProduct'
import { LinkedProductModifierElement } from '../types/linkedProductModifierElement'
import AppContext from '../context/AppContext'

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
  items: [],
  isCommanded: true,
  billAccountHistories: [],
  delete: false,
  createdBy: 0,
  updatedBy: 0
}


const useBill = (tableNumber: number): BillFunctions => {
  const [bill, setBill] = useState<Bill>({ ...initialBill, tableNumber: tableNumber })
  const { user } = useContext(AppContext)

  const addBillItem = (billItem: BillItem) => {
    if (bill.items.map(item => item.saleItemId).includes(billItem.saleItemId)) {
      const tmpBillItems = bill.items.filter(item => item.saleItemId !== billItem.saleItemId)
      const tmpBillItem = bill.items.find(item => item.saleItemId === billItem.saleItemId)
      if (tmpBillItem) {
        tmpBillItem.quantity = tmpBillItem.quantity + 1
        billItem.billProducts = billItem.billProducts.map(x => { return { ...x, itemNumber: tmpBillItem.quantity } as BillItemLinkedProduct })
        tmpBillItem.billProducts = [...tmpBillItem.billProducts, ...billItem.billProducts]
        setBill({
          ...bill,
          items: [...tmpBillItems, tmpBillItem]
        })
      }
    }
    else {
      setBill({
        ...bill,
        items: [...bill.items, billItem]
      })
    }
  }

  const removeBillItem = (billItem: BillItem) => {
    setBill({
      ...bill,
      isCommanded: false,
      items: bill.items.filter(item => item.saleItemId !== billItem.saleItemId)
    })
  }

  const addAccountHistory = (accountHistory: AccountHistory) => {
    setBill({
      ...bill,
      billAccountHistories: [...bill.billAccountHistories, { ...initialBillAccounthistory, accountHistoryId: accountHistory.id, accountHistory: accountHistory }]
    })
  }

  const removeAccountHistory = (accountHistory: AccountHistory) => {
    const tmpBillItems: BillAccountHistory[] = bill.billAccountHistories
    for (const billAccountHistory of bill.billAccountHistories) {
      if (billAccountHistory.accountHistory.amount === accountHistory.amount && billAccountHistory.accountHistory.payMethodId === accountHistory.payMethodId) {
        tmpBillItems.splice(tmpBillItems.indexOf(billAccountHistory), 1)
      }
    }
    setBill({
      ...bill,
      billAccountHistories: tmpBillItems
    })
  }

  const removeLinkedProduct = (saleItemId: number, itemNumber: number, billItemLinkedProductId: number) => {
    for (const billItem of bill.items) {
      if (billItem.saleItemId === saleItemId) {
        billItem.quantity = billItem.quantity - 1
        billItem.billProducts = billItem.billProducts.filter(linkedProduct => linkedProduct.itemNumber !== itemNumber).map(x => { return { ...x, itemNumber: x.itemNumber > itemNumber ? x.itemNumber - 1 : x.itemNumber } as BillItemLinkedProduct })
        if (billItem.billProducts.length === 0) {
          removeBillItem(billItem)
        }
        else {
          setBill({
            ...bill,
            isCommanded: false,
            items: bill.items.map(item => item.saleItemId === saleItemId ? billItem : item)
          })
        }
      }
    }
  }

  const removeCombinedLinkedProduct = (saleItemProductId: number, productId: number, saleItemId: number) => {
    const billItem = bill.items.find(item => item.saleItemId === saleItemId)
    console.log(billItem)
    if (!billItem) return
    for (const billItemLinkedProduct of billItem.billProducts) {
      if (billItemLinkedProduct.saleItemProductId === saleItemProductId) {
        console.log('productId', productId)
        billItemLinkedProduct.products = billItemLinkedProduct.products.filter((x) => x.productId !== productId)
        billItemLinkedProduct.products = billItemLinkedProduct.products.map(x => { return { ...x, isCommanded: false } as LinkedProduct })
      }
    }
    setBill({
      ...bill,
      items: bill.items.map(item => item.saleItemId === saleItemId ? billItem : item)
    })
  }

  const editLinkedProduct = (saleItemId: number, itemNumber: number): BillItem | undefined => {
    for (const billItem of bill.items) {
      if (billItem.saleItemId === saleItemId) {
        const tmpBillProducts = billItem.billProducts.filter(linkedProduct => linkedProduct.itemNumber === itemNumber)

        for (const billProduct of tmpBillProducts) {
          for (const product of billProduct.products) {
            product.isCommanded = false
          }
        }

        billItem.billProducts = billItem.billProducts.filter(linkedProduct => linkedProduct.itemNumber !== itemNumber).map(x => { return { ...x, itemNumber: x.itemNumber > itemNumber ? x.itemNumber - 1 : x.itemNumber } as BillItemLinkedProduct })
        if (billItem.billProducts.length === 0) {
          removeBillItem(billItem)
        }
        else {
          setBill({
            ...bill,
            items: bill.items.map(item => item.saleItemId === saleItemId ? { ...billItem, quantity: billItem.quantity - 1 } : item)
          })
        }
        return { ...billItem, billProducts: tmpBillProducts }
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

  const getBill = async () => {
    console.log('getBill', tableNumber)
    const response = await useGet<Bill>(`bills/table/${tableNumber}`, true)

    if (!response.error && response.data !== null) {
      const bill = response.data
      for (const billItem of bill.items) {
        for (const billItemLinkedProduct of billItem.billProducts) {
          const response = await useGetList<LinkedProduct[]>(`linkedProducts/${billItemLinkedProduct.id}`, true)
          if (!response.error && response.data !== null) {
            billItemLinkedProduct.products = response.data
            for (const linkedProduct of billItemLinkedProduct.products) {
              for (const productModifier of linkedProduct.modifiers) {
                const response = await useGetList<LinkedProductModifierElement[]>(`linkedProductModifierElements/${productModifier.id}`, true)
                if (!response.error && response.data !== null) {
                  productModifier.elements = response.data
                }
                else {
                  productModifier.elements = []
                }
              }
            }
          }
          else {
            billItemLinkedProduct.products = []
          }
        }
      }
      const accountHistories = bill.billAccountHistories?.length > 0 ? bill.billAccountHistories : []
      setBill({ ...bill, isCommanded: true, billAccountHistories: accountHistories })
    }
  }

  const fastPayAction = async (accountHistory: AccountHistory): Promise<boolean> => {
    const response = await usePatch<Bill>('bills/close', { ...bill, workDayUserId: user.workDayUser.id, billAccountHistories: [{ ...initialBillAccounthistory, accountHistory: accountHistory }] }, true)
    if (!response.error) {
      setBill({ ...initialBill, tableNumber: tableNumber })
      return true
    }
    return false
  }

  const closeBill = async (billHistories?: BillAccountHistory[]): Promise<boolean> => {
    const response = await usePatch<Bill>('bills/close', { ...bill, workDayUserId: user.workDayUser.id, billAccountHistories: billHistories ? billHistories : bill.billAccountHistories }, true)
    if (!response.error) {
      setBill({ ...initialBill, tableNumber: tableNumber })
      return true
    }
    return false
  }

  const restartBill = () => {
    setBill({ ...initialBill, tableNumber: tableNumber, workDayUserId: user.workDayUser.id })
  }

  const closeApartBill = async (originalBill: Bill, billHistories: BillAccountHistory[]): Promise<boolean> => {
    const response = await usePatch<any>('bills/closeApart', { bill: { ...bill, billAccountHistories: billHistories, workDayUserId: user.workDayUser.id } as Bill, originalBill: originalBill }, true)
    if (!response.error) {
      setBill(initialBill)
      return true
    }
    return false
  }

  const printBill = () => {
    console.log(bill)
  }

  const setBillAddress = (addressId: number) => {
    setBill({ ...bill, addressId: addressId, isCommanded: false })
  }

  const setDiscount = (discount: number) => {
    const itemdiscount = discount / bill.items.length
    const tmpBillItems = bill.items
    for (const billItem of tmpBillItems) {
      billItem.discount = itemdiscount
    }
    setBill({ ...bill, items: tmpBillItems, isCommanded: false })
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
    getClient,
    getBill,
    removeCombinedLinkedProduct,
    fastPayAction,
    closeBill,
    closeApartBill,
    restartBill,
    setBillAddress,
    setDiscount
  }
}

export default useBill