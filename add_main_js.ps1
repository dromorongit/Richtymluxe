$files = 'cart.html','checkout.html'
foreach ($f in $files) {
  $c = Get-Content $f -Raw
  if ($c -match '</body>') {
    $c = $c -replace '</body>', "  <script src=`"assets/js/main.js`"></script>`n</body>"
    Set-Content -Path $f -Value $c -Encoding UTF8
    Write-Host "Added script to $f"
  } else {
    Write-Warning "No </body> in $f, appending at end"
    $c += "`n<script src=`"assets/js/main.js`"></script>`n"
    Set-Content -Path $f -Value $c -Encoding UTF8
  }
}
