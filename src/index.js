import './style.scss';
import circleIcon from './img/circle-icon.png';

let circleElements = document.querySelectorAll('.circle-icon');
circleElements.forEach(element =>  { element.src = circleIcon });

const picker = document.querySelector('.time-picker');

const taskDateDivs = document.querySelectorAll('.task-date');
console.log(taskDateDivs[0])

taskDateDivs.forEach(div => 
    div.addEventListener('click', () => picker.showPicker())); 