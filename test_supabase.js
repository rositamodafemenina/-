const SUPABASE_URL = 'https://yucupzwonmzjahifvqrd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nl9TnJMNj5-O5t4yThW8fg_o-grIWgV';

async function testVentasDelete() {
  const url = `${SUPABASE_URL}/rest/v1/ventas?zona_envio=eq.__CATALOG_DATA__`;
  
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Response:", body);
  } catch (e) {
    console.log("Error:", e);
  }
}

testVentasDelete();
