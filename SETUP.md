# Fallo Productions website: setup

## 1. Publish on GitHub Pages
1. Create a repository on GitHub and upload everything in this folder.
2. Go to **Settings → Pages → Build and deployment** and choose **Deploy from a branch**. Pick `main` and `/ (root)`.
3. After about a minute the site is live at `https://<username>.github.io/<repo>/`.

## 2. Connect the inventory to Supabase (free)
Until you do this, the inventory runs in **demo mode** and saves data only in your own browser.

1. Sign up at https://supabase.com and create a **New project**. The free plan is enough. Pick a region close to you, such as Stockholm or Frankfurt.
2. Open **SQL Editor**, paste in the whole of `supabase/schema.sql` and click **Run**.
3. Stop strangers from creating accounts:
   **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up".
4. Add yourself and any staff:
   **Authentication → Users → Add user → Create new user**. Enter an email and a password and tick "Auto confirm".
5. Make password-reset emails link back to your site:
   **Authentication → URL Configuration**: set **Site URL** to your GitHub Pages address.
6. Copy your keys:
   **Project Settings → API**. Copy the **Project URL** and the **anon / publishable** key into `js/config.js`.
   Never use the `service_role` or secret key on the website.
7. Upload the updated `config.js` to GitHub. Then go to `/login.html` and sign in.

**Free plan note:** a Supabase free project is paused after about 1 week with no activity. Your data is kept. Restore it with one click in the Supabase dashboard, or just use the inventory regularly.

## 3. Website inquiries
The contact form saves enquiries to Supabase. Staff see them under the **Inquiries** tab in the inventory.
1. If you set up Supabase before inquiries were added, open **SQL Editor**, paste in the "Inquiries" section at the bottom of `supabase/schema.sql` and click **Run**. Running the whole file again is also safe.
2. Send a test enquiry from the website and check that it shows up in the Inquiries tab.

If Supabase can't be reached, the form opens the visitor's email program instead, so enquiries still get through.
Supabase does **not** email you when a new inquiry arrives, so check the tab regularly. The number next to the tab shows how many are new.

## Where to edit things
| What | File |
|---|---|
| Projects, photos, showcase | `js/main.js` (the `PROJECTS` list at the top) |
| Photos | `images/projects/<project-id>/1.jpg, 2.jpg …` and `images/hero.jpg` |
| Contact details, logo, About text | `index.html` |
| Instagram / Facebook links | `index.html` (search for "SOCIAL LINKS") |
| Share preview (title, text, image) | `index.html` (the `og:` lines in `<head>`) |
| About photo | `images/about.jpg` |
| Favicon | `images/favicon.svg` |
| Database connection, currency | `js/config.js` |
