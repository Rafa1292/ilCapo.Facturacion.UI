import React, { useContext, useEffect, useState } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import AppContext from '../context/AppContext'
import { useGetList } from '../hooks/useAPI'
import { Provider } from '../types/provider'
import { PayMethod } from '../types/payMethod'
import { parseCurrency } from '../utils/currencyParser'



const ExpensePage = () => {
  const { user } = useContext(AppContext)
  const [providers, setProviders] = useState<Provider[]>([])
  const [payMethods, setPayMethods] = useState<PayMethod[]>([])

  const getProviderName = (id: number) => {
    const provider = providers.find(provider => provider.id === id)
    return provider ? provider.name : ''
  }

  const getPayMethodName = (id: number) => {
    const payMethod = payMethods.find(payMethod => payMethod.id === id)
    return payMethod ? payMethod.name : ''
  }

  useEffect(() => {
    const getProviders = async () => {
      const response = await useGetList<Provider[]>('providers', false)
      if (!response.error) {
        setProviders(response.data)
      }
    }
    const getPayMethods = async () => {
      const response = await useGetList<PayMethod[]>('paymethods', true)
      if (!response.error) {
        setPayMethods(response.data.filter(paymethod => paymethod.isPublic))
      }
    }
    getPayMethods()
    getProviders()
  }, [])

  return (
    <div className='col-12 d-flex flex-wrap justify-content-center' >
      <h4 className='col-12 text-center'>Estos son tus gastos de hoy</h4>
      <ExpenseForm />
      <div className='d-flex col-8 justify-content-center flex-wrap expense-container' >
        {
          user.workDayUser === undefined &&
          <div className='col-12 my-3 text-center'>
            No tienes un día de trabajo asignado
          </div>
          ||
          user.workDayUser.expenses?.length === 0 &&
          <div className='col-12 my-3 text-center'>
            No tienes gastos registrados
          </div>
          ||
          user.workDayUser.expenses?.sort((a, b) => a.id - b.id).map((expense, index) => (
            <div className='col-12 d-flex justify-content-between align-items-center py-2 expense' style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }} key={index}>
              <div className='col-6 d-flex justify-content-between align-items-center'>
                <div className='col-6 text-center'>
                  {expense.amount}
                </div>
                <div className='col-6 text-center'>
                  {getProviderName(expense.providerId)}
                </div>
              </div>
              <div className='col-6 d-flex justify-content-between align-items-center'>
                <div className='col-4 text-center'>
                  {expense.description}
                </div>
                <div className='col-8 text-center'>
                  {
                    expense.expenseAccountHistories.length === 0 &&
                    <div className='col-12 text-center'>
                      Pago pendiente
                    </div>
                  }
                  <div className="col-12 d-flex flex-wrap">
                    {
                      expense.expenseAccountHistories.length > 0 &&
                      expense.expenseAccountHistories.map((expenseAccountHistory, index) => (
                        <div className='col-12 d-flex flex-wrap' key={index}>
                          <div className="col-6">
                            {getPayMethodName(expenseAccountHistory.accountHistory.payMethodId)}
                          </div>
                          <div className="col-6">
                            {parseCurrency(expenseAccountHistory.accountHistory.amount.toString())}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default ExpensePage