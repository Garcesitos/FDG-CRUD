document.addEventListener('DOMContentLoaded', () => {
    const tablaOfertas = document.getElementById('tabla-ofertas');

    const btnCrearOferta = document.getElementById('myBtn');
    const modalCrearOferta = document.getElementById('modalCrearOferta');
    const formOfertas = document.getElementById('formularioCrearOferta');
    const formPosiciones = document.getElementById('formularioCrearPosiciones');
    const btnCrear = document.getElementById('btnGuardarOferta');
    const btnActualizar = document.getElementById('btnActualizarOferta');
    const btnAgregarFila = document.getElementById('btnAgregarPosicion');
    const btnEliminarFila = document.getElementById('btnEliminarFila');
    const btnEliminarPosicion = document.getElementById('btnEliminarPosicion');


    const spanCerrarModal = modalCrearOferta.querySelector('.close');

    cargarDatos();

    btnCrearOferta.addEventListener('click', async () => {
        // Mostrar el modal y los formularios
        modalCrearOferta.style.display = 'block';
        formOfertas.style.display = 'flex';
        formPosiciones.style.display = 'block';
        btnCrear.style.display = 'block';
        btnAgregarFila.style.display = 'block';
        btnEliminarFila.style.display = 'block';
        btnEliminarPosicion.style.display = 'none';
        btnActualizar.style.display = 'none';

        // Limpiar el formulario de oferta
        formOfertas.reset();

        // Limpiar la tabla de posiciones
        const tbodyPosiciones = document.getElementById('tablaCrearPosiciones').getElementsByTagName('tbody')[0];
        tbodyPosiciones.innerHTML = ''; // Elimina todas las filas del tbody

        // Asegúrate de que no haya filas en la tabla
        const filas = tbodyPosiciones.getElementsByTagName('tr');
        while (filas.length > 0) {
            tbodyPosiciones.removeChild(filas[0]);
        }

        // Asegúrate de que el select de clientes esté correctamente cargado
        await dibujarClientesEnSelect();
    });


    spanCerrarModal.addEventListener('click', () => {
        modalCrearOferta.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalCrearOferta) {
            modalCrearOferta.style.display = 'none';
        }
    });

    // Obtener una referencia al botón "Agregar Posición"
    const tablaPosiciones = document.getElementById('tablaCrearPosiciones').getElementsByTagName('tbody')[0];

    btnAgregarFila.addEventListener('click', async () => {
        const nuevaFila = tablaPosiciones.insertRow();
        nuevaFila.innerHTML = `
            <td><input type="number" class="posicion" required></td>
            <td>
                <select class="pnumber" required>
                    <option value="" disabled selected>Selecciona un número</option>
                </select>
            </td>
            <td>
                <input type="text" class="denominacion" readonly>
            </td>
            <td><input type="number" class="cantidad" required></td>
            <td><input type="number" step="0.01" class="precio_unitario" required></td>
            <td>
                <select class="posicion_aceptada" required>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                </select>
            </td>
        `;

        const pnumberSelect = nuevaFila.querySelector('.pnumber');
        await dibujarArticulos(pnumberSelect);

        const cantidadInput = nuevaFila.querySelector('.cantidad');
        cantidadInput.addEventListener('input', () => verificarCantidad(pnumberSelect, cantidadInput));
        pnumberSelect.addEventListener('change', () => verificarCantidad(pnumberSelect, cantidadInput));
    });




    btnEliminarFila.addEventListener('click', async function (event) {
        event.stopPropagation();
        const ultimaFila = tablaPosiciones.lastElementChild;
        tablaPosiciones.removeChild(ultimaFila);
    });


    tablaOfertas.addEventListener('click', async event => {
        if (event.target.classList.contains('btn-eliminar')) {
            const tr = event.target.closest('tr');
            const inputNumOferta = tr.querySelector('input[type="hidden"]');
            const numOferta = inputNumOferta.value;

            window.electron.eliminarRegistro('posiciones', 'numero_oferta', numOferta);

            window.electron.eliminarRegistro('ofertas', 'numero_oferta', numOferta)
                .then(() => {
                    tr.remove();
                })
                .catch(err => console.error('Error al eliminar el registro:', err));
        } else if (event.target.classList.contains('btn-editar')) {
            const tr = event.target.closest('tr');
            const inputNumOferta = tr.querySelector('input[type="hidden"]');
            const numOferta = inputNumOferta.value;

            // Mostrar el modal para editar la oferta
            modalCrearOferta.style.display = 'block';

            // Mostrar el formulario de ofertas y posiciones
            formOfertas.style.display = 'flex';
            formPosiciones.style.display = 'block';

            // Mostrar los botones de acción correspondientes
            btnAgregarFila.style.display = 'block';
            btnEliminarFila.style.display = 'block';
            btnEliminarPosicion.style.display = 'block';
            btnActualizar.style.display = 'block';
            btnCrear.style.display = 'none';

            try {
                // Obtener y llenar el formulario de la oferta con los datos actuales
                const result = await window.electron.obtenerRegistroPorId('ofertas', 'numero_oferta', numOferta);
                llenarFormulario(result);

                // Obtener y llenar la tabla de posiciones con los datos actuales
                const posiciones = await window.electron.buscarIdParaArrays('posiciones', 'numero_oferta', numOferta);
                const arrayPosiciones = Array.isArray(posiciones) ? posiciones : [posiciones];
                llenarTablaPosiciones(arrayPosiciones);

                // Llenar el select de clientes
                await dibujarClientesEnSelect();

                const btnActualizarOferta = document.getElementById("btnActualizarOferta");
                btnActualizarOferta.onclick = async function () {
                    try {
                        const datosActualizados = obtenerDatosOferta(); // Obtener los datos actualizados del formulario de oferta
                        await window.electron.actualizarRegistro('ofertas', 'numero_oferta', numOferta, datosActualizados); // Actualizar la oferta en la base de datos

                        const datosActualizadosPosiciones = obtenerDatosPosicion(); // Obtener los datos actualizados de la tabla de posiciones

                        const posicionesExistentes = datosActualizadosPosiciones.filter(pos => pos.id !== undefined && pos.id !== null && pos.id !== '');

                        const nuevasPosiciones = datosActualizadosPosiciones.filter(pos => pos.id === undefined || pos.id === null || pos.id === '');

                        // Actualizar posiciones existentes en la base de datos
                        for (const posicion of posicionesExistentes) {
                            const { id, ...posicionSinId } = posicion; // Excluir el campo `id`
                            await window.electron.actualizarRegistro('posiciones', 'id_posicion', id, posicionSinId);
                        }

                        // Agregar nuevas posiciones a la base de datos
                        for (const posicion of nuevasPosiciones) {
                            const { id, ...posicionSinId } = posicion; // Excluir el campo `id`
                            posicionSinId.numero_oferta = numOferta; // Añadir el campo `numero_oferta`
                            await window.electron.crearRegistro('posiciones', posicionSinId);

                        }

                        modalCrearOferta.style.display = "none";
                        cargarDatos();
                    } catch (err) {
                        console.error('Error al actualizar la oferta y las posiciones:', err);
                    }
                };

                btnEliminarPosicion.onclick = async function () {
                    const tablaPosiciones = document.getElementById('tablaCrearPosiciones').getElementsByTagName('tbody')[0];
                    const ultimaFila = tablaPosiciones.lastElementChild;
                    if (ultimaFila) {
                        // Obtener el id de la última posición
                        const inputId = ultimaFila.querySelector('input[type="hidden"]');
                        const id = inputId.value;
                        console.log(id);
                        // Eliminar la posición de la base de datos
                        try {
                            await window.electron.eliminarRegistro('posiciones', 'id_posicion', id);
                        } catch (error) {
                            console.error('Error al eliminar la posición de la base de datos:', error);
                            return; // Detener la ejecución si hay un error
                        }

                        // Eliminar la última fila de la tabla en la interfaz
                        tablaPosiciones.removeChild(ultimaFila);
                    }
                };

            } catch (err) {
                console.error('Error al obtener el registro:', err);
            }
        }

    });

    document.getElementById('searchBar').addEventListener('input', function () {
        const searchTerm = this.value.trim().toLowerCase();
        filterTable(searchTerm);
    });

    // Añadir event listeners a los íconos de ordenación
    document.querySelectorAll('th .asc, th .desc').forEach(icon => {
        icon.addEventListener('click', () => {
            const table = document.getElementById('tabla-ofertas');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const th = icon.closest('th');
            const index = Array.from(th.parentElement.children).indexOf(th);
            const ascending = icon.classList.contains('asc');

            // Quitar la clase activa de todos los íconos
            document.querySelectorAll('.asc, .desc').forEach(i => i.classList.remove('active'));

            // Añadir la clase activa al icono clicado
            icon.classList.add('active');

            rows.sort((a, b) => {
                const cellA = a.children[index].textContent.trim().toLowerCase();
                const cellB = b.children[index].textContent.trim().toLowerCase();
                if (ascending) {
                    return cellA.localeCompare(cellB, undefined, { numeric: true });
                } else {
                    return cellB.localeCompare(cellA, undefined, { numeric: true });
                }
            });

            rows.forEach(row => tbody.appendChild(row));
        });
    });

    // Añadir event listeners a los íconos de ordenación de columnas de fechas
    document.querySelectorAll('th.fechas .asc, th.fechas .desc').forEach(icon => {
        icon.addEventListener('click', () => {
            const table = icon.closest('table'); // Selecciona la tabla correspondiente
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const th = icon.closest('th');
            const index = Array.from(th.parentElement.children).indexOf(th);
            const ascending = icon.classList.contains('asc');

            // Quitar la clase activa de todos los íconos
            table.querySelectorAll('.asc, .desc').forEach(i => i.classList.remove('active'));

            // Añadir la clase activa al icono clicado
            icon.classList.add('active');

            // Obtener todas las fechas y convertirlas a un formato comparable
            const dateRows = rows.map(row => {
                const cell = row.children[index].textContent.trim();
                const [day, month, year] = cell.split('/').map(Number);
                return { row, date: new Date(year, month - 1, day), originalDate: cell };
            });

            // Ordenar las filas por fecha
            dateRows.sort((a, b) => {
                if (ascending) {
                    return a.date - b.date;
                } else {
                    return b.date - a.date;
                }
            });

            // Reinsertar las filas en el tbody en el orden correcto
            dateRows.forEach(dateRow => tbody.appendChild(dateRow.row));
        });
    });




});

