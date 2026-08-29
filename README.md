# Nature's Cart

An e-commerce app. React + Vite on the frontend, Express + MongoDB on the backend.

- `frontend/` → deploys to **Vercel**
- `backend/` → deploys to **Render**

---

## Running it locally

**Backend**

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values
npm run dev               # http://localhost:9000
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev               # http://localhost:5173
```

---

## Deploying

Do these in order. The two services need each other's URL, so the order matters.

### Step 1 — MongoDB Atlas

1. Make a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a user, save the password.
3. **Network Access** → Add IP Address → **Allow access from anywhere (0.0.0.0/0)**.
   Render does not give you a fixed IP, so restricting by IP will just block your own server.
4. Copy the connection string. It looks like:
   `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/ecommerce`
   Add the database name (`/ecommerce`) before the `?`, otherwise it writes to `test`.

### Step 2 — Backend on Render

1. [render.com](https://render.com) → **New** → **Web Service** → connect this repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
3. **Environment Variables** — add every key from `backend/.env.example` except `PORT`
   (Render sets that itself). The ones that matter most:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` ← **required**, see the note below |
   | `MONGODB_URI` | your Atlas string from step 1 |
   | `JWT_SECRET_KEY` | a long random string — generate with `openssl rand -hex 32` |
   | `FRONTEND_URL` | put `http://localhost:5173` for now, fix it in step 4 |
   | `BACKEND_URL` | your Render URL, once you know it |
   | `ADMIN_*` | the first admin account, created on first boot |
   | `NODEMAILER_*` | Gmail needs an **App Password**, not your login password |
   | `CLOUDINARY_*` | from your Cloudinary dashboard |

4. Deploy. When it's live, open `https://your-app.onrender.com/health` — you should see
   `{"success":true,"message":"Server is running"}`.

> **`NODE_ENV=production` is not optional.** The login cookie is only sent with
> `secure: true; sameSite: none` when this is set. Without it the browser silently drops
> the cookie and nobody can stay logged in — the login looks like it worked, then every
> page acts logged out.

### Step 3 — Frontend on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import this repo.
2. Settings:
   - **Root Directory:** `frontend`
   - Framework preset: **Vite** (it should detect this)
3. **Environment Variables:** add `VITE_API_URL` = your Render URL, **no slash at the end**:
   `https://your-app.onrender.com`
4. Deploy.

`vercel.json` is already in the repo. It tells Vercel to serve `index.html` for every path —
without it, refreshing the page on `/products` gives a 404, because React Router handles
those routes in the browser and Vercel would go looking for a real `/products` file.

### Step 4 — Point the backend at the frontend

Go back to Render → **Environment** → set `FRONTEND_URL` to your Vercel URL
(`https://your-app.vercel.app`, no trailing slash) and `BACKEND_URL` to your Render URL.
Save — Render redeploys automatically.

This closes the loop: CORS on the backend only allows the origins listed in `FRONTEND_URL`.
Preview deploys on `*.vercel.app` are allowed automatically.

### Step 5 — Check it

- `/health` on the backend responds
- Sign up → the verification email arrives
- Verify → log in → **refresh the page and confirm you are still logged in**
  (this is the test that catches a cookie misconfiguration)
- Log in as the admin and add a product

---

## Things to know about the free tiers

**Render sleeps your server after 15 minutes with no traffic.** The next request takes
40–60 seconds to wake it. The frontend's axios timeout is set to 60s to survive this, but
the first visitor after a quiet period will wait. A paid instance removes this, or you can
ping `/health` on a schedule to keep it awake.

**Third-party cookie blocking.** Your frontend is on `vercel.app` and your backend is on
`onrender.com` — two different sites, so the login cookie is a third-party cookie. Safari
blocks these by default, and Brave and Firefox do in some modes, which means **login can
fail for those users even though everything is configured correctly**. Chrome is fine.
The real fix is to put both behind one domain (e.g. `shop.yoursite.com` and
`api.yoursite.com`) using a custom domain on each service.

---

## Not done yet

Honest list of what is still missing, so nothing is a surprise later:

- **Payments.** Cash on Delivery only. PayPal is stubbed out in `src/config/paypal.config.js`
  and refunds/returns return 501.
- **Stock can oversell.** In `createOrder`, the stock check and the decrement are two separate
  steps with no transaction. Two people buying the last item at the same moment both succeed.
- **No pagination.** Products, orders, and users all return the whole collection. Fine for a
  demo, will get slow in the thousands.
- **Carts expire after 7 days** from creation via a TTL index, and the timer is never refreshed
  when the cart is updated.
- **No tests, no CI.**
