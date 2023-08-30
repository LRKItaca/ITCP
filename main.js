// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow,screen,ipcMain } = require('electron')
const path = require('path')
const ipc = require("electron").ipcMain;

const createWindow = () => {

  const mainScreen = screen.getPrimaryDisplay();
  const width = 1152;
  const height = 656; 
    
  //--------------------------------------------
  ipc.on("cerrar-ventana", function(event) {
      mainWindow.close()
  });
  ipc.on("minimizar-ventana", function(event) {
      mainWindow.minimize()
  });
  //--------------------------------------------


  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    titleBarStyle: 'hidden',
    fullscreenable:false,
    resizable:false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })


  mainWindow.loadFile('test.html')
 // mainWindow.webContents.openDevTools();

}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


