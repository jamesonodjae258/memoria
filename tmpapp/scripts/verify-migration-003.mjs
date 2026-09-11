import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')
const env = fs.readFileSync(envPath, 'utf8')
const envVars = {}
env.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) envVars[k.trim()] = v.join('=').trim()
})

const supabase = createClient(
  envVars['NEXT_PUBLIC_SUPABASE_URL'],
  envVars['SUPABASE_SERVICE_ROLE_KEY']
)

async function verify() {
  const { data, error } = await supabase
    .from('funeral_homes')
    .select('id, contact_email, contact_email_verified')
    .limit(1)

  if (error) {
    console.error('VERIFICATION_FAILED:', error.message)
    process.exit(1)
  } else {
    console.log('VERIFICATION_SUCCESS: Columns exist on funeral_homes table.')
    console.log('Sample row queried:', data)
    process.exit(0)
  }
}

verify()
