import fs from 'node:fs'
import path from 'node:path'

class FileKV {
  private dirPath: string

  constructor() {
    this.dirPath = path.resolve(process.cwd(), '.data/kv')
    if (!fs.existsSync(this.dirPath)) {
      fs.mkdirSync(this.dirPath, { recursive: true })
    }
  }

  private getFilePath(key: string) {
    // Sanitize key for filename safety (e.g. replace colons with underscores)
    const safeKey = key.replace(/[^a-zA-Z0-9_\-:]/g, '_').replace(/:/g, '__')
    return path.join(this.dirPath, `${safeKey}.json`)
  }

  async get(key: string): Promise<any> {
    const filePath = this.getFilePath(key)
    if (!fs.existsSync(filePath)) return null
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  async put(key: string, value: any): Promise<void> {
    const filePath = this.getFilePath(key)
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8')
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  async list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }> {
    if (!fs.existsSync(this.dirPath)) return { keys: [] }
    const files = fs.readdirSync(this.dirPath)
    const prefix = options?.prefix || ''
    const keys = files
      .map(file => {
        // Recover original key by replacing '__' back with ':'
        const name = file.replace(/\.json$/, '').replace(/__/g, ':')
        return { name }
      })
      .filter(item => item.name.startsWith(prefix))
    return { keys }
  }
}

export function getKV(event: any) {
  // Check if we are running in Cloudflare environment
  const cfKV = event.context.cloudflare?.env?.STORYTELLER_KV
  if (cfKV) {
    return {
      get: async (key: string) => {
        const val = await cfKV.get(key)
        return val ? JSON.parse(val) : null
      },
      put: async (key: string, value: any) => {
        await cfKV.put(key, JSON.stringify(value))
      },
      delete: async (key: string) => {
        await cfKV.delete(key)
      },
      list: async (options?: { prefix?: string }) => {
        const listResult = await cfKV.list(options)
        return listResult
      }
    }
  }

  // Fallback to file-based KV store for local development
  const fileKV = new FileKV()
  return {
    get: (key: string) => fileKV.get(key),
    put: (key: string, value: any) => fileKV.put(key, value),
    delete: (key: string) => fileKV.delete(key),
    list: (options?: { prefix?: string }) => fileKV.list(options)
  }
}
