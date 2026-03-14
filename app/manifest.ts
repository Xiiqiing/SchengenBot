import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SchengenBot',
    short_name: 'SchengenBot',
    description: 'Real-time Schengen visa appointment notification system',
    start_url: '/en',
    display: 'standalone',
    background_color: '#f5f5f7',
    theme_color: '#0071e3',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
