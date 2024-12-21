const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // La contraseña de tu base de datos MySQL
    database: 'teyde', // El nombre de tu base de datos
});

connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos MySQL:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

function readTable(tableName, callback) {
    const query = `SELECT * FROM ??`;
    connection.query(query, [tableName], (err, results) => {
        if (err) {
            console.error(`Error en la consulta de la tabla ${tableName}:`, err);
            return callback(err);
        }
        callback(null, results);
    });
}


function leerTablaConJoin({ mainTable, joinTable, mainTableKey, joinTableKey }, callback) {
    const query = `
        SELECT main.*, joinT.*
        FROM ?? AS main
        JOIN ?? AS joinT ON main.?? = joinT.??
    `;
    const values = [mainTable, joinTable, mainTableKey, joinTableKey];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al ejecutar consulta:', err);
            return callback(err);
        }
        callback(null, results); // Devuelve los resultados del JOIN entre las tablas
    });
}



function leerTablaConDobleJoin({ mainTable, joinTable1, mainTableKey1, joinTableKey1, joinTable2, mainTableKey2, joinTableKey2 }, callback) {
    const query = `
        SELECT main.*, join1.*, join2.*
        FROM ?? AS main
        JOIN ?? AS join1 ON main.?? = join1.??
        JOIN ?? AS join2 ON main.?? = join2.??
    `;
    const values = [
        mainTable, 
        joinTable1, mainTableKey1, joinTableKey1, 
        joinTable2, mainTableKey2, joinTableKey2
    ];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al ejecutar consulta:', err);
            return callback(err);
        }
        callback(null, results); // Devuelve los resultados del JOIN entre las tablas
    });
}

function joinWhereId({ mainTable, joinTable, mainTableKey, joinTableKey, mainCondition, idValue }, callback) {
    const query = `
        SELECT main.*, joinT.*
        FROM ?? AS main
        JOIN ?? AS joinT ON main.?? = joinT.??
        WHERE main.?? =?
    `;
    const values = [mainTable, joinTable, mainTableKey, joinTableKey, mainCondition, idValue ];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al ejecutar consulta:', err);
            return callback(err);
        }
        callback(null, results); // Devuelve los resultados del JOIN entre las tablas
    });
}

function deleteRecord(tableName, idColumnName, id, callback) {
    const query = `DELETE FROM ?? WHERE ?? = ?`;
    connection.query(query, [tableName, idColumnName, id], (err, result) => {
        if (err) {
            console.error(`Error al eliminar el registro de la tabla ${tableName}:`, err);
            return callback(err);
        }
        callback(null, result);
    });
}

function createRecord(tableName, data, callback) {
    const query = `INSERT INTO ?? SET ?`;
    connection.query(query, [tableName, data], (err, result) => {
        if (err) {
            console.error(`Error al crear el registro en la tabla ${tableName}:`, err);
            return callback(err);
        }
        callback(null, result);
    });
}

function selectRecordById(tableName, idColumnName, id, callback) {
    const query = `SELECT * FROM ?? WHERE ?? = ?`;
    connection.query(query, [tableName, idColumnName, id], (err, result) => {
        if (err) {
            console.error(`Error al obtener el registro de la tabla ${tableName} por ID:`, err);
            return callback(err);
        }

        callback(null, result.length > 0 ? result[0] : null);
    });
}

function selectIdForArrays(tableName, idColumnName, id, callback) {
    const query = `SELECT * FROM ?? WHERE ?? = ?`;
    connection.query(query, [tableName, idColumnName, id], (err, result) => {
        if (err) {
            console.error(`Error al obtener el registro de la tabla ${tableName} por ID:`, err);
            return callback(err);
        }

        callback(null, result);
    });
}

function updateRecord(tableName, idColumnName, id, data, callback) {
    const query = `UPDATE ?? SET ? WHERE ?? = ?`;
    connection.query(query, [tableName, data, idColumnName, id], (err, result) => {
        if (err) {
            console.error(`Error al actualizar el registro en la tabla ${tableName}:`, err);
            return callback(err);
        }
        callback(null, result);
    });
}

function buscarIdPorValor(tableName, idColumnName, searchColumn, searchValue, callback) {

    const query = `SELECT ?? FROM ?? WHERE ?? = ?`;
    connection.query(query, [idColumnName, tableName, searchColumn, searchValue], (err, result) => {
        if (err) {
            console.error(`Error al buscar el ID en la tabla ${tableName}:`, err);
            return callback(err);
        }
        callback(null, result.length > 0 ? result[0][idColumnName] : null);
    });
}


