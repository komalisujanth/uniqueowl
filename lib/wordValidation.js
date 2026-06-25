export const isValidWord = async (input) => {
  if (!input || input.trim().length === 0) return { valid: false, reason: 'Please enter a word' };
  const trimmed = input.trim();
  if (!/^[a-zA-Z ]+$/.test(trimmed)) return { valid: false, reason: 'Letters only — no numbers or special characters' };
  if (trimmed.replace(/\s/g, '').length < 2) return { valid: false, reason: 'Word must be at least 2 letters' };
  if (trimmed.length > 20) return { valid: false, reason: 'Must be 20 characters or less' };

  const words = trimmed.trim().split(/\s+/).filter(w => w.length > 0);

  for (const word of words) {
    const lower = word.toLowerCase();
    // Reject all same letter repeated
    if (/^(.)\1+$/.test(lower)) return { valid: false, reason: `"${word}" doesn't look like a real word — try again!` };
    // Reject if longer than 3 chars with zero vowels
    if (lower.length > 3 && !/[aeiou]/i.test(lower)) return { valid: false, reason: `"${word}" doesn't look like a real word — try again!` };
    // Reject 6+ consecutive consonants
    if (/[^aeiou\s]{6,}/i.test(lower)) return { valid: false, reason: `"${word}" doesn't look like a real word — try again!` };
  }

  return { valid: true };
};

const COMMON_WORDS = new Set(['the','be','to','of','and','a','in','that','have','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us','apple','cat','dog','run','walk','talk','eat','drink','sleep','happy','sad','big','small','old','red','blue','green','black','white','house','car','book','sun','moon','star','tree','yes','no','ok','silver','screen','movie','film','gold','light','dark','night','hot','cold']);

export const scoreWordRarity = (input) => {
  const words = input.toLowerCase().trim().split(/\s+/);
  let total = 0;
  for (const w of words) {
    if (COMMON_WORDS.has(w)) total += 1;
    else if (w.length <= 3) total += 3;
    else if (w.length <= 5) total += 6;
    else if (w.length <= 8) total += 10;
    else total += 15;
  }
  if (words.length > 1) total += words.length * 3;
  return total;
};