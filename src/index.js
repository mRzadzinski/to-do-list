import './modules/logic.js';
import './modules/DOMmanipulation.js';
import './style.scss';
import { createTaskHTML, addTaskListeners, renderTaskListsHTML } from './modules/DOMmanipulation.js';
import { taskLists, currentList, updateTasksPosition } from './modules/logic';

const addTaskIcon = document.querySelector('#add-task-icon');
const addTaskText = document.querySelector('#add-task-text');

// Render task lists
renderTaskListsHTML(taskLists)
function renderTaskLists() {

}

// Create new task
[addTaskIcon, addTaskText].forEach(element => element.addEventListener('click', () => {
    let newTask = createTaskHTML();
    console.log(newTask)
    updateTasksPosition('plus');
}));