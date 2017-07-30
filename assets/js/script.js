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

    console.log('Data sent: ' + body);

    xhr.open("POST", '/update-state', true)
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {

      if (this.readyState != 4) return;
      
      console.log('POST-request done.');
    };

    xhr.send(body);
  }

  function updateAppState() {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", '/update-state', true);
    xhr.send();

    xhr.onreadystatechange = function () {

      if (this.readyState != 4) return;

      // on error - reload page

      if (xhr.status != 200) {
        location.reload(true);
        return;
      }

      let response = this.responseText;
      
      console.log('Data achieved: ' + response);

      response = JSON.parse(response);

      if (response.volume) {

        let volume = response.volume;
        
        for (let i = 0, length = audioIndicators.length; i < length; i++) {
          audioIndicators[i].style.height = `${volume}%`;
          audioIndicators[i].style.backgroundColor = `rgb(
                                                      ${ Math.round(255 * volume / 100) },
                                                      ${ Math.round(255 - (255 * volume / 100)) },
                                                      0)`;
          console.log(audioIndicators[i].style.backgroundColor);
        }

      }

      updateAppState();
    }
  }

  updateAppState();

})();