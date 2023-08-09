import React, { useEffect, useState } from 'react'
import { AccountHistory } from '../types/accountHistory'
import { PayMethod } from '../types/payMethod'
import CustomInputNumber from './generics/CustomInputNumber'
import CustomInputSelect from './generics/CustomInputSelect'
import { useGetList } from '../hooks/useAPI'
import { parseCurrency } from '../utils/currencyParser'

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
  selectedPayMethodsId?: number[]
  handleAccountHistory: (accountHistory: AccountHistory) => boolean
  isPay: boolean
  defaultAmount: number
  fastPayAction?: (accountHistory: AccountHistory) => void
}

const AccountHistoryForm = ({ handleAccountHistory, fastPayAction, isPay, selectedPayMethodsId, defaultAmount }: Props) => {
  const [accountHistory, setAccountHistory] = useState<AccountHistory>(initialAccountHistory)
  const [payMethods, setPayMethods] = useState<PayMethod[]>([])
  const [payWith, setPayWith] = useState<number>(0)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setAccountHistory({ ...accountHistory, [name]: Number(value) })
  }

  const handlePaymethod = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const valueNumber = Number(value)
    const payMethod = payMethods.find(paymethod => paymethod.id === valueNumber)
    if (payMethod) {
      setAccountHistory({ ...accountHistory, payMethodId: valueNumber, payMethod })
    }
  }

  const action = () => {
    if (accountHistory.amount > 0) {
      const saved = handleAccountHistory({ ...accountHistory, pay: isPay })
      if (saved)
        setAccountHistory(initialAccountHistory)
    }
  }

  const handleChangeDiference = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPayWith(Number(event.target.value))
  }

  const getFastPayAccountHistory = (): AccountHistory => {
    const payMethod = payMethods.find(paymethod => paymethod.name.toLowerCase() === 'efectivo')
    if (payMethod) {
      return {
        ...initialAccountHistory,
        payMethodId: payMethod.id,
        payMethod,
        amount: defaultAmount,
        pay: isPay
      }
    }
    return initialAccountHistory
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
    <>
      {
        defaultAmount !== undefined && fastPayAction !== undefined ?
          <div className="col-12 border rounded p-3 my-2" style={{ height: 'fit-content' }}>
            <h5 className='col-12'>Pago rapido en efectivo</h5>
            <div className="col-12 d-flex flex-wrap justify-content-center ">
              <CustomInputNumber setDefaultValue={() => setPayWith(defaultAmount ? defaultAmount : 0)} isRequired={false} showLabel={false} value={payWith} customInputNumber={
                {
                  label: 'Monto', name: 'amount',
                  handleChange: handleChangeDiference, pattern: '', validationMessage: 'Ingrese un monto válido'
                }
              } />
            </div>
            {
              payWith >= defaultAmount &&
              <>
                <h5 className='col-12 text-center mt-4'>Su vuelto es:</h5>
                <h5 className='col-12 text-center text-danger'> {parseCurrency((payWith - defaultAmount).toString())}</h5>
                <div className="col-12 d-flex flex-wrap justify-content-center align-items-center">
                  <button className='col-12 btn btn-success ' onClick={() => fastPayAction(getFastPayAccountHistory())}>Agregar</button>
                </div>
              </>
            }
          </div>
          : null
      }
      <div className='col-12 d-flex flex-wrap justify-content-center p-3 pb-5 rounded border' style={{ height: 'fit-content' }}>
        <h5 className='col-12'>Formas de pago</h5>
        <div className="col-12 d-flex flex-wrap justify-content-center ">
          <CustomInputNumber setDefaultValue={() => setAccountHistory({ ...accountHistory, amount: defaultAmount ? defaultAmount : 0 })} isRequired={false} showLabel={false} value={accountHistory.amount} customInputNumber={
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
            data={payMethods.filter(x => !selectedPayMethodsId?.includes(x.id)).map(paymethod => { return { value: paymethod.id, label: paymethod.name } })}
            defaultLegend={'Metodo de pago'}
          />
        </div>
        <div className="col-12 d-flex flex-wrap justify-content-center align-items-center">
          <button className='col-12 btn btn-outline-success py-1' style={{height: 'fit-content'}} onClick={action}>Agregar forma de pago</button>
        </div>
      </div>
    </>
  )
}

export default AccountHistoryForm