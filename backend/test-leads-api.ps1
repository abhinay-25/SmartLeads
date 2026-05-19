$ErrorActionPreference = "Continue"
$BASE = "http://localhost:5000/api/v1"
$PASS = 0; $FAIL = 0

function ok([string]$label, [bool]$result) {
  if ($result) { Write-Host "  [PASS] $label" -ForegroundColor Green; $script:PASS++ }
  else          { Write-Host "  [FAIL] $label" -ForegroundColor Red;   $script:FAIL++ }
}

# Force single-result JSON to always be an array
function arr($v) { ,@($v) }

Write-Host "`n====== SMART LEADS API TEST SUITE ======`n" -ForegroundColor Cyan

# ── 1. LOGIN ─────────────────────────────────────────────────────────
Write-Host "[1] AUTH" -ForegroundColor Yellow

$login = Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST `
         -ContentType "application/json" `
         -Body ('{"email":"alice@smartleads.dev","password":"Admin@123!"}')

# Login response shape: { data: { user, tokens: { accessToken } } }
$token = $login.data.tokens.accessToken
ok "Login returns accessToken"  ([bool]$token -and $token.Length -gt 20)

# All subsequent requests use this header hashtable
$H = @{ Authorization = "Bearer $token" }

# ── 2. CREATE LEADS ───────────────────────────────────────────────────
Write-Host "`n[2] CREATE" -ForegroundColor Yellow

$r1 = Invoke-RestMethod "$BASE/leads" -Method POST -Headers $H -ContentType "application/json" `
      -Body (@{ name = "Rahul Sharma"; email = "rahul.api@example.com"; status = "new"; source = "instagram" } | ConvertTo-Json)
$r2 = Invoke-RestMethod "$BASE/leads" -Method POST -Headers $H -ContentType "application/json" `
      -Body (@{ name = "Priya Patel"; email = "priya.api@startup.io"; status = "qualified"; source = "referral"; company = "Startup Inc" } | ConvertTo-Json)
$r3 = Invoke-RestMethod "$BASE/leads" -Method POST -Headers $H -ContentType "application/json" `
      -Body (@{ name = "Sam Chen"; email = "sam.api@figma.com"; status = "new"; source = "instagram" } | ConvertTo-Json)

ok "POST Rahul → name correct"      ($r1.data.name    -eq "Rahul Sharma")
ok "POST Rahul → source=instagram"  ($r1.data.source  -eq "instagram")
ok "POST Rahul → status=new"        ($r1.data.status  -eq "new")
ok "POST Priya → status=qualified"  ($r2.data.status  -eq "qualified")
ok "POST Priya → company stored"    ($r2.data.company -eq "Startup Inc")
ok "POST Rahul → _id present"       ([bool]$r1.data._id)

$id1 = $r1.data._id
$id2 = $r2.data._id
$id3 = $r3.data._id

# ── 3. LIST + PAGINATION ──────────────────────────────────────────────
Write-Host "`n[3] LIST + PAGINATION" -ForegroundColor Yellow

$all = Invoke-RestMethod "$BASE/leads" -Headers $H
ok "GET /leads → success=true"          ($all.success      -eq $true)
ok "GET /leads → default perPage=10"    ($all.meta.perPage -eq 10)
ok "GET /leads → page=1"                ($all.meta.page    -eq 1)
ok "GET /leads → total >= 3"            ($all.meta.total   -ge 3)
ok "GET /leads → totalPages >= 1"       ($all.meta.totalPages -ge 1)
ok "GET /leads → hasNext is bool"       ($null -ne $all.meta.hasNext)
ok "GET /leads → data array present"    ((arr $all.data).Count -ge 1)

$p  = Invoke-RestMethod "$BASE/leads?limit=2&page=1" -Headers $H
ok "limit=2 → perPage=2 in meta"        ($p.meta.perPage -eq 2)
ok "limit=2 → data.Count <= 2"          ((arr $p.data).Count -le 2)

$p2 = Invoke-RestMethod "$BASE/leads?limit=2&page=2" -Headers $H
ok "page=2 → hasPrev=true"              ($p2.meta.hasPrev -eq $true)

# ── 4. SINGLE-FIELD FILTERS ───────────────────────────────────────────
Write-Host "`n[4] SINGLE FILTERS" -ForegroundColor Yellow

$fnew = Invoke-RestMethod "$BASE/leads?status=new" -Headers $H
ok "status=new → total >= 2"            ($fnew.meta.total -ge 2)
ok "status=new → all items are new"     ((arr $fnew.data | Where-Object { $_.status -ne "new"  }).Count -eq 0)

