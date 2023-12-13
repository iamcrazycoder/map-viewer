import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import PageNotFound from 'components/Error/404'
import ProjectPage from './ProjectPages'
import Home from 'components/Home'

/**
 * This component is the application; it contains all the routes within the
 * project and points to which components are rendered for each of those routes
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ProjectPage.Root} element={<Home/>} />
        <Route path={ProjectPage.None} element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
