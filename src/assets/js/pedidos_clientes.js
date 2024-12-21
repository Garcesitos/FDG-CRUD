document.addEventListener('DOMContentLoaded', () => {
    const tablaPedidos = document.getElementById('tabla-pedido');

    const btnCrearPedido = document.getElementById('myBtn');
    const modalCrearPedido = document.getElementById('modalCrearPedido');
    const formPedido = document.getElementById('formularioCrearPedido');
    const formPosicionesPedido = document.getElementById('formularioCrearPosicionesPedidos');
    const btnCrear = document.getElementById('btnGuardarPedido');
    const btnActualizar = document.getElementById('btnActualizarPedido');
    const btnAgregarFila = document.getElementById('btnAgregarPosicion');
    const btnEliminarFila = document.getElementById('btnEliminarFila');
    const btnEliminarPosicion = document.getElementById('btnEliminarPosicion');

    const spanCerrarModal = modalCrearPedido.querySelector('.close');

    cargarDatos();

    btnCrearPedido.addEventListener('click', async () => {
        modalCrearPedido.style.display = 'block';
        formPedido.style.display = 'flex';
        formPosicionesPedido.style.display = 'block';
        btnCrear.style.display = 'block';
        btnAgregarFila.style.display = 'block';
        btnEliminarFila.style.display = 'block';

        btnActualizar.style.display = 'none';
        btnEliminarPosicion.style.display = 'none';
        btnActualizar.style.display = 'none';

        formPedido.reset();

        const formPosicionesPedido2 = document.getElementById('tablaCrearPosicionesPedidos').getElementsByTagName('tbody')[0];
        formPosicionesPedido2.innerHTML = '';

        const filas = formPosicionesPedido2.getElementsByTagName('tr');
        while (filas.length > 0) {
            formPosicionesPedido2.removeChild(filas[0]);
        }
        await dibujarClientes();
        await dibujarOfertasAceptadas();
    });

    spanCerrarModal.addEventListener('click', () => {
        modalCrearPedido.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalCrearPedido) {
            modalCrearPedido.style.display = 'none';
        }
    });

    // Obtener una referencia al botón "Agregar Posición"
    const tablaPosiciones = document.getElementById('tablaCrearPosicionesPedidos').getElementsByTagName('tbody')[0];

    btnAgregarFila.addEventListener('click', async () => {
        const nuevaFila = tablaPosiciones.insertRow();
        nuevaFila.innerHTML = `
            <td><input type="number" class="posicion" required></td>
            <td>
                <select class="articulo_pedido" required>
                    <option value="" disabled selected>Selecciona un número</option>
                </select>
            </td>
            <td><input type="text" class="denominacion" readonly></td>
            <td><input type="text" class="denominacion_pedido"></td>
            <td><input type="number" step="1" class="cantidad" required></td>
            <td><input type="number" step="0.01" class="precio_unitario" required></td>
            <td><input type="date" class="plazo_de_entrega"></td>
            <td>
                <select class="completado" required>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                </select>
            </td>
            <td><input type="text" class="rcps_aplicable"></td>
            <td><input type="number" class="precio_total" readonly></td>
        `;

        const pnumberSelect = nuevaFila.querySelector('.articulo_pedido');
        await dibujarArticulos(pnumberSelect);

        const cantidadInput = nuevaFila.querySelector('.cantidad');
        const precioUnitarioInput = nuevaFila.querySelector('.precio_unitario');
        const totalInput = nuevaFila.querySelector('.precio_total');

        const actualizarTotal = () => {
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const precioUnitario = parseFloat(precioUnitarioInput.value) || 0;
            totalInput.value = (cantidad * precioUnitario).toFixed(2);
        };

        cantidadInput.addEventListener('input', () => {
            actualizarTotal();
            verificarCantidad(pnumberSelect, cantidadInput);
        });

        pnumberSelect.addEventListener('change', () => verificarCantidad(pnumberSelect, cantidadInput));
        precioUnitarioInput.addEventListener('input', actualizarTotal);
    });



    btnEliminarFila.addEventListener('click', async function (event) {
        event.stopPropagation();
        const ultimaFila = tablaPosiciones.lastElementChild;
        tablaPosiciones.removeChild(ultimaFila);
    });


    tablaPedidos.addEventListener('click', async event => {
        if (event.target.classList.contains('btn-eliminar')) {
            const tr = event.target.closest('tr');
            const inputNumPedido = tr.querySelector('input[type="hidden"]');
            const numPedido = inputNumPedido.value;

            // Eliminar las posiciones relacionadas primero
            window.electron.eliminarRegistro('posiciones_pedidas', 'pedido_cliente_relacionado', numPedido)
                .then(() => {
                    // Luego eliminar el pedido
                    return window.electron.eliminarRegistro('pedidos_clientes', 'num_pedido_cliente', numPedido);
                })
                .then(() => {
                    // Remover la fila de la tabla después de eliminar el pedido
                    tr.remove();
                })
                .catch(err => console.error('Error al eliminar el registro:', err));
        } else if (event.target.classList.contains('btn-editar')) {
            const tr = event.target.closest('tr');
            const inputNumPedido = tr.querySelector('input[type="hidden"]');
            const numPedido = inputNumPedido.value;

            // Mostrar el modal para editar la oferta
            modalCrearPedido.style.display = 'block';

            // Mostrar el formulario de ofertas y posiciones
            formPedido.style.display = 'flex';
            formPosicionesPedido.style.display = 'block';

            // Mostrar los botones de acción correspondientes
            btnAgregarFila.style.display = 'block';
            btnEliminarFila.style.display = 'none';
            btnEliminarPosicion.style.display = 'block';
            btnActualizar.style.display = 'block';
            btnCrear.style.display = 'none';

            try {
                // Obtener y llenar el formulario de la oferta con los datos actuales
                const result = await window.electron.obtenerRegistroPorId('pedidos_clientes', 'num_pedido_cliente', numPedido);
                llenarFormulario(result);

                // Obtener y llenar la tabla de posiciones con los datos actuales
                const posiciones = await window.electron.buscarIdParaArrays('posiciones_pedidas', 'pedido_cliente_relacionado', numPedido);
                const arrayPosiciones = Array.isArray(posiciones) ? posiciones : [posiciones];
                llenarTablaPosiciones(arrayPosiciones);

                const idsPosiciones = [];
                const obtenerIdsPosicionesPedidasPromise = new Promise((resolve) => {
                    setTimeout(() => {
                        // Obtener los IDs de posiciones pedidas una vez que los datos están dibujados
                        const tabla = document.getElementById('tablaCrearPosicionesPedidos');
                        const inputsHidden = tabla.querySelectorAll('input[type="hidden"]');

                        inputsHidden.forEach(input => {
                            const idPosicion = input.value;
                            idsPosiciones.push(idPosicion);
                        });

                    }, 200);
                });

                // Escuchar cambios en el campo select "ofertasPedido"
                const selectOfertas = document.getElementById('ofertasPedido');

                selectOfertas.addEventListener('change', function () {
                    selectCambio = true;
                    console.log("El campo select ha cambiado");
                });

                const btnActualizarOferta = document.getElementById("btnActualizarPedido");
                btnActualizarOferta.onclick = async function () {
                    try {
                        const datosActualizados = await obtenerDatosPedido(); // Obtener los datos actualizados del formulario de oferta
                        await window.electron.actualizarRegistro('pedidos_clientes', 'num_pedido_cliente', numPedido, datosActualizados); // Actualizar la oferta en la base de datos

                        // Si el select ha cambiado, eliminar las posiciones pedidas almacenadas en idsPosiciones
                        if (selectCambio) {
                            for (const idPosicion of idsPosiciones) {
                                await window.electron.eliminarRegistro('posiciones_pedidas', 'id_posicion_pedida', idPosicion);
                                console.log(`Posición con ID ${idPosicion} eliminada.`);
                            }
                        }
                        
                        const datosActualizadosPosicionesPedidas = obtenerDatosPosicionesPedidas(); // Obtener los datos actualizados de la tabla de posiciones

                        // Separar posiciones existentes (con id_posicion_pedida definido) de las nuevas (sin id_posicion_pedida)
                        const posicionesPedidasExistentes = datosActualizadosPosicionesPedidas.filter(pos => pos.id_posicion_pedida !== undefined && pos.id_posicion_pedida && pos.id_posicion_pedida !== '');
                        const nuevasPosicionesPedidas = datosActualizadosPosicionesPedidas.filter(pos => pos.id_posicion_pedida === undefined || pos.id_posicion_pedida === null || pos.id_posicion_pedida === '');

                        // Actualizar posiciones existentes en la base de datos
                        for (const posicion of posicionesPedidasExistentes) {
                            const { id_posicion_pedida, ...posicionSinId } = posicion;
                            await window.electron.actualizarRegistro('posiciones_pedidas', 'id_posicion_pedida', id_posicion_pedida, posicionSinId);
                        }

                        // Agregar nuevas posiciones a la base de datos
                        for (const posicion of nuevasPosicionesPedidas) {
                            const posicionSinId = { ...posicion };
                            delete posicionSinId.id_posicion_pedida;
                            posicionSinId.pedido_cliente_relacionado = numPedido;
                            await window.electron.crearRegistro('posiciones_pedidas', posicionSinId);
                        }

                        // Cerrar modal y actualizar datos
                        modalCrearPedido.style.display = "none";
                        cargarDatos();
                    } catch (err) {
                        console.error('Error al actualizar la oferta y las posiciones:', err);
                    }

                };

                btnEliminarPosicion.onclick = async function () {
                    const tablaPosiciones = document.getElementById('tablaCrearPosicionesPedidos').getElementsByTagName('tbody')[0];
                    const ultimaFila = tablaPosiciones.lastElementChild;

                    if (ultimaFila) {
                        const inputId = ultimaFila.querySelector('input[type="hidden"]');
                        const id = inputId ? inputId.value : null;

                        // Si el id es null o undefined, simplemente elimina la fila del DOM
                        if (id === null || id === undefined || id === '') {
                            tablaPosiciones.removeChild(ultimaFila);
                        } else {
                            // Si hay un id válido, intenta eliminar el registro de la base de datos
                            try {
                                await window.electron.eliminarRegistro('posiciones_pedidas', 'id_posicion_pedida', id);
                            } catch (error) {
                                console.error('Error al eliminar la posición de la base de datos:', error);
                                return;
                            }

                            tablaPosiciones.removeChild(ultimaFila);
                        }
                    }
                };


            } catch (err) {
                console.error('Error al obtener el registro:', err);
            }
        }

    });

    const ofertasPedidoSelect = document.getElementById('ofertasPedido');
    ofertasPedidoSelect.addEventListener('change', async () => {
        const id = ofertasPedidoSelect.value;
        if (id) {
            const posiciones = await window.electron.buscarIdParaArrays('posiciones', 'numero_oferta', id);
            dibujarPosiciones(posiciones);
        }
    });

    document.getElementById('searchBar').addEventListener('input', function () {
        const searchTerm = this.value.trim().toLowerCase();
        filterTable(searchTerm);
    });

    // Añadir event listeners a los íconos de ordenación
    document.querySelectorAll('th .asc, th .desc').forEach(icon => {
        icon.addEventListener('click', () => {
            const table = document.getElementById('tabla-pedido');
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
                    return cellA.localeCompare(cellB, undefined, {numeric: true});
                } else {
                    return cellB.localeCompare(cellA, undefined, {numeric: true});
                }
            });

            rows.forEach(row => tbody.appendChild(row));
        });
    });

    // Añadir event listeners a los íconos de ordenación de columnas de fechas
    document.querySelectorAll('th.fechas .asc, th.fechas .desc').forEach(icon => {
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
                const cellA = a.children[index].textContent.trim();
                const cellB = b.children[index].textContent.trim();

                // Convertir fechas DD/MM/AAAA a AAAA-MM-DD para compararlas
                const dateA = cellA.split('/').reverse().join('-');
                const dateB = cellB.split('/').reverse().join('-');

                if (ascending) {
                    return new Date(dateA) - new Date(dateB);
                } else {
                    return new Date(dateB) - new Date(dateA);
                }
            });

            rows.forEach(row => tbody.appendChild(row));
        });
    });

});

