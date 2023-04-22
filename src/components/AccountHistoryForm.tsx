import React, { useEffect, useState } from 'react'
import { AccountHistory } from '../types/accountHistory'
import { PayMethod } from '../types/payMethod'
import CustomInputNumber from './generics/CustomInputNumber'
import { regexOptions } from '../enums/regexOptions'
import CustomInputSelect from './generics/CustomInputSelect'
import { useGetList } from '../hooks/useAPI'
import CustomBtn from './generics/CustomBtn'
import { buttonTypes } from '../enums/buttonTypes'

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

interface Props {
  handleAccountHistory: (accountHistory: AccountHistory) => boolean
  isPay: boolean
}

const AccountHistoryForm = ({ handleAccountHistory, isPay }: Props) => {
  const [accountHistory, setAccountHistory] = useState<AccountHistory>(initialAccountHistory)
  const [payMethods, setPayMethods] = useState<PayMethod[]>([])

  const handleChange = (event: any) => {
    const { name, value } = event.target
    setAccountHistory({ ...accountHistory, [name]: value })
  }

  const handlePaymethod = (event: any) => {
    const { value } = event.target
    const payMethod = payMethods.find(paymethod => paymethod.id === value)
    if (payMethod) {
      setAccountHistory({ ...accountHistory, payMethodId: value, payMethod })
    }
  }

  const action = () => {
    const saved = handleAccountHistory({...accountHistory, pay: isPay})
    if (saved)
      setAccountHistory(initialAccountHistory)
  }

  useEffect(() => {
    const getPayMethods = async () => {
      const response = await useGetList<PayMethod[]>('paymethods', true)
      if (!response.error) {
        setPayMethods(response.data.filter(paymethod => paymethod.isPublic))
      }
    }
    getPayMethods()
  }, [])

  return (
    <div className='col-12 d-flex flex-wrap justify-content-center p-3 pb-5 rounded border' style={{ height: 'fit-content' }}>
      <h4 className='col-12'>Formas de pago</h4>
      <div className="col-12 d-flex flex-wrap justify-content-center ">
        <CustomInputNumber isRequired={false} showLabel={false} value={accountHistory.amount} customInputNumber={
          {
            label: 'Monto', name: 'amount',
            handleChange: handleChange, pattern: '', validationMessage: 'Ingrese un monto válido'
          }
        } />
      </div>
      <div className="col-12 d-flex flex-wrap justify-content-center ">
        <CustomInputSelect showLabel={false} value={accountHistory.payMethodId}
          customInputSelect={
            {
              label: 'Proveedores', name: 'measureId',
              handleChange: handlePaymethod, pattern: '', validationMessage: 'Seleccione un metodo de pago'
            }}
          data={payMethods.map(paymethod => { return { value: paymethod.id, label: paymethod.name } })}
          defaultLegend={'Metodo de pago'}
        />
      </div>
      <div className="col-12 d-flex flex-wrap justify-content-center align-items-center">
        <button className='col-12 btn btn-outline-success ' onClick={action}>Agregar forma de pago</button>
      </div>
    </div>
  )
}

export default AccountHistoryForm