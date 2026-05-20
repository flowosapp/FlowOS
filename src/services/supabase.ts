import { createClient, type User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

function translateAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.'
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Muitas tentativas. Aguarde alguns minutos.'
  if (msg.includes('email')) return 'Verifique o endereço de e-mail informado.'
  return msg
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { ok: false, message: 'Supabase não configurado.' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, message: translateAuthError(error.message) }
  return { ok: true, message: '' }
}

export async function signUpWithPassword(email: string, password: string, name: string) {
  if (!supabase) return { ok: false, message: 'Supabase não configurado.' }
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })
  if (error) return { ok: false, message: translateAuthError(error.message) }
  return { ok: true, message: '' }
}

export async function signInWithGoogle() {
  if (!supabase) return
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { prompt: 'select_account' },
    },
  })
}

export async function sendPasswordReset(email: string) {
  if (!supabase) return { ok: false, message: 'Supabase não configurado.' }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) return { ok: false, message: error.message }
  return { ok: true, message: '' }
}

export async function sendMagicLink(email: string) {
  if (!supabase) {
    return {
      ok: false,
      message: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar login real.',
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })

  if (error) {
    return {
      ok: false,
      message: error.message,
    }
  }

  return {
    ok: true,
    message: 'Magic link enviado. Verifique seu e-mail para entrar no FLOWOS.',
  }
}

export async function signOut() {
  if (!supabase) {
    return
  }

  await supabase.auth.signOut()
}

export async function loadUserState(userId: string): Promise<Record<string, unknown> | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('flowos_state')
    .select('state')
    .eq('user_id', userId)
    .single()
  return (data?.state as Record<string, unknown>) ?? null
}

export async function saveUserState(userId: string, state: Record<string, unknown>): Promise<void> {
  if (!supabase) return
  await supabase
    .from('flowos_state')
    .upsert({ user_id: userId, state }, { onConflict: 'user_id' })
}

export type SubscriptionRow = {
  plan: string
  status: string
  trial_ends_at: string | null
  current_period_end: string | null
  stripe_customer_id: string | null
}

export async function getSubscription(userId: string): Promise<SubscriptionRow | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, trial_ends_at, current_period_end, stripe_customer_id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}

export function isActiveSubscription(sub: SubscriptionRow | null): boolean {
  if (!sub) return false
  return sub.status === 'active' || sub.status === 'trialing'
}

// ── Avatar Storage ───────────────────────────────────────────────────────────

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  if (!supabase) return null
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${userId}/avatar.${ext}`

  // Remove versão anterior (ignora erro se não existir)
  await supabase.storage.from('avatars').remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.webp`, `${userId}/avatar.gif`])

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) {
    console.error('[FLOWOS] uploadAvatar:', error.message)
    return null
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // Cache-bust para forçar refresh da imagem
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function deleteAvatar(userId: string): Promise<void> {
  if (!supabase) return
  const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  await supabase.storage.from('avatars').remove(exts.map(e => `${userId}/avatar.${e}`))
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!supabase) {
    return () => undefined
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })

  return () => subscription.unsubscribe()
}
