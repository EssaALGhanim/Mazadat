# Mazadat Docker Management Script for Windows PowerShell
# Usage: .\docker-manage.ps1 [start|stop|build|logs|etc]

param(
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$Service = ""
)

# Colors
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$BLUE = "`e[34m"
$NC = "`e[0m"

function Print-Info { Write-Host "$BLUE[INFO]$NC $args" }
function Print-Success { Write-Host "$GREEN[✓]$NC $args" }
function Print-Error { Write-Host "$RED[✗]$NC $args" }
function Print-Warning { Write-Host "$YELLOW[⚠]$NC $args" }

function Check-Docker {
    try {
        $null = docker --version
        $null = docker-compose --version
        Print-Success "Docker and Docker Compose are installed"
    }
    catch {
        Print-Error "Docker is not installed or not in PATH. Please install Docker Desktop for Windows."
        exit 1
    }
}

function Build-Images {
    Print-Info "Building Docker images..."
    & docker-compose build
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Images built successfully"
    }
    else {
        Print-Error "Build failed"
        exit 1
    }
}

function Start-Containers {
    Print-Info "Starting containers..."
    & docker-compose up -d
    Print-Success "Containers started"

    Print-Info "Waiting for services to be ready..."
    Start-Sleep -Seconds 5

    $status = & docker-compose ps
    if ($status -match "Up") {
        Print-Success "Services are running!"
        Write-Host "Frontend: http://localhost"
        Write-Host "Backend API: http://localhost:8080"
        Write-Host "MySQL: localhost:3306"
    }
    else {
        Print-Error "Some services failed to start. Check logs with: docker-compose logs"
    }
}

function Stop-Containers {
    Print-Info "Stopping containers..."
    & docker-compose down
    Print-Success "Containers stopped"
}

function Show-Logs {
    if ([string]::IsNullOrEmpty($Service)) {
        & docker-compose logs -f
    }
    else {
        & docker-compose logs -f $Service
    }
}

function Show-Status {
    Print-Info "Container status:"
    & docker-compose ps
}

function Clean-Everything {
    Print-Warning "This will remove all containers, volumes, and images"
    $response = Read-Host "Are you sure? (yes/no)"

    if ($response -eq "yes") {
        Print-Info "Removing containers and volumes..."
        & docker-compose down -v
        Print-Success "Cleanup complete"
    }
    else {
        Print-Info "Cleanup cancelled"
    }
}

function Rebuild-All {
    Print-Info "Rebuilding and restarting..."
    Stop-Containers
    Build-Images
    Start-Containers
}

function Open-Bash {
    Print-Info "Opening bash shell in backend container..."
    & docker-compose exec backend bash
}

function Show-Help {
    $help = @"
Mazadat Docker Management Script for Windows

Usage: .\docker-manage.ps1 [COMMAND] [SERVICE]

Commands:
  build       - Build Docker images
  start       - Start containers
  stop        - Stop containers
  restart     - Restart containers (stop + start)
  rebuild     - Rebuild images and restart
  logs        - View logs (use 'logs backend' for specific service)
  status      - Show container status
  clean       - Remove all containers and volumes
  bash        - Open bash in backend container
  help        - Show this help message

Examples:
  .\docker-manage.ps1 start
  .\docker-manage.ps1 logs backend
  .\docker-manage.ps1 rebuild

Make sure Docker Desktop is running before executing commands.
"@
    Write-Host $help
}

# Main logic
switch ($Command.ToLower()) {
    "build" {
        Check-Docker
        Build-Images
    }
    "start" {
        Check-Docker
        Start-Containers
    }
    "stop" {
        Check-Docker
        Stop-Containers
    }
    "restart" {
        Check-Docker
        Stop-Containers
        Start-Containers
    }
    "rebuild" {
        Check-Docker
        Rebuild-All
    }
    "logs" {
        Check-Docker
        Show-Logs
    }
    "status" {
        Check-Docker
        Show-Status
    }
    "clean" {
        Check-Docker
        Clean-Everything
    }
    "bash" {
        Check-Docker
        Open-Bash
    }
    "help" {
        Show-Help
    }
    default {
        Print-Error "Unknown command: $Command"
        Show-Help
        exit 1
    }
}

