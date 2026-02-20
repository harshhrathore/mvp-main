$BaseUrl = "http://localhost:5000"
$global:token = ""
$global:userId = ""

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body,
        [bool]$Protected = $false
    )
    
    Write-Host "`n=== $Name ===" -ForegroundColor Cyan
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        if ($Protected) {
            $headers["Authorization"] = "Bearer $($global:token)"
        }
        
        $params = @{
            Uri = "$BaseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        $content | ConvertTo-Json -Depth 5 | Write-Host
        
        return $content
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $reader.ReadToEnd() | Write-Host -ForegroundColor Yellow
        }
        return $null
    }
}

# ===== AUTH TESTS =====
Write-Host "`n`n=== TESTING AUTH ENDPOINTS ===" -ForegroundColor Magenta

$registerResult = Test-Endpoint -Name "POST /api/auth/register" -Method "POST" -Endpoint "/api/auth/register" -Body @{
    email = "apitester_$(Get-Random)@test.com"
    password = "Test@123456"
    full_name = "API Tester"
}

if ($registerResult -and $registerResult.token) {
    $global:token = $registerResult.token
    $global:userId = $registerResult.data.id
    Write-Host "✅ Got token: $($global:token.Substring(0, 20))..." -ForegroundColor Green
    
    # Test getMe
    Test-Endpoint -Name "GET /api/auth/me" -Method "GET" -Endpoint "/api/auth/me" -Protected $true | Out-Null
}

# ===== ONBOARDING TESTS =====
Write-Host "`n`n=== TESTING ONBOARDING ENDPOINTS ===" -ForegroundColor Magenta

Test-Endpoint -Name "GET /api/onboarding/status" -Method "GET" -Endpoint "/api/onboarding/status" -Protected $true | Out-Null

Test-Endpoint -Name "POST /api/onboarding/health-baseline" -Method "POST" -Endpoint "/api/onboarding/health-baseline" -Body @{
    sleep = 7
    energy = 6
    appetite = 8
    pain = 2
    medications = @()
} -Protected $true | Out-Null

# ===== CHAT TESTS =====
Write-Host "`n`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║        TESTING CHAT ENDPOINTS         ║" -ForegroundColor Magenta
Write-Host "╚═══=== TESTING CHAT ENDPOINTS ===age" -Method "POST" -Endpoint "/api/chat/message" -Body @{
    message = "I am feeling anxious and stressed"
} -Protected $true

if ($chatResult) {
    Write-Host "✅ Chat message sent successfully" -ForegroundColor Green
}

Test-Endpoint -Name "GET /api/chat/session" -Method "GET" -Endpoint "/api/chat/session" -Protected $true | Out-Null

# ===== PREFERENCES TESTS =====
Write-Host "`n`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║      TESTING PREFERENCES ENDPOINTS    ║" -ForegroundColor Magenta
Write-Host "╚═══=== TESTING PREFERENCES ENDPOINTS ===T" -Endpoint "/api/preferences" -Protected $true | Out-Null

Test-Endpoint -Name "PATCH /api/preferences" -Method "PATCH" -Endpoint "/api/preferences" -Body @{
    voice_gender = "male"
    speaking_speed = "slow"
} -Protected $true | Out-Null

# ===== DOSHA TESTS =====
Write-Host "`n`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║       TESTING DOSHA ENDPOINTS         ║" -ForegroundColor Magenta
Write-Host "╚═══=== TESTING DOSHA ENDPOINTS ===it" -Method "POST" -Endpoint "/api/dosha/submit" -Body @{
    responses = @{
        "q1" = "a"
        "q2" = "b"
        "q3" = "a"
        "q4" = "c"
        "q5" = "b"
    }
} -Protected $true

Test-Endpoint -Name "GET /api/dosha/profile" -Method "GET" -Endpoint "/api/dosha/profile" -Protected $true | Out-Null

# ===== RECOMMENDATIONS TESTS =====
Write-Host "`n`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║      TESTING RECOMMENDATION ENDPOINTS ║" -ForegroundColor Magenta
Write-Host "╚═══=== TESTING RECOMMENDATION ENDPOINTS === "GET" -Endpoint "/api/recommendations" -Protected $true | Out-Null

# ===== CHECKIN TESTS =====
Write-Host "`n`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║       TESTING CHECKIN ENDPOINTS       ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Magenta

Test-Endpoint -N=== TESTING CHECKIN ENDPOINTS ===
    stress_level = 3
} -Protected $true | Out-Null

Test-Endpoint -Name "GET /api/checkin/today" -Method "GET" -Endpoint "/api/checkin/today" -Protected $true | Out-Null

# ===== ANALYTICS TESTS =====
Write-Host "`n`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║       TESTING ANALYTICS ENDPOINTS     ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Magenta

Test-Endpoint -N=== TESTING ANALYTICS ENDPOINTS ===" -Method "GET" -Endpoint "/api/analytics/emotion-trends" -Protected $true | Out-Null
Test-Endpoint -Name "GET /api/analytics/dosha-balance" -Method "GET" -Endpoint "/api/analytics/dosha-balance" -Protected $true | Out-Null
Test-Endpoint -Name "GET /api/analytics/practice-effectiveness" -Method "GET" -Endpoint "/api/analytics/practice-effectiveness" -Protected $true | Out-Null

# ===== VOICE TESTS =====
Write-Host "`n`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║        TESTING VOICE ENDPOINTS        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Magenta

Test-Endpoint -N=== TESTING VOICE ENDPOINTS ===
} -Protected $true | Out-Null

# ===== ACTIVITY TESTS =====
Write-Host "`n`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║        TESTING ACTIVITY ENDPOINTS     ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Magenta

Test-Endpoint -N=== TESTING ACTIVITY ENDPOINTS ===
} -Protected $true | Out-Null

Write-Host "`n`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ API TESTING COMPLETE!         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
=== API TESTING COMPLETE ===