import React, { useEffect, useState } from 'react'
import CustomInputNumber from './generics/CustomInputNumber'
import { AccountHistory } from '../types/accountHistory'
import { PayMethod } from '../types/payMethod'
import { BillAccountHistory } from '../types/billAccountHistory'
import BillPayMethodForm from './BillPayMethodForm'
import BillPayMethodSplitForm from './BillPayMethodSplitForm'

const initialAccountHistory: AccountHistory = {
  amount: 0,
  currentBalance: 0,
  delete: false,
  id: 0,
  pay: false,
  payMethod: {} as PayMethod,
  payMethodId: 0,
  previousBalance: 0,
  createdBy: 0,
  updatedBy: 0
}

const initialBillAccountHistory: BillAccountHistory = {
  id: 0,
  accountHistoryId: 0,
  delete: false,
  accountHistory: initialAccountHistory,
  billId: 0,
  createdBy: 0,
  updatedBy: 0
}

interface billAccountHistoriesContainer {
  id: number
  billAccountHistories: BillAccountHistory[]
}

interface Props {
  getBillTotal: () => number
  closeBill: () => void
}

const BillPayMethodSplit = ({ getBillTotal, closeBill }: Props) => {
  const [parts, setParts] = useState<number>(0)
  const [billAccountHistoriesContainerList, setBillAccountHistoriesContainerList] = useState<billAccountHistoriesContainer[]>([])

  const handleChange = (event: any) => {
    const numberOfParts = event.target.value
    const tmpBillAccountHistoriesContainer: billAccountHistoriesContainer[] = []
    for (let i = 1; i <= numberOfParts; i++) {
      tmpBillAccountHistoriesContainer.push({ id: i, billAccountHistories: [] })
    }
    setBillAccountHistoriesContainerList(tmpBillAccountHistoriesContainer)
    setParts(numberOfParts)
  }

  const getBillPartialTotal = (): number => {
    const billTotal = getBillTotal()
    const billPartialTotal = billTotal / parts
    return Math.floor(billPartialTotal)
  }

  const setBillAccountHistory = (accountHistory: AccountHistory, billItemListId: number) => {
    const tmpBillAccountHistoriesContainerList = [...billAccountHistoriesContainerList]
    for (const billAccountHistoriesContainer of tmpBillAccountHistoriesContainerList) {
      if (billAccountHistoriesContainer.id === billItemListId) {
        const billAccountHistory: BillAccountHistory = {
          id: 0,
          accountHistoryId: 0,
          delete: false,
          accountHistory: accountHistory,
          billId: 0,
          createdBy: 0,
          updatedBy: 0
        }
        billAccountHistoriesContainer.billAccountHistories.push(billAccountHistory)
      }
    }    setBillAccountHistoriesContainerList(tmpBillAccountHistoriesContainerList)
  }

  const removeAccountHistory = (accountHistory: AccountHistory, billItemListId: number) => {
    const tmpBillAccountHistoriesContainerList = [...billAccountHistoriesContainerList]
    for (const billAccountHistoriesContainer of tmpBillAccountHistoriesContainerList) {
      if (billAccountHistoriesContainer.id === billItemListId) {
        const tmpBillAccountHistories = [...billAccountHistoriesContainer.billAccountHistories]
        const index = tmpBillAccountHistories.findIndex(billAccountHistory => billAccountHistory.accountHistory.amount === accountHistory.amount && billAccountHistory.accountHistory.payMethodId === accountHistory.payMethodId)
        tmpBillAccountHistories.splice(index, 1)
        billAccountHistoriesContainer.billAccountHistories = tmpBillAccountHistories
      }
    }    
    setBillAccountHistoriesContainerList(tmpBillAccountHistoriesContainerList)
  }

  const wouldBePay = (): boolean => {
    let wouldBePay = false
    const tmpBillAccountHistories: BillAccountHistory[] = billAccountHistoriesContainerList.map(billAccountHistoriesContainer => billAccountHistoriesContainer.billAccountHistories).flat()
    const totalHistories = tmpBillAccountHistories.reduce((total, billAccountHistory) => total + billAccountHistory.accountHistory.amount, 0)
    if (totalHistories === getBillTotal()) {
      wouldBePay = true
    }
    return wouldBePay
  }
      

  useEffect(() => {
    handleChange({ target: { value: 2 } })
  }, [])

  return (
    <>
      <div className="col-4 d-flex flex-wrap justify-content-center ">
        <CustomInputNumber isRequired={false} showLabel={false} value={parts} customInputNumber={
          {
            label: 'Partes', name: 'parts',
            handleChange: handleChange, pattern: '', validationMessage: 'Ingrese un numero válido'
          }
        } />
      </div>
      <div className="col-12 d-flex flex-wrap justify-content-center">
        {
          billAccountHistoriesContainerList?.length > 0 &&
          billAccountHistoriesContainerList?.map((billAccountHistoriesContainer, index) => (
            <div className='col-4 d-flex flex-wrap justify-content-center p-2' key={index}>
              <BillPayMethodSplitForm closeBill={closeBill} fastPayAction={setBillAccountHistory} removeAccountHistory={removeAccountHistory} billAccountHistories={billAccountHistoriesContainer.billAccountHistories} billItemListId={billAccountHistoriesContainer.id} getBillPartialTotal={getBillPartialTotal}
                setBillAccountHistory={setBillAccountHistory} wouldBePay={wouldBePay}/>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default BillPayMethodSplit