import React, { useContext, useEffect, useState } from 'react'
import { useGet } from '../hooks/useAPI'
import { Bill } from '../types/bill'
import AppContext from '../context/AppContext'
import Table from './generics/Table'
import TableRow from './generics/TableRow'
import { BillItem } from '../types/billItem'
import BillReview from './BillReview'
import Swal from 'sweetalert2'

interface Props {
  bills: Bill[]
  getBillsByWorkDay: () => void
}

const BillsByWorkDay = ({ bills, getBillsByWorkDay }: Props) => {
  const { billFunctions, user } = useContext(AppContext)
  const [showState, setShowState] = useState<number>(1)
  const [tmpBills, setTmpBills] = useState<Bill[]>([])
  const darkBg = '#212529'
  const darkBgStripped = '#2c3034'

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
    const response = await useGet(`bills/cancel/${billId}`, true)
    if (!response.error) {
      Swal.fire({
        icon: 'success',
        title: 'Factura anulada',
        showConfirmButton: false,
        timer: 1500
      })
      getBillsByWorkDay()
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
    if (showState === 1){
      setTmpBills(billFunctions.bills.filter(bill => !bill.close))
    }
    if (showState === 2){
      setTmpBills(bills.filter(bill => bill.close))
    }
  }, [bills])

  return (
    <div className='col-10 d-flex flex-wrap align-content-start' style={{ height: '100%', marginTop: '200px' }}>
      <div className="col-12 d-flex flex-wrap justify-content-center" style={{ height: 'fit-content' }}>
        <ul className="nav nav-tabs">
          <li className="nav-item pointer">
            <span className={`nav-link ${showState === 1 ? 'active' : ''}`} onClick={() => handleShowBills(false, false)}>Pendientes</span>
          </li>
          <li className="nav-item pointer">
            <span className={`nav-link ${showState === 2 ? 'active' : ''}`} onClick={() => handleShowBills(true, false)}>Cerradas</span>
          </li>
          <li className="nav-item pointer">
            <span className={`nav-link ${showState === 3 ? 'active' : ''}`} onClick={() => handleShowBills(true, true)}>Todas</span>
          </li>
        </ul>
      </div>
      <Table headers={[
        { label: '#', col: 1 },
        { label: 'Nombre', col: 3 },
        { label: 'Monto', col: 3 },
        { label: '', col: 5 },
      ]}>
        {
          tmpBills.sort((a, b) => b.id - a.id).map((bill: Bill, index) => (
            <TableRow
              bgColor={index % 2 === 0 ? darkBgStripped : darkBg}
              crossOut={bill.isNull}
              classElement={bill.isNull ? 'cross-out text-danger' : ''}
              key={index}
              tableData={[
                { content: bill.id.toString(), col: 1 },
                { content: bill.client?.name, col: 3 },
                { content: getBillTotal(bill).toString(), col: 3 }
              ]}>
              <BillReview bill={bill} />
              <button onClick={()=> billFunctions.printBill(bill.id, bill.tableNumber)} disabled={bill.isNull} className="btn btn-outline-secondary mx-2">Reimprimir</button>
              {
                showState === 2 && !user.workDayUser.close &&
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