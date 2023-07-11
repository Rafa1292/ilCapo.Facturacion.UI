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
  workDayUserIdOpen: 0,
  workDayUserIdClose: 0,
  commandTime: new Date(Date.now()),
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


const useBill = (): BillFunctions => {
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

  const fastPayAction = async (accountHistory: AccountHistory, billId: number, workDayUserIdClose: number): Promise<boolean> => {
    const currentBill = getBillById(billId)
    const response = await usePatch<Bill>('bills/close',
      {
        ...currentBill,
        workDayUserIdClose,
        billAccountHistories: [{ ...initialBillAccounthistory, accountHistory: accountHistory }]
      }, true)
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

  const getOpenBills = async () => {
    const response = await useGetList<Bill[]>('bills/openBills', true)
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
    const tmpBill = bills.find(bill => bill.id === billId)
    if (tmpBill) {
      return tmpBill
    } else {
      return { ...initialBill, deliveryMethod: 1 }
    }
  }

  const getBillFromDB = async (tmpId: number): Promise<Bill> => {
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
    return initialBill
  }

  const getClient = async (phone: string, tableNumber: number) => {
    const response = await useGet<Client>(`clients/phone/${phone}`, true)
    if (!response.error && response.data !== null) {
      const client = response.data
      const currentBill = getBillByTableNumber(tableNumber)
      currentBill.clientId = client.id
      currentBill.client = client
      addBill(currentBill)
    }
  }

  const addBill = (currentBill: Bill) => {
    const currentBills = currentBill.tableNumber > 0 ?
      bills.filter(bill => bill.tableNumber !== currentBill.tableNumber && !bill.close) :
      bills.filter(bill => bill.id !== currentBill.id)
    const closeBills = bills.filter(bill => bill.close)
    setBills([...currentBills, ...closeBills, currentBill])
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

  const changeTableNumber = async (tableNumber: number, newTableNumber: number) => {
    const currentBill = getBillByTableNumber(tableNumber)
    const newBill = {
      ...currentBill,
      tableNumber: newTableNumber
    }
    const currentBills = bills.filter(bill => bill.tableNumber !== tableNumber && !bill.close)
    const closeBills = bills.filter(bill => bill.close)
    setBills([...currentBills, ...closeBills, newBill])
    await usePatch('bills', newBill, true)
  }

  const closeBill = async (workDayUserIdClose: number, billId: number, billHistories?: BillAccountHistory[]): Promise<boolean> => {
    const currentBill = getBill(billId, 0)
    const response = await usePatch<Bill>('bills/close',
      {
        ...currentBill,
        workDayUserIdClose,
        billAccountHistories: billHistories ?
          billHistories :
          currentBill.billAccountHistories
      }, true)
    if (!response.error) {
      updateBillFromDB(billId)
      return true
    }
    return false
  }

  const addAccountHistory = async (accountHistory: AccountHistory, billId: number) => {
    const currentBill = await getBill(billId, 0)
    currentBill.billAccountHistories = [
      ...currentBill.billAccountHistories,
      {
        ...initialBillAccounthistory,
        accountHistoryId: accountHistory.id,
        accountHistory: accountHistory
      }]
    addBill(currentBill)
  }

  const removeAccountHistory = (accountHistory: AccountHistory, billId: number) => {
    const currentBill = getBill(billId, 0)
    const tmpBillHistories = currentBill.billAccountHistories
    for (const billAccountHistory of currentBill.billAccountHistories) {
      if (billAccountHistory.accountHistory.amount === accountHistory.amount && billAccountHistory.accountHistory.payMethodId === accountHistory.payMethodId) {
        tmpBillHistories.splice(tmpBillHistories.indexOf(billAccountHistory), 1)
      }
    }
    currentBill.billAccountHistories = tmpBillHistories
    addBill(currentBill)
  }

  const serve = async (billId: number) => {
    const currentBill = getBill(billId, 0)
    const response = await useGet<Bill>(`bills/serve/${currentBill.id}`, true)
    if (!response.error) {
      addBill({ ...currentBill, isServed: true })
    }
  }

  const completeBill = async (currentBill: Bill) => {
    for (const billItem of currentBill.items) {
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
    return { ...currentBill, isCommanded: currentBill.id > 0 ? true : false }
  }

  const setBillAddress = async (addressId: number, billId: number, tableNumber: number) => {
    const currentBill = getBill(billId, tableNumber)
    currentBill.addressId = addressId
    currentBill.isCommanded = false
    addBill(currentBill)
  }

  const setDeliveryMethod = (deliveryMethod: number, billId: number, tableNumber: number) => {
    const currentBill = getBill(billId, tableNumber)
    currentBill.deliveryMethod = deliveryMethod
    currentBill.tableNumber = deliveryMethod !== 0 ? 0 : tableNumber
    addBill(currentBill)
  }

  const printBill = () => {
    console.log(bill)
  }
  // Refactorizacion de funciones


  const addBillItem = (billItem: BillItem, tableNumber: number) => {
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
        addBill(newBill)
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

  const closeApartBill = async (originalBill: Bill, billHistories: BillAccountHistory[]): Promise<boolean> => {
    const response = await usePatch<any>('bills/closeApart', { bill: { ...bill, billAccountHistories: billHistories } as Bill, originalBill: originalBill }, true)
    if (!response.error) {
      setBill(initialBill)
      return true
    }
    return false
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
    addDescriptionToBillProduct,
    changeTableNumber,
    getOpenBills,
    getBillByTableNumber
  }
}

export default useBill