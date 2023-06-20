import React, { useContext, useEffect, useState } from 'react'
import { useGet, useGetList } from '../hooks/useAPI'
import { Bill } from '../types/bill'
import AppContext from '../context/AppContext'
import Table from './generics/Table'
import TableRow from './generics/TableRow'
import { BillItem } from '../types/billItem'
import BillReview from './BillReview'
import Swal from 'sweetalert2'

const BillsByWorkDay = () => {
  const [bills, setBills] = useState<Bill[]>([])
  const { user } = useContext(AppContext)

  const getBillTotal = (bill: Bill) => {
    let billTotal = 0
    for (const billItem of bill.items) {
      billTotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem) + Number(billItem.tax) - Number(billItem.discount)
    }
    return billTotal
  }

  const getBillItemModifiersPrice = (billItem: BillItem): number => {
    try {
      let price = 0
      for (const billProduct of billItem.billProducts) {
        for (const product of billProduct.products) {
          price += Number(product.unitPrice)
          for (const modifier of product.modifiers) {
            if (typeof modifier.elements === 'undefined') continue
            for (const element of modifier.elements) {
              price += Number(element.price)
            }
          }
        }
      }
      return price
    } catch (error) {
      return 0
    }

  }

  const cancelBill = async (billId: number) => {
    const response = await useGet<any>(`bills/cancel/${billId}`, true)
    if (!response.error) {
      Swal.fire({
        icon: 'success',
        title: 'Factura anulada',
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  useEffect(() => {
    const getBillsByWorkDay = async () => {
      const response = await useGetList<Bill[]>(`bills/billsByWorkDayUser/${user.workDayUser.id}`, true)
      if (!response.error) {
        setBills(response.data)
      }
    }
    getBillsByWorkDay()
  }, [])

  return (
    <div className='col-10 d-flex flex-wrap'>
      <Table headers={['#', 'Nombre', 'Total', '']}>
        {
          bills.sort((a,b)=> b.id - a.id).map((bill: Bill, index) => (
            <TableRow crossOut={bill.isNull} classElement={bill.isNull ? 'cross-out text-danger': ''} key={index} tableData={[bill.id.toString(), bill.client?.name, getBillTotal(bill).toString()]}>
              <BillReview bill={bill}/>
              <button disabled={bill.isNull} className="btn btn-outline-secondary mx-2">Reimprimir</button>
              <button disabled={bill.isNull} className="btn btn-outline-danger mx-2" onClick={()=> cancelBill(bill.id)}>Anular</button>
            </TableRow>
          ))
        }
      </Table>
    </div>
  )
}

export default BillsByWorkDay