export const toMin = (t) => {
    const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!m) return 0
    let hh = parseInt(m[1], 10)
    const mm = parseInt(m[2], 10)
    const ap = m[3].toUpperCase()
    if (ap === 'PM' && hh !== 12) hh += 12
    if (ap === 'AM' && hh === 12) hh = 0
    return hh * 60 + mm
}

export const bucketTime = (mins) => {
    if (mins >= 300 && mins < 720) return 'MORNING'
    if (mins >= 720 && mins < 1020) return 'AFTERNOON'
    if (mins >= 1020 && mins < 1260) return 'EVENING'
    return 'NIGHT'
}

export const minsToHHMM = (mins) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
