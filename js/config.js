/* =========================================================
   Supabase connection
   Fill these in from Supabase → Project Settings → API.
   The "anon / publishable" key is safe to publish: the
   database's security rules (schema.sql) block anyone who
   isn't signed in.

   Leave both empty to run the inventory in DEMO MODE
   (data is only stored in your own browser).
   ========================================================= */

window.APP_CONFIG = {
  supabaseUrl: "https://amwhmidhjuqbygsjsaiy.supabase.co/rest/v1/",   // e.g. "https://abcdefgh.supabase.co"
  supabaseKey: "sb_publishable_9qJgV8-VwRen6VAwcN7ypw_AHUWuoY6",   // the anon / publishable key
  currency: "NOK",   // used for prices and equipment value
};
