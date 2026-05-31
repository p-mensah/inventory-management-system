/*
  Example serverless endpoint (Node.js / Vercel / Netlify Function) to delete a Supabase user
  Usage: configure an environment variable SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL in your serverless environment.
  This endpoint must be protected (e.g., via an API key, session, or internal network) - DO NOT expose service_role key to clients.

  POST body: { id: '<user-uuid>' }
*/

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase config in serverless environment');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // Simple API key check - replace with your auth
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
  const incomingKey = req.headers['x-admin-key'];
  if (!ADMIN_API_KEY || incomingKey !== ADMIN_API_KEY) {
    return res.status(401).send('Unauthorized');
  }

  const { id } = req.body || {};
  if (!id) return res.status(400).send('Missing id');

  try {
    // 1) Remove profile row
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', id);
    if (profileError) {
      console.error('Failed to delete profile row:', profileError);
    }

    // 2) Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error('Failed to delete auth user:', authError);
      return res.status(500).send(authError.message || 'Failed deleting auth user');
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Serverless delete-user error', err);
    return res.status(500).send('Server error');
  }
};
