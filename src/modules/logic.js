import { createTaskHTML, addTaskListeners, renderTaskLists, renderTasks, toggleSortCheckIcon, updateTasksOrder, modals } from './DOMmanipulation';

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
    // if (!localStorageWorks) {
    //     return;

    // } else if (localStorageWorks) {
    //     localStorage.clear();
    //     localStorage.setItem("taskLists", JSON.stringify(taskLists));
    //     localStorage.setItem("currentListName", JSON.stringify(currentList.name));
    // }
}


// Objects
const List = (name) => {
    let sortMethod = 'custom';
    let tasks = {}
    return { name, sortMethod, tasks }
};


const Task = (id, name, details, dateTime, position, completed) => {
    return { id, name, details, dateTime, position, completed };
};

let taskLists = [];
let currentList;
loadLocalStorage();

function setCurrentList(list) { currentList = list };
function createDefaultList() { taskLists.push(List('Quests')) }

// Dummy content START
if (storageIsEmpty) {
    let weekend = List('Weekend');
    let dance = Task(0, 'Dance', 'Samba', '2025-03-23T17:33', 3, false);
    let sleep = Task(1, 'Sleep', 'Deep', '2022-12-26T11:11', 2, false);
    let eat = Task(2, 'Eat', 'Sushi', '2022-08-26T11:11', 1, false);
    let cook = Task(3, 'Cook', 'Sushi', '2022-10-07T01:11', 4, false);
    let laze = Task(4, 'Laze', 'As much as you can', '2022-02-07T01:11', 5, false);
    
    taskLists.push(weekend);
    weekend.tasks.dance = dance;
    weekend.tasks.sleep = sleep;
    weekend.tasks.eat = eat;
    weekend.tasks.cook = cook;
    weekend.tasks.laze = laze;
    
    let week = List('Week');
    let work = Task(0, 'Work', 'On a highway', '2023-11-23T17:33', 1, false);
    let hurry = Task(1, 'Lay down ', 'The blacktop', '2023-09-26T10:11', 2, false);
    let cry = Task(2, 'Cry', 'Your eyes out', '2022-12-26T11:51', 3, false);
    
    taskLists.push(week);
    week.tasks.work = work;
    week.tasks.hurry = hurry;
    week.tasks.cry = cry;
}
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
            saveToLocalStorage();
            modals.forEach(modal => modal.classList.add('hidden'));
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
    currentList.tasks[newTaskName] = Task('', '', '', '', 1, false);
    refreshTasksID();
    renderTasks();
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
        if (task && typeof currentList.tasks[task] === 'object') {
            currentList.tasks[task].position++;
        }
    }
    saveToLocalStorage();
}

// Delete task

function deleteTask(taskID) {
    let taskToDeleteName;

    // Find task to delete
    for (let task in currentList.tasks) {
        if (currentList.tasks[task].id === +taskID) {
            taskToDeleteName = task;
            console.log(taskToDeleteName)
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
    console.log(currentList.tasks)
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
                currentList.tasks[task].completed = true
            } else if (currentList.tasks[task].completed === true) {
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
    let destinationList;

    taskLists.forEach(list => {
        if (list.name === destinationListName) {
            destinationList = list;
        }
    });

    if (currentList === destinationList) return;
 
    for (let task in currentList.tasks) {
        if (currentList.tasks[task].id === +taskID) {
            // Copy task to destination list
            destinationList.tasks[task] = currentList.tasks[task];
            // Position as a last element in new location
            destinationList.tasks[task].position = Object.keys(destinationList.tasks).length;
            delete currentList.tasks[task];
            break;
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

    } else if (sortMethod === 'custom') {
        currentListArray.sort((a, b) => {
            let aa = a[1].position;
            let bb = b[1].position;

            return aa - bb;
        });

    }
    return currentListArray;
}

function handleDropPosition(newPosition, taskToMoveID, dropTargetID) {
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
                currentList.tasks[task].position = Object.keys(currentList.tasks).length;

                sortedTasksArray = getSortedTaskArray();
                break;
            }
        }
    }
    updateTasksOrder(sortedTasksArray);
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


export { currentList, setCurrentList, taskLists, deleteTask, toggleCompletedStatus, createDefaultList, sortTasks, moveTask, handleDropPosition, getLastTaskID, saveToLocalStorage };

