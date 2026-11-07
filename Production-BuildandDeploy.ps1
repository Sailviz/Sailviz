# this updates the test server with the latest build of the api and web packages

$env:TAURI_SIGNING_PRIVATE_KEY="Z:\Sailviz\~\.tauri\myapp.key"

pnpm run build:prod:api
if ($LASTEXITCODE -ne 0) {
    Write-Error "API build failed. Exiting script."
    exit $LASTEXITCODE
}
pnpm run build:prod:web
if ($LASTEXITCODE -ne 0) {
    Write-Error "Web build failed. Exiting script."
    exit $LASTEXITCODE
}

pnpm run build:prod:worker
if ($LASTEXITCODE -ne 0) {
    Write-Error "Web build failed. Exiting script."
    exit $LASTEXITCODE
}

# send web files to server
Write-Host "Deploying web files to server..."
scp -i ~/.ssh/id_ed25519_web -r apps/web/dist/* web@192.168.3.16:/var/www/web/release

# send api files to server
Write-Host "Deploying API files to server..."
scp -i ~/.ssh/id_ed25519_api -r apps/api/dist/* api@192.168.3.15:/home/api

# restart api server
Write-Host "Restarting API server..."
ssh -i ~/.ssh/id_ed25519_api api@192.168.3.15 "pm2 restart sailviz-api"

# send worker files to server
Write-Host "Deploying worker files to server..."
scp -i ~/.ssh/id_ed25519_worker -r apps/worker/dist/* worker@192.168.3.46:/home/worker
ssh -i ~/.ssh/id_ed25519_worker worker@192.168.3.46 "pm2 restart worker"
