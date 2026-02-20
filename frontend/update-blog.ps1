# PowerShell script to update Blog.tsx with animations
$filePath = "d:\Sama\frontend\src\pages\Blog.tsx"
$content = Get-Content $filePath -Raw

# 1. Update gradient overlay (line 140)
$content = $content -replace 'background: "rgba\(250,247,242,0\.65\)"', 'background: "linear-gradient(to bottom, rgba(250,247,242,0.85), rgba(250,247,242,0.65))"'

# 2. Update tag chips to use motion.span with hover (lines 187-194)
$content = $content -replace '(<span\s+key=\{t\}\s+className="px-3 py-1 rounded-full bg-white/70 border border-black/10 text-xs">)',
'<motion.span$1whileHover={{ backgroundColor: "rgba(220,234,215,0.8)", y: -2 }} transition={{ duration: 0.2, ease: "easeOut" }} className="px-3 py-1 rounded-full bg-white/70 border border-black/10 text-xs cursor-pointer">'

# Save updated content
Set-Content -Path $filePath -Value $content -NoNewline
Write-Host "Blog.tsx updated successfully!"
