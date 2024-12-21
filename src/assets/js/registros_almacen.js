document.addEventListener("DOMContentLoaded", () => {
  const tbodyAlmacenEntrada = document.getElementById("tbody-almacen-entrada");
  const tbodyAlmacenSalida = document.getElementById("tbody-almacen-salida");
  const modal = document.getElementById("modalCrearAlmacen");
  const btnCreacion = document.getElementById("btnCrearAlmacen");
  const span = document.getElementsByClassName("close")[0];

  cargarDatos();

  btnCreacion.addEventListener("click", () => {
    modal.style.display = "block";

    document.getElementById("btnGuardarAlmacen").style.display = "block";
    document.getElementById("btnActualizarAlmacen").style.display = "none";
    document.getElementById("entrada_salidaDIV").style.display = "flex";
    document.getElementById("formularioEntrada").reset();
    document.getElementById("formularioSalida").reset();

    dibujarClientesEnSelect();
    dibujarArticulosEnSelect();
    dibujarProveedoresEnSelect();
    dibujarPedidosEnSelect();
  });

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  document.getElementById("btnGuardarAlmacen")
    .addEventListener("click", async () => {
      const entradaSalida = document.getElementById("entrada_salida").value;

      if (entradaSalida === "ENTRADA") {
        try {
          const nuevoRegistroEntrada = obtenerDatosFormulario("ENTRADA");
          console.log(nuevoRegistroEntrada);
          const result = await window.electron.crearRegistro("registro_entrada_almacen", nuevoRegistroEntrada);
          console.log(result);

          const id_registro_entrada = result.insertId; // Assuming result has an insertId property
          const nuevoAlmacen = obtenerDatosFormularioParaAlmacen(id_registro_entrada, null);
          console.log(nuevoAlmacen);

          await window.electron.crearRegistro("almacen", nuevoAlmacen);
          modal.style.display = "none";
          cargarDatos();
        } catch (err) {
          console.error("Error al crear el registro:", err);
        }
      } else if (entradaSalida === "SALIDA") {
        try {
          const nuevoRegistroSalida = obtenerDatosFormulario("SALIDA");
          const result = await window.electron.crearRegistro("registro_salida_almacen", nuevoRegistroSalida);

          const id_registro_salida = result.insertId; // Assuming result has an insertId property
          const nuevoAlmacen = obtenerDatosFormularioParaAlmacen(null, id_registro_salida);

          await window.electron.crearRegistro("almacen", nuevoAlmacen);
          modal.style.display = "none";
          cargarDatos();
        } catch (err) {
          console.error("Error al crear el registro:", err);
        }
      }
    });

  [tbodyAlmacenEntrada, tbodyAlmacenSalida].forEach((tbody) => {
    tbody.addEventListener("click", async (event) => {
      if (event.target.classList.contains("btn-eliminar")) {
        const tr = event.target.closest("tr");
        const inputNumRegistro = tr.querySelector('input[type="hidden"]');
        const numRegistro = inputNumRegistro.value;
        const apartadoSelect = document.getElementById("apartadoSelect").value;

        // Determinar la tabla y columna en función del valor del select
        let tabla, columna;

        if (apartadoSelect === "ENTRADA") {
          tabla = "registro_entrada_almacen";
          columna = "id_entrada";
          almacenColumna = "id_registro_entrada";
        } else if (apartadoSelect === "SALIDA") {
          tabla = "registro_salida_almacen";
          columna = "id_salida";
          almacenColumna = "id_registro_salida";
        }

        // Llamar a la función de eliminar con los parámetros adecuados
        try {
          await window.electron.eliminarRegistro("Almacen", almacenColumna, numRegistro);
          await window.electron.eliminarRegistro(tabla, columna, numRegistro);
          cargarDatos();
        } catch (err) {
          console.error(`Error al eliminar el registro ${numRegistro} de la tabla ${tabla}:`, err);
          console.error(`Error al eliminar el registro ${numRegistro} de la tabla "almacen":`, err);
        }
      } else if (event.target.classList.contains("btn-editar")) {
        const tr = event.target.closest("tr");
        const inputNumRegistro = tr.querySelector('input[type="hidden"]');
        const numRegistro = inputNumRegistro.value;

        document.getElementById("btnActualizarAlmacen").style.display = "block";
        document.getElementById("btnGuardarAlmacen").style.display = "none";
        document.getElementById("entrada_salidaDIV").style.display = "none";

        modal.style.display = "block";
        formularioCrearAlmacen.style.display = "flex";
        btnActualizarAlmacen.style.display = "block";
        const apartadoSelect = document.getElementById("apartadoSelect").value;

        // Determinar la tabla y columna en función del valor del select
        let tabla, columna, formularioId, columnaAlmacen;
        if (apartadoSelect === "ENTRADA") {
          tabla = "registro_entrada_almacen";
          columna = "id_entrada";
          formularioId = "formularioEntrada";
          columnaAlmacen = "id_registro_entrada";  // Para la tabla de existencias
        } else if (apartadoSelect === "SALIDA") {
          tabla = "registro_salida_almacen";
          columna = "id_salida";
          formularioId = "formularioSalida";
          columnaAlmacen = "id_registro_salida";  // Para la tabla de existencias
        }

        // Ocultar todos los formularios y mostrar el correcto
        document.getElementById("formularioEntrada").style.display = "none";
        document.getElementById("formularioSalida").style.display = "none";
        document.getElementById(formularioId).style.display = "flex";
        document.getElementById("entrada_salida").value = apartadoSelect;

        try {
          const data = await window.electron.obtenerRegistroPorId(tabla, columna, numRegistro);
          llenarFormulario(data);

          const btnActualizarAlmacen = document.getElementById("btnActualizarAlmacen");
          btnActualizarAlmacen.onclick = async function () {
            try {
              const datosActualizados = obtenerDatosFormulario(); // Obtener los datos actualizados del formulario visible
              const datosFormularioAlmacen = obtenerDatosFormularioParaAlmacen();
          
              // Crear una copia de los datos para manipularlos sin afectar los originales
              const datosActualizadosParaExistencias = { ...datosFormularioAlmacen };
          
              // Eliminar los campos que no deben actualizarse
              delete datosActualizadosParaExistencias.id_registro_entrada;
              delete datosActualizadosParaExistencias.id_registro_salida;
          
              console.log(datosActualizadosParaExistencias);
          
              await window.electron.actualizarRegistro(tabla, columna, numRegistro, datosActualizados);
              await window.electron.actualizarRegistro("almacen", columnaAlmacen, numRegistro, datosActualizadosParaExistencias);
          
              modal.style.display = "none";
              cargarDatos();
          
            } catch (err) {
              console.error('Error al actualizar el registro y las existencias:', err);
            }
          };
          
        } catch (err) {
          console.error('Error al obtener los datos del registro:', err);
        }
      }

    });
  });

  document.getElementById("searchBar").addEventListener("input", function () {
    const searchTerm = this.value.trim().toLowerCase();
    filterTable(searchTerm);
  });

  const entradaSalida = document.getElementById("entrada_salida");
  const formEntrada = document.getElementById("formularioEntrada");
  const formSalida = document.getElementById("formularioSalida");
  const tituloH1 = document.getElementById("tituloH1");

  const apartadoSelect = document.getElementById("apartadoSelect");
  const tablaAlmacenEntrada = document.getElementById("tablaAlmacenEntrada");
  const tablaAlmacenSalida = document.getElementById("tablaAlmacenSalida");

  function handleChange() {
    // Manejar cambio en el select de entrada/salida
    if (entradaSalida.value === "ENTRADA") {
      formEntrada.style.display = "flex";
      formSalida.style.display = "none";
    } else if (entradaSalida.value === "SALIDA") {
      formEntrada.style.display = "none";
      formSalida.style.display = "flex";
    }

    // Manejar cambio en el select de apartado
    if (apartadoSelect.value === "ENTRADA") {
      tablaAlmacenEntrada.style.display = "block";
      tablaAlmacenSalida.style.display = "none";
      tituloH1.innerHTML = "";
      tituloH1.innerHTML = "Almacén: Registro de Entradas";
    } else if (apartadoSelect.value === "SALIDA") {
      tablaAlmacenEntrada.style.display = "none";
      tablaAlmacenSalida.style.display = "block";
      tituloH1.innerHTML = "";
      tituloH1.innerHTML = "Almacén: Registro de Salidas";
    }
  }

  entradaSalida.addEventListener("change", handleChange);
  apartadoSelect.addEventListener("change", handleChange);

  // Inicializa la visibilidad de los formularios y tablas según los valores por defecto de los selects
  entradaSalida.dispatchEvent(new Event("change"));
  apartadoSelect.dispatchEvent(new Event("change"));

  // Función para añadir event listeners a los íconos de ordenación de texto/numéricas
function addSortEventListeners(tableId) {
  const table = document.getElementById(tableId);
  table.querySelectorAll('th .asc, th .desc').forEach(icon => {
      icon.addEventListener('click', () => {
          const tbody = table.querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const th = icon.closest('th');
          const index = Array.from(th.parentElement.children).indexOf(th);
          const ascending = icon.classList.contains('asc');

          // Quitar la clase activa de todos los íconos
          table.querySelectorAll('.asc, .desc').forEach(i => i.classList.remove('active'));

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
}

// Función para añadir event listeners a los íconos de ordenación de columnas de fechas
function addDateSortEventListeners(tableId) {
  const table = document.getElementById(tableId);
  table.querySelectorAll('th.fechas .asc, th.fechas .desc').forEach(icon => {
      icon.addEventListener('click', () => {
          const tbody = table.querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const th = icon.closest('th');
          const index = Array.from(th.parentElement.children).indexOf(th);
          const ascending = icon.classList.contains('asc');

          // Quitar la clase activa de todos los íconos
          table.querySelectorAll('.asc, .desc').forEach(i => i.classList.remove('active'));

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
}

// Llamar a las funciones para cada tabla
addSortEventListeners('tabla-almacen-entrada');
addSortEventListeners('tabla-almacen-salida');
addDateSortEventListeners('tabla-almacen-entrada');
addDateSortEventListeners('tabla-almacen-salida');

});

async function cargarDatos() {
  try {
    const entradaAlmacen = await window.electron.leerTabla("registro_entrada_almacen");
    const salidaAlmacen = await window.electron.leerTabla("registro_salida_almacen");

    const tbodyAlmacenEntrada = document.getElementById("tbody-almacen-entrada");
    const tbodyAlmacenSalida = document.getElementById("tbody-almacen-salida");

    // Limpiar contenido previo de las tablas
    tbodyAlmacenEntrada.innerHTML = "";
    tbodyAlmacenSalida.innerHTML = "";

    // Función para crear una fila de tabla a partir de un registro
    async function crearFila(almacen, esEntrada) {
      const tr = document.createElement("tr");
      const columnas = esEntrada
        ? [
          "numero_articulo_entrada",
          "denominacion_entrada",
          "fecha_entrada",
          "cantidad_entrada",
          "pedido_id",
          "num_proveedor",
          "tipo_entrada",
          "observaciones_entrada",
          "estanteria_entrada",
          "nivel_entrada",
          "zona_palet_entrada",
        ]
        : [
          "numero_articulo_salida",
          "denominacion_salida",
          "fecha_salida",
          "cantidad_salida",
          "pedido_cliente",
          "num_cliente",
          "responsable_cliente",
          "tipo_salida",
          "observaciones_salida",
          "estanteria_salida",
          "nivel_salida",
          "zona_palet_salida",
        ];

      for (const columna of columnas) {
        const td = document.createElement("td");
        switch (columna) {
          case "fecha_entrada":
          case "fecha_salida":
            const fechaOriginal = almacen[columna];
            const fechaFormateada = formatearFecha(fechaOriginal);
            td.textContent = fechaFormateada;
            break;
          case "numero_articulo_entrada":
            const nombreArtEntr = await window.electron.buscarIdPorValor('articulos', 'pn_articulo', 'num_articulo_interno', almacen.numero_articulo_entrada);
            td.textContent = nombreArtEntr;
            break;
          case "numero_articulo_salida":
            const nombreArtSalid = await window.electron.buscarIdPorValor('articulos', 'pn_articulo', 'num_articulo_interno', almacen.numero_articulo_salida);
            td.textContent = nombreArtSalid;
            break;
          case "num_proveedor":
            const nombreProv = await window.electron.buscarIdPorValor('proveedores', 'nombre_proveedor', 'num_proveedor', almacen.num_proveedor);
            td.textContent = nombreProv;
            break;
          case "num_cliente":
            const nombreClien = await window.electron.buscarIdPorValor('clientes', 'denominacion_social', 'num_cliente', almacen.num_cliente);
            td.textContent = nombreClien;
            break;
          default:
            td.textContent = almacen[columna];
            break;
        }
        tr.appendChild(td);
      }

      const tdAcciones = document.createElement("td");
      const inputNumAlmacen = document.createElement("input");
      inputNumAlmacen.type = "hidden";
      inputNumAlmacen.value = esEntrada
        ? almacen.id_entrada
        : almacen.id_salida;
      tdAcciones.appendChild(inputNumAlmacen);

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.className = "btn-editar";
      tdAcciones.appendChild(btnEditar);

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.className = "btn-eliminar";
      tdAcciones.appendChild(btnEliminar);

      tr.appendChild(tdAcciones);
      return tr;
    }

    // Añadir filas a la tabla de entradas
    for (const almacen of entradaAlmacen) {
      const fila = await crearFila(almacen, true);
      tbodyAlmacenEntrada.appendChild(fila);
    }

    // Añadir filas a la tabla de salidas
    for (const almacen of salidaAlmacen) {
      const fila = await crearFila(almacen, false);
      tbodyAlmacenSalida.appendChild(fila);
    }
  } catch (err) {
    console.error("Error al cargar los datos:", err);
  }
}


function formatearFecha(fecha) {
  const date = new Date(fecha);
  const dia = date.getDate().toString().padStart(2, "0");
  const mes = (date.getMonth() + 1).toString().padStart(2, "0");
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

function formatearFechaParaInput(fecha) {
  const date = new Date(fecha);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function agregarOpcionInicial(selectElement, texto) {
  const optionInicial = document.createElement('option');
  optionInicial.value = '';
  optionInicial.text = texto;
  optionInicial.disabled = true;
  optionInicial.selected = true;
  selectElement.appendChild(optionInicial);
}

async function dibujarClientesEnSelect() {
  try {
    const clientes = await window.electron.leerTabla("clientes");
    const selectCliente = document.getElementById("numero_cliente");

    selectCliente.innerHTML = "";
    agregarOpcionInicial(selectCliente, 'Elegir cliente...');

    clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.num_cliente;
      option.text = cliente.denominacion_social;
      selectCliente.appendChild(option);
    });
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  }
}


async function dibujarProveedoresEnSelect() {
  try {
    const proveedores = await window.electron.leerTabla("proveedores");
    const selectProveedor = document.getElementById("proveedor_id");

    selectProveedor.innerHTML = "";
    agregarOpcionInicial(selectProveedor, "Elegir proveedor");

    proveedores.forEach((proveedor) => {
      const option = document.createElement("option");
      option.value = proveedor.num_proveedor;
      option.text = proveedor.nombre_proveedor;
      selectProveedor.appendChild(option);
    });
  } catch (error) {
    console.error("Error al obtener los articulos:", error);
  }
}

async function dibujarPedidosEnSelect() {
  try {
    const pedidos = await window.electron.leerTabla("pedidos_clientes");
    const selectPedidoEntrada = document.getElementById("pedido_id_entrada");
    const selectPedidoSalida = document.getElementById("pedido_id_salida");

    selectPedidoEntrada.innerHTML = "";
    selectPedidoSalida.innerHTML = "";
    agregarOpcionInicial(selectPedidoEntrada, 'Elegir pedido...');
    agregarOpcionInicial(selectPedidoSalida, 'Elegir pedido...');

    pedidos.forEach((pedido) => {
      // Crear opción para selectPedidoEntrada
      const optionEntrada = document.createElement("option");
      optionEntrada.value = pedido.num_pedido_cliente;
      optionEntrada.text = pedido.num_pedido_cliente;
      selectPedidoEntrada.appendChild(optionEntrada);

      // Crear opción para selectPedidoSalida
      const optionSalida = document.createElement("option");
      optionSalida.value = pedido.num_pedido_cliente;
      optionSalida.text = pedido.num_pedido_cliente;
      selectPedidoSalida.appendChild(optionSalida);
    });
  } catch (error) {
    console.error("Error al obtener los pedidos:", error);
  }
}

async function dibujarArticulosEnSelect() {
  try {
    const articulos = await window.electron.leerTabla("articulos");
    const selectArticuloEntrada = document.getElementById("numero_articulo_entrada");
    const selectArticuloSalida = document.getElementById("numero_articulo_salida");

    selectArticuloEntrada.innerHTML = "";
    selectArticuloSalida.innerHTML = "";
    agregarOpcionInicial(selectArticuloEntrada, 'Elegir articulo...');
    agregarOpcionInicial(selectArticuloSalida, 'Elegir articulo...');

    articulos.forEach((articulo) => {
      // Crear opción para selectArticuloEntrada
      const optionEntrada = document.createElement("option");
      optionEntrada.value = articulo.num_articulo_interno;
      optionEntrada.text = articulo.pn_articulo;
      selectArticuloEntrada.appendChild(optionEntrada);

      // Crear opción para selectArticuloSalida
      const optionSalida = document.createElement("option");
      optionSalida.value = articulo.num_articulo_interno;
      optionSalida.text = articulo.pn_articulo;
      selectArticuloSalida.appendChild(optionSalida);
    });
  } catch (error) {
    console.error("Error al obtener los articulos:", error);
  }
}

function obtenerDatosFormulario() {
  const entradaOSalida = document.getElementById("entrada_salida").value;

  if (entradaOSalida === "ENTRADA") {
    // ENTRADA
    const numero_articulo_entrada = document.getElementById("numero_articulo_entrada").value ? document.getElementById("numero_articulo_entrada").value : null;
    const denominacion_entrada = document.getElementById("denominacion_entrada").value ? document.getElementById("denominacion_entrada").value : null;
    const fecha_entrada = document.getElementById("fecha_entrada").value ? document.getElementById("fecha_entrada").value : null;
    const cantidad_entrada = document.getElementById("cantidad_entrada").value ? document.getElementById("cantidad_entrada").value : null;

    const proveedor_id = document.getElementById("proveedor_id").value ? document.getElementById("proveedor_id").value : null;
    const tipo_producto_entrada = document.getElementById("tipo_producto_entrada").value ? document.getElementById("tipo_producto_entrada").value : null;
    const observaciones_entrada = document.getElementById("observaciones_entrada").value ? document.getElementById("observaciones_entrada").value : null;
    const estanteria_entrada = document.getElementById("estanteria_entrada").value ? document.getElementById("estanteria_entrada").value : null;
    const nivel_entrada = document.getElementById("nivel_entrada").value ? document.getElementById("nivel_entrada").value : null;
    const zona_palet_entrada = document.getElementById("zona_palet_entrada").value ? document.getElementById("zona_palet_entrada").value : null;
    return {
      numero_articulo_entrada: numero_articulo_entrada,
      denominacion_entrada: denominacion_entrada,
      fecha_entrada: fecha_entrada,
      cantidad_entrada: cantidad_entrada,
      num_proveedor: proveedor_id,
      tipo_entrada: tipo_producto_entrada,
      observaciones_entrada: observaciones_entrada,
      estanteria_entrada: estanteria_entrada,
      nivel_entrada: nivel_entrada,
      zona_palet_entrada: zona_palet_entrada,
    };
  } else if (entradaOSalida === "SALIDA") {
    // SALIDA
    const numero_articulo_salida = document.getElementById("numero_articulo_salida").value ? document.getElementById("numero_articulo_salida").value : null;
    const denominacion_salida = document.getElementById("denominacion_salida").value ? document.getElementById("denominacion_salida").value : null;
    const fecha_salida = document.getElementById("fecha_salida").value ? document.getElementById("fecha_salida").value : null;
    const cantidad_salida = document.getElementById("cantidad_salida").value ? document.getElementById("cantidad_salida").value : null;
    const pedido_id_salida = document.getElementById("pedido_id_salida").value ? document.getElementById("pedido_id_salida").value : null;
    const responsable_cliente = document.getElementById("responsable_cliente").value ? document.getElementById("responsable_cliente").value : null;
    const numero_cliente = document.getElementById("numero_cliente").value ? document.getElementById("numero_cliente").value : null;
    const tipo_producto_salida = document.getElementById("tipo_producto_salida").value ? document.getElementById("tipo_producto_salida").value : null;
    const observaciones_salida = document.getElementById("observaciones_salida").value ? document.getElementById("observaciones_salida").value : null;
    const estanteria_salida = document.getElementById("estanteria_salida").value ? document.getElementById("estanteria_salida").value : null;
    const nivel_salida = document.getElementById("nivel_salida").value ? document.getElementById("nivel_salida").value : null;
    const zona_palet_salida = document.getElementById("zona_palet_salida").value ? document.getElementById("zona_palet_salida").value : null;

    return {
      numero_articulo_salida: numero_articulo_salida,
      denominacion_salida: denominacion_salida,
      fecha_salida: fecha_salida,
      cantidad_salida: cantidad_salida,
      pedido_cliente: pedido_id_salida,
      responsable_cliente: responsable_cliente,
      num_cliente: numero_cliente,
      tipo_salida: tipo_producto_salida,
      observaciones_salida: observaciones_salida,
      estanteria_salida: estanteria_salida,
      nivel_salida: nivel_salida,
      zona_palet_salida: zona_palet_salida,
    };
  }
}

function obtenerDatosFormularioParaAlmacen(id_registro_entrada = null, id_registro_salida = null) {
  const entradaOSalida = document.getElementById("entrada_salida").value;

  if (entradaOSalida === "ENTRADA") {
    const numero_articulo_entrada_element = document.getElementById("numero_articulo_entrada");
    const numero_articulo_entrada_value = numero_articulo_entrada_element ? numero_articulo_entrada_element.value : null;
    const denominacion_entrada = document.getElementById("denominacion_entrada").value || null;
    const cantidad_entrada = document.getElementById("cantidad_entrada").value || null;
    const tipo_producto_entrada = document.getElementById("tipo_producto_entrada").value || null;
    const observaciones_entrada = document.getElementById("observaciones_entrada").value || null;
    const estanteria_entrada = document.getElementById("estanteria_entrada").value || null;
    const nivel_entrada = document.getElementById("nivel_entrada").value || null;
    const zona_palet_entrada = document.getElementById("zona_palet_entrada").value || null;

    return {
      numero_articulo: numero_articulo_entrada_value,
      denominacion: denominacion_entrada,
      cantidad: cantidad_entrada,
      tipo_producto: tipo_producto_entrada,
      observaciones: observaciones_entrada,
      estanteria: estanteria_entrada,
      nivel: nivel_entrada,
      zona_palet: zona_palet_entrada,
      id_registro_entrada: id_registro_entrada,
    };
  } else if (entradaOSalida === "SALIDA") {
    const numero_articulo_salida_element = document.getElementById("numero_articulo_salida");
    const numero_articulo_salida_value = numero_articulo_salida_element ? numero_articulo_salida_element.value : null;
    const denominacion_salida = document.getElementById("denominacion_salida").value || null;
    const cantidad_salida = document.getElementById("cantidad_salida").value || null;
    const tipo_producto_salida = document.getElementById("tipo_producto_salida").value || null;
    const observaciones_salida = document.getElementById("observaciones_salida").value || null;
    const estanteria_salida = document.getElementById("estanteria_salida").value || null;
    const nivel_salida = document.getElementById("nivel_salida").value || null;
    const zona_palet_salida = document.getElementById("zona_palet_salida").value || null;

    return {
      numero_articulo: numero_articulo_salida_value,
      denominacion: denominacion_salida,
      cantidad: cantidad_salida,
      tipo_producto: tipo_producto_salida,
      observaciones: observaciones_salida,
      estanteria: estanteria_salida,
      nivel: nivel_salida,
      zona_palet: zona_palet_salida,
      id_registro_salida: id_registro_salida,
    };
  }
}

// Función para llenar el formulario con los datos obtenidos
async function llenarFormulario(data) {
  const apartadoSelect = document.getElementById("apartadoSelect").value;

  await dibujarArticulosEnSelect();
  await dibujarClientesEnSelect();
  await dibujarProveedoresEnSelect();
  await dibujarPedidosEnSelect();

  if (apartadoSelect === "ENTRADA") {
    document.getElementById("numero_articulo_entrada").value = data.numero_articulo_entrada || "";
    document.getElementById("denominacion_entrada").value = data.denominacion_entrada || "";
    document.getElementById("fecha_entrada").value = data.fecha_entrada ? formatearFechaParaInput(data.fecha_entrada) : "";
    document.getElementById("cantidad_entrada").value = data.cantidad_entrada || "";
    document.getElementById("pedido_id_entrada").value = data.pedido_proveedor || "";
    document.getElementById("proveedor_id").value = data.num_proveedor || "";
    document.getElementById("tipo_producto_entrada").value = data.tipo_entrada || "";
    document.getElementById("observaciones_entrada").value = data.observaciones_entrada || "";
    document.getElementById("estanteria_entrada").value = data.estanteria_entrada || "";
    document.getElementById("nivel_entrada").value = data.nivel_entrada || "";
    document.getElementById("zona_palet_entrada").value = data.zona_palet_entrada || "";
  } else if (apartadoSelect === "SALIDA") {
    document.getElementById("numero_articulo_salida").value = data.numero_articulo_salida || "";
    document.getElementById("denominacion_salida").value = data.denominacion_salida || "";
    document.getElementById("fecha_salida").value = data.fecha_salida ? formatearFechaParaInput(data.fecha_salida) : "";
    document.getElementById("cantidad_salida").value = data.cantidad_salida || "";
    document.getElementById("pedido_id_salida").value = data.pedido_cliente || "";
    document.getElementById("responsable_cliente").value = data.responsable_cliente || "";
    document.getElementById("numero_cliente").value = data.num_cliente || "";
    document.getElementById("tipo_producto_salida").value = data.tipo_salida || "";
    document.getElementById("observaciones_salida").value = data.observaciones_salida || "";
    document.getElementById("estanteria_salida").value = data.estanteria_salida || "";
    document.getElementById("nivel_salida").value = data.nivel_salida || "";
    document.getElementById("zona_palet_salida").value = data.zona_palet_salida || "";
  }
}

function filterTable(searchTerm) {
  const tableIds = ["tabla-almacen-entrada", "tabla-almacen-salida"];

  // Iterar sobre ambas tablas
  tableIds.forEach((tableId) => {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
      // Verificar si las filas son una cabecera (th)
      if (rows[i].getElementsByTagName("th").length > 0) {
        continue; // Saltar la iteración si es una cabecera
      }
      const cells = rows[i].getElementsByTagName("td");
      let found = false;

      for (let j = 0; j < cells.length; j++) {
        const cellText = cells[j].textContent.toLowerCase();
        if (cellText.includes(searchTerm)) {
          found = true;
          break;
        }
      }

      if (found) {
        rows[i].style.display = "";
      } else {
        rows[i].style.display = "none";
      }
    }
  });
}

