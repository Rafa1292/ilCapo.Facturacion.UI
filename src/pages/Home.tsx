import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import Content from '../components/generics/Content'
import FoodTable from '../components/generics/FoodTable'
import Bar from '../components/generics/Bar'
import AppContext from '../context/AppContext'
import { useGet, useGetList } from '../hooks/useAPI'
import { SaleItemCategory } from '../types/saleItemCategory'
import { ProductModifier } from '../types/productModifier'


const Home = () => {
  const [isLoading] = useState(false)
  const { setWorkDayUser, setRoomEdit } = useContext(AppContext)
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
    setWorkDayUser()
  }, [])

  return (
    <Content isLoading={isLoading}>
      <>
        <FoodTable saleItemCategories={saleItemCategories} tableNumber={1} top={45} left={50} />
        <FoodTable saleItemCategories={saleItemCategories} tableNumber={2} top={45} left={62} />
        <FoodTable saleItemCategories={saleItemCategories} tableNumber={3} top={45} left={74} />
        <FoodTable saleItemCategories={saleItemCategories} tableNumber={4} top={70} left={50} />
        <FoodTable saleItemCategories={saleItemCategories} tableNumber={5} top={70} left={62} />
        <FoodTable saleItemCategories={saleItemCategories} tableNumber={6} top={70} left={74} />
        <Bar saleItemCategories={saleItemCategories} tableNumber={7} top={15} left={68} />
        <Bar saleItemCategories={saleItemCategories} tableNumber={8} top={15} left={74} />
        <Bar saleItemCategories={saleItemCategories} tableNumber={9} top={15} left={80} />
        <Bar saleItemCategories={saleItemCategories} tableNumber={10} top={15} left={86} />
      </>
    </Content>
  )
}

export default Home