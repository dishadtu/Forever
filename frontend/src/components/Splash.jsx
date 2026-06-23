import React, { useEffect } from 'react'

export default function Splash({ onFinish }){
  // require explicit click to dismiss; no auto-hide
  return (
    <div className="splash" role="dialog" aria-label="Intro">
      <div className="splash-content" onClick={() => onFinish && onFinish()}>
        <div className="splash-text">ASHWANTHHH!</div>
        <div className="splash-sub">Click to continue</div>
      </div>
    </div>
  )
}
