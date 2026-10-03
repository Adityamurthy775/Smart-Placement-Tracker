import { useState, useEffect, lazy, Suspense } from 'react'
import {createBrowserRouter, RouterProvider} from 'react-router'
import RootLayout from './components/RootLayout'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Preloader from './components/Preloader'

// Route-level code split: chart.js / recharts / xlsx live in these two files
// and are the bulk of the 1.17 MB bundle warning.
const Mainpage = lazy(() => import('./components/Mainpage'))
const Dashboard = lazy(() => import('./components/Dashboard'))

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
      <Suspense fallback={null}>
        <RouterProvider router={routerobj}/>
      </Suspense>
    </div>
  )
}

export default App
