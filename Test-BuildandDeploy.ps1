# this updates the test server with the latest build of the api and web packages
pnpm run build:test:api
if ($LASTEXITCODE -ne 0) {
    Write-Error "API build failed. Exiting script."
    exit $LASTEXITCODE
}
pnpm run build:test:web
if ($LASTEXITCODE -ne 0) {
    Write-Error "Web build failed. Exiting script."
    exit $LASTEXITCODE
}

pnpm run build:test:worker
if ($LASTEXITCODE -ne 0) {
    Write-Error "Web build failed. Exiting script."
    exit $LASTEXITCODE
}

# send web files to server
Write-Host "Deploying web files to server..."
scp -i ~/.ssh/id_ed25519_web -r apps/web/dist/* web@192.168.3.42:/var/www/web/release

# send api files to server
Write-Host "Deploying API files to server..."
scp -i ~/.ssh/id_ed25519_api -r apps/api/dist/* api@192.168.3.185:/home/api

# restart api server
Write-Host "Restarting API server..."
ssh -i ~/.ssh/id_ed25519_api api@192.168.3.185 "pm2 restart sailviz-api"

# send worker files to server
Write-Host "Deploying worker files to server..."
scp -i ~/.ssh/id_ed25519_worker -r apps/worker/dist/* worker@192.168.3.44:/home/worker
ssh -i ~/.ssh/id_ed25519_worker worker@192.168.3.44 "pm2 restart worker"
