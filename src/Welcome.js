import './style.css';

module.exports = function() {
  var welcome = document.createElement('div');
  welcome.textContent = "Hello webpack!";
  welcome.classList.add('welcome');
  return welcome;
};
