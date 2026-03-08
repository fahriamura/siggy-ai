/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // ── Images ────────────────────────────────────────────────
  images: {
    // Add external domains here if you host sprites/backgrounds remotely.
    // e.g. { protocol: 'https', hostname: 'cdn.yoursite.com' }
    remotePatterns: [],

    // Allow PNG sprites to be served at full quality
    formats: ['image/avif', 'image/webp'],
  },

  // ── HTTP Cache Headers ────────────────────────────────────
  async headers() {
    return [
      {
        // Immutable cache for audio SFX files (content-hashed filenames recommended)
        source: '/sfx/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Short-lived cache for character sprites (you may swap them out)
        source: '/characters/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
      {
        // Backgrounds and font assets
        source: '/backgrounds/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800' },
        ],
      },
      {
        // Streaming chat endpoint — never cache SSE
        source: '/api/chat',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },

  // ── Webpack ───────────────────────────────────────────────
  webpack(config, { isServer }) {
    // Howler.js uses the Web Audio API — exclude it from the server bundle
    if (isServer) {
      config.externals = [...(config.externals ?? []), 'howler'];
    }

    // Allow importing audio files as URLs (optional — useful for typed imports)
    config.module.rules.push({
      test: /\.(mp3|ogg|wav|flac)$/i,
      type: 'asset/resource',
      generator: { filename: 'static/media/[name].[hash][ext]' },
    });

    return config;
  },
};

module.exports = nextConfig;