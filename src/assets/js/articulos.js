document.addEventListener('DOMContentLoaded', () => {
    const tbodyArticulos = document.getElementById('tbody-articulos');
    const modal = document.getElementById("modalCrearArticulo");
    const btnCreacion = document.getElementById("myBtn");
    const span = document.getElementsByClassName("close")[0];

    cargarDatos();
    cargarProveedores();

    btnCreacion.onclick = function () {
        modal.style.display = "block";
        document.getElementById("btnGuardarArticulo").style.display = "block";
        document.getElementById("btnActualizarArticulo").style.display = "none";
        document.getElementById("formularioCrearArticulo").reset();
    };

    span.onclick = function () {
        modal.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    document.getElementById("btnGuardarArticulo").addEventListener("click", function () {
        const nuevoArticulo = obtenerDatosFormulario();

        window.electron.crearRegistro('articulos', nuevoArticulo)
            .then(result => {
                console.log('Artículo creado exitosamente:', result);
                modal.style.display = "none";
                cargarDatos();
            })
            .catch(err => {
                console.error('Error al crear el artículo:', err, nuevoArticulo);
            });
    });

    tbodyArticulos.addEventListener('click', event => {
        if (event.target.classList.contains('btn-eliminar')) {
            const tr = event.target.closest('tr');
            const inputNumArticulo = tr.querySelector('input[type="hidden"]');
            const numArticulo = inputNumArticulo.value;
    
            window.electron.eliminarRegistro('articulos', 'pn_articulo', numArticulo)
                .then(() => {
                    tr.remove();
                })
                .catch(err => console.error('Error al eliminar el registro:', err));
        } else if (event.target.classList.contains('btn-editar')) {
            const tr = event.target.closest('tr');
            const inputNumArticulo = tr.querySelector('input[type="hidden"]');
            const numArticulo = inputNumArticulo.value;
            document.getElementById("btnGuardarArticulo").style.display = "none";
            document.getElementById("btnActualizarArticulo").style.display = "block";
            modal.style.display = "block";
    
            window.electron.obtenerRegistroPorId('articulos', 'pn_articulo', numArticulo)
                .then(result => {
                    if (result) {
                        llenarFormulario(result);
    
                        const btnActualizarArticulo = document.getElementById("btnActualizarArticulo");
    
                        btnActualizarArticulo.onclick = function () {
                            const datosActualizados = obtenerDatosFormulario();
    
                            window.electron.actualizarRegistro('articulos', 'pn_articulo', numArticulo, datosActualizados)
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
            const table = document.getElementById('tablaArticulos');
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

});

async function cargarDatos() {
    try {
        const articulos = await window.electron.leerTabla('articulos');
        const tbodyArticulos = document.getElementById('tbody-articulos');
        tbodyArticulos.innerHTML = '';

        for (const articulo of articulos) {
            const tr = document.createElement('tr');
            const columnas = ['pn_articulo', 'edicion_revision', 'denominacion', 'num_proveedor', 'precio_unitario', 'observaciones'];

            for (const columna of columnas) {
                const td = document.createElement('td');

                if (columna === 'num_proveedor') {
                    const nombreProveedor = await obtenerNombreProveedor(articulo[columna]);
                    td.textContent = nombreProveedor;
                } else {
                    td.textContent = articulo[columna];
                }

                tr.appendChild(td);
            }

            const tdAcciones = document.createElement('td');
            const inputNumArticulo = document.createElement('input');
            inputNumArticulo.type = 'hidden';
            inputNumArticulo.value = articulo.pn_articulo;
            tdAcciones.appendChild(inputNumArticulo);

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';
            tdAcciones.appendChild(btnEditar);

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.className = 'btn-eliminar';
            tdAcciones.appendChild(btnEliminar);

            tr.appendChild(tdAcciones);
            tbodyArticulos.appendChild(tr);
        }
    } catch (err) {
        console.error('Error al cargar artículos:', err);
    }
}

function cargarProveedores() {
    window.electron.leerTabla('proveedores')
        .then(proveedores => {
            const proveedorSelect = document.getElementById('proveedor');
            proveedorSelect.innerHTML = '';

            proveedores.forEach(proveedor => {
                const option = document.createElement('option');
                option.value = proveedor.num_proveedor;
                option.textContent = proveedor.nombre_proveedor;
                proveedorSelect.appendChild(option);
            });
        })
        .catch(err => console.error('Error al cargar proveedores:', err));
}

function obtenerDatosFormulario() {
    return {
        pn_articulo: document.getElementById("pnArticulo").value,
        edicion_revision: document.getElementById("edicionRevision").value,
        denominacion: document.getElementById("denominacion").value,
        num_proveedor: document.getElementById("proveedor").value, // Cambiado 'fabricante' a 'proveedor'
        precio_unitario: document.getElementById("precioUnitario").value,
        observaciones: document.getElementById("observaciones").value
    };
}

function llenarFormulario(data) {
    document.getElementById('pnArticulo').value = data.pn_articulo;
    document.getElementById('edicionRevision').value = data.edicion_revision;
    document.getElementById('denominacion').value = data.denominacion;
    document.getElementById('precioUnitario').value = data.precio_unitario;
    document.getElementById('observaciones').value = data.observaciones;
    document.getElementById('proveedor').value = data.num_proveedor;
}
async function obtenerNombreProveedor(numProveedor) {
    try {
        const proveedor = await window.electron.obtenerRegistroPorId('proveedores', 'num_proveedor', numProveedor);
        return proveedor ? proveedor.nombre_proveedor : 'Desconocido';
    } catch (err) {
        console.error('Error al obtener el proveedor:', err);
        return 'Desconocido';
    }
}

async function obtenerIdProveedor(numProveedor, nombreProveedor) {
    try {
        const id = await window.electron.buscarIdPorValor('proveedores', 'num_proveedor', 'nombre_proveedor', nombreProveedor);
        if (id) {
            const proveedor = await window.electron.obtenerRegistroPorId('proveedores', 'num_proveedor', id);
            return proveedor ? proveedor.nombre_proveedor : 'Desconocido';
        } else {
            return 'Desconocido';
        }
    } catch (err) {
        console.error('Error al obtener el nombre del proveedor:', err);
        return 'Desconocido';
    }
}


function filterTable(searchTerm) {
    const table = document.getElementById('tablaArticulos');
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
