import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import Content from '../components/generics/Content'
import FoodTable from '../components/generics/FoodTable'
import Bar from '../components/generics/Bar'
import AppContext from '../context/AppContext'
import { useGet, useGetList } from '../hooks/useAPI'
import { SaleItemCategory } from '../types/saleItemCategory'
import { ProductModifier } from '../types/productModifier'
import FoodTableContainer from '../containers/generics/FoodTableContainer'
import { Bill } from '../types/bill'
import { get } from 'http'
import { LinkedProduct } from '../types/linkedProduct'
import { LinkedProductModifierElement } from '../types/linkedProductModifierElement'
import { Client } from '../types/client'

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
  isCommanded: false,
  isServed: false,
  updatedAt: new Date(Date.now()),
  billAccountHistories: [],
  delete: false,
  createdAt: new Date(Date.now()),
  createdBy: 0,
  updatedBy: 0
}

const Home = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { setWorkDayUser, setRoomEdit, system, setMenuDeliveryTime } = useContext(AppContext)
  const [saleItemCategories, setSaleItemCategories] = useState<SaleItemCategory[]>([])
  const [bills, setBills] = useState<Bill[]>([])

  const getBill = async (id: number): Promise<Bill> => {
    const response = await useGet<Bill>(`bills/${id}`, true)
    if (!response.error && response.data !== null) {
      const bill = await completeBill(response.data)
      return bill
    }
    return initialBill
  }

  const updateBill = async (id: number) => {
    const bill = await getBill(id)
    const billsTmp = bills.filter(bill => bill.id !== id)
    billsTmp.push(bill)
    setBills(billsTmp)
  }

  const removeBill = (id: number) => {
    const billToRemove = bills.find(bill => bill.id === id)
    const billsTmp = bills.filter(bill => bill.id !== id)
    console.log(billToRemove)
    if (billToRemove !== undefined)
      setMenuDeliveryTime(billToRemove.tableNumber, null)
    setBills(billsTmp)
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

  const getBillFromTableNumber = (tableNumber: number): Bill => {
    const bill = bills.find(bill => bill.tableNumber === tableNumber)
    return bill ? bill : initialBill
  }

  useEffect(() => {
    setRoomEdit(false)
    const getSaleItemCategories = async () => {
      const response = await useGetList<SaleItemCategory[]>('saleItemCategories', false)
      if (!response.error) {
        const tmpSaleItemCategories = response.data
        for (const saleItemCategory of tmpSaleItemCategories) {
          for (const saleItem of saleItemCategory.saleItems) {
            for (const saleItemProduct of saleItem.saleItemProducts) {
              const productModifiersResponse = await useGet<ProductModifier[]>(`productModifiers/byProductId/${saleItemProduct.productId}`, false)
              if (!productModifiersResponse.error) {
                const productModifiers = productModifiersResponse.data
                saleItemProduct.product.productModifiers = productModifiers
              }
            }
          }
        }
        setSaleItemCategories(tmpSaleItemCategories)
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
      setIsLoading(false)
    }
    getOpenBills()
    getSaleItemCategories()
    setWorkDayUser()
  }, [system.bussinessConfig.tables])

  return (
    <Content isLoading={isLoading}>
      <>
        {
          system.bussinessConfig && system.bussinessConfig.tables.map(table => {
            if (table.type === 'table_container') {
              return <FoodTableContainer
                removeBill={removeBill}
                updateBill={updateBill}
                bills={bills}
                menuDeliveryTime={table.menuDeliveryTime}
                setMenuDeliveryTime={setMenuDeliveryTime}
                key={table.number}
                saleItemCategories={saleItemCategories}
                tableNumber={table.number}
                top={table.y}
                left={table.x} />
            } else if (table.type === 'bar_container') {
              return <Bar removeBill={removeBill} updateBill={updateBill} bill={getBillFromTableNumber(table.number)} key={table.number} saleItemCategories={saleItemCategories} tableNumber={table.number} top={table.y} left={table.x} />
            }
          }
          )
        }
      </>
    </Content>
  )
}

export default Home