async function cargarDatos() {
    try {
        const params = {
            mainTable: 'Pedidos_clientes',
            joinTable1: 'Clientes',
            mainTableKey1: 'cliente_relacionado',
            joinTableKey1: 'num_cliente',
            joinTable2: 'Ofertas',
            mainTableKey2: 'oferta_relacionada',
            joinTableKey2: 'numero_oferta'
        };

        const resultados = await window.electron.leerTablaConDobleJoin(params);
        const tbodyPedidos = document.getElementById('tbody-pedido');
        tbodyPedidos.innerHTML = '';

        for (const pedidos of resultados) {
            const tr = document.createElement('tr');
            const columnas = [
                'num_pedido_cliente', 'fecha_pedido', 'denominacion_social', 'numero_oferta', 'direccion_pedido', 'posiciones_pedidas'
            ];

            for (const columna of columnas) {
                const td = document.createElement('td');

                switch (columna) {
                    case 'direccion_pedido':
                        td.textContent = pedidos.direccion_pedido;
                        break;
                    case 'fecha_pedido':
                        td.textContent = formatearFecha(pedidos.fecha_pedido);
                        break;
                    case 'denominacion_social':
                        td.textContent = pedidos.denominacion_social || 'No encontrado';
                        break;
                    case 'numero_oferta':
                        const btnMostrarOferta = document.createElement('button');
                        btnMostrarOferta.textContent = 'Mostrar oferta';
                        btnMostrarOferta.value = pedidos.numero_oferta;
                        btnMostrarOferta.className = 'btn-mostrar-oferta';
                        td.appendChild(btnMostrarOferta);
                        btnMostrarOferta.onclick = async function () {
                            const oferta = await window.electron.obtenerRegistroPorId('ofertas', 'numero_oferta', this.value);
                            const formOf = document.getElementById('formularioVerOferta');
                            formOf.style.display = 'flex';
                            const formPos = document.getElementById('formularioVerPosiciones');
                            formPos.style.display = 'block';
                            const formPosPed = document.getElementById('formularioVerPosicionesPedidas');
                            formPosPed.style.display = 'none';
                            mostrarOferta(oferta);
                        };
                        break;
                    case 'posiciones_pedidas':
                        const btnMostrarPosicionesPedidas = document.createElement('button');
                        btnMostrarPosicionesPedidas.textContent = 'Mostrar Posiciones Pedidas';
                        btnMostrarPosicionesPedidas.value = pedidos.num_pedido_cliente;
                        btnMostrarPosicionesPedidas.className = 'btn-posiciones-pedidas';
                        td.appendChild(btnMostrarPosicionesPedidas);
                        btnMostrarPosicionesPedidas.onclick = async function () {
                            const posicionesPedidas = await window.electron.obtenerRegistroPorId('posiciones_pedidas', 'pedido_cliente_relacionado', this.value);
                            const formOf = document.getElementById('formularioVerOferta');
                            formOf.style.display = 'none';
                            const formPos = document.getElementById('formularioVerPosiciones');
                            formPos.style.display = 'none';
                            const formPosPed = document.getElementById('formularioVerPosicionesPedidas');
                            formPosPed.style.display = 'block';
                            mostrarPosicionesPedidas(posicionesPedidas);
                        };
                        break;
                    default:
                        td.textContent = pedidos[columna];
                        break;
                }

                tr.appendChild(td);
            }

            // Acciones de editar y eliminar
            const tdAcciones = document.createElement('td');
            const inputNumPedidos = document.createElement('input');
            inputNumPedidos.type = 'hidden';
            inputNumPedidos.value = pedidos.num_pedido_cliente; // Cambio de `numero_oferta` a `num_pedido_cliente`
            tdAcciones.appendChild(inputNumPedidos);

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';
            tdAcciones.appendChild(btnEditar);

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.className = 'btn-eliminar';
            tdAcciones.appendChild(btnEliminar);

            tr.appendChild(tdAcciones);
            tbodyPedidos.appendChild(tr);
        }

        const ofertasPedidoSelect = document.getElementById('ofertasPedido');
        ofertasPedidoSelect.addEventListener('change', async () => {
            const id = ofertasPedidoSelect.value;
            if (id) {
                const params = {
                    mainTable: 'posiciones',
                    joinTable: 'articulos',
                    mainTableKey: 'numero_articulo',
                    joinTableKey: 'num_articulo_interno',
                    mainCondition: 'numero_oferta',
                    idValue: id
                };
                const posiciones = await window.electron.joinWhereId(params);
                dibujarPosiciones(posiciones);
            }
        });

    } catch (err) {
        console.error('Error al cargar datos:', err);
    }
}

