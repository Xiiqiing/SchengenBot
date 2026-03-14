import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A84FF 0%, #0051A8 100%)',
          borderRadius: 36,
          fontSize: 84,
          fontWeight: 700,
          color: 'white',
        }}
      >
        SB
      </div>
    ),
    {
      ...size,
    }
  );
}
