import { selectNewTask, renderTaskLists, renderTasks, setSortCheckIcon, updateTasksOrder } from './DOMmanipulation';

// Local storage
let localStorageWorks;
if (storageAvailable('localStorage')) {
    localStorageWorks = true;
  }
  else {
    localStorageWorks = false;
  }

function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

let storageIsEmpty;
function loadLocalStorage() {
    if (!localStorage.getItem('taskLists')) {
        storageIsEmpty = true;
        return;
    } else {
        storageIsEmpty = false;
        taskLists = JSON.parse(localStorage.getItem('taskLists'));

        let loadedCurrentListName = JSON.parse(localStorage.getItem('currentListName'));
        taskLists.forEach(list => {
            if (list.name === loadedCurrentListName) {
                currentList = list;
            }
        });
    }
}

function saveToLocalStorage() {
    if (!localStorageWorks) {
        return;

    } else if (localStorageWorks) {
        localStorage.clear();
        localStorage.setItem("taskLists", JSON.stringify(taskLists));
        localStorage.setItem("currentListName", JSON.stringify(currentList.name));
    }
}


// Objects
const ListFactory = (name) => {
    let sortMethod = 'custom';
    let tasks = {}
    return { name, sortMethod, tasks }
};


const TaskFactory = (id, name, details, dateTime, position, completed) => {
    return { id, name, details, dateTime, position, completed };
};

let taskLists = [];
let currentList;
loadLocalStorage();

function setCurrentList(list) { currentList = list };
function createDefaultList() { taskLists.push(ListFactory('Quests')) }

// Dummy content START
if (storageIsEmpty) {
    let weekend = ListFactory('Weekend');
    let dance = TaskFactory(0, 'Dance', 'Samba', '2022-12-03T10:00', 3, false);
    let sleep = TaskFactory(1, 'Sleep', 'Deep', '', 2, false);
    let eat = TaskFactory(2, 'Eat', 'Sushi', '2022-12-03T11:11', 1, false);
    let cook = TaskFactory(3, 'Cook', 'Sushi', '', 4, false);
    let laze = TaskFactory(4, 'Laze', 'As much as you can', '2022-12-04T12:00', 5, false);
    
    let week = ListFactory('Week');
    let work = TaskFactory(0, 'Work', 'On a highway', '2022-11-23T17:33', 1, false);
    let layDown = TaskFactory(1, 'Lay down ', 'The blacktop', '2022-09-26T10:11', 2, false);
    let cry = TaskFactory(2, 'Cry', 'Your eyes out', '2022-12-26T11:51', 3, false);

    taskLists.push(weekend);
    weekend.tasks.dance = dance;
    weekend.tasks.sleep = sleep;
    weekend.tasks.eat = eat;
    weekend.tasks.cook = cook;
    weekend.tasks.laze = laze;
    
    taskLists.push(week);
    week.tasks.work = work;
    week.tasks.layDown = layDown;
    week.tasks.cry = cry;
}
// Dummy content END
if (!currentList) {
    currentList = taskLists[0];
};

// Rename List
const modals = document.querySelectorAll('.modal');
const renameListInput = document.querySelector('#rename-list-input');
const renameDoneBtn = document.querySelector('#rename-done-btn');

