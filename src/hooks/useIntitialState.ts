import { useEffect, useState } from 'react'
import { appState, systemState, userState } from '../types/appState'
import { WorkDayUser } from '../types/workDayUser'
import { User } from '../types/user'
import { useGet, usePost, usePostWithResponse } from './useAPI'
import { UserInfo } from '../types/userInfo'


const initialUser: userState = {
  loggedIn: false,
  userInfo: { id: 0 } as UserInfo,
  workDayUser: { id: 0 } as WorkDayUser
}

const initialSystem: systemState = {
  loader: false
}

const useInitialState = (): appState => {
  const [user, setUser] = useState(initialUser)
  const [system, setSystem] = useState(initialSystem)

  const login = async (tmpUser: User) => {
    const response = await usePostWithResponse('users/login', tmpUser, true)
    if (!response.error) {
      localStorage.setItem('credentials', JSON.stringify(response.data))
      setUser({
        userInfo: response.data.userInfo,
        loggedIn: true,
        workDayUser: { ...user.workDayUser }
      })
    }
  }

  const logout = () => {
    setUser({
      ...user,
      userInfo: {
        ...user.userInfo,
        id: 0
      },
      loggedIn: false
    })
  }

  const setWorkDayUser = async () => {
    const response = await useGet<WorkDayUser>(`workDayUsers/${user.userInfo?.userId}`, true)
    if (!response.error && response.data !== null) {
      setUser({
        ...user,
        workDayUser: { ...response.data }
      })
    }
  }

  useEffect(() => {
    const credentials = localStorage.getItem('credentials')
    if (credentials) {
      const tmpUser = JSON.parse(credentials)
      setUser({
        userInfo: tmpUser.userInfo,
        loggedIn: true,
        workDayUser: { ...user.workDayUser }
      })
    }
  }, [])

  return {
    user,
    system,
    login,
    setWorkDayUser,
    logout
  }
}

export default useInitialState