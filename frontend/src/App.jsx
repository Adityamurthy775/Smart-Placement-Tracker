import { useState, useEffect } from 'react'
import {createBrowserRouter, RouterProvider} from 'react-router'
import RootLayout from './components/RootLayout'
import Header from './components/Header'
import Home from './components/Home'
import Footer from './components/Footer'
import Login from './components/Login'
import Register from './components/Register'
import Mainpage from './components/Mainpage'
import Dashboard from './components/Dashboard'
import Preloader from './components/Preloader'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Minimum display time for preloader
    const timer = setTimeout(() => setLoading(false), 3600)
    return () => clearTimeout(timer)
  }, [])

  const routerobj = createBrowserRouter([
    {
      path:'/',
      element:<RootLayout/>,
      children:[
        {
          path:"",
          element:<Home/>
        },
        {
          path:"header",
          element:<Header/>
        },
        {
          path:"footer",
          element:<Footer/>
        },
        {
          path:"login",
          element:<Login/>
        },{
          path:"register",
          element:<Register/>
        }
      ]
    },{
          path:"/main-page",
          element:<Mainpage/>
    },{
          path:"/dashboard",
          element:<Dashboard/>
    }
  ])

  if (loading) {
    return <Preloader onComplete={() => setLoading(false)} />
  }

  return (
    <div>
      <RouterProvider router={routerobj}/>
    </div>
  )
}

export default App
