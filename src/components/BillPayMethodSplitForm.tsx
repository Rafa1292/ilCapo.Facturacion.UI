import React from 'react'
import { AccountHistory } from '../types/accountHistory'
import BillPayMethodForm from './BillPayMethodForm'
import { BillAccountHistory } from '../types/billAccountHistory'

interface Props {
  closeBill: () => void
  wouldBePay: () => boolean
  billItemListId: number
  setBillAccountHistory: (accountHistory: AccountHistory, billItemListId: number) => void
  billAccountHistories: BillAccountHistory[]
  getBillPartialTotal: () => number
  removeAccountHistory: (accountHistory: AccountHistory, billItemListId: number) => void
  fastPayAction: (accountHistory: AccountHistory, billItemListId: number) => void
  close: () => void
  showAction?: boolean
}

const BillPayMethodSplitForm = ({ billItemListId, showAction, fastPayAction, removeAccountHistory, getBillPartialTotal, billAccountHistories, setBillAccountHistory }: Props) => {
  const setAccountHistory = (accountHistory: AccountHistory): boolean => {
    setBillAccountHistory(accountHistory, billItemListId)
    return true
  }

  const handleRemoveAccountHistory = (accountHistory: AccountHistory) => {
    removeAccountHistory(accountHistory, billItemListId)
  }

  const handleFastPayAction = (accountHistory: AccountHistory) => {
    fastPayAction(accountHistory, billItemListId)
  }

  const printPayment = () => {
    console.log('printPayment')
  }

  return (
    <>
      <BillPayMethodForm  showAction={showAction} fastPayAction={handleFastPayAction} removeAccountHistory={handleRemoveAccountHistory}
        action={printPayment}
        actionLabel={`Imprimir comprobante ${billItemListId}`}
        billAccountHistories={billAccountHistories}
        setAccountHistory={setAccountHistory}
        getBillTotal={getBillPartialTotal} />
    </>
  )
}

export default BillPayMethodSplitForm