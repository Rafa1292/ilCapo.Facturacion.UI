import React, { useContext, useEffect } from 'react'
import Navbar from '../../components/generics/Navbar'
import AppContext from '../../context/AppContext'
import Login from '../auth/Login'
import WorkDayUserPage from '../../pages/WorkDayUserPage'
import { useLocation } from 'react-router-dom'

interface Props {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  const { user } = useContext(AppContext)
  const location = useLocation()

  return (
    <>
      {user.loggedIn === false
        &&
        <Login />
        ||
        user.workDayUser.id === 0
        &&
        <WorkDayUserPage />
        ||
        <>
          <Navbar />

          <div className='container-fluid'>
            <div className="row">
              <main className="col-12 d-flex flex-wrap justify-content-center" style={{ height: '100vh', overflow: 'hidden', paddingTop: '50px' }}>
                {
                  user.workDayUser.close && location.pathname !== '/bills' &&
                  <>
                    <div className="flex flex-col items-center justify-center my-3">
                      <h5 className="">El día de trabajo ya ha sido cerrado</h5>
                    </div>
                    <WorkDayUserPage isClose={true}/>
                  </>
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