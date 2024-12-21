const { contextBridge, ipcRenderer } = require('electron');

// Exponer funciones del proceso principal al contexto del navegador
contextBridge.exposeInMainWorld('electron', {
    leerTabla: async (tableName) => {
        return ipcRenderer.invoke('leer-tabla', tableName);
    },

    leerTablaConJoin: async (params) => {
        return ipcRenderer.invoke('leer-tabla-con-join', params);
    },
    leerTablaConDobleJoin: async (params) => {
        return ipcRenderer.invoke('leer-tabla-con-doble-join', params);
    },
    joinWhereId: async (params) => {
        return ipcRenderer.invoke('join-where-id', params);
    },
    eliminarRegistro: async (tableName, idColumnName, id) => {
        return ipcRenderer.invoke('eliminar-registro', tableName, idColumnName, id);
    },
    crearRegistro: async (tableName, data) => {
        return ipcRenderer.invoke('crear-registro', tableName, data);
    },

    obtenerRegistroPorId: (tableName, idColumnName, id) => {
        return ipcRenderer.invoke('obtener-registro-por-id', tableName, idColumnName, id);
    },
    buscarIdParaArrays: (tableName, idColumnName, id) => {
        return ipcRenderer.invoke('obtener-id-para-arrays', tableName, idColumnName, id);
    },
    actualizarRegistro: async (tableName, idColumnName, id, data) => {
        return ipcRenderer.invoke('actualizar-registro', tableName, idColumnName, id, data);
    },

    buscarIdPorValor: async (tableName, idColumnName, searchColumn, searchValue) => {
        return ipcRenderer.invoke('buscar-id-por-valor', tableName, idColumnName, searchColumn, searchValue);
    },
    obtenerRegistroConJoin: async (params) => {
        return ipcRenderer.invoke('select-record-with-join', params);
    },
    

    login: async (email, contrasena) => {
        return ipcRenderer.invoke('login', email, contrasena);
    },

    obtenerProcesosEmpleado: async (idEmpleado) => {
        return ipcRenderer.invoke('obtener-procesos-empleado', idEmpleado);
    },
    leerTablaEmpleados: async (empleadoName, empleadoApellido, idEmpleado, tableName) => {
        return ipcRenderer.invoke('leer-tabla-empleados', empleadoName, empleadoApellido, idEmpleado, tableName);
    },
    eliminarRegistroRelacionNM: async (tableName, idColumnName1, id1, idColumnName2, id2) => {
        return ipcRenderer.invoke('eliminar-registro-relacion-NM', tableName, idColumnName1, id1, idColumnName2, id2);
    },
    eliminarArchivo: async (filePath) => {
        return ipcRenderer.invoke('eliminar-archivo', filePath);
      },
    saveFile: async (data) => {
        return ipcRenderer.send("save-file", data)
    },
    onSaveFileResponse: async (callback) => {
        return ipcRenderer.on("save-file-response", (event, response) => callback(response))
    },
    verificarArchivoRuta: async (tableName, ColumnName, archivoRuta) => {
        return ipcRenderer.invoke("verificar-archivo-ruta", tableName, ColumnName, archivoRuta)
    },
    descargarDocumento: async (rutaDocumento) => {
        return ipcRenderer.invoke("descargar-documento", rutaDocumento)
    }

});
