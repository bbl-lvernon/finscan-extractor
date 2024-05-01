@echo off
setlocal enabledelayedexpansion

:: Set the path to the file
set "filePath=C:\Users\lvernon\Workspace\Work\Repos\finscan-extractor\src\config\common.ts"

:: Use find and replace commands to modify the specific line
find /c /v "" < "%filePath%" > "%filePath%.count"
set /p lines=<"%filePath%.count"
set /a lines=%lines%-1
for /l %%a in (0,25,%lines%) do (
  set /p line=<"%filePath%"
  if "!line!" == "export const BBILMODE = 0" (
    echo export const BBILMODE = 1> "%filePath%_temp.ts"
  ) else (
    echo !line!>> "%filePath%_temp.ts"
  )
)

:: Move the temporary file back to the original file
move /y %filePath%_temp.ts %filePath%

:: Delete the count file
del "%filePath%.count"

echo The script has completed successfully.
pause