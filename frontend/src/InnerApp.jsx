import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Profiles from './pages/Profiles'
import Profile from './pages/Profile'
import Splash from './components/Splash'

export default function InnerApp(){
  const location = useLocation()
  const [showSplash, setShowSplash] = useState(()=>{
    try{
      return !sessionStorage.getItem('seenSplashSession')
    }catch(e){
      return true
    }
  })

  // show splash only when on root and not yet seen this session
  useEffect(()=>{
    try{
      if(location.pathname === '/' && !sessionStorage.getItem('seenSplashSession')){
        setShowSplash(true)
      }
    }catch(e){
      if(location.pathname === '/') setShowSplash(true)
    }
  },[location.pathname])

  return (
    <>
      {showSplash && location.pathname === '/' && (
        <Splash onFinish={()=>{ try{ sessionStorage.setItem('seenSplashSession','1') }catch(e){}; setShowSplash(false) }} />
      )}
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="side-placeholder left" aria-hidden="true" />
        <div className="side-placeholder right" aria-hidden="true" />
        <header className="p-4 border-b border-gray-800">
          <Link to="/" className="text-2xl font-bold">My Videos</Link>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Profiles/>} />
            <Route path="/profile/:id" element={<Profile/>} />
          </Routes>
        </main>
      </div>
    </>
  )
}