$fq   = Invoke-RestMethod "$BASE/leads?status=qualified" -Headers $H
ok "status=qualified → total >= 1"      ($fq.meta.total -ge 1)

$fi   = Invoke-RestMethod "$BASE/leads?source=instagram" -Headers $H
ok "source=instagram → total >= 2"      ($fi.meta.total -ge 2)
ok "source=instagram → all correct"     ((arr $fi.data | Where-Object { $_.source -ne "instagram" }).Count -eq 0)

# ── 5. SEARCH ─────────────────────────────────────────────────────────
Write-Host "`n[5] SEARCH" -ForegroundColor Yellow

$sRah   = Invoke-RestMethod "$BASE/leads?search=Rahul" -Headers $H
ok "search=Rahul → total >= 1"          ($sRah.meta.total -ge 1)
ok "search=Rahul → first name matches"  ((arr $sRah.data)[0].name -like "*Rahul*")

$sEmail = Invoke-RestMethod "$BASE/leads?search=rahul.api" -Headers $H
ok "search by partial email"            ($sEmail.meta.total -ge 1)

$sSam   = Invoke-RestMethod "$BASE/leads?search=Sam" -Headers $H
ok "search=Sam → total >= 1"            ($sSam.meta.total -ge 1)

$sNone  = Invoke-RestMethod "$BASE/leads?search=zzznomatch999" -Headers $H
ok "search=no-match → total=0"          ($sNone.meta.total -eq 0)

# ── 6. COMBINED FILTERS ───────────────────────────────────────────────
Write-Host "`n[6] COMBINED FILTERS" -ForegroundColor Yellow

$c1 = Invoke-RestMethod "$BASE/leads?status=new&source=instagram" -Headers $H
ok "status=new + source=instagram → total >= 2"     ($c1.meta.total -ge 2)
ok "Combined: all status=new"                        ((arr $c1.data | Where-Object { $_.status  -ne "new"       }).Count -eq 0)
ok "Combined: all source=instagram"                  ((arr $c1.data | Where-Object { $_.source  -ne "instagram" }).Count -eq 0)

$c2 = Invoke-RestMethod "$BASE/leads?status=new&source=instagram&search=Rahul" -Headers $H
ok "Triple filter → total >= 1"                      ($c2.meta.total -ge 1)
ok "Triple filter → first result = Rahul Sharma"     ((arr $c2.data)[0].name -eq "Rahul Sharma")

$c3 = Invoke-RestMethod "$BASE/leads?status=qualified&source=referral" -Headers $H
ok "status=qualified + source=referral → total >= 1" ($c3.meta.total -ge 1)

# ── 7. SORTING ────────────────────────────────────────────────────────
Write-Host "`n[7] SORTING" -ForegroundColor Yellow

$oldest = Invoke-RestMethod "$BASE/leads?sort=oldest" -Headers $H
$latest = Invoke-RestMethod "$BASE/leads?sort=latest" -Headers $H

ok "sort=oldest → data present"                      ((arr $oldest.data).Count -ge 1)
ok "sort=latest → data present"                      ((arr $latest.data).Count -ge 1)
ok "sort order differs between oldest and latest"    ((arr $oldest.data)[0].name -ne (arr $latest.data)[0].name)
ok "sort=latest → most recent first (Sam Chen)"      ((arr $latest.data)[0].name -eq "Sam Chen")
ok "sort=oldest → oldest first (not Sam Chen)"       ((arr $oldest.data)[0].name -ne "Sam Chen")

# ── 8. GET BY ID ──────────────────────────────────────────────────────
Write-Host "`n[8] GET SINGLE" -ForegroundColor Yellow

$s = Invoke-RestMethod "$BASE/leads/$id1" -Headers $H
ok "GET /leads/:id → success=true"      ($s.success -eq $true)
ok "GET /leads/:id → correct name"      ($s.data.name -eq "Rahul Sharma")
ok "GET /leads/:id → has email"         ([bool]$s.data.email)
ok "GET /leads/:id → has createdAt"     ([bool]$s.data.createdAt)
ok "GET /leads/:id → has source"        ($s.data.source -eq "instagram")

try {
  Invoke-RestMethod "$BASE/leads/notavalidobjectid00" -Headers $H | Out-Null
  ok "GET invalid ObjectId → 400"       $false
} catch {
  ok "GET invalid ObjectId → 400"       ($_.Exception.Response.StatusCode.value__ -eq 400)
}

# ── 9. PATCH ─────────────────────────────────────────────────────────
Write-Host "`n[9] PATCH" -ForegroundColor Yellow

