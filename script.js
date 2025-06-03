function obfuscateJS(code) {
  const identifiers = [...new Set(code.match(/\b[a-zA-Z_]\w*\b/g))];
  let count = 0;
  const map = {};

  for (const id of identifiers) {
    if (
      ['function', 'var', 'let', 'const', 'if', 'else', 'return', 'console', 'log', 'true', 'false'].includes(id)
    ) continue;
    map[id] = 'v' + count++;
  }

  for (const [original, obfuscated] of Object.entries(map)) {
    const re = new RegExp('\\b' + original + '\\b', 'g');
    code = code.replace(re, obfuscated);
  }

  return code.replace(/\s+/g, ' ').trim();
}

function minifyHTML(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s\s+/g, ' ')
    .trim();
}

function obfuscate() {
  let html = document.getElementById('inputHTML').value;
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const originalJS = match[1];
    const obfuscatedJS = obfuscateJS(originalJS);
    html = html.replace(originalJS, obfuscatedJS);
  }

  const finalHTML = minifyHTML(html);
  document.getElementById('outputHTML').value = finalHTML;
}
