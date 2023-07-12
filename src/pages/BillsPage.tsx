import React, { useContext, useEffect, useState } from 'react'
import BillsByWorkDay from '../components/BillsByWorkDay'
import { useGetList } from '../hooks/useAPI'
import { Bill } from '../types/bill'
import AppContext from '../context/AppContext'

const BillsPage = () => {
  const [bills, setBills] = useState<Bill[]>([])
  const { user } = useContext(AppContext)

  const getBillsByWorkDay = async () => {
    const response = await useGetList<Bill[]>(`bills/billsByWorkDayUserClose/${user.workDayUser.id}`, true)
    if (!response.error) {
      setBills(response.data)
    }
  }
  useEffect(() => {
    getBillsByWorkDay()
  }, [])

  return (
    <>
      <BillsByWorkDay getBillsByWorkDay={getBillsByWorkDay} bills={bills}/>
    </>
  )
}

export default BillsPage