import circleIcon from '../img/circle-icon.png';
import parseISO from 'date-fns/parseISO';

const allTasks = document.querySelectorAll('.task');
let circleElements = document.querySelectorAll('.circle-icon');
circleElements.forEach(element =>  { element.src = circleIcon });



const dateTimeHandler = (() => {
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
        toggleDate,
    };

})();



const textInputHandler = (() => {
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
    function updateTextAreas() {
        this.style.height = 0;
        this.style.height = (this.scrollHeight) + "px";
    }

})();



const expandElementHandler = (() => {
    const listNameHeader = document.querySelector('#list-name');
    const dropdowns = document.querySelectorAll('.dropdown');
    const taskMenu = document.querySelector('.dropdown-task-menu');
    const taskMenuButtons = document.querySelectorAll('.task-menu-button');
    const completedButton = document.querySelector('.completed-button');
    const completedList = document.querySelector('.completed-list');
    const arrowRight = document.querySelector('#arrow-right');
    const mainMenuBtn = document.querySelector('#main-menu-btn');
    let lastUsedTaskMenuBtn;

    // Add listeners for dropdown menus
    listNameHeader.onclick = () => expandElement(chooseDropdown('dropdown-task-list'));
    mainMenuBtn.onclick = () => expandElement(chooseDropdown('dropdown-menu'));
    completedButton.onclick = () => expandElement(completedList);
    taskMenuButtons.forEach(button => button.addEventListener('click', (event) => {
        lastUsedTaskMenuBtn = button; 
        // Set task menu position
        taskMenu.style.top = lastUsedTaskMenuBtn.getBoundingClientRect().y + 'px';
        expandElement(taskMenu, event);
    }));

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

})();


const dragAndDropHandler = (() => {
    let dragElement;
    
    document.addEventListener('DOMContentLoaded', (e) => {    
        allTasks.forEach(task => {
            task.addEventListener('dragstart', handleDragStart);
            task.addEventListener('dragover', handleDragOver);
            task.addEventListener('dragleave', handleDragLeave);
            task.addEventListener('dragend', handleDragEnd);
            task.addEventListener('drop', handleDrop);
        });
    });

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

})();