const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// fs usado para la creacion de archivos
const fs = require("fs");
const { readTable, leerTablaConJoin, leerTablaConDobleJoin, joinWhereId, deleteRecord, createRecord, updateRecord, selectRecordById, selectIdForArrays, selectRecordWithJoin, login, obtenerProcesosEmpleado, readTableEmpleados, deleteRecordFromRelationNM, verificarArchivoRuta, buscarIdPorValor } = require('../assets/db/database');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Deshabilitar nodeIntegration
      contextIsolation: true  // Habilitar contextIsolation
    }
  });

  win.loadFile('../components/login.html');
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('leer-tabla', async (event, tableName) => {
    return new Promise((resolve, reject) => {
      readTable(tableName, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  });

  ipcMain.handle('leer-tabla-con-join', async (event, params) => {
    return new Promise((resolve, reject) => {
      leerTablaConJoin(params, (err, resultados) => {
        if (err) {
          reject(err);
        } else {
          resolve(resultados);
        }
      });
    });
  });

  ipcMain.handle('leer-tabla-con-doble-join', async (event, params) => {
    return new Promise((resolve, reject) => {
      leerTablaConDobleJoin(params, (err, resultados) => {
        if (err) {
          reject(err);
        } else {
          resolve(resultados);
        }
      });
    });
  });

  ipcMain.handle('join-where-id', async (event, params) => {
    return new Promise((resolve, reject) => {
      joinWhereId(params, (err, resultados) => {
        if (err) {
          reject(err);
        } else {
          resolve(resultados);
        }
      });
    });
  });

  ipcMain.handle('eliminar-registro', async (event, tableName, idColumnName, id) => {
    return new Promise((resolve, reject) => {
      deleteRecord(tableName, idColumnName, id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });

  ipcMain.handle('crear-registro', async (event, tableName, data) => {
    return new Promise((resolve, reject) => {
      createRecord(tableName, data, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });

  ipcMain.handle('obtener-registro-por-id', async (event, tableName, idColumnName, id) => {
    return new Promise((resolve, reject) => {
      selectRecordById(tableName, idColumnName, id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });

  ipcMain.handle('obtener-id-para-arrays', async (event, tableName, idColumnName, id) => {
    return new Promise((resolve, reject) => {
      selectIdForArrays(tableName, idColumnName, id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });

  ipcMain.handle('actualizar-registro', async (event, tableName, idColumnName, id, data) => {
    return new Promise((resolve, reject) => {
      updateRecord(tableName, idColumnName, id, data, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  });


  ipcMain.handle('buscar-id-por-valor', async (event, tableName, idColumnName, searchColumn, searchValue) => {
    return new Promise((resolve, reject) => {
      buscarIdPorValor(tableName, idColumnName, searchColumn, searchValue, (err, id) => {
        if (err) {
          reject(err);
        } else {
          resolve(id);
        }
      });
    });
  });



  ipcMain.handle('select-record-with-join', async (event, params) => {
    return new Promise((resolve, reject) => {
      selectRecordWithJoin(params, (err, resultados) => {
        if (err) {
          reject(err);
        } else {
          resolve(resultados);
        }
      });
    });
  });



  ipcMain.handle('login', async (event, email, contrasena) => {
    return new Promise((resolve, reject) => {
      login(email, contrasena, (err, loginSuccess) => {
        if (err) {
          reject(err);
        } else {
          resolve(loginSuccess);
        }
      });
    });
  });


  ipcMain.handle('obtener-procesos-empleado', async (event, idEmpleado) => {
    return new Promise((resolve, reject) => {
      obtenerProcesosEmpleado(idEmpleado, (err, procesos) => {
        if (err) {
          reject(err);
        } else {
          resolve(procesos);
        }
      });
    });
  });

  ipcMain.handle('leer-tabla-empleados', async (event, empleadoName, empleadoApellido, idEmpleado, tableName) => {
    return new Promise((resolve, reject) => {
      readTableEmpleados(empleadoName, empleadoApellido, idEmpleado, tableName, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  });

  ipcMain.handle('eliminar-registro-relacion-NM', async (event, tableName, idColumnName1, id1, idColumnName2, id2) => {
    return new Promise((resolve, reject) => {
      deleteRecordFromRelationNM(tableName, idColumnName1, id1, idColumnName2, id2, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });

  ipcMain.handle('eliminar-archivo', async (event, filePath) => {
    try {
      // Eliminar el archivo físico utilizando fs.unlink
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error al eliminar el archivo:', err);
          throw err; // Puedes manejar el error aquí o lanzarlo de vuelta
        } else {
          console.log('Archivo eliminado correctamente');
        }
      });
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      throw error;
    }
  });

  ipcMain.handle("verificar-archivo-ruta", async (event, tableName, ColumnName, archivoRuta) => {
    return new Promise((resolve, reject) => {
      verificarArchivoRuta(tableName, ColumnName, archivoRuta, (err, archivoExiste) => {
        if (err) {
          console.error("Error al verificar archivo:", err);
          return reject(err);
        }
        resolve(archivoExiste);
      });
    });
  });

  ipcMain.on("save-file", (event, { filePath, fileContent }) => {
    const destinationPath = path.join(
      __dirname,
      "../assets/documents",
      path.basename(filePath)
    );
    fs.writeFile(destinationPath, fileContent, (err) => {
      if (err) {
        event.reply("save-file-response", {
          success: false,
          message: err.message,
        });
      } else {
        event.reply("save-file-response", {
          success: true,
          message: "Documento guardado correctamente",
        });
      }
    });
  });

  ipcMain.handle("descargar-documento", async (event, rutaDocumento) => {
    const documentoPath = path.join(__dirname, rutaDocumento);
    const savePath = dialog.showSaveDialogSync({
      defaultPath: path.basename(rutaDocumento),
      filters: [{ name: 'Todos los archivos', extensions: ['*'] }],
    });

    if (savePath) {
      try {
        fs.copyFileSync(documentoPath, savePath);
        return { success: true, message: 'Documento descargado con exito' };
      } catch (err) {
        return { success: false, message: 'Error al descargar el documento: ' + err.message };
      }
    } else {
      return { success: false, message: 'Descarga cancelada' };
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 0
