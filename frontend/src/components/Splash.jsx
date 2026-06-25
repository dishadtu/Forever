import React, { useEffect } from 'react'

export default function Splash({ onFinish }){
  // require explicit click to dismiss; no auto-hide
  const playPop = ()=>{
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctx()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      g.gain.value = 0
      o.connect(g)
      g.connect(ctx.destination)
      const now = ctx.currentTime
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(0.9, now + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
      o.start(now)
      o.stop(now + 0.24)
    }catch(e){ /* ignore audio failures */ }
  }

  const handleClick = ()=>{
    playPop()
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
