import Header from "./Header";
import Footer from "./Footer";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import useLenis from "../lib/useLenis";

function RootLayout() {
  useLenis();
  const { pathname } = useLocation();

  return (
    <div>
      <ScrollRestoration />
      <Header/>
      <div key={pathname} className="min-h-screen animate-fade-in">
        <Outlet/>
      </div>
      <Footer/>
    </div>
  )
}

export default RootLayout
