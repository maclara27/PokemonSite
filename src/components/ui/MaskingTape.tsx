import React from 'react'

interface MaskingTapeProps {
  position?: 'top-left' | 'top-right' | 'center'
  className?: string
  style?: React.CSSProperties
}

export const MaskingTape: React.FC<MaskingTapeProps> = ({ position = 'center', className = '', style }) => {
  const positionClass = 
    position === 'top-left' ? 'tape-top-left' :
    position === 'top-right' ? 'tape-top-right' : 'tape-center'

  return (
    <div 
      className={`masking-tape ${positionClass} ${className}`} 
      style={style} 
      aria-hidden="true" 
    />
  )
}

