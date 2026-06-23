import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Profiles(){
  const [profiles, setProfiles] = useState([])

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

  return (
    <div className="content-with-side p-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl mb-6 text-center">Choose Profile</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-center">
          {displayProfiles.map(p=> (
            <Link key={p.id} to={`/profile/demo`} className="p-6 bg-gray-800 rounded hover:bg-gray-700 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gray-700 rounded-full mb-3 flex items-center justify-center text-xl font-bold">{p.name ? p.name[0] : 'P'}</div>
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="text-sm text-gray-400 mt-2">{p.description || 'Theme'}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