$pu = Invoke-RestMethod "$BASE/leads/$id1" -Method PATCH -Headers $H -ContentType "application/json" `
      -Body (@{ status = "contacted" } | ConvertTo-Json)
ok "PATCH status → contacted"           ($pu.data.status -eq "contacted")
ok "PATCH → name unchanged"             ($pu.data.name   -eq "Rahul Sharma")

$pu2 = Invoke-RestMethod "$BASE/leads/$id2" -Method PATCH -Headers $H -ContentType "application/json" `
       -Body (@{ company = "TechCorp Ltd"; notes = "Follow up next week" } | ConvertTo-Json)
ok "PATCH multi-field company updated"  ($pu2.data.company -eq "TechCorp Ltd")
ok "PATCH multi-field notes updated"    ($pu2.data.notes   -eq "Follow up next week")

try {
  Invoke-RestMethod "$BASE/leads/$id2" -Method PATCH -Headers $H -ContentType "application/json" `
    -Body "{}" | Out-Null
  ok "PATCH empty body → error"         $false
} catch {
  ok "PATCH empty body → error"         ($_.Exception.Response.StatusCode.value__ -in 400, 422)
}

# ── 10. STATS ────────────────────────────────────────────────────────
Write-Host "`n[10] STATS" -ForegroundColor Yellow

$st = Invoke-RestMethod "$BASE/leads/stats" -Headers $H
ok "GET /leads/stats → success=true"        ($st.success -eq $true)
ok "GET /leads/stats → has 'contacted' key" ($null -ne $st.data.contacted)
ok "GET /leads/stats → contacted >= 1"      ($st.data.contacted -ge 1)
ok "GET /leads/stats → qualified >= 1"      ($st.data.qualified -ge 1)
ok "GET /leads/stats → new >= 1"            ($st.data.new -ge 1)

# ── 11. VALIDATION ───────────────────────────────────────────────────
Write-Host "`n[11] VALIDATION" -ForegroundColor Yellow

try {
  Invoke-RestMethod "$BASE/leads" -Method POST -Headers $H -ContentType "application/json" `
    -Body (@{ name = "T"; email = "t@t.com"; source = "tiktok" } | ConvertTo-Json) | Out-Null
  ok "Invalid source 'tiktok' → error"   $false
} catch { ok "Invalid source 'tiktok' → error"   ($_.Exception.Response.StatusCode.value__ -in 400, 422) }

try {
  Invoke-RestMethod "$BASE/leads" -Method POST -Headers $H -ContentType "application/json" `
    -Body (@{ email = "x@x.com"; source = "website" } | ConvertTo-Json) | Out-Null
  ok "Missing name → error"              $false
} catch { ok "Missing name → error"              ($_.Exception.Response.StatusCode.value__ -in 400, 422) }

try {
  Invoke-RestMethod "$BASE/leads" -Method POST -Headers $H -ContentType "application/json" `
    -Body (@{ name = "T"; email = "not-an-email"; source = "website" } | ConvertTo-Json) | Out-Null
  ok "Invalid email format → error"      $false
} catch { ok "Invalid email format → error"      ($_.Exception.Response.StatusCode.value__ -in 400, 422) }

# ── 12. DELETE ───────────────────────────────────────────────────────
Write-Host "`n[12] DELETE" -ForegroundColor Yellow

$beforeTotal = $all.meta.total

try {
  Invoke-RestMethod "$BASE/leads/$id3" -Method DELETE -Headers $H | Out-Null
  ok "DELETE /leads/:id → no error"      $true
} catch {
  ok "DELETE /leads/:id → no error"      ($_.Exception.Response.StatusCode.value__ -eq 204)
}

$after = Invoke-RestMethod "$BASE/leads" -Headers $H
ok "Total decremented after DELETE"     ($after.meta.total -lt ($beforeTotal + 3))

try {
  Invoke-RestMethod "$BASE/leads/$id3" -Method DELETE -Headers $H | Out-Null
  ok "DELETE already-deleted → 404"     $false
} catch { ok "DELETE already-deleted → 404"     ($_.Exception.Response.StatusCode.value__ -eq 404) }

# ── SUMMARY ──────────────────────────────────────────────────────────
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  Passed : $PASS" -ForegroundColor Green
$failColor = if ($FAIL -gt 0) { "Red" } else { "Green" }
Write-Host "  Failed : $FAIL" -ForegroundColor $failColor
if ($FAIL -eq 0) {
  Write-Host "`n  ALL $PASS TESTS PASSED" -ForegroundColor Green
} else {
  Write-Host "`n  $FAIL test(s) failed" -ForegroundColor Red
}
Write-Host "======================================`n" -ForegroundColor Cyan
