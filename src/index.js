import welcome from './Welcome.js'
import image from './Image.js'
import './style.css';

const root = document.querySelector('body')
root.appendChild(welcome());
root.appendChild(image('image1'));
root.appendChild(image('image2'));
