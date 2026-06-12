import React from 'react'
import { useNavigate } from 'react-router'

import {
  primaryBtn,
  primaryText
} from '../../Styles/common'

function Header() {
  const navigate = useNavigate()

  return (
    <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
      <div
        onClick={() => navigate('/')}
        className="cursor-pointer flex items-center gap-3"
      >
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxdgXiaGNJ4PQNsKP6dRzp9FplKkKmb-BMmw&s"
          alt="logo"
          className="w-70 object-cover rounded-2xl shadow-[0_0_18px_rgba(239,68,68,0.18)]"
        />

        <h2 className={`font-bold text-xl ${primaryText}`}>
          Smart Placement Tracker
        </h2>
      </div>

      <div className="flex gap-4">
        <button
          className='bg-white text-black px-6 py-3 rounded-full font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(239,68,68,0.22)]'
          onClick={() => navigate('/login')}
        >
          Login
        </button>

        <button
          className='bg-white text-black px-6 py-3 rounded-full font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(239,68,68,0.22)]'
          onClick={() => navigate('/register')}
        >
          Signup
        </button>
      </div>
    </header>
  )
}

export default Header
