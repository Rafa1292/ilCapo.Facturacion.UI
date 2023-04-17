import React from 'react'
import AppContext from './context/AppContext'
import  useInitialState from './hooks/useIntitialState'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './scss/app.scss'
import Home from './pages/Home'
import Layout from './containers/generics/Layout'


function App() {
  const state = useInitialState()
  return (
    <AppContext.Provider value={state}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
