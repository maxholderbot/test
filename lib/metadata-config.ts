// Server-side config for build-time metadata generation
import * as fs from 'fs'
import * as path from 'path'

export interface MetadataConfig {
  botName: string
  botLogo: string
  favicon: string
  tagline: string
  description: string
  image: string
  inviteLink: string
  discordServerInvite: string
}

const DEFAULT_CONFIG: MetadataConfig = {
  botName: 'Discord Bot',
  botLogo: '/bot-logo.png',
  favicon: '/favicon.png',
  tagline: 'Advanced server management',
  description: 'Advanced Discord bot for server management and moderation',
  image: '/bot-logo.png',
  inviteLink: 'https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID',
  discordServerInvite: 'https://discord.gg/YOUR_SERVER_INVITE',
}

let cachedConfig: MetadataConfig | null = null

export function getMetadataConfig(): MetadataConfig {
  if (cachedConfig) return cachedConfig

  try {
    const configPath = path.join(process.cwd(), 'public', 'siteconfig.json')
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf-8')
      const config = JSON.parse(fileContent)
      cachedConfig = { ...DEFAULT_CONFIG, ...config }
      return cachedConfig
    }
  } catch (error) {
    console.warn('Failed to load siteconfig.json, using defaults')
  }

  cachedConfig = DEFAULT_CONFIG
  return cachedConfig
}
