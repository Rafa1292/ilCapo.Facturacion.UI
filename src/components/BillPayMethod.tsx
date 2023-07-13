import React, { useContext, useState } from 'react'
import { AccountHistory } from '../types/accountHistory'
import { Bill } from '../types/bill'
import { BillItem } from '../types/billItem'
import Swal from 'sweetalert2'
import BillPayMethodForm from './BillPayMethodForm'
import BillPayMethodSplit from './BillPayMethodSplit'
import BillPayMethodPullApart from './BillPayMethodPullApart'
import { BillAccountHistory } from '../types/billAccountHistory'
import AppContext from '../context/AppContext'


interface Props {
  bill: Bill
  close: () => void
  pullApartBill: boolean
  setPullApartBill: (pullApartBill: boolean) => void
}


const BillPayMethod = ({ bill, close, setPullApartBill, }: Props) => {
  const [option, setOption] = useState<number>(1)
  const { billFunctions, user } = useContext(AppContext)

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
    if(accountHistory.payMethodId === 0 ){
      Swal.fire('Error', 'Debe seleccionar un metodo de pago', 'error')
      return false
    }
    if (getAccountHistoriesTotal() + Number(accountHistory.amount) > getBillTotal()) {
      Swal.fire('Error', 'El monto asigando no debe ser mayor al total de la factura', 'error')
    }
    else {
      billFunctions.addAccountHistory(accountHistory, bill.id)
      return true
    }
    return false
  }

  const handleFastPayAction = async (accountHistory: AccountHistory) => {
    const response = await billFunctions.fastPayAction(accountHistory, bill.id, user.workDayUser.id)
    if (response) {
      close()
    }
  }

  const changeOption = (option: number) => {
    setOption(option)
    if (option === 3) {
      setPullApartBill(true)
    } else {
      setPullApartBill(false)
    }
  }

  const handleCloseBill = async () => {
    const response = await billFunctions.closeBill(user.workDayUser.id, bill.id)
    if (response) {
      close()
    }
  }

  const handleCloseBillSplit = async (billHistories: BillAccountHistory[]) => {
    const response = await billFunctions.closeBill(user.workDayUser.id, bill.id, billHistories)
    if (response) {
      close()
    }
  }


  const handleCloseApartBill = async (billHistories: BillAccountHistory[]) => {
    const response = await billFunctions.closeApartBill(user.workDayUser.id, bill.id, billHistories)
    if (response) {
      billFunctions.updateBillFromDB(bill.id)
    }
  }

  const handleRemoveAccountHistory = (accountHistory: AccountHistory) => {
    billFunctions.removeAccountHistory(accountHistory, bill.id)
  }

  return (
    <>
      <div className="col-12 d-flex flex-wrap justify-content-center p-2 bg-dark" style={{ height: 'fit-content' }}>
        <div onClick={() => changeOption(1)} className={`px-3 mx-2 py-1 rounded pointer item-category ${option === 1 ? 'item-category_selected' : ''}`} >
          <h6 className='m-0'>Factura completa</h6>
        </div>
        <div onClick={() => changeOption(2)} className={`px-3 mx-2 py-1 rounded pointer item-category ${option === 2 ? 'item-category_selected' : ''}`} >
          <h6 className='m-0'>Dividir factura</h6>
        </div>
        <div onClick={() => changeOption(3)} className={`px-3 mx-2 py-1 rounded pointer item-category ${option === 3 ? 'item-category_selected' : ''}`} >
          <h6 className='m-0'>Separar factura</h6>
        </div>
      </div>
      {
        option === 1 &&
        <div className="col-4 justify-content-center p-2 d-flex flex-wrap">
          <BillPayMethodForm
            fastPayAction={handleFastPayAction}
            removeAccountHistory={handleRemoveAccountHistory}
            action={handleCloseBill}
            actionLabel='Pagar factura'
            billAccountHistories={bill.billAccountHistories}
            setAccountHistory={setAccountHistory}
            getBillTotal={getBillTotal}
          />
        </div>
      }
      {
        option === 2 &&
        <BillPayMethodSplit closeBillSplit={handleCloseBillSplit} billId={bill.id} close={close} getBillTotal={getBillTotal}
        />
      }
      {
        option === 3 &&
        <BillPayMethodPullApart
          billId={bill.id}
          tableNumber={bill.tableNumber}
          close={close}
          closeApartBill={handleCloseApartBill} />
      }
    </>
  )
}

export default BillPayMethod