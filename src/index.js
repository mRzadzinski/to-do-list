import './style.scss';
import circleIcon from './img/circle-icon.png';
import parseISO from 'date-fns/parseISO';

// DOM manipulation section
let circleElements = document.querySelectorAll('.circle-icon');
circleElements.forEach(element =>  { element.src = circleIcon });

// Date picker
const timePickers = document.querySelectorAll('.time-picker');
const taskDateDivs = document.querySelectorAll('.task-date');
const dateValues = document.querySelectorAll('.date-value');
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
    textareas[i].setAttribute('style', 'height:' + (textareas[i].scrollHeight) + 'px;overflow-y:hidden;');
    textareas[i].addEventListener('input', updateTextareas, false);
    textareas[i].addEventListener('input', () => {
        console.log(textareas[i].value)
        textareas[i].innerHTML =  textareas[i].value;
        textareas[i].previousElementSibling.innerHTML = textareas[i].value;
    });
}
function updateTextareas() {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";
}

// Expand clicked task

const allTasks = document.querySelectorAll('.task');

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