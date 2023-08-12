import { useState } from 'react'
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
import axios from 'axios'
import Swal from 'sweetalert2'

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
  mail: '',
  cedula: '',
  addressess: [],
  creditState: 3,
  creditLimit: 0,
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
  isCredit: false,
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
  const [bills, setBills] = useState<Bill[]>([])
  const [apartBill, setApartBill] = useState<Bill>(initialBill)

  const addDescriptionToBillProduct = async (saleItemId: number, itemNumber: number, saleItemProductId: number, description: string, billId: number, tableNumber: number): Promise<void> => {
    console.log('add description')
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
      printBill(billId, 0)
      updateBillFromDB(billId)
      return true
    }
    return false
  }

  const getBill = (billId: number, tableNumber: number) => {
    if (billId === 0 && tableNumber === 0) {
      const currentBill = bills.find(bill => bill.tableNumber === 0 && bill.id === 0)
      if (currentBill)
        return currentBill
      return { ...initialBill }
    }
    if (billId === 0) {
      return getBillByTableNumber(tableNumber)
    } else {
      return getBillById(billId)
    }
  }

  const removeIncompleteBill = () => {
    console.log('remove incomplete bill')
    let billsForCarry = bills.filter(bill => bill.tableNumber === 0)
    billsForCarry = billsForCarry.filter(bill => bill.id !== 0)
    const tableBills = bills.filter(bill => bill.tableNumber !== 0)
    setBills([...tableBills, ...billsForCarry])
  }

  const getOpenBills = async () => {
    const response = await useGetList<Bill[]>('bills/openBills', true)
    if (!response.error) {
      const tmpBills: Bill[] = []
      for (const bill of response.data) {
        const tmpBill = await completeBill(bill)
        tmpBills.push(tmpBill)
      }
      console.log('open bills', tmpBills)
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

  const getClient = async (phone: string, billId: number, tableNumber: number, forApartBill?: boolean) => {
    forApartBill = forApartBill ? forApartBill : false
    const currentBill = getBill(billId, tableNumber)

    if (phone.length === 0) {
      if (forApartBill) {
        setApartBill({ ...apartBill, clientId: 0, client: { ...initialClient, phone } })
      } else {
        currentBill.clientId = 0
        currentBill.client = { ...initialClient, phone }
        currentBill.addressId = 0
        addBill(currentBill)
      }
    } else {
      const response = await useGet<Client>(`clients/phone/${phone}`, true)
      if (!response.error && response.data !== null) {
        const client = response.data
        if (forApartBill) {
          setApartBill({ ...apartBill, clientId: client.id, client: client })
        }
        else {
          currentBill.clientId = client.id
          currentBill.client = client
          addBill(currentBill)
        }
      } else {
        if (forApartBill) {
          setApartBill({ ...apartBill, clientId: 0, client: { ...initialClient, phone } })
        } else {
          currentBill.clientId = 0
          currentBill.client = { ...initialClient, phone }
          currentBill.addressId = 0
          addBill(currentBill)
        }
      }
    }
  }

  const addBill = (currentBill: Bill) => {
    const memoryBills = bills.filter(bill => bill.id === 0 && bill.tableNumber > 0 && bill.tableNumber !== currentBill.tableNumber && !bill.close)
    const tableBills = bills.filter(bill => bill.tableNumber > 0 && bill.id > 0 && bill.tableNumber !== currentBill.tableNumber && !bill.close)    
    const toGoBills = bills.filter(bill => bill.tableNumber === 0 && bill.id !== currentBill.id && !bill.close && bill.id > 0)
    const tmpBills = [...tableBills, ...memoryBills, ...toGoBills]
    if(!currentBill.close)
      tmpBills.push(currentBill)
    console.log('addBill', tmpBills)
    setBills(tmpBills)
  }

  const resetBillItems = (billId: number, tableNumber: number) => {

    if(billId === 0){
      const currentBill = getBill(billId, tableNumber)
      currentBill.items = []
      addBill(currentBill)
    }
  }

  const removeBillItem = (billItem: BillItem, billId: number, tableNumber: number) => {
    const currentBill = getBill(billId, tableNumber)
    const tmpBillItems = currentBill.items.filter(item => item.saleItemId !== billItem.saleItemId)
    const newBill = {
      ...currentBill,
      items: tmpBillItems
    }
    addBill(newBill)
  }

  const updateBillFromDB = async (id: number) => {
    const currentBill = await getBillFromDB(id)
    addBill(currentBill)
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
          removeBillItem(billItem, billId, tableNumber)
        }
        else {
          let discount = 0
          if (billItem.discount > 0) {
            discount = billItem.discount / billItem.quantity
          }
          billItem.quantity = billItem.quantity - 1
          const newBill: Bill = {
            ...currentBill,
            isCommanded: false,
            items: currentBill.items.map(item => item.saleItemId === saleItemId ? { ...billItem, discount } : item)
          }
          addBill(newBill)
        }
      }
    }
  }

  const changeTableNumber = async (tableNumber: number, newTableNumber: number) => {
    console.log('change table number')
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

  const setBillAddress = async (addressId: number, billId: number, tableNumber: number, forApartBill?: boolean) => {
    forApartBill = forApartBill ? forApartBill : false
    if (forApartBill) {
      setApartBill({ ...apartBill, addressId })
    }
    else {
      const currentBill = getBill(billId, tableNumber)
      currentBill.addressId = addressId
      currentBill.isCommanded = false
      addBill(currentBill)
    }
  }

  const setDeliveryMethod = (deliveryMethod: number, billId: number, tableNumber: number) => {
    const currentBill = getBill(billId, tableNumber)
    currentBill.deliveryMethod = deliveryMethod
    currentBill.tableNumber = deliveryMethod !== 0 ? 0 : tableNumber
    addBill(currentBill)
  }

  const printBill = async (billId: number, tableNumber: number) => {
    try {
      const currentBill = getBill(billId, tableNumber)
      const response = await axios.post('http://localhost:5000/billing', currentBill)
      if (response.data === false) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo imprimir la factura'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo imprimir la factura'
      })
    }
  }

  const printCommand = async (commandBill: Bill) => {
    try {
      const response = await axios.post('http://localhost:5000/command', commandBill)
      console.log(commandBill)
      if (response.data === false) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo imprimir la factura'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo imprimir la factura'
      })
    }
  }

  const removeCombinedLinkedProduct = (saleItemProductId: number, productId: number, saleItemId: number, billId: number, tableNumber: number) => {
    const currentBill = getBill(billId, tableNumber)
    const billItem = currentBill.items.find(item => item.saleItemId === saleItemId)
    if (!billItem) return
    for (const billProduct of billItem.billProducts) {
      if (billProduct.saleItemProductId === saleItemProductId) {
        billProduct.products = billProduct.products.filter((x) => x.productId !== productId)
        billProduct.products = billProduct.products.map(x => { return { ...x, isCommanded: false } as LinkedProduct })
      }
    }
    currentBill.items = currentBill.items.map(item => item.saleItemId === saleItemId ? billItem : item)
    addBill(currentBill)
  }

  const addBillItem = (billItem: BillItem, billId: number, tableNumber: number) => {
    const currentBill = getBill(billId, tableNumber)
    let newBill = { ...currentBill }
    if (currentBill.items.map(item => item.saleItemId).includes(billItem.saleItemId)) {
      const tmpBillItems = currentBill.items.filter(item => item.saleItemId !== billItem.saleItemId)
      const tmpBillItem = currentBill.items.find(item => item.saleItemId === billItem.saleItemId)
      if (tmpBillItem) {
        tmpBillItem.quantity = tmpBillItem.quantity + 1
        billItem.billProducts = billItem.billProducts.map(x => { return { ...x, itemNumber: tmpBillItem.quantity } as BillItemLinkedProduct })
        tmpBillItem.billProducts = [...tmpBillItem.billProducts, ...billItem.billProducts]
        const discount = billItem.discount + tmpBillItem.discount
        newBill = {
          ...currentBill,
          items: [...tmpBillItems, { ...tmpBillItem, discount }]
        }
      }
    }
    else {
      newBill = {
        ...currentBill,
        items: [...currentBill.items, billItem]
      }
    }
    addBill(newBill)
  }

  const setDiscount = (discount: number, billId: number, tableNumber: number) => {
    const currentBill = getBill(billId, tableNumber)
    const itemdiscount = discount / currentBill.items.length
    const tmpBillItems = currentBill.items
    for (const billItem of tmpBillItems) {
      billItem.discount = itemdiscount
    }
    const newBill = { ...currentBill, items: tmpBillItems, isCommanded: false }
    addBill(newBill)
  }

  const setBillItemDiscount = (discount: number, billItemId: number, billId: number, tableNumber: number) => {
    const currentBill = getBill(billId, tableNumber)
    const tmpBillItems = currentBill.items
    for (const billItem of tmpBillItems) {
      if (billItem.id === billItemId) {
        billItem.discount = discount
      }
    }
    const newBill = { ...currentBill, items: tmpBillItems, isCommanded: false }
    addBill(newBill)
  }

  const addApartBillItem = (billItem: BillItem) => {
    let newBill = { ...apartBill }
    if (apartBill.items.map(item => item.saleItemId).includes(billItem.saleItemId)) {
      const tmpBillItems = apartBill.items.filter(item => item.saleItemId !== billItem.saleItemId)
      const tmpBillItem = apartBill.items.find(item => item.saleItemId === billItem.saleItemId)
      if (tmpBillItem) {
        tmpBillItem.quantity = tmpBillItem.quantity + 1
        billItem.billProducts = billItem.billProducts.map(x => { return { ...x, itemNumber: tmpBillItem.quantity } as BillItemLinkedProduct })
        tmpBillItem.billProducts = [...tmpBillItem.billProducts, ...billItem.billProducts]
        newBill = {
          ...apartBill,
          items: [...tmpBillItems, tmpBillItem]
        }
      }
    }
    else {
      newBill = {
        ...apartBill,
        items: [...apartBill.items, billItem]
      }
    }
    setApartBill(newBill)
  }

  const moveBillItem = (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => {
    const bill = getBill(billId, tableNumber)
    if (bill.items.length > 1 || bill.items[0].quantity > 1) {
      for (const billItem of bill.items) {
        if (billItem.saleItemId === saleItemId) {
          const tmpBillProducts: BillItemLinkedProduct[] = []
          for (const billProduct of billItem.billProducts) {
            if (billProduct.itemNumber === itemNumber) {
              tmpBillProducts.push({ ...billProduct, itemNumber: 1 })
            }
          }
          const tmpBillItemId = billItem.quantity === 1 ? billItem.id : 0
          let discount = 0
          if (billItem.discount > 0) {
            discount = billItem.discount / billItem.quantity

          }
          addApartBillItem({ ...billItem, billProducts: tmpBillProducts, quantity: 1, id: tmpBillItemId, discount } as BillItem)
          removeLinkedProduct(saleItemId, itemNumber, bill.id, bill.tableNumber)
        }
      }
    }
  }

  const removeApartBillItem = (billItem: BillItem) => {
    const tmpBillItems = apartBill.items.filter(item => item.saleItemId !== billItem.saleItemId)
    const newBill = {
      ...apartBill,
      items: tmpBillItems
    }
    setApartBill(newBill)
  }

  const removeApartLinkedProduct = (saleItemId: number, itemNumber: number) => {
    for (const billItem of apartBill.items) {
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
          removeApartBillItem(billItem)
        }
        else {
          billItem.quantity = billItem.quantity - 1
          const newBill: Bill = {
            ...apartBill,
            isCommanded: false,
            items: apartBill.items.map(item => item.saleItemId === saleItemId ? billItem : item)
          }
          setApartBill(newBill)
        }
      }
    }
  }

  const moveBillItemBack = (saleItemId: number, itemNumber: number, billId: number, tableNumber: number) => {
    for (const billItem of apartBill.items) {
      if (billItem.saleItemId === saleItemId) {
        const tmpBillProducts: BillItemLinkedProduct[] = []
        for (const billProduct of billItem.billProducts) {
          if (billProduct.itemNumber === itemNumber) {
            tmpBillProducts.push({ ...billProduct, itemNumber: 1 })
          }
        }
        addBillItem({ ...billItem, billProducts: tmpBillProducts, quantity: 1 } as BillItem, billId, tableNumber)
        removeApartLinkedProduct(saleItemId, itemNumber)
      }
    }
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
      printBill(billId, 0)
      updateBillFromDB(billId)
      return true
    }
    return false
  }

  const closeApartBill = async (workDayUserIdClose: number, billId: number, billHistories: BillAccountHistory[]): Promise<boolean> => {
    const originalBill = getBillById(billId)
    const response = await usePatch('bills/closeApart', { bill: { ...apartBill, billAccountHistories: billHistories, workDayUserIdClose } as Bill, originalBill: originalBill }, true)
    if (!response.error) {
      printBill(billId, 0)
      setApartBill(initialBill)
      return true
    }
    return false
  }

  return {
    bills,
    apartBill,
    setBillItemDiscount,
    getBill,
    addBillItem,
    removeBillItem,
    moveBillItemBack,
    addAccountHistory,
    removeAccountHistory,
    resetBillItems,
    moveBillItem,
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
    printCommand,
    updateBillFromDB,
    setBillAddress,
    setDiscount,
    setDeliveryMethod,
    removeIncompleteBill,
    serve,
    addDescriptionToBillProduct,
    changeTableNumber,
    getOpenBills,
    getBillByTableNumber
  }
}

export default useBill