renameDoneBtn.addEventListener('click', () => {
    if (renameListInput.value) {
        currentList.name = renameListInput.value;
        renameListInput.value = '';

        renderTaskLists();
        renderTasks();
        saveToLocalStorage();
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
    saveToLocalStorage();
};

// Create new task
const addTaskIcon = document.querySelector('#add-task-icon');
const addTaskText = document.querySelector('#add-task-text');

[addTaskIcon, addTaskText].forEach(element => element.addEventListener('click', () => {
    let newTaskName = generateRandomString();
    let uniqueCheck = getUniqueName(newTaskName);

    while (uniqueCheck === false) {
        newTaskName = generateRandomString();
        uniqueCheck = getUniqueName(newTaskName);
    }

    increaseTasksPosition();
    currentList.tasks[newTaskName] = TaskFactory('', '', '', '', 1, false);
    refreshTasksID();
    renderTasks();
    setTimeout(selectNewTask, 10);
    saveToLocalStorage();
}));

function getUniqueName(newTaskName) {
    let unique = true;

    for (let list in taskLists) {
        for (let task in list.tasks) {
            if (currentList.tasks[task].name === newTaskName) {
                unique = false;
            }
        }
    }
    return unique;
}

function generateRandomString() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function increaseTasksPosition() {
    for (let task in currentList.tasks) {
        if (task && typeof currentList.tasks[task] === 'object' && !currentList.tasks[task].completed) {
            currentList.tasks[task].position++;
        }
    }
    saveToLocalStorage();
}

// Delete task
function deleteTask(taskID) {

    // Find task to delete
    let taskToDeleteName;

    for (let task in currentList.tasks) {
        if (currentList.tasks[task].id === +taskID) {
            taskToDeleteName = task;
        }
    }
    // Handle positioning
    for (let task in currentList.tasks) {
        if (currentList.tasks[task].position > currentList.tasks[taskToDeleteName].position) {
            currentList.tasks[task].position--;
        }
    }
    delete currentList.tasks[taskToDeleteName];

    refreshTasksID();
    saveToLocalStorage();
}

function refreshTasksID() {
    taskLists.forEach(list => {
        let counter = 0;
        for (let task in list.tasks) {
            list.tasks[task].id = counter;      
            counter++;
        }
    });
}

function toggleCompletedStatus(taskID) {
    for (let task in currentList.tasks) {
        if (currentList.tasks[task].id == taskID) {

            if (currentList.tasks[task].completed === false) {
                // Handle positioning
                for (let tk in currentList.tasks) {
                    if (currentList.tasks[tk].position > currentList.tasks[task].position) {
                        currentList.tasks[tk].position--;
                    }
                }
                currentList.tasks[task].completed = true
                currentList.tasks[task].position = '';

            } else if (currentList.tasks[task].completed === true) {
                // Add to ongoing list as last task
                currentList.tasks[task].position = getSortedTaskArray().length + 1;
                currentList.tasks[task].completed = false;
            }
        }
    }
    saveToLocalStorage();
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
    saveToLocalStorage();
}

// Move task to different list
function moveTask(taskID, destinationListName) {
    let listPosition;
    for (let i = 0; i < taskLists.length; i++) {
        if (taskLists[i].name === destinationListName) {
            listPosition = i;
        };
    }

    if (currentList === taskLists[listPosition]) return;

    for (let task in currentList.tasks) {
        if (currentList.tasks[task].id === +taskID) {

            let taskPrevPosition = currentList.tasks[task].position;

            // Count ongoing tasks in destination list
            let positionCounter = 0;
            Object.entries(taskLists[listPosition].tasks).forEach(task => {
                if (!task[1].completed) positionCounter++;
            });

            // Update position of elements in current list
            for (let t in currentList.tasks) {
                if (currentList.tasks[t].position > taskPrevPosition) {
                    currentList.tasks[t].position--;
                }
            }

            // Copy task to destination list
            taskLists[listPosition].tasks[task] = currentList.tasks[task];

            // Position as last element in new location
            taskLists[listPosition].tasks[task].position = positionCounter + 1;            

            delete currentList.tasks[task];
        }
    }
    refreshTasksID();
    renderTasks();
    saveToLocalStorage();
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
    setSortCheckIcon();
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
        // Handle completed tasks
        let ongoingTaskArray = excludeCompleted(currentListArray);
        return ongoingTaskArray;

    } else if (sortMethod === 'date') {
        currentListArray.sort((a, b) => {
            let aa;
            // Handle empty tasks
            if (!a[1].dateTime) {
                aa = new Date('January 1, 1500 00:00:00');
            } else {
                aa = new Date(a[1].dateTime);
            }
            let bb = new Date(b[1].dateTime);

            return aa - bb;
        });
        // Handle completed tasks
        let ongoingTaskArray = excludeCompleted(currentListArray);
        return ongoingTaskArray;

    } else if (sortMethod === 'custom') {
        currentListArray.sort((a, b) => {
            let aa = a[1].position;
            let bb = b[1].position;

            return aa - bb;
        });
        // Handle completed tasks
        let ongoingTaskArray = excludeCompleted(currentListArray);
        return ongoingTaskArray;
    }
}

// Helper for getSortedTaskArray function
function excludeCompleted(currentListArray) {
    let ongoingTaskArray = [];

    currentListArray.forEach(task => {
        if (!task[1].completed) {
            ongoingTaskArray.push(task)
        }
    });
    return ongoingTaskArray;
}

function handleDropPosition(newPosition, taskToMoveID, dropTargetID) {
    // Array of ongoing tasks in current list
    let sortedTasksArray = getSortedTaskArray();
    let taskToMove;
    let taskToMovePosition;
    let dropTargetPosition;

    for (let task in currentList.tasks) {
        if (currentList.tasks[task].id === +taskToMoveID) {
            taskToMove = currentList.tasks[task];
            taskToMovePosition = currentList.tasks[task].position;
        } else if (currentList.tasks[task].id === +dropTargetID) {
            dropTargetPosition = currentList.tasks[task].position;
        }
    }

    if (newPosition === 'before') {
        sortedTasksArray.forEach(task => {
            if (taskToMovePosition > dropTargetPosition) {
                if (task[1].position >= dropTargetPosition && task[1].position < taskToMovePosition) {
                    task[1].position++;
                    taskToMove.position = dropTargetPosition;
                }
            } else if (taskToMovePosition < dropTargetPosition) {
                if (task[1].position > taskToMovePosition && task[1].position < dropTargetPosition) {
                    task[1].position--;
                    taskToMove.position = dropTargetPosition - 1;
                }
            }
        });
        sortedTasksArray = getSortedTaskArray();
        

    } else if (newPosition === 'end'){
        for (let task in currentList.tasks) {
            if (currentList.tasks[task].position === taskToMovePosition) {
                // Decrement position of tasks after moved element
                sortedTasksArray.forEach(task => {
                    if (task[1].position > taskToMovePosition) {
                        task[1].position--;
                    }
                });

                // Set it as last task
                currentList.tasks[task].position = getSortedTaskArray().length;            
                break;
            }
        }
    }
    saveToLocalStorage();
}

function getLastTaskID() {
    let currentListArray = Object.entries(currentList.tasks);

    currentListArray.sort((a, b) => {
        let aa = a[1].position;
        let bb = b[1].position;

        return bb - aa;
    });
    return currentListArray[0][1].id;
}

export { taskLists, currentList, setCurrentList, createDefaultList, deleteTask, sortTasks, moveTask, 
        getLastTaskID, toggleCompletedStatus, handleDropPosition, saveToLocalStorage, ListFactory, getSortedTaskArray };