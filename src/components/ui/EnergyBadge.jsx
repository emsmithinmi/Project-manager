import { ENERGY_LEVELS } from '../../lib/constants'

const ENERGY_STYLES = {
  physical:   { bg: '#3d2c2c', text: '#f28b82', icon: '💪' },
  deep_focus: { bg: '#1e2d3d', text: '#89b4fa', icon: '🧠' },
  admin:      { bg: '#1e2d1e', text: '#a8d5a2', icon: '💻' },
  low_energy: { bg: '#2d2d1e', text: '#e9c46a', icon: '🌿' },
  errand:     { bg: '#2a1f3d', text: '#cba6f7', icon: '🛒' },
}

export default function EnergyBadge({ energyLevel, className = '' }) {
  const style = ENERGY_STYLES[energyLevel]
  const def = ENERGY_LEVELS.find(e => e.value === energyLevel)
  if (!style || !def) return null

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${className}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span>{style.icon}</span>
      {def.label}
    </span>
  )
}
