# 🚀 MAZADAT DOCKER - START HERE

## ⏱️ 2-Minute Setup

### Step 1: Navigate to Project
```bash
cd C:\Users\Essa\OneDrive - RiyadhBoys\Desktop\Mazadat
```

### Step 2: Start Application

**Windows (PowerShell):**
```powershell
.\docker-manage.ps1 start
```

**Linux/Mac (Bash):**
```bash
chmod +x docker-manage.sh
./docker-manage.sh start
```

**Any OS:**
```bash
docker-compose up -d
```

### Step 3: Wait 30-60 Seconds

Let Docker pull images, build containers, and start services.

### Step 4: Open Browser

Visit: **http://localhost**

✅ **Done!** Your application is running!

---

## 📊 Verify It's Working

```bash
# Should show all "Up"
docker-compose ps

# Should show no errors  
docker-compose logs | head -50
```

---

## 🌐 Access Your Application

| Service | Link | Port |
|---------|------|------|
| Web App | http://localhost | 80 |
| API | http://localhost:8080 | 8080 |
| Database | localhost | 3306 |

---

## 🎮 Control Your Application

### Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose stop

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Stop completely
docker-compose down
```

### Using Management Script

**Windows:**
```powershell
.\docker-manage.ps1 start    # Start
.\docker-manage.ps1 stop     # Stop
.\docker-manage.ps1 logs     # Logs
.\docker-manage.ps1 status   # Status
.\docker-manage.ps1 rebuild  # Rebuild
```

**Linux/Mac:**
```bash
./docker-manage.sh start     # Start
./docker-manage.sh stop      # Stop
./docker-manage.sh logs      # Logs
./docker-manage.sh status    # Status
./docker-manage.sh rebuild   # Rebuild
```

---

## 🐛 Something Wrong?

### If container won't start:
```bash
docker-compose logs
```

### If port in use:
```bash
docker-compose down
# Edit docker-compose.yml - change port
docker-compose up -d
```

### If can't access http://localhost:
```bash
docker-compose ps
# Verify "frontend" is "Up"
docker-compose logs frontend
```

### If database error:
```bash
docker-compose restart mysql
docker-compose restart backend
sleep 5
```

---

## 📚 More Information

- **Quick Reference**: DOCKER_README.md
- **Complete Setup**: DOCKER_SETUP.md
- **Visual Guide**: VISUAL_GUIDE.md
- **Full Index**: DOCKER_INDEX.md

---

## ✅ One Command to Rule Them All

```bash
docker-compose build && docker-compose up -d && docker-compose logs -f
```

This builds, starts, and shows logs!

---

## 🎯 You're Done!

Everything is running. Start developing! 🚀

