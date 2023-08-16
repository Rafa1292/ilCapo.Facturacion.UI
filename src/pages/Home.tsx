import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import Content from '../components/generics/Content'
import AppContext from '../context/AppContext'
import RoomContainer from '../containers/generics/RoomContainer'
import { useGet, useGetList } from '../hooks/useAPI'
import { ProductModifier } from '../types/productModifier'
import { SaleItemCategory } from '../types/saleItemCategory'
import SideMenu from '../components/generics/SideMenu'
import { Menu } from '../types/menu'

const Home = () => {
  const { setRoomEdit, system, billFunctions } = useContext(AppContext)
  const [saleItemCategories, setSaleItemCategories] = useState<
    SaleItemCategory[]
  >([])
  const [tmpSaleItemCategories, setTmpSaleItemCategories] = useState<
    SaleItemCategory[]
  >([])
  const [menus, setMenus] = useState<Menu[]>([])

  const setPrices = (menuId: number) => {
    //init saleitemcategory empty array
    const tmpSaleItemCategories: SaleItemCategory[] = []
    for (const saleItemCategory of saleItemCategories) {
      const tmpSaleItemCategory: SaleItemCategory = {
        ...saleItemCategory,
        saleItems: [],
      }
      for (const saleItem of saleItemCategory.saleItems) {
        for (const price of saleItem.prices) {
          if (price.menuId === menuId) {
            saleItem.price = price.price
            for (const itemProduct of saleItem.saleItemProducts) {
              for (const modifier of itemProduct.product.productModifiers) {
                if (modifier.modifierGroup?.elements !== undefined) {
                  for (const element of modifier.modifierGroup.elements) {
                    for (const price of element.prices) {
                      if (price.menuId === menuId) {
                        element.price = price.price
                        break
                      }
                    }
                    if (
                      element.modifierUpgrade !== undefined &&
                      element.modifierUpgrade !== null
                    ) {
                      for (const price of element.modifierUpgrade.prices) {
                        if (price.menuId === menuId) {
                          element.modifierUpgrade.price = price.price
                          break
                        }
                      }
                    }
                  }
                }
              }
            }
            tmpSaleItemCategory.saleItems.push(saleItem)
            break
          }
        }
      }
      tmpSaleItemCategories.push(tmpSaleItemCategory)
    }
    setTmpSaleItemCategories(tmpSaleItemCategories)
  }

  useEffect(() => {
    setRoomEdit(false)
    const getSaleItemCategories = async () => {
      const response = await useGetList<SaleItemCategory[]>(
        'saleItemCategories',
        false
      )
      if (!response.error) {
        const tmpSaleItemCategories = response.data
        for (const saleItemCategory of tmpSaleItemCategories) {
          for (const saleItem of saleItemCategory.saleItems) {
            for (const saleItemProduct of saleItem.saleItemProducts) {
              const productModifiersResponse = await useGet<ProductModifier[]>(
                `productModifiers/byProductId/${saleItemProduct.productId}`,
                false
              )
              if (!productModifiersResponse.error) {
                const productModifiers = productModifiersResponse.data
                saleItemProduct.product.productModifiers = productModifiers
              }
            }
          }
        }
        console.log(tmpSaleItemCategories, 'tmpSaleItemCategories')
        setSaleItemCategories(tmpSaleItemCategories)
      }
    }
    const getMenus = async () => {
      const response = await useGetList<Menu[]>('menus', false)
      if (!response.error) {
        setMenus(response.data)
      }
    }
    getMenus()
    getSaleItemCategories()
  }, [system.loader])

  return (
    <Content isLoading={system.loader}>
      <>
        <SideMenu
          bills={billFunctions.bills}
          menus={menus}
          setPrices={setPrices}
          saleItemCategories={tmpSaleItemCategories}
        />
        {
          <RoomContainer
            menus={menus}
            setPrices={setPrices}
            saleItemCategories={tmpSaleItemCategories}
            tables={system.bussinessConfig.tables}
          />
        }
      </>
    </Content>
  )
}

export default Home
