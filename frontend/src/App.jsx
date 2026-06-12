import {createBrowserRouter, RouterProvider} from 'react-router'
import RootLayout from './components/RootLayout'
import Header from './components/Header'
import Home from './components/Home'
import Footer from './components/Footer'
import Login from './components/Login'
import Register from './components/Register'
import Mainpage from './components/Mainpage'
function App() {
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
    }
  ])
  return (
    <div>
      <RouterProvider router={routerobj}/>
    </div>
  )
}

export default App
