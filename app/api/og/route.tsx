import { ImageResponse } from '@vercel/og';
import { getProfile } from '@/lib/get-profile';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username');
  if (!username) return new Response('Missing username', { status: 400 });

  const profile = await getProfile(username);
  if (!profile) return new Response('Profile not found', { status: 404 });

  const avatarUrl =
    profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=1f2937&color=fff&size=200`;

  const bannerUrl = profile.banner_url;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#18181b',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Banner */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            backgroundColor: '#27272a',
            overflow: 'hidden',
          }}
        >
          {bannerUrl && (
            <img
              src={bannerUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              alt="Banner"
            />
          )}
        </div>

        {/* Avatar */}
        <div
          style={{
            position: 'absolute',
            top: '280px',
            left: '50px',
            border: '8px solid #18181b',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <img
            src={avatarUrl}
            width="200"
            height="200"
            style={{ borderRadius: '9999px' }}
            alt="Avatar"
          />
        </div>

        {/* Content */}
        <div
          style={{
            marginTop: '180px',
            padding: '0 48px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '60px', margin: 0 }}>{profile.display_name}</h1>
            {profile.verified && <span style={{ fontSize: '48px' }}>✅</span>}
          </div>
          <p
            style={{
              fontSize: '40px',
              marginTop: '8px',
              color: '#a1a1aa',
            }}
          >
            @{profile.username}
          </p>

          <p
            style={{
              fontSize: '30px',
              marginTop: '48px',
              maxWidth: '700px',
              lineHeight: '1.3',
            }}
          >
            {profile.bio || 'No bio provided yet.'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '60px',
              marginTop: '64px',
              fontSize: '36px',
            }}
          >
            <div>
              <strong>{profile.followers}</strong> Followers
            </div>
            <div>
              <strong>{profile.following}</strong> Following
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}