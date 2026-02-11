# Simple PowerShell HTTP Server
# Serves current directory on http://localhost:8000

$port = 8000
$root = Get-Location
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Listening on http://localhost:$port/"
Write-Host "Press Ctrl+C to stop."

$mimeTypes = @{
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".json" = "application/json"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContextAsync().Result
        $request = $context.Request
        $response = $context.Response

        $path = $root.Path + $request.Url.LocalPath.Replace('/', '\')
        
        # Default to index.html
        if ($request.Url.LocalPath -eq "/") {
            $path = Join-Path $path "index.html"
        }

        if (Test-Path $path -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($path).ToLower()
            $contentType = $mimeTypes[$extension]
            if ($null -eq $contentType) { $contentType = "application/octet-stream" }
            
            $content = [System.IO.File]::ReadAllBytes($path)
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
