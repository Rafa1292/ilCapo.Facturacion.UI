import React, { useContext, useEffect, useState } from 'react'
import Content from '../../components/generics/Content'
import FoodTableContainer from './FoodTableContainer'
import { tableProps } from '../../types/tableProps'
import AppContext from '../../context/AppContext'
import { SaleItemCategory } from '../../types/saleItemCategory'
import { Menu } from '../../types/menu'

interface Props {
  menus: Menu[]
  tables: tableProps[]
  saleItemCategories: SaleItemCategory[]
  setPrices: (menuId: number) => void
}

const RoomContainer = ({
  tables,
  menus,
  saleItemCategories,
  setPrices,
}: Props) => {
  const [isLoading, setIsLoading] = useState(true)
  const { setMenuDeliveryTime, billFunctions } = useContext(AppContext)

  useEffect(() => {
    const initialize = async () => {
      await billFunctions.getOpenBills()
      setIsLoading(false)
    }
    initialize()
  }, [tables])

  return (
    <>
      <Content isLoading={isLoading}>
        <>
          {tables.map((table) => {
            if (table.type === 'table_container') {
              return (
                <FoodTableContainer
                  menus={menus}
                  setPrices={setPrices}
                  menuDeliveryTime={table.menuDeliveryTime}
                  setMenuDeliveryTime={setMenuDeliveryTime}
                  key={table.number}
                  saleItemCategories={saleItemCategories}
                  tableNumber={table.number}
                  top={table.y}
                  left={table.x}
                />
              )
            }
            // else if (table.type === 'bar_container') {
            //   return <Bar removeBill={removeBill} updateBill={updateBill} bill={getBillFromTableNumber(table.number)} key={table.number} saleItemCategories={saleItemCategories} tableNumber={table.number} top={table.y} left={table.x} />
            // }
          })}
        </>
      </Content>
    </>
  )
}

export default RoomContainer
