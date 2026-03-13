// Feed.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, Post, uploadMedia } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Send, Edit3, FileText, X, Paperclip, LayoutGrid, Smartphone, Gift, Search } from 'lucide-react';
import { Shots } from './Shots';
import { StatusTray } from './Status';
import { PostItem, AudioPlayer } from './Post'; // Import PostItem and reused AudioPlayer for composer preview
import { motion, AnimatePresence } from 'framer-motion';
import { SPECIAL_EVENT_MODE } from '../App';
import { logSecurityEvent } from '../lib/security';

const SVG_PATH = "M2 17.5A4.5 4.5 0 0 1 6.5 13h2.7c.63 0 .945 0 1.186.123c.211.107.384.28.491.491c.123.24.123.556.123 1.186v2.7a4.5 4.5 0 1 1-9 0m11-11a4.5 4.5 0 1 1 4.5 4.5h-3.214c-.15 0-.224 0-.287-.007a1.125 1.125 0 0 1-.992-.992C13 9.938 13 9.864 13 9.714z M2 6.5a4.5 4.5 0 0 1 9 0v3c0 .349 0 .523-.038.666a1.13 1.13 0 0 1-.796.796C10.023 11 9.85 11 9.5 11h-3A4.5 4.5 0 0 1 2 6.5m11 8c0-.349 0-.523.038-.666c.104-.388.408-.692.796-.796c.143-.038.317-.038.666-.038h3a4.5 4.5 0 1 1-4.5 4.5z";
const SVG_VIEWBOX = "0 0 24 24";

const FOLLOW_ONLY_FEED = import.meta.env.VITE_FOLLOW_ONLY_FEED === 'true';
const POST_PAGE_SIZE = 10;

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 70, 
      damping: 10,
      delayChildren: 0.1,
      staggerChildren: 0.05 
    }
  }
};

const postItemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
};

const composerVariants = {
  collapsed: { height: 'auto', opacity: 1 },
  expanded: { height: 'auto', opacity: 1 }
};

