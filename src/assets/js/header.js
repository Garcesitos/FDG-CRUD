// Código para cargar y mostrar el contenido del encabezado
document.addEventListener('DOMContentLoaded', () => {
    const includeElements = document.getElementsByTagName('include');
    Array.prototype.forEach.call(includeElements, (includeElement) => {
        const filePath = includeElement.getAttribute('src');
        fetch(filePath)
            .then(response => response.text())
            .then(html => includeElement.insertAdjacentHTML('afterend', html))
            .catch(error => console.error('Error al cargar el archivo ${filePath}: ${error}'));
    });
});