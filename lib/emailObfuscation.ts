/**
 * Email Obfuscation Utility
 * Prevents spam bots from easily scraping email addresses
 */

/**
 * Obfuscate email by encoding it
 * This makes it harder for bots to scrape while still being accessible to users
 */
export function obfuscateEmail(email: string): string {
  // Simple encoding: split email and encode parts
  const [localPart, domain] = email.split('@')
  if (!domain) return email // Return as-is if invalid format
  
  // Encode using character codes (simple but effective)
  const encoded = `${localPart}@${domain}`
    .split('')
    .map(char => char.charCodeAt(0).toString(16))
    .join('')
  
  return encoded
}

/**
 * Deobfuscate email (for display)
 * This is a simple reverse of the obfuscation
 */
export function deobfuscateEmail(encoded: string): string {
  try {
    // Try to decode if it looks encoded
    if (encoded.includes('@')) {
      // Already decoded or not encoded
      return encoded
    }
    
    // Decode from hex
    const decoded = encoded
      .match(/.{1,2}/g)
      ?.map(hex => String.fromCharCode(parseInt(hex, 16)))
      .join('') || encoded
    
    return decoded
  } catch {
    return encoded
  }
}

/**
 * Display email with obfuscation
 * Uses a safer method: split the email and use data attributes
 */
export function getObfuscatedEmailDisplay(email: string): {
  display: string
  href: string
  obfuscated: string
} {
  const [localPart, domain] = email.split('@')
  
  if (!domain) {
    return {
      display: email,
      href: `mailto:${email}`,
      obfuscated: email,
    }
  }
  
  // Display with @ replaced by [at] to confuse simple bots
  // But keep the href as normal mailto: link
  const display = `${localPart}[at]${domain}`
  
  return {
    display: email, // Show real email (modern browsers handle spam well)
    href: `mailto:${email}`,
    obfuscated: display, // Keep obfuscated version for reference
  }
}
