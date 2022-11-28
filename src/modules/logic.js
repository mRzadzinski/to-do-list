import { createTaskHTML, addTaskListeners, renderTaskLists, renderTasks, toggleSortCheckIcon, updateTasksOrder, modals } from './DOMmanipulation';

// Objects
const List = (name) => {
    let sortMethod = 'custom';
    let tasks = {}
    return { name, sortMethod, tasks }
};


const Task = (id, name, details, dateTime, position, completed) => {
    return { id, name, details, dateTime, position, completed };
};

const taskLists = [];
let currentList;
function setCurrentList(list) { currentList = list };
function createDefaultList() { taskLists.push(List('Quests')) }

// Dummy content START
let weekend = List('Weekend');
let dance = Task(1, 'Dance', 'Samba', '2025-03-23T17:33', 3, false);
let sleep = Task(2, 'Sleep', 'Deep', '2022-12-26T11:11', 2, true);
let eat = Task(3, 'Eat', 'Sushi', '2022-08-26T11:11', 1, false);

taskLists.push(weekend);
weekend.tasks.dance = dance;
weekend.tasks.sleep = sleep;
weekend.tasks.eat = eat;

let week = List('Week');
let work = Task(1, 'Work', 'On a highway', '2023-11-23T17:33', 1, false);
let hurry = Task(2, 'Hurry', 'Catch a bus', '2023-09-26T10:11', 2, false);
let cry = Task(3, 'Cry', 'Your eyes out', '2022-12-26T11:51', 3, true);

taskLists.push(week);
week.tasks.work = work;
week.tasks.hurry = hurry;
week.tasks.cry = cry;
// Dummy content END

if (!currentList) {
    currentList = taskLists[0];
};

// Create new list
const addListDoneBtn = document.querySelector('#add-list-done-btn');
const renameDoneBtn = document.querySelector('#rename-done-btn');
const newListInput = document.querySelector('#new-list-input');
const renameListInput = document.querySelector('#rename-list-input');

addListDoneBtn.addEventListener('click', () => {
    if (newListInput.value) {
        // Ensure unique list name
        let unique = true;
        taskLists.forEach(list => {
            if (list.name === newListInput.value) {
                unique = false;
                newListInput.setCustomValidity('Choose unique list name.');
                newListInput.reportValidity();
            }
        });
        if (unique === true) {
            let newList = List(newListInput.value);
            newListInput.value = '';
            taskLists.push(newList);
            currentList = newList;
    
            renderTaskLists();
            renderTasks();
            modals.forEach(modal => modal.classList.add('hidden'));
        } else {

        }
    }
});

// Rename List
renameDoneBtn.addEventListener('click', () => {
    if (renameListInput.value) {
        currentList.name = renameListInput.value;
        renameListInput.value = '';

        renderTaskLists();
        renderTasks();
        modals.forEach(modal => modal.classList.add('hidden'));
    }
});

// Delete list
const deleteListButton = document.querySelector('#delete-list-button');

deleteListButton.onclick = () => {
    let index = taskLists.indexOf(currentList);
    taskLists.splice(index, 1);
    currentList = taskLists[0];

    renderTaskLists();
    renderTasks();
};


// Create new task
const addTaskIcon = document.querySelector('#add-task-icon');
const addTaskText = document.querySelector('#add-task-text');

[addTaskIcon, addTaskText].forEach(element => element.addEventListener('click', () => {
    let newTaskName = generateRandomString();
    let uniqueCheck = ensureUniqueName(newTaskName);

    while (uniqueCheck === false) {
        newTaskName = generateRandomString();
        uniqueCheck = ensureUniqueName(newTaskName);
    }

    if (currentList.sortMethod === 'custom') {
        increaseTasksPosition();
    }
    currentList.tasks[newTaskName] = Task('', '', '', '', 1, false);
    refreshTasksID();
    renderTasks();
}));

function ensureUniqueName(newTaskName) {
    let unique = true;
    for (let task in currentList.tasks) {
        if (currentList.tasks[task].name === newTaskName) {
            console.log('same')
            unique = false;
        }
    }
    return unique;
}

function generateRandomString() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function increaseTasksPosition() {
    for (const prop in currentList.tasks) {
        if (prop && typeof currentList.tasks[prop] == 'object') {
            weekend.tasks[prop].position++;
        }
    }
}

// Delete task

function deleteTask(taskID) {
    for (let task in currentList.tasks) {
        if (currentList.tasks[task].id == taskID) {
            delete currentList.tasks[task];
        }
    }
    refreshTasksID();
}

function refreshTasksID() {
    let counter = 0;
    for (let prop in currentList.tasks) {
        currentList.tasks[prop].id = counter;        
        counter++;
    }
}

function toggleCompletedStatus(taskID) {
    for (let task in currentList.tasks) {
        if (currentList.tasks[task].id == taskID) {
            
            if (currentList.tasks[task].completed === false) {
                currentList.tasks[task].completed = true
            } else if (currentList.tasks[task].completed === true) {
                currentList.tasks[task].completed = false;
            }
        }
    }
}

// Delete completed tasks

let deleteCompletedTasksBtn = document.querySelector('#delete-completed-tasks');
deleteCompletedTasksBtn.onclick = deleteCompletedTasks;

function deleteCompletedTasks() {
    for (let task in currentList.tasks) {
        if (currentList.tasks[task].completed === true) {
            delete currentList.tasks[task];
        }
    }
    renderTasks();
}

// Move task to different list

function moveTask(taskID, destinationList) {
    
}


// Sort
const sortNameBtn = document.querySelector('#sort-name-btn');
const sortDateBtn = document.querySelector('#sort-date-btn');
const sortCustomBtn = document.querySelector('#sort-custom-btn');

sortCustomBtn.onclick = () => {
    currentList.sortMethod = 'custom';
    sortTasks();
};

sortDateBtn.onclick = () => {
    currentList.sortMethod = 'date';
    sortTasks();
};

sortNameBtn.onclick = () => {
    currentList.sortMethod = 'name';
    sortTasks();
};

function sortTasks() {
    toggleSortCheckIcon();
    let sortedArray = getSortedTaskArray();
    updateTasksOrder(sortedArray);
}

function getSortedTaskArray() {
    // Get array of object entries
    let currentListArray = Object.entries(currentList.tasks);
    let sortMethod = currentList.sortMethod;

    if (sortMethod === 'name') {
        currentListArray.sort((a, b) => {
            let aa = a[1].name.toLowerCase();
            let bb = b[1].name.toLowerCase();

            return aa < bb ? -1 : aa > bb ? 1 : 0;
        });

    } else if (sortMethod === 'date') {
        currentListArray.sort((a, b) => {
            let aa = new Date(a[1].dateTime);
            let bb = new Date(b[1].dateTime);

            return aa - bb;
        });

    } else if (sortMethod === 'custom') {
        currentListArray.sort((a, b) => {
            let aa = a[1].position;
            let bb = b[1].position;

            return aa - bb;
        });

    }
    return currentListArray;
}


export { increaseTasksPosition as updateTasksPosition, currentList, setCurrentList, taskLists, deleteTask, toggleCompletedStatus, createDefaultList, sortTasks };

