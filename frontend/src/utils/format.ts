// Format currency
export const formatCurrency = (amount: number, currency = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// Get item type icon
export const getItemTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    HOTEL: '🏨',
    ATTRACTION: '🎡',
    RESTAURANT: '🍜',
    TRANSPORT: '🚃',
    ACTIVITY: '🎯',
    OTHER: '📍',
  }
  return icons[type] || '📍'
}

// Get item type label
export const getItemTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    HOTEL: 'Hotel',
    ATTRACTION: 'Attraction',
    RESTAURANT: 'Restaurant',
    TRANSPORT: 'Transport',
    ACTIVITY: 'Activity',
    OTHER: 'Other',
  }
  return labels[type] || type
}

// Get item type color
export const getItemTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    HOTEL: '#8b5cf6',
    ATTRACTION: '#f59e0b',
    RESTAURANT: '#ef4444',
    TRANSPORT: '#3b82f6',
    ACTIVITY: '#22c55e',
    OTHER: '#6b7280',
  }
  return colors[type] || '#6b7280'
}

// Truncate text
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Format distance (meters to km or m)
export const formatDistance = (distance: number): string => {
  if (!distance || distance < 0) return '--'
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)} km`
  }
  return `${distance} m`
}

// Format duration (seconds to hours and minutes)
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '--'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return '< 1m'
  }
}

