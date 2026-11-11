param([Parameter(Mandatory=$true)][ValidatePattern('^[a-z0-9-]+$')][string]$StudyGroup)
$ErrorActionPreference = 'Stop'
$designerRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$evidenceRoot = Join-Path $PSScriptRoot '20261013'
$verification = Get-Content -LiteralPath (Join-Path $evidenceRoot "$StudyGroup-verification.json") -Raw | ConvertFrom-Json
$cliPath = Join-Path $designerRoot 'rr-cli.js'
function Invoke-DesignerCli([string[]]$CliArgs) {
    $outputLines = & node $cliPath @CliArgs
    if ($LASTEXITCODE -ne 0) { throw "Designer CLI failed: $CliArgs" }
    return ($outputLines -join "`n")
}
$cliResults = @()
foreach ($item in $verification.results) {
    $designPath = Join-Path $designerRoot "levels/$($item.stem).rrdesign.json"
    $packPath = Join-Path $designerRoot "levels/$($item.stem).rrpack.json"
    if (Test-Path -LiteralPath $packPath) { throw "Existing pack will not be overwritten: $packPath" }
    $validate = Invoke-DesignerCli @('validate', $designPath)
    $solveArgs = @('solve', $designPath, '--time', '6', '--nodes', '1000', '--json')
    if (-not $item.bombs) { $solveArgs += '--no-bombs' }
    $solution = (Invoke-DesignerCli $solveArgs) | ConvertFrom-Json
    if (-not $solution.found) { throw "CLI did not find a solution: $($item.stem)" }
    $bake = Invoke-DesignerCli @('pack', $designPath, '-o', $packPath, '--no-solve')
    $cliResults += [ordered]@{ stem=$item.stem; explodeBombs=$item.bombs; validate=$validate; solve=$solution; bake=$bake }
    Write-Output "$($item.stem): CLI OK + FOUND; pack created"
}
$cliReport = [ordered]@{ scope='Actual supplied CLI calls; no Unity'; results=$cliResults } | ConvertTo-Json -Depth 40
[System.IO.File]::WriteAllText((Join-Path $evidenceRoot "$StudyGroup-cli.json"), $cliReport, [System.Text.UTF8Encoding]::new($false))
& node (Join-Path $PSScriptRoot 'export-ongoing.js') $StudyGroup '--proof'
if ($LASTEXITCODE -ne 0) { throw 'Attach proof failed' }
& node (Join-Path $PSScriptRoot 'recheck-packs.js') $StudyGroup
if ($LASTEXITCODE -ne 0) { throw 'Serialized pack check failed' }
