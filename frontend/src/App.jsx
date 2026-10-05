import { useState, useEffect, lazy, Suspense } from 'react'
import {createBrowserRouter, RouterProvider} from 'react-router'
import RootLayout from './components/RootLayout'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Preloader from './components/Preloader'
import ShaderDemo from './components/ShaderDemo'
import OceanicDepthsDemo from './components/OceanicDepthsDemo'

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
          path:"/dashboard",
          element:<Dashboard/>
    },
    {
          /* Outside RootLayout on purpose. That layout wraps its outlet in
             `min-h-screen` and adds the site Header and Footer; a full-bleed
             dark showcase would inherit the header and the light page ground
             behind its own `min-h-screen`. */
          path:"/shader-demo",
          element:<ShaderDemo/>
        },
        {
          /* Also outside RootLayout — same reason: a full-bleed background page
             should not inherit the site header and footer. */
          path:"/oceanic-depths",
          element:<OceanicDepthsDemo/>
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
