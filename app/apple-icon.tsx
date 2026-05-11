import { ImageResponse } from 'next/og';

export const runtime = 'edge';

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
          background: 'black',
          borderRadius: '32px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            background: 'white',
            borderRadius: '12px',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
