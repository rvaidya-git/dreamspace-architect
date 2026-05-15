import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────
// localStorage — player identity
// ─────────────────────────────────────────────────────────────

const PLAYER_ID_KEY = 'dreamspace_player_id';

export function getStoredPlayerId() {
  return localStorage.getItem(PLAYER_ID_KEY);
}

export function storePlayerId(id) {
  localStorage.setItem(PLAYER_ID_KEY, id);
}

export function clearStoredPlayerId() {
  localStorage.removeItem(PLAYER_ID_KEY);
}

// ─────────────────────────────────────────────────────────────
// Username validation (client-side)
// ─────────────────────────────────────────────────────────────

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;

export function validateUsername(raw) {
  if (!USERNAME_RE.test(raw.trim())) {
    return '3–20 characters: letters, numbers, _ or - only.';
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────

export async function isUsernameAvailable(username) {
  const normalized = username.trim().toLowerCase();
  const { data, error } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('username_normalized', normalized)
    .maybeSingle();
  if (error) throw error;
  return data === null;
}

export async function createProfile(username, email) {
  const normalized = username.trim().toLowerCase();
  const available = await isUsernameAvailable(username);
  if (!available) throw new Error('That username is already taken.');

  const { data, error } = await supabase
    .from('player_profiles')
    .insert({
      username_display: username.trim(),
      username_normalized: normalized,
      // Store email lowercased so lookups are consistent
      email: email?.trim().toLowerCase() || null,
      last_login_at: new Date().toISOString(),
    })
    .select('id, username_display')
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('That username is already taken.');
    throw error;
  }

  storePlayerId(data.id);
  return { id: data.id, username: data.username_display };
}

export async function loginWithUsername(username) {
  const normalized = username.trim().toLowerCase();
  const { data, error } = await supabase
    .from('player_profiles')
    .select('id, username_display')
    .eq('username_normalized', normalized)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  await supabase
    .from('player_profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.id);

  storePlayerId(data.id);
  return { id: data.id, username: data.username_display };
}

// Returns the username_display if the email matches a profile, null otherwise.
export async function lookupUsernameByEmail(email) {
  const { data, error } = await supabase
    .from('player_profiles')
    .select('username_display')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data?.username_display ?? null;
}

// Calls the Edge Function which looks up the email and sends the username via Resend.
export async function emailUsernameRecovery(email) {
  const { error } = await supabase.functions.invoke('send-username-recovery', {
    body: { email: email.trim().toLowerCase() },
  });
  if (error) throw error;
}

export async function loadProfile(playerId) {
  const { data, error } = await supabase
    .from('player_profiles')
    .select('id, username_display')
    .eq('id', playerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, username: data.username_display };
}

export function signOut() {
  clearStoredPlayerId();
}

export async function deleteAccount(playerId) {
  const { error } = await supabase
    .from('player_profiles')
    .delete()
    .eq('id', playerId);
  if (error) throw error;
  clearStoredPlayerId();
}

// ─────────────────────────────────────────────────────────────
// Progress (in-progress missions)
// ─────────────────────────────────────────────────────────────

export async function saveProgress(playerId, missionId, placedItems) {
  const { error } = await supabase
    .from('player_mission_progress')
    .upsert(
      {
        player_id: playerId,
        mission_id: missionId,
        status: 'in_progress',
        room_state: placedItems,
      },
      { onConflict: 'player_id,mission_id' }
    );
  if (error) console.error('Progress save failed:', error.message);
}

export async function loadAllProgress(playerId) {
  const { data, error } = await supabase
    .from('player_mission_progress')
    .select('mission_id, room_state, updated_at')
    .eq('player_id', playerId)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(row => ({
    mission_id: row.mission_id,
    placed_items: row.room_state,
    last_updated: row.updated_at,
  }));
}

export async function loadProgress(playerId, missionId) {
  const { data, error } = await supabase
    .from('player_mission_progress')
    .select('room_state, status')
    .eq('player_id', playerId)
    .eq('mission_id', missionId)
    .maybeSingle();
  if (error) return null;
  if (!data || data.status === 'completed') return null;
  return data.room_state ?? null;
}

// ─────────────────────────────────────────────────────────────
// Scores (completed missions)
// ─────────────────────────────────────────────────────────────

export async function submitMission(playerId, missionId, score) {
  const { data: existing } = await supabase
    .from('player_mission_progress')
    .select('attempts')
    .eq('player_id', playerId)
    .eq('mission_id', missionId)
    .maybeSingle();

  const attempts = (existing?.attempts ?? 0) + 1;

  const { error } = await supabase
    .from('player_mission_progress')
    .upsert(
      {
        player_id: playerId,
        mission_id: missionId,
        status: 'completed',
        room_state: null,
        latest_score: score,
        attempts,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'player_id,mission_id' }
    );
  if (error) throw error;

  const scores = await getScores(playerId);
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  await supabase
    .from('player_profiles')
    .update({ total_score: total })
    .eq('id', playerId);
}

export async function getScores(playerId) {
  const { data, error } = await supabase
    .from('player_mission_progress')
    .select('mission_id, latest_score, completed_at')
    .eq('player_id', playerId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(row => ({
    mission_id: row.mission_id,
    score: row.latest_score,
    scored_at: row.completed_at,
  }));
}
