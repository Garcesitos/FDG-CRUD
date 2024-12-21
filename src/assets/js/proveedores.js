document.addEventListener('DOMContentLoaded', () => {
    const tbodyProveedoresPrincipales = document.getElementById('tabla-proveedores-principal');
    const tbodyProveedoresSecundarios = document.getElementById('tabla-proveedores-secundario');
    const modal = document.getElementById("modalCrearProveedor");
    const btnCreacion = document.getElementById("btnCrearProveedor");
    const span = document.getElementsByClassName("close")[0];


    cargarDatos();

    btnCreacion.onclick = function () {
        modal.style.display = "block";
        document.getElementById("btnGuardarProveedor").style.display = "block";
        document.getElementById("btnActualizarProveedor").style.display = "none";
        document.getElementById("formularioCrearProveedor").reset();

        document.getElementById('tipoProveedor').addEventListener('change', function () {
            const tipoProveedor = this.value;
            if (tipoProveedor === 'secundario') {
                document.getElementById('fechaVigenciaCertificado').value = '';
                document.getElementById('certificadoProveedor').value = '';
                document.getElementById('aceptaCGenerales').value = 'no';
                document.getElementById('riesgoPEntrega').value = '0';
                document.getElementById('noConform').value = '0';
                document.getElementById('riesgoTecnico').value = '0';
                document.getElementById('riesgoEconomico').value = '0';
                document.getElementById('valoracionProveedor').value = '';
                // Deshabilitar los campos
                document.getElementById('fechaVigenciaCertificado').setAttribute('disabled', 'disabled');
                document.getElementById('certificadoProveedor').setAttribute('disabled', 'disabled');
                document.getElementById('aceptaCGenerales').setAttribute('disabled', 'disabled');
                document.getElementById('riesgoPEntrega').setAttribute('disabled', 'disabled');
                document.getElementById('noConform').setAttribute('disabled', 'disabled');
                document.getElementById('riesgoTecnico').setAttribute('disabled', 'disabled');
                document.getElementById('riesgoEconomico').setAttribute('disabled', 'disabled');
                document.getElementById('valoracionProveedor').setAttribute('disabled', 'disabled');
            } else {
                // Si el proveedor es principal, habilitar los campos
                document.getElementById('fechaVigenciaCertificado').removeAttribute('disabled');
                document.getElementById('certificadoProveedor').removeAttribute('disabled');
                document.getElementById('aceptaCGenerales').removeAttribute('disabled');
                document.getElementById('riesgoPEntrega').removeAttribute('disabled');
                document.getElementById('noConform').removeAttribute('disabled');
                document.getElementById('riesgoTecnico').removeAttribute('disabled');
                document.getElementById('riesgoEconomico').removeAttribute('disabled');
                document.getElementById('valoracionProveedor').removeAttribute('disabled');
                document.getElementById('calificacionProveedor').removeAttribute('disabled');
                document.getElementById('calificacionProveedor').setAttribute('disabled', 'disabled');

            }
        });

    };

    span.onclick = function () {
        modal.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    document.getElementById("btnGuardarProveedor").addEventListener("click", function () {
        const nuevoProveedor = obtenerDatosFormulario();

        window.electron.crearRegistro('proveedores', nuevoProveedor)
            .then(result => {
                console.log('Proveedor creado exitosamente:', result);
                modal.style.display = "none";
                cargarDatos();
            })
            .catch(err => {
                console.error('Error al crear el proveedor:', err, nuevoProveedor);
            });
    });

    [tbodyProveedoresPrincipales, tbodyProveedoresSecundarios].forEach(tbody => {
        tbody.addEventListener('click', async event => {
            if (event.target.classList.contains('btn-eliminar')) {
                const tr = event.target.closest('tr');
                const inputNumProveedor = tr.querySelector('input[type="hidden"]');
                const numProveedor = inputNumProveedor.value;
    
                try {
                    await window.electron.eliminarRegistro('proveedores', 'num_proveedor', numProveedor);
                    tr.remove();
                } catch (err) {
                    console.error('Error al eliminar el registro:', err);
                }
            } else if (event.target.classList.contains('btn-editar')) {
                const tr = event.target.closest('tr');
                const inputNumProveedor = tr.querySelector('input[type="hidden"]');
                const numProveedor = inputNumProveedor.value;
                document.getElementById("btnGuardarProveedor").style.display = "none";
                document.getElementById("btnActualizarProveedor").style.display = "block";
                modal.style.display = "block";
    
                try {
                    const result = await window.electron.obtenerRegistroPorId('proveedores', 'num_proveedor', numProveedor);
                    
                    if (result) {
                        llenarFormulario(result);
    
                        const btnActualizarProveedor = document.getElementById("btnActualizarProveedor");
    
                        btnActualizarProveedor.onclick = async function () {
                            const datosActualizados = obtenerDatosFormulario();
    
                            try {
                                await window.electron.actualizarRegistro('proveedores', 'num_proveedor', numProveedor, datosActualizados);
                                console.log('Registro actualizado exitosamente');
                                modal.style.display = "none";
                                cargarDatos();
                            } catch (err) {
                                console.error('Error al actualizar el registro:', err);
                            }
                        };
                    }
                } catch (err) {
                    console.error('Error al obtener el registro:', err);
                }
            }
        });
    });
    

    document.getElementById('searchBar').addEventListener('input', function () {
        const searchTerm = this.value.trim().toLowerCase();
        filterTable(searchTerm);
    });

    // Añadir event listeners a los íconos de ordenación
    document.querySelectorAll('th .asc, th .desc').forEach(icon => {
        icon.addEventListener('click', () => {
            const table = icon.closest('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const th = icon.closest('th');
            const index = Array.from(th.parentElement.children).indexOf(th);
            const ascending = icon.classList.contains('asc');

            // Quitar la clase activa de todos los íconos
            document.querySelectorAll('.asc, .desc').forEach(i => i.classList.remove('active'));

            // Añadir la clase activa al icono clicado
            icon.classList.add('active');

            // Ordenar las filas según el contenido de la columna
            rows.sort((a, b) => {
                const cellA = a.children[index].textContent.trim().toLowerCase();
                const cellB = b.children[index].textContent.trim().toLowerCase();
                return ascending ? cellA.localeCompare(cellB, undefined, { numeric: true }) : cellB.localeCompare(cellA, undefined, { numeric: true });
            });

            // Reordenar las filas en el tbody
            rows.forEach(row => tbody.appendChild(row));
        });
    });

    const container = document.getElementById('containerTablaProveedores');

    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let momentumID;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        container.style.cursor = 'grabbing';
        clearInterval(momentumID);
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
        container.style.cursor = 'grab';
        applyMomentum();
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
        container.style.cursor = 'grab';
        applyMomentum();
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX); // Distancia de desplazamiento
        container.scrollLeft = scrollLeft - walk;
        velocity = walk;
    });

    function applyMomentum() {
        let prevScrollLeft = container.scrollLeft;
        let decay = 0.75; // Factor de decaimiento para reducir gradualmente la velocidad
        let deltaTime = 20; // Intervalo de tiempo en milisegundos
        velocity *= decay; // Aplica el factor de decaimiento a la velocidad
    
        momentumID = setInterval(() => {
            container.scrollLeft -= velocity; // Aplicar la inercia
            velocity *= decay; // Aplica el factor de decaimiento a la velocidad
            if (Math.abs(velocity) < 0.3 || container.scrollLeft === prevScrollLeft) {
                clearInterval(momentumID);
            }
            prevScrollLeft = container.scrollLeft;
        }, deltaTime);
    }
});

