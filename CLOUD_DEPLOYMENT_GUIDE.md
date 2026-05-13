# Cloud Deployment Guide (Atlas + Render + Vercel)

This guide will walk you through hosting your Digital Waiter System using modern, free-tier-friendly cloud platforms. We will use **MongoDB Atlas** for the database, **Render** for the Node.js backend, and **Vercel** for the React frontend.

---

## 🟢 Step 1: Host Database on MongoDB Atlas

MongoDB Atlas provides a managed cloud database.

1. **Create an Account & Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up.
   - Click **Build a Database** and select the **Free (M0)** tier.
   - Choose a cloud provider (AWS/GCP/Azure) and a region close to your users, then click **Create**.

2. **Set up Database Access**
   - Under **Security > Database Access** (left sidebar), click **Add New Database User**.
   - Create a username and a strong password. **Save this password!**
   - Click **Add User**.

3. **Set up Network Access**
   - Under **Security > Network Access**, click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect to it. Click **Confirm**.

4. **Get the Connection String**
   - Go back to **Database** (under Deployment).
   - Click **Connect** on your cluster, then select **Drivers**.
   - Copy the connection string. It will look like this:
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with the credentials you created in step 2. Append `digital_waiter` before the `?` to specify the database name:
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/digital_waiter?retryWrites=true&w=majority`

---

## 🔵 Step 2: Host Backend on Render

Render is a great platform for hosting Node.js and Express apps.

### Prepare your backend for Render
Ensure your backend package.json has a start script. Your `backend/package.json` should have:
```json
"scripts": {
  "start": "node src/server.js"
}
```

### Deploy to Render
1. **Push to GitHub**
   - Commit your entire project (`frontend` and `backend`) and push it to a GitHub repository.

2. **Create Render Web Service**
   - Go to [Render](https://render.com/) and sign up with GitHub.
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository.

3. **Configure the Web Service**
   - **Name:** `digital-waiter-api` (or similar)
   - **Root Directory:** `backend` (very important!)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - Select the **Free** instance type.

4. **Set Environment Variables**
   - Scroll down to **Environment Variables** and add the following:
     - `PORT` = `10000` (Render's default)
     - `MONGODB_URI` = `[Paste your Atlas connection string from Step 1]`
     - `JWT_SECRET` = `[Generate a random 64-character string]`
     - `CLIENT_URL` = `[Leave blank for now, we will update this after Vercel deployment]`

5. **Deploy**
   - Click **Create Web Service**.
   - Wait for the build to finish. Once live, copy your backend URL (e.g., `https://digital-waiter-api.onrender.com`).

---

## 🔺 Step 3: Host Frontend on Vercel

Vercel is optimized for Vite and React apps.

1. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com/) and sign up with GitHub.
   - Click **Add New...** > **Project**.
   - Import your GitHub repository.

2. **Configure the Project**
   - **Project Name:** `digital-waiter`
   - **Root Directory:** Edit this and select `frontend`. Click **Continue**.
   - **Framework Preset:** Vercel should auto-detect **Vite**. If not, select it.

3. **Set Environment Variables**
   - Expand the **Environment Variables** section and add:
     - `VITE_API_URL` = `https://digital-waiter-api.onrender.com/api` *(Replace with your actual Render URL)*

4. **Deploy**
   - Click **Deploy**.
   - Once completed, Vercel will give you a public URL (e.g., `https://digital-waiter.vercel.app`).

---

## 🔗 Step 4: Link Everything Together

Now that the frontend is live, we need to tell the backend to accept requests from it (CORS).

1. Go back to your **Render** dashboard.
2. Select your Web Service (`digital-waiter-api`) and go to **Environment**.
3. Update or Add the `CLIENT_URL` variable:
   - `CLIENT_URL` = `https://digital-waiter.vercel.app` *(Replace with your Vercel URL. Do not add a trailing slash)*
4. Render will automatically redeploy the backend with the new setting.

---

## 🚀 Step 5: Seed the Production Database

Your MongoDB Atlas database is currently empty. You need to create the admin user and tables.

Since your backend is live on Render, you can use a local terminal to seed the remote database:

1. On your local machine, open the `backend/.env` file.
2. Temporarily change `MONGODB_URI` to your **Atlas Connection String**.
3. Run the seed scripts from your terminal:
   ```bash
   cd backend
   npm run seed
   node src/seed/seedTables.js
   node src/seed/seedMenu.js
   ```
4. **Revert** your local `backend/.env` back to `mongodb://127.0.0.1:27017/digital_waiter` for local development.

### Congratulations! 🎉
Your Digital Waiter System is now fully live on the cloud. You can visit your Vercel URL, log in with `admin@restaurant.com` / `admin123`, and generate live QR codes for your tables!
