import React from 'react'
import AppContext from './context/AppContext'
import  useInitialState from './hooks/useIntitialState'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './scss/app.scss'
import Home from './pages/Home'
import WorkDayUserPage from './pages/WorkDayUserPage'
import ExpensePage from './pages/ExpensePage'
import Layout from './containers/generics/Layout'
import EntryPage from './pages/EntryPage'


function App() {
  const state = useInitialState()
  return (
    <AppContext.Provider value={state}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workDays" element={<WorkDayUserPage />} />
            <Route path="/expenses" element={<ExpensePage />} />
            <Route path="/entries" element={<EntryPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