function cargarDatos() {
    window.electron.leerTabla('proveedores')
        .then(proveedores => {
            const tbodyProveedoresPrincipales = document.getElementById('tbody-proveedores-alta');
            const tbodyProveedoresSecundarios = document.getElementById('tbody-proveedores-baja');
            tbodyProveedoresPrincipales.innerHTML = '';
            tbodyProveedoresSecundarios.innerHTML = '';

            proveedores.forEach(proveedor => {
                const tr = document.createElement('tr');
                const columnas = [
                    'fecha_alta', 'nombre_proveedor', 'actividad_proveedor', 'estado_proveedor', 'tipo_proveedor', 'observaciones_proveedor', 'certificacion_proveedor', 'rapidez_servicio', 'condiciones_entrega',

                ];

                // Agregar columnas específicas para proveedores principales
                if (proveedor.tipo_proveedor === 'principal') {
                    columnas.push('num_certificado', 'fecha_certificado', 'certificado_proveedor',
                        'acepta_c_generales', 'riesgo_p_entrega', 'no_conform', 'riesgo_tecnico', 'riesgo_economico',
                        'total_proveedor', 'valoracion_proveedor', 'calificacion_proveedor');
                }

                columnas.forEach(columna => {
                    const td = document.createElement('td');

                    if (columna === 'fecha_certificado' || columna === 'fecha_alta') {
                        const fechaOriginal = proveedor[columna];
                        const fechaFormateada = new Date(fechaOriginal).toLocaleDateString('es-ES');
                        td.textContent = fechaFormateada;
                    } else if (columna === 'certificado_proveedor') {
                        const certificadoLink = document.createElement('a');
                        certificadoLink.href = proveedor[columna];
                        certificadoLink.textContent = 'Ver Certificado';
                        certificadoLink.target = '_blank';
                        td.appendChild(certificadoLink);
                    } else {
                        td.textContent = proveedor[columna];
                    }

                    tr.appendChild(td);
                });

                const tdAcciones = document.createElement('td');
                const inputNumProveedor = document.createElement('input');
                inputNumProveedor.type = 'hidden';
                inputNumProveedor.value = proveedor.num_proveedor;
                tdAcciones.appendChild(inputNumProveedor);

                const btnEditar = document.createElement('button');
                btnEditar.textContent = 'Editar';
                btnEditar.className = 'btn-editar';
                tdAcciones.appendChild(btnEditar);

                const btnEliminar = document.createElement('button');
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.className = 'btn-eliminar';
                tdAcciones.appendChild(btnEliminar);

                tr.appendChild(tdAcciones);

                // Asignar la fila a la tabla correspondiente según el tipo de proveedor
                if (proveedor.tipo_proveedor === 'principal') {
                    tbodyProveedoresPrincipales.appendChild(tr);
                } else if (proveedor.tipo_proveedor === 'secundario') {
                    tbodyProveedoresSecundarios.appendChild(tr);
                }
            });


        })
        .catch(err => console.error('Error al cargar los datos:', err));
}