async function cargarDatos() {
    try {
        const params = {
            mainTable: 'ofertas',
            joinTable: 'clientes',
            mainTableKey: 'num_cliente',
            joinTableKey: 'num_cliente'
        };

        const resultados = await window.electron.leerTablaConJoin(params);
        const tbodyOfertas = document.getElementById('tbody-ofertas');
        tbodyOfertas.innerHTML = '';

        for (const oferta of resultados) {
            const tr = document.createElement('tr');
            const columnas = [
                'numero_oferta', 'fecha', 'cliente_nombre', 'atencion_de', 'Posiciones',
                'forma_de_pago', 'plazo_de_entrega', 'validez_oferta', 'oferta_aceptada'
            ];

            for (const columna of columnas) {
                const td = document.createElement('td');

                switch (columna) {
                    case 'Posiciones':
                        const vp = document.createElement('button');
                        vp.textContent = "Ver Posiciones";
                        vp.value = oferta.numero_oferta;
                        vp.className = "verPosiciones";
                        td.appendChild(vp);
                        break;
                    case 'fecha':
                        td.textContent = formatearFecha(oferta.fecha);
                        break;
                    case 'cliente_nombre':
                        td.textContent = oferta.denominacion_social || 'No encontrado';
                        break;
                    default:
                        td.textContent = oferta[columna];
                        break;
                }

                tr.appendChild(td);
            }

            // Acciones de editar y eliminar
            const tdAcciones = document.createElement('td');
            const inputNumOfertas = document.createElement('input');
            inputNumOfertas.type = 'hidden';
            inputNumOfertas.value = oferta.numero_oferta;
            tdAcciones.appendChild(inputNumOfertas);

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';
            tdAcciones.appendChild(btnEditar);

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.className = 'btn-eliminar';
            tdAcciones.appendChild(btnEliminar);

            tr.appendChild(tdAcciones);
            tbodyOfertas.appendChild(tr);
        }

        // Event listeners para botones Ver Posiciones
        const botonesVP = document.querySelectorAll('.verPosiciones');
        botonesVP.forEach(boton => {
            boton.addEventListener('click', async () => {
                const posiciones = await window.electron.buscarIdParaArrays('posiciones', 'numero_oferta', boton.value);
                modalPosiciones(posiciones);
            });
        });

    } catch (err) {
        console.error('Error al cargar ofertas:', err);
    }
}
function modalPosiciones(posiciones) {
    const f1 = document.getElementById("formularioCrearOferta");
    const btn1 = document.getElementById("btnGuardarOferta");
    const btn2 = document.getElementById("btnAgregarPosicion");
    const btn3 = document.getElementById("btnEliminarPosicion");
    const btn4 = document.getElementById("btnEliminarFila");
    const btn5 = document.getElementById("btnActualizarOferta");
    f1.style.display = 'none';
    btn1.style.display = 'none';
    btn2.style.display = 'none';
    btn3.style.display = 'none';
    btn4.style.display = 'none';
    btn5.style.display = 'none';

    const modal = document.getElementById("modalCrearOferta");
    modal.style.display = 'block';

    const tbodyPosiciones = document.getElementById('tablaCrearPosiciones').getElementsByTagName('tbody')[0];
    tbodyPosiciones.innerHTML = '';

    console.log(posiciones);
    posiciones.forEach(posicion => {
        const nuevaFila = tbodyPosiciones.insertRow();
        nuevaFila.innerHTML = `
            <td><span class="posicion">${posicion.posicion}</span></td>
            <td><span class="pnumber">${posicion.pnumber}</span></td>
            <td><span class="denominacion">${posicion.denominacion}</span></td>
            <td><span class="cantidad">${posicion.cantidad}</span></td>
            <td><span class="precio_unitario">${posicion.precio_unitario}</span></td>
            <td><span class="posicion_aceptada">${posicion.posicion_aceptada}</span></td>
        `;
    });
}

