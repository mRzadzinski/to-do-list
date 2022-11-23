import { createTaskHTML, addTaskListeners, renderTaskLists, renderTasks, modals } from './DOMmanipulation';

// Objects
const List = (name) => {
    name 
    return { name }
};

const Task = (name, details, dateTime, position, completed) => {
    return { name, details, dateTime, position, completed };
};

const taskLists = [];
let currentList;
function setCurrentList(list) { currentList = list };

// Dummy content START
let weekend = List('Weekend');
let dance = Task('Dance', 'Samba', '2022-11-23T17:33', 4, false);
let sleep = Task('Sleep', 'Deep', '2022-11-26T11:11', 2, true);
let eat = Task('Eat', 'Sushi', '2022-12-26T11:11', 3, false);

taskLists.push(weekend);
weekend.dance = dance;
weekend.sleep = sleep;
weekend.eat = eat;

let week = List('Week');
let work = Task('Work', 'On a highway', '2023-11-23T17:33', 1, false);
let hurry = Task('Hurry', 'Catch a bus', '2023-09-26T10:11', 2, false);
let cry = Task('Cry', 'Your eyes out', '2022-12-26T11:51', 3, true);

taskLists.push(week);
week.work = work;
week.hurry = hurry;
week.cry = cry;
// Dummy content END

if (!currentList) {
    currentList = taskLists[0];
};

function updateTasksPosition(plusOrMin) {
    for (const prop in currentList) {
        if (prop && typeof currentList[prop] == 'object') {
            if (plusOrMin === 'plus') {
                weekend[prop].position++;
            } else if (plusOrMin === 'minus') {
                weekend[prop].position--;
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

// Remove task
const deleteTaskButtons = document.querySelectorAll('.delete-task');


export { updateTasksPosition, currentList, setCurrentList, taskLists };

