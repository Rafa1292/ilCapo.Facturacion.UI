import React, { useContext, useEffect, useState } from 'react'
import AppContext from '../context/AppContext'
import { PayMethod } from '../types/payMethod'
import { Provider } from '../types/provider'
import { parseCurrency } from '../utils/currencyParser'
import InvestmentForm from '../components/InvestmentForm'
import { useGetList } from '../hooks/useAPI'
import { Investment } from '../types/investment'

const InvestmentPage = () => {
  const { user } = useContext(AppContext)
  const [payMethods, setPayMethods] = useState<PayMethod[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])

  const getPayMethodName = (id: number) => {
    const payMethod = payMethods.find(payMethod => payMethod.id === id)
    return payMethod ? payMethod.name : ''
  }

  const getProviderName = (id: number) => {
    const provider = providers.find(provider => provider.id === id)
    return provider ? provider.name : ''
  }

  const refreshInvestments = async () => {
    const response = await useGetList<Investment[]>(`investments/byWorkDayUser/${user.workDayUser.id}`, true)
    if (!response.error) {
      setInvestments(response.data)
    }
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
    const getInvestments = async () => {
      await refreshInvestments()
    }    
    getInvestments()
    getPayMethods()
    getProviders()
  }, [user])


  return (
    <div className='col-12 d-flex flex-wrap justify-content-center' >
      <h4 className='col-12 text-center'>Estas son tus compras de hoy</h4>
      <InvestmentForm refreshInvestments={refreshInvestments}/>
      <div className='d-flex col-8 justify-content-center flex-wrap investment-container' >
        {
          user.workDayUser === undefined &&
          <div className='col-12 my-3 text-center'>
            No tienes un día de trabajo asignado
          </div>
          ||
          user.workDayUser.investments?.length === 0 &&
          <div className='col-12 my-3 text-center'>
            No tienes gastos registrados
          </div>
          ||
          investments.sort((a, b) => a.id - b.id).map((investmment, index) => (
            <div className='col-12 d-flex justify-content-between align-items-center py-2 investment' style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }} key={index}>
              <div className='col-6 d-flex justify-content-between align-items-center'>
                <div className='col-6 text-center'>
                  {parseCurrency(investmment?.amount?.toString())}
                </div>
                <div className='col-6 text-center'>
                  {getProviderName(investmment?.providerId)}
                </div>
              </div>
              <div className='col-6 d-flex justify-content-between align-items-center'>
                <div className='col-8 text-center'>
                  {
                    investmment?.investmentHistories?.length === 0 &&
                    <div className='col-12 text-center'>
                      Pago pendiente
                    </div>
                  }
                  <div className="col-12 d-flex flex-wrap">
                    {
                      investmment?.investmentHistories?.length > 0 &&
                      investmment?.investmentHistories?.map((investmentAccountHistory, index) => (
                        <div className='col-12 d-flex flex-wrap' key={index}>
                          <div className="col-6">
                            {getPayMethodName(investmentAccountHistory?.accountHistory?.payMethodId)}
                          </div>
                          <div className="col-6">
                            {parseCurrency(investmentAccountHistory?.accountHistory?.amount?.toString())}
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

export default InvestmentPage