document.addEventListener('DOMContentLoaded', async () => {
    const modalEmpleados = document.getElementById("modalCrearEmpleado");
    const btnCreacionEmpleado = document.getElementById("myBtnCrearEmpleado");

    const modalProcesos = document.getElementById("modalCrearProceso");
    const btnCreacionProceso = document.getElementById("myBtnCrearProceso");

    const modalBorrarProceso = document.getElementById("modalBorrarProceso");
    const btnBorrarProceso = document.getElementById("myBtnBorrarProceso");

    const modalEstablecerProceso = document.getElementById("modalEstablecerProceso");
    const btnEstablecerProceso = document.getElementById("myBtnEstablecerProcesos");
    const selectQuitarOEstablecer = document.getElementById('quitarOEstablecer');
    const btnQuitar = document.getElementById('btnQuitar');
    const btnEstablecer = document.getElementById('btnEstablecer');

    selectQuitarOEstablecer.addEventListener('change', function () {
        if (this.value === '0') {
            btnQuitar.style.display = 'none';
            btnEstablecer.style.display = 'none';
        } else if (this.value === '1') {
            btnQuitar.style.display = 'block';
            btnEstablecer.style.display = 'none';
        } else if (this.value === '2') {
            btnQuitar.style.display = 'none';
            btnEstablecer.style.display = 'block';
        }
    });
    document.getElementById('categoriaEstablecer').addEventListener('change', cargarProcesosPorCategoriaParaEstablecer);
    document.getElementById('btnEstablecer').addEventListener('click', establecerRelacionHandler);
    document.getElementById('btnQuitar').addEventListener('click', quitarRelacionHandler);

    const spanEmpleado = document.getElementById("spanEmpleado");
    const spanProceso = document.getElementById("spanProceso");
    const spanBorrarProceso = document.getElementById("spanBorrarProceso");
    const spanEstablecerProceso = document.getElementById("spanEstablecerProceso");

    llenarTablaProcesos();
    cargarCategoriasProcesos();

    btnCreacionEmpleado.onclick = function () {
        modalEmpleados.style.display = "block";
        document.getElementById("btnGuardarEmpleado").style.display = "block";
        document.getElementById("btnActualizarEmpleado").style.display = "none";
        document.getElementById("formularioCrearEmpleado").reset();
    };

    btnCreacionProceso.onclick = function () {
        modalProcesos.style.display = "block";
    };

    btnBorrarProceso.onclick = function () {
        modalBorrarProceso.style.display = "block";
        cargarCategoriasParaEliminar();
    };

    btnEstablecerProceso.onclick = function () {
        modalEstablecerProceso.style.display = "block";
        cargarEmpleadosParaEstablecer();
        cargarCategoriasParaEstablecer();
    };

    spanEmpleado.onclick = function () {
        modalEmpleados.style.display = "none";
    };

    spanProceso.onclick = function () {
        modalProcesos.style.display = "none";
    };

    spanBorrarProceso.onclick = function () {
        modalBorrarProceso.style.display = "none";
    };

    spanEstablecerProceso.onclick = function () {
        modalEstablecerProceso.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target == modalEmpleados) {
            modalEmpleados.style.display = "none";
        } else if (event.target == modalProcesos) {
            modalProcesos.style.display = "none";
        } else if (event.target == modalBorrarProceso) {
            modalBorrarProceso.style.display = "none";
        } else if (event.target == modalEstablecerProceso) {
            modalEstablecerProceso.style.display = "none";
        }
    };

    const obtenerEmpleados = async () => {
        try {
            const empleados = await window.electron.leerTabla('empleados');
            return empleados;
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            return [];
        }
    };

    const obtenerProcesosEmpleado = async (idEmpleado) => {
        try {
            const procesos = await window.electron.obtenerProcesosEmpleado(idEmpleado);
            return procesos;
        } catch (error) {
            console.error('Error al obtener procesos del empleado:', error);
            return [];
        }
    };

    const crearCromoEmpleado = async (empleado) => {
        const procesos = await obtenerProcesosEmpleado(empleado.id_empleado);
        const nombresProcesos = procesos.map(proceso => proceso.nombre_proceso).join(', <br />');

        const formatearFecha = (fecha) => {
            const fechaFormateada = new Date(fecha);
            const dia = fechaFormateada.getDate().toString().padStart(2, '0');
            const mes = (fechaFormateada.getMonth() + 1).toString().padStart(2, '0');
            const año = fechaFormateada.getFullYear();
            return `${dia}-${mes}-${año}`;
        };

        const calcularAntiguedad = (fecha) => {
            const hoy = new Date();
            const fechaInicio = new Date(fecha);
            const diferencia = hoy - fechaInicio;

            const años = Math.floor(diferencia / (1000 * 60 * 60 * 24 * 365));
            const meses = Math.floor((diferencia % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
            const dias = Math.floor((diferencia % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));

            return `${años} años, ${meses} meses, ${dias}`;
        };

        const cromo = document.createElement('div');
        cromo.className = 'col-4-min479 d-flex flex-wrap justify-content-center flex-direction-column margin-left-right-20 cromosEmpleado';

        cromo.innerHTML += `
            <div class="nft">
                <div class='main'>
                    <img class='tokenImage' src="https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg" alt="NFT" />
                    <div class="d-flex justify-content-center m-1rem">
                        <h2>${empleado.nombre_empleado} ${empleado.apellidos_empleado}</h2>
                    </div>
                    <div class="d-flex justify-content-center ">
                        <p class='m-1rem'><strong>DNI:</strong> ${empleado.DNI}</p>
                    </div>
                        <div class="tokenInfo d-flex">
                        
                            <div class="price">
                                <p><strong>Correo:</strong> ${empleado.correo_empleado}</p>
                            </div>

                            <div class="price">
                                <p><strong>Teléfono:</strong> ${empleado.telefono_empleado}</p>
                            </div>

                            <div class="price">
                                <p class="col-6 p-05rem"><strong>Fecha de nacimiento:</br></strong> ${formatearFecha(empleado.fecha_nacimiento)}</p>
                                <p class="col-6 p-05rem"><strong>Antigüedad:</br></strong> ${calcularAntiguedad(empleado.f_antiguedad)}</p>
                            </div>

                            <div class="price">
                                <p class="col-6 p-05rem"><strong>Formación:</br></strong> ${empleado.formacion}</p>
                                <p class="col-6 p-05rem"><strong>Otras formaciones:</br></strong> ${empleado.otras_formaciones}</p>
                            </div>

                            <div class="price">
                                <p class="col-6 p-05rem"><strong>Cotización:</br></strong> ${empleado.cotizacion}</p>
                                <p class="col-6 p-05rem"><strong>Número Seguridad SOcial:</br></strong> ${empleado.n_segSocial}</p>
                            </div>

                            <div class="price">
                                <p class="col-6 p-05rem"><strong>Tipo de Contrato:</br></strong> ${empleado.tipo_contrato}</p>
                                <p class="col-6 p-05rem"><strong>Documentos: PDF?? Icono??</br></strong> </p>
                            </div>

                            <div class="price">
                                <p class="col-6 p-05rem"><strong>Número HPS:</br></strong> ${empleado.num_hps}</p>
                                <p class="col-6 p-05rem"><strong>Fecha Vigencia HPS:</br></strong> ${formatearFecha(empleado.f_vigencia_hps)}</p>
                            </div>
                        </div>

                        <hr />

                        <div class='creator d-flex space-between description'>
                            <div>
                                <p><strong>Procesos aplicables:</br></strong>${nombresProcesos}</p>
                                <input type="hidden" value="${empleado.id_empleado}" class="empleado-id">
                            </div> 
                            <div class="d-flex flex-direction-column">
                                <button class="btn-eliminar">Eliminar</button>
                                <button class="btn-editar">Editar</button>
                            </div>
                        </div>
                 </div>
            </div>
        `;

        cromo.querySelector('.btn-eliminar').addEventListener('click', async () => {
            const idEmpleado = empleado.id_empleado;
            try {
                window.electron.eliminarRegistro('empleado_proceso', 'num_empleado', idEmpleado);
                window.electron.eliminarRegistro('empleados', 'id_empleado', idEmpleado);

                cromo.remove();
            } catch (err) {
                console.error('Error al eliminar el registro:', err);
            }
        });

        cromo.querySelector('.btn-editar').addEventListener('click', async () => {
            const idEmpleado = empleado.id_empleado;
            document.getElementById("btnGuardarEmpleado").style.display = "none";
            document.getElementById("btnActualizarEmpleado").style.display = "block";
            modalEmpleados.style.display = "block";
        
            try {
                const result = await window.electron.obtenerRegistroPorId('empleados', 'id_empleado', idEmpleado);
                
                if (result) {
                    llenarFormulario(result);
        
                    const btnActualizarEmpleado = document.getElementById("btnActualizarEmpleado");
        
                    btnActualizarEmpleado.onclick = async function () {
                        const datosActualizados = obtenerDatosFormulario();
        
                        try {
                            await window.electron.actualizarRegistro('empleados', 'id_empleado', idEmpleado, datosActualizados);
                            console.log('Registro actualizado exitosamente');
                            modalEmpleados.style.display = "none";
                            cargarDatos();
                        } catch (err) {
                            console.error('Error al actualizar el registro:', err);
                        }
                    };
                }
            } catch (err) {
                console.error('Error al obtener el registro:', err);
            }
        });
        

        document.getElementById('empleadosCromos').appendChild(cromo);
    };

    const empleados = await obtenerEmpleados();
    for (const empleado of empleados) {
        await crearCromoEmpleado(empleado);
    }

    const desplegarBotones = document.querySelectorAll(".desplegarContenido");
    const cerrarBotones = document.querySelectorAll(".cerrarContenido");

    desplegarBotones.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const contenido = this.parentElement.nextElementSibling;
            const claseContenido = contenido.getAttribute("id");
            if (claseContenido === "empleadosContenido") {
                contenido.style.display = "flex";
            } else if (claseContenido === "procesosContenido") {
                contenido.style.display = "block";
            } else if (claseContenido === "capacidadContenido") {
                contenido.style.display = "block";
            }
        });
    });

    cerrarBotones.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const contenido = this.parentElement.nextElementSibling;
            const claseContenido = contenido.getAttribute("id");
            if (claseContenido === "empleadosContenido" || claseContenido === "procesosContenido") {
                contenido.style.display = "none";
            }
        });
    });

    document.getElementById("btnGuardarEmpleado").addEventListener("click", function () {
        const nuevoEmpleado = obtenerDatosFormulario();

        window.electron.crearRegistro('empleados', nuevoEmpleado)
            .then(result => {
                modalEmpleados.style.display = "none";
                cargarDatos();
            })
            .catch(err => {
                console.error('Error al crear el empleado:', err, nuevoEmpleado);
            });
    });

    document.getElementById("btnGuardarProceso").addEventListener("click", function () {
        const nuevoProceso = obtenerDatosFormularioProcesos();

        window.electron.crearRegistro('procesos', nuevoProceso)
            .then(result => {
                modalProcesos.style.display = "none";
                return llenarTablaProcesos();
            })
            .catch(err => {
                console.error('Error al crear el proceso:', err, nuevoProceso);
            });
    });

    function obtenerDatosFormulario() {
        return {
            DNI: document.getElementById("DNI").value,
            nombre_empleado: document.getElementById("nombre_empleado").value,
            apellidos_empleado: document.getElementById("apellidos_empleado").value,
            fecha_nacimiento: document.getElementById("fecha_nacimiento").value,
            correo_empleado: document.getElementById("correo_empleado").value,
            telefono_empleado: document.getElementById("telefono_empleado").value,
            f_antiguedad: document.getElementById("f_antiguedad").value,
            cotizacion: document.getElementById("cotizacion").value,
            n_segSocial: document.getElementById("n_segSocial").value,
            tipo_contrato: document.getElementById("tipo_contrato").value,
            formacion: document.getElementById("formacion").value,
            otras_formaciones: document.getElementById("otras_formaciones").value,
            documentos: document.getElementById("documentos").value,
            num_hps: document.getElementById("num_hps").value,
            f_vigencia_hps: document.getElementById("f_vigencia_hps").value,
            imagen_empleado: document.getElementById("imagen_empleado").value
        };
    }
    function obtenerDatosFormularioProcesos() {
        // Obtener los valores de los campos del formulario
        const nombreProceso = document.getElementById("nombreProceso").value;
        const descripcionProceso = document.getElementById("descripcionProceso").value;
        const capacidadMinima = document.getElementById("capacidadMinima").value;

        // Obtener el valor seleccionado en el campo de categoría
        const categoriasProceso = document.getElementById("categoriasProceso");
        const categoriaSeleccionada = categoriasProceso.value;

        // Si se seleccionó la opción de crear una nueva categoría
        if (categoriaSeleccionada === 'nueva') {
            // Obtener el valor de la categoría nueva ingresada por el usuario
            const categoriaNueva = document.getElementById("categoriaNueva").value;
            // Retornar los datos del formulario con la nueva categoría
            return {
                nombre_proceso: nombreProceso,
                categoria: categoriaNueva,
                descripcion_proceso: descripcionProceso,
                capacidad_minima: capacidadMinima
            };
        } else {
            // Si se seleccionó una categoría existente, retornar los datos del formulario con esa categoría
            return {
                nombre_proceso: nombreProceso,
                categoria: categoriaSeleccionada,
                descripcion_proceso: descripcionProceso,
                capacidad_minima: capacidadMinima
            };
        }
    }

    const cargarDatos = async () => {
        try {
            const empleados = await obtenerEmpleados();
            const empleadosContainer = document.getElementById('empleadosCromos');
            empleadosContainer.innerHTML = '';

            for (const empleado of empleados) {
                await crearCromoEmpleado(empleado);
            }
        } catch (error) {
            console.error('Error al cargar datos de empleados:', error);
        }
    };

    await cargarDatos();

    document.getElementById('searchBarEmpleados').addEventListener('input', function () {
        const searchTerm = this.value;
        filterEmpleados(searchTerm);
    });

});

