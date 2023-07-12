import React from 'react'
import AccountHistoryForm from './AccountHistoryForm'
import { parseCurrency } from '../utils/currencyParser'
import CustomInputNumber from './generics/CustomInputNumber'
import { AccountHistory } from '../types/accountHistory'
import { BillAccountHistory } from '../types/billAccountHistory'
import CustomBtn from './generics/CustomBtn'
import { buttonTypes } from '../enums/buttonTypes'

interface Props {
  setAccountHistory: (accountHistory: AccountHistory) => boolean
  billAccountHistories: BillAccountHistory[]
  getBillTotal: () => number
  actionLabel: string
  removeAccountHistory: (accountHistory: AccountHistory) => void
  action: () => void
  fastPayAction: (accountHistory: AccountHistory) => void
  showAction?: boolean
}


const BillPayMethodForm = ({ setAccountHistory, removeAccountHistory, fastPayAction, showAction= true, action, actionLabel, billAccountHistories, getBillTotal }: Props) => {
  const isEnoughMoney = (): boolean => {
    const billTotal = getBillTotal()
    const historiesTotal = billAccountHistories.reduce((total, billAccountHistory) => {
      return total + billAccountHistory.accountHistory.amount
    }, 0)
    return historiesTotal >= billTotal
  }

  const handleAction = async () => {
    if (isEnoughMoney()) {
      await action()
    }
  }

  return (
    <div className="col-12 justify-content-center d-flex flex-wrap shadow-sm px-2">
      <div className="col-12">
        <AccountHistoryForm fastPayAction={fastPayAction} defaultAmount={getBillTotal()} handleAccountHistory={setAccountHistory} isPay={false} />
        <h4 className='col-12 text-center text-danger mt-4'>Total a pagar:</h4>
        <h5 className='col-12 text-center text-danger fw-bold'>{parseCurrency(getBillTotal().toString())}</h5>
        {
          billAccountHistories?.length > 0 &&
          <>
            <h4 className='col-12 text-center mt-4 '>Paga con:</h4>
            {
              billAccountHistories?.map((billAccountHistory, index) => (
                <div key={index} className='col-12 p-0 position-relative d-flex flex-wrap'>
                  <h5 className='col-12 text-center fw-bold'>
                    {
                      `${parseCurrency(billAccountHistory.accountHistory.amount.toString())}    
                      ${billAccountHistory.accountHistory.payMethod.name}`
                    }
                  </h5>
                  <div className="position-absolute" style={{ right: '2px' }}>
                    <CustomBtn action={() => removeAccountHistory(billAccountHistory.accountHistory)} buttonType={buttonTypes.delete} height='25px' />
                  </div>
                </div>
              ))
            }
          </>
        }
      </div>
      {
        billAccountHistories?.length > 0 && showAction &&
        <button onClick={handleAction} className={`col-12 btn ${isEnoughMoney() ? 'btn-outline-success' : 'btn-success disabled'} my-4 p-4`}>{actionLabel}</button>
      }
    </div>
  )
}

export default BillPayMethodForm