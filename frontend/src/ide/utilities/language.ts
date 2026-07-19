// ─── Language detection (mirrors backend) ─────────────────────────────────────

const EXT_LANG: Record<string, string> = {
  ts: 'typescript', tsx: 'tsx', mts: 'typescript',
  js: 'javascript', jsx: 'jsx', mjs: 'javascript', cjs: 'javascript',
  py: 'python', rs: 'rust', go: 'go',
  java: 'java', kt: 'kotlin', scala: 'scala',
  cpp: 'cpp', cc: 'cpp', c: 'c', cs: 'csharp', rb: 'ruby',
  php: 'php', swift: 'swift',
  css: 'css', scss: 'scss', sass: 'sass', less: 'less',
  html: 'html', htm: 'html', vue: 'vue', svelte: 'svelte',
  json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml', xml: 'xml',
  md: 'markdown', mdx: 'mdx',
  sh: 'bash', bash: 'bash', zsh: 'bash',
  sql: 'sql', graphql: 'graphql', gql: 'graphql',
  env: 'dotenv', tf: 'terraform', txt: 'plaintext', log: 'plaintext',
};

export function getLanguage(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower === 'dockerfile' || lower.startsWith('dockerfile.')) return 'dockerfile';
  if (lower === '.env' || lower.startsWith('.env.')) return 'dotenv';
  if (lower === 'makefile') return 'makefile';
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_LANG[ext] ?? 'plaintext';
}

// ─── Language → display colour ────────────────────────────────────────────────

export function getLanguageColor(lang: string): string {
  switch (lang) {
    case 'tsx':        return '#61dafb';
    case 'jsx':        return '#61dafb';
    case 'typescript': return '#3b82f6';
    case 'javascript': return '#f59e0b';
    case 'python':     return '#3b82f6';
    case 'rust':       return '#f97316';
    case 'go':         return '#06b6d4';
    case 'css':
    case 'scss':       return '#a855f7';
    case 'html':       return '#ef4444';
    case 'json':       return '#f59e0b';
    case 'markdown':   return '#94a3b8';
    case 'yaml':
    case 'toml':       return '#84cc16';
    case 'bash':       return '#22c55e';
    case 'sql':        return '#8b5cf6';
    case 'vue':        return '#22c55e';
    case 'svelte':     return '#f97316';
    default:           return '#71717a';
  }
}

// ─── Git status colour ────────────────────────────────────────────────────────

export function getGitStatusColor(status?: string): string | undefined {
  switch (status) {
    case 'modified':   return '#f59e0b';
    case 'added':      return '#22c55e';
    case 'deleted':    return '#ef4444';
    case 'untracked':  return '#94a3b8';
    case 'renamed':    return '#a855f7';
    default:           return undefined;
  }
}
