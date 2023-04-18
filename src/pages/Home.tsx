import React, { useContext } from 'react'
import { useState } from 'react'
import Content from '../components/generics/Content'
import FoodTable from '../components/generics/FoodTable'
import Bar from '../components/generics/Bar'
import LeftViewBar from '../components/generics/LeftViewBar'
import AppContext from '../context/AppContext'
import Login from '../containers/auth/Login'
import WorkDayUserForm from '../components/WorkDayUserForm'

const Home = () => {
  const state = useContext(AppContext)
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <Content isLoading={isLoading}>
      {
        state.user.loggedIn === false && 
        <Login/>
        || state.user.workDayUser.id <= 0 &&
        <WorkDayUserForm/>
        ||
        <>
          <FoodTable tableNumber={1} top={40} left={40} />
          <FoodTable tableNumber={2} top={40} left={50} />
          <FoodTable tableNumber={3} top={40} left={60} />
          <Bar tableNumber={4} top={15} left={66} />
          <Bar tableNumber={5} top={15} left={71} />
          <Bar tableNumber={6} top={15} left={76} />
          <Bar tableNumber={7} top={15} left={81} />
          <Bar tableNumber={8} top={15} left={86} />
          <Bar tableNumber={9} top={15} left={91} />
          <Bar tableNumber={10} top={15} left={96} />

          <LeftViewBar tableNumber={5} top={15} left={27} />
          <LeftViewBar tableNumber={6} top={26} left={27} />
          <LeftViewBar tableNumber={7} top={37} left={27} />
          <LeftViewBar tableNumber={8} top={48} left={27} />
          <LeftViewBar tableNumber={9} top={59} left={27} />
          <LeftViewBar tableNumber={10} top={70} left={27} />
        </>
      }
    </Content>
  )
}

export default Home