import fs from 'fs';

const enPath = 'apps/electron/src/renderer/i18n/locales/en-US.json';
const zhPath = 'apps/electron/src/renderer/i18n/locales/zh-CN.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const zh = JSON.parse(fs.readFileSync(zhPath, 'utf8'));

// Move root appearanceSettings to settings.appearanceSettings in ZH
if (zh.appearanceSettings) {
  zh.settings.appearanceSettings = { ...zh.settings.appearanceSettings, ...zh.appearanceSettings };
  delete zh.appearanceSettings;
}

// Move root appSettings to settings.appSettings in ZH
if (zh.appSettings) {
  zh.settings.appSettings = { ...zh.settings.appSettings, ...zh.appSettings };
  delete zh.appSettings;
}

// Move root inputSettings to settings.inputSettings in ZH
if (zh.inputSettings) {
  zh.settings.inputSettings = { ...zh.settings.inputSettings, ...zh.inputSettings };
  delete zh.inputSettings;
}

// Sync missing keys from ZH settings.xxx to EN settings.xxx
if (zh.settings.appSettings && !en.settings.appSettings) {
  en.settings.appSettings = {
    "title": "App Settings",
    "notifications": "Notifications",
    "desktopNotifications": "Desktop Notifications",
    "desktopNotificationsDesc": "Get notified when AI completes a task",
    "power": "Power",
    "keepScreenAwake": "Keep Screen Awake",
    "keepScreenAwakeDesc": "Prevent screen from sleeping while session is running",
    "network": "Network",
    "httpProxy": "HTTP Proxy",
    "httpProxyDesc": "Route network traffic through a proxy server",
    "httpProxyLabel": "HTTP Proxy",
    "httpsProxyLabel": "HTTPS Proxy",
    "bypassRules": "Bypass Rules",
    "about": "About",
    "version": "Version",
    "checkForUpdates": "Check for Updates",
    "checking": "Checking...",
    "checkNow": "Check Now",
    "downloading": "Downloading...",
    "updateReady": "Update Ready",
    "general": "General",
    "autoUpdates": "Auto Updates",
    "autoUpdatesDesc": "Automatically download and install updates",
    "launchOnStartup": "Launch on Startup",
    "launchOnStartupDesc": "Automatically start TwoPixel when you log in",
    "advanced": "Advanced",
    "developerMode": "Developer Mode",
    "developerModeDesc": "Enable developer tools and features"
  };
}

if (zh.settings.appearanceSettings) {
  en.settings.appearanceSettings = {
    ...en.settings.appearanceSettings,
    "defaultTheme": "Default Theme",
    "mode": "Mode",
    "system": "System",
    "light": "Light",
    "dark": "Dark",
    "colorTheme": "Color Theme",
    "font": "Font",
    "workspaceThemes": "Workspace Themes",
    "workspaceThemesDesc": "Override theme settings per workspace",
    "useDefault": "Use Default",
    "interface": "Interface",
    "connectionIcons": "Connection Icons",
    "connectionIconsDesc": "Show provider icons in session list and model picker",
    "richToolDescriptions": "Rich Tool Descriptions",
    "richToolDescriptionsDesc": "Add action names and intent descriptions to all tool calls for richer activity context",
    "toolIcons": "Tool Icons",
    "toolIconsDesc": "Icons shown next to CLI commands in chat activity. Stored in ~/.twopixel/tool-icons/.",
    "icon": "Icon",
    "tool": "Tool",
    "editFile": "Edit File",
    "searchTools": "Search tools...",
    "noToolIcons": "No tool icons configured.",
    "highContrastMode": "High Contrast Mode",
    "highContrastModeDesc": "Increase contrast for better readability"
  }
}

if (zh.settings.inputSettings && !en.settings.inputSettings) {
  en.settings.inputSettings = {
    "title": "Input Settings",
    "typing": "Typing",
    "typingDesc": "Control text input behavior in the chat box",
    "autoCapitalisation": "Auto Capitalisation",
    "spellCheck": "Spell Check",
    "sendMessage": "Send Message",
    "sendMessageDesc": "Choose shortcut to send message",
    "enter": "Enter",
    "cmdEnter": "Cmd + Enter"
  }
}

fs.writeFileSync(zhPath, JSON.stringify(zh, null, 2) + '\n');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
console.log('Fixed JSON files');
