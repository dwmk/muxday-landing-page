// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { motion } from 'framer-motion';
import { Auth } from './components/Auth';
import { Feed } from './components/Feed';
import { Messages } from './components/Messages';
import { Gazebos } from './components/Gazebos';
import { Profile } from './components/Profile';
import { Search } from './components/Search';
import { Settings } from './components/Settings';
import { CustomPage } from './components/CustomPage';
import { Stats } from './components/Stats';
import { Status, StatusArchive } from './components/Status';
import { Notifications } from './components/Notifications';
import { Home, MessageSquare, User, Search as SearchIcon, Bell, Archive, X, MessagesSquare } from 'lucide-react';
import { supabase } from './lib/supabase';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

type ViewType = 'feed' | 'messages' | 'profile' | 'settings' | 'page' | 'stats' | 'communities';

const SVG_PATH = "M2 17.5A4.5 4.5 0 0 1 6.5 13h2.7c.63 0 .945 0 1.186.123c.211.107.384.28.491.491c.123.24.123.556.123 1.186v2.7a4.5 4.5 0 1 1-9 0m11-11a4.5 4.5 0 1 1 4.5 4.5h-3.214c-.15 0-.224 0-.287-.007a1.125 1.125 0 0 1-.992-.992C13 9.938 13 9.864 13 9.714z M2 6.5a4.5 4.5 0 0 1 9 0v3c0 .349 0 .523-.038.666a1.13 1.13 0 0 1-.796.796C10.023 11 9.85 11 9.5 11h-3A4.5 4.5 0 0 1 2 6.5m11 8c0-.349 0-.523.038-.666c.104-.388.408-.692.796-.796c.143-.038.317-.038.666-.038h3a4.5 4.5 0 1 1-4.5 4.5z";
const SVG_VIEWBOX = "0 0 24 24";

// --- SPECIAL EVENT CONFIG --- (kept intact)
export const SPECIAL_EVENT_MODE = false;
export const EVENT_MESSAGE = "🎉 HAPPY BIRTHDAY TO THE FOUNDER 🎉";
const EVENT_THEMES = ["https://huanmux.github.io/assets/audio/theme01.mp3", "https://huanmux.github.io/assets/audio/theme02.mp3"];

