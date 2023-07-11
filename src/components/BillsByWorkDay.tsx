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
  const { user, billFunctions } = useContext(AppContext)
  const [showState, setShowState] = useState<number>(1)
  const [tmpBills, setTmpBills] = useState<Bill[]>([])

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

  const handleShowBills = (showClose: boolean, showAll: boolean) => {
    if (showAll) {
      setShowState(3)
      const allBills = [...bills]
      allBills.push(...billFunctions.bills.filter(bill => !bill.close && !bills.find(b => b.id === bill.id)))
      setTmpBills(allBills)
    } else {
      if (showClose) {
        setShowState(2)
        setTmpBills(bills.filter(bill => bill.close))
      } else {
        setShowState(1)
        setTmpBills(billFunctions.bills.filter(bill => !bill.close))
      }
    }
  }


  useEffect(() => {
    const getBillsByWorkDay = async () => {
      const response = await useGetList<Bill[]>(`bills/billsByWorkDayUserClose/${user.workDayUser.id}`, true)
      if (!response.error) {
        setBills(response.data)
        setTmpBills(billFunctions.bills.filter(bill => !bill.close))
      }
    }
    getBillsByWorkDay()
  }, [])

  return (
    <div className='col-10 d-flex flex-wrap'>
      <div className="col-12 d-flex flex-wrap justify-content-center">
        <ul className="nav nav-tabs">
          <li className="nav-item pointer">
            <span className={`nav-link ${showState === 1 ? 'active' : ''}`} onClick={() => handleShowBills(false, false)}>Pendientes</span>
          </li>
          <li className="nav-item pointer">
            <span className={`nav-link ${showState === 2  ? 'active' : ''}`} onClick={() => handleShowBills(true, false)}>Cerradas</span>
          </li>
          <li className="nav-item pointer">
            <span className={`nav-link ${showState === 3 ? 'active' : ''}`} onClick={() => handleShowBills(true, true)}>Todas</span>
          </li>
        </ul>
      </div>
      <Table headers={['#', 'Nombre', 'Total', '']}>
        {
          tmpBills.sort((a, b) => b.id - a.id).map((bill: Bill, index) => (
            <TableRow crossOut={bill.isNull} classElement={bill.isNull ? 'cross-out text-danger' : ''} key={index} tableData={[bill.id.toString(), bill.client?.name, getBillTotal(bill).toString()]}>
              <BillReview bill={bill} />
              <button disabled={bill.isNull} className="btn btn-outline-secondary mx-2">Reimprimir</button>
              {
                showState === 2 &&
                <button disabled={bill.isNull} className="btn btn-outline-danger mx-2" onClick={() => cancelBill(bill.id)}>Anular</button>
              }
            </TableRow>
          ))
        }
      </Table>
    </div>
  )
}

export default BillsByWorkDay