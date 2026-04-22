# Mazadat Railway Deployment Guide

This guide is written for someone deploying to Railway for the first time.

## What you will create on Railway

- 1 MySQL database
- 1 backend service for the Spring Boot app
- 1 frontend service for the React app
- 1 Railway bucket/storage setup for auction images

---

## 1) Push your code to GitHub

Railway deploys easiest from GitHub.

1. Create a GitHub repository if you do not already have one.
2. Push this project to GitHub.
3. Make sure both folders are included:
    - `Mazadat/` for the backend
    - `frontend/` for the frontend

---

## 2) Create a Railway project

1. Go to Railway and sign in.
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Connect your GitHub account.
5. Select the repository that contains Mazadat.

---

## 3) Create the MySQL database

1. Inside the Railway project, click **New**.
2. Choose **Database**.
3. Select **MySQL**.
4. Railway will create a database service for you.
5. Open the database service and copy the connection values.

You will need these for the backend:

- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLDATABASE`
- `MYSQLUSER`
- `MYSQLPASSWORD`

---

## 4) Deploy the backend

1. Add a new service from the same GitHub repo.
2. Set the service root directory to:
    - `Mazadat`
3. Railway should detect the backend Dockerfile in `Mazadat/Dockerfile`.
4. Add these environment variables to the backend service:

```env
SPRING_PROFILES_ACTIVE=docker
PORT=8080
SPRING_DATASOURCE_URL=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=${MYSQLUSER}
SPRING_DATASOURCE_PASSWORD=${MYSQLPASSWORD}
SPRING_JPA_HIBERNATE_DDL_AUTO=update
MAZADAT_STORAGE_MODE=s3
MAZADAT_IMAGE_PUBLIC_BASE_URL=<your-bucket-public-url>
MAZADAT_S3_ENDPOINT=<your-bucket-s3-endpoint>
MAZADAT_S3_REGION=us-east-1
MAZADAT_S3_BUCKET=<your-bucket-name>
MAZADAT_S3_ACCESS_KEY=<your-access-key>
MAZADAT_S3_SECRET_KEY=<your-secret-key>
MAZADAT_S3_PATH_PREFIX=images
MAZADAT_CORS_ALLOWED_ORIGINS=<your-frontend-domain>
```

5. Deploy the backend service.

### Important backend note

The app now uses the Railway port automatically through:
- `server.port=${PORT:8080}`

So Railway can assign a dynamic port safely.

---

## 5) Set up bucket storage for images

Your app currently stores image URLs in the database, so the backend must upload files to a bucket and save the public URL.

### What to set

- `MAZADAT_STORAGE_MODE=s3`
- `MAZADAT_S3_BUCKET=...`
- `MAZADAT_S3_ENDPOINT=...`
- `MAZADAT_S3_REGION=...`
- `MAZADAT_S3_ACCESS_KEY=...`
- `MAZADAT_S3_SECRET_KEY=...`
- `MAZADAT_IMAGE_PUBLIC_BASE_URL=...`

### What this means

- The backend uploads images to the bucket
- The database stores the image URL
- The frontend reads that URL and displays the image

If Railway gives you a public bucket URL, use that as `MAZADAT_IMAGE_PUBLIC_BASE_URL`.

---

## 6) Deploy the frontend

1. Add another service from the same GitHub repo.
2. Set the service root directory to:
    - `frontend`
3. Railway should detect `frontend/Dockerfile`.
4. Add these environment variables:

```env
VITE_API_URL=https://<your-backend-domain>/api/v1
VITE_IMAGE_BASE_URL=https://<your-backend-domain>
VITE_API_PROXY_TARGET=https://<your-backend-domain>
```

If your bucket has its own public URL, you can use that instead for `VITE_IMAGE_BASE_URL`.

5. Deploy the frontend service.

---

## 7) Update CORS on the backend

After Railway gives you the frontend domain, set:

```env
MAZADAT_CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>
```

If you want to allow more than one origin, separate them with commas.

Example:

```env
MAZADAT_CORS_ALLOWED_ORIGINS=https://app.example.com,https://www.example.com
```

---

## 8) Check the app after deployment

After both services are deployed:

1. Open the frontend URL.
2. Try logging in.
3. Try loading auctions.
4. Try opening an auction detail page.
5. Try uploading an image.
6. Try downloading a receipt after an auction ends.

If images do not load:
- check `MAZADAT_IMAGE_PUBLIC_BASE_URL`
- check bucket permissions
- check that the image URL saved in the database is public

If login or API calls fail:
- check `VITE_API_URL`
- check backend CORS
- check backend database credentials

---

## 9) Common beginner mistakes

### Mistake 1: Using localhost in production
Do not use:

- `http://localhost:8080`
- `http://localhost:5173`

on Railway.

Use your Railway service URLs instead.

### Mistake 2: Forgetting environment variables
If Railway has no database or bucket variables, the backend will fail to start.

### Mistake 3: Wrong image URL base
If the backend stores a bucket URL but the frontend still points at localhost, images will not show.

### Mistake 4: CORS not allowing the frontend
The backend must allow the Railway frontend domain.

---

## 10) Quick deployment order

Use this order:

1. Push code to GitHub
2. Create Railway project
3. Create MySQL database
4. Deploy backend
5. Set bucket storage env vars
6. Deploy frontend
7. Update backend CORS with frontend domain
8. Test login, images, and receipts

---

## 11) If you want to keep local development too

Keep `.env.example` for local Docker Compose use.

For local dev:
- backend can use Docker Compose MySQL
- frontend can use localhost URLs

For Railway:
- backend uses Railway MySQL
- frontend uses Railway backend URL
- images use Railway bucket/public URL

---

## 12) Final check

Before you tell Railway to deploy, verify these values:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `MAZADAT_STORAGE_MODE`
- `MAZADAT_IMAGE_PUBLIC_BASE_URL`
- `MAZADAT_S3_ENDPOINT`
- `MAZADAT_S3_BUCKET`
- `MAZADAT_S3_ACCESS_KEY`
- `MAZADAT_S3_SECRET_KEY`
- `MAZADAT_CORS_ALLOWED_ORIGINS`
- `VITE_API_URL`
- `VITE_IMAGE_BASE_URL`

If all of those are set correctly, the app should be ready for Railway.