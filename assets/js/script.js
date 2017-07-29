'use strict';

console.log('attached!');

(function () {
  const volumeControl = document.querySelector('.sound-controls');
  const audioIndicators = document.querySelectorAll('.audio-indicator');
  
  volumeControl.addEventListener('change', volumeChangeCallback);

  function volumeChangeCallback(e) {
    let xhr = new XMLHttpRequest();
    let data = {};

    data[this.name] = this.value;

    let body = JSON.stringify(data);

    console.log(body);

    xhr.open("POST", '/edit-volume', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function () {

      if (this.readyState != 4) return;

      let response = this.responseText;
      
      console.log(response);

      for (let i = 0, length = audioIndicators.length; i < length; i++) {
        audioIndicators[i].style.height = `${response}%`;
        audioIndicators[i].style.backgroundColor = `rgb(
                                                    ${ Math.round(255 * response / 100) },
                                                    ${ Math.round(255 - (255 * response / 100)) },
                                                    0)`;
        console.log(audioIndicators[i].style.backgroundColor);
      }

    };

    xhr.send(body);
  }
})();