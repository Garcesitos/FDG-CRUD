document.addEventListener('DOMContentLoaded', () => {
    window.electron.leerTabla('usuarios')
        .then(usuarios => {
            const tbodyUsuarios = document.getElementById('tbody-usuarios');
            tbodyUsuarios.innerHTML = ''; // Limpiar el contenido existente

            usuarios.forEach(usuario => {
                const tr = document.createElement('tr');

                // Columnas de la tabla y nombres de los campos correspondientes en la base de datos
                const columnas = [
                    'nombre',
                    'contrasena',
                    'correo',
                    'nombre',
                    'apellidos',
                    'id_empleado'
                ];

                // Iterar sobre las columnas y crear las celdas de tabla correspondientes
                columnas.forEach(columna => {
                    const td = document.createElement('td');
                    td.textContent = usuario[columna];
                    tr.appendChild(td);
                });

                // Crear la celda de acciones con los botones "Editar" y "Eliminar" y el campo oculto para id
                const tdAcciones = document.createElement('td');

                // Campo oculto para el id
                const inputId = document.createElement('input');
                inputId.type = 'hidden';
                inputId.value = usuario.id_usuario;
                tdAcciones.appendChild(inputId);

                // Botón de editar
                const btnEditar = document.createElement('button');
                btnEditar.textContent = 'Editar';
                btnEditar.className = 'btn-editar';
                btnEditar.addEventListener('click', () => {
                    editarUsuario(usuario.id); // Supone que tienes un campo 'id' en tu tabla usuarios
                });
                tdAcciones.appendChild(btnEditar);

                // Botón de eliminar
                const btnEliminar = document.createElement('button');
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.className = 'btn-eliminar';
                btnEliminar.addEventListener('click', () => {
                    eliminarUsuario(usuario.id_usuario); // Supone que tienes un campo 'id' en tu tabla usuarios
                });
                tdAcciones.appendChild(btnEliminar);

                tr.appendChild(tdAcciones);
                tbodyUsuarios.appendChild(tr);
            });
        })
        .catch(err => console.error('Error al obtener usuarios:', err));


    function editarUsuario(id) {
        // Lógica para editar el usuario
    }

    function eliminarUsuario(id) {
        window.electron.eliminarRegistro('usuarios', 'id_usuario', id)
            .then(() => {
                // Encontrar el campo oculto por su valor
                const inputId = document.querySelector(`input[value="${id}"]`);
                if (inputId) {
                    // Si se encontró el campo oculto, encontrar la fila de la tabla
                    const row = inputId.closest('tr');
                    if (row) {
                        // Si se encontró la fila, eliminarla
                        console.log('Fila eliminada:', row);
                        row.remove();
                    } else {
                        console.error('No se encontró la fila de la tabla para el usuario con ID:', id);
                    }
                } else {
                    console.error('No se encontró el campo oculto para el usuario con ID:', id);
                }
            })
            .catch(err => console.error('Error al eliminar usuario:', err));
    }

    // Get the modal
    var modal = document.getElementById("modalCrearUsuario");

    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.getElementById("btnGuardarUsuario").addEventListener("click", function () {
         // Obtener los valores de los campos del formulario
         const nombreUsuario = document.getElementById('nombreUsuario').value;
         const correo = document.getElementById('correo').value;
         const contrasena = document.getElementById('contrasena').value;
         const nombre = document.getElementById('nombre').value;
         const apellidos = document.getElementById('apellidos').value;
         const idEmpleado = document.getElementById('idEmpleado').value;


        // Crear un objeto con los datos del usuario
        const nuevoUsuario = {
            nombre_usuario: nombreUsuario,
            correo: correo,
            contrasena: contrasena,
            nombre: nombre,
            apellidos: apellidos,
            id_empleado: idEmpleado
        };


         // Llamar a la función crearRegistro del módulo electron para insertar el nuevo usuario en la base de datos
         window.electron.crearRegistro('usuarios', nuevoUsuario)
         .then(result => {
             console.log('Usuario creado exitosamente:', result);
             // Aquí puedes cerrar el modal o realizar otras acciones necesarias
             modal.style.display = "none"; // Cerrar el modal después de crear el usuario
             // Recargar la página después de crear el registro
             location.reload();
         })
         .catch(err => {
             console.error('Error al crear el usuario:', err);
             // Aquí podrías mostrar un mensaje de error al usuario si es necesario
         });
    });

    
    document.getElementById('searchBar').addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        filterTable(searchTerm);
    });
    

// Añadir event listeners a los íconos de ordenación
document.querySelectorAll('th .asc, th .desc').forEach(icon => {
    icon.addEventListener('click', () => {
        const table = document.getElementById('tablaUsuarios');
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



function filterTable(searchTerm) {
    const table = document.getElementById('tablaUsuarios');
    const rows = table.getElementsByTagName('tr');
    console.log(rows.length);

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
