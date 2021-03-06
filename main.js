const {app, BrowserWindow, ipcMain, dialog, globalShortcut, Menu, protocol} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const PDFWindow = require('electron-pdf-window')
const homedir = require('os').homedir();

// Log do autoupdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');









global.dados={ 
  'configs' : {
    computador: '059ed89922706c792646',
    usuario : '',
    senha : '',
    empresa : '',
    razao : ''

  },
  'param' : {
    success: '',
    dispositivo: '',
    message: '',
    token: '',
    admin:'',
    name: '',
    cod: '',
    menu: {
      Reserva: '',
      Ordem: '',
      Produto: '',
      Prod_Reserva: '',
      Cliente: '',
      Localdecor: '',
      Entrada: '',
      Entrega: ''
    },
    Reserva: {
      Atualiza: '',
      Imprime: '',
      Cancela: '',
      Registra: '',
      EntraEstoque: '',
      EntraReserva: '',
      EntraTransporte: '',
      EntregaPedido: '',
      LiberaSeparacao: '',
      ImprimeEstoque:'',
      FiltraVendedor: ''
    },
    Cliente: {
      Pesquisa: '',
      Cadastra: '',
      Edita: '',
      Pesquisa_vendas: '',
      Pesquisa_Historico: ''
    },
    Entrada: {
      Checar: ''
    }
  }
}
const path = require('path')
const fs = require('fs')
const url = require('url')
var testeurl = url.format({
  pathname: path.join(__dirname, 'teste.js'),
  protocol: 'file:',
  slashes: true
})
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}
function createWindow () {
  // Create the browser window.
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
  })
  autoUpdater.on('update-available', (ev, info) => {
    sendStatusToWindow('Update available.');
  })
  autoUpdater.on('update-not-available', (ev, info) => {
    sendStatusToWindow('Update not available.');
  })
  autoUpdater.on('error', (ev, err) => {
    sendStatusToWindow('Error in auto-updater.');
  })
  autoUpdater.on('download-progress', (ev, progressObj) => {
    sendStatusToWindow('Download progress...');
  })
  autoUpdater.on('update-downloaded', (ev, info) => {
    sendStatusToWindow('Update downloaded; will install in 5 seconds');
  });

  globalShortcut.register('shift + f9', function() {
		console.log('Shift + f9 is pressed')
		mainWindow.webContents.openDevTools()
	})

  mainWindow = new BrowserWindow(
    { 
      minimizable :true,
      fullscreen :false,
      titleBarStyle : 'hiddenInset',
      enableLargerThanScreen:false,
      skipTaskbar:false,
      autoHideMenuBar:false,
      defaultFontFamily : 'monospace',
      experimentalFeatures:false,
      webPreferences: {
        nativeWindowOpen: false
      }
    }
  )
  mainWindow.maximize();
  // mainWindow.setMenu(null);
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // Open the DevTools.
  //  mainWindow.webContents.openDevTools()



  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    if (frameName === 'Danfe') {
      //abre a janela de impressão
      // open window as modal
      event.preventDefault()
      event.newGuest = new PDFWindow({
        width: 800,
        height: 600
      })
      event.newGuest.loadURL(`file://c:/temp/danfe.pdf`)
    }
    
    
    
    if (frameName === 'impressao') {
      //abre a janela de impressão
      // open window as modal
      event.preventDefault()
      event.newGuest = new BrowserWindow({ 
        minimizable :false,
        movable:true,
        width: 300, 
        height: 500,
        fullscreen :false,
        enableLargerThanScreen  :false,
        skipTaskbar:false,
        autoHideMenuBar:true,
        defaultFontFamily : 'monospace',
        experimentalFeatures:false,
        webPreferences: {
          nativeWindowOpen: true
        }
      })
      event.newGuest.loadURL('file://c:/temp/teste.html')
      event.newGuest.webContents.on('did-finish-load', () => {
        // Use default printing options
        event.newGuest.webContents.print({silent: false, printBackground: true, deviceName: ''})
      })
    }
    if (frameName === 'relatorio') {
      //abre a janela de impressão
      // open window as modal
      event.preventDefault()
      event.newGuest = new BrowserWindow({ 
        minimizable :false,
        closable :true,
        movable:true,
        frame:true,
        title:'Relatório de Fechamento',
        width: 700, 
        height: 400,
        fullscreen :false,
        enableLargerThanScreen  :false,
        skipTaskbar:false,
        autoHideMenuBar:true,
        defaultFontFamily : 'monospace',
        experimentalFeatures:false,
        webPreferences: {
          nativeWindowOpen: true
        }
      })
      event.newGuest.loadURL('file://c:/temp/teste.html')
      event.newGuest.webContents.on('did-finish-load', () => {
        // Use default printing options
        event.newGuest.webContents.printToPDF({}, (error, data) => {
          if (error) throw error
          fs.writeFile(homedir+'/desktop/relatorio.pdf', data, (error) => {
            // fs.writeFile('./relatorio.pdf', data, (error) => {
            if (error) throw error
            console.log('Write PDF successfully.')
          })
        })
      })
    }    
  })
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', function()  {
  
// });
app.on('ready', function() { 
  //Menu do updater

let template = []
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
}
  // const menu = Menu.buildFromTemplate(template);
  // Menu.setApplicationMenu(menu);
  createWindow();
  console.log('abre atualizador')
  autoUpdater.checkForUpdates();
  // autoUpdater.on('update-available', (ev, info) => {
  //   console.log(info)
  //   dialog.showMessageBox({
  //     type: 'info',
  //     title: 'Found Updates',
  //     message: info.releaseNotes,
  //     buttons: ['Yes', 'No']
  //   }, (buttonIndex) => {
  //     if (buttonIndex === 0) {
  //       autoUpdater.downloadUpdate()
  //     }
  //   })
  // })
})
// Quit when all windows are closed.
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Atualizar', 'Mais tarde'],
    title: 'Atualização de Sistema',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'Uma nova versão do sistema está disponível, deseja atualizar?'
  }

  dialog.showMessageBox(dialogOpts, (response) => {
    if (response === 0) autoUpdater.quitAndInstall()
  })
})

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