async function obtenerPosicionesOferta(numeroOferta) {
    try {
        const posiciones = await window.electron.buscarIdParaArrays('posiciones', 'numero_oferta', numeroOferta);
        return posiciones;
    } catch (err) {
        console.error('Error al obtener posiciones de la oferta:', err);
        return [];
    }
}

async function mostrarOferta(oferta) {
    const posiciones = await obtenerPosicionesOferta(oferta.numero_oferta);

    // Referencias al modal y sus elementos
    const modal = document.getElementById('modalVerOferta');
    const closeBtn = modal.querySelector('.close');
    const formularioVerOferta = document.getElementById('formularioVerOferta');
    const tablaVerPosiciones = document.getElementById('tablaVerPosiciones').querySelector('tbody');

    // Rellenar los campos del formulario con la oferta recibida
    formularioVerOferta.querySelector('#numOf').value = oferta.numero_oferta;
    //ARREGLAR FECHA MODAL VISTA OFERTA
    formularioVerOferta.querySelector('#fecha').value = formatearFechaParaInput(oferta.fecha);
    const cliente = await obtenerCliente(oferta.num_cliente);
    formularioVerOferta.querySelector('#cliente').value = cliente;
    formularioVerOferta.querySelector('#atencionDe').value = oferta.atencion_de;
    formularioVerOferta.querySelector('#formaDePago').value = oferta.forma_de_pago;
    formularioVerOferta.querySelector('#plazoDeEntrega').value = oferta.plazo_de_entrega;
    formularioVerOferta.querySelector('#validezOferta').value = oferta.validez_oferta;
    formularioVerOferta.querySelector('#ofertaAceptada').value = oferta.oferta_aceptada ? 'Si' : 'No';

    // Limpiar la tabla de posiciones
    tablaVerPosiciones.innerHTML = '';

    try {
        // Añadir las posiciones de la oferta a la tabla
        posiciones.forEach(posicion => {
            const tr = document.createElement('tr');

            const tdPosicion = document.createElement('td');
            tdPosicion.textContent = posicion.posicion;
            tr.appendChild(tdPosicion);

            const tdArticulo = document.createElement('td');
            tdArticulo.textContent = posicion.pnumber;
            tr.appendChild(tdArticulo);

            const tdDenominacion = document.createElement('td');
            tdDenominacion.textContent = posicion.denominacion;
            tr.appendChild(tdDenominacion);

            const tdCantidad = document.createElement('td');
            tdCantidad.textContent = posicion.cantidad;
            tr.appendChild(tdCantidad);

            const tdPrecioUnitario = document.createElement('td');
            tdPrecioUnitario.textContent = posicion.precio_unitario;
            tr.appendChild(tdPrecioUnitario);

            const tdPosicionAceptada = document.createElement('td');
            tdPosicionAceptada.textContent = posicion.posicion_aceptada;

            tr.appendChild(tdPosicionAceptada);

            tablaVerPosiciones.appendChild(tr);
        });
    } catch (err) {
        console.error('Error al cargar posiciones de la oferta:', err);
    }



    // Mostrar el modal
    modal.style.display = 'block';

    // Evento para cerrar el modal
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Cerrar el modal si el usuario hace clic fuera de él
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

async function obtenerPosicionesPedidas(posicionesPedidas) {
    try {
        const posiciones = await window.electron.buscarIdParaArrays('posiciones_pedidas', 'pedido_cliente_relacionado', posicionesPedidas);
        return posiciones;
    } catch (err) {
        console.error('Error al obtener posiciones pedidas:', err);
        return [];
    }
}
async function mostrarPosicionesPedidas(posicionesPedidas) {

    const posicionesP = await obtenerPosicionesPedidas(posicionesPedidas.pedido_cliente_relacionado);

    // Referencias al modal y sus elementos
    const modal = document.getElementById('modalVerOferta');
    const closeBtn = modal.querySelector('.close');
    const tablaVerPosicionesPedidas = document.querySelector('#formularioVerPosicionesPedidas tbody');

    // Limpiar la tabla de posiciones pedidas
    tablaVerPosicionesPedidas.innerHTML = '';

    try {
        // Añadir las posiciones pedidas a la tabla
        posicionesP.forEach(posicion => {
            const tr = document.createElement('tr');

            const tdPosicion = document.createElement('td');
            tdPosicion.textContent = posicion.posicionP;
            tr.appendChild(tdPosicion);

            const tdArticulo = document.createElement('td');
            tdArticulo.textContent = posicion.articulo_pedido;
            tr.appendChild(tdArticulo);

            const tdDenominacion = document.createElement('td');
            tdDenominacion.textContent = posicion.denominacionP;
            tr.appendChild(tdDenominacion);

            const tdDenominacionPedido = document.createElement('td');
            tdDenominacionPedido.textContent = posicion.denominacion_pedido;
            tr.appendChild(tdDenominacionPedido);

            const tdCantidad = document.createElement('td');
            tdCantidad.textContent = posicion.cantidad;
            tr.appendChild(tdCantidad);

            const tdPrecioUnitario = document.createElement('td');
            tdPrecioUnitario.textContent = posicion.precio_unitario;
            tr.appendChild(tdPrecioUnitario);

            const tdPlazoEntrega = document.createElement('td');
            tdPlazoEntrega.textContent = formatearFecha(posicion.plazo_de_entrega);
            tr.appendChild(tdPlazoEntrega);

            const tdCompletado = document.createElement('td');
            tdCompletado.textContent = posicion.completado;
            tr.appendChild(tdCompletado);

            const tdRcpsAplicable = document.createElement('td');
            tdRcpsAplicable.textContent = posicion.rcps_aplicable;
            tr.appendChild(tdRcpsAplicable);

            const tdPrecioTotal = document.createElement('td');
            tdPrecioTotal.textContent = (posicion.cantidad * posicion.precio_unitario).toFixed(2);
            tr.appendChild(tdPrecioTotal);

            tablaVerPosicionesPedidas.appendChild(tr);
        });
    } catch (err) {
        console.error('Error al cargar posiciones pedidas:', err);
    }

    // Mostrar el modal
    modal.style.display = 'block';

    // Evento para cerrar el modal
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Cerrar el modal si el usuario hace clic fuera de él
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}
async function obtenerCliente(idCliente) {
    try {
        const cliente = await window.electron.buscarIdPorValor('clientes', 'denominacion_social', 'num_cliente', idCliente);
        return cliente;
    } catch (error) {
        console.error('Error al obtener el cliente:', error);
        return null;
    }
}
function formatearFecha(fecha) {
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
function formatearFechaParaInput(fecha) {
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}
async function dibujarClientes() {
    try {
        const clientes = await window.electron.leerTabla('clientes');

        const selectCliente = document.getElementById('clientePedido');

        selectCliente.innerHTML = '';

        agregarOpcionInicial(selectCliente, 'Elegir cliente...');

        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.num_cliente;
            option.text = cliente.denominacion_social;
            selectCliente.appendChild(option);
        });

        selectCliente.addEventListener('change', (event) => {
            const selectedClienteId = event.target.value;
            actualizarDirecciones(selectedClienteId);
        });

    } catch (error) {
        console.error('Error al obtener los clientes:', error);
    }
}

