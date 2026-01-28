import Hls from 'hls.js'
import React, { useEffect, useRef } from 'react'

interface Props {
  src: string
}

const HlsPlayer: React.FC<Props> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // もし src が localhost:8080 で、現在のホストが localhost でない場合、
    // 現在のホスト名に置換する（IPアドレス等でアクセスしている場合への対応）
    let finalSrc = src
    if (typeof window !== 'undefined' && src.includes('localhost:8080')) {
      const currentHostname = window.location.hostname
      if (currentHostname !== 'localhost') {
        finalSrc = src.replace('localhost', currentHostname)
      }
    }

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(finalSrc)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.error('Auto-play blocked:', e))
      })
      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari 等のネイティブ HLS サポート
      video.src = finalSrc
      video.addEventListener('loadedmetadata', () => {
        video.play()
      })
    }
  }, [src])

  return (
    <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        controls
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  )
}

export default HlsPlayer
