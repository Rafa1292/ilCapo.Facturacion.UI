import React from 'react'
import { appState } from '../types/appState'

const AppContext = React.createContext<appState>({} as appState)

export default AppContext