import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import Content from '../components/generics/Content'
import FoodTable from '../components/generics/FoodTable'
import Bar from '../components/generics/Bar'
import LeftViewBar from '../components/generics/LeftViewBar'
import AppContext from '../context/AppContext'
import Login from '../containers/auth/Login'
import WorkDayUserForm from '../components/WorkDayUserForm'
import { useGet } from '../hooks/useAPI'
import { WorkDayUser } from '../types/workDayUser'
import BillMaker from '../containers/generics/BillMaker'

const Home = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { setWorkDayUser } = useContext(AppContext)

  useEffect(() => {
    setWorkDayUser()
  }, [])
  return (
    <Content isLoading={isLoading}>
      <>
        <FoodTable tableNumber={1} top={45} left={50} />
        <FoodTable tableNumber={2} top={45} left={62} />
        <FoodTable tableNumber={3} top={45} left={74} />
        <FoodTable tableNumber={4} top={70} left={50} />
        <FoodTable tableNumber={5} top={70} left={62} />
        <FoodTable tableNumber={6} top={70} left={74} />
        <Bar tableNumber={7} top={15} left={68} />
        <Bar tableNumber={8} top={15} left={74} />
        <Bar tableNumber={9} top={15} left={80} />
        <Bar tableNumber={10} top={15} left={86} />
      </>
    </Content>
  )
}

export default Home