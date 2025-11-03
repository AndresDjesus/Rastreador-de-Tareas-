#!/usr/bin/env node

// Módulos nativos
const fs = require('fs');
const path = require('path');

// Archivo donde se guardarán las tareas
const TASK_FILE = path.join(process.cwd(), 'tasks.json');
// process.argv[0] es el ejecutable de Node.js
// process.argv[1] es el path del script (task-cli.js)
const COMMAND = process.argv[2]; // El tercer elemento es el comando (add, list, etc.)
const ARGS = process.argv.slice(3); // El resto son los argumentos de ese comando

/**
 * Carga todas las tareas del archivo JSON. Crea el archivo si no existe o si está vacío.
 * @returns {Array} La lista de tareas, o un array vacío si no hay tareas o hay un error.
 */
function loadTasks() {
    try {
        // 1. Verifica si el archivo existe o está vacío (tamaño 0)
        if (!fs.existsSync(TASK_FILE) || fs.statSync(TASK_FILE).size === 0) {
            return [];
        }
        
        // 2. Lee el contenido del archivo como texto
        const data = fs.readFileSync(TASK_FILE, 'utf8');
        
        // 3. Convierte el texto JSON a un objeto JavaScript (Array de tareas)
        return JSON.parse(data);
    } catch (e) {
        // Si el error es que el archivo no existe (ENOENT), regresa un array vacío.
        if (e.code === 'ENOENT') {
            return [];
        }
        // Manejo de JSON corrupto
        console.error("❌ Error al leer o parsear tasks.json. Archivo corrupto. Se inicializará vacío.", e.message);
        return [];
    }
}

/**
 * Guarda la lista de tareas en el archivo JSON.
 * @param {Array} tasks La lista de tareas a guardar.
 */
function saveTasks(tasks) {
    try {
        // Convierte el Array de JavaScript a una cadena JSON con indentación (4 espacios)
        const jsonString = JSON.stringify(tasks, null, 4);
        
        // Escribe la cadena en el archivo.
        fs.writeFileSync(TASK_FILE, jsonString, 'utf8');
    } catch (e) {
        console.error("❌ Error al guardar las tareas en tasks.json:", e.message);
    }
}

/**
 * Calcula el siguiente ID único para una nueva tarea.
 * Se basa en el ID más alto existente para asegurar unicidad.
 * @param {Array} tasks La lista de tareas actual.
 * @returns {number} El nuevo ID disponible.
 */
function getNextId(tasks) {
    if (tasks.length === 0) {
        return 1;
    }
    
    // Encuentra el ID más grande usando reduce y le suma 1.
    const maxId = tasks.reduce((max, task) => Math.max(max, task.id), 0);
    return maxId + 1;
}

/**
 * Agrega una nueva tarea a la lista.
 * @param {string} description La descripción de la nueva tarea.
 */
function addTask(description) {
    // 1. Validar que se haya proporcionado una descripción
    if (!description) {
        console.error("❌ Error: Se requiere una descripción para agregar una tarea.");
        return;
    }

    // 2. Cargar las tareas existentes
    const tasks = loadTasks();
    
    // 3. Generar el nuevo ID y la marca de tiempo
    const newId = getNextId(tasks);
    const now = new Date().toISOString(); // Formato ISO para createdAt y updatedAt

    // 4. Crear el objeto de la nueva tarea con todas las propiedades requeridas
    const newTask = {
        id: newId,
        description: description,
        status: "todo", // El estado inicial siempre es 'todo'
        createdAt: now,
        updatedAt: now // Al crearla, es igual a createdAt
    };

    // 5. Agregar la nueva tarea a la lista
    tasks.push(newTask);
    
    // 6. Guardar la lista actualizada
    saveTasks(tasks);
    
    // 7. Mostrar la confirmación al usuario
    console.log(`✅ Tarea agregada exitosamente (ID: ${newId}).`);
}

/**
 * Lista y opcionalmente filtra las tareas por estado.
 * @param {string} statusFilter El estado por el cual filtrar (todo, in-progress, done) o 'all'.
 */
function listTasks(statusFilter) {
    const tasks = loadTasks();

    if (tasks.length === 0) {
        console.log("No hay tareas registradas.");
        return;
    }

    const filter = (statusFilter || 'all').toLowerCase();
    let tasksToDisplay = tasks;

    // 1. Lógica de Filtrado
    if (filter !== 'all') {
        const validStatuses = ['todo', 'in-progress', 'done'];
        
        if (!validStatuses.includes(filter)) {
            console.error(`❌ Error: Estado de filtro inválido "${filter}". Use: todo, in-progress, o done.`);
            return;
        }
        
        // Filtra el array de tareas para mostrar solo las que coinciden con el estado
        tasksToDisplay = tasks.filter(t => t.status === filter);
        
        if (tasksToDisplay.length === 0) {
            console.log(`No hay tareas con estado '${filter}'.`);
            return;
        }
    }

    // 2. Impresión de Tareas
    console.log("\n--- Lista de Tareas ---");
    
    tasksToDisplay.forEach(t => {
        // Asignar un símbolo basado en el estado para mejor visualización
        const statusSymbol = {
            'todo': '☐',
            'in-progress': '▶',
            'done': '✔'
        }[t.status] || '?';

        // Usamos el método padEnd para alinear la salida y que se vea organizada
        console.log(`[${statusSymbol}] ID: ${String(t.id).padEnd(3)} | Estado: ${t.status.padEnd(12)} | ${t.description}`);
    });
    console.log("-----------------------\n");
}

