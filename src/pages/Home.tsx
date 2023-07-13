import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import Content from '../components/generics/Content'
import AppContext from '../context/AppContext'
import RoomContainer from '../containers/generics/RoomContainer'
import { useGet, useGetList } from '../hooks/useAPI'
import { ProductModifier } from '../types/productModifier'
import { SaleItemCategory } from '../types/saleItemCategory'
import SideMenu from '../components/generics/SideMenu'

const Home = () => {
  const { setRoomEdit, system } = useContext(AppContext)
  const [saleItemCategories, setSaleItemCategories] = useState<SaleItemCategory[]>([])


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
    <Content isLoading={system.loader}>
      <>
        <SideMenu
          saleItemCategories={saleItemCategories}/>
        {
          <RoomContainer
            saleItemCategories={saleItemCategories}
            tables={system.bussinessConfig.tables} />
        }
      </>
    </Content>
  )
}

export default Home