function formatearFecha(fecha) {
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

async function dibujarClientesEnSelect() {
    try {
        const clientes = await window.electron.leerTabla('clientes');
        const selectCliente = document.getElementById('cliente');

        selectCliente.innerHTML = '';

        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.num_cliente;
            option.text = cliente.denominacion_social;
            selectCliente.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
    }
}

function obtenerDatosOferta() {
    const fecha = document.getElementById('fecha').value;
    const num_cliente = document.getElementById('cliente').value;
    const atencion_de = document.getElementById('atencionDe').value;
    const forma_de_pago = document.getElementById('formaDePago').value;
    const plazo_de_entrega = document.getElementById('plazoDeEntrega').value;
    const validez_oferta = document.getElementById('validezOferta').value;
    const oferta_aceptada = document.getElementById('ofertaAceptada').value;

    return {
        fecha,
        num_cliente,
        atencion_de,
        forma_de_pago,
        plazo_de_entrega,
        validez_oferta,
        oferta_aceptada
    };
}

function obtenerDatosPosicion() {
    const tbodyPosiciones = document.getElementById('tablaCrearPosiciones').getElementsByTagName('tbody')[0];
    const filas = tbodyPosiciones.getElementsByTagName('tr');
    const datosPosiciones = [];

    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];

        const idPosicion = fila.querySelector('.posicion-id') ? fila.querySelector('.posicion-id').value : null;
        const posicion = fila.querySelector('.posicion') ? fila.querySelector('.posicion').value : null;
        const numero_articulo = fila.querySelector('.pnumber') ? fila.querySelector('.pnumber').value : null;
        const pnumberSelect = fila.querySelector('.pnumber');
        const pnumber = pnumberSelect ? pnumberSelect.options[pnumberSelect.selectedIndex].text : null;
        const denominacion = fila.querySelector('.denominacion') ? fila.querySelector('.denominacion').value : null;
        const cantidad = fila.querySelector('.cantidad') ? fila.querySelector('.cantidad').value : null;
        const precioUnitario = fila.querySelector('.precio_unitario') ? fila.querySelector('.precio_unitario').value : null;
        const posicionAceptada = fila.querySelector('.posicion_aceptada') ? fila.querySelector('.posicion_aceptada').value : null;

        if (posicion && pnumber && denominacion && cantidad && precioUnitario && posicionAceptada) {
            datosPosiciones.push({
                id: idPosicion,
                posicion: posicion,
                numero_articulo: numero_articulo,
                pnumber: pnumber,
                denominacion: denominacion,
                cantidad: cantidad,
                precio_unitario: precioUnitario,
                posicion_aceptada: posicionAceptada
            });
        }
    }
    return datosPosiciones;
}

