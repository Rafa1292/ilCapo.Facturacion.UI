import { useEffect, useState } from 'react'
import { appState, systemState, userState } from '../types/appState'
import { WorkDayUser } from '../types/workDayUser'
import { User } from '../types/user'
import { useGet, usePostWithResponse } from './useAPI'
import { UserInfo } from '../types/userInfo'
import { BussinessConfig } from '../types/bussinessConfig'
import useBill from './useBill'


const initialUser: userState = {
  loggedIn: false,
  userInfo: { id: 0 } as UserInfo,
  workDayUser: { id: 0 } as WorkDayUser
}

const initialSystem: systemState = {
  loader: true,
  roomEdit: false,
  bussinessConfig: { id: 0, menuWaitTime: 0, serveWaitTime: 0, tables: [] } as BussinessConfig
}

const useInitialState = (): appState => {
  const [user, setUser] = useState(initialUser)
  const [system, setSystem] = useState(initialSystem)
  const billFunctions = useBill()

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

  const setWorkDayUser = async (currentUserInfo?: UserInfo): Promise<WorkDayUser | undefined> => {
    const tmpUserInfo = user.userInfo.id > 0 ? user.userInfo : currentUserInfo
    const response = await useGet<WorkDayUser>(`workDayUsers/${tmpUserInfo?.userId}`, true)
    if (!response.error && response.data !== null) {
      setUser({
        ...user,
        workDayUser: { ...response.data }
      })
      return response.data
    }
    return undefined
  }

  const setRoomEdit = (value: boolean) => {
    setSystem({
      ...system,
      roomEdit: value
    })
  }

  const setMenuDeliveryTime = (tableNumber: number, date: Date | null) => {

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
        bussinessConfig: response.data,
        loader: false
      })
    }
  }

  useEffect(() => {
    const initializeComponent = async () => {
      const credentials = localStorage.getItem('credentials')
      if (credentials) {
        const tmpUser = JSON.parse(credentials)
        const tmpWorkDayUser = await setWorkDayUser(tmpUser.userInfo)
        const tmpUserState: userState = {
          userInfo: tmpUser.userInfo,
          loggedIn: true,
          workDayUser: tmpWorkDayUser !== undefined ? tmpWorkDayUser : { ...user.workDayUser }
        }
        if (tmpUserState.workDayUser.id > 0)
          await billFunctions.getBillsByWorkDayUser(tmpUserState.workDayUser.id)
        setUser({...tmpUserState, workDayUser: tmpUserState.workDayUser})
        
      }
      await getBussinessConfig()
    }
    initializeComponent()
  }, [])

  return {
    user,
    system,
    login,
    setWorkDayUser,
    logout,
    setRoomEdit,
    setMenuDeliveryTime,
    getBussinessConfig,
    billFunctions
  }
}

export default useInitialState