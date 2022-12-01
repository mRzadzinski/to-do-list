import circleIcon from '../img/circle-icon.png';
import parseISO from 'date-fns/parseISO';
import { taskLists, currentList, setCurrentList, deleteTask, toggleCompletedStatus, createDefaultList, sortTasks, moveTask, handleDropPosition, getLastTaskID, saveToLocalStorage } from './logic';

let circleElements = document.querySelectorAll('.circle-icon');
circleElements.forEach(element =>  { element.src = circleIcon });

let currentTaskHTML;
let currentTaskID;
let moveTaskButtons;

const dateTimeHandler = (() => {
    let currentPicker;
    let currentDateValue;
    
    addDateListeners();
    function addDateListeners() {
        const timePickers = document.querySelectorAll('.time-picker');
        const taskDateDivs = document.querySelectorAll('.task-date');

        taskDateDivs.forEach(div => {
            div.addEventListener('click', () => {
                timePickers.forEach(picker => {
                    if (div.contains(picker)) {
                        picker.showPicker();
                        currentPicker = picker;
                        currentDateValue = currentPicker.previousElementSibling;
                    }
                })
            });
            div.addEventListener('change', () => convertDate(currentPicker.value, currentDateValue));
            div.addEventListener('change', toggleDate);
        });
    }

    function convertDate(date, destination) {
        let dateTimeArray = parseISO(date).toString().split(' ');
        let time = new Date(date).toLocaleTimeString('en', {
            timeStyle: 'short', 
            hour12: true
        });
        let dateTime = `${dateTimeArray[0]}, ${dateTimeArray[1]} ${dateTimeArray[2]}, ${time}`;

        // Determine which task to update
        let myTaskID = destination.parentNode.parentNode.dataset.id;
        let myTask;
        for (const task in currentList.tasks) {
            if (currentList.tasks[task].id == myTaskID) {
                myTask = currentList.tasks[task];
            } 
        }
        myTask.dateTime = date;
        saveToLocalStorage();

        if (dateTime.includes('Invalid')) {
            destination.innerHTML = 'Date / time';
        } else {
            destination.innerHTML = dateTime;
        }
    }

    toggleDate();
    function toggleDate() {
        const dateValues = document.querySelectorAll('.date-value');

        dateValues.forEach(value => {
            if (value.innerHTML === 'Date / time' 
                && !value.parentNode.parentNode.classList.contains('task-clicked')) {
                    value.parentNode.classList.add('hidden')
            } else {
                value.parentNode.classList.remove('hidden');
            }
        });
    }

    return {
        addDateListeners, toggleDate, convertDate
    };

})();



const textInputHandler = (() => {

    addTextAreasListeners();
    function addTextAreasListeners() {
        const textAreas = document.getElementsByTagName('textarea');

        for (let i = 0; i < textAreas.length; i++) {
            let height;
    
            if (textAreas[i].scrollHeight == 0) {
                height = 'auto';
            } else {
                height = textAreas[i].scrollHeight;
            }
            textAreas[i].setAttribute('style', 'height:' + height + 'px;overflow-y:hidden;');
            textAreas[i].addEventListener('input', updateTextAreas);
            textAreas[i].addEventListener('input', () => {
                // Determine task id
                let myTaskID;
                let dataSrc;
                if (textAreas[i].parentNode.classList.contains('task-content')) {
                    myTaskID = textAreas[i].parentNode.parentNode.parentNode.dataset.id;
                    dataSrc = 'task-content';
                } else if (textAreas[i].parentNode.classList.contains('task-details')) {
                    myTaskID = textAreas[i].parentNode.parentNode.dataset.id;
                    dataSrc = 'task-details';
                }
                // Determine which task to update
                let myTask;
                for (const task in currentList.tasks) {
                    if (currentList.tasks[task].id == myTaskID) {
                        myTask = currentList.tasks[task];
                    } 
                }
                // Update task data
                if (dataSrc === 'task-content') {
                    myTask.name = textAreas[i].value;
                } else if (dataSrc === 'task-details') {
                    myTask.details = textAreas[i].value;
                }
                saveToLocalStorage();

                // Update HTML
                textAreas[i].innerHTML = textAreas[i].value;
                textAreas[i].previousElementSibling.innerHTML = textAreas[i].value;
            });
        }
    }

    function updateTextAreas() {
        this.style.height = 0;
        this.style.height = (this.scrollHeight) + "px";
    }

    return { addTextAreasListeners };
})();

