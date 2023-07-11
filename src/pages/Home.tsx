import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import Content from '../components/generics/Content'
import AppContext from '../context/AppContext'
import RoomContainer from '../containers/generics/RoomContainer'
import { Bill } from '../types/bill'
import { useGet, useGetList } from '../hooks/useAPI'
import { ProductModifier } from '../types/productModifier'
import { Client } from '../types/client'
import { SaleItemCategory } from '../types/saleItemCategory'
import SideMenu from '../components/generics/SideMenu'

const Home = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { setWorkDayUser, setRoomEdit, system, setMenuDeliveryTime } = useContext(AppContext)
  const [saleItemCategories, setSaleItemCategories] = useState<SaleItemCategory[]>([])
  const { billFunctions } = useContext(AppContext)

  const removeBill = (id: number) => {
    const billToRemove = billFunctions.bills.find(bill => bill.id === id)
    const billsTmp = billFunctions.bills.filter(bill => bill.id !== id)
    if (billToRemove !== undefined)
      setMenuDeliveryTime(billToRemove.tableNumber, null)
    // setBills(billsTmp)
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
    getSaleItemCategories()
  }, [system.loader])

  return (
    <Content isLoading={system.loader && isLoading ? true : false}>
      <>
        <SideMenu
          removeBill={removeBill}
          saleItemCategories={saleItemCategories}
          bills={billFunctions.bills.filter(x => x.tableNumber === 0 && !x.close)} />
        {
          <RoomContainer
            saleItemCategories={saleItemCategories}
            removeBill={removeBill}
            tables={system.bussinessConfig.tables} />
        }
      </>
    </Content>
  )
}

export default Home