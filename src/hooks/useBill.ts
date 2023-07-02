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
  isServed: false,
  isNull: false,
  items: [],
  isCommanded: false,
  billAccountHistories: [],
  delete: false,
  createdAt: new Date(Date.now()),
  updatedAt: new Date(Date.now()),
  createdBy: 0,
  updatedBy: 0
}


const useBill = (tableNumber: number): BillFunctions => {
  const [bill, setBill] = useState<Bill>(initialBill)
  const [bills, setBills] = useState<Bill[]>([])

  const getBillsByWorkDayUser = async (workDayUserId: number) => {
    const response = await useGetList<Bill[]>(`bills/billsByWorkDayUser/${workDayUserId}`, true)
    if (!response.error) {
      const tmpBills: Bill[] = []
      for (const bill of response.data) {
        const tmpBill = await completeBill(bill)
        tmpBills.push(tmpBill)
      }
      setBills(tmpBills)
    }
  }

  const setBillByTableNumber = (tableNumber: number): Bill => {
    const tmpBill = bills.find(bill => bill.tableNumber === tableNumber && !bill.close)
    if (tmpBill) {
      return tmpBill
    } else {
      const tmpInitialBill = { ...initialBill, tableNumber: tableNumber, deliveryMethod: 0 }
      return tmpInitialBill
    }
  }

  const getClient = async (phone: string, tableNumber: number) => {
    const response = await useGet<Client>(`clients/phone/${phone}`, true)
    if (!response.error && response.data !== null) {
      const client = response.data
      const currentBill = setBillByTableNumber(tableNumber)
      currentBill.clientId = client.id
      currentBill.client = client
      const currentBills = bills.filter(bill => bill.tableNumber !== tableNumber)
      setBills([...currentBills, currentBill])
    }
  }

  const getBillFromDB = async (tmpId: number): Promise<Bill> => {
    if (tmpId === 0) {
      return { ...initialBill, tableNumber: tableNumber, deliveryMethod: tableNumber !== 0 ? 0 : 1 }
    } else {
      const url = `bills/${tmpId}`
      const response = await useGet<Bill>(url, true)
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
        return { ...bill, isCommanded: true, billAccountHistories: accountHistories }
      }
    }
    return { ...initialBill, tableNumber: tableNumber, deliveryMethod: tableNumber !== 0 ? 0 : 1 }
  }

  const getBill = (billId: number) => {
    if (billId === 0) {
      return { ...initialBill, tableNumber: tableNumber, deliveryMethod: 1 }
    } else {
      const tmpBill = bills.find(bill => bill.id === billId)
      if (tmpBill) {
        return tmpBill
      } else {
        return { ...initialBill, tableNumber: tableNumber, deliveryMethod: 1 }
      }
    }
  }

  const updateBillFromDB = async (id: number) => {
    const currentBill = await getBillFromDB(id)
    let currentBills = bills.filter(bill => bill.id !== id)
    currentBills = currentBills.filter(bill => bill.tableNumber !== currentBill.tableNumber)
    if (!currentBill.close)
      currentBills.push(currentBill)
    console.log(currentBills)
    setBills([...currentBills])
  }

  const fastPayAction = async (accountHistory: AccountHistory, billId: number): Promise<boolean> => {
    const currentBill = getBill(billId)
    const response = await usePatch<Bill>('bills/close', { ...currentBill, billAccountHistories: [{ ...initialBillAccounthistory, accountHistory: accountHistory }] }, true)
    if (!response.error) {
      updateBillFromDB(billId)
      return true
    }
    return false
  }

  // Refactorizacion de funciones
  const setCurrentBill = (currentBill: Bill) => {
    setBill(currentBill)
  }

  const addBillItem = (billItem: BillItem, tableNumber: number) => {
    console.log(bills)
    const currentBill = setBillByTableNumber(tableNumber)
    if (currentBill.items.map(item => item.saleItemId).includes(billItem.saleItemId)) {
      const tmpBillItems = currentBill.items.filter(item => item.saleItemId !== billItem.saleItemId)
      const tmpBillItem = currentBill.items.find(item => item.saleItemId === billItem.saleItemId)
      if (tmpBillItem) {
        tmpBillItem.quantity = tmpBillItem.quantity + 1
        billItem.billProducts = billItem.billProducts.map(x => { return { ...x, itemNumber: tmpBillItem.quantity } as BillItemLinkedProduct })
        tmpBillItem.billProducts = [...tmpBillItem.billProducts, ...billItem.billProducts]
        const newBill = {
          ...currentBill,
          items: [...tmpBillItems, tmpBillItem]
        }
        const currentBills = newBill.tableNumber > 0 ? bills.filter(bill => bill.tableNumber !== tableNumber) : bills.filter(bill => bill.id !== currentBill.id)
        setBills([...currentBills, newBill])
      }
    }
    else {
      const newBill = {
        ...currentBill,
        items: [...currentBill.items, billItem]
      }
      const currentBills = newBill.tableNumber > 0 ? bills.filter(bill => bill.tableNumber !== tableNumber) : bills.filter(bill => bill.id !== currentBill.id)
      setBills([...currentBills, newBill])
    }
  }

  const setDeliveryMethod = (deliveryMethod: number) => {
    const tableNumber = deliveryMethod !== 0 ? 0 : bill.tableNumber
    setBill({
      ...bill,
      deliveryMethod: deliveryMethod,
      isCommanded: false,
      tableNumber
    })
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

  const addDescriptionToBillProduct = (saleItemId: number, itemNumber: number, saleItemProductId: number, description: string) => {
    for (const billItem of bill.items) {
      if (billItem.saleItemId === saleItemId) {
        for (const billItemLinkedProduct of billItem.billProducts) {
          if (billItemLinkedProduct.itemNumber === itemNumber && billItemLinkedProduct.saleItemProductId === saleItemProductId) {
            billItemLinkedProduct.description = description
          }
        }
      }
    }
    setBill({
      ...bill,
      isCommanded: false
    })
  }

  const changeTableNumber = (tableNumber: number) => {
    setBill({
      ...bill,
      tableNumber: tableNumber,
      isCommanded: false
    })
  }


  const closeBill = async (billHistories?: BillAccountHistory[]): Promise<boolean> => {
    const response = await usePatch<Bill>('bills/close', { ...bill, billAccountHistories: billHistories ? billHistories : bill.billAccountHistories }, true)
    if (!response.error) {
      setBill({ ...initialBill, tableNumber: tableNumber })
      return true
    }
    return false
  }

  const closeApartBill = async (originalBill: Bill, billHistories: BillAccountHistory[]): Promise<boolean> => {
    const response = await usePatch<any>('bills/closeApart', { bill: { ...bill, billAccountHistories: billHistories } as Bill, originalBill: originalBill }, true)
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

  const serve = async () => {
    const response = await useGet<Bill>(`bills/serve/${bill.id}`, true)
    if (!response.error) {
      setBill({ ...bill, isServed: true })
    }
  }

  const completeBill = async (bill: Bill) => {
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
    return { ...bill, isCommanded: bill.id > 0 ? true : false }
  }

  return {
    bill,
    bills,
    addBillItem,
    removeBillItem,
    addAccountHistory,
    removeAccountHistory,
    printBill,
    removeLinkedProduct,
    editLinkedProduct,
    getClient,
    getBillFromDB,
    getBill,
    removeCombinedLinkedProduct,
    fastPayAction,
    closeBill,
    closeApartBill,
    updateBillFromDB,
    setBillAddress,
    setDiscount,
    setDeliveryMethod,
    serve,
    setCurrentBill,
    addDescriptionToBillProduct,
    changeTableNumber,
    getBillsByWorkDayUser,
    setBillByTableNumber
  }
}

export default useBill