const expandElementHandler = (() => {
    const listNameHeader = document.querySelector('#list-name');
    const dropdowns = document.querySelectorAll('.dropdown');
    const taskMenu = document.querySelector('.dropdown-task-menu');
    const completedButton = document.querySelector('.completed-button');
    const completedList = document.querySelector('.completed-list');
    const arrowRight = document.querySelector('#arrow-right');
    const mainMenuBtn = document.querySelector('#main-menu-btn');
    let lastUsedTaskMenuBtn;

    // Add listeners for dropdown menus
    listNameHeader.onclick = () => expandElement(chooseDropdown('dropdown-task-list'));
    mainMenuBtn.onclick = () => expandElement(chooseDropdown('dropdown-menu'));
    completedButton.onclick = () => expandElement(completedList);
    addTaskMenuListeners();
    function addTaskMenuListeners() {
        const taskMenuButtons = document.querySelectorAll('.task-menu-button');

        taskMenuButtons.forEach(button => button.addEventListener('click', (event) => {
            // Bind menu to clicked task
            lastUsedTaskMenuBtn = button;
            currentTaskHTML = button.parentNode.parentNode.parentNode;
            currentTaskID = currentTaskHTML.dataset.id;

            // Set task menu position
            taskMenu.style.top = lastUsedTaskMenuBtn.getBoundingClientRect().y + 'px';
            expandElement(taskMenu, event);
        }));
    }


    function chooseDropdown(className) {
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains(className)) return dropdowns[i];
        }
    }

    function expandElement(element, event) {
        // If task menu is active and another one is clicked, return
        if (event && element.classList.contains('active')) {
            return;
        } else if (!element.classList.contains('active')) {
            element.style.display = 'block';
            element.style.maxHeight = element.scrollHeight + "px";
            element.classList.add('active');
            // Handle completed list arrow position
            if (element.classList.contains('completed-list')) {
                arrowRight.style.transform = 'scale(.45) rotate(90deg)';
            }
        } else {
            element.classList.remove('active');
            element.style.maxHeight = '0';
            element.style.display = 'none';
            // Handle completed list arrow position
            if (element.classList.contains('completed-list')) {
                arrowRight.style.transform = 'scale(.45)';
            }
        }
    }

    // Hide menus
    document.onclick = (event) => {
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('active')) {
                if (!listNameHeader.contains(event.target) && dropdown.classList.contains('dropdown-task-list')) {
                    expandElement(dropdown);
                } else if (!mainMenuBtn.contains(event.target) && dropdown.classList.contains('dropdown-menu')) {
                    expandElement(dropdown);
                } else if (lastUsedTaskMenuBtn && !lastUsedTaskMenuBtn.contains(event.target) 
                && dropdown.classList.contains('dropdown-task-menu')) {
                    expandElement(dropdown);
                }
            }
        });
    };

    // Expand / collapse clicked task
    addResizeTaskListener();
    function addResizeTaskListener() {
        const allTasks = document.querySelectorAll('.task');

        document.addEventListener('click', (event) => {
            allTasks.forEach(task => {
                if (task.contains(event.target) && !task.classList.contains('completed') 
                && !event.target.classList.contains('more-icon')) {
                    task.classList.add('task-clicked');
                } else {
                    task.classList.remove('task-clicked');
                }
                dateTimeHandler.toggleDate();
            });
        });
    }

    return { addTaskMenuListeners, addResizeTaskListener, taskMenu, expandElement };
})();


const dragAndDropHandler = (() => {
    let dragElement;

    document.addEventListener('DOMContentLoaded', addDragDropListeners);

    function addDragDropListeners() {
        const allTasks = document.querySelectorAll('.task');

        if (currentList.sortMethod === 'custom') {
            allTasks.forEach(task => {
                task.addEventListener('dragstart', handleDragStart);
                task.addEventListener('dragover', handleDragOver);
                task.addEventListener('dragleave', handleDragLeave);
                task.addEventListener('dragend', handleDragEnd);
                task.addEventListener('drop', handleDrop);
            });
        } 
    }

    function handleDragStart() {
        if (currentList.sortMethod !== 'custom') return;
        this.style.opacity = '.5'
        dragElement = this;
    }

    function handleDragOver(e) {
        if (currentList.sortMethod !== 'custom') return;
        e.preventDefault();
        let lastTask = getLastTaskHTML();

        // Add / remove borders indicating drop position
        if (e.target.classList.contains('task') && this !== dragElement) {
            this.classList.add('dragover-top-border');
            lastTask.classList.remove('dragover-bottom-border');
        }
        return false;
    }

    function handleDragLeave() {
        if (currentList.sortMethod !== 'custom') return;
        // Add border to last element bottom when outside of droppable area
        let lastTask = getLastTaskHTML();

        this.classList.remove('dragover-top-border');
        if (dragElement !== lastTask) {
            lastTask.classList.add('dragover-bottom-border');
        }
    }

    function handleDrop(e) {
        if (currentList.sortMethod !== 'custom') return;
        let lastTask = getLastTaskHTML();
        let dragElementID = +dragElement.dataset.id;
        let dropTargetID = +this.dataset.id;


        e.stopPropagation();

        if (dragElement !== this && !lastTask.classList.contains('dragover-bottom-border')) {
            
            handleDropPosition('before', dragElementID, dropTargetID);


        }
        return false;
    }

    function handleDragEnd() {
        if (currentList.sortMethod !== 'custom') return;
        let lastTask = getLastTaskHTML();
        this.style.opacity = '1';

        // Move task to end when dropping it outside of droppable area
        if (dragElement !== lastTask && lastTask.classList.contains('dragover-bottom-border')) {
            let dragElementID = +dragElement.dataset.id;
            handleDropPosition('end', dragElementID);
        }
        renderTasks();
    }

    function getLastTaskHTML() {
        const allTasks = document.querySelectorAll('.task');
        let lastTaskID = getLastTaskID();
        let lastTask;

        allTasks.forEach(task => {
            if (+task.dataset.id === lastTaskID) {
                lastTask = task;
            }
        });
        return lastTask;
    }

    return { addDragDropListeners };
})();

