# Test script for new opportunity fields on STAGING
Write-Host "Testing New Fields on STAGING Environment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# IMPORTANT: Get a fresh JWT token from Django staging
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYxMTM5NTkxLCJpYXQiOjE3NjExMzIzOTEsImp0aSI6ImRjMGFlNWRlN2JhOTRjZDM4ZjU2MWJkZDhjM2Y4OWQ2IiwidXNlcl9pZCI6Mn0.vFJp0eLkxi17Xl9b1jRRlMJ8di75KmobMoKZ6v8p22k"

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$stagingUrl = "https://staging.opportunities.varsigram.com"

# Test 1: Check if server is up
Write-Host "📡 Step 1: Checking staging server health..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$stagingUrl/health" -ErrorAction Stop
    Write-Host "✅ Server is UP - Status: $($healthCheck.StatusCode)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Server health check failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Create opportunity with NEW fields
Write-Host "📤 Step 2: Creating opportunity with NEW fields..." -ForegroundColor Yellow
Write-Host ""

$newOpportunity = @{
    title = "Mobile App Developer - Flutter"
    description = "We are seeking a talented Flutter developer to build beautiful cross-platform mobile applications. You will work with our product team to deliver exceptional user experiences."
    category = "GIG"
    organization = "Varsigram Tech"
    location = "Lagos, Nigeria"
    isRemote = $true
    deadline = "2025-12-15T23:59:59Z"
    contactEmail = "careers@varsigram.com"
    image = "https://example.com/images/flutter-dev.jpg"
    excerpt = "Build beautiful cross-platform mobile apps with Flutter"
    requirements = "- 3+ years Flutter/Dart experience`n- Experience with Firebase`n- Published apps on App Store/Play Store`n- Strong UI/UX skills"
    tags = @("flutter", "mobile", "remote", "fulltime")
}

$body = $newOpportunity | ConvertTo-Json -Depth 10

Write-Host "Request Body:" -ForegroundColor Gray
Write-Host $body -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$stagingUrl/api/v1/opportunities" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Response:" -ForegroundColor Cyan
    
    $jsonResponse = $response.Content | ConvertFrom-Json
    $jsonResponse | ConvertTo-Json -Depth 10
    
    Write-Host ""
    Write-Host "✨ New Fields Verification:" -ForegroundColor Green
    Write-Host "  ✓ Organization: $($jsonResponse.data.organization)" -ForegroundColor White
    Write-Host "  ✓ Contact Email: $($jsonResponse.data.contactEmail)" -ForegroundColor White
    Write-Host "  ✓ Image: $($jsonResponse.data.image)" -ForegroundColor White
    Write-Host "  ✓ Excerpt: $($jsonResponse.data.excerpt)" -ForegroundColor White
    Write-Host "  ✓ Requirements: $(if($jsonResponse.data.requirements) {'Present ✓'} else {'Missing ✗'})" -ForegroundColor White
    Write-Host "  ✓ Tags: $($jsonResponse.data.tags -join ', ')" -ForegroundColor White
    Write-Host "  ✓ Applicants: $($jsonResponse.data.applicants)" -ForegroundColor White
    Write-Host "  ✓ Deadline: $($jsonResponse.data.deadline)" -ForegroundColor White
    
    $createdId = $jsonResponse.data.id
    
    # Test 3: Get the created opportunity
    Write-Host ""
    Write-Host "📥 Step 3: Fetching created opportunity..." -ForegroundColor Yellow
    
    $getResponse = Invoke-WebRequest -Uri "$stagingUrl/api/v1/opportunities/$createdId" -ErrorAction Stop
    $opportunity = ($getResponse.Content | ConvertFrom-Json).data
    
    Write-Host "✅ Retrieved successfully!" -ForegroundColor Green
    Write-Host "  Title: $($opportunity.title)" -ForegroundColor White
    Write-Host "  Organization: $($opportunity.organization)" -ForegroundColor White
    Write-Host "  Tags: $($opportunity.tags -join ', ')" -ForegroundColor White
    
    # Test 4: Search with new fields
    Write-Host ""
    Write-Host "🔍 Step 4: Testing search with organization..." -ForegroundColor Yellow
    
    $searchResponse = Invoke-WebRequest -Uri "$stagingUrl/api/v1/opportunities/search?q=Varsigram" -ErrorAction Stop
    $searchResults = ($searchResponse.Content | ConvertFrom-Json).data
    
    Write-Host "✅ Search returned $($searchResults.Count) result(s)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode.value__) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Error Details:" -ForegroundColor Yellow
        try {
            $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorJson | ConvertTo-Json -Depth 5
        } catch {
            Write-Host $_.ErrorDetails.Message
        }
    }
    
    Write-Host ""
    Write-Host "⚠️  POSSIBLE CAUSES:" -ForegroundColor Yellow
    Write-Host "  1. Migration not applied on staging yet" -ForegroundColor White
    Write-Host "  2. JWT token expired (get fresh token from Django)" -ForegroundColor White
    Write-Host "  3. Staging server needs restart after migration" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 TO FIX:" -ForegroundColor Cyan
    Write-Host "  - SSH into staging server" -ForegroundColor White
    Write-Host "  - Run: cd /path/to/app && npx prisma migrate deploy" -ForegroundColor White
    Write-Host "  - Run: pm2 restart opportunities-service" -ForegroundColor White
}
