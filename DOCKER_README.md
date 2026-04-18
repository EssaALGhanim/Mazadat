# Mazadat Docker Setup - Quick Reference

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (included in Docker Desktop)
- At least 4GB RAM available for Docker

### Installation Links
- [Docker Desktop (Windows/Mac)](https://www.docker.com/products/docker-desktop)
- [Docker Engine (Linux)](https://docs.docker.com/engine/install/)

## 🚀 Quick Start (Choose Your Method)

### Windows Users (Recommended)
```powershell
# Open PowerShell in the project root directory
.\docker-manage.ps1 start
```

### Linux/Mac Users
```bash
# Open Terminal in the project root directory
chmod +x docker-manage.sh
./docker-manage.sh start
```

### Any OS (Direct Docker Compose)
```bash
docker-compose build
docker-compose up -d
```

## ✅ Verify Everything is Working

```bash
# Check all containers are running
docker-compose ps

# Should show all services as "Up"
```

## 🌐 Access Your Application

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost | React Web App |
| **Backend API** | http://localhost:8080 | Spring Boot REST API |
| **MySQL DB** | localhost:3306 | Database (use DB client) |

## 📊 Database Access

### Using Command Line
```bash
docker-compose exec mysql mysql -u mazadat_user -p mazadat
# Password: mazadat_password
```

### Using GUI Tool
1. Download [MySQL Workbench](https://www.mysql.com/products/workbench/) or [DBeaver](https://dbeaver.io/)
2. Connection details:
   - **Host**: localhost
   - **Port**: 3306
   - **Username**: mazadat_user
   - **Password**: mazadat_password
   - **Database**: mazadat

## 🛠️ Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Restart Services
```bash
docker-compose restart
```

### Stop Without Removing Data
```bash
docker-compose stop
docker-compose start
```

### Full Cleanup (⚠️ Removes Everything)
```bash
docker-compose down -v
```

### Rebuild After Code Changes
```bash
# For backend changes
docker-compose build backend
docker-compose up -d backend

# For frontend changes
docker-compose build frontend
docker-compose up -d frontend

# For both
docker-compose up -d --build
```

## 📁 Project Structure

```
Mazadat/
├── docker-compose.yml          # Docker orchestration
├── docker-manage.sh            # Management script (Linux/Mac)
├── docker-manage.ps1           # Management script (Windows)
├── DOCKER_SETUP.md            # Detailed guide
├── frontend/
│   ├── Dockerfile             # Frontend image definition
│   ├── nginx.conf             # Nginx configuration
│   └── .dockerignore          # Files to exclude from image
├── Mazadat/
│   ├── Dockerfile             # Backend image definition
│   ├── .dockerignore          # Files to exclude from image
│   ├── pom.xml               # Maven dependencies
│   └── src/                  # Java source code
└── uploads/                  # Volume for uploaded files
```

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `port is already allocated`

**Solution**:
```bash
# Find what's using the port
# Windows:
netstat -ano | findstr :80
netstat -ano | findstr :8080

# Linux/Mac:
lsof -i :80
lsof -i :8080

# Kill the process or change port in docker-compose.yml
```

### Container Exits Immediately

```bash
# Check why it failed
docker-compose logs mysql
docker-compose logs backend
docker-compose logs frontend

# Common causes:
# 1. Not enough disk space
# 2. Port already in use
# 3. Insufficient memory
```

### Frontend Can't Reach Backend

```bash
# Check if backend is running
docker-compose exec frontend curl http://backend:8080/health

# Check backend logs
docker-compose logs backend
```

### Database Connection Failed

```bash
# Check MySQL is ready
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql

# Wait a few seconds and try again
```

### Images Won't Build

```bash
# Clear Docker cache
docker system prune

# Rebuild everything
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

## 📝 Logs & Debugging

### Backend Logs
```bash
docker-compose logs -f backend | tail -100
```

### Frontend Errors
```bash
# Open Browser Dev Tools (F12)
# Check Console and Network tabs
# Also check container logs
docker-compose logs frontend
```

### Database Queries
```bash
# MySQL logs show all queries
docker-compose logs -f mysql | grep -i "SELECT\|INSERT\|UPDATE"
```

## 🔒 Security Notes

### Default Credentials
- MySQL Username: `mazadat_user`
- MySQL Password: `mazadat_password`
- MySQL Root Password: `root_password`

⚠️ **Change these for production!**

### Production Setup
1. Create `.env` file with secure passwords:
```
MYSQL_ROOT_PASSWORD=<strong-password>
MYSQL_PASSWORD=<strong-password>
```

2. Update `docker-compose.yml` to use `.env`
3. Use environment variables instead of hardcoding secrets
4. Enable HTTPS with reverse proxy
5. Set resource limits
6. Enable log rotation

## 📈 Performance

### Check Resource Usage
```bash
docker stats
```

### Optimize Memory
Edit `docker-compose.yml`:
```yaml
services:
  mysql:
    deploy:
      resources:
        limits:
          memory: 2G
```

## 🔄 Update Services

### Update Frontend Code
```bash
# Make changes to frontend code
# Then rebuild
docker-compose build frontend
docker-compose up -d frontend
```

### Update Backend Code
```bash
# Make changes to backend code
# Then rebuild
docker-compose build backend
docker-compose up -d backend
```

### Update Dependencies
```bash
# Add new npm packages
npm install <package>

# Add new Maven dependencies
# Edit pom.xml
# Then rebuild
docker-compose build backend
```

## 📚 More Information

For detailed information, see:
- `DOCKER_SETUP.md` - Comprehensive setup guide
- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/

## ❓ Still Having Issues?

1. **Check Docker is running**: Make sure Docker Desktop/Engine is running
2. **Check space**: Ensure you have at least 10GB free disk space
3. **Check ports**: Verify ports 80, 8080, 3306 are available
4. **View logs**: `docker-compose logs` shows all errors
5. **Restart everything**: `docker-compose down && docker-compose up -d`

## 🎯 Next Steps

1. ✅ Run `docker-compose up -d`
2. ✅ Open http://localhost in your browser
3. ✅ Check backend at http://localhost:8080
4. ✅ Monitor logs with `docker-compose logs -f`
5. ✅ Start developing!

---

**Questions?** Refer to `DOCKER_SETUP.md` for comprehensive documentation.

