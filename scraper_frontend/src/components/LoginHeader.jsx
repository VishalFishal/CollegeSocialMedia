import React from 'react'
import logo from '../assets/snuc_logo.png'

const LoginHeader = (props) => {
  return (
    <div className="flex justify-start bg-white text-black p-6 gap-x-8 shadow-xl">
        <a href="https://www.snuchennai.edu.in"><img src={logo} alt="SNUC Logo" className="h-7" /></a>
    </div>
  )
}

export default LoginHeader