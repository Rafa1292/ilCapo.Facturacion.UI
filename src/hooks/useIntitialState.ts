import { useState } from 'react'
import { appState, systemState, userState } from '../types/appState'
import { WorkDayUser } from '../types/workDayUser'
import { User } from '../types/user'


const initialUser: userState = {
  loggedIn: true,
  user: { id: 1 } as User,
  workDayUser: { id: 0} as WorkDayUser
}

const initialSystem: systemState = {
  loader: false
}

const useInitialState = (): appState => {
  const [user, setUser] = useState(initialUser)
  const [system, setSystem] = useState(initialSystem)

  const login = () => {
    setUser({
      ...user,
      loggedIn: true
    })
  }

  const logout = () => {
    setUser({
      ...user,
      user: {
        ...user.user,
        id: 0
      },
      loggedIn: false
    })
  }

  const setWorkDayUser = (workDayUser: WorkDayUser) => {
    setUser({
      ...user,
      workDayUser
    })
  }

  return {
    user,
    system,
    login,
    setWorkDayUser,
    logout
  }
}

export default useInitialState