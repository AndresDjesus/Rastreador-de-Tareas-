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