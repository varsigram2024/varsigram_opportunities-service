# Test script for new opportunity fields

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYxMTM5NTkxLCJpYXQiOjE3NjExMzIzOTEsImp0aSI6ImRjMGFlNWRlN2JhOTRjZDM4ZjU2MWJkZDhjM2Y4OWQ2IiwidXNlcl9pZCI6Mn0.vFJp0eLkxi17Xl9b1jRRlMJ8di75KmobMoKZ6v8p22k"
}

$opportunity = @{
    title = "Senior DevOps Engineer"
    description = "We are looking for an experienced DevOps engineer to join our cloud infrastructure team. You will work with AWS, Docker, and Kubernetes."
    category = "GIG"
    organization = "CloudTech Solutions"
    location = "Lagos, Nigeria"
    isRemote = $true
    deadline = "2025-12-31T23:59:59Z"
    contactEmail = "jobs@cloudtech.ng"
    image = "https://example.com/images/devops-position.jpg"
    excerpt = "Join our cloud infrastructure team as a Senior DevOps Engineer."
    requirements = "- 5+ years experience with AWS\n- Expert in Docker and Kubernetes\n- CI/CD pipeline experience\n- Strong automation skills"
    tags = @("devops", "aws", "kubernetes", "docker", "remote", "senior")
}

$body = $opportunity | ConvertTo-Json

Write-Host "Testing POST /api/v1/opportunities with new fields..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/opportunities" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message
    }
}
