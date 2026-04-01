const adjectives = [
  'aqua', 'neon', 'cyber', 'quantum', 'digital', 'shadow', 'electric', 
  'phantom', 'lunar', 'solar', 'stellar', 'cosmic', 'frozen', 'burning',
  'silent', 'wild', 'rapid', 'steady', 'bright', 'dark'
];

const nouns = [
  'wolf', 'ghost', 'pulse', 'wave', 'drift', 'spark', 'cipher',
  'nova', 'star', 'moon', 'sun', 'comet', 'meteor', 'nebula',
  'frost', 'flame', 'storm', 'breeze', 'shadow', 'light'
];

export function generateRoomCode(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.floor(Math.random() * 9) + 1;
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${num}-${noun}`;
}

export function isValidRoomCode(code: string): boolean {
  const pattern = /^[a-z]+-\d+-[a-z]+$/;
  return pattern.test(code);
}
