import './style.scss';
import circleIcon from './img/circle-icon.png';
import parseISO from 'date-fns/parseISO';

// DOM manipulation section

const allTasks = document.querySelectorAll('.task');
const timePickers = document.querySelectorAll('.time-picker');
const taskDateDivs = document.querySelectorAll('.task-date');
const dateValues = document.querySelectorAll('.date-value');
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

// Expand clicked task
document.addEventListener('click', (e) => {
    allTasks.forEach(task => {
        if (task.contains(e.target)) {
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

        console.log(this)

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
        e.stopPropagation();

        if (dragSrcEl !== this && !this.parentNode.lastChild.classList.contains('dragover-bottom')) {
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