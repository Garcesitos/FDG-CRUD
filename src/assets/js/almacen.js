document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();

  document.getElementById('searchBar').addEventListener('input', function () {
    const searchTerm = this.value.trim().toLowerCase();
    filterTable(searchTerm);
  });

  // Añadir event listeners a los íconos de ordenación
  document.querySelectorAll('th .asc, th .desc').forEach(icon => {
    icon.addEventListener('click', () => {
      const table = document.getElementById('tabla-almacen-existencias');
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

});

async function cargarDatos() {
  try {
    // Obtener datos de la tabla Almacen
    const almacen = await window.electron.leerTabla("Almacen");

    // Calcular existencias combinando los datos de almacen
    const existencias = combinarYCalcularExistencias(almacen);

    // Limpiar y actualizar tabla en HTML
    const tbodyAlmacenExistencias = document.getElementById("tbody-almacen-existencias");
    tbodyAlmacenExistencias.innerHTML = "";

    // Mostrar las existencias calculadas
    for (const almacenItem of existencias) {
      const tr = document.createElement("tr");
      const columnas = [
        "numero_articulo",
        "denominacion",
        "cantidad",
        "tipo_producto",
        "observaciones",
        "estanteria",
        "nivel",
        "zona_palet",
      ];

      for (const columna of columnas) {
        const td = document.createElement("td");

        switch (columna) {
          case 'numero_articulo':
            const nombreArtEntr = await window.electron.buscarIdPorValor('articulos', 'pn_articulo', 'num_articulo_interno', almacenItem.numero_articulo);
            td.textContent = nombreArtEntr || "No encontrado"; // Manejo de caso donde no se encuentra el nombre
            break;
          default:
            td.textContent = almacenItem[columna] || "No disponible"; // Manejo de caso donde el dato no está definido
            break;
        }

        tr.appendChild(td);
      }

      tbodyAlmacenExistencias.appendChild(tr);
    }
  } catch (err) {
    console.error("Error al cargar los datos:", err);
  }
}



function combinarYCalcularExistencias(almacen) {
  const existenciasMap = new Map();

  almacen.forEach((item) => {
    const key = `${item.numero_articulo}-${item.tipo_producto}-${item.estanteria}-${item.nivel}-${item.zona_palet}`;

    if (!existenciasMap.has(key)) {
      existenciasMap.set(key, {
        numero_articulo: item.numero_articulo,
        denominacion: item.denominacion,
        cantidad: 0,  // Inicializar en 0 para realizar las sumas y restas adecuadamente
        tipo_producto: item.tipo_producto,
        observaciones: item.observaciones,
        estanteria: item.estanteria,
        nivel: item.nivel,
        zona_palet: item.zona_palet,
      });
    }

    // Sumar o restar cantidades basado en los campos id_registro_entrada e id_registro_salida
    if (item.id_registro_entrada) {
      existenciasMap.get(key).cantidad += item.cantidad;
    } else if (item.id_registro_salida) {
      existenciasMap.get(key).cantidad -= item.cantidad;
    }
  });

  return Array.from(existenciasMap.values());
}

function filterTable(searchTerm) {
  const table = document.getElementById('tabla-almacen-existencias');
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