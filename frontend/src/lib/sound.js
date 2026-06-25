const DEFAULT_REMOTE_POP = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'

let cachedSrc = null

async function resolvePopSrc(){
  if(cachedSrc) return cachedSrc
  try{
    // prefer local file if present
    const res = await fetch('/pop.mp3', { method: 'HEAD' })
    if(res && res.ok){ cachedSrc = '/pop.mp3'; return cachedSrc }
  }catch(e){}
  cachedSrc = DEFAULT_REMOTE_POP
  return cachedSrc
}

export async function playPop(){
  const src = await resolvePopSrc()
  try{
    const audio = new Audio(src)
    audio.volume = 0.9
    await audio.play()
    return new Promise((resolve)=>{
      // resolve when audio ends or after 400ms whichever comes first
      const t = setTimeout(()=>{ resolve() }, 400)
      audio.addEventListener('ended', ()=>{ clearTimeout(t); resolve() })
    })
  }catch(e){
    // fallback to short oscillator
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctx()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'triangle'
      o.frequency.value = 700
      g.gain.value = 0
      o.connect(g)
      g.connect(ctx.destination)
      const now = ctx.currentTime
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(0.9, now + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
      o.start(now)
      o.stop(now + 0.2)
      return new Promise((r)=>setTimeout(r,220))
    }catch(err){ return Promise.resolve() }
  }
}

export default { playPop }