function addTaskListeners() {
    dateTimeHandler.addDateListeners();
    textInputHandler.addTextAreasListeners();
    expandElementHandler.addTaskMenuListeners();
    expandElementHandler.addResizeTaskListener()
    dragAndDropHandler.addDragDropListeners();
    addToggleCompletedListeners();
    deleteCompletedTaskListeners();
}

const listNameTemplate = document.querySelector('.list-text-template');
const taskListBreakLine = document.querySelector('#prepend-with-list');
const taskMenuBreakLine = document.querySelector('#append-list');
const taskListHeader = document.querySelector('#list-name-text');
let switchListButtons;

renderTaskLists();
function renderTaskLists() {
    // Render default list
    if (!taskLists[0]) {
        createDefaultList();
        currentList = taskLists[0];
    }
    // Remove previous list
    while (taskListBreakLine.previousSibling) taskListBreakLine.previousSibling.remove();
    while (taskMenuBreakLine.nextSibling) taskMenuBreakLine.nextSibling.remove();
    // Render list in task lists and task menu
    taskLists.forEach(list => {
        let newList = listNameTemplate.cloneNode(true);
        let newList2 = listNameTemplate.cloneNode(true);

        newList.classList.remove('list-text-template');
        newList.classList.add('switch-list');
        newList2.classList.remove('list-text-template');
        newList2.classList.add('move-task-btn');

        taskListBreakLine.before(newList);
        expandElementHandler.taskMenu.append(newList2);

        newList.lastChild.innerHTML = list.name;
        newList2.lastChild.innerHTML = list.name;

        // Make check mark visible the current list
        if (list === currentList) newList.firstChild.classList.remove('hidden');
        if (list === currentList) newList2.firstChild.classList.remove('hidden');
    });
    switchListButtons = document.querySelectorAll('.switch-list');
    moveTaskButtons = document.querySelectorAll('.move-task-btn');
    addSwitchListListeners(switchListButtons);
    renderTaskListHeader(currentList);
    addMoveTaskListeners();
}

function addSwitchListListeners() {
    switchListButtons.forEach(button => {
        button.addEventListener('click', function(){ switchList(button) });
    });
}

function switchList(button) {
    let clickedListName = button.lastChild.innerHTML;
    if (currentList.tasks.name === clickedListName) return;

    taskLists.forEach(list => {
        if (list.name === clickedListName) {
            setCurrentList(list)
            renderTaskLists();
            renderTasks();
        }
    });
    console.table(currentList.tasks)
}

// Render task list header
function renderTaskListHeader(currentList) {
    taskListHeader.innerHTML = currentList.name;
}

const tasksContainer = document.querySelector('.tasks-container');
const taskTemplate = document.querySelector('.task-template');
const completedList = document.querySelector('.completed-list');
const completedTaskTemplate = document.querySelector('.completed-task-template');

