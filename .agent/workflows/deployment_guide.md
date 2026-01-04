---
description: Comprehensive guide to deploying the Next.js application to live servers.
---

# Deploying Your Next.js Application

There are two main ways to take your application live. Choose the one that fits your resources.

## Option 1: Vercel (Recommended for You)
**Perfect if you don't have a server.** Vercel provides a generic "Free Tier" which is sufficient for personal projects and small prototypes.
- **Cost**: $0 (Free)
- **Server**: Not required (Managed by Vercel)
- **Domain**: You get a free `your-app.vercel.app` domain.

**Prerequisites:**
- A [GitHub](https://github.com/) account (Free).
- [Git](https://git-scm.com/downloads) installed on your computer.

**Steps:**
1.  **Initialize Git**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  **Push to GitHub**: Create a new repository on GitHub and push your code.
3.  **Connect to Vercel**:
    - Go to [Vercel.com](https://vercel.com) and sign up with GitHub.
    - Click "Add New Project" and select your repository.
    - Click "Deploy".
    - **Done!** You will get a live URL (e.g., `payment-app.vercel.app`).

---

## Option 2: VPS or cPanel (Hostinger, GoDaddy, etc.)
Use this if you already have a paid hosting plan running Node.js.

**Prerequisites:**
- Hosting that supports **Node.js** (not just PHP).
- Access to cPanel or Terminal (SSH).

**Steps:**
1.  **Build the Project Locally**:
    Run the following command in your terminal:
    ```bash
    npm run build
    ```
    This creates a `.next` folder with the production build.

2.  **Prepare Files for Upload**:
    You need to upload these files/folders to your server (usually `public_html` or a subfolder):
    - `.next` (folder)
    - `public` (folder)
    - `package.json`
    - `next.config.ts` (or .js)
    - `.env` (if you have environment variables)

3.  **Install Dependencies on Server**:
    - Go to your server terminal (or Node.js manager in cPanel).
    - Navigate to the folder where you uploaded files.
    - Run: `npm install --production`

4.  **Start the Server**:
    - Run: `npm start` (or use a process manager like **PM2** for stability: `pm2 start npm --name "my-app" -- start`).
    - Your app will run on the specified port. You may need to set up a reverse proxy (Nginx/Apache) or point your domain to that port.

## Recommendation
For this "Payment Soft" app, **Option 1 (Vercel)** is highly recommended for stability and zero-configuration deployment.
