document.addEventListener('DOMContentLoaded', () => {
    const tbodyClientes = document.getElementById('tbody-clientes');
    const modal = document.getElementById("modalCrearCliente");
    const btnCreacion = document.getElementById("btnCrearCliente");
    const span = document.getElementsByClassName("close")[0];

    cargarDatos();

    btnCreacion.onclick = function () {
        modal.style.display = "block";
        document.getElementById("btnGuardarCliente").style.display = "block";
        document.getElementById("btnActualizarCliente").style.display = "none";
        document.getElementById("formularioCrearCliente").reset();
    };

    span.onclick = function () {
        modal.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    document.getElementById("btnGuardarCliente").addEventListener("click", function () {
        const nuevoCliente = obtenerDatosFormulario();

        // Utiliza la función para crear un nuevo registro de cliente
        window.electron.crearRegistro('Clientes', nuevoCliente)
            .then(result => {
                console.log('Cliente creado exitosamente:', result);
                modal.style.display = "none";
                cargarDatos();
            })
            .catch(err => {
                console.error('Error al crear el cliente:', err, nuevoCliente);
            });
    });

    tbodyClientes.addEventListener('click', event => {
        if (event.target.classList.contains('btn-eliminar')) {
            const tr = event.target.closest('tr');
            const inputNumCliente = tr.querySelector('input[type="hidden"]');
            const numCliente = inputNumCliente.value;
    
            // Utiliza la función para eliminar un registro de cliente
            window.electron.eliminarRegistro('clientes', 'num_cliente', numCliente)
                .then(() => {
                    tr.remove();
                })
                .catch(err => console.error('Error al eliminar el registro:', err));
        } else if (event.target.classList.contains('btn-editar')) {
            const tr = event.target.closest('tr');
            const inputNumCliente = tr.querySelector('input[type="hidden"]');
            const numCliente = inputNumCliente.value;
            document.getElementById("btnGuardarCliente").style.display = "none";
            document.getElementById("btnActualizarCliente").style.display = "block";
            modal.style.display = "block";
    
            // Utiliza la función para obtener los datos del cliente seleccionado
            window.electron.obtenerRegistroPorId('clientes', 'num_cliente', numCliente)
                .then(result => {
                    if (result) {
                        llenarFormulario(result);
    
                        const btnActualizarCliente = document.getElementById("btnActualizarCliente");
    
                        btnActualizarCliente.onclick = function () {
                            const datosActualizados = obtenerDatosFormulario();
    
                            // Utiliza la función para actualizar el registro del cliente
                            window.electron.actualizarRegistro('clientes', 'num_cliente', numCliente, datosActualizados)
                                .then(result => {
                                    console.log('Registro actualizado exitosamente:', result);
                                    modal.style.display = "none";
                                    cargarDatos();
                                })
                                .catch(err => console.error('Error al actualizar el registro:', err));
                        };
                    }
                })
                .catch(err => console.error('Error al obtener el registro:', err));
        }
    });
    

    document.getElementById('searchBar').addEventListener('input', function () {
        const searchTerm = this.value.trim().toLowerCase();
        filterTable(searchTerm);
    });

    // Añadir event listeners a los íconos de ordenación
    document.querySelectorAll('th .asc, th .desc').forEach(icon => {
        icon.addEventListener('click', () => {
            const table = document.getElementById('tabla-clientes');
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

function cargarDatos() {
    window.electron.leerTabla('Clientes')
        .then(clientes => {
            const tbodyClientes = document.getElementById('tbody-clientes');
            tbodyClientes.innerHTML = '';

            clientes.forEach(cliente => {
                const tr = document.createElement('tr');
                const columnas = [
                    'fecha_alta_cliente', 'denominacion_social', 'centro_de_trabajo', 'direccion1', 'direccion2',
                    'direccion3', 'direccion4', 'CIF', 'codigo_postal', 'forma_pago', 'observaciones_cliente'
                ];

                columnas.forEach(columna => {
                    const td = document.createElement('td');

                    if (columna === 'fecha_alta_cliente') {
                        const fechaOriginal = cliente[columna];
                        const fechaFormateada = new Date(fechaOriginal).toLocaleDateString('es-ES');
                        td.textContent = fechaFormateada;
                    } else {
                        td.textContent = cliente[columna];
                    }

                    tr.appendChild(td);
                });

                const tdAcciones = document.createElement('td');
                const inputNumCliente = document.createElement('input');
                inputNumCliente.type = 'hidden';
                inputNumCliente.value = cliente.num_cliente;
                tdAcciones.appendChild(inputNumCliente);

                const btnEditar = document.createElement('button');
                btnEditar.textContent = 'Editar';
                btnEditar.className = 'btn-editar';
                tdAcciones.appendChild(btnEditar);

                const btnEliminar = document.createElement('button');
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.className = 'btn-eliminar';
                tdAcciones.appendChild(btnEliminar);

                tr.appendChild(tdAcciones);
                tbodyClientes.appendChild(tr);
            });
        })
        .catch(err => console.error('Error al cargar los datos:', err));
}

function obtenerDatosFormulario() {
    return {
        fecha_alta_cliente: document.getElementById('fechaAlta').value,
        denominacion_social: document.getElementById('denominacionSocial').value,
        centro_de_trabajo: document.getElementById('centroDeTrabajo').value,
        direccion1: document.getElementById('direccion1').value,
        direccion2: document.getElementById('direccion2').value,
        direccion3: document.getElementById('direccion3').value,
        direccion4: document.getElementById('direccion4').value,
        CIF: document.getElementById('CIF').value,
        codigo_postal: document.getElementById('codigoPostal').value,
        forma_pago: document.getElementById('formaPago').value,
        observaciones_cliente: document.getElementById('observacionesCliente').value
    };
}

function llenarFormulario(data) {
    let fechaAlta = new Date(data.fecha_alta_cliente);
    let formattedDateAlta = fechaAlta.toISOString().split('T')[0];
    document.getElementById('fechaAlta').value = formattedDateAlta;
    document.getElementById('denominacionSocial').value = data.denominacion_social;
    document.getElementById('centroDeTrabajo').value = data.centro_de_trabajo;
    document.getElementById('direccion1').value = data.direccion1;
    document.getElementById('direccion2').value = data.direccion2;
    document.getElementById('direccion3').value = data.direccion3;
    document.getElementById('direccion4').value = data.direccion4;
    document.getElementById('CIF').value = data.CIF;
    document.getElementById('codigoPostal').value = data.codigo_postal;
    document.getElementById('formaPago').value = data.forma_pago;
    document.getElementById('observacionesCliente').value = data.observaciones_cliente;
}

function filterTable(searchTerm) {
    const table = document.getElementById('tabla-clientes');
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        // Verificar si las filas son una cabecera (th)
        if (rows[i].getElementsByTagName('th').length > 0) {
            continue; // Saltar la iteración si es una cabecera
        } const cells = rows[i].getElementsByTagName('td');
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