function obtenerDatosFormulario() {
    return {
        fecha_alta: document.getElementById('fechaAlta').value,
        nombre_proveedor: document.getElementById('nombreProveedor').value,
        actividad_proveedor: document.getElementById('actividad').value,
        estado_proveedor: document.getElementById('estadoProveedor').value,
        tipo_proveedor: document.getElementById('tipoProveedor').value,
        observaciones_proveedor: document.getElementById('observacionesProveedor').value,
        certificacion_proveedor: document.getElementById('certificacionProveedor').value,
        rapidez_servicio: document.getElementById('rapidezServicio').value,
        condiciones_entrega: document.getElementById('condicionesEntrega').value,
        num_certificado: document.getElementById('numCertificado').value,
        fecha_certificado: document.getElementById('fechaVigenciaCertificado').value,
        certificado_proveedor: document.getElementById('certificadoProveedor').value,
        acepta_c_generales: document.getElementById('aceptaCGenerales').value,
        riesgo_p_entrega: document.getElementById('riesgoPEntrega').value,
        no_conform: document.getElementById('noConform').value,
        riesgo_tecnico: document.getElementById('riesgoTecnico').value,
        riesgo_economico: document.getElementById('riesgoEconomico').value,
        total_proveedor: document.getElementById('totalProveedor').value,
        valoracion_proveedor: document.getElementById('valoracionProveedor').value,
        calificacion_proveedor: document.getElementById('calificacionProveedor').value
    };
}

function llenarFormulario(data) {
    let fechaAlta = new Date(data.fecha_alta).toISOString().split('T')[0];
    let fechaCertificado = new Date(data.fecha_certificado).toISOString().split('T')[0];

    document.getElementById('fechaAlta').value = fechaAlta;
    document.getElementById('nombreProveedor').value = data.nombre_proveedor;
    document.getElementById('actividad').value = data.actividad_proveedor;
    document.getElementById('estadoProveedor').value = data.estado_proveedor;
    document.getElementById('tipoProveedor').value = data.tipo_proveedor;
    document.getElementById('observacionesProveedor').value = data.observaciones_proveedor;
    document.getElementById('certificacionProveedor').value = data.certificacion_proveedor;
    document.getElementById('rapidezServicio').value = data.rapidez_servicio;
    document.getElementById('condicionesEntrega').value = data.condiciones_entrega;
    document.getElementById('numCertificado').value = data.num_certificado;
    document.getElementById('fechaVigenciaCertificado').value = fechaCertificado;
    document.getElementById('certificadoProveedor').value = data.certificado_proveedor;
    document.getElementById('aceptaCGenerales').value = data.acepta_c_generales;
    document.getElementById('riesgoPEntrega').value = data.riesgo_p_entrega;
    document.getElementById('noConform').value = data.no_conform;
    document.getElementById('riesgoTecnico').value = data.riesgo_tecnico;
    document.getElementById('riesgoEconomico').value = data.riesgo_economico;
    document.getElementById('totalProveedor').value = data.total_proveedor;
    document.getElementById('valoracionProveedor').value = data.valoracion_proveedor;
    document.getElementById('calificacionProveedor').value = data.calificacion_proveedor;
}



function filterTable(searchTerm) {
    const tablas = [document.getElementById('tabla-proveedores-principal'), document.getElementById('tabla-proveedores-secundario')];

    tablas.forEach(tabla => {
        const rows = tabla.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const match = cells.some(cell => cell.textContent.toLowerCase().includes(searchTerm));
            row.style.display = match ? '' : 'none';
        });
    });
}


