$files = @('about.html','services.html','gallery.html','booking.html','contact.html','cart.html','checkout.html')
foreach ($file in $files) {
    Write-Host "Processing $file..."
    $content = Get-Content $file -Raw

    # Replace cart button opening tag with link
    $content = $content -replace '<button class="cart-btn" onclick="openCart\(\)">', '<a href="cart.html" class="cart-btn">'

    # Replace closing button tag after cart-count span with closing anchor
    $content = $content -replace '(</span>\r?\n)(\s*)</button>', '${1}$2</a>'

    # Remove mini cart block (from <!-- Cart Sidebar --> to blank line after closing </div>)
    $content = $content -replace '(?s)<!-- Cart Sidebar -->.*?  </div>\r?\n\r?\n', "  <!-- Mini cart removed - using main cart page only -->`r`n`r`n"

    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "  Updated $file"
}
Write-Host "Done."
