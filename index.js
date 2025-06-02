const inquirer = require('inquirer');
const chalk = require('chalk');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ tasks: [] }).write();


async function addTask() {
    const { task } = await inquirer.prompt([
        {
            type: 'input',
            name: 'task',
            message: chalk.blue('¿Qué tarea quieres agregar?'),
            validate: input => input.trim() !== '' || 'La tarea no puede estar vacía.'
        }
    ]);
    db.get('tasks').push({ id: Date.now(), description: task, completed: false }).write();
    console.log(chalk.green('¡Tarea agregada exitosamente!'));
}

function listTasks() {
    const tasks = db.get('tasks').value();
    if (tasks.length === 0) {
        console.log(chalk.yellow('No hay tareas pendientes. ¡A descansar!'));
        return;
    }
    console.log(chalk.bold('\n--- Tus Tareas ---'));
    tasks.forEach((task, index) => {
        const status = task.completed ? chalk.green('✔ Completada') : chalk.red('✖ Pendiente');
        console.log(`${index + 1}. ${task.description} - ${status}`);
    });
    console.log(chalk.bold('-------------------\n'));
}

async function completeTask() {
    const tasks = db.get('tasks').value();
    if (tasks.length === 0) {
        console.log(chalk.yellow('No hay tareas para marcar como completadas.'));
        return;
    }

    const choices = tasks.map((task, index) => ({
        name: `${index + 1}. ${task.description} ${task.completed ? chalk.green('(Completada)') : chalk.red('(Pendiente)')}`,
        value: task.id
    }));

    const { taskId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'taskId',
            message: chalk.blue('¿Qué tarea quieres marcar como completada?'),
            choices: choices
        }
    ]);

    db.get('tasks')
      .find({ id: taskId })
      .assign({ completed: true })
      .write();

    console.log(chalk.green('¡Tarea marcada como completada!'));
}

async function deleteTask() {
    const tasks = db.get('tasks').value();
    if (tasks.length === 0) {
        console.log(chalk.yellow('No hay tareas para eliminar.'));
        return;
    }

    const choices = tasks.map((task, index) => ({
        name: `${index + 1}. ${task.description} ${task.completed ? chalk.green('(Completada)') : chalk.red('(Pendiente)')}`,
        value: task.id
    }));

    const { taskId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'taskId',
            message: chalk.blue('¿Qué tarea quieres eliminar?'),
            choices: choices
        }
    ]);

    db.get('tasks')
      .remove({ id: taskId })
      .write();

    console.log(chalk.green('¡Tarea eliminada exitosamente!'));
}

async function main() {
    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: chalk.magenta('¿Qué quieres hacer?'),
                choices: [
                    { name: '1. Agregar Tarea', value: 'add' },
                    { name: '2. Listar Tareas', value: 'list' },
                    { name: '3. Marcar Tarea como Completada', value: 'complete' },
                    { name: '4. Eliminar Tarea', value: 'delete' },
                    { name: '5. Salir', value: 'exit' }
                ]
            }
        ]);

        switch (action) {
            case 'add':
                await addTask();
                break;
            case 'list':
                listTasks();
                break;
            case 'complete':
                await completeTask();
                break;
            case 'delete':
                await deleteTask();
                break;
            case 'exit':
                console.log(chalk.cyan('¡Hasta luego!'));
                process.exit(0); 
        }
    }
}


main();