import moment from 'moment';
import _ from 'lodash';

export default function() {
  var arr = [0, 1, 2];
  _.fill(arr, 0);
  arr[1] = [moment().format('YYYY-MM-DD')];

  var welcome = document.createElement('div');
  welcome.textContent = 'Hello webpack!' + arr.join(' <> ');
  welcome.classList.add('welcome');
  return welcome;
};
