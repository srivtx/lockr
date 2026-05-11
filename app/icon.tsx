import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
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
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            background: 'white',
            borderRadius: '2px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
