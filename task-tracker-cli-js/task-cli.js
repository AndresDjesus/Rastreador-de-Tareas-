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


// Función principal para manejar los comandos
function main() {
    if (!COMMAND) {
        showHelp();
        return;
    }

    // Nota: Aquí solo estamos mostrando el comando. 
    // La lógica real se implementará en los Pasos 2 a 6.

    switch (COMMAND) {
        case 'add':
            // Temporal: Se reemplazará por addTask(ARGS[0]) en el Paso 3.
            console.log(`Comando ADD con descripción: ${ARGS[0]}`);
            break;
        case 'list':
            // Temporal: Se reemplazará por listTasks(ARGS[0]) en el Paso 4.
            console.log(`Comando LIST con estado: ${ARGS[0] || 'all'}`);
            break;
        case 'update':
        case 'delete':
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