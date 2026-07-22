import sanitizeHtml from 'sanitize-html';

const RICH_TEXT_ALLOWED_TAGS = [
  'p',
  'span',
  'br',
  'strong',
  'em',
  'u',
  's',
  'sub',
  'sup',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'a',
  'img',
];

const RICH_TEXT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  '*': ['style', 'class'],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
};

const RICH_TEXT_ALLOWED_STYLES: { [prop: string]: RegExp[] } = {
  color: [/.*/],
  'background-color': [/.*/],
  'font-size': [/.*/],
  'font-family': [/.*/],
  'font-weight': [/.*/],
  'font-style': [/.*/],
  'text-decoration': [/.*/],
  'text-align': [/.*/],
  'vertical-align': [/.*/],
  'line-height': [/.*/],
  'letter-spacing': [/.*/],
  'word-spacing': [/.*/],
  padding: [/.*/],
  margin: [/.*/],
  'text-indent': [/.*/],
};

const DANGEROUS_PATTERNS = [
  /<script\b/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /<iframe\b/i,
  /<embed\b/i,
  /<object\b/i,
  /<form\b/i,
  /<input\b/i,
  /<button\b/i,
  /<link\b/i,
  /<svg\b/i,
  /<foreignObject\b/i,
  /<animate\b/i,
  /<animateTransform\b/i,
  /<animateMotion\b/i,
  // CSS-based attacks
  /\\75rl/i, // CSS escape for url()
  /position\s*:\s*fixed/i,
  /position\s*:\s*sticky/i,
];

export function sanitizeRichTextForRender(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: RICH_TEXT_ALLOWED_TAGS,
    allowedAttributes: RICH_TEXT_ALLOWED_ATTRIBUTES,
    allowedStyles: {
      '*': RICH_TEXT_ALLOWED_STYLES,
    },
    selfClosing: ['br', 'img'],
    allowProtocolRelative: true,
  });
}

export function isSafeRichText(html: string): boolean {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(html)) {
      return false;
    }
  }
  return true;
}