const Main = () => {
  const [view, setView] = useState<ViewType>('feed');
  const [pageSlug, setPageSlug] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>();
  const [selectedPostId, setSelectedPostId] = useState<string | undefined>(); 
  
  const [pendingGazeboInvite, setPendingGazeboInvite] = useState<string | null>(null);
  const [pendingGazeboId, setPendingGazeboId] = useState<string | null>(null);
  const [initialTab, setInitialTab] = useState<'chats' | 'gazebos'>('chats');
  
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // === Special Event Audio === (kept intact)
  useEffect(() => {
    if (SPECIAL_EVENT_MODE) {
      const randomTrack = EVENT_THEMES[Math.floor(Math.random() * EVENT_THEMES.length)];
      const audio = new Audio(randomTrack);
      audio.volume = 0.3;
      audio.play().catch(e => console.log("Audio autoplay blocked until interaction"));
    }
  }, []);

  // === Notification State === (kept intact)
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStatusArchive, setShowStatusArchive] = useState(false);

  // === COMPREHENSIVE URL ROUTING === (kept 100% intact, only updated reserved words list)
  useEffect(() => {
    const handleRouting = async () => {
      const path = location.pathname;
      const search = new URLSearchParams(location.search);
      
      const pathInviteMatch = path.match(/^\/invite\/([a-zA-Z0-9-]{3,20})$/);
      const queryInvite = search.get('invite');
      const inviteCode = pathInviteMatch ? pathInviteMatch[1] : queryInvite;

      if (inviteCode && user) {
        setPendingGazeboInvite(inviteCode);
        setView('messages');
        setInitialTab('gazebos');
        if (pathInviteMatch) navigate('/message', { replace: true }); 
        return;
      }

      const pathGazeboMatch = path.match(/^\/gazebo\/?([a-zA-Z0-9-]{0,})?$/);
      const queryGazeboId = search.get('gazebo');
      const gazeboId = pathGazeboMatch ? pathGazeboMatch[1] : queryGazeboId;

      if ((gazeboId || pathGazeboMatch) && user) {
        setInitialTab('gazebos');
        if (gazeboId) setPendingGazeboId(gazeboId);
        setView('messages');
        if (pathGazeboMatch) window.history.replaceState({}, '', '/message');
        return;
      }

      const msgUser = search.get('user');
      if (path === '/message' && msgUser && user) {
        const { data } = await supabase.from('profiles').select('*').eq('username', msgUser).single();
        if (data) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('openDirectMessage', { detail: data }));
          }, 500);
        }
        setView('messages');
        return;
      }

      const statusId = search.get('status');
      if (statusId && user) {
        const { data: statusData } = await supabase
          .from('statuses')
          .select('*, profiles!user_id(*)')
          .eq('id', statusId)
          .single();
        
        if (statusData) {
          const profileWithStatus = {
            ...statusData.profiles,
            statuses: [statusData],
            hasUnseen: false
          };
          window.dispatchEvent(new CustomEvent('openStatusViewer', {
            detail: {
              users: [profileWithStatus],
              initialUserId: statusData.user_id
            }
          }));
          setView('feed'); 
        }
        return;
      }

      const postId = search.get('post');
      if (postId) {
        const { data: postData } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', postId)
          .maybeSingle(); 
        
        if (postData) {
          setSelectedProfileId(postData.user_id);
          setSelectedPostId(postId);
          setView('profile');
          return;
        }
      }

      const usernameQuery = search.get('user');
      if (path === '/' && usernameQuery) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', usernameQuery.toLowerCase())
          .single();
        if (data) {
          setSelectedProfileId(data.id);
          setView('profile');
          return;
        }
      }
      
      if (path === '/message') {
        setView('messages');
        return;
      }
      if (path === '/stats') {
        setView('stats');
        return;
      }
      
      const slugMatch = path.match(/^\/([^/]+)\/?$/);
      if (slugMatch) {
        const rawSlug = slugMatch[1];
        const slug = decodeURIComponent(rawSlug);

        if (!['user', 'invite', 'gazebo', 'message', 'stats', 'settings','communities'].includes(rawSlug.toLowerCase())) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .ilike('username', slug)
            .maybeSingle();

          if (profileData) {
            setSelectedProfileId(profileData.id);
            setView('profile');
            return;
          }

          setView('page');
          setPageSlug(slug);
          return;
        }
      }

      if (path === '/') {
        if (usernameQuery) {
          const decodedUsername = decodeURIComponent(usernameQuery);
          const { data } = await supabase
            .from('profiles')
            .select('id')
            .ilike('username', decodedUsername)
            .maybeSingle();
          
          if (data) {
            setSelectedProfileId(data.id);
            setView('profile');
            return;
          }
        }

        setView('feed');
        setSelectedProfileId(undefined);
        setSelectedPostId(undefined);
      }
    };
    
    handleRouting();
  }, [location.pathname, location.search, user, navigate]);

  // Set theme from profile (kept intact)
  useEffect(() => {
    if (profile?.theme) {
      document.body.className = `theme-${profile.theme}`;
    }
  }, [profile?.theme]);

  // === Notification Fetching and Realtime === (kept 100% intact)
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false);
      setUnreadMessages(msgCount || 0);

      try {
        const { count: notifCount } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('is_read', false);
        setUnreadNotifications(notifCount || 0);
      } catch (error) {
        console.warn("Could not fetch notifications.");
      }
    };

    fetchCounts();

    const handleMessagesRead = () => {
      fetchCounts();
    };
    window.addEventListener('messagesRead', handleMessagesRead);

    const channel = supabase.channel(`user-notifications:${user.id}`);
    
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `recipient_id=eq.${user.id}`
    }, (payload) => {
      if (payload.new.read === false) {
        setUnreadMessages(c => c + 1);
      }
    });

    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `recipient_id=eq.${user.id}`
    }, () => {
      fetchCounts();
    });

    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${user.id}`
    }, () => {
      setUnreadNotifications(n => n + 1);
    });

    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${user.id}`
    }, (payload) => {
      if (payload.old.is_read === false && payload.new.is_read === true) {
        setUnreadNotifications(n => Math.max(0, n - 1));
      }
    });
    
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, [user]);

  // Keep internal navigation working (kept intact)
  useEffect(() => {
    const handler = (e: any) => {
      const profileId = e.detail;
      supabase
        .from('profiles')
        .select('username')
        .eq('id', profileId)
        .single()
        .then(({ data }) => {
          if (data) {
            navigate(`/?user=${data.username}`);
            setSelectedProfileId(profileId);
            setView('profile');
          }
        });
    };
    window.addEventListener('navigateToProfile', handler);
    return () => window.removeEventListener('navigateToProfile', handler);
  }, [navigate]);

  // === ONLINE STATUS UPDATE === (kept intact)
  useEffect(() => {
    if (!user) return;
    const updateLastSeen = async () => {
      await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
    };
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 30000);
    return () => clearInterval(interval);
  }, [user]);

