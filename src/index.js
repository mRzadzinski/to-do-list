import './modules/logic.js';
import './modules/DOMmanipulation.js';
import './style.scss';
import { createTaskHTML,  } from './modules/DOMmanipulation.js';
import { updateTasksPosition } from './modules/logic';

const addTaskIcon = document.querySelector('#add-task-icon');
const addTaskText = document.querySelector('#add-task-text');

// Create new task
[addTaskIcon, addTaskText].forEach(element => element.addEventListener('click', () => {
    let newTask = createTaskHTML();
    updateTasksPosition('plus');
}));