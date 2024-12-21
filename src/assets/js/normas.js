document.addEventListener("DOMContentLoaded", () => {
    // Obtener referencias a los contenedores según la extensión del documento
    const pdfContainer = document.getElementById("pdf-container");
    const wordContainer = document.getElementById("word-container");
    const excelContainer = document.getElementById("excel-container");
    const pptContainer = document.getElementById("ppt-container");

    // Función para obtener los documentos
    const obtenerDocumentos = async () => {
        try {
            const documentos = await window.electron.leerTabla('documentos');

            // Verifica si hay documentos y si hay al menos uno
            if (documentos && documentos.length > 0) {
                // Obtener los documentos ordenados por fecha más reciente
                documentos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

                // Limpiar los contenedores de documentos antes de agregar nuevos
                pdfContainer.innerHTML = "";
                wordContainer.innerHTML = "";
                excelContainer.innerHTML = "";
                pptContainer.innerHTML = "";

                // Iterar sobre la lista de documentos
// Iterar sobre la lista de documentos
documentos.forEach((documento, index) => {
    // Verificar si la categoría es "Documento"
    if (documento.categoria === "Norma") {
        const div = document.createElement("div");
        div.id = `document-wrapper`;
        div.className = "document-wrapper"; // Cambiado el nombre de la clase para evitar conflictos con el id
        div.style.margin = "20px";
        div.dataset.codigoDoc = documento.codigo_doc;

        const img = document.createElement("img");
        img.id = `document-img-${index}`; // Asignar un id único a cada imagen

        // Asignar el src de la imagen según la extensión del documento
        switch (documento.extension) {
            case "doc":
            case "docx":
                img.src = "../assets/images/doc.png";
                wordContainer.appendChild(div); // Agregar al contenedor de documentos de Word
                break;
            case "pdf":
                img.src = "../assets/images/pdf.png";
                pdfContainer.appendChild(div); // Agregar al contenedor de documentos PDF
                break;
            case "xls":
            case "xlsx":
                img.src = "../assets/images/xls.png";
                excelContainer.appendChild(div); // Agregar al contenedor de documentos de Excel
                break;
            case "pptx":
            case "ppt":
                img.src = "../assets/images/ppt.png";
                pptContainer.appendChild(div); // Agregar al contenedor de documentos de PowerPoint
                break;
            default:
                img.src = ""; // Agregar una imagen por defecto o dejarla vacía si la extensión no está definida
        }

        // Añadir evento click a la imagen para abrir el modal
        img.addEventListener("click", () => {
            abrirModal(documento.documento); // Pasar la URL del documento a la función abrirModal
        });

        const divInfo = document.createElement("div");
        divInfo.id = "divInfo";
        divInfo.style.marginTop = "10px";
        divInfo.style.marginBottom = "10px";

        const codigo_doc = document.createElement("p");
        codigo_doc.innerHTML = "<strong>Código de Documento:</strong> " + documento.codigo_doc;

        const nombre = document.createElement("p");
        nombre.innerHTML = "<strong>Nombre:</strong> " + documento.nombre;

        const edicion = document.createElement("p");
        edicion.innerHTML = "<strong>Edición:</strong> " + documento.edicion;

        const fecha = document.createElement("p");
        const fechaDate = new Date(documento.fecha);
        fecha.innerHTML = "<strong>Fecha:</strong> " + fechaDate.toLocaleDateString("es-ES");

        const estado = document.createElement("p");
        estado.innerHTML = "<strong>Estado:</strong> " + documento.estado;

        const divButton = document.createElement("div");
        divButton.className = "d-flex";

        divInfo.appendChild(codigo_doc);
        divInfo.appendChild(nombre);
        divInfo.appendChild(edicion);
        divInfo.appendChild(fecha);
        divInfo.appendChild(estado);

        // Crear el botón de eliminar y añadirlo al div
        const buttonElim = document.createElement("button");
        buttonElim.className = "btn-eliminar";
        buttonElim.innerHTML =
            '<icon class="icon-trash-empty" style="font-size: 18px;"></icon>';
        buttonElim.id = `abrirModalEliminarDoc-${index}`;

        // Agregar evento click al botón de eliminar para mostrar el modal
        buttonElim.addEventListener("click", () => {
            // Obtener el elemento del mensaje y actualizarlo con el nombre del documento
            const msgEliminarDoc = document.getElementById("msgEliminarDoc");
            msgEliminarDoc.textContent = `¿Seguro que quieres eliminar "${documento.nombre}"?`;

            // Almacenar la URL del documento y el ID del div en el botón de confirmar
            const confirmarEliminarButton = document.getElementById(
                "confirmarEliminarDoc"
            );
            confirmarEliminarButton.dataset.documentUrl = documento.documento;
            confirmarEliminarButton.dataset.divId = div.id;
            confirmarEliminarButton.dataset.documentCodigoDoc =
                documento.codigo_doc;

            // Mostrar el modal
            const modalEliminarDoc =
                document.getElementById("modalEliminarDoc");
            modalEliminarDoc.style.display = "block";
        });

        const buttonDownload = document.createElement("button");
        buttonDownload.className = "btn-secondary";
        buttonDownload.id = `downloadDoc-${documento.codigo_doc}`;
        buttonDownload.innerHTML =
            '<icon class="icon-download" style="font-size: 18px;"></icon>';

        buttonDownload.addEventListener("click", () => {
            descargarDocumento(docuwmento.documento, documento.extension);
        });

        const buttonEditarDoc = document.createElement("button");
        buttonEditarDoc.className = "btn-editar";
        buttonEditarDoc.id = `editDoc-${documento.codigo_doc}`;
        buttonEditarDoc.innerHTML =
            '<icon class="icon-pencil" style="font-size: 18px;"></icon>';

        // Agregar evento click al botón de editar documento para mostrar el modal
        buttonEditarDoc.addEventListener("click", () => {
            modalDoc.style.display = "block";
            document.getElementById("btn-guardarDocumento").style.display =
                "none";
            document.getElementById("btn-actualizarDocumento").style.display =
                "block";
            document.getElementById("tituloActualizar").style.display = "block";
            document.getElementById("tituloAgregar").style.display = "none";
            document.getElementById("codigo_doc").setAttribute("readonly", "readonly");
            document.getElementById("categoriaDiv").removeAttribute("hidden", "hidden");
            document.getElementById("categoriaInput").setAttribute("hidden","hidden");
            document.getElementById("categoriaSelect").removeAttribute("hidden","hidden");

            llenarFormulario(documento); // Pasar los datos del documento a la función llenarFormulario
        });

        divButton.appendChild(buttonElim);
        divButton.appendChild(buttonEditarDoc);
        divButton.appendChild(buttonDownload);

        // Agregar el párrafo al div
        div.appendChild(img);
        div.appendChild(divInfo);
        div.appendChild(divButton);

        // Agregar el div al contenedor correspondiente según la extensión del documento
        switch (documento.extension) {
            case "doc":
            case "docx":
                wordContainer.appendChild(div); // Agregar al contenedor de documentos de Word
                break;
            case "pdf":
                pdfContainer.appendChild(div); // Agregar al contenedor de documentos PDF
                break;
            case "xls":
            case "xlsx":
                excelContainer.appendChild(div); // Agregar al contenedor de documentos de Excel
                break;
            case "pptx":
            case "ppt":
                pptContainer.appendChild(div); // Agregar al contenedor de documentos de PowerPoint
                break;
            default:
                // Si la extensión no está definida, no agregar a ningún contenedor
                break;
        }
    }
});

                // Añadir un estilo para alinear los contenedores en el centro
                const contenedores = document.querySelectorAll(".document-wrapper");
                contenedores.forEach(contenedor => {
                    contenedor.style.display = "flex";
                    contenedor.style.flexDirection = "column";
                    contenedor.style.alignItems = "center";
                });
            } else {
                console.log("No se encontraron documentos.");
            }
        } catch (error) {
            console.error("Error al obtener documentos:", error);
        }
    };

    const descargarDocumento = (rutaDocumento, extension) => {
        const nombreArchivo = rutaDocumento.substring(rutaDocumento.lastIndexOf("/") + 1);

        // Crear un elemento <a> para descargar el archivo
        const link = document.createElement('a');
        link.href = rutaDocumento;
        link.download = `${nombreArchivo}.${extension}`; // Establecer el nombre del archivo con la extensión original
        link.click();
    };

    const confirmarEliminarButton = document.getElementById(
        "confirmarEliminarDoc"
    );
    confirmarEliminarButton.addEventListener("click", async () => {
        const documentUrl = confirmarEliminarButton.dataset.documentUrl;

        try {
            const documentos = await window.electron.leerTabla('documentos');
            const documento = documentos.find((doc) => doc.documento === documentUrl);

            if (documento) {
                window.electron.eliminarRegistro('documentos', 'codigo_doc', documento.codigo_doc);
                window.electron.eliminarArchivo(documento.documento);

                // Obtener el código del documento y ocultar el div correspondiente
                const codigoDoc = confirmarEliminarButton.dataset.documentCodigoDoc;
                const divs = document.querySelectorAll(`[data-codigo-doc="${codigoDoc}"]`);
                divs.forEach(div => div.style.display = 'none');

                // Mostrar mensaje de éxito
                const responseElement = document.getElementById("response");
                responseElement.textContent = "Documento eliminado con éxito";
                modalEliminarDoc.style.display = "none";
                setTimeout(() => {
                    responseElement.textContent = "";
                }, 5000);
            } else {
                console.error("Documento no encontrado para eliminar");
            }
        } catch (error) {
            console.error("Error al eliminar el documento:", error);
        }
    });

    // Función para abrir el modal con el documento correspondiente
    const abrirModal = (url) => {
        const modal = document.getElementById("myModal");
        const embed = document.querySelector("#myModal embed");
        embed.src = url;
        modal.style.display = "block";
    };



    // Función para llenar el formulario con los datos del documento
    const llenarFormulario = (documento) => {
        document.getElementById("codigo_doc").value = documento.codigo_doc;
        document.getElementById("nombre").value = documento.nombre;
        document.getElementById("edicion").value = documento.edicion;
        let fechaUTC = new Date(documento.fecha);
        let fechaLocal = new Date(fechaUTC.getTime() - fechaUTC.getTimezoneOffset() * 60000);    
        document.getElementById("fecha").value = fechaLocal.toISOString().split('T')[0];
        document.getElementById("estado").value = documento.estado;
    
        // Seleccionar la categoría en el select
        const categoriaSelect = document.getElementById("categoriaSelect");
        const categoriaOptions = Array.from(categoriaSelect.options);
    
        // Buscar la opción cuyo valor coincida con documento.categoria
        const matchingOption = categoriaOptions.find(option => option.value === documento.categoria);
        if (matchingOption) {
            categoriaSelect.value = matchingOption.value;
        } else {
            // Si no se encuentra la categoría, puedes agregar una nueva opción o manejarlo de otra manera
            console.warn(`No se encontró la categoría: ${documento.categoria}`);
        }
    };

    // Abrir el modal cuando se presiona el botón "agregarDocumento"
    const agregarDocumentoButton = document.getElementById("agregarDocumento");
    const modalDoc = document.getElementById("modalDoc");
    const closeModalButtons = document.querySelectorAll(".close");

    agregarDocumentoButton.addEventListener("click", () => {
        modalDoc.style.display = "block";
        document.getElementById("btn-guardarDocumento").style.display = "block";
        document.getElementById("tituloAgregar").style.display = "block";
        document.getElementById("btn-actualizarDocumento").style.display = "none";
        document.getElementById("tituloActualizar").style.display = "none";
        document.getElementById("codigo_doc").removeAttribute("readonly", "readonly");
        document.getElementById("categoriaDiv").setAttribute("hidden", "hidden");
        document.getElementById("categoriaInput").removeAttribute("hidden","hidden");
        document.getElementById("categoriaSelect").setAttribute("hidden","hidden");

        form.reset();
        
    });

    closeModalButtons.forEach((button) => {
        button.addEventListener("click", () => {
            modalDoc.style.display = "none";
            modalEliminarDoc.style.display = "none";
            myModal.style.display = "none";
        });
    });

    // También puedes cerrar el modal haciendo clic fuera de él
    window.addEventListener("click", (event) => {
        if (event.target === modalDoc) {
            modalDoc.style.display = "none";
        }
        if (event.target === modalEliminarDoc) {
            modalEliminarDoc.style.display = "none";
        }
        if (event.target === myModal) {
            myModal.style.display = "none";
        }
    });

    const guardarDocumento = async (event) => {
        event.preventDefault(); // Evitar el envío del formulario por defecto

        // Obtener los valores del formulario
        const codigo_doc = document.getElementById("codigo_doc").value;
        const nombre = document.getElementById("nombre").value;
        const edicion = document.getElementById("edicion").value;
        const fecha = document.getElementById("fecha").value;
        const archivoInput = document.getElementById("documento"); // Input del archivo adjunto
        const estado = document.getElementById("estado").value;
        const categoria = document.getElementById("categoriaInput").value;

        // Verificar si se ha seleccionado un archivo
        if (archivoInput.files.length > 0) {
            const archivo = archivoInput.files[0];
            const extension = archivo.name.split(".").pop(); // Extraer la extensión del nombre del archivo
            const archivoNombre = `${nombre}.${extension}`;
            const archivoRuta = `src/assets/documents/${archivoNombre}`; // Ruta donde se guardará el archivo

            try {
                // Verificar si el archivo ya existe en la base de datos
                const archivoExiste = await window.electron.verificarArchivoRuta('documentos', 'codigo_doc', archivoRuta);

                if (archivoExiste) {
                    throw new Error(
                        "No se ha podido introducir el archivo, el archivo ya está registrado"
                    );
                }

                // Enviar los datos del documento al proceso principal, pasando la ruta del archivo en lugar del contenido
                const result = {
                    codigo_doc,
                    nombre,
                    edicion,
                    fecha,
                    documento: archivoRuta,
                    extension: `${extension}`,
                    estado,
                    categoria,
                };

                await window.electron.crearRegistro('documentos', result);

                // Guardar el archivo en el sistema de archivos
                const arrayBuffer = await archivo.arrayBuffer();
                const fileContent = new Uint8Array(arrayBuffer);
                await window.electron.saveFile({ filePath: archivoRuta, fileContent });

                window.electron.onSaveFileResponse((response) => {
                    const responseElement = document.getElementById("response");
                    if (response.success) {
                        responseElement.textContent = response.message;
                        modalDoc.style.display = "none";
                        modalEliminarDoc.style.display = "none";
                        setTimeout(() => {
                            responseElement.textContent = "";
                        }, 5000);
                    } else {
                        responseElement.textContent = `Error: ${response.message}`;
                    }
                });

                // Actualizar la lista de documentos
                await obtenerDocumentos();
            } catch (error) {
                console.error("Error al insertar documento:", error);
                // Mostrar mensaje de error al usuario
                const responseElement = document.getElementById("response");
                responseElement.textContent = `Error: ${error.message}`;
            }
        }
    };

    // Nueva función para actualizar el documento
    const actualizarDocumento = async (event) => {
        event.preventDefault(); // Evitar el envío del formulario por defecto

        // Obtener los valores del formulario
        const codigo_doc = document.getElementById("codigo_doc").value;
        const nombre = document.getElementById("nombre").value;
        const edicion = document.getElementById("edicion").value;
        const fecha = document.getElementById("fecha").value;
        const estado = document.getElementById("estado").value;
        const categoria = document.getElementById("categoriaSelect").value;

        // Verificar si el
        
        try {
            // Verificar si el documento existe en la base de datos
            const documentos = await window.electron.leerTabla('documentos');
            const documento = documentos.find((doc) => doc.codigo_doc === codigo_doc);

            if (!documento) {
                throw new Error("El documento no existe en la base de datos");
            }

            // Actualizar los datos del documento
            const updatedDocumento = {
                codigo_doc,
                nombre,
                edicion,
                fecha,
                documento: documento.documento,
                extension: documento.extension,
                estado,
                categoria
            };

            await window.electron.actualizarRegistro('documentos', 'codigo_doc', codigo_doc, updatedDocumento);

            // Mostrar mensaje de éxito
            const responseElement = document.getElementById("response");
            responseElement.textContent = "Documento actualizado con éxito";
            setTimeout(() => {
                responseElement.textContent = "";
            }, 5000);

            modalDoc.style.display = "none";

            // Actualizar la lista de documentos
            await obtenerDocumentos();
        } catch (error) {
            console.error("Error al actualizar documento:", error);
            // Mostrar mensaje de error al usuario
            const responseElement = document.getElementById("response");
            responseElement.textContent = `Error: ${error.message}`;
        }
    };

    // Agregar un controlador de eventos al formulario
    const form = document.getElementById("formDocumentos");
    form.addEventListener("submit", guardarDocumento);

    // Agregar un controlador de eventos al botón actualizar
    const actualizarDocumentoButton = document.getElementById("btn-actualizarDocumento");
    actualizarDocumentoButton.addEventListener("click", actualizarDocumento);

    // Llama a la función para obtener los documentos al cargar la página
    obtenerDocumentos();
});
