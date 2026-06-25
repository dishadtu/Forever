import React, { useEffect, useRef, useState } from 'react'
import { playPop } from '../lib/sound'

export default function Splash({ onFinish }){
  const playedRef = useRef(false)
  const [bang, setBang] = useState(false)

  // Play the pop sound as soon as the splash appears (once per mount/session)
  useEffect(()=>{
    let mounted = true
    const run = async ()=>{
      if(playedRef.current) return
      playedRef.current = true
      setBang(true)
      try{ await playPop() }catch(e){}
      // keep the bang class briefly for the visual impact
      setTimeout(()=>{ if(mounted) setBang(false) }, 900)
    }
    run()
    return ()=>{ mounted = false }
  }, [])

  // require explicit click to dismiss; clicking does not replay the sound
  const handleClick = ()=>{
    if(onFinish) onFinish()
  }

  return (
    <div className={"splash" + (bang ? ' bang' : '')} role="dialog" aria-label="Intro">
      <div className="splash-content" onClick={handleClick}>
        <div className="splash-text">ASHWANTHHH!</div>
        <div className="splash-sub">Click to continue</div>
      </div>
    </div>
  )
}
