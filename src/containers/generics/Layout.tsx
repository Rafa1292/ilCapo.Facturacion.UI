import React, { useContext } from 'react'
import Navbar from '../../components/generics/Navbar'
import SideMenu from '../../components/generics/SideMenu'
import AppContext from '../../context/AppContext'
import Login from '../auth/Login'
import WorkDayUserPage from '../../pages/WorkDayUserPage'

interface Props {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  const { user, system } = useContext(AppContext)


  return (
    <>
      {user.loggedIn === false
        &&
        <Login />
        ||
        user.workDayUser.id <= 0
        &&
        <WorkDayUserPage />
        ||
        <>
          <Navbar />

          <div className="container-fluid">
            <div className="row">
              <main className="col-12 d-flex flex-wrap p-2 justify-content-center">
                {
                  user.workDayUser.close &&
                  <div className="flex flex-col items-center justify-center h-full">
                    <h5 className="text-2xl font-bold text-gray-700">El día de trabajo ya ha sido cerrado</h5>
                  </div>
                  ||
                  children
                }
              </main>
            </div>
          </div>
        </>
      }
    </>
  )
}

export default Layout