async function actualizarDirecciones(clienteId) {
    let clientes = await window.electron.buscarIdParaArrays('clientes', 'num_cliente', clienteId);

    const selectDireccion = document.getElementById('direccionEntregaPedido');
    selectDireccion.innerHTML = '';
    agregarOpcionInicial(selectDireccion, 'Elegir dirección...');

    clientes.forEach((cliente) => {
        if (cliente.direccion1) {
            const option1 = document.createElement('option');
            option1.value = cliente.direccion1;
            option1.text = cliente.direccion1;
            selectDireccion.appendChild(option1);
        }
        if (cliente.direccion2) {
            const option2 = document.createElement('option');
            option2.value = cliente.direccion2;
            option2.text = cliente.direccion2;
            selectDireccion.appendChild(option2);
        }
        if (cliente.direccion3) {
            const option3 = document.createElement('option');
            option3.value = cliente.direccion3;
            option3.text = cliente.direccion3;
            selectDireccion.appendChild(option3);
        }
        if (cliente.direccion4) {
            const option4 = document.createElement('option');
            option4.value = cliente.direccion4;
            option4.text = cliente.direccion4;
            selectDireccion.appendChild(option4);
        }
    });
}

async function dibujarOfertasAceptadas() {
    try {
        const ofertas = await window.electron.leerTabla('ofertas');

        const selectOferta = document.getElementById('ofertasPedido');

        selectOferta.innerHTML = '';

        agregarOpcionInicial(selectOferta, 'Elegir oferta...');

        ofertas.filter(oferta => oferta.oferta_aceptada === 'Si').forEach(oferta => {
            const option = document.createElement('option');
            option.value = oferta.numero_oferta;
            option.text = `${oferta.numero_oferta}`;
            selectOferta.appendChild(option);
        });

    } catch (error) {
        console.error('Error al obtener las ofertas:', error);
    }
}
function agregarOpcionInicial(selectElement, texto) {
    const optionInicial = document.createElement('option');
    optionInicial.value = '';
    optionInicial.text = texto;
    optionInicial.disabled = true;
    optionInicial.selected = true;
    selectElement.appendChild(optionInicial);
}
async function dibujarPosiciones(posiciones) {
    const tbody = document.querySelector('#tablaCrearPosicionesPedidos tbody');
    tbody.innerHTML = ''; // Limpiar el contenido actual del tbody

    posiciones.forEach(async posicion => {
        // Verificar si la posición está aceptada
        if (posicion.posicion_aceptada === 'Si') {
            const tr = document.createElement('tr');

            // Formatear la fecha al formato yyyy-MM-dd
            const plazoEntrega = posicion.plazo_de_entrega ? new Date(posicion.plazo_de_entrega).toISOString().split('T')[0] : '';

            // Crear celdas para cada columna
            tr.innerHTML = `
                <td><input type="text" class="posicion" value="${posicion.posicion}"/></td>
                <td>
                    <select class="articulo_pedido" required>
                        <option value="" disabled selected>Selecciona un número</option>
                    </select>
                </td>
                <td><input type="text" class="denominacion" value="${posicion.denominacion}" readonly/></td>
                <td><input type="text" value="" class="denominacion_pedido"/></td>
                <td><input type="number" class="cantidad" value="" placeholder="${posicion.cantidad}"/></td>
                <td><input type="number" class="precio_unitario" value="" placeholder="${posicion.precio_unitario}"/></td>
                <td><input type="date" class="plazo_de_entrega" value="${plazoEntrega}" /></td>
                <td>
                    <select class="completado">
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                    </select>
                </td>
                <td><input type="text" class="rcps_aplicable" value="" /></td>
                <td><input type="number" class="precio_total" value="" placeholder="${posicion.cantidad * posicion.precio_unitario}" readonly/></td>
            `;


            // Añadir la fila al tbody
            tbody.appendChild(tr);

            const cantidadInput = tr.querySelector('.cantidad');
            const precioUnitarioInput = tr.querySelector('.precio_unitario');
            const totalInput = tr.querySelector('.precio_total');

            const actualizarTotal = () => {
                const cantidad = parseFloat(cantidadInput.value) || 0;
                const precioUnitario = parseFloat(precioUnitarioInput.value) || 0;
                totalInput.value = (cantidad * precioUnitario).toFixed(2);
            };

            const pnumberSelect = tr.querySelector('.articulo_pedido');
            await dibujarArticulos(pnumberSelect, posicion.pn_articulo);

            cantidadInput.addEventListener('input', () => {
                actualizarTotal();
                verificarCantidad(pnumberSelect, cantidadInput);
            });

            pnumberSelect.addEventListener('change', () => verificarCantidad(pnumberSelect, cantidadInput));
            precioUnitarioInput.addEventListener('input', actualizarTotal);
        }
    });
}
function obtenerDatosPedido() {
    const fechaPedido = document.getElementById('fechaPedido').value ? document.getElementById('fechaPedido').value : null;
    const nombreCliente = document.getElementById('clientePedido').value ? document.getElementById('clientePedido').value : null;
    const referenciaOferta = document.getElementById('ofertasPedido').value ? document.getElementById('ofertasPedido').value : null;
    const direccionCliente = document.getElementById('direccionEntregaPedido').value ? document.getElementById('direccionEntregaPedido').value : null;

    return {
        fecha_pedido: fechaPedido,
        cliente_relacionado: nombreCliente,
        oferta_relacionada: referenciaOferta,
        direccion_pedido: direccionCliente
    };
}
function obtenerDatosPosicionesPedidas() {
    const tbodyPosiciones = document.getElementById('tablaCrearPosicionesPedidos').getElementsByTagName('tbody')[0];
    const filas = tbodyPosiciones.getElementsByTagName('tr');
    const datosPosiciones = [];

    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];

        // Verificar cada campo antes de acceder a su propiedad value
        const idPosicionPedida = fila.querySelector('.posicion-id') ? fila.querySelector('.posicion-id').value : null;
        const posicion = fila.querySelector('.posicion') ? fila.querySelector('.posicion').value : null;
        const articuloPedido = fila.querySelector('.articulo_pedido') ? fila.querySelector('.articulo_pedido').value : null;
        const denominacion = fila.querySelector('.denominacion') ? fila.querySelector('.denominacion').value : null;
        const denominacionPedido = fila.querySelector('.denominacion_pedido') ? fila.querySelector('.denominacion_pedido').value : null;
        const cantidad = fila.querySelector('.cantidad') ? fila.querySelector('.cantidad').value : null;
        const precioUnitario = fila.querySelector('.precio_unitario') ? fila.querySelector('.precio_unitario').value : null;

        const plazoEntregaISO = fila.querySelector('.plazo_de_entrega').value;
        const fechaFormateada = formatearFechaParaInput(plazoEntregaISO);

        const completado = fila.querySelector('.completado') ? fila.querySelector('.completado').value : null;
        const rcpsAplicable = fila.querySelector('.rcps_aplicable') ? fila.querySelector('.rcps_aplicable').value : null;
        const precioTotal = fila.querySelector('.precio_total') ? fila.querySelector('.precio_total').value : null;

        // Verificar que todos los campos necesarios tienen valor antes de agregar a datosPosiciones
        if (posicion && denominacion && cantidad && precioUnitario &&
            fechaFormateada && completado && rcpsAplicable && precioTotal) {
            datosPosiciones.push({
                id_posicion_pedida: idPosicionPedida,
                posicionP: posicion,
                articulo_pedido: articuloPedido,
                denominacionP: denominacion,
                denominacion_pedido: denominacionPedido,
                cantidad: cantidad,
                precio_unitario: precioUnitario,
                plazo_de_entrega: fechaFormateada,
                completado: completado,
                rcps_aplicable: rcpsAplicable,
                precio_total: precioTotal
            });
        }
    }

    return datosPosiciones;
}

