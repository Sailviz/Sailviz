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

# send web files to server
Write-Host "Deploying web files to server..."
scp -r apps/web/dist/* root@192.168.3.42:/var/www/web/release

# send api files to server
Write-Host "Deploying API files to server..."
scp -r packages/api/dist/* root@192.168.3.185:/api

# restart api server
Write-Host "Restarting API server..."
ssh root@192.168.3.185 "pm2 restart sailviz-api"