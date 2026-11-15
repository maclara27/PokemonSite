import React from 'react'

interface StatItem {
  name: string
  label: string
  value: number
}

interface NaturalistRadarProps {
  stats: {
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }
  accentColor?: string
}

export const NaturalistRadar: React.FC<NaturalistRadarProps> = ({
  stats,
  accentColor = 'var(--stamp-red)',
}) => {
  const statList: StatItem[] = [
    { name: 'hp', label: 'HP', value: stats.hp },
    { name: 'attack', label: 'Ataque', value: stats.attack },
    { name: 'defense', label: 'Defesa', value: stats.defense },
    { name: 'speed', label: 'Velocidade', value: stats.speed },
    { name: 'specialDefense', label: 'Def. Esp.', value: stats.specialDefense },
    { name: 'specialAttack', label: 'Atq. Esp.', value: stats.specialAttack },
  ]

  const size = 320
  const center = size / 2
  const maxRadius = 100
  const maxValue = 160 // Base máxima padrão para escala proporcional

  const numAxes = statList.length
  const angleStep = (Math.PI * 2) / numAxes

  // Calcula coordenadas dos vértices do polígono
  const points = statList.map((stat, i) => {
    const angle = i * angleStep - Math.PI / 2
    const ratio = Math.min(Math.max(stat.value / maxValue, 0.15), 1)
    const r = ratio * maxRadius
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y, value: stat.value, label: stat.label, angle }
  })

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ')

  // Níveis dos círculos de compasso (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{
          width: '100%',
          maxWidth: '320px',
          height: 'auto',
          overflow: 'visible',
          filter: 'drop-shadow(0 2px 4px rgba(42, 33, 27, 0.08))',
        }}
        aria-label="Diagrama astrolábio dos atributos de combate"
      >
        <defs>
          {/* Textura de aquarela para o preenchimento */}
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Círculos concêntricos de bússola / compasso náutico */}
        {gridLevels.map((lvl, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={maxRadius * lvl}
            fill="none"
            stroke="var(--paper-border)"
            strokeWidth={lvl === 1 ? '1.5' : '1'}
            strokeDasharray={lvl === 1 ? 'none' : '3 3'}
            opacity="0.85"
          />
        ))}

        {/* Eixos radiais do astrolábio */}
        {statList.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2
          const x2 = center + maxRadius * Math.cos(angle)
          const y2 = center + maxRadius * Math.sin(angle)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="var(--paper-crease)"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.75"
            />
          )
        })}

        {/* Polígono dos atributos do Pokémon */}
        <polygon
          points={polygonPath}
          fill="url(#radarFill)"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Vértices com tinta e rótulos manuscritos */}
        {points.map((p, i) => {
          // Posição para o texto ao redor do radar
          const labelDist = maxRadius + 24
          const lx = center + labelDist * Math.cos(p.angle)
          const ly = center + labelDist * Math.sin(p.angle) + 4

          return (
            <g key={i}>
              {/* Ponto no vértice */}
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill={accentColor}
                stroke="var(--paper-card)"
                strokeWidth="1.5"
              />

              {/* Rótulo do atributo com fonte manuscrita */}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font-hand)',
                  fontSize: '15px',
                  fontWeight: '700',
                  fill: 'var(--ink-primary)',
                }}
              >
                {p.label}
              </text>

              {/* Valor numérico em destaque */}
              <text
                x={lx}
                y={ly + 13}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '11px',
                  fontWeight: '700',
                  fill: 'var(--ink-secondary)',
                }}
              >
                {p.value}
              </text>
            </g>
          )
        })}

        {/* Rosa dos ventos no centro */}
        <circle cx={center} cy={center} r="3" fill="var(--ink-secondary)" />
      </svg>
      <span className="handwritten" style={{ fontSize: '1.1rem', marginTop: '0.25rem', opacity: 0.9 }}>
        ~ Rosa dos Ventos: Atributos Anatômicos ~
      </span>
    </div>
  )
}

