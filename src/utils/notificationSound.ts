/**
 * Web Audio Chime & Admin Notification Dispatcher
 * Plays real-time sound alert and coordinates cross-tab notification events
 */

// Synthesize pleasant 2-tone chime using Web Audio API (no external file dependency)
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.01, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2: A5 (880 Hz) - slightly delayed for bell-ring effect
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.01, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);

    // Auto-close audio context after sound completes
    setTimeout(() => {
      try {
        if (ctx.state !== 'closed') {
          ctx.close();
        }
      } catch (e) {}
    }, 800);
  } catch (err) {
    // Audio context may be restricted by browser policy before first interaction
    console.debug('Audio alert blocked or unsupported:', err);
  }
}

export interface AdminAlertPayload {
  id?: string;
  type: 'order' | 'booking' | 'dui_quote' | 'farm_order' | 'wedding';
  title: string;
  message: string;
  code: string;
  customerName: string;
  phone: string;
  amount?: number;
  view: 'restaurant' | 'farm' | 'wedding' | 'operations' | 'portal';
  timestamp?: string;
}

/**
 * Trigger an admin notification with instant chime and localStorage persistence
 */
export function triggerAdminNotification(payload: AdminAlertPayload) {
  const notifId = payload.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = payload.timestamp || new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' - ' + new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  const newNotif = {
    ...payload,
    id: notifId,
    timestamp,
    read: false,
  };

  // 1. Play Sound Alert
  playNotificationChime();

  // 2. Persist in LocalStorage
  try {
    const raw = localStorage.getItem('nn_admin_notifications');
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [newNotif, ...(Array.isArray(existing) ? existing.slice(0, 49) : [])];
    localStorage.setItem('nn_admin_notifications', JSON.stringify(updated));
  } catch (err) {
    console.error('Error persisting admin notification:', err);
  }

  // 3. Dispatch global browser events for multi-tab and active components
  window.dispatchEvent(new CustomEvent('nn_admin_alert', { detail: newNotif }));

  return newNotif;
}
