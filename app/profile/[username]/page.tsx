import { getProfile } from '@/lib/get-profile';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const profile = await getProfile(params.username);
  if (!profile) {
    return { title: 'Profile Not Found | MuxDay' };
  }

  const ogImage = `/api/og?username=${encodeURIComponent(params.username)}`;

  return {
    title: `@${profile.username} - MuxDay`,
    description: profile.bio || `View @${profile.username} on MuxDay`,
    openGraph: {
      title: `@${profile.username} - MuxDay`,
      description: profile.bio || `View @${profile.username} on MuxDay`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `@${profile.username} - MuxDay`,
      description: profile.bio || `View @${profile.username} on MuxDay`,
      images: [ogImage],
    },
  };
}

export default async function ProfileEmbedPage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const appUrl = `https://app.muxday.com?user=${encodeURIComponent(profile.username)}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '800px', textAlign: 'center' }}>
        {profile.banner_url && (
          <img
            src={profile.banner_url}
            alt="Banner"
            style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px' }}
          />
        )}

        <div style={{ marginTop: '-80px', display: 'flex', justifyContent: 'center' }}>
          <img
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&size=200`}
            alt="Avatar"
            style={{ width: '180px', height: '180px', borderRadius: '9999px', border: '8px solid #0a0a0a' }}
          />
        </div>

        <h1 style={{ fontSize: '3rem', margin: '20px 0 10px' }}>
          {profile.display_name}
          {profile.verified && ' ✅'}
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#9ca3af', marginBottom: '10px' }}>
          @{profile.username}
        </p>

        <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 30px' }}>
          {profile.bio || 'No bio yet.'}
        </p>

        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '40px' }}>
          <div><strong>{profile.followers}</strong> Followers</div>
          <div><strong>{profile.following}</strong> Following</div>
        </div>

        <a
          href={appUrl}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '16px 48px',
            borderRadius: '9999px',
            textDecoration: 'none',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            display: 'inline-block',
          }}
        >
          Open Profile on MuxDay
        </a>

        <p style={{ marginTop: '30px', color: '#666' }}>
          Redirecting automatically...
        </p>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              window.location.href = "${appUrl}";
            }, 2500);
          `,
        }}
      />
    </div>
  );
}