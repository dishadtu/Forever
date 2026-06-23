import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import VideoPlayer from '../components/VideoPlayer'

function VideoCard({video, onSelect}){
  return (
    <div className="bg-gray-800 rounded overflow-hidden cursor-pointer" onClick={()=>onSelect(video)}>
      <div className="relative">
        <img src={video.poster || video.thumbnail || '/placeholder.png'} alt="thumb" className="w-full h-40 object-cover"/>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-40 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-5.197-3.023A1 1 0 008 9.023v5.954a1 1 0 001.555.832l5.197-3.023a1 1 0 000-1.664z" />
            </svg>
          </div>
        </div>
        <div className="absolute left-2 bottom-2 bg-black bg-opacity-50 text-xs px-2 py-1 rounded">{video.duration}</div>
      </div>
      <div className="p-2">
        <div className="font-semibold truncate">{video.title}</div>
      </div>
    </div>
  )
}

export default function Profile(){
  const {id} = useParams()
  const [profile, setProfile] = useState(null)
  const [videos, setVideos] = useState([])
  const [selected, setSelected] = useState(null)
  const [fullVideo, setFullVideo] = useState(null)
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(true)

  useEffect(()=>{
    if(id === 'demo'){
      const demoProfile = { id: 'demo', name: 'US <3', bio: 'A demo profile with sample videos.' }
      const demoVideos = [
        { id: 'vYouMe', title: 'You+Me', url: '/media/You+Me.mp4', poster: null, thumbnail: null, duration: '0:00', description: 'Uploaded clip.' },
        { id: 'v1', title: 'Sample Clip 1', url: '/media/sample1.mp4', poster: '/media/thumb1.jpg', thumbnail: '/media/thumb1.jpg', duration: '0:12', description: 'A short sample clip.' },
        { id: 'v2', title: 'Sample Clip 2', url: '/media/sample2.mp4', poster: '/media/thumb2.jpg', thumbnail: '/media/thumb2.jpg', duration: '0:20', description: 'Another sample clip.' },
        { id: 'v3', title: 'Sample HLS', url: '/media/sample.m3u8', poster: '/media/thumb3.jpg', thumbnail: '/media/thumb3.jpg', duration: '0:45', description: 'HLS sample.' }
      ]
      setProfile(demoProfile)
      setVideos(demoVideos)
      setSelected(demoVideos[0] || null)
      return
    }

    axios.get(`/api/profiles/${id}`).then(r=>setProfile(r.data)).catch(()=>null)
    axios.get(`/api/profiles/${id}/videos`).then(r=>{
      setVideos(r.data)
      setSelected(r.data[0] || null)
    }).catch(()=>setVideos([]))
  },[id])

  useEffect(()=>{
    const m = window.matchMedia('(min-width: 768px)')
    const update = ()=> setIsPreviewEnabled(m.matches)
    update()
    m.addEventListener('change', update)
    return ()=> m.removeEventListener('change', update)
  },[])

  // close modal on Escape
  useEffect(()=>{
    if(!fullVideo) return
    const onKey = (e)=>{ if(e.key === 'Escape') setFullVideo(null) }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[fullVideo])

  if(!profile) return (
    <div className="content-with-side p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center text-gray-300 py-20">Loading profile...</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="content-with-side p-8">
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        <p className="text-sm text-gray-400">{profile.bio}</p>
      </div>

      <div className="content-with-side p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map(v=> (
            <div key={v.id}>
              {isPreviewEnabled ? (
                <div className="bg-gray-800 rounded overflow-hidden shadow-lg group">
                  <div className="relative">
                    <VideoPlayer src={v.url} poster={v.poster} className="w-full h-40 object-cover" previewOnHover onClick={()=>setFullVideo(v)} />
                  </div>
                  <div className="p-3">
                    <div className="font-semibold truncate">{v.title}</div>
                  </div>
                </div>
              ) : (
                <VideoCard video={v} onSelect={(vid)=>setFullVideo(vid)} />
              )}
            </div>
          ))}
        </div>
      </div>
      {fullVideo && (
        <div onClick={()=>setFullVideo(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="w-full max-w-4xl mx-4" onClick={(e)=>e.stopPropagation()}>
            <div className="bg-gray-900 rounded overflow-hidden">
              <div className="p-2 flex justify-end">
                <button onClick={()=>setFullVideo(null)} className="text-white bg-black bg-opacity-30 px-3 py-1 rounded">Close</button>
              </div>
              <VideoPlayer src={fullVideo.url} poster={fullVideo.poster} autoPlay={true} className="w-full" />
              <div className="p-4">
                <h3 className="text-xl font-bold">{fullVideo.title}</h3>
                <p className="text-sm text-gray-400">{fullVideo.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