/**
 * Actualiza la descripción de una tarea.
 * @param {string} id El ID de la tarea a actualizar.
 * @param {string} newDescription La nueva descripción.
 */
function updateTask(id, newDescription) {
    const tasks = loadTasks();
    const taskId = parseInt(id);

    // 1. Validación de entrada
    if (isNaN(taskId) || !newDescription) {
        console.error("❌ Uso incorrecto. Uso: task-cli update ID \"Nueva Descripción\"");
        return;
    }

    // 2. Buscar la tarea por ID
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        console.error(`❌ Error: No se encontró la tarea con ID ${taskId}.`);
        return;
    }

    // 3. Actualizar propiedades
    tasks[taskIndex].description = newDescription;
    tasks[taskIndex].updatedAt = new Date().toISOString(); // Actualizar la marca de tiempo
    
    // 4. Guardar y confirmar
    saveTasks(tasks);
    console.log(`✅ Tarea ID ${taskId} actualizada exitosamente.`);
}

/**
 * Elimina una tarea por su ID.
 * @param {string} id El ID de la tarea a eliminar.
 */
function deleteTask(id) {
    const tasks = loadTasks();
    const taskId = parseInt(id);

    // 1. Validación de entrada
    if (isNaN(taskId)) {
        console.error("❌ Uso incorrecto. Uso: task-cli delete ID");
        return;
    }

    const initialLength = tasks.length;
    
    // 2. Filtrar el array para crear una nueva lista sin la tarea a eliminar
    const updatedTasks = tasks.filter(t => t.id !== taskId);

    // 3. Verificar si se eliminó alguna tarea
    if (updatedTasks.length === initialLength) {
        console.error(`❌ Error: No se encontró la tarea con ID ${taskId}.`);
        return;
    }

    // 4. Guardar y confirmar
    saveTasks(updatedTasks);
    console.log(`✅ Tarea ID ${taskId} eliminada exitosamente.`);
}

// Función principal para manejar los comandos
function main() {
    if (!COMMAND) {
        showHelp();
        return;
    }

    switch (COMMAND) {
        case 'add':
            // ¡Llamada a la función real!
            addTask(ARGS[0]); // ARGS[0] contiene la descripción
            break;
        case 'list':
            case 'list':
            // ¡Llamada a la función real!
            listTasks(ARGS[0]); // ARGS[0] puede ser 'todo', 'done', o undefined (lo que resulta en 'all')
            break;
        case 'update':
            // ARGS[0] es el ID, ARGS[1] es la descripción
            updateTask(ARGS[0], ARGS[1]);
            break;
        case 'delete':
            // ARGS[0] es el ID
            deleteTask(ARGS[0]);
            break;
        case 'mark-in-progress':
        case 'mark-done':
            // Temporal: Se reemplazará por funciones reales en Pasos 5 y 6.
            console.log(`Comando ${COMMAND} en desarrollo...`);
            break;
        default:
            console.error(`❌ Error: Comando desconocido "${COMMAND}".`);
            showHelp();
    }
}

/**
 * Muestra la guía de uso de la CLI.
 */
function showHelp() {
    console.log(`
Task Tracker CLI
Uso: ./task-cli.js <comando> [argumentos]

Comandos disponibles:
  add "Descripción"           Agrega una nueva tarea.
  update ID "Nueva Desc."     Actualiza la descripción de una tarea por ID.
  delete ID                   Elimina una tarea por ID.
  mark-in-progress ID         Marca una tarea como en curso.
  mark-done ID                Marca una tarea como terminada.
  list [all|todo|in-progress|done] Lista las tareas, filtradas por estado (opcional).

Para usar, asegúrate de haber dado permisos de ejecución:
$ chmod +x task-cli.js
    `);
}

// Inicia la aplicación
main();

// ----------------------------------------------------------------------
// Importante: Las funciones de gestión de archivos (loadTasks, saveTasks)
// y las funciones de comandos reales (addTask, listTasks, etc.)
// DEBEN agregarse en los siguientes pasos (2 al 6).
// ----------------------------------------------------------------------