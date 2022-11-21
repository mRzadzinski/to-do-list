import circleIcon from '../img/circle-icon.png';
import parseISO from 'date-fns/parseISO';

let circleElements = document.querySelectorAll('.circle-icon');
circleElements.forEach(element =>  { element.src = circleIcon });



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
            div.addEventListener('change', convertDate);
            div.addEventListener('change', toggleDate);
        });
    }

    function convertDate() {
        console.log(currentPicker.value)
        let dateTimeArray = parseISO(currentPicker.value).toString().split(' ');
        let time = new Date(currentPicker.value).toLocaleTimeString('en', {
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
        toggleDate, addDateListeners
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
                textAreas[i].innerHTML =  textAreas[i].value;
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
            lastUsedTaskMenuBtn = button; 
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

    return { addTaskMenuListeners, addResizeTaskListener };
})();


const dragAndDropHandler = (() => {
    let dragElement;

    addDragDropListeners();
    function addDragDropListeners() {
        const allTasks = document.querySelectorAll('.task');

        document.addEventListener('DOMContentLoaded', (e) => {    
            allTasks.forEach(task => {
                task.addEventListener('dragstart', handleDragStart);
                task.addEventListener('dragover', handleDragOver);
                task.addEventListener('dragleave', handleDragLeave);
                task.addEventListener('dragend', handleDragEnd);
                task.addEventListener('drop', handleDrop);
            });
        });
    }

    function handleDragStart(e) {
        this.style.opacity = '.5'
        dragElement = this;
    }

    function handleDragOver(e) {
        e.preventDefault();

        // Add / remove borders indicating drop position
        if (e.target.classList.contains('task') && this !== dragElement) {
            this.classList.add('dragover-top-border');
            dragElement.parentNode.lastChild.classList.remove('dragover-bottom-border');
        }
        return false;
    }

    function handleDragLeave(e) {
        // Add border to last element bottom when outside of droppable area
        this.classList.remove('dragover-top-border');
        dragElement.parentNode.lastChild.classList.add('dragover-bottom-border');
    }

    function handleDragEnd(e) {
        let lastTask = this.parentNode.lastChild;
        this.style.opacity = '1';

        // Move task to end when dropping it outside of droppable area
        if (dragElement !== lastTask && lastTask.classList.contains('dragover-bottom-border')) {
            lastTask.after(dragElement);
        }
        const allTasks = document.querySelectorAll('.task');
        allTasks.forEach(task => task.classList.remove('dragover-top-border', 'dragover-bottom-border'));
    }

    function handleDrop(e) {
        let lastTask = this.parentNode.lastChild;
        e.stopPropagation();

        if (dragElement !== this && !lastTask.classList.contains('dragover-bottom-border')) {
            this.before(dragElement);
        }
        return false;
    }

    return { addDragDropListeners };
})();

function addTaskListeners() {
    dateTimeHandler.addDateListeners();
    textInputHandler.addTextAreasListeners();
    expandElementHandler.addTaskMenuListeners();
    expandElementHandler.addResizeTaskListener()
    dragAndDropHandler.addDragDropListeners();
}

// Create new task
const tasksContainer = document.querySelector('.tasks-container');
const taskTemplate = document.querySelector('.task-template');

function createTaskHTML() {
    let newTask = taskTemplate.cloneNode(true);
    newTask.classList.remove('task-template');
    tasksContainer.prepend(newTask);
    addTaskListeners();

    return newTask;
}

const listNameTemplate = document.querySelector('.list-text-template');
const dropdownTaskList = document.querySelector('.dropdown-task-list');

function renderTaskListsHTML(taskLists) {
    taskLists.forEach(list => {
        console.log(list.name)
        let newList = listNameTemplate.cloneNode(true);
        newList.classList.remove('list-text-template');
        dropdownTaskList.prepend(newList);
        newList.lastChild.innerHTML = list.name;
    });
}

export { createTaskHTML, addTaskListeners, renderTaskListsHTML };