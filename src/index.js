import './modules/logic.js';
import './modules/DOMmanipulation.js';
import './style.scss';
import { createTaskHTML, addTaskListeners, renderTaskLists, renderTasks } from './modules/DOMmanipulation.js';
import { taskLists, currentList, updateTasksPosition } from './modules/logic';

const addTaskIcon = document.querySelector('#add-task-icon');
const addTaskText = document.querySelector('#add-task-text');

// Render task lists
renderTaskLists(taskLists, currentList);
renderTasks(currentList);

// Create new task
[addTaskIcon, addTaskText].forEach(element => element.addEventListener('click', () => {
    let newTask = createTaskHTML();
    updateTasksPosition('plus');
}));

