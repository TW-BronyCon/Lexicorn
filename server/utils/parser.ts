export interface BlankOccurrence {
  id: string
  name: string
  canonicalName: string
}

export function getCanonicalName(name: string): string {
  // Strip trailing "(Reference)", "(Ref)", "(Reference 1)", etc.
  return name
    .replace(/\s*\((Reference|Ref|reference|ref)(\s+\d+)?\)$/i, '')
    .trim()
}

export function extractBlanks(rawText: string): BlankOccurrence[] {
  const blanks: BlankOccurrence[] = []
  // Matches 【placeholder】 or [placeholder]
  const regex = /【([^】]+)】|\[([^\]]+)\]/g
  let match
  let count = 0

  while ((match = regex.exec(rawText)) !== null) {
    // The placeholder name will be in capture group 1 (if 【...】) or 2 (if [...])
    const name = (match[1] || match[2] || '').trim()
    if (name) {
      blanks.push({
        id: `blank_${count++}`,
        name,
        canonicalName: getCanonicalName(name)
      })
    }
  }

  return blanks
}

export function renderStory(rawText: string, answers: Record<string, string>): string {
  // Replaces all placeholders in rawText with their underlined answers
  // Matches 【placeholder】 or [placeholder]
  const regex = /【([^】]+)】|\[([^\]]+)\]/g
  
  return rawText.replace(regex, (match, p1, p2) => {
    const name = (p1 || p2 || '').trim()
    const canonicalName = getCanonicalName(name)
    const answer = answers[canonicalName]
    
    if (answer !== undefined && answer !== null && answer.trim() !== '') {
      return `<u>${answer}</u>`
    }
    // Return original placeholder if not answered
    return match
  })
}

export function autoIncrementPlaceholders(rawText: string): string {
  const regex = /【([^】]+)】|\[([^\]]+)\]/g
  const matches: {
    start: number
    end: number
    text: string
    bracketType: '【】' | '[]'
    name: string
    isRef: boolean
    refNum: number | null
    cleanName: string
    baseName: string
    numSuffix: number | null
  }[] = []

  let match
  while ((match = regex.exec(rawText)) !== null) {
    const text = match[0]
    const name = (match[1] || match[2] || '').trim()
    const bracketType = text.startsWith('【') ? ('【】' as const) : ('[]' as const)
    
    // Parse name
    const refRegex = /\s*\((Reference|Ref|reference|ref)(?:\s+(\d+))?\)$/i
    const refMatch = name.match(refRegex)
    const isRef = !!refMatch
    const refSuffix = refMatch ? refMatch[0] : ''
    const refNum = refMatch && refMatch[2] ? parseInt(refMatch[2], 10) : null

    const cleanName = isRef ? name.slice(0, name.length - refSuffix.length).trim() : name.trim()

    const numRegex = /\s+(\d+)$/
    const numMatch = cleanName.match(numRegex)
    const baseName = numMatch ? cleanName.slice(0, cleanName.length - numMatch[0].length).trim() : cleanName
    const numSuffix = numMatch ? parseInt(numMatch[1], 10) : null

    matches.push({
      start: match.index,
      end: regex.lastIndex,
      text,
      bracketType,
      name,
      isRef,
      refNum,
      cleanName,
      baseName,
      numSuffix
    })
  }

  // Count non-reference occurrences for each baseName
  const nonRefCounts: Record<string, number> = {}
  matches.forEach(m => {
    if (!m.isRef) {
      nonRefCounts[m.baseName] = (nonRefCounts[m.baseName] || 0) + 1
    }
  })

  // Assign new names
  const nonRefIndices: Record<string, number> = {}
  const newNames = matches.map(m => {
    const totalNonRefs = nonRefCounts[m.baseName] || 0
    if (totalNonRefs <= 1) {
      // No incrementing needed if only 1 occurrence
      return m.name
    }

    if (!m.isRef) {
      nonRefIndices[m.baseName] = (nonRefIndices[m.baseName] || 0) + 1
      const idx = nonRefIndices[m.baseName]
      return `${m.baseName} ${idx}`
    } else {
      // It is a reference. Find target index.
      const targetIdx = m.refNum || m.numSuffix || 1
      return `${m.baseName} ${targetIdx} (Reference)`
    }
  })

  // Reconstruct rawText
  let result = ''
  let lastIdx = 0
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    const newName = newNames[i]
    result += rawText.slice(lastIdx, m.start)
    if (m.bracketType === '【】') {
      result += `【${newName}】`
    } else {
      result += `[${newName}]`
    }
    lastIdx = m.end
  }
  result += rawText.slice(lastIdx)

  return result
}