async function guardarOferta() {
    const datosOferta = obtenerDatosOferta();

    try {
        const resultado = await window.electron.crearRegistro('ofertas', datosOferta);
        cargarDatos();
        return resultado.insertId; // Devuelve el ID de la oferta creada
    } catch (error) {
        console.error('Error al guardar la oferta:', error);
    }
}

async function guardarPosiciones(numeroOferta) {
    const filasPosiciones = document.querySelectorAll('#tablaCrearPosiciones tbody tr');

    for (const filaPosicion of filasPosiciones) {
        const posicion = filaPosicion.querySelector('.posicion').value;
        const pnumberSelect = filaPosicion.querySelector('.pnumber');
        const pnumber = pnumberSelect.options[pnumberSelect.selectedIndex].text;
        const numero_articulo = pnumberSelect.value; // Guardar el value del select pnumber como numero_articulo
        const denominacion = filaPosicion.querySelector('.denominacion').value;
        const cantidad = filaPosicion.querySelector('.cantidad').value;
        const precio_unitario = filaPosicion.querySelector('.precio_unitario').value;
        const posicion_aceptadaSelect = filaPosicion.querySelector('.posicion_aceptada');
        const posicion_aceptada = posicion_aceptadaSelect.options[posicion_aceptadaSelect.selectedIndex].text;

        const datosPosicion = {
            posicion,
            numero_oferta: numeroOferta,
            pnumber,
            numero_articulo, // Guardar el valor seleccionado como numero_articulo
            denominacion,
            cantidad,
            precio_unitario,
            posicion_aceptada
        };

        try {
            await window.electron.crearRegistro('posiciones', datosPosicion);
            cargarDatos();
        } catch (error) {
            console.error('Error al guardar la posición:', error);
        }
    }
}



