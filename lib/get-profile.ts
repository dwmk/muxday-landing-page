import { supabase } from '@/lib/supabase';

export async function getProfile(username: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, banner_url, verified')
    .eq('username', username)
    .single();

  if (error || !profile) return null;

  // Follower / following counts
  const { count: followers } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);

  const { count: following } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  return {
    ...profile,
    followers: followers ?? 0,
    following: following ?? 0,
  };
}