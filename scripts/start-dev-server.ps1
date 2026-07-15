$process = Start-Process -PassThru -WindowStyle Hidden -FilePath "powershell.exe" -ArgumentList "-NoLogo", "-NoProfile", "-Command", "& { cmd /c 'cd /d ""D:\Event Managment  system"" && npx next dev --webpack' }"
Write-Output "Dev server started with PID: $($process.Id)"
$process.Id | Out-File -FilePath "D:\Event Managment  system\.dev-pid.txt" -Force
