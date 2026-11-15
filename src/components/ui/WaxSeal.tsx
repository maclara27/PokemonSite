import React from 'react'
import { TYPE_TRANSLATIONS } from '../../api/localization'
import { IconCompassStar } from './Icons'

interface WaxSealProps {
  type: string
  size?: 'sm' | 'md'
  className?: string
}

export const WaxSeal: React.FC<WaxSealProps> = ({ type, size = 'md', className = '' }) => {
  const normalized = type.toLowerCase()
  const info = TYPE_TRANSLATIONS[normalized] || { label: type, colorVar: 'var(--ink-secondary)' }

  const paddingStyle = size === 'sm' ? { padding: '0.2rem 0.55rem', fontSize: '0.7rem' } : {}

  return (
    <span
      className={`wax-badge ${className}`}
      style={{
        backgroundColor: info.colorVar,
        ...paddingStyle,
      }}
      title={`Tipo ${info.label}`}
    >
      <IconCompassStar size={size === 'sm' ? 8 : 10} style={{ opacity: 0.85, flexShrink: 0 }} />
      <span>{info.label}</span>
    </span>
  )
}
