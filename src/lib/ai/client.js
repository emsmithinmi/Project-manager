import { supabase } from '../supabase'
import { getAIConfig, isConfigured } from './config'

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`

// Routes all AI calls through the Supabase Edge Function proxy to avoid CORS issues.
// Skills pass messages in OpenAI format — the proxy handles provider differences.
export async function callAI(messages, options = {}) {
  const config = await getAIConfig()

  if (!isConfigured(config)) {
    throw new Error('AI is not configured. Go to Settings to add your provider and API key.')
  }

  const { data: { session } } = await supabase.auth.getSession()

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  }

  // Pass base URL for OpenAI-compatible providers
  if (config.provider !== 'anthropic') {
    headers['x-base-url'] = config.baseUrl
  }

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.4,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI proxy error (${res.status}): ${err}`)
  }

  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.text
}

// Sends a minimal message to verify config works
export async function testConnection() {
  const response = await callAI([
    { role: 'user', content: 'Reply with exactly: OK' },
  ])
  return response?.trim().startsWith('OK')
}
