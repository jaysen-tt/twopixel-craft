import { app, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as https from 'https'
import { spawn, ChildProcess } from 'child_process'

export function initLocalAiManager() {
  const modelsDir = path.join(app.getPath('userData'), 'models')
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true })
  }

  let currentReq: any = null
  let llamaServerProcess: ChildProcess | null = null
  let currentDownloadState = { isDownloading: false, progress: 0, modelId: '' }
  let currentDownloadPromise: Promise<boolean> | null = null

  // Helper to get correct binary path
  const getLlamaServerPath = () => {
    const isDev = !app.isPackaged
    const platform = process.platform
    const arch = process.arch
    
    // Fallback names based on platform
    let binName = 'llama-server'
    if (platform === 'win32') binName = 'llama-server.exe'
    
    // In dev, point to resources/bin
    // In prod, point to process.resourcesPath/app.asar.unpacked/resources/bin
    const resourcesBase = isDev 
      ? path.join(__dirname, '../../resources') 
      : path.join(process.resourcesPath, 'app.asar.unpacked', 'resources')
      
    const platformKey = `${platform}-${arch}`
    return path.join(resourcesBase, 'bin', platformKey, binName)
  }

  ipcMain.handle('local-ai:checkModel', async (event, modelId: string) => {
     const modelPath = path.join(modelsDir, `${modelId}.gguf`)
     if (fs.existsSync(modelPath)) {
        return fs.statSync(modelPath).size > 1000000 // roughly check size > 1MB
     }
     return false
  })

  ipcMain.handle('local-ai:downloadModel', async (event, modelId: string, url: string) => {
     if (currentDownloadPromise) {
         return currentDownloadPromise
     }

     const modelPath = path.join(modelsDir, `${modelId}.gguf.tmp`)
     const finalPath = path.join(modelsDir, `${modelId}.gguf`)
     
     currentDownloadState = { isDownloading: true, progress: 0, modelId }

     currentDownloadPromise = new Promise((resolve, reject) => {
         const file = fs.createWriteStream(modelPath)
         currentReq = https.get(url, (response) => {
             if (response.statusCode === 301 || response.statusCode === 302) {
                 currentReq = https.get(response.headers.location!, handleResponse)
                 return
             }
             handleResponse(response)
         }).on('error', (err) => {
             fs.unlink(modelPath, () => {})
             currentReq = null
             currentDownloadPromise = null
             currentDownloadState.isDownloading = false
             reject(err)
         })

         function handleResponse(response: any) {
             const total = parseInt(response.headers['content-length'] || '0', 10)
             let downloaded = 0
             let lastReportTime = Date.now()

             response.on('data', (chunk: Buffer) => {
                 downloaded += chunk.length
                 currentDownloadState.progress = Math.round((downloaded / total) * 100)
                 const now = Date.now()
                 if (now - lastReportTime > 200 || downloaded === total) {
                     // Broadcast to all windows
                      const { BrowserWindow } = require('electron')
                      const windows = BrowserWindow.getAllWindows()
                      windows.forEach((win: any) => {
                          win.webContents.send(`local-ai:downloadProgress:${modelId}`, { downloaded, total })
                      })
                     lastReportTime = now
                 }
             })

             response.pipe(file)

             file.on('finish', () => {
                 file.close()
                 fs.renameSync(modelPath, finalPath)
                 currentReq = null
                 currentDownloadPromise = null
                 currentDownloadState.isDownloading = false
                 currentDownloadState.progress = 100
                 resolve(true)
             })
         }
     })
     return currentDownloadPromise
  })

  ipcMain.handle('local-ai:cancelDownload', async (event, modelId: string) => {
     if (currentReq) {
         currentReq.destroy()
         currentReq = null
         currentDownloadPromise = null
         currentDownloadState.isDownloading = false
         const modelPath = path.join(modelsDir, `${modelId}.gguf.tmp`)
         if (fs.existsSync(modelPath)) {
             fs.unlinkSync(modelPath)
         }
     }
     return true
  })

  ipcMain.handle('local-ai:getDownloadState', async (event, modelId: string) => {
     if (currentDownloadState.modelId === modelId) {
         return currentDownloadState
     }
     return { isDownloading: false, progress: 0, modelId }
  })

  ipcMain.handle('local-ai:startEngine', async (event, modelId: string) => {
    if (llamaServerProcess) {
      return { success: true, message: 'Engine already running' }
    }

    const modelPath = path.join(modelsDir, `${modelId}.gguf`)
    if (!fs.existsSync(modelPath)) {
      return { success: false, message: 'Model not found' }
    }

    const binPath = getLlamaServerPath()
    
    try {
      console.log('Starting local AI engine with model:', modelPath)
      console.log('Using binary:', binPath)
      
      // Typical llama.cpp server arguments: 
      // -m model.gguf -c 4096 --port 11434 --host 127.0.0.1
      llamaServerProcess = spawn(binPath, [
        '-m', modelPath,
        '-c', '4096', // context window
        '--port', '11434',
        '--host', '127.0.0.1'
      ], {
        // detached: true makes it run independently of the main process if needed
        stdio: ['ignore', 'pipe', 'pipe'] 
      })

      llamaServerProcess.on('error', (err) => {
        console.error('Failed to start llama-server:', err)
        llamaServerProcess = null
      })

      llamaServerProcess.on('exit', (code) => {
        console.log(`llama-server exited with code ${code}`)
        llamaServerProcess = null
      })

      return { success: true, message: 'Engine starting on port 11434' }
    } catch (e: any) {
      return { success: false, message: e.message || 'Unknown error' }
    }
  })

  ipcMain.handle('local-ai:stopEngine', async () => {
    if (llamaServerProcess) {
      llamaServerProcess.kill()
      llamaServerProcess = null
    }
    return { success: true }
  })
  
  // Clean up on exit
  app.on('will-quit', () => {
    if (llamaServerProcess) {
      llamaServerProcess.kill()
    }
  })
}