export const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'shots'>('posts');

  // --- GIF STATES ---
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifQuery, setGifQuery] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);

  const searchGifs = async (query: string = '') => {
    const apiKey = import.meta.env.VITE_TENOR_API_KEY;
    if (!apiKey) return;
    const searchUrl = query 
      ? `https://tenor.googleapis.com/v2/search?q=${query}&key=${apiKey}&client_key=gazebo_app&limit=12&media_filter=minimal`
      : `https://tenor.googleapis.com/v2/featured?key=${apiKey}&client_key=gazebo_app&limit=12&media_filter=minimal`;
    
    try {
        const res = await fetch(searchUrl);
        const data = await res.json();
        setGifs(data.results || []);
    } catch (e) {
        console.error("Tenor Error", e);
    }
  };

  useEffect(() => {
    if (showGifPicker) searchGifs(gifQuery);
  }, [showGifPicker, gifQuery]);

  const canvasRef = useRef<HTMLCanvasElement>(null); // Ref for WebGL

  // --- SPECIAL EVENT WEBGL LOGIC ---
  useEffect(() => {
    if (!SPECIAL_EVENT_MODE || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // ... [Insert the shader sources provided in prompt] ...
    const vertexSource = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
    const fragmentSource = `
      precision highp float;
      #define AA
      uniform float width;
      uniform float height;
      vec2 resolution = vec2(width, height);
      uniform float time;
      void main(){
        float strength = 0.4;
        float t = time/6.0;
        vec3 col = vec3(0);
        vec2 fC = gl_FragCoord.xy;
        #ifdef AA
        for(int i = -1; i <= 1; i++) {
          for(int j = -1; j <= 1; j++) {
            fC = gl_FragCoord.xy+vec2(i,j)/3.0;
        #endif
            vec2 pos = fC/resolution.xy;
            pos.y /= resolution.x/resolution.y;
            pos = 4.0*(vec2(0.5) - pos);
            for(float k = 1.0; k < 7.0; k+=1.0){ 
              pos.x += strength * sin(2.0*t+k*1.5 * pos.y)+t*0.5;
              pos.y += strength * cos(2.0*t+k*1.5 * pos.x);
            }
            col += 0.5 + 0.5*cos(time+pos.xyx+vec3(0,2,4));
        #ifdef AA
          }
        }
        col /= 9.0;
        #endif
        col = pow(col, vec3(0.4545));
        gl_FragColor = vec4(col,1.0);
      }
    `;

    // Compile Shaders
    const compileShader = (src: string, type: number) => {
      const shader = gl.createShader(type);
      if(!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const vert = compileShader(vertexSource, gl.VERTEX_SHADER);
    const frag = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
    if(!vert || !frag) return;

    const program = gl.createProgram();
    if(!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Buffer Data
    const vertexData = new Float32Array([-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    // Attributes & Uniforms
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeHandle = gl.getUniformLocation(program, 'time');
    const widthHandle = gl.getUniformLocation(program, 'width');
    const heightHandle = gl.getUniformLocation(program, 'height');

    gl.uniform1f(widthHandle, window.innerWidth);
    gl.uniform1f(heightHandle, window.innerHeight);

    // Animation Loop
    let frameId: number;
    let time = 0.0;
    let lastFrame = Date.now();

    const draw = () => {
      const thisFrame = Date.now();
      time += (thisFrame - lastFrame) / 770;
      lastFrame = thisFrame;
      gl.uniform1f(timeHandle, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frameId = requestAnimationFrame(draw);
    };
    
    draw();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(widthHandle, window.innerWidth);
      gl.uniform1f(heightHandle, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Social state (Likes/Comments) - moved details to PostItem, but we keep the list of liked IDs here for context
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  // Pagination
  const [postPage, setPostPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);

  const getPostCounts = useCallback(async (postIds: string[]) => {
    if (!postIds.length) return { likeCounts: {}, commentCounts: {} };
    const likeCounts: Record<string, number> = {};
    const commentCounts: Record<string, number> = {};
    for (const postId of postIds) {
      const [{ count: likeCount }, { count: commentCount }] = await Promise.all([
        supabase.from('likes').select('*', { count: 'exact', head: true }).eq('entity_type', 'post').eq('entity_id', postId),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', postId)
      ]);
      likeCounts[postId] = likeCount || 0;
      commentCounts[postId] = commentCount || 0;
    }
    return { likeCounts, commentCounts };
  }, []);

  const fetchUserLikes = useCallback(async (currentPosts: Post[]) => {
    if (!user || currentPosts.length === 0) return;
    const postIds = currentPosts.map(p => p.id);
    const { data } = await supabase.from('likes').select('entity_id').eq('user_id', user.id).eq('entity_type', 'post').in('entity_id', postIds);
    if (data) setLikedPostIds(prevSet => new Set([...prevSet, ...data.map(d => d.entity_id)]));
  }, [user]);

  const loadPosts = useCallback(async () => {
    if (!user?.id) return;
    
    setPosts([]);
    setPostPage(0);
    setHasMorePosts(true);
    let query = supabase.from('posts').select('*, profiles(*), original_post:repost_of(*, profiles(*))').order('created_at', { ascending: false });
    if (FOLLOW_ONLY_FEED && user) {
      const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
      const followingIds = following?.map(f => f.following_id) || [];
      query = query.in('user_id', [...followingIds, user.id]);
    }
    const { data } = await query.range(0, POST_PAGE_SIZE - 1);
    const loadedPosts = data || [];
    const postIds = loadedPosts.map(p => p.id);
    const { likeCounts, commentCounts } = await getPostCounts(postIds);
    const postsWithCounts = loadedPosts.map(post => ({ ...post, like_count: likeCounts[post.id] || 0, comment_count: commentCounts[post.id] || 0 }));
    setPosts(postsWithCounts);
    if (postsWithCounts.length < POST_PAGE_SIZE) setHasMorePosts(false);
    fetchUserLikes(postsWithCounts);
  }, [user?.id, fetchUserLikes, getPostCounts]);
  
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMorePosts || !hasMorePosts) return;
    setIsLoadingMorePosts(true);
    const nextPage = postPage + 1;
    const from = nextPage * POST_PAGE_SIZE;
    const to = from + POST_PAGE_SIZE - 1;
    let query = supabase.from('posts').select('*, profiles(*), original_post:repost_of(*, profiles(*))').order('created_at', { ascending: false });
    if (FOLLOW_ONLY_FEED && user) {
      const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
      const followingIds = following?.map(f => f.following_id) || [];
      query = query.in('user_id', [...followingIds, user.id]);
    }
    const { data } = await query.range(from, to);
    const newPosts = data || [];
    const newPostIds = newPosts.map(p => p.id);
    const { likeCounts, commentCounts } = await getPostCounts(newPostIds);
    const newPostsWithCounts = newPosts.map(post => ({ ...post, like_count: likeCounts[post.id] || 0, comment_count: commentCounts[post.id] || 0 }));
    setPosts(current => [...current, ...newPostsWithCounts]);
    setPostPage(nextPage);
    if (newPosts.length < POST_PAGE_SIZE) setHasMorePosts(false);
    fetchUserLikes(newPostsWithCounts);
    setIsLoadingMorePosts(false);
  }, [isLoadingMorePosts, hasMorePosts, postPage, user, fetchUserLikes, getPostCounts]);

  useEffect(() => {
    if (!user?.id) return;
    
    loadPosts();
    const channel = supabase.channel('feed-updates')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
      // Logic to fetch new post
      const { data } = await supabase.from('posts').select('*, profiles(*), original_post:repost_of(*, profiles(*))').eq('id', payload.new.id).single();
      if (data) {
          // Optional: Check if post belongs to a group I'm in or a user I follow before adding
          setPosts(current => [{ ...data, like_count: 0, comment_count: 0 }, ...current]);
      }
    })
    .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, loadPosts]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      if (scrolled && isExpanded) setIsExpanded(false);
      setHasScrolled(scrolled);
      if (activeTab === 'posts' && window.innerHeight + document.documentElement.scrollTop + 200 >= document.documentElement.offsetHeight && hasMorePosts && !isLoadingMorePosts) {
        loadMorePosts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('scroll', handleScroll); };
  }, [isExpanded, hasMorePosts, isLoadingMorePosts, loadMorePosts, activeTab]);

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file && !remoteUrl.trim()) return;
    setIsUploading(true);
    setUploadProgress(0);
    let media_url = null;
    let media_type = null;
    if (file) {
      const result = await uploadMedia(file, 'posts', (percent) => setUploadProgress(percent));
      if (!result) { setIsUploading(false); return; }
      media_url = result.url;
      media_type = result.type;
    } else if (remoteUrl.trim()) {
      media_url = remoteUrl.trim();
      if (remoteUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) media_type = 'image';
      else if (remoteUrl.match(/\.(mp4|webm|mov|avi)$/i)) media_type = 'video';
      else if (remoteUrl.match(/\.(mp3|wav|ogg|m4a|weba)$/i)) media_type = 'audio';
      else media_type = 'document';
    }
    await supabase.from('posts').insert({ user_id: user!.id, content, media_url, media_type });
    logSecurityEvent('post_created', user.id, { content_snippet: content.slice(0, 50) });
    setContent(''); setFile(null); setRemoteUrl(''); setIsExpanded(false); setIsUploading(false); setUploadProgress(0);
  };

  const goToProfile = async (profileId: string) => {
    const { data } = await supabase.from('profiles').select('username').eq('id', profileId).single();
    if (data) {
      window.history.replaceState({}, '', `/?user=${data.username}`);
      window.dispatchEvent(new CustomEvent('navigateToProfile', { detail: profileId }));
    }
  };

  const getPreview = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('image/')) return <img src={url} className="max-h-48 rounded-lg object-cover" alt="Preview" />;
      if (file.type.startsWith('video/')) return <video src={url} className="max-h-48 rounded-lg" controls />;
      if (file.type.startsWith('audio/')) return <AudioPlayer src={url} />;
      return <div className="flex items-center gap-2 p-3 bg-[rgb(var(--color-surface-hover))] rounded-lg"><FileText size={20} className="text-[rgb(var(--color-text-secondary))]" /><span className="text-sm text-[rgb(var(--color-text))]">{file.name}</span></div>;
    }
    if (remoteUrl) {
      if (remoteUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return <img src={remoteUrl} className="max-h-48 rounded-lg object-cover" alt="Remote preview" />;
      if (remoteUrl.match(/\.(mp4|webm|mov|avi)$/i)) return <video src={remoteUrl} className="max-h-48 rounded-lg" controls />;
      if (remoteUrl.match(/\.(mp3|wav|ogg|m4a|weba)$/i)) return <AudioPlayer src={remoteUrl} />;
      return <div className="flex items-center gap-2 p-3 bg-[rgb(var(--color-surface-hover))] rounded-lg"><Paperclip size={20} className="text-[rgb(var(--color-text-secondary))]" /><span className="text-sm truncate max-w-[200px] text-[rgb(var(--color-text))]">{remoteUrl}</span></div>;
    }
    return null;
  };

  // --- CALLBACKS FOR POSTITEM TO UPDATE PARENT STATE ---
  const handleLikeToggle = (post: Post) => {
    const wasLiked = likedPostIds.has(post.id);
    const newSet = new Set(likedPostIds);
    if (wasLiked) newSet.delete(post.id); else newSet.add(post.id);
    setLikedPostIds(newSet);
    setPosts(current => current.map(p => p.id === post.id ? { ...p, like_count: Math.max(0, p.like_count + (wasLiked ? -1 : 1)) } : p));
  };

  const handleCommentUpdate = (post: Post) => {
     setPosts(current => current.map(p => p.id === post.id ? post : p));
  };

  return (
    <motion.div 
      className="max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    > {/* <-- motion.div wrapper */}
      {/* SPECIAL EVENT CANVAS */}
      {SPECIAL_EVENT_MODE && (
        <canvas 
          ref={canvasRef} 
          className="fixed inset-0 z-[-1] opacity-30 pointer-events-none" 
        />
      )}
      
      {activeTab === 'posts' && <StatusTray />}
      {activeTab === 'posts' && (
      <motion.div 
        ref={scrollRef} 
        className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] shadow-sm"
        variants={composerVariants}
        initial={isExpanded ? 'expanded' : 'collapsed'}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        transition={{ duration: 0.3 }}
      > {/* <-- motion.div for composer */}
        <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.form 
            key="expanded" 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
            onSubmit={createPost} 
            className="p-4 space-y-3"
          >
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's happening?" rows={3} className="w-full px-4 py-3 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] rounded-2xl focus:outline-none focus:border-[rgb(var(--color-accent))] resize-none text-[rgb(var(--color-text))]" autoFocus />
            {(file || remoteUrl) && (
              <div className="flex items-center justify-between p-3 bg-[rgb(var(--color-surface-hover))] rounded-lg">
                <div className="flex-1">{getPreview()}</div>
                <button type="button" onClick={() => { setFile(null); setRemoteUrl(''); }} className="ml-2 p-1 hover:bg-[rgb(var(--color-border))] rounded-full transition"><X size={18} className="text-[rgb(var(--color-text-secondary))]" /></button>
              </div>
            )}
            {isUploading && <div className="w-full bg-[rgb(var(--color-border))] rounded-full h-2 overflow-hidden"><div className="bg-[rgba(var(--color-accent),1)] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>}
            {/* GIF PICKER UI */}
            {showGifPicker && (
              <div className="relative border border-[rgb(var(--color-border))] rounded-xl overflow-hidden bg-[rgb(var(--color-background))] h-64 flex flex-col mb-3">
                 <div className="p-2 border-b border-[rgb(var(--color-border))] flex gap-2">
                    <Search size={16} className="text-[rgb(var(--color-text-secondary))]" />
                    <input 
                      type="text" 
                      placeholder="Search GIFs..." 
                      className="flex-1 bg-transparent text-sm outline-none text-[rgb(var(--color-text))]"
                      value={gifQuery}
                      onChange={(e) => setGifQuery(e.target.value)}
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowGifPicker(false)}><X size={16} className="text-[rgb(var(--color-text-secondary))]" /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 grid grid-cols-3 gap-2">
                    {gifs.map(gif => (
                       <img 
                          key={gif.id}
                          src={gif.media_formats.tinygif.url}
                          alt="GIF"
                          className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => {
                             setRemoteUrl(gif.media_formats.gif.url);
                             setFile(null);
                             setShowGifPicker(false);
                          }}
                       />
                    ))}
                 </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" onChange={(e) => { setFile(e.target.files?.[0] || null); setRemoteUrl(''); }} className="hidden" />
            <div className="flex gap-2 items-center flex-wrap">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[rgb(var(--color-surface-hover))] rounded-full text-sm hover:bg-[rgb(var(--color-border))] transition flex items-center gap-2 text-[rgb(var(--color-text))]"><Paperclip size={16} className="text-[rgb(var(--color-text-secondary))]" /> {file ? 'Change File' : 'Attach'}</button>
              <button type="button" onClick={() => setShowGifPicker(!showGifPicker)} className="px-4 py-2 bg-[rgb(var(--color-surface-hover))] rounded-full text-sm hover:bg-[rgb(var(--color-border))] transition flex items-center gap-2 text-[rgb(var(--color-text))]">
                 <Gift size={16} className="text-pink-500" /> GIF
              </button>

              <div className="flex items-center gap-1"><span className="text-xs text-[rgb(var(--color-text-secondary))]">or</span><input type="url" value={remoteUrl} onChange={(e) => { setRemoteUrl(e.target.value); setFile(null); }} placeholder="Paste URL..." className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] rounded-full focus:outline-none focus:border-[rgb(var(--color-accent))] text-[rgb(var(--color-text))]" /></div>
              <button type="submit" disabled={isUploading || (!content.trim() && !file && !remoteUrl.trim())} className="ml-auto bg-[rgba(var(--color-accent),1)] disabled:bg-[rgb(var(--color-border))] text-[rgb(var(--color-text-on-primary))] px-6 py-2 rounded-full hover:bg-[rgba(var(--color-primary),1)] flex items-center gap-2 font-semibold transition"><Send size={16} /> {isUploading ? 'Uploading...' : 'Post'}</button>
            </div>
          </motion.form>
        ) : (
          <motion.button 
            key="collapsed"
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(true)} 
            className="w-full p-4 flex items-center gap-3 hover:bg-[rgb(var(--color-surface-hover))] transition"
          > {/* <-- motion.button for collapsed composer */}
            <Edit3 size={20} className="text-[rgb(var(--color-text-secondary))]" /><span className="text-[rgb(var(--color-text-secondary))]">Write a post...</span>
          </motion.button>
        )}
        </AnimatePresence> {/* <-- ADD CLOSING TAG */}
      </motion.div>
      )}
      <motion.div 
        className="flex border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] sticky top-[0px] z-30"
        layout
      >
        <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold transition border-b-2 ${activeTab === 'posts' ? 'border-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))]' : 'border-transparent text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))]'}`}><LayoutGrid size={18} /> Posts</button>
        <button onClick={() => setActiveTab('shots')} className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold transition border-b-2 ${activeTab === 'shots' ? 'border-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))]' : 'border-transparent text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))]'}`}><Smartphone size={18} /> Shots</button>
      </motion.div>
      <div>
        {activeTab === 'shots' ? <Shots /> : (
        <motion.div 
           initial="hidden" 
           animate="visible"
           variants={containerVariants}
        > {/* <-- motion.div wrapper for feed content */}
        {posts.length === 0 && !isLoadingMorePosts && <div className="text-center py-12 text-[rgb(var(--color-text-secondary))]">{FOLLOW_ONLY_FEED ? 'No posts from people you follow yet.' : 'No posts yet. Be the first!'}</div>}
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <motion.div 
              key={post.id} 
              variants={postItemVariants} 
              initial="hidden" 
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              layout 
            > {/* <-- motion.div wrapper for each PostItem */}
              <PostItem
                key={post.id}
                post={post}
                currentUserId={user?.id}
                isLiked={likedPostIds.has(post.id)}
                onLikeToggle={handleLikeToggle}
                onCommentUpdate={handleCommentUpdate}
                onNavigateToProfile={goToProfile}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoadingMorePosts && (
          <div className="flex justify-center p-4">
            <div className="logo-loading-container w-6 h-6 relative"><svg xmlns="http://www.w3.org/2000/svg" viewBox={SVG_VIEWBOX} className="logo-svg"><path d={SVG_PATH} fill="none" stroke="rgb(var(--color-primary))" strokeWidth="10" strokeOpacity="0.1" /><path d={SVG_PATH} fill="rgb(var(--color-primary))" className="logo-fill-animated" /></svg></div>
         </div>
        )}
        
        {/* NEW: Manual Load More Button */}
        {!isLoadingMorePosts && hasMorePosts && posts.length > 0 && (
            <div className="flex justify-center py-6 pb-20 md:pb-6">
                <button 
                    onClick={loadMorePosts}
                    className="px-6 py-2 rounded-full bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] font-medium hover:bg-[rgb(var(--color-surface-hover))] transition shadow-sm text-sm"
                >
                    Load More Posts
                </button>
            </div>
        )}

        {!isLoadingMorePosts && !hasMorePosts && posts.length > 0 && <div className="text-center py-8 text-sm text-[rgb(var(--color-text-secondary))]">You've reached the end of the feed.</div>}
        </motion.div>
        )}
      </div>
    </motion.div>
  );
};