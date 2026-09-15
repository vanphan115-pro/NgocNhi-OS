import { AIDecisionRequest, AIDecisionType } from '../types';
import { triggerAdminNotification } from '../utils/notificationSound';

const STORAGE_KEY = 'nn_admin_pending_decisions_v1';
const EVENT_NAME = 'nn_ai_decision_update';

// Get local cached decisions
export function getLocalDecisions(): AIDecisionRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse local decisions', e);
  }
  return [];
}

// Save local decisions
export function saveLocalDecisions(list: AIDecisionRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
  } catch (e) {
    console.warn('Failed to save local decisions', e);
  }
}

// Fetch all decisions (merged from API and local cache)
export async function fetchAllDecisions(): Promise<AIDecisionRequest[]> {
  const local = getLocalDecisions();
  try {
    const res = await fetch('/api/decisions');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.decisions)) {
        // Merge without duplicates (favor latest updated)
        const map = new Map<string, AIDecisionRequest>();
        for (const item of local) {
          map.set(item.id, item);
        }
        for (const item of data.decisions) {
          map.set(item.id, item);
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        saveLocalDecisions(merged);
        return merged;
      }
    }
  } catch (err) {
    // Network or server offline, fall back to local
  }
  return local;
}

// Create a new decision request (when customer wants to close order or requires admin approval)
export async function createDecisionRequest(payload: {
  customerName: string;
  phone: string;
  module: 'farm' | 'restaurant' | 'wedding' | 'general';
  decisionType: AIDecisionType;
  title?: string;
  summary: string;
  customerMessage: string;
  estimatedValue?: number;
}): Promise<AIDecisionRequest> {
  const code = `DEC-${Math.floor(1000 + Math.random() * 9000)}`;
  const newDecision: AIDecisionRequest = {
    id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code,
    customerName: payload.customerName || 'Khách hàng trực tuyến',
    phone: payload.phone || '',
    module: payload.module,
    decisionType: payload.decisionType,
    title: payload.title || `Yêu cầu chốt đơn / nghiệp vụ [${code}]`,
    summary: payload.summary,
    customerMessage: payload.customerMessage,
    estimatedValue: payload.estimatedValue || 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // 1. Save to local first for instantaneous UI update
  const current = getLocalDecisions();
  const updated = [newDecision, ...current.filter(d => d.id !== newDecision.id)];
  saveLocalDecisions(updated);

  // 2. Play sound chime & dispatch admin notification for restaurant & homepage
  try {
    triggerAdminNotification({
      type: payload.module === 'restaurant' ? 'order' : payload.module === 'wedding' ? 'wedding' : 'farm_order',
      title: `Chốt đặt mới (${payload.module === 'restaurant' ? 'Quán Ăn' : payload.module === 'wedding' ? 'Tiệc Cưới' : 'Trại Dúi'})`,
      message: `${payload.customerName || 'Khách hàng'}: ${payload.summary}`,
      code,
      customerName: payload.customerName || 'Khách hàng',
      phone: payload.phone || '',
      amount: payload.estimatedValue || 0,
      view: payload.module === 'farm' ? 'farm' : payload.module === 'wedding' ? 'wedding' : 'restaurant'
    });
  } catch (notifErr) {
    console.warn('Could not dispatch sound alert:', notifErr);
  }

  // 3. Sync to server API in background
  try {
    await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDecision)
    });
  } catch (e) {
    // silently keep local
  }

  return newDecision;
}

// Update status of a decision (e.g. approve, reject, mark contacted)
export async function updateDecisionStatus(
  id: string,
  status: AIDecisionRequest['status'],
  adminNote?: string
): Promise<AIDecisionRequest | null> {
  const list = getLocalDecisions();
  const index = list.findIndex(d => d.id === id);
  if (index === -1) return null;

  const target = {
    ...list[index],
    status,
    adminNote: adminNote !== undefined ? adminNote : list[index].adminNote,
    resolvedAt: status !== 'pending' ? new Date().toISOString() : undefined
  };

  list[index] = target;
  saveLocalDecisions([...list]);

  // Sync to server
  try {
    await fetch(`/api/decisions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote })
    });
  } catch (e) {}

  return target;
}

// Subscribe to real-time decision updates
export function subscribeToDecisions(callback: (decisions: AIDecisionRequest[]) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getLocalDecisions());
    }
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getLocalDecisions());
    }
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', storageHandler);

  // Initial call
  callback(getLocalDecisions());

  // Also trigger fetch in background
  fetchAllDecisions().then(data => callback(data)).catch(() => {});

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
