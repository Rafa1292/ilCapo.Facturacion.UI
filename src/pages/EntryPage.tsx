import React, { useContext, useEffect, useState } from 'react'
import AppContext from '../context/AppContext'
import { PayMethod } from '../types/payMethod'
import { useGetList } from '../hooks/useAPI'
import { parseCurrency } from '../utils/currencyParser'
import '../scss/entry.scss'
import EntryForm from '../components/EntryForm'

const EntryPage = () => {
  const { user } = useContext(AppContext)
  const [payMethods, setPayMethods] = useState<PayMethod[]>([])

  const getPayMethodName = (id: number) => {
    const payMethod = payMethods.find(payMethod => payMethod.id === id)
    return payMethod ? payMethod.name : ''
  }

  useEffect(() => {
    console.log(user)
    const getPayMethods = async () => {
      const response = await useGetList<PayMethod[]>('paymethods', true)
      if (!response.error) {
        setPayMethods(response.data.filter(paymethod => paymethod.isPublic))
      }
    }
    getPayMethods()
  }, [])

  return (
    <div className='col-12 d-flex flex-wrap justify-content-center'>
      <h4>Estos son tus ingresos de hoy</h4>
      <EntryForm/>
      <div className='d-flex col-12 justify-content-center flex-wrap entry-container' >
        {
          user.workDayUser === undefined &&
          <div className='col-12 my-3 text-center'>
            No tienes un día de trabajo asignado
          </div>
          ||
          user.workDayUser.entries?.length === 0 &&
          <div className='col-12 my-3 text-center'>
            No tienes ingresos registrados
          </div>
          ||
          user.workDayUser.entries?.sort((a, b) => a.id - b.id).map((entry, index) => (
            <div className='col-12 d-flex justify-content-between align-items-center py-2 entry' style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }} key={index}>
              <div className='col-4 text-center'>
                {parseCurrency(entry.accountHistory.amount.toString())}
              </div>
              <div className='col-4 text-center'>
                {getPayMethodName(entry.accountHistory.payMethodId)}
              </div>
              <div className='col-4 text-center'>
                {entry.description}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default EntryPage