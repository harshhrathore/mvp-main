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
        Write-Host "OK: $($response.StatusCode)" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        $content | ConvertTo-Json -Depth 5 | Write-Host
        return $content
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n=== AUTH ENDPOINTS ===" -ForegroundColor Yellow

$registerResult = Test-Endpoint -Name "POST /api/auth/register" -Method "POST" -Endpoint "/api/auth/register" -Body @{
    email = "apitester_$(Get-Random)@test.com"
    password = "Test@123456"
    full_name = "API Tester"
}

if ($registerResult -and $registerResult.token) {
    $global:token = $registerResult.token
    $global:userId = $registerResult.data.id
    Write-Host "Got token!" -ForegroundColor Green
    
    Test-Endpoint -Name "GET /api/auth/me" -Method "GET" -Endpoint "/api/auth/me" -Protected $true | Out-Null
}

Write-Host "`n=== ONBOARDING ENDPOINTS ===" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/onboarding/status" -Method "GET" -Endpoint "/api/onboarding/status" -Protected $true | Out-Null

Test-Endpoint -Name "POST /api/onboarding/health-baseline" -Method "POST" -Endpoint "/api/onboarding/health-baseline" -Body @{
    sleep = 7
    energy = 6
    appetite = 8
    pain = 2
    medications = @()
} -Protected $true | Out-Null

Write-Host "`n=== CHAT ENDPOINTS ===" -ForegroundColor Yellow

$chatResult = Test-Endpoint -Name "POST /api/chat/message" -Method "POST" -Endpoint "/api/chat/message" -Body @{
    message = "I am feeling anxious and stressed"
} -Protected $true

Test-Endpoint -Name "GET /api/chat/session" -Method "GET" -Endpoint "/api/chat/session" -Protected $true | Out-Null

Write-Host "`n=== PREFERENCES ENDPOINTS ===" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/preferences" -Method "GET" -Endpoint "/api/preferences" -Protected $true | Out-Null

Test-Endpoint -Name "PATCH /api/preferences" -Method "PATCH" -Endpoint "/api/preferences" -Body @{
    voice_gender = "male"
    speaking_speed = "slow"
} -Protected $true | Out-Null

Write-Host "`n=== DOSHA ENDPOINTS ===" -ForegroundColor Yellow

$doshaQuiz = Test-Endpoint -Name "POST /api/dosha/submit" -Method "POST" -Endpoint "/api/dosha/submit" -Body @{
    responses = @{
        "q1" = "a"
        "q2" = "b"
        "q3" = "a"
        "q4" = "c"
        "q5" = "b"
    }
} -Protected $true

Test-Endpoint -Name "GET /api/dosha/profile" -Method "GET" -Endpoint "/api/dosha/profile" -Protected $true | Out-Null

Write-Host "`n=== RECOMMENDATION ENDPOINTS ===" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/recommendations" -Method "GET" -Endpoint "/api/recommendations" -Protected $true | Out-Null

Write-Host "`n=== CHECKIN ENDPOINTS ===" -ForegroundColor Yellow

Test-Endpoint -Name "POST /api/checkin" -Method "POST" -Endpoint "/api/checkin" -Body @{
    sleep_quality = 7
    energy_levels = 6
    stress_level = 3
} -Protected $true | Out-Null

Test-Endpoint -Name "GET /api/checkin/today" -Method "GET" -Endpoint "/api/checkin/today" -Protected $true | Out-Null

Write-Host "`n=== ANALYTICS ENDPOINTS ===" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/analytics/daily" -Method "GET" -Endpoint "/api/analytics/daily" -Protected $true | Out-Null
Test-Endpoint -Name "GET /api/analytics/weekly" -Method "GET" -Endpoint "/api/analytics/weekly" -Protected $true | Out-Null
Test-Endpoint -Name "GET /api/analytics/emotion-trends" -Method "GET" -Endpoint "/api/analytics/emotion-trends" -Protected $true | Out-Null
Test-Endpoint -Name "GET /api/analytics/dosha-balance" -Method "GET" -Endpoint "/api/analytics/dosha-balance" -Protected $true | Out-Null
Test-Endpoint -Name "GET /api/analytics/practice-effectiveness" -Method "GET" -Endpoint "/api/analytics/practice-effectiveness" -Protected $true | Out-Null

Write-Host "`n=== VOICE ENDPOINTS ===" -ForegroundColor Yellow

Test-Endpoint -Name "POST /api/voice/upload" -Method "POST" -Endpoint "/api/voice/upload" -Body @{
    audio_base64 = "SGVsbG8gV29ybGQ="
    duration_seconds = 5
} -Protected $true | Out-Null

Write-Host "`n=== ACTIVITY ENDPOINTS ===" -ForegroundColor Yellow

Test-Endpoint -Name "POST /api/activity" -Method "POST" -Endpoint "/api/activity" -Body @{
    activity_type = "yoga"
    duration_minutes = 15
} -Protected $true | Out-Null

Write-Host "`n=== API TESTING COMPLETE ===" -ForegroundColor Green
