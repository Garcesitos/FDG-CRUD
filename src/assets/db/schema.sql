/*
    Revisar si guardamos los ficheros en la BD (BLOB), o la ruta del archivo (VARCHAR)
*/

Create database if not exists teyde;

use teyde;

-- TABLAS CREADAS O INTRODUCIDAS EN BBDD

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50),
    correo VARCHAR(100),
    contrasena VARCHAR(50),
    nombre VARCHAR(100),
    apellidos VARCHAR(100),
    id_empleado INT,
    --FOREIGN KEY (id_empleado) REFERENCES empleados(id_empelado)
);

DELIMITER //

CREATE PROCEDURE sp_login(IN p_email VARCHAR(255), IN p_password VARCHAR(255), OUT p_login_success BOOLEAN)
BEGIN
    DECLARE user_count INT;
    SELECT COUNT(*) INTO user_count
    FROM usuarios
    WHERE correo = p_email AND contrasena = p_password;
    SET p_login_success = (user_count > 0);
END //

DELIMITER ;

CREATE TABLE Empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY ,
    DNI CHAR(11) UNIQUE,
    nombre_empleado VARCHAR(100),
    apellidos_empleado VARCHAR(100),
    fecha_nacimiento DATE,
    correo_empleado VARCHAR(100),
    telefono_empleado VARCHAR(20),
    f_antiguedad DATE,
    cotizacion DECIMAL(10, 2),
    n_segSocial INT UNIQUE,
    tipo_contrato VARCHAR(50),
    formacion VARCHAR(100),
    otras_formaciones VARCHAR(255),
    documentos VARCHAR(255), -- Cambiado a VARCHAR para almacenar ubicación del archivo
    num_hps VARCHAR(20),
    f_vigencia_hps DATE DEFAULT NULL, -- Permitir valores nulos
    imagen_empleado VARCHAR(255)
);

CREATE TABLE Procesos (
    id_proceso INT AUTO_INCREMENT PRIMARY KEY ,
    nombre_proceso VARCHAR(255),
    categoria VARCHAR(255),
    descripcion_proceso TEXT,
    capacidad_minima INT
);

CREATE TABLE empleado_proceso (
    num_empleado INT,
    num_proceso INT,
    PRIMARY KEY (num_empleado, num_proceso),
    FOREIGN KEY (num_empleado) REFERENCES Empleados(id_empleado),
    FOREIGN KEY (num_proceso) REFERENCES Procesos(id_proceso)
);


CREATE TABLE Clientes (
    num_cliente INT PRIMARY KEY AUTO_INCREMENT,
    fecha_alta_cliente DATE,
    denominacion_social VARCHAR(255),
    centro_de_trabajo VARCHAR(255),       
    direccion1 VARCHAR(255),
    direccion2 VARCHAR(255),
    direccion3 VARCHAR(255),
    direccion4 VARCHAR(255), 
    CIF VARCHAR(20),
    codigo_postal INT,
    forma_pago varchar(255),
    observaciones_cliente VARCHAR(255)
);

CREATE TABLE Pedidos_clientes (
    num_pedido_cliente INT PRIMARY KEY AUTO_INCREMENT ,
    fecha_pedido DATE,
    total_pedido INT,
    cliente_relacionado INT,
    oferta_relacionada INT,
    direccion_pedido VARCHAR(255),
    FOREIGN KEY (cliente_relacionado) REFERENCES clientes(num_cliente),
    FOREIGN KEY (oferta_relacionada) REFERENCES ofertas(numero_oferta)
);

create table posiciones_pedidas(
    id_posicion_pedida INT PRIMARY KEY AUTO_INCREMENT ,
    posicionP INT,
    articulo_pedido VARCHAR(255),
    denominacionP VARCHAR(255),
    denominacion_pedido VARCHAR(255),
    precio_unitario INT,
    cantidad INT,
    plazo_de_entrega DATE,
    completado ENUM('Si', 'No'),
    rcps_aplicable VARCHAR(255),
    precio_total INT,
    pedidos_clientes_relacionado INT,
    numero_oferta_relacionada INT,
    numero_posicion_relacionada INT,
    FOREIGN KEY (numero_oferta_relacionada) REFERENCES ofertas(numero_oferta),
    FOREIGN KEY (numero_posicion_relacionada) REFERENCES posiciones(id_posicion),
    FOREIGN KEY (pedidos_clientes_relacionado) REFERENCES Pedidos_clientes(num_pedido_cliente)
);

