export type BillingPlan = 'starter' | 'pro' | 'flowplus'

type CheckoutPayload = {
  plan: BillingPlan
  email?: string
  userId?: string
}

async function postJson<TResponse>(path: string, payload: Record<string, unknown>): Promise<TResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as TResponse & { error?: string }

  if (!response.ok) {
    throw new Error(data.error ?? 'Billing API indisponível.')
  }

  return data
}

export async function createCheckoutSession(payload: CheckoutPayload) {
  return postJson<{ url: string }>('/api/billing/checkout', payload)
}

export async function createPortalSession(customerId: string) {
  return postJson<{ url: string }>('/api/billing/portal', { customerId })
}

export async function redeemBetaCode(code: string, userId: string) {
  return postJson<{ ok: true; plan: string }>('/api/beta/redeem', { code, userId })
}
