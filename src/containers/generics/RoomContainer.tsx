import React, { useContext, useEffect, useState } from 'react'
import Content from '../../components/generics/Content'
import FoodTableContainer from './FoodTableContainer'
import Bar from '../../components/generics/Bar'
import { tableProps } from '../../types/tableProps'
import { Bill } from '../../types/bill'
import AppContext from '../../context/AppContext'
import { SaleItemCategory } from '../../types/saleItemCategory'



interface Props {
  tables: tableProps[]
  bills: Bill[]
  saleItemCategories: SaleItemCategory[]
  removeBill: (id: number) => void
}

const RoomContainer = ({ tables, bills, saleItemCategories, removeBill }: Props) => {
  const [isLoading, setIsLoading] = useState(true)
  const { setMenuDeliveryTime } = useContext(AppContext)

  useEffect(() => {
    setIsLoading(false)
  }, [tables])

  return (
    <>
      <Content isLoading={isLoading}>
        <>
          {
            tables.map(table => {
              if (table.type === 'table_container') {
                return <FoodTableContainer
                  removeBill={removeBill}
                  bills={bills}
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