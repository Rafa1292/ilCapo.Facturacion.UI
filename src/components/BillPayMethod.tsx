import React, { useState } from 'react'
import { AccountHistory } from '../types/accountHistory'
import { Bill } from '../types/bill'
import { BillItem } from '../types/billItem'
import Swal from 'sweetalert2'
import BillPayMethodForm from './BillPayMethodForm'
import BillPayMethodSplit from './BillPayMethodSplit'


interface Props {
  bill: Bill
  addAccountHistory: (accountHistory: AccountHistory) => void
  removeAccountHistory: (accountHistory: AccountHistory) => void
  fastPayAction: (accountHistory: AccountHistory) => void
  closeBill: () => void
}


const BillPayMethod = ({ bill, addAccountHistory, closeBill, fastPayAction, removeAccountHistory }: Props) => {
  const [option, setOption] = useState<number>(1)
  const [payWith, setPayWith] = useState<number>(0)

  const getAccountHistoriesTotal = (): number => {
    let accountHistoriesTotal = 0
    for (const billAccountHistory of bill.billAccountHistories) {
      accountHistoriesTotal += Number(billAccountHistory.accountHistory.amount)
    }
    return accountHistoriesTotal
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

  const getBillTotal = () => {
    let billTotal = 0
    for (const billItem of bill.items) {
      billTotal += Number(billItem.unitPrice) * Number(billItem.quantity) + getBillItemModifiersPrice(billItem) + Number(billItem.tax) - Number(billItem.discount)
    }
    return billTotal
  }

  const setAccountHistory = (accountHistory: AccountHistory): boolean => {
    if (getAccountHistoriesTotal() + Number(accountHistory.amount) > getBillTotal()) {
      Swal.fire('Error', 'El monto asigando no debe ser mayor al total de la factura', 'error')
    }
    else {
      addAccountHistory(accountHistory)
      return true
    }
    return false
  }

  const payMethodAction = () => {
    closeBill()
  }


  return (
    <>
      <div className="col-12 d-flex flex-wrap justify-content-center p-2 bg-dark" style={{ height: 'fit-content' }}>
        <div onClick={() => setOption(1)} className={`px-3 mx-2 py-1 rounded pointer item-category ${option === 1 ? 'item-category_selected' : ''}`} >
          <h6 className='m-0'>Factura completa</h6>
        </div>
        <div onClick={() => setOption(2)} className={`px-3 mx-2 py-1 rounded pointer item-category ${option === 2 ? 'item-category_selected' : ''}`} >
          <h6 className='m-0'>Dividir factura</h6>
        </div>
        <div onClick={() => setOption(3)} className={`px-3 mx-2 py-1 rounded pointer item-category ${option === 3 ? 'item-category_selected' : ''}`} >
          <h6 className='m-0'>Separar factura</h6>
        </div>
      </div>
      {
        option === 1 &&
        <div className="col-4 justify-content-center p-2 d-flex flex-wrap">
          <BillPayMethodForm fastPayAction={fastPayAction} removeAccountHistory={removeAccountHistory} action={payMethodAction} actionLabel='Pagar factura' billAccountHistories={bill.billAccountHistories} setAccountHistory={setAccountHistory} getBillTotal={getBillTotal}
          />
        </div>
      }
      {
        option === 2 &&
        <BillPayMethodSplit closeBill={closeBill} getBillTotal={getBillTotal}
        />
      }
    </>
  )
}

export default BillPayMethod