function selectRecordWithJoin(params, callback) {
    const { table1, table2, joinColumn1, joinColumn2, idColumn, idValue, selectColumns } = params;

    // Convertir selectColumns a un string de columnas separadas por coma
    const selectCols = selectColumns.join(', ');

    // Construir la consulta SQL
    const query = `
        SELECT ${selectCols} 
        FROM ?? AS t1
        JOIN ?? AS t2 ON t1.${joinColumn1} = t2.${joinColumn2}
        WHERE t1.${idColumn} = ?
    `;

    // Ejecutar la consulta SQL
    connection.query(query, [table1, table2, idValue], (err, results) => {
        if (err) {
            console.error(`Error al obtener los registros con JOIN de las tablas ${table1} y ${table2}:`, err);
            return callback(err);
        }
        callback(null, results);
    });
}


function login(email, contrasena, callback) {
    const callProcedure = `CALL sp_login(?, ?, @p_login_success)`;
    const checkResult = `SELECT @p_login_success AS login_success`;

    connection.query(callProcedure, [email, contrasena], (err) => {
        if (err) {
            console.error('Error al llamar al procedimiento almacenado sp_login:', err);
            return callback(err);
        }
        connection.query(checkResult, (err, results) => {
            if (err) {
                console.error('Error al seleccionar la variable de salida:', err);
                return callback(err);
            }
            const loginSuccess = results[0].login_success;
            callback(null, loginSuccess);
        });
    });
}

function obtenerProcesosEmpleado(idEmpleado, callback) {
    const query = `
        SELECT p.nombre_proceso, p.descripcion_proceso, p.capacidad_minima
        FROM empleado_proceso ep
        JOIN Procesos p ON ep.num_proceso = p.id_proceso
        WHERE ep.num_empleado = ?
    `;
    connection.query(query, [idEmpleado], (err, results) => {
        if (err) {
            console.error('Error al obtener los procesos del empleado:', err);
            return callback(err);
        }
        callback(null, results);
    });
}


function readTableEmpleados(nombreEmpleado, apellidosEmpleado, idEmpleado, tableName, callback) {
    const query = `SELECT ??, ??, ?? FROM ??`;
    connection.query(query, [nombreEmpleado, apellidosEmpleado, idEmpleado, tableName], (err, results) => {
        if (err) {
            console.error(`Error en la consulta de la tabla ${tableName}:`, err);
            return callback(err);
        }
        callback(null, results);
    });
}

function deleteRecordFromRelationNM(tableName, idColumnName1, id1, idColumnName2, id2, callback) {
    const query = `DELETE FROM ?? WHERE ?? = ? AND ?? = ?`;
    connection.query(query, [tableName, idColumnName1, id1, idColumnName2, id2], (err, result) => {
        if (err) {
            console.error(`Error al eliminar el registro de la tabla ${tableName}:`, err);
            return callback(err);
        }
        callback(null, result);
    });
}



// APARTADO DE DOCUMENTACION_SISTEMA_CALIDAD.html

// Función para insertar un documento en la base de datos
function insertarDocumento(data, callback) {
    const { codigo_doc, nombre, edicion, fecha, documento, extension, estado } = data;
    const query = 'INSERT INTO Documentos (codigo_doc, nombre, edicion, fecha, documento, extension, estado) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [codigo_doc, nombre, edicion, fecha, documento, extension, estado], (err, results) => {
        if (err) {
            console.error('Error al insertar documento:', err);
            return callback(err);
        }
        callback(null, results);
    });
}

// Función para verificar si el archivo ya está registrado
function verificarArchivoRuta(tableName, ColumnName, archivoRuta, callback) {
    const query = 'SELECT COUNT(*) AS count FROM ?? WHERE ?? = ?';
    connection.query(query, [tableName, ColumnName, archivoRuta], (err, results) => {
        if (err) {
            console.error('Error al verificar archivo en la base de datos:', err);
            return callback(err);
        }
        const archivoExiste = results[0].count > 0;
        callback(null, archivoExiste);
    });
}



module.exports = { readTable, leerTablaConJoin, leerTablaConDobleJoin, joinWhereId, deleteRecord, createRecord, updateRecord, selectRecordById, selectIdForArrays, buscarIdPorValor, selectRecordWithJoin, login, obtenerProcesosEmpleado, readTableEmpleados, deleteRecordFromRelationNM, insertarDocumento, verificarArchivoRuta };