--Logica para numero_ofertas formato: OF-7XXX-AA -------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE ofertas (
    numero_oferta INT AUTO_INCREMENT PRIMARY KEY ,
    fecha DATE,
    num_cliente INT,
    atencion_de VARCHAR(100),
    forma_de_pago VARCHAR(50),
    plazo_de_entrega VARCHAR(50),
    validez_oferta INT,
    oferta_aceptada ENUM('Si', 'No'),
    FOREIGN KEY (num_cliente) REFERENCES Clientes(num_cliente)

);

CREATE TABLE posiciones (
    id_posicion INT AUTO_INCREMENT PRIMARY KEY ,
    posicion INT,
    numero_oferta VARCHAR(12),
    numero_articulo INT,
    pnumber VARCHAR(50),
    denominacion VARCHAR(100), 
    cantidad INT,
    precio_unitario DECIMAL(10, 2),
    posicion_aceptada ENUM('Si', 'No'),
    FOREIGN KEY (numero_oferta) REFERENCES ofertas(numero_oferta),
    FOREIGN KEY (numero_articulo) REFERENCES articulos(num_articulo_interno)

);

CREATE TABLE articulos (
    num_articulo_interno INT AUTO_INCREMENT PRIMARY KEY,
    pn_articulo VARCHAR(255), 
    edicion_revision VARCHAR(50),
    denominacion VARCHAR(255),
    precio_unitario DECIMAL(10, 2),
    observaciones TEXT,
    num_proveedor INT,
    FOREIGN KEY (num_proveedor) REFERENCES proveedores(num_proveedor)
);

CREATE TABLE Proveedores (
    num_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    fecha_alta DATE,
    nombre_proveedor VARCHAR(100),
    actividad_proveedor TEXT,
    estado_proveedor ENUM('alta', 'baja'),
    tipo_proveedor ENUM('principal', 'secundario'),
    observaciones_proveedor TEXT,

    certificacion_proveedor INT CHECK (certificacion_proveedor >= 0 AND certificacion_proveedor <= 2),
    rapidez_servicio INT CHECK (rapidez_servicio >= 0 AND rapidez_servicio <= 4),
    condiciones_entrega INT CHECK (condiciones_entrega >= 0 AND condiciones_entrega <= 4),
    
    num_certificado VARCHAR(50),
    fecha_certificado DATE,
    certificado_proveedor BLOB,

    acepta_c_generales ENUM('si','no'),
    riesgo_p_entrega INT CHECK (riesgo_p_entrega >= -1 AND riesgo_p_entrega <= 0),
    no_conform INT CHECK (no_conform >= -4 AND no_conform <= 0),
    riesgo_tecnico INT CHECK (riesgo_tecnico >= -1 AND riesgo_tecnico <= 0),
    riesgo_economico INT CHECK (riesgo_economico >= -1 AND riesgo_economico <= 0),
    
    total_proveedor DECIMAL(10, 2) CHECK (total_proveedor >= 0 AND total_proveedor <= 10),
    valoracion_proveedor ENUM('Muy Bueno', 'Bueno', 'Medio', 'Malo'),
    calificacion_proveedor CHAR(1) CHECK (calificacion_proveedor IN ('A', 'B', 'C', 'D'))
);
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


-- DOCUMENTS
CREATE TABLE Documentos (
    codigo_doc VARCHAR(10) PRIMARY KEY, -- Generado manualmente
    nombre VARCHAR(255),
    edicion INT,
    fecha DATE,
    documento VARCHAR(255),         -- o ruta del archivo
    estado ENUM('Alta', 'Baja'),
    extension VARCHAR(10) DEFAULT NULL,
    categoria VARCHAR(20)
);

CREATE TABLE registro_entrada_almacen (
  id_entrada int(11) NOT NULL AUTO_INCREMENT,
  numero_articulo_entrada int(11) NOT NULL,
  denominacion_entrada varchar(255) DEFAULT NULL,
  fecha_entrada date DEFAULT NULL,
  cantidad_entrada int(11) DEFAULT NULL,
  pedido_proveedor int(11) DEFAULT NULL,
  num_proveedor int(11) NOT NULL,
  tipo_entrada enum('COMERCIAL','TORNILLERIA','SEMIELABORADO','TERMINADO') DEFAULT NULL,
  observaciones_entrada text DEFAULT NULL,
  estanteria_entrada char(1) DEFAULT NULL,
  nivel_entrada tinyint(4) DEFAULT NULL,
  zona_palet_entrada tinyint(4) DEFAULT NULL
) ;

