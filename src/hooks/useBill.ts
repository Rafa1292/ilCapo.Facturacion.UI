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

  const addDescriptionToBillProduct = async (saleItemId: number, itemNumber: number, saleItemProductId: number, description: string, billId: number, tableNumber: number): Promise<void> => {
    const currentBill = await getBill(billId, tableNumber)
    for (const billItem of currentBill.items) {
      if (billItem.saleItemId === saleItemId) {
        for (const billItemLinkedProduct of billItem.billProducts) {
          if (billItemLinkedProduct.itemNumber === itemNumber && billItemLinkedProduct.saleItemProductId === saleItemProductId) {
            billItemLinkedProduct.description = description
          }
        }
      }
    }
    const currentBills = bills.filter(bill => bill.id > 0 ? bill.id !== billId : bill.tableNumber !== tableNumber)
    setBills([...currentBills, { ...currentBill, isCommanded: false }])
  }

  const editLinkedProduct = (saleItemId: number, itemNumber: number, billId: number, tableNumber: number): BillItem | undefined => {
    const currentBill = getBill(billId, tableNumber)
    for (const billItem of currentBill.items) {
      if (billItem.saleItemId === saleItemId) {
        const tmpBillProducts = billItem.billProducts.filter(linkedProduct => linkedProduct.itemNumber === itemNumber)

        for (const billProduct of tmpBillProducts) {
          for (const product of billProduct.products) {
            product.isCommanded = false
          }
        }

        billItem.billProducts = billItem.billProducts.filter(linkedProduct => linkedProduct.itemNumber !== itemNumber).map(x => {
          return {
            ...x,
            itemNumber: x.itemNumber > itemNumber ?
              x.itemNumber - 1 :
              x.itemNumber
          } as BillItemLinkedProduct
        })

        if (billItem.billProducts.length === 0) {
          removeBillItem(billItem, billId, currentBill.tableNumber)
        }
        else {
          billItem.quantity = billItem.billProducts.length
        }

        return { ...billItem, billProducts: tmpBillProducts }
      }
    }
    return undefined
  }

  const fastPayAction = async (accountHistory: AccountHistory, billId: number): Promise<boolean> => {
    const currentBill = getBillById(billId)
    const response = await usePatch<Bill>('bills/close', { ...currentBill, billAccountHistories: [{ ...initialBillAccounthistory, accountHistory: accountHistory }] }, true)
    if (!response.error) {
      updateBillFromDB(billId)
      return true
    }
    return false
  }

  const getBill = (billId: number, tableNumber: number) => {
    if (billId === 0) {
      return getBillByTableNumber(tableNumber)
    } else {
      return getBillById(billId)
    }
  }

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

  const getBillByTableNumber = (tableNumber: number): Bill => {
    const tmpBill = bills.find(bill => bill.tableNumber === tableNumber && !bill.close)
    if (tmpBill) {
      return tmpBill
    } else {
      const tmpInitialBill = { ...initialBill, tableNumber: tableNumber, deliveryMethod: 0 }
      return tmpInitialBill
    }
  }

  const getBillById = (billId: number) => {
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

  const getClient = async (phone: string, tableNumber: number) => {
    const response = await useGet<Client>(`clients/phone/${phone}`, true)
    if (!response.error && response.data !== null) {
      const client = response.data
      const currentBill = getBillByTableNumber(tableNumber)
      currentBill.clientId = client.id
      currentBill.client = client
      const currentBills = bills.filter(bill => bill.tableNumber !== tableNumber)
      setBills([...currentBills, currentBill])
    }
  }

  const removeBillItem = (billItem: BillItem, billId: number, tableNumber: number) => {
    const currentBill: Bill = getBill(billId, tableNumber)
    const tmpBillItems = currentBill.items.filter(item => item.saleItemId !== billItem.saleItemId)
    const newBill = {
      ...currentBill,
      items: tmpBillItems
    }
    if (billId > 0) {
      const currentBills = bills.filter(bill => bill.id !== currentBill.id)
      setBills([...currentBills, newBill])
    } else {
      const currentBills = bills.filter(bill => bill.tableNumber !== currentBill.tableNumber)
      setBills([...currentBills, newBill])
    }
  }

  const updateBillFromDB = async (id: number) => {
    const currentBill = await getBillFromDB(id)
    let currentBills = bills.filter(bill => bill.id !== id)
    currentBills = currentBills.filter(bill => bill.tableNumber !== currentBill.tableNumber)
    if (!currentBill.close)
      currentBills.push(currentBill)
    setBills([...currentBills])
  }

  const removeLinkedProduct = (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => {
    const currentBill = getBill(billId, tableNumber)
    for (const billItem of currentBill.items) {
      if (billItem.saleItemId === saleItemId) {
        billItem.billProducts = billItem.billProducts.filter(linkedProduct => linkedProduct.itemNumber !== itemNumber).map(x => {
          const newBillItemLinkedProduct: BillItemLinkedProduct = {
            ...x,
            products: x.products.map(product => { return { ...product, isCommanded: false } }),
            itemNumber: x.itemNumber > itemNumber ?
              x.itemNumber - 1 :
              x.itemNumber
          }
          return newBillItemLinkedProduct
        })
        if (billItem.billProducts.length === 0) {
          removeBillItem(billItem, billId, 0)
        }
        else {
          billItem.quantity = billItem.billProducts.length
          const newBill: Bill = {
            ...currentBill,
            isCommanded: false,
            items: currentBill.items.map(item => item.saleItemId === saleItemId ? billItem : item)
          }
          const currentBills = bills.filter(bill => bill.id > 0 ? bill.id !== billId : bill.tableNumber !== tableNumber)
          setBills([...currentBills, newBill])
        }
      }
    }
  }

  // Refactorizacion de funciones
  const setCurrentBill = (currentBill: Bill) => {
    setBill(currentBill)
  }

  const addBillItem = (billItem: BillItem, tableNumber: number) => {
    console.log(bills)
    const currentBill = getBillByTableNumber(tableNumber)
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
    getBillById: getBillById,
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
    getBillByTableNumber
  }
}

export default useBill