// Close user menu when clicking outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  if (loading) {
    const transition = { duration: 2, ease: "easeInOut" };
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[rgb(var(--color-background))] flex flex-col items-center justify-center text-2xl font-bold text-[rgb(var(--color-text))]"
        style={{
          background: `linear-gradient(to bottom right, rgba(var(--color-surface),0.05), rgba(var(--color-primary),0.05))`,
        }}
      >
        <div className="logo-loading-container w-[150px] h-auto relative mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox={SVG_VIEWBOX} className="logo-svg">
            <defs>
              <clipPath id="logo-clip"><rect id="clip-rect" x="0" y="0" width="100%" height="100%" /></clipPath>
            </defs>
            <path d={SVG_PATH} fill="none" stroke="rgb(var(--color-primary))" strokeWidth="10" strokeOpacity="0.1" />
            <motion.path 
              d={SVG_PATH} 
              fill="rgb(var(--color-primary))" 
              clipPath="url(#logo-clip)" 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={transition}
            />
          </svg>
        </div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          Loading...
        </motion.div>
      </motion.div>
    );
  }

  if (view === 'page' && pageSlug) return <CustomPage slug={pageSlug} />;
  if (view === 'stats') return <Stats />;

  if (!user || !profile) {
    if (view === 'profile' && selectedProfileId) {
      return (
	     <div className="min-h-screen bg-[rgb(var(--color-background))]">
          <div className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox={SVG_VIEWBOX} className="w-[32px] h-[32px] cursor-pointer" onClick={() => navigate('/')}>
                <path d={SVG_PATH} fill="rgb(var(--color-primary))" />
              </svg>
              <a href="/" className="text-[rgb(var(--color-primary))] hover:text-[rgba(var(--color-primary),0.8)] font-bold">← Back to Home</a>
            </div>
          </div>
          <Profile userId={selectedProfileId} initialPostId={selectedPostId} />
        </div>
      );
    }
    return <Auth />;
  }

  const handleMessageUser = (targetProfile: any) => {
    setView('messages');
    setSelectedProfileId(undefined);
    navigate(`/message?user=${targetProfile.username}`);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openDirectMessage', { detail: targetProfile }));
    }, 100);
  };

  const handleSettings = () => {
    setView('settings');
    setSelectedProfileId(undefined);
  };
  
  const handleNotificationsClick = async () => {
    setShowNotifications(true); 
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      setUnreadNotifications(0);
    } catch (error) { console.warn("Could not mark notifications as read."); }
  };

  // --- MOBILE NAV CONFIG (kept + refined) ---
  const MOBILE_NAV_ITEMS = [
    { 
      icon: Home, 
      label: 'Feed', 
      isActive: view === 'feed',
      action: () => { setView('feed'); setSelectedProfileId(undefined); setSelectedPostId(undefined); navigate('/'); }
    },
    { 
      icon: MessageSquare, 
      label: 'Messages', 
      isActive: view === 'messages',
      badge: unreadMessages,
      action: () => { setView('messages'); setSelectedProfileId(undefined); setSelectedPostId(undefined); navigate('/message'); }
    },
    { icon: MessagesSquare,
       label: 'Communities',
        action: () => { setView('communities');
           setSelectedProfileId(undefined);
            setSelectedPostId(undefined);
             navigate('/communities'); },
              isActive: view === 'communities' },
    { 
      icon: User, 
      label: 'Profile', 
      isActive: view === 'profile' && (!selectedProfileId || selectedProfileId === user.id),
      action: () => { if (!profile?.username) return; navigate(`/?user=${profile.username}`); setSelectedProfileId(undefined); setView('profile'); }
    },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      {/* MODERN TOP NAV – DISTINCT DESKTOP + MOBILE LAYOUT */}
      <nav className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between px-4 h-14">
          {/* Logo – always goes to Feed */}
          <div 
            onClick={() => { setView('feed'); setSelectedProfileId(undefined); setSelectedPostId(undefined); navigate('/'); }}
            className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
          >
            <path d={SVG_PATH} fill="rgb(var(--color-primary))" />
          </div>

          {/* DESKTOP TABS – clean pill-style main tabs (Feed / Messages / Profile) */}
          <div className="hidden md:flex items-center bg-[rgb(var(--color-surface-hover))] rounded-3xl p-1 shadow-inner mx-auto">
            <motion.button
              onClick={() => { setView('feed'); setSelectedProfileId(undefined); setSelectedPostId(undefined); navigate('/'); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-3xl font-medium text-sm transition-all ${view === 'feed' ? 'bg-white shadow text-[rgb(var(--color-primary))]' : 'hover:bg-white/70 text-[rgb(var(--color-text-secondary))]'}`}
            >
              <Home size={19} /> Feed
            </motion.button>

            <motion.button
              onClick={() => { setView('messages'); setSelectedProfileId(undefined); setSelectedPostId(undefined); navigate('/message'); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-3xl font-medium text-sm transition-all relative ${view === 'messages' ? 'bg-white shadow text-[rgb(var(--color-primary))]' : 'hover:bg-white/70 text-[rgb(var(--color-text-secondary))]'}`}
            >
              <MessageSquare size={19} />
              Messages
              {unreadMessages > 0 && (
                <div className="absolute -top-0.5 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full min-w-[17px] h-[17px] flex items-center justify-center">
                  {unreadMessages}
                </div>
              )}
            </motion.button>

            <motion.button
              onClick={() => { setView('communities'); setSelectedProfileId(undefined); setSelectedPostId(undefined); navigate('/communities'); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-3xl font-medium text-sm transition-all ${view === 'communities' ? 'bg-white shadow text-[rgb(var(--color-primary))]' : 'hover:bg-white/70 text-[rgb(var(--color-text-secondary))]'}`}
            >
              <MessagesSquare size={19} />
              Communities
            </motion.button>

            <motion.button
              onClick={() => { if (!profile?.username) return; navigate(`/?user=${profile.username}`); setSelectedProfileId(undefined); setView('profile'); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-3xl font-medium text-sm transition-all ${view === 'profile' && (!selectedProfileId || selectedProfileId === user.id) ? 'bg-white shadow text-[rgb(var(--color-primary))]' : 'hover:bg-white/70 text-[rgb(var(--color-text-secondary))]'}`}
            >
              <User size={19} />
              Profile
            </motion.button>
          </div>

          {/* RIGHT CONTROLS – Search + Separate Notifications button + quick profile avatar */}
          <div className="flex items-center gap-1">
            <motion.button 
              onClick={() => setShowSearch(true)} 
              className="p-3 rounded-2xl hover:bg-[rgb(var(--color-surface-hover))] transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SearchIcon size={20} className="text-[rgb(var(--color-text-secondary))]" />
            </motion.button>

            <motion.button 
              onClick={handleNotificationsClick}
              className="p-3 rounded-2xl hover:bg-[rgb(var(--color-surface-hover))] transition relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} className="text-[rgb(var(--color-text-secondary))]" />
              {unreadNotifications > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold ring-2 ring-[rgb(var(--color-surface))]">
                  •
                </motion.span>
              )}
            </motion.button>

            {/* User Avatar with Dropdown Menu */}
            {profile && (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="w-8 h-8 rounded-2xl overflow-hidden cursor-pointer border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))] transition flex items-center justify-center"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="You" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[rgb(var(--color-primary))/10 flex items-center justify-center text-[rgb(var(--color-primary))]">
                      <User size={17} />
                    </div>
                  )}
                </motion.button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[rgb(var(--color-surface))] rounded-2xl shadow-2xl border border-[rgb(var(--color-border))] py-2 z-[60] overflow-hidden">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (profile?.username) {
                          navigate(`/?user=${profile.username}`);
                          setSelectedProfileId(undefined);
                          setView('profile');
                        }
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[rgb(var(--color-surface-hover))] flex items-center gap-3 text-[rgb(var(--color-text))]"
                    >
                      <User size={18} />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowStatusArchive(true);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[rgb(var(--color-surface-hover))] flex items-center gap-3 text-[rgb(var(--color-text))]"
                    >
                      <Archive size={18} />
                      Status Archive
                    </button>

                    <div className="border-t border-[rgb(var(--color-border))] my-1" />

                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await supabase.auth.signOut();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[rgb(var(--color-surface-hover))] flex items-center gap-3 text-red-500"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="h-[calc(100vh-3.5rem)] overflow-auto pb-20 md:pb-0">
        {view === 'feed' && <Feed />}
        {view === 'messages' && (
          <Messages 
            initialInviteCode={pendingGazeboInvite} 
            onInviteHandled={() => setPendingGazeboInvite(null)} 
            initialTab={initialTab}
            initialGazeboId={pendingGazeboId}
          />
        )}
        {view === 'communities' && (
  <Gazebos 
    initialInviteCode={pendingGazeboInvite} 
    onInviteHandled={() => setPendingGazeboInvite(null)} 
    initialGazeboId={pendingGazeboId}
  />
)}
        {view === 'profile' && (
          <Profile 
            key={selectedProfileId || 'own-profile'}
            userId={selectedProfileId} 
            initialPostId={selectedPostId}
            onMessage={handleMessageUser} 
            onSettings={!selectedProfileId || selectedProfileId === user.id ? handleSettings : undefined} 
          />
        )}
        {view === 'settings' && <Settings />}
        {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
{showStatusArchive && (
          <div 
            className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4"
            onClick={() => setShowStatusArchive(false)}
          >
            <div 
              className="bg-[rgb(var(--color-surface))] w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden border border-[rgb(var(--color-border))]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-[rgb(var(--color-border))] flex justify-between items-center">
                <h2 className="font-bold text-xl text-[rgb(var(--color-text))]">Status Archive</h2>
                <button 
                  onClick={() => setShowStatusArchive(false)}
                  className="p-2 hover:bg-[rgb(var(--color-surface-hover))] rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* The actual archive component */}
              <StatusArchive />
            </div>
          </div>
        )}
        {showSearch && <Search onClose={() => setShowSearch(false)} />}
      </main>

      {/* MOBILE BOTTOM NAV – refined, comfortable, always visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(var(--color-surface),0.95)] backdrop-blur-lg border-t border-[rgb(var(--color-border))] md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {MOBILE_NAV_ITEMS.map((item, index) => (
            <div 
              key={index} 
              onClick={item.action} 
              className="flex flex-col items-center justify-center w-full h-full relative cursor-pointer transition-all active:scale-95"
            >
              {item.isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute top-1 w-11 h-9 bg-[rgba(var(--color-primary),0.12)] rounded-2xl"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <div className={`relative p-2 transition-colors ${item.isActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-secondary))]'}`}>
                <item.icon size={24} strokeWidth={item.isActive ? 2.75 : 2} />
                {!!item.badge && item.badge > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-px -right-px bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full">
                    {item.badge}
                  </motion.span>
                )}
              </div>
              <span className={`text-xs mt-0.5 font-medium ${item.isActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-secondary))]'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {SPECIAL_EVENT_MODE && (
        <div className="fixed bottom-0 left-0 w-full bg-black text-white z-[100] h-8 flex items-center overflow-hidden border-t border-[rgb(var(--color-accent))]">
          <div className="whitespace-nowrap animate-marquee font-bold uppercase tracking-widest text-sm">
            {EVENT_MESSAGE} &nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp; {EVENT_MESSAGE} &nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp; {EVENT_MESSAGE}
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/app">
        <Main />
        <Status />
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;