ALTER TABLE registro_entrada_almacen
  ADD PRIMARY KEY (id_entrada),
  ADD KEY numero_articulo_entrada (numero_articulo_entrada),
  ADD KEY num_proveedor (num_proveedor);

  ALTER TABLE registro_entrada_almacen
  ADD CONSTRAINT registro_entrada_almacen_ibfk_1 FOREIGN KEY (numero_articulo_entrada) REFERENCES articulos (num_articulo_interno),
  ADD CONSTRAINT registro_entrada_almacen_ibfk_2 FOREIGN KEY (num_proveedor) REFERENCES proveedores (num_proveedor);
COMMIT;



CREATE TABLE registro_salida_almacen (
  id_salida int(11) NOT NULL AUTO_INCREMENT,
  numero_articulo_salida int(11) NOT NULL,
  denominacion_salida varchar(255) DEFAULT NULL,
  fecha_salida date DEFAULT NULL,
  cantidad_salida int(11) DEFAULT NULL,
  pedido_cliente int(11) NOT NULL,
  num_cliente int(11) NOT NULL,
  responsable_cliente varchar(255) DEFAULT NULL,
  tipo_salida enum('COMERCIAL','TORNILLERIA','SEMIELABORADO','TERMINADO') DEFAULT NULL,
  observaciones_salida text DEFAULT NULL,
  estanteria_salida char(1) DEFAULT NULL,
  nivel_salida tinyint(4) DEFAULT NULL,
  zona_palet_salida tinyint(4) DEFAULT NULL
) ;
ALTER TABLE registro_salida_almacen
  ADD PRIMARY KEY (id_salida),
  ADD KEY numero_articulo_salida (numero_articulo_salida),
  ADD KEY pedido_cliente (pedido_cliente),
  ADD KEY num_cliente (num_cliente);

  ALTER TABLE registro_salida_almacen
  ADD CONSTRAINT registro_salida_almacen_ibfk_1 FOREIGN KEY (numero_articulo_salida) REFERENCES articulos (num_articulo_interno),
  ADD CONSTRAINT registro_salida_almacen_ibfk_2 FOREIGN KEY (pedido_cliente) REFERENCES pedidos_clientes (num_pedido_cliente),
  ADD CONSTRAINT registro_salida_almacen_ibfk_3 FOREIGN KEY (num_cliente) REFERENCES clientes (num_cliente);
COMMIT;



CREATE TABLE almacen (
  id_almacen int(11) NOT NULL AUTO_INCREMENT,
  numero_articulo int(11) DEFAULT NULL,
  denominacion varchar(255) DEFAULT NULL,
  cantidad int(11) DEFAULT NULL,
  tipo_producto enum('COMERCIAL','TORNILLERIA','SEMIELABORADO','TERMINADO') DEFAULT NULL,
  observaciones text DEFAULT NULL,
  estanteria char(1) DEFAULT NULL,
  nivel tinyint(4) DEFAULT NULL,
  zona_palet tinyint(4) DEFAULT NULL,
  id_registro_entrada int(11) DEFAULT NULL,
  id_registro_salida int(11) DEFAULT NULL
) ;

ALTER TABLE almacen
  ADD PRIMARY KEY (id_almacen),
  ADD KEY numero_articulo (numero_articulo),
  ADD KEY id_registro_entrada (id_registro_entrada),
  ADD KEY id_registro_salida (id_registro_salida);

ALTER TABLE almacen
  ADD CONSTRAINT almacen_ibfk_1 FOREIGN KEY (numero_articulo) REFERENCES articulos (num_articulo_interno),
  ADD CONSTRAINT almacen_ibfk_2 FOREIGN KEY (id_registro_entrada) REFERENCES registro_entrada_almacen (id_entrada),
  ADD CONSTRAINT almacen_ibfk_3 FOREIGN KEY (id_registro_salida) REFERENCES registro_salida_almacen (id_salida);
COMMIT;




-- TABLAS NO INTRODUCIDAS / USADAS EN BBDD





CREATE TABLE Proyectos (
    num_proyecto VARCHAR(255) PRIMARY KEY,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_final DATE
);

CREATE TABLE Albaranes_y_certificados (
    num_albaran VARCHAR(255) PRIMARY KEY,
    fecha DATE,
    observaciones TEXT
);

CREATE TABLE Certificados (
    num_certificado VARCHAR(255) PRIMARY KEY,
    fecha DATE,
    observaciones TEXT,
);


CREATE TABLE Actividades_Operaciones (
    num_operacion VARCHAR(50) PRIMARY KEY,
    tipo_operacion VARCHAR(255),
    descripcion TEXT
);

CREATE TABLE Hojas_de_Ruta (
    num_hoja_de_ruta VARCHAR(50) PRIMARY KEY,
    tipo_operacion VARCHAR(255),
    tipo_inspeccion VARCHAR(255),
    cantidad INT,
    fecha_entrada DATE
);