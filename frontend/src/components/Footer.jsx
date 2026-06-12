import React from 'react'
import { mutedText } from '../../Styles/common'

function Footer() {
  return (
    <footer className="border-t py-8 mt-10">

      <div className="max-w-6xl mx-auto px-6 text-center">

        <h3 className="font-bold text-lg">
          Smart Placement Tracker
        </h3>

        <p className={`${mutedText} mt-2`}>
          Helping colleges manage placements efficiently.
        </p>

        <p className={`${mutedText} mt-4 text-sm`}>
          © 2026 Smart Placement Tracker. All Rights Reserved.
        </p>

      </div>

    </footer>
  )
}

export default Footer