function createTaskHTML() {
    let newTask = taskTemplate.cloneNode(true);
    newTask.classList.remove('task-template');
    tasksContainer.prepend(newTask);
    addTaskListeners();

    return newTask;
}
renderTasks();
function renderTasks() {
    tasksContainer.innerHTML = '';
    completedList.innerHTML = '';

    for (const task in currentList.tasks) {
        if (!task) return;

        // Render ongoing tasks
        if (task && typeof currentList.tasks[task] === 'object' && currentList.tasks[task].completed === false) {
            // Add new task
            let newTask = taskTemplate.cloneNode(true);
            newTask.classList.remove('task-template');
            tasksContainer.append(newTask);

            // Fill task data
            newTask.style.order = currentList.tasks[task].position;
            newTask.dataset.id = currentList.tasks[task].id;

            newTask.children[0].children[1].children[0].innerHTML = currentList.tasks[task].name;
            newTask.children[0].children[1].children[0].nextElementSibling.value = currentList.tasks[task].name;

            newTask.children[1].children[0].innerHTML = currentList.tasks[task].details;
            newTask.children[1].children[0].nextElementSibling.value = currentList.tasks[task].details;

            if (currentList.tasks[task].dateTime) {
                let datePicker = newTask.children[2].children[1];
                let date = currentList.tasks[task].dateTime;
                let destination = datePicker.previousElementSibling;

                datePicker.setAttribute('value', date);
                dateTimeHandler.convertDate(date, destination);
                dateTimeHandler.toggleDate();
            }      
        // Render completed tasks      
        } else if (task && typeof currentList.tasks[task] === 'object' && currentList.tasks[task].completed === true) {
            // Add new task
            let newTask = completedTaskTemplate.cloneNode(true);
            newTask.classList.remove('completed-task-template');
            completedList.append(newTask);

            // Fill task data
            newTask.dataset.id = currentList.tasks[task].id;
            newTask.children[0].children[1].children[0].innerHTML = currentList.tasks[task].name;
            newTask.children[1].children[0].innerHTML = currentList.tasks[task].details;
        }
    }
    addTaskListeners();
    sortTasks();
}

// Move task to different list
function addMoveTaskListeners() {
    moveTaskButtons.forEach(button => button.addEventListener('click', () => {
        let destinationListName = button.lastChild.innerHTML;
        moveTask(currentTaskID, destinationListName);
    }));
}


// Delete ongoing task
const delTaskMenuBtn = document.querySelector('#delete-task-menu-button');
delTaskMenuBtn.onclick = () => {
    deleteTask(currentTaskID);
    renderTasks();
};

// Delete completed task
function deleteCompletedTaskListeners() {
    const deleteTaskButtons = document.querySelectorAll('.delete-task')
    deleteTaskButtons.forEach(button => button.addEventListener('click', (e) => {

        if (button.parentNode.parentNode.parentNode.classList.contains('task')) {
            let completedTask = button.parentNode.parentNode.parentNode;
            let completedTaskID = completedTask.dataset.id;
            completedTask.remove();
            deleteTask(completedTaskID);
            renderTasks();
        }
    }));
}

function addToggleCompletedListeners() {
    const toggleCompletedButtons = document.querySelectorAll('.toggle-completed-btn');
    toggleCompletedButtons.forEach(button => button.addEventListener('click', () => {
        let taskHTML = button.parentNode.parentNode.parentNode;
        let taskID = taskHTML.dataset.id
        toggleCompletedStatus(taskID);
        renderTasks();
        // Reset completed list height
        expandElementHandler.expandElement(completedList);
        expandElementHandler.expandElement(completedList);
    }));
}

// Sort HTML

function updateTasksOrder(sortedTaskArray) {
    const allTasks = document.querySelectorAll('.task');

    for (let i = 0; i < sortedTaskArray.length; i++) {
        allTasks.forEach(taskHTML => {
            let taskHtmlID = taskHTML.dataset.id;

            if (sortedTaskArray[i][1].id === +taskHtmlID) {
                taskHTML.style.order = i + 1;
            }
        });
    }
}

function toggleSortCheckIcon() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    let sortMethod = currentList.sortMethod;

    if (sortMethod === 'custom') {
        sortMethod = 'sort-custom-btn';
    } else if (sortMethod === 'date') {
        sortMethod = 'sort-date-btn';
    } else if (sortMethod === 'name') {
        sortMethod = 'sort-name-btn';
    }

    sortButtons.forEach(button => {
        if (button.id === sortMethod) {
            button.firstChild.classList.remove('hidden');
        } else {
            button.firstChild.classList.add('hidden');
        }
    });
}


// Modals
const createListBtn = document.querySelector('#create-list-btn');
const renameListBtn = document.querySelector('#rename-list-btn');
const addListModal = document.querySelector('#add-list-modal');
const renameListModal = document.querySelector('#rename-list-modal');
const modals = document.querySelectorAll('.modal');
const modalCancelButtons = document.querySelectorAll('.cancel-btn');

modalCancelButtons.forEach(button => button.addEventListener('click', () => {
    modals.forEach(modal => modal.classList.add('hidden'));
}));

createListBtn.onclick = () => addListModal.classList.remove('hidden');
renameListBtn.onclick = () => renameListModal.classList.remove('hidden');

export { createTaskHTML, addTaskListeners, renderTaskLists, renderTasks, toggleSortCheckIcon, updateTasksOrder, modals };