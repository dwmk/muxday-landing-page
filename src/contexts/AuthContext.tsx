import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { logSecurityEvent } from '../lib/security';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (newProfile: Profile) => void;
  signInWithDiscord: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (currentUser: User) => {
    // 1. Try to fetch the existing profile
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else {
      // 2. If no profile exists, this is a new OAuth user. Let's create one!
      const metadata = currentUser.user_metadata;
      
      // Discord requires a unique username. We'll strip spaces and add a random number to avoid collisions.
      const safeName = (metadata?.full_name || metadata?.name || 'user').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const randomNum = Math.floor(Math.random() * 10000);
      const username = `${safeName}${randomNum}`;

      const newProfile = {
        id: currentUser.id,
        username: username,
        display_name: metadata?.full_name || metadata?.name || 'Discord User',
        avatar_url: metadata?.avatar_url || ''
      };

      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select()
        .single();

      if (insertError) {
        console.error("Error auto-creating OAuth profile:", insertError);
        setProfile(null);
      } else {
        setProfile(createdProfile);
      }
    }
    setLoading(false);
  };
  
  const updateProfile = (newProfile: Profile) => {
    setProfile(newProfile);
  };

  const signInWithDiscord = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: window.location.origin, // Adjust this if you have a specific callback route
    },
  });
  if (error) throw error;
};


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user); // Notice we pass the whole user object now
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        display_name: displayName,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile, signInWithDiscord }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
