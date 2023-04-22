import { useState } from 'react'
import { appState, systemState, userState } from '../types/appState'
import { WorkDayUser } from '../types/workDayUser'
import { User } from '../types/user'
import { useGet } from './useAPI'


const initialUser: userState = {
  loggedIn: false,
  user: { id: 1 } as User,
  workDayUser: { id: 0 } as WorkDayUser
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
      user: {
        ...user.user,
        id: 1
      },
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

  const setWorkDayUser = async () => {
    const response = await useGet<WorkDayUser>(`workDayUsers/${user.user?.id}`, true)
    if (!response.error && response.data !== null) {
      console.log(response.data)
      setUser({
        ...user,
        workDayUser: { ...response.data }
      })
    }
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