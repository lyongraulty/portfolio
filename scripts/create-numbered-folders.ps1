$targetPath = Read-Host "Enter the full target path where folders page01-page15 should be created"

if ([string]::IsNullOrWhiteSpace($targetPath)) {
    Write-Error "No path provided. Exiting."
    exit 1
}

if (-not (Test-Path -LiteralPath $targetPath -PathType Container)) {
    $createBase = Read-Host "Path does not exist. Create it? (Y/N)"
    if ($createBase -match '^(Y|y)$') {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    }
    else {
        Write-Error "Base path not found. Exiting."
        exit 1
    }
}

1..15 | ForEach-Object {
    $folderName = "page{0:D2}" -f $_
    $folderPath = Join-Path -Path $targetPath -ChildPath $folderName
    New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
    Write-Host "Created: $folderPath"
}

Write-Host "Done. Created folders page01 through page15 in: $targetPath"
