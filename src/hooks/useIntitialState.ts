import { useState } from 'react'
import { appState, systemState, userState } from '../types/appState'


const initialUser: userState = {
  loggedIn: false,
}

const initialSystem: systemState = {
  loader: false
}

const useInitialState = () : appState => {
  const [user, setUser] = useState(initialUser)
  const [system, setSystem] = useState(initialSystem)

  const login = () => {
    setUser({
      ...user,
      loggedIn: true
    })
  }

  return {
    user,
    system,
    login
  }
}

export default useInitialState