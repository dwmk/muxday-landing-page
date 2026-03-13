// src/lib/security.ts
import { supabase } from './supabase';

/**
 * Generates a high-entropy hardware fingerprint.
 */
const getHardwareFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const webgl = canvas.getContext('webgl') as WebGLRenderingContext;
  
  // 1. Canvas Fingerprinting (Specific to OS/Browser/GPU rendering)
  let canvasHash = 'n/a';
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Forensic_ID_01", 2, 15);
    canvasHash = btoa(canvas.toDataURL());
  }

  // 2. WebGL Renderer (Identifies specific GPU/Driver version)
  let gpu = 'n/a';
  if (webgl) {
    const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
    gpu = debugInfo ? webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'n/a';
  }

  return {
    canvasHash: canvasHash.substring(0, 100), // Trim for storage
    gpu,
    resolution: `${window.screen.width}x${window.screen.height}`,
    cores: navigator.hardwareConcurrency || 'n/a',
    memory: (navigator as any).deviceMemory || 'n/a',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

/**
 * Generates a SHA-256 hash of a file for content tracking.
 */
export const calculateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Checks if a hash exists in the blacklist before allowing upload.
 */
export const isBlacklisted = async (hash: string): Promise<boolean> => {
  const { data } = await supabase
    .from('blacklisted_media')
    .select('hash_value')
    .eq('hash_value', hash)
    .single();
  return !!data;
};

export const logSecurityEvent = async (eventType: string, userId: string | null, extraData: any = {}) => {
  try {
    // 1. Get enriched IP data (using a service that provides ISP/ASN)
    // Using ipapi.co (or similar) gives you the ISP and Country
    const ipRes = await fetch('https://ipapi.co/json/');
    const netData = await ipRes.json();

    const hardware = getHardwareFingerprint();

    // 2. Log to Supabase with higher granularity
    await supabase.from('security_audit_logs').insert({
      user_id: userId,
      event_type: eventType,
      ip_address: netData.ip,
      isp: netData.org, // Helps pinpoint the provider for subpoenas
      country_code: netData.country_code,
      user_agent: navigator.userAgent,
      device_fingerprint: btoa(JSON.stringify(hardware)),
      canvas_hash: hardware.canvasHash,
      gpu_info: hardware.gpu,
      metadata: {
        ...extraData,
        browser_language: navigator.language,
        connection_type: (navigator as any).connection?.effectiveType,
        is_vpn_likely: netData.proxy || false // Some APIs flag VPNs/Tor
      }
    });
  } catch (error) {
    // Fail silently but log locally for debugging
    console.error("Forensic capture failed:", error);
  }
};