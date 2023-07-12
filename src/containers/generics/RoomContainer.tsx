import React, { useContext, useEffect, useState } from 'react'
import Content from '../../components/generics/Content'
import FoodTableContainer from './FoodTableContainer'
import { tableProps } from '../../types/tableProps'
import { Bill } from '../../types/bill'
import AppContext from '../../context/AppContext'
import { SaleItemCategory } from '../../types/saleItemCategory'



interface Props {
  tables: tableProps[]
  saleItemCategories: SaleItemCategory[]
}

const RoomContainer = ({ tables, saleItemCategories }: Props) => {
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
          {
            tables.map(table => {
              if (table.type === 'table_container') {
                return <FoodTableContainer
                  menuDeliveryTime={table.menuDeliveryTime}
                  setMenuDeliveryTime={setMenuDeliveryTime}
                  key={table.number}
                  saleItemCategories={saleItemCategories}
                  tableNumber={table.number}
                  top={table.y}
                  left={table.x} />
              }
              // else if (table.type === 'bar_container') {
              //   return <Bar removeBill={removeBill} updateBill={updateBill} bill={getBillFromTableNumber(table.number)} key={table.number} saleItemCategories={saleItemCategories} tableNumber={table.number} top={table.y} left={table.x} />
              // }
            }
            )
          }
        </>
      </Content>
    </>
  )
}

export default RoomContainer