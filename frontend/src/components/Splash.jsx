import React from 'react'
import { playPop } from '../lib/sound'

export default function Splash({ onFinish }){
  // require explicit click to dismiss; no auto-hide
  const handleClick = async ()=>{
    await playPop()
    if(onFinish) onFinish()
  }

  return (
    <div className="splash" role="dialog" aria-label="Intro">
      <div className="splash-content" onClick={handleClick}>
        <div className="splash-text">ASHWANTHHH!</div>
        <div className="splash-sub">Click to continue</div>
      </div>
    </div>
  )
}
