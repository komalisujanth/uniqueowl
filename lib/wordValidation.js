// Validates that a word is real and not gibberish
// Rules: letters only, must have vowels, no 5+ consecutive consonants
export const isValidWord = async (word) => {
  if (!word || word.trim().length === 0) return { valid: false, reason: 'Please enter a word' };
  
  const trimmed = word.trim();
  
  // Letters only — no numbers, spaces, special characters
  if (!/^[a-zA-Z ]+$/.test(trimmed)) {
    return { valid: false, reason: 'Letters only — no numbers or special characters' };
}

  // Min 2 characters
  if (trimmed.length < 2) {
    return { valid: false, reason: 'Word must be at least 2 letters' };
  }

  // Max 20 characters
  if (trimmed.length > 20) {
    return { valid: false, reason: 'Word must be 20 characters or less' };
  }

  const lower = trimmed.toLowerCase();

  // Must have at least one vowel (unless very short like "by", "gym", "why")
  if (lower.length > 3 && !/[aeiou]/.test(lower)) {
    return { valid: false, reason: 'That doesn\'t look like a real word — try again!' };
  }

  // No 5+ consecutive consonants
  if (/[^aeiou]{5,}/i.test(lower)) {
    return { valid: false, reason: 'That doesn\'t look like a real word — try again!' };
  }

  // Check dictionary API for real words
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lower)}`);
    if (res.ok) return { valid: true }; // Found in dictionary
    
    // Not in dictionary — check if it passes gibberish filter (proper noun / brand name)
    // If it has vowels and no crazy consonant clusters, accept it
    if (/[aeiou]/i.test(lower) && !/[^aeiou]{4,}/i.test(lower)) {
      return { valid: true }; // Likely a proper noun like PUBG, McDonalds
    }

    return { valid: false, reason: 'That doesn\'t look like a real word — try again!' };
  } catch {
    // If dictionary API fails, fall back to gibberish filter only
    return { valid: true };
  }
};

// Score word rarity for Big Brains room
const COMMON_WORDS = new Set([
  'the','be','to','of','and','a','in','that','have','it','for','not','on','with','he','as','you',
  'do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my',
  'one','all','would','there','their','what','so','up','out','if','about','who','get','which',
  'go','me','when','make','can','like','time','no','just','him','know','take','people','into',
  'year','your','good','some','could','them','see','other','than','then','now','look','only',
  'come','its','over','think','also','back','after','use','two','how','our','work','first','well',
  'way','even','new','want','because','any','these','give','day','most','us','apple','cat','dog',
  'run','walk','talk','eat','drink','sleep','happy','sad','big','small','old','new','good','bad',
  'red','blue','green','black','white','house','car','book','hand','eye','day','night','sun','moon'
]);

export const scoreWordRarity = (word) => {
  const lower = word.toLowerCase().trim();
  if (COMMON_WORDS.has(lower)) return 1;
  if (lower.length <= 3) return 3;
  if (lower.length <= 5) return 6;
  if (lower.length <= 8) return 10;
  return 15;
};
