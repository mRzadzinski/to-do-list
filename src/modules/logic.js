import { createTaskHTML, addTaskListeners, renderTaskLists, renderTasks, modals } from './DOMmanipulation';

// Objects
const List = (name) => {
    let tasks = {}
    return { name, tasks }
};

const Task = (id, name, details, dateTime, position, completed) => {
    return { id, name, details, dateTime, position, completed };
};

const taskLists = [];
let currentList;
function setCurrentList(list) { currentList = list };

// Dummy content START
let weekend = List('Weekend');
let dance = Task(1, 'Dance', 'Samba', '2022-11-23T17:33', 4, false);
let sleep = Task(2, 'Sleep', 'Deep', '2022-11-26T11:11', 2, true);
let eat = Task(3, 'Eat', 'Sushi', '2022-12-26T11:11', 3, false);

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

function updateTasksPosition(plusOrMin) {
    for (const prop in currentList.tasks) {
        if (prop && typeof currentList.tasks[prop] == 'object') {
            if (plusOrMin === 'plus') {
                weekend.tasks[prop].position++;
            } else if (plusOrMin === 'minus') {
                weekend.tasks[prop].position--;
            }
        }
    }
}

// Create new list
const addListDoneBtn = document.querySelector('#add-list-done-btn');
const renameDoneBtn = document.querySelector('#rename-done-btn');
const newListInput = document.querySelector('#new-list-input');
const renameListInput = document.querySelector('#rename-list-input');

addListDoneBtn.addEventListener('click', () => {
    if (newListInput.value) {
        let newList = List(newListInput.value);
        newListInput.value = '';
        taskLists.push(newList);
        currentList = newList;

        renderTaskLists();
        renderTasks();
        modals.forEach(modal => modal.classList.add('hidden'));
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
    let newTask = createTaskHTML();
    updateTasksPosition('plus');
}));

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

function sortBy(sortMethod) {
    // Get array of object entries
    let currentListArray = Object.entries(currentList.tasks);

    if (sortMethod === 'name') {
        currentListArray.sort((a, b) => {
            let aa = a[1].name.toLowerCase();
            let bb = b[1].name.toLowerCase();

            return aa < bb ? -1 : aa > bb ? 1 : 0;
        });
        // Set tasks position according to sorted array
        for (let i = 0; i < currentListArray.length; i++) {
            currentListArray[i][1].currentPosition = i;
        }

    } else if (sortMethod === 'date') {
        currentListArray.sort((a, b) => {
            let aa = new Date(a[1].dateTime);
            let bb = new Date(b[1].dateTime);

            return aa - bb;
        });
        // Set tasks position according to sorted array
        for (let i = 0; i < currentListArray.length; i++) {
            currentListArray[i][1].currentPosition = i;
        }

    } else if (sortMethod === 'custom') {

        for (let i = 0; i < currentListArray.length; i++) {
            currentListArray[i][1].currentPosition = currentListArray[i][1].customPosition;
        }
    }
    // console.log(currentListArray)
    // console.log(currentListArray[0])
    // console.log(currentListArray[0][1])
    // console.log(currentListArray[0][1].date);
}


export { updateTasksPosition, currentList, setCurrentList, taskLists, deleteTask, toggleCompletedStatus };

