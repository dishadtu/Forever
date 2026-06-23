import React, {useEffect, useRef} from 'react'
import Hls from 'hls.js'

export default function VideoPlayer({src, poster, className = '', previewOnHover = false, autoPlay = false, onClick}){
  const videoRef = useRef()
  const wrapperRef = useRef()
  const hlsRef = useRef()

  useEffect(()=>{
    const video = videoRef.current
    if(!video || !src) return

    if(hlsRef.current){
      try{ hlsRef.current.destroy() }catch(e){}
      hlsRef.current = null
    }

    if(Hls.isSupported() && src.endsWith('.m3u8')){
      const hls = new Hls()
      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, ()=>{
        if(autoPlay) video.play().catch(()=>{})
      })
      return ()=>{ hls.destroy() }
    } else {
      video.src = src
      if(autoPlay) video.play().catch(()=>{})
    }
  },[src, autoPlay])

  useEffect(()=>{
    const video = videoRef.current
    const wrap = wrapperRef.current
    if(!video || !wrap || !previewOnHover) return

    const handleEnter = ()=>{
      video.muted = true
      video.controls = false
      video.play().catch(()=>{})
    }
    const handleLeave = ()=>{
      try{ video.pause() }catch(e){}
      try{ video.currentTime = 0 }catch(e){}
    }

    wrap.addEventListener('mouseenter', handleEnter)
    wrap.addEventListener('mouseleave', handleLeave)

    // touch support: don't autoplay on most touch devices; keep handlers for optional previews
    wrap.addEventListener('touchstart', handleEnter)
    wrap.addEventListener('touchend', handleLeave)

    return ()=>{
      wrap.removeEventListener('mouseenter', handleEnter)
      wrap.removeEventListener('mouseleave', handleLeave)
      wrap.removeEventListener('touchstart', handleEnter)
      wrap.removeEventListener('touchend', handleLeave)
    }
  },[previewOnHover])

  return (
    <div
      ref={wrapperRef}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={"bg-black rounded overflow-hidden " + (onClick ? 'cursor-pointer ' : '') + className}
    >
      <video ref={videoRef} controls={!previewOnHover && autoPlay} poster={poster} className="w-full h-auto" />
    </div>
  )
}