document.getElementById('btnGuardarOferta').addEventListener('click', async () => {
    const numeroOferta = await guardarOferta();
    if (numeroOferta) {
        await guardarPosiciones(numeroOferta);
        modalCrearOferta.style.display = 'none';

    } else {
        console.error('No se pudo obtener el numero de oferta');
    }
});

function llenarFormulario(data) {
    let fechaFormateada = new Date(data.fecha).toISOString().split('T')[0];
    document.getElementById('fecha').value = fechaFormateada;
    document.getElementById('cliente').value = data.cliente;
    document.getElementById('atencionDe').value = data.atencion_de;
    document.getElementById('formaDePago').value = data.forma_de_pago;
    document.getElementById('plazoDeEntrega').value = data.plazo_de_entrega;
    document.getElementById('validezOferta').value = data.validez_oferta;
    document.getElementById('ofertaAceptada').value = data.oferta_aceptada;
}

async function llenarTablaPosiciones(posiciones) {
    const tbodyPosiciones = document.getElementById('tablaCrearPosiciones').getElementsByTagName('tbody')[0];
    // Limpiar la tabla de posiciones antes de llenarla
    tbodyPosiciones.innerHTML = '';

    posiciones.forEach(async posicion => {
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
        <td><input type="hidden" class="posicion-id" value="${posicion.id_posicion || ''}"><input type="number" class="posicion" value="${posicion.posicion}" required></td>
        <td>
            <select class="pnumber" required>
                
            </select>
            <label class="labelTd">P/N Artículo anterior: ${posicion.pnumber}</label>
        </td>
        <td><input type="text" class="denominacion" value="${posicion.denominacion}" readonly required></td>
        <td><input type="number" class="cantidad" value="${posicion.cantidad}" required></td>
        <td><input type="number" step="0.01" class="precio_unitario" value="${posicion.precio_unitario}" required></td>
        <td>
            <select class="posicion_aceptada" required>
                <option value="Si">Sí</option>
                <option value="No">No</option>
            </select>
        </td>
    `;

        // Obtener el select pnumber y llenar las opciones
        const pnumberSelect = nuevaFila.querySelector('.pnumber');
        await dibujarArticulos(pnumberSelect);

        // Configurar el valor seleccionado del select posicion_aceptada
        const selectAceptada = nuevaFila.querySelector('.posicion_aceptada');
        selectAceptada.value = posicion.posicion_aceptada === 'Si' ? 'Si' : 'No';

        tbodyPosiciones.appendChild(nuevaFila);
    });
}


function filterTable(searchTerm) {
    const table = document.getElementById('tabla-ofertas');
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        // Verificar si la fila es una cabecera (th)
        if (rows[i].getElementsByTagName('th').length > 0) {
            continue; // Saltar la iteración si es una cabecera
        }

        const cells = rows[i].getElementsByTagName('td');
        let found = false;

        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent.toLowerCase();
            if (cellText.includes(searchTerm)) {
                found = true;
                break;
            }
        }

        if (found) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}


async function dibujarArticulos(pnumberSelect) {
    try {
        const articulos = await window.electron.leerTabla("articulos");

        // Limpia las opciones previas del select
        pnumberSelect.innerHTML = '<option value="" disabled selected>Selecciona un número</option>';

        // Llena el select con las opciones de artículos
        articulos.forEach(articulo => {
            const optionElement = document.createElement('option');
            optionElement.value = articulo.num_articulo_interno;
            optionElement.text = articulo.pn_articulo;
            pnumberSelect.appendChild(optionElement);
        });

        pnumberSelect.addEventListener('change', function () {
            const selectedId = pnumberSelect.value;
            const selectedArticulo = articulos.find(articulo => articulo.num_articulo_interno == selectedId);
            const denominacionInput = pnumberSelect.closest('tr').querySelector('.denominacion');

            if (selectedArticulo && denominacionInput) {
                denominacionInput.value = selectedArticulo.denominacion;
            } else if (denominacionInput) {
                denominacionInput.value = ''; // Limpia el campo si no se encuentra el artículo
            }
        });

    } catch (error) {
        console.error('Error al leer la tabla de artículos:', error);
    }
}

async function verificarCantidad(pnumberSelect, cantidadInput) {
    try {
        const almacen = await window.electron.leerTabla('almacen');
        const selectedArticuloId = pnumberSelect.value;
        const cantidadOfertada = parseFloat(cantidadInput.value) || 0;

        // Encontrar el artículo seleccionado en el almacén usando numero_codigo
        const articuloEnAlmacen = almacen.find(item => item.numero_codigo == selectedArticuloId);

        if (articuloEnAlmacen) {
            const cantidadStock = articuloEnAlmacen.cantidad;

            if (cantidadOfertada > cantidadStock) {
                cantidadInput.classList.add('input-error');
            } else {
                cantidadInput.classList.remove('input-error');
            }
        } else {
            cantidadInput.classList.add('input-error');
        }
    } catch (error) {
        console.error('Error al verificar la cantidad:', error);
        cantidadInput.classList.remove('input-error');
    }
}
