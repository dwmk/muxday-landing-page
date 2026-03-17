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
      <div tw="flex flex-col w-full h-full bg-zinc-950 text-white">
        {/* Banner */}
        <div tw="relative w-full h-[400px] bg-zinc-800">
          {bannerUrl && (
            <img
              src={bannerUrl}
              tw="w-full h-full object-cover"
              alt="Banner"
            />
          )}
        </div>

        {/* Avatar */}
        <div tw="absolute top-[280px] left-[50px] border-[8px] border-zinc-950 rounded-full overflow-hidden">
          <img
            src={avatarUrl}
            width="200"
            height="200"
            tw="rounded-full"
            alt="Avatar"
          />
        </div>

        {/* Content */}
        <div tw="mt-[180px] px-12 flex flex-col">
          <div tw="flex items-center gap-4">
            <h1 tw="text-6xl m-0">{profile.display_name}</h1>
            {profile.verified && <span tw="text-4xl">✅</span>}
          </div>
          <p tw="text-4xl mt-2 text-zinc-400">@{profile.username}</p>

          <p tw="text-3xl mt-6 max-w-[700px]">
            {profile.bio || 'No bio provided yet.'}
          </p>

          <div tw="flex gap-10 text-4xl mt-8">
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