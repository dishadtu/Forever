import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Profiles(){
  const [profiles, setProfiles] = useState([])
  
  const navigate = useNavigate()

  useEffect(()=>{
    axios.get('/api/profiles').then(r=>setProfiles(r.data)).catch(()=>{
      setProfiles([])
    })
  },[])
  // if API returns no profiles, show placeholders and ensure demo is centered
  const displayProfiles = profiles.length ? profiles : (()=>{
    const demo = { id: 'demo', name: 'US <3', description: 'A demo profile' }
    const placeholders = [
      { id: 'ph1', name: 'Profile A', description: 'Placeholder' },
      { id: 'ph2', name: 'Profile B', description: 'Placeholder' },
      demo,
      { id: 'ph3', name: 'Profile C', description: 'Placeholder' },
      { id: 'ph4', name: 'Profile D', description: 'Placeholder' }
    ]
    return placeholders
  })()

  const onClickProfile = (p, ev)=>{
    ev && ev.preventDefault && ev.preventDefault()
    navigate(`/profile/demo`)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="content-with-side p-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl mb-6 text-center">Choose Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-center">
            {displayProfiles.map(p=> (
              <a key={p.id} href={`/profile/demo`} onClick={(e)=>onClickProfile(p,e)} className="group relative overflow-hidden p-6 bg-white rounded shadow border transform transition-transform duration-200 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full mb-3 flex items-center justify-center text-xl font-bold text-gray-800">{p.name ? p.name[0] : 'P'}</div>
                <div className="text-lg font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600 mt-2">{p.description || 'Theme'}</div>
                <div className="absolute inset-0 flex flex-col justify-end items-center p-4 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="text-white text-sm font-medium mb-2">{p.description || 'Demo profile'}</div>
                  <div className="bg-white text-gray-900 text-sm px-3 py-1 rounded">View</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
      {/* no Splash on profile click — navigation happens immediately */}
    </div>
  )
}
