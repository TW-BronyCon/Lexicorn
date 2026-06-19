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
