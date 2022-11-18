import './style.scss';
import circleIcon from './img/circle-icon.png';
import parseISO from 'date-fns/parseISO';

// DOM manipulation section

const listName = document.querySelector('#list-name');
const dropdowns = document.querySelectorAll('.dropdown');
const taskMenu = document.querySelector('.dropdown-task-menu');
const taskMenuButtons = document.querySelectorAll('.task-menu-button');
const allTasks = document.querySelectorAll('.task');
const timePickers = document.querySelectorAll('.time-picker');
const taskDateDivs = document.querySelectorAll('.task-date');
const dateValues = document.querySelectorAll('.date-value');
const completedButton = document.querySelector('.completed-button');
const completedList = document.querySelector('.completed-list');
const arrowRight = document.querySelector('#arrow-right');
const mainMenuBtn = document.querySelector('#main-menu-btn');
let circleElements = document.querySelectorAll('.circle-icon');
circleElements.forEach(element =>  { element.src = circleIcon });

// Date picker
let currentPicker;
let currentDateValue;

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
    div.addEventListener('change', convertDate);
    div.addEventListener('change', toggleDate);
});
    
function convertDate() {
    let dateTimeArray = parseISO(currentPicker.value).toString().split(' ');
    const time = new Date(currentPicker.value).toLocaleTimeString('en', {
        timeStyle: 'short', 
        hour12: true
    });
    let dateTime = `${dateTimeArray[0]}, ${dateTimeArray[1]} ${dateTimeArray[2]}, ${time}`;
    if (dateTime.includes('Invalid')) {
        currentDateValue.innerHTML = 'Date / time';
    } else {
        currentDateValue.innerHTML = dateTime;
    }
}

toggleDate();
function toggleDate() {
    dateValues.forEach(value => {
        if (value.innerHTML === 'Date / time' 
            && !value.parentNode.parentNode.classList.contains('task-clicked')) {
                value.parentNode.classList.add('hidden')
        } else {
            value.parentNode.classList.remove('hidden');
        }
    });
}

// Textarea auto resize and display value
const textareas = document.getElementsByTagName('textarea');
for (let i = 0; i < textareas.length; i++) {
    let height;
    if (textareas[i].scrollHeight == 0) {
        height = 'auto';
    } else {
        height = textareas[i].scrollHeight;
    }
    textareas[i].setAttribute('style', 'height:' + height + 'px;overflow-y:hidden;');
    textareas[i].addEventListener('input', updateTextareas, false);
    textareas[i].addEventListener('input', () => {
        textareas[i].innerHTML =  textareas[i].value;
        textareas[i].previousElementSibling.innerHTML = textareas[i].value;
    });
}
function updateTextareas() {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";
}

// Position task menu
let lastTaskButton;
taskMenuButtons.forEach(button => button.addEventListener('click', (event) => {
    lastTaskButton = button; 
    taskMenu.style.top = lastTaskButton.getBoundingClientRect().y + 'px';
    expandElement(taskMenu, event);
}));

// Expand list
function chooseDropdown(className) {
    for (let i = 0; i < dropdowns.length; i++) {
        if (dropdowns[i].classList.contains(className)) return dropdowns[i];
    }
}

listName.onclick = (event) => expandElement(chooseDropdown('dropdown-task-list'), event);
mainMenuBtn.onclick = (event) => expandElement(chooseDropdown('dropdown-menu'), event);
document.onclick = (event) => {
    dropdowns.forEach(dropdown => {
        if (dropdown.classList.contains('active')) {
            if (!listName.contains(event.target) && dropdown.classList.contains('dropdown-task-list')) {
                expandElement(dropdown);
            } else if (!mainMenuBtn.contains(event.target) && dropdown.classList.contains('dropdown-menu')) {
                expandElement(dropdown);
            } else if (lastTaskButton && !lastTaskButton.contains(event.target) 
            && dropdown.classList.contains('dropdown-task-menu')) {
                expandElement(dropdown);
            }
        }
    });
};

completedButton.onclick = () => expandElement(completedList);

function expandElement(element, event) {
    // Handle expand/collapse task menu
    if (event && element.classList.contains('active')) {

        console.log('yes')
    } else if (!element.classList.contains('active')) {
        element.style.zIndex = '2';
        element.style.display = 'block';
        element.style.maxHeight = element.scrollHeight + "px";
        element.classList.add('active');
        // Handle finished list arrow position
        if (element.classList.contains('completed-list')) {
            arrowRight.style.transform = 'scale(.45) rotate(90deg)';
        }
    } else {
        element.style.zIndex = '1';
        element.classList.remove('active');
        element.style.maxHeight = '0';
        element.style.display = 'none';
                // Handle finished list arrow position
        if (element.classList.contains('completed-list')) {
            arrowRight.style.transform = 'scale(.45)';
        }
    }
}

// Expand clicked task
document.addEventListener('click', (e) => {
    allTasks.forEach(task => {
        if (task.contains(e.target) && !task.classList.contains('completed') 
        && !e.target.classList.contains('more-icon')) {
            task.classList.add('task-clicked');
        } else {
            task.classList.remove('task-clicked');
        }
        toggleDate();
    });
});

// Drag & drop
let dragoverTarget;
let dragSrcEl;

document.addEventListener('DOMContentLoaded', (e) => {

    function handleDragStart(e) {
        this.style.opacity = '.5'
        dragSrcEl = this;
    }

    function handleDragEnd(e) {
        let lastTask = this.parentNode.lastChild;
        this.style.opacity = '1';

        // Move task to an end when dropping item outside of droppable area
        if (dragSrcEl !== lastTask && lastTask.classList.contains('dragover-bottom')) {
            lastTask.after(dragSrcEl);
        }
        allTasks.forEach(task => task.classList.remove('dragover-top', 'dragover-bottom'));
    }

    function handleDragOver(e) {
        e.preventDefault();
        dragoverTarget = this;

        // Add / remove borders indicating drop position
        if (e.target.classList.contains('task') && this !== dragSrcEl) {
            this.classList.add('dragover-top');
            dragSrcEl.parentNode.lastChild.classList.remove('dragover-bottom');
        }
        return false;
    }

    function handleDragLeave(e) {
        
        // Add / remove borders indicating drop position
        this.classList.remove('dragover-top');
        dragSrcEl.parentNode.lastChild.classList.add('dragover-bottom');
    }

    function handleDrop(e) {
        let lastTask = this.parentNode.lastChild;
        e.stopPropagation();

        if (dragSrcEl !== this && !lastTask.classList.contains('dragover-bottom')) {
            this.before(dragSrcEl);
        }
        return false;
    }

    allTasks.forEach(task => {
        task.addEventListener('dragstart', handleDragStart);
        task.addEventListener('dragover', handleDragOver);
        task.addEventListener('dragleave', handleDragLeave);
        task.addEventListener('dragend', handleDragEnd);
        task.addEventListener('drop', handleDrop);
    });
});
