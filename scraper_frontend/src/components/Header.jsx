import React from 'react'
import logo from '../assets/snuc_logo.png'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div className="flex justify-start bg-white text-black p-6 gap-x-8 shadow-xl">
        <a href="https://www.snuchennai.edu.in"><img src={logo} alt="SNUC Logo" className="h-7" /></a>
        <Link to="/linkedin_posts"><p className="text-xl hover:underline">Linkedin</p></Link>
        <Link to="/instagram_posts"><p className="text-xl hover:underline">Instagram</p></Link>
    </div>
  )
}

export default Header