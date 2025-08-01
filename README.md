# Studio Front - Sistema de Gestión Académica

## Descripción
Frontend del sistema de gestión académica desarrollado con React. Permite la administración de estudiantes, profesores, calificaciones, notificaciones y más funcionalidades académicas.

## 🚀 Tecnologías Utilizadas

### Framework Principal
- **React** 19.0.0 - Biblioteca principal para construir la interfaz de usuario
- **React Router DOM** 7.2.0 - Navegación y enrutamiento
- **React Scripts** 5.0.1 - Herramientas de desarrollo y construcción

### UI/UX
- **React Bootstrap** 2.10.9 - Componentes de interfaz
- **Bootstrap** 5.3.3 - Framework CSS
- **Bootstrap Icons** 1.13.1 - Iconografía
- **FontAwesome** 6.7.2 - Iconos adicionales
- **Antd** 5.24.2 - Biblioteca de componentes UI adicional

### Visualización de Datos
- **ApexCharts** 4.5.0 - Gráficos interactivos
- **React ApexCharts** 1.7.0 - Integración con React
- **Chart.js** - Gráficos adicionales
- **React CountUp** 6.5.3 - Animaciones numéricas

### Calendario y Fechas
- **FullCalendar** 6.1.15 - Calendario completo
- **React Calendar** 4.8.0 - Selector de fechas
- **React DatePicker** 4.25.0 - Selector de fechas avanzado

### Formularios y Validación
- **React Hook Form** - Manejo de formularios
- **React Select** 5.10.0 - Selectores avanzados
- **React Input Mask** 2.0.4 - Máscaras de entrada

### HTTP y APIs
- **Axios** 1.9.0 - Cliente HTTP para APIs

### Notificaciones y Alertas
- **SweetAlert2** 11.22.0 - Alertas personalizadas
- **Alertify.js** 1.14.0 - Notificaciones

### Editores
- **React Simple WYSIWYG** 3.2.0 - Editor de texto enriquecido

## 📁 Estructura del Proyecto

```
studio-front-master/
├── public/
│   ├── favicon.png
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── css/          # Estilos CSS personalizados
│   │   ├── fonts/        # Fuentes tipográficas
│   │   ├── img/          # Imágenes y recursos gráficos
│   │   └── json/         # Datos JSON estáticos
│   ├── components/
│   │   ├── Header.jsx    # Componente de cabecera
│   │   ├── Sidebar.jsx   # Menú lateral de navegación
│   │   ├── Pagination.jsx # Componente de paginación
│   │   ├── Profile.jsx   # Perfil de usuario
│   │   ├── CustomStyle.jsx
│   │   ├── TextEditor.jsx
│   │   ├── accounts/     # Componentes de cuentas
│   │   ├── activity/     # Componentes de actividades
│   │   ├── Dashboard/    # Componentes del dashboard
│   │   ├── department/   # Gestión de departamentos
│   │   ├── doctor/       # Gestión de doctores
│   │   ├── Forms/        # Componentes de formularios
│   │   ├── patients/     # Gestión de pacientes
│   │   ├── staff/        # Gestión de personal
│   │   ├── Tables/       # Componentes de tablas
│   │   └── Ui_Elements/  # Elementos de interfaz
│   ├── config/
│   │   ├── api.config.js # Configuración de APIs
│   │   └── permissions.js # Configuración de permisos
│   ├── pages/
│   │   ├── admin/        # Páginas de administración
│   │   ├── auth/         # Autenticación (login, registro)
│   │   ├── common/       # Páginas comunes
│   │   ├── directors/    # Páginas para directores
│   │   ├── enrollments/  # Gestión de inscripciones
│   │   ├── grade/        # Gestión de calificaciones
│   │   ├── notification/ # Gestión de notificaciones
│   │   ├── principal/    # Páginas principales
│   │   ├── students/     # Gestión de estudiantes
│   │   └── teacher/      # Gestión de profesores
│   ├── services/
│   │   ├── classroomService.js       # Servicio de aulas
│   │   ├── classroomStudentService.js # Relación aula-estudiante
│   │   ├── enrollmentService.js      # Servicio de inscripciones
│   │   ├── gradeService.js          # Servicio de calificaciones
│   │   ├── institutionService.js    # Servicio de instituciones
│   │   ├── notificationService.js   # Servicio de notificaciones
│   │   ├── studentService.js        # Servicio de estudiantes
│   │   ├── teacherService.js        # Servicio de profesores
│   │   ├── userService.js           # Servicio de usuarios
│   │   └── index.js                 # Exportaciones de servicios
│   ├── types/
│   │   └── notification.types.js    # Tipos y constantes de notificaciones
│   ├── utils/
│   │   └── [utilidades diversas]    # Funciones utilitarias
│   ├── App.js           # Componente principal
│   ├── appcontainer.jsx # Contenedor de la aplicación
│   ├── approuter.jsx    # Configuración de rutas
│   └── index.js         # Punto de entrada
├── build/               # Archivos compilados para producción
├── package.json         # Dependencias y scripts
├── README.md           # Documentación del proyecto
└── start-dev.bat       # Script de inicio para desarrollo
```

## 🌐 APIs y Endpoints Utilizados

### API Principal de Estudiantes
**Base URL:** `https://ms.students.machashop.top/api/v1`

#### Estudiantes
- `GET /students` - Obtener todos los estudiantes
- `POST /students` - Crear nuevo estudiante
- `GET /students/{id}` - Obtener estudiante por ID
- `PUT /students/{id}` - Actualizar estudiante
- `DELETE /students/{id}` - Eliminar estudiante

#### Aulas y Clases
- `GET /classrooms` - Obtener aulas
- `GET /classroom-students` - Relación estudiante-aula
- `POST /classroom-students` - Asignar estudiante a aula

#### Instituciones
- `GET /institutions` - Obtener instituciones
- `POST /institutions` - Crear institución

#### Profesores
- `GET /teachers` - Obtener profesores
- `POST /teachers` - Crear profesor
- `PUT /teachers/{id}` - Actualizar profesor

#### Usuarios
- `GET /users` - Gestión de usuarios del sistema
- `POST /users` - Crear usuario

### API de Gestión de Calificaciones
**Base URL:** `https://ms.grademanagement.machashop.top`

#### Calificaciones
- `GET /grades` - Obtener calificaciones
- `POST /grades` - Crear calificación
- `PUT /grades/{id}` - Actualizar calificación
- `DELETE /grades/{id}` - Eliminar calificación

#### Notificaciones
- `GET /notifications` - Obtener todas las notificaciones
- `GET /notifications/inactive` - Obtener notificaciones eliminadas
- `POST /notifications` - Crear nueva notificación
- `PUT /notifications/{id}` - Actualizar notificación
- `DELETE /notifications/{id}` - Eliminar notificación (soft delete)
- `PUT /notifications/{id}/restore` - Restaurar notificación eliminada
- `PUT /notifications/{id}/resend` - Reenviar notificación
- `PUT /notifications/mark-as-read` - Marcar como leída (individual)
- `PUT /notifications/mark-multiple-as-read` - Marcar múltiples como leídas

## ⚙️ Configuración y Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Instalación
1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd studio-front-master
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno (si es necesario)
```bash
# Crear archivo .env en la raíz del proyecto
REACT_APP_API_URL=https://ms.students.machashop.top/api/v1
REACT_APP_GRADE_API_URL=https://ms.grademanagement.machashop.top
```

### Ejecución

#### Desarrollo
```bash
npm start
# o usar el script proporcionado
start-dev.bat
```

#### Construcción para producción
```bash
npm run build
```

#### Pruebas
```bash
npm test
```

#### Linting
```bash
npm run lint
npm run lint:fix
```

## 🔧 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm test` - Ejecuta las pruebas
- `npm run lint` - Ejecuta el linter
- `npm run lint:fix` - Corrige automáticamente errores de linting

## 🎯 Características Principales

### Gestión de Estudiantes
- Registro y edición de información estudiantil
- Visualización de listas con filtros y búsqueda
- Asignación a aulas y clases

### Gestión de Profesores
- Administración de personal docente
- Asignación de materias y horarios

### Sistema de Calificaciones
- Registro de notas y evaluaciones
- Reportes de rendimiento académico
- Estadísticas y gráficos

### Sistema de Notificaciones
- Envío de notificaciones a estudiantes y profesores
- Gestión de plantillas de notificación
- Notificaciones masivas
- Historial y seguimiento de notificaciones

### Dashboard y Reportes
- Visualización de datos con gráficos interactivos
- Estadísticas en tiempo real
- Reportes exportables