function removeAccents(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filterEmpleados(searchTerm) {
    const empleadosContainer = document.getElementById('empleadosCromos');
    const cromos = empleadosContainer.getElementsByClassName('cromosEmpleado');
    searchTerm = removeAccents(searchTerm.toLowerCase());

    for (let i = 0; i < cromos.length; i++) {
        const cromo = cromos[i];
        const cromoText = removeAccents(cromo.textContent.toLowerCase());

        if (cromoText.includes(searchTerm)) {
            cromo.style.display = '';
        } else {
            cromo.style.display = 'none';
        }
    }
}

function llenarFormulario(empleado) {
    document.getElementById('DNI').value = empleado.DNI;
    document.getElementById('nombre_empleado').value = empleado.nombre_empleado;
    document.getElementById('apellidos_empleado').value = empleado.apellidos_empleado;
    document.getElementById('fecha_nacimiento').value = formatearFecha(empleado.fecha_nacimiento);
    document.getElementById('correo_empleado').value = empleado.correo_empleado;
    document.getElementById('telefono_empleado').value = empleado.telefono_empleado;
    document.getElementById('f_antiguedad').value = formatearFecha(empleado.f_antiguedad);
    document.getElementById('cotizacion').value = empleado.cotizacion;
    document.getElementById('n_segSocial').value = empleado.n_segSocial;
    document.getElementById('tipo_contrato').value = empleado.tipo_contrato;
    document.getElementById('formacion').value = empleado.formacion;
    document.getElementById('otras_formaciones').value = empleado.otras_formaciones;
    document.getElementById('num_hps').value = empleado.num_hps;
    document.getElementById('f_vigencia_hps').value = formatearFecha(empleado.f_vigencia_hps);
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
}

async function cargarEmpleados() {
    try {
        const empleados = await window.electron.obtenerEmpleados();
        const tbody = document.querySelector('#tablaProcesos tbody');

        tbody.innerHTML = '';

        empleados.forEach(empleado => {
            const tr = document.createElement('tr');

            const tdEmpleado = document.createElement('td');
            tdEmpleado.textContent = `${empleado.nombre_empleado} ${empleado.apellidos_empleado}`;
            tr.appendChild(tdEmpleado);

            for (let i = 0; i < 11; i++) {
                const tdProceso = document.createElement('td');
                tr.appendChild(tdProceso);
            }

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error al cargar los empleados:', err);
    }
}

const obtenerEmpleados = async () => {
    try {
        const empleados = await window.electron.leerTablaEmpleados('nombre_empleado', 'apellidos_empleado', 'id_empleado', 'empleados');
        return empleados;
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        return [];
    }
};

const obtenerProcesos = async () => {
    try {
        const procesos = await window.electron.leerTabla('procesos');
        return procesos;
    } catch (error) {
        console.error('Error al obtener procesos:', error);
        return [];
    }
};

const obtenerCoincidencias = async () => {
    try {
        const empleadoProceso = await window.electron.leerTabla('empleado_proceso');
        return empleadoProceso;
    } catch (error) {
        console.error('Error al obtener empleadoProceso:', empleadoProceso);
        return [];
    }
};

// Función para llenar la tabla de procesos
const llenarTablaProcesos = async () => {
    try {
        const procesos = await obtenerProcesos();

        // Construir el encabezado de la tabla con las categorías y los procesos
        const categorias = construirTheadProcesos(procesos);

        const tbody = document.querySelector('#tablaProcesos tbody');
        tbody.innerHTML = '';

        // Obtener las coincidencias de procesos y empleados
        const empleadoProceso = await obtenerCoincidencias();

        // Función asincrónica para agregar los empleados a la tabla
        const agregarEmpleadosATabla = async () => {
            const empleados = await obtenerEmpleados();

            // Crear las filas de empleados
            empleados.forEach(empleado => {
                const tr = document.createElement('tr');

                // Agregar el nombre y apellidos del empleado en la primera columna junto con el id_empleado oculto
                const tdEmpleado = document.createElement('td');
                tdEmpleado.textContent = `${empleado.nombre_empleado} ${empleado.apellidos_empleado}`;
                const hiddenIdEmpleado = document.createElement('input');
                hiddenIdEmpleado.type = 'hidden';
                hiddenIdEmpleado.value = empleado.id_empleado;
                tdEmpleado.appendChild(hiddenIdEmpleado);
                tr.appendChild(tdEmpleado);

                // Agregar las celdas de proceso en el lugar correcto bajo su categoría
                categorias.forEach(categoria => {
                    const procesosCategoria = procesos.filter(proceso => proceso.categoria === categoria);
                    procesosCategoria.forEach(proceso => {
                        const tdProceso = document.createElement('td');
                        const hiddenIdProceso = document.createElement('input');
                        hiddenIdProceso.type = 'hidden';
                        hiddenIdProceso.value = proceso.id_proceso;
                        tdProceso.appendChild(hiddenIdProceso);

                        // Verificar si existe la coincidencia entre el empleado y el proceso
                        const coincidencia = empleadoProceso.some(ep => ep.num_empleado === empleado.id_empleado && ep.num_proceso === proceso.id_proceso);

                        if (coincidencia) {
                            tdProceso.textContent = 'X'; // O cualquier marca que quieras usar
                            tdProceso.style.backgroundColor = 'green'; // Establecer el color de fondo en verde
                        } else {
                            tdProceso.textContent = ''; // Limpiar el contenido si no hay asociación
                            tdProceso.style.backgroundColor = 'red'; // Establecer el color de fondo en rojo
                        }
                        tr.appendChild(tdProceso);
                    });
                });

                tbody.appendChild(tr);
            });
        };
        // Función para agregar una fila en blanco con la altura de una fila normal
        const agregarFilaEnBlanco = () => {
            const blankRow = document.createElement('tr');
            blankRow.appendChild(document.createElement('td'));
            blankRow.style.height = `36px`;

            procesos.forEach(() => {
                const tdBlank = document.createElement('td');
                tdBlank.textContent = '';
                blankRow.appendChild(tdBlank);
            });

            tbody.appendChild(blankRow);
        };

        // Agregar empleados a la tabla
        await agregarEmpleadosATabla();

        // Eliminar la fila de capacidad mínima de proceso y la fila con el recuento de casillas verdes en cada columna si ya existen
        const capacidadMinimaRow = document.getElementById('capacidadMinimaRow');
        if (capacidadMinimaRow) {
            tbody.removeChild(capacidadMinimaRow);
        }

        const greenCountRow = document.getElementById('greenCountRow');
        if (greenCountRow) {
            tbody.removeChild(greenCountRow);
        }

        // Agregar la primera fila en blanco
        agregarFilaEnBlanco();

        // Agregar la fila con la capacidad mínima de cada proceso
        agregarFilaCapacidadMinima(procesos, categorias);

        // Agregar la segunda fila en blanco
        agregarFilaEnBlanco();

        // Agregar la fila con el recuento de casillas verdes en cada columna
        agregarFilaCapacidadReal(procesos, categorias, empleadoProceso);

        // Llamada a la función iluminarCasillas
        const nuevaCapacidadMinimaRow = document.getElementById('capacidadMinimaRow');
        const nuevaGreenCountRow = document.getElementById('greenCountRow');
        iluminarCasillas(nuevaCapacidadMinimaRow, nuevaGreenCountRow);

    } catch (error) {
        console.error('Error al llenar la tabla de procesos:', error);
    }
};
// Función para construir el thead de la tabla
const construirTheadProcesos = (procesos) => {
    const thead = document.querySelector('#theadProcesos');
    thead.innerHTML = '';

    const headerRow1 = document.createElement('tr');
    const headerRow2 = document.createElement('tr');

    // Primera celda de "Empleados"
    const thEmpleados = document.createElement('th');
    thEmpleados.setAttribute('rowspan', '2');
    thEmpleados.textContent = 'Empleados';
    headerRow1.appendChild(thEmpleados);

    // Añadir categorías y procesos a las filas del thead
    const categorias = {};
    procesos.forEach(proceso => {
        if (!categorias[proceso.categoria]) {
            categorias[proceso.categoria] = [];
        }
        categorias[proceso.categoria].push(proceso);
    });

    Object.keys(categorias).forEach(categoria => {
        const thCategoria = document.createElement('th');
        thCategoria.setAttribute('colspan', categorias[categoria].length);
        thCategoria.textContent = categoria;
        headerRow1.appendChild(thCategoria);

        categorias[categoria].forEach(proceso => {
            const thProceso = document.createElement('th');
            thProceso.textContent = proceso.nombre_proceso;
            const hiddenIdProceso = document.createElement('input');
            hiddenIdProceso.type = 'hidden';
            hiddenIdProceso.value = proceso.id_proceso;
            thProceso.appendChild(hiddenIdProceso);
            headerRow2.appendChild(thProceso);
        });
    });

    thead.appendChild(headerRow1);
    thead.appendChild(headerRow2);

    return Object.keys(categorias);
};

// Función para agregar la fila de capacidad mínima de procesos
const agregarFilaCapacidadMinima = (procesos, categorias) => {
    const tbody = document.querySelector('#tablaProcesos tbody');
    const capacidadMinimaRow = document.createElement('tr');
    capacidadMinimaRow.id = 'capacidadMinimaRow'; // Asignamos un id único
    const tdCapacidadMinimaTitle = document.createElement('td');
    tdCapacidadMinimaTitle.textContent = 'Capacidad mínima proceso';
    capacidadMinimaRow.appendChild(tdCapacidadMinimaTitle);

    categorias.forEach(categoria => {
        const procesosCategoria = procesos.filter(proceso => proceso.categoria === categoria);
        procesosCategoria.forEach(proceso => {
            const tdCapacidadMinima = document.createElement('td');
            tdCapacidadMinima.textContent = proceso.capacidad_minima.toString();
            capacidadMinimaRow.appendChild(tdCapacidadMinima);
        });
    });

    tbody.appendChild(capacidadMinimaRow);
};

// Función para agregar la fila de capacidad real existente
const agregarFilaCapacidadReal = (procesos, categorias, empleadoProceso) => {
    const tbody = document.querySelector('#tablaProcesos tbody');
    const greenCountRow = document.createElement('tr');
    greenCountRow.id = 'greenCountRow'; // Asignamos un id único
    const capacidadReal = document.createElement('td');
    capacidadReal.textContent = 'Capacidad Real existente';
    greenCountRow.appendChild(capacidadReal);

    categorias.forEach(categoria => {
        const procesosCategoria = procesos.filter(proceso => proceso.categoria === categoria);
        procesosCategoria.forEach((proceso, index) => {
            let greenCount = 0;
            empleadoProceso.forEach(ep => {
                if (ep.num_proceso === proceso.id_proceso) {
                    greenCount++;
                }
            });
            const tdGreenCount = document.createElement('td');
            tdGreenCount.textContent = greenCount.toString();
            greenCountRow.appendChild(tdGreenCount);
        });
    });

    tbody.appendChild(greenCountRow);
};

const iluminarCasillas = (capacidadMinimaRow, greenCountRow) => {
    const capacidadMinimaCells = capacidadMinimaRow.querySelectorAll('td:not(:first-child)');
    const greenCountCells = greenCountRow.querySelectorAll('td:not(:first-child)');

    capacidadMinimaCells.forEach((capacidadMinimaCell, index) => {
        const capacidadMinimaValue = parseInt(capacidadMinimaCell.textContent);
        const greenCountValue = parseInt(greenCountCells[index].textContent);

        if (capacidadMinimaValue > greenCountValue) {
            capacidadMinimaCell.style.backgroundColor = 'orange';
            greenCountCells[index].style.backgroundColor = 'orange';
        } else if (capacidadMinimaValue === greenCountValue) {
            capacidadMinimaCell.style.backgroundColor = 'yellow';
            greenCountCells[index].style.backgroundColor = 'yellow';
        }
    });
};

// Función para cargar las opciones dinámicamente
const cargarCategoriasProcesos = async () => {

    try {
        const selectCategorias = document.getElementById("categoriasProceso");
        const inputCategoriaNueva = document.getElementById("categoriaNueva");
        const labelCategoriaNueva = document.getElementById("labelCategoriaNueva");

        // Obtener los procesos desde el backend
        const procesos = await obtenerProcesos();

        // Crear un conjunto (Set) para almacenar las categorías únicas
        const categoriasSet = new Set();

        // Obtener categorías únicas de los procesos y agregarlas al conjunto
        procesos.forEach(proceso => {
            categoriasSet.add(proceso.categoria);
        });

        // Convertir el conjunto a un array
        const categoriasArray = Array.from(categoriasSet);

        // Limpiar las opciones existentes del select
        selectCategorias.innerHTML = '';

        // Agregar una opción para crear una nueva categoría
        const optionNuevaCategoria = document.createElement('option');
        optionNuevaCategoria.value = 'nueva';
        optionNuevaCategoria.textContent = 'Crear nueva categoría';
        selectCategorias.appendChild(optionNuevaCategoria);

        // Agregar una opción por cada categoría al select
        categoriasArray.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            selectCategorias.appendChild(option);
        });

        // Agregar evento change al select para manejar la opción "Crear nueva categoría"
        selectCategorias.addEventListener('change', function () {
            if (this.value === 'nueva') {
                inputCategoriaNueva.style.display = 'block';
                labelCategoriaNueva.style.display = 'block';
                inputCategoriaNueva.focus();
            } else {
                inputCategoriaNueva.style.display = 'none';
                labelCategoriaNueva.style.display = 'none';

            }
        });

    } catch (error) {
        console.error('Error al cargar las categorías:', error);
    }
};


// Cargar categorías en el select "categoriasParaEliminar"
const cargarCategoriasParaEliminar = async () => {
    try {
        const procesos = await obtenerProcesos();
        const categoriasSet = new Set(procesos.map(proceso => proceso.categoria));
        const categoriasParaEliminar = document.getElementById('categoriasParaEliminar');
        categoriasParaEliminar.innerHTML = '<option value="">Seleccionar categoría</option>';

        categoriasSet.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categoriasParaEliminar.appendChild(option);
        });

        // Agregar evento para cargar procesos al cambiar de categoría
        categoriasParaEliminar.addEventListener('change', cargarProcesosParaEliminar);
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
};

// Cargar procesos en el select "nombreProcesoEliminar" según la categoría seleccionada
const cargarProcesosParaEliminar = async () => {
    try {
        const categoriaSeleccionada = document.getElementById('categoriasParaEliminar').value;
        const procesos = await obtenerProcesos();
        const procesosFiltrados = procesos.filter(proceso => proceso.categoria === categoriaSeleccionada);
        const nombreProcesoEliminar = document.getElementById('nombreProcesoEliminar');
        nombreProcesoEliminar.innerHTML = '<option value="">Seleccionar proceso</option>';

        procesosFiltrados.forEach(proceso => {
            const option = document.createElement('option');
            option.value = proceso.id_proceso;
            option.textContent = proceso.nombre_proceso;
            nombreProcesoEliminar.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar procesos:', error);
    }
};

// Eliminar el proceso seleccionado al hacer clic en "Borrar"
document.getElementById('myBtnEliminarProceso').addEventListener('click', async () => {
    try {
        const procesoId = document.getElementById('nombreProcesoEliminar').value;
        if (procesoId) {
            await eliminarProceso(procesoId);
            llenarTablaProcesos();
            modalBorrarProceso.style.display = 'none';
        } else {
            alert('Seleccione un proceso para eliminar.');
        }
    } catch (error) {
        console.error('Error al eliminar el proceso:', error);
    }
});

// Función para eliminar el proceso en la base de datos
const eliminarProceso = async (procesoId) => {
    try {
        await window.electron.eliminarRegistro('procesos', 'id_proceso', procesoId);
        console.log('Proceso eliminado correctamente');
    } catch (error) {
        console.error('Error al eliminar el proceso:', error);
    }
};


// Cargar empleados en el select
const cargarEmpleadosParaEstablecer = async () => {
    try {
        const empleados = await obtenerEmpleados();
        const empleadoSelect = document.getElementById('empleadoNombreEstablecer');
        empleadoSelect.innerHTML = '<option value="">Seleccionar empleado</option>';
        empleados.forEach(empleado => {
            const option = document.createElement('option');
            option.value = empleado.id_empleado;
            option.textContent = `${empleado.nombre_empleado} ${empleado.apellidos_empleado}`;
            empleadoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar empleados:', error);
    }
};

// Cargar categorías en el select
const cargarCategoriasParaEstablecer = async () => {
    try {
        const selectCategorias = document.getElementById('categoriaEstablecer');
        selectCategorias.innerHTML = '<option value="">Seleccionar categoría</option>';

        const procesos = await obtenerProcesos();
        const categoriasSet = new Set();
        procesos.forEach(proceso => {
            categoriasSet.add(proceso.categoria);
        });

        categoriasSet.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            selectCategorias.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
};

// Cargar procesos por categoría en el select
const cargarProcesosPorCategoriaParaEstablecer = async () => {
    try {
        const categoria = document.getElementById('categoriaEstablecer').value;
        const procesos = await obtenerProcesos();
        const procesoSelect = document.getElementById('procesoEstablecer');
        procesoSelect.innerHTML = '<option value="">Seleccionar proceso</option>';
        const procesosFiltrados = procesos.filter(proceso => proceso.categoria === categoria);
        procesosFiltrados.forEach(proceso => {
            const option = document.createElement('option');
            option.value = proceso.id_proceso;
            option.textContent = proceso.nombre_proceso;
            procesoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar procesos:', error);
    }
};

// Establecer la relación
const establecerRelacionHandler = async () => {
    try {
        const empleadoId = document.getElementById('empleadoNombreEstablecer').value;
        const procesoId = document.getElementById('procesoEstablecer').value;

        if (!empleadoId || !procesoId) {
            alert('Seleccione un empleado y un proceso.');
            return;
        }

        await establecerRelacion(empleadoId, procesoId);
        llenarTablaProcesos();  // Refrescar la tabla de procesos
        document.getElementById('modalEstablecerProceso').style.display = 'none';
    } catch (error) {
        console.error('Error al establecer el proceso al empleado:', error);
    }
};

// Quitar la relación
const quitarRelacionHandler = async () => {
    try {
        const empleadoId = document.getElementById('empleadoNombreEstablecer').value;
        const procesoId = document.getElementById('procesoEstablecer').value;

        if (!empleadoId || !procesoId) {
            alert('Seleccione un empleado y un proceso.');
            return;
        }

        await quitarRelacion(empleadoId, procesoId);
        llenarTablaProcesos();  // Refrescar la tabla de procesos
        document.getElementById('modalEstablecerProceso').style.display = 'none';
    } catch (error) {
        console.error('Error al quitar la relación:', error);
    }
};

// Establecer la relación
const establecerRelacion = async (empleadoId, procesoId) => {
    try {
        await window.electron.crearRegistro('empleado_proceso', { num_empleado: empleadoId, num_proceso: procesoId });
    } catch (error) {
        console.error('Error al establecer el proceso al empleado:', error);
    }
};

// Quitar la relación
const quitarRelacion = async (empleadoId, procesoId) => {
    try {
        await window.electron.eliminarRegistroRelacionNM('empleado_proceso', 'num_empleado', empleadoId, 'num_proceso', procesoId);
    } catch (error) {
        console.error('Error al eliminar la relación:', error);
    }
};
