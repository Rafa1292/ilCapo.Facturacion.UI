import { useEffect, useState } from 'react'
import { appState, systemState, userState } from '../types/appState'
import { WorkDayUser } from '../types/workDayUser'
import { User } from '../types/user'
import { useGet, usePost, usePostWithResponse } from './useAPI'
import { UserInfo } from '../types/userInfo'
import { BussinessConfig } from '../types/bussinessConfig'


const initialUser: userState = {
  loggedIn: false,
  userInfo: { id: 0 } as UserInfo,
  workDayUser: { id: 0 } as WorkDayUser
}

const initialSystem: systemState = {
  loader: false,
  roomEdit: false,
  bussinessConfig: { id: 0, menuWaitTime: 0, serveWaitTime: 0, tables: [] } as BussinessConfig
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
    setUser(initialUser)
    localStorage.removeItem('credentials')
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

  const setRoomEdit = (value: boolean) => {
    setSystem({
      ...system,
      roomEdit: value
    })
  }

  const setMenuDeliveryTime = (tableNumber: number, date: Date | null) => {
    console.log(tableNumber, date)
    setSystem({
      ...system,
      bussinessConfig: {
        ...system.bussinessConfig,
        tables: system.bussinessConfig.tables.map(table => {
          if (table.number === tableNumber) {
            return {
              ...table,
              menuDeliveryTime: date
            }
          }
          return table
        })
      }
    })
  }

  const getBussinessConfig = async () => {
    const response = await useGet<BussinessConfig>('bussinessConfig', true)
    if (!response.error && response.data !== null) {
      setSystem({
        ...system,
        bussinessConfig: response.data
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
    getBussinessConfig()
  }, [])

  return {
    user,
    system,
    login,
    setWorkDayUser,
    logout,
    setRoomEdit,
    setMenuDeliveryTime,
    getBussinessConfig
  }
}

export default useInitialState