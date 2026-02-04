const fallbackAvatarSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Fallback avatar">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f5d6b0" />
      <stop offset="1" stop-color="#cfa36d" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="100" fill="url(#bg)" />
  <circle cx="100" cy="78" r="42" fill="#ffffff" />
  <path d="M42 160c8-32 42-48 58-48s50 16 58 48" fill="#ffffff" />
  <path d="M48 86h104c0 18-14 32-32 32H80c-18 0-32-14-32-32z" fill="#1f2933" />
  <rect x="62" y="70" width="76" height="16" rx="8" fill="#0b0f12" />
  <circle cx="86" cy="84" r="4" fill="#ffffff" />
  <circle cx="114" cy="84" r="4" fill="#ffffff" />
</svg>
`;

export const loader = () => {
  return new Response(fallbackAvatarSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
