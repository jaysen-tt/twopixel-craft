!macro customInstall
  ; -------------------------------------------------------------------------
  ; 1. Check and Install Microsoft Visual C++ Redistributable
  ; -------------------------------------------------------------------------
  DetailPrint "Checking Microsoft Visual C++ 2015-2022 Redistributable..."
  ClearErrors
  ; Check if VC++ 2015-2022 x64 is installed via Registry
  ReadRegDword $R0 HKLM "SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" "Installed"
  IfErrors NeedInstallVC
  IntCmp $R0 1 DoneVC NeedInstallVC DoneVC

NeedInstallVC:
  DetailPrint "Downloading Microsoft Visual C++ Redistributable..."
  inetc::get "https://aka.ms/vs/17/release/vc_redist.x64.exe" "$PLUGINSDIR\vc_redist.x64.exe"
  Pop $R0
  StrCmp $R0 "OK" +3
    DetailPrint "Download failed: $R0"
    Goto DoneVC
  
  DetailPrint "Installing Microsoft Visual C++ Redistributable..."
  ExecWait '"$PLUGINSDIR\vc_redist.x64.exe" /install /quiet /norestart' $R1
  DetailPrint "Install returned: $R1"

DoneVC:

  ; -------------------------------------------------------------------------
  ; 2. Check and Install Git for Windows (Git Bash)
  ; -------------------------------------------------------------------------
  DetailPrint "Checking Git for Windows..."
  ClearErrors
  ReadRegStr $R0 HKLM "SOFTWARE\GitForWindows" "InstallPath"
  IfErrors CheckGitHKCU DoneGit

CheckGitHKCU:
  ClearErrors
  ReadRegStr $R0 HKCU "SOFTWARE\GitForWindows" "InstallPath"
  IfErrors NeedInstallGit DoneGit

NeedInstallGit:
  DetailPrint "Downloading Git for Windows (this may take a moment)..."
  inetc::get "https://npmmirror.com/mirrors/git-for-windows/v2.45.2.windows.1/Git-2.45.2-64-bit.exe" "$PLUGINSDIR\git-installer.exe"
  Pop $R0
  StrCmp $R0 "OK" +3
    DetailPrint "Download failed: $R0"
    Goto DoneGit
  
  DetailPrint "Installing Git for Windows..."
  ExecWait '"$PLUGINSDIR\git-installer.exe" /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS="icons,ext\reg\shellhere,assoc,assoc_sh"' $R1
  DetailPrint "Install returned: $R1"

DoneGit:
!macroend