async function guardarPedido() {
    const datosPedidos = obtenerDatosPedido();

    try {
        const resultado = await window.electron.crearRegistro('pedidos_clientes', datosPedidos);
        cargarDatos();
        console.log(resultado.insertId);
        return resultado.insertId; // Devuelve el ID de la oferta creada
    } catch (error) {
        console.error('Error al guardar la oferta:', error);
    }
}
async function dibujarArticulos(pnumberSelect, defaultPnumber) {
    try {
        const articulos = await window.electron.leerTabla("articulos");

        // Llena el select con las opciones de artículos
        articulos.forEach(articulo => {
            const optionElement = document.createElement('option');
            optionElement.value = articulo.num_articulo_interno;
            optionElement.text = articulo.pn_articulo;
            if (articulo.pn_articulo === defaultPnumber) {
                optionElement.selected = true;
            }
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
async function guardarPosicionesPedidas(numeroPedido) {
    const filasPosiciones = document.querySelectorAll('#tablaCrearPosicionesPedidos tbody tr');
    const numOfertaSelect = document.querySelector('.ofertasPedido'); // Selecciona el elemento <select>
    const numOferta = numOfertaSelect ? numOfertaSelect.value : null;

    for (const filaPosicion of filasPosiciones) {
        const posicion = filaPosicion.querySelector('.posicion').value;

        const pnArticuloSelect = filaPosicion.querySelector('.articulo_pedido');
        const pnArticulo = pnArticuloSelect ? pnArticuloSelect.value : null;

        const denominacionP = filaPosicion.querySelector('.denominacion').value;

        const denominacionPedido = filaPosicion.querySelector('.denominacion_pedido').value;


        const cantidad = filaPosicion.querySelector('.cantidad').value;

        const precio_unitario = filaPosicion.querySelector('.precio_unitario').value;

        const plazo_de_entrega = filaPosicion.querySelector('.plazo_de_entrega').value;

        const completadoSelect = document.querySelector('.completado'); // Selecciona el elemento <select>
        const completado = completadoSelect ? completadoSelect.value : null;

        const rcps_aplicable = filaPosicion.querySelector('.rcps_aplicable').value;

        const precio_total = filaPosicion.querySelector('.precio_total').value;


        const datosPosicion = {
            posicionP: posicion,
            articulo_pedido: pnArticulo,
            denominacionP: denominacionP,
            pedido_cliente_relacionado: numeroPedido,
            denominacion_pedido: denominacionPedido,
            cantidad: cantidad,
            precio_unitario: precio_unitario,
            plazo_de_entrega: plazo_de_entrega,
            completado: completado,
            rcps_aplicable: rcps_aplicable,
            precio_total: precio_total
        };

        //datosPosicion.num_oferta = numOferta;

        try {
            await window.electron.crearRegistro('posiciones_pedidas', datosPosicion);
            cargarDatos(); // Función para cargar los datos después de guardar la posición (ajusta esto según tu implementación)
        } catch (error) {
            console.error('Error al guardar la posición:', error);
        }
    }
}
document.getElementById('btnGuardarPedido').addEventListener('click', async () => {
    const numeroPedido = await guardarPedido();
    if (numeroPedido) {
        await guardarPosicionesPedidas(numeroPedido);
        modalCrearPedido.style.display = 'none';

    } else {
        console.error('No se pudo obtener el numero de oferta');
    }
});
async function verificarCantidad(pnumberSelect, cantidadInput) {
    try {
        const almacen = await window.electron.leerTabla('almacen');
        const selectedArticuloId = pnumberSelect.value;
        const cantidadPedida = parseFloat(cantidadInput.value) || 0;

        // Encontrar el artículo seleccionado en el almacén usando numero_codigo
        const articuloEnAlmacen = almacen.find(item => item.numero_codigo == selectedArticuloId);

        if (articuloEnAlmacen) {
            const cantidadStock = articuloEnAlmacen.cantidad;

            if (cantidadPedida > cantidadStock) {
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
async function dibujarDirecciones(clienteId) {
    try {
        const direccionP = await window.electron.buscarIdPorValor('pedidos_clientes', 'direccion_pedido', 'num_pedido_cliente', clienteId);

        const direccionesClientes = await window.electron.buscarIdParaArrays('clientes', 'num_cliente', clienteId);

        const selectDireccion = document.getElementById('direccionEntregaPedido');

        selectDireccion.innerHTML = '';

        agregarOpcionInicial(selectDireccion, 'Elegir dirección...');

        if (direccionP) {
            const optionPedido = document.createElement('option');
            optionPedido.value = direccionP.id_direccion;
            optionPedido.textContent = direccionP.direccion_completa;
            selectDireccion.appendChild(optionPedido);
        }

        direccionesClientes.forEach(cliente => {
            const optionCliente1 = document.createElement('option');
            optionCliente1.value = cliente.direccion1;
            optionCliente1.textContent = cliente.direccion1;
            selectDireccion.appendChild(optionCliente1);

            const optionCliente2 = document.createElement('option');
            optionCliente2.value = cliente.direccion2;
            optionCliente2.textContent = cliente.direccion2;
            selectDireccion.appendChild(optionCliente2);

            const optionCliente3 = document.createElement('option');
            optionCliente3.value = cliente.direccion3;
            optionCliente3.textContent = cliente.direccion3;
            selectDireccion.appendChild(optionCliente3);

            const optionCliente4 = document.createElement('option');
            optionCliente4.value = cliente.direccion4;
            optionCliente4.textContent = cliente.direccion4;
            selectDireccion.appendChild(optionCliente4);
        });

    } catch (error) {
        console.error('Error al obtener las direcciones:', error);
    }
}
async function llenarFormulario(data) {
    let fechaFormateada = new Date(data.fecha_pedido).toISOString().split('T')[0];
    document.getElementById('fechaPedido').value = fechaFormateada;

    await dibujarClientes();
    await dibujarOfertasAceptadas();
    await dibujarDirecciones(data.cliente_relacionado);

    const clienteSelect = document.getElementById('clientePedido');
    clienteSelect.value = data.cliente_relacionado;

    const ofertasSelect = document.getElementById('ofertasPedido');
    ofertasSelect.value = data.oferta_relacionada;

    const direccionSelect = document.getElementById('direccionEntregaPedido');
    direccionSelect.value = data.direccion_pedido;
}

async function llenarTablaPosiciones(posiciones) {
    const tbodyPosiciones = document.getElementById('tablaCrearPosicionesPedidos').getElementsByTagName('tbody')[0];
    // Limpiar la tabla de posiciones antes de llenarla
    tbodyPosiciones.innerHTML = '';

    for (const posicion of posiciones) {
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td><input type="hidden" class="posicion-id" value="${posicion.id_posicion_pedida || ''}"><input type="number" class="posicion" value="${posicion.posicionP}" required></td>
            <td>
                <select class="articulo_pedido" required></select>
            </td>
            <td><input type="text" class="denominacion" value="${posicion.denominacionP}" readonly required></td>
            <td><input type="text" class="denominacion_pedido" value="${posicion.denominacion_pedido || ''}" required></td>
            <td><input type="number" class="cantidad" value="${posicion.cantidad}" required></td>
            <td><input type="number" step="0.01" class="precio_unitario" value="${posicion.precio_unitario}" required></td>
            <td><input type="date" class="plazo_de_entrega" required></td>
            <td>
                <select class="completado" required>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                </select>
            </td>
            <td><input type="text" class="rcps_aplicable" value="${posicion.rcps_aplicable || ''}" required></td>
            <td><input type="number" step="0.01" class="precio_total" value="${(posicion.cantidad * posicion.precio_unitario).toFixed(2)}" readonly></td>
        `;

        // Establecer el valor del campo de fecha usando JavaScript
        const plazoEntregaInput = nuevaFila.querySelector('.plazo_de_entrega');
        const fechaFormateada = formatearFechaParaInput(posicion.plazo_de_entrega);
        plazoEntregaInput.value = fechaFormateada;

        // Obtener el select pnumber y llenar las opciones con el valor por defecto
        const pnumberSelect = nuevaFila.querySelector('.articulo_pedido');
        const pn_articulo = await window.electron.buscarIdPorValor("articulos", 'pn_articulo', 'num_articulo_interno', posicion.articulo_pedido);
        await dibujarArticulos(pnumberSelect, pn_articulo);

        // Configurar el valor seleccionado del select posicion_aceptada
        const selectAceptada = nuevaFila.querySelector('.completado');
        selectAceptada.value = posicion.completado === 'Si' ? 'Si' : 'No';

        // Añadir escuchadores para recalcular el precio total
        const cantidadInput = nuevaFila.querySelector('.cantidad');
        const precioUnitarioInput = nuevaFila.querySelector('.precio_unitario');
        const precioTotalInput = nuevaFila.querySelector('.precio_total');

        function recalcularPrecioTotal() {
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const precioUnitario = parseFloat(precioUnitarioInput.value) || 0;
            precioTotalInput.value = (cantidad * precioUnitario).toFixed(2);
        }

        cantidadInput.addEventListener('input', recalcularPrecioTotal);
        precioUnitarioInput.addEventListener('input', recalcularPrecioTotal);

        tbodyPosiciones.appendChild(nuevaFila);
    }
}

function filterTable(searchTerm) {
    const table = document.getElementById('tabla-pedido');
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
