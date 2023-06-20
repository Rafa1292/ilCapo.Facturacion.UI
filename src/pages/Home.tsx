import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import Content from '../components/generics/Content'
import AppContext from '../context/AppContext'
import RoomContainer from '../containers/generics/RoomContainer'
import { Bill } from '../types/bill'
import { useGet, useGetList } from '../hooks/useAPI'
import { ProductModifier } from '../types/productModifier'
import { LinkedProduct } from '../types/linkedProduct'
import { LinkedProductModifierElement } from '../types/linkedProductModifierElement'
import { Client } from '../types/client'
import { SaleItemCategory } from '../types/saleItemCategory'

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
  const [bills, setBills] = useState<Bill[]>([])
  const [saleItemCategories, setSaleItemCategories] = useState<SaleItemCategory[]>([])

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
    if (billToRemove !== undefined)
      setMenuDeliveryTime(billToRemove.tableNumber, null)
    setBills(billsTmp)
  }

  useEffect(() => {
    setRoomEdit(false)
    setWorkDayUser()
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
    getSaleItemCategories()
    getOpenBills()
  }, [])

  return (
    <Content isLoading={isLoading}>
      <>
        {
          <RoomContainer
            saleItemCategories={saleItemCategories}
            bills={bills}
            updateBill={updateBill}
            removeBill={removeBill}
            tables={system.bussinessConfig.tables} />
        }
      </>
    </Content>
  )
}

export default Home