# Mazadat Docker Deployment Guide

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)
- Git

Install Docker: https://docs.docker.com/get-docker/
Install Docker Compose: https://docs.docker.com/compose/install/

## Quick Start

### Option 1: Using the Management Script (Recommended)

For **Linux/Mac**:
```bash
chmod +x docker-manage.sh
./docker-manage.sh start
```

For **Windows (PowerShell)**:
```powershell
# Make script executable (if needed)
.\docker-manage.ps1 start
```

### Option 2: Using Docker Compose Directly

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## What Gets Deployed

1. **MySQL Database** (port 3306)
   - Database: `mazadat`
   - User: `mazadat_user`
   - Password: `mazadat_password`

2. **Spring Boot Backend** (port 8080)
   - API endpoint: `http://localhost:8080`
   - Auto-configures with MySQL
   - Uploads stored in `/app/uploads` volume

3. **React Frontend** (port 80)
   - Web interface: `http://localhost`
   - Proxies API requests to backend
   - Served via Nginx with caching

## Accessing the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Database**: localhost:3306

## Management Commands

```bash
# View status of all containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Stop containers (data persists)
docker-compose stop

# Start stopped containers
docker-compose start

# Restart containers
docker-compose restart

# Remove containers (data persists in volumes)
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Open shell in backend container
docker-compose exec backend bash

# View MySQL from command line
docker-compose exec mysql mysql -u mazadat_user -p mazadat
```

## Health Checks

All services have health checks configured:
- **MySQL**: Checks every 10s
- **Backend**: Checks every 30s (after 10s startup period)
- **Frontend**: Checks every 30s

View health status:
```bash
docker-compose ps
```

## Environment Variables

### Backend Container

You can override these by creating a `.env` file:

```
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/mazadat
SPRING_DATASOURCE_USERNAME=mazadat_user
SPRING_DATASOURCE_PASSWORD=mazadat_password
SERVER_PORT=8080
MAZADAT_UPLOAD_DIR=/app/uploads
```

## Volumes

- `mysql_data`: Stores MySQL database files
- `./Mazadat/uploads`: Stores uploaded auction images

These volumes persist data even after containers stop.

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose logs

# Check Docker daemon
docker ps
```

### Port already in use
```bash
# Find process using port
lsof -i :80    # Frontend
lsof -i :8080  # Backend
lsof -i :3306  # MySQL

# Or change port in docker-compose.yml
# Then restart:
docker-compose down
docker-compose up -d
```

### Database connection errors
```bash
# Check MySQL is running
docker-compose logs mysql

# Check backend can reach MySQL
docker-compose exec backend ping mysql

# Restart MySQL
docker-compose restart mysql
```

### Frontend can't reach API
```bash
# Check backend is running
docker-compose logs backend

# Check networking
docker-compose exec frontend curl http://backend:8080/health
```

### Permission denied errors (Linux)
```bash
# Add current user to docker group
sudo usermod -aG docker $USER
# Then log out and back in
```

## Performance Tips

1. **Use named volumes**: Already configured
2. **Limit logs**: Configure logging driver in docker-compose.yml
3. **Resource limits**: Add to services in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 2G
   ```

## Production Deployment

For production, consider:

1. **Use environment files**: Create `.env.prod`
2. **Enable HTTPS**: Use reverse proxy (nginx, traefik)
3. **Database backups**: Regular MySQL backups
4. **Resource limits**: Set CPU and memory limits
5. **Log rotation**: Configure centralized logging
6. **Registry**: Push images to Docker registry (Docker Hub, ECR, etc.)

### Example Production docker-compose.yml additions:

```yaml
services:
  backend:
    environment:
      SPRING_PROFILES_ACTIVE: production
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
    restart: always
```

## Network Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP:80
┌──────▼──────────────┐
│   Nginx (Frontend)  │
└──────┬──────────────┘
       │ Proxies /api
┌──────▼──────────────┐
│ Spring Boot Backend │
└──────┬──────────────┘
       │ JDBC:3306
┌──────▼──────────────┐
│   MySQL Database    │
└─────────────────────┘

All connected via: mazadat-network (bridge)
```

## Useful Docker Commands

```bash
# View image details
docker images | grep mazadat

# Remove unused images
docker image prune

# View detailed logs with timestamps
docker-compose logs --timestamps -f

# Execute command in running container
docker-compose exec backend ls -la /app/uploads

# Copy file from container
docker cp mazadat-backend:/app/uploads/file.jpg ./

# Monitor resource usage
docker stats

# Inspect container
docker inspect mazadat-backend
```

## Security Notes

- Change default MySQL password in `.env` file
- Use environment variables for sensitive data
- Never commit `.env` files to version control
- Use Docker secrets in production (Swarm/Kubernetes)
- Regularly update base images

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Verify all containers are running: `docker-compose ps`
3. Ensure ports are available
4. Check Docker daemon is running
5. Verify Docker version compatibility

