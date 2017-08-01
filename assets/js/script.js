(function() {

  let smartApp;
  let app;
  
  function createApp() {  
    let xhr = new XMLHttpRequest();

    xhr.open("GET", '/current-state', true);
    xhr.send();

    xhr.onreadystatechange = function () {

      if (this.readyState != 4) return;

      if (xhr.status != 200) {
        createApp();
        return;
      }          
      
      let response = this.responseText;
          
      response = JSON.parse(response);
        
      console.dir(response);

      states = response;

      smartApp = new App(states, {
        volumeControl: document.querySelector('.sound-controls'), 
        volumeIndicators: document.querySelectorAll('.audio-indicator'),
        screenContent: document.getElementById('screen-content'),
        channelsListBtn: document.getElementById('channels-btn'),
        asideListContainer: document.querySelector('.aside-list-container'),
        currentChannelInfo: document.querySelector('.current-info'),
        
        channelsContainer: document.querySelector('.aside-channels-items'),
        watchlistContainer: document.querySelector('.aside-watchlist-items'),
        reclistContainer: document.querySelector('.aside-reclist-items'),
        blockContainer: document.querySelector('.aside-blocklist-items')
      });

      smartApp.refreshValues(states)
      smartApp.updateStates();

    }

  }

  createApp();

  function volumeControlHandler(e) {

    let body = `{"${this.name}":"${this.value}"}`;    
    let xhr = new XMLHttpRequest();

    xhr.open("POST", '/update-state', true)
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {

      if (this.readyState != 4) return;      
      console.log('POST-request done.');

    }

    xhr.send(body);
  }

  function channelsListBtnHandler(e) {
    if (!smartApp._channelsList) {
      fetch('/channels', {method: 'GET'})
        .then((res) => {
          return res.json();
        })        
        .then((result) => {

          smartApp.setChannelsList(result);
          console.dir(smartApp._channelsList);
          smartApp.renderChannelsList();

        })
        .catch((err) => {
          console.dir(err);
        });  
    }

    smartApp.toggleAsideList(this.id);
  }

  class App {
    constructor(states, UIElems) {
      this._volume = states.volume;
      this._currentChannel = states.currentChannel;
      this._isOn = states.isOn;
      this._isMuted = states.isMuted;

      this._channelsList = undefined;

      this._volumeControl = UIElems.volumeControl;
      this._volumeIndicators = UIElems.volumeIndicators;
      this._screenContent = UIElems.screenContent;
      this._currentChannelInfo = UIElems.currentChannelInfo;

      this._muteControll = UIElems.muteControll;
      this._shutdownControll = UIElems.shutdownControll;

      this._channelsListBtn = UIElems.channelsListBtn;

      this._asideListContainer = UIElems.asideListContainer;
      this._channelsContainer = UIElems.channelsContainer;
      this._watchlistContainer = UIElems.watchlistContainer;
      this._reclistContainer = UIElems.reclistContainer;
      this._blockContainer = UIElems.blockContainer;

      
      this._channelBtns = undefined;

      this._volumeControl.addEventListener('change', volumeControlHandler);
      this._channelsListBtn.addEventListener('click', channelsListBtnHandler);
    }

    _setVolume(value) {
      this._volume = value;
      console.log(`New volume: ${value}`);     

      let color = `rgb(
                  ${ Math.round(255 * value / 100) },
                  ${ Math.round(255 - (255 * value / 100)) },
                  0)`
        
      for (let i = 0, length = this._volumeIndicators.length; i < length; i++) {
        this._volumeIndicators[i].style.height = `${value}%`;
        this._volumeIndicators[i].style.backgroundImage = `linear-gradient(to top,
                                                    green 0%,
                                                    ${color} 100%)`;
      }
    }

    refreshValues(states) {
      if (states.volume) {
        this._setVolume(states.volume);
      }

      if (states.currentChannel) {
        this._setCurrentChannelId(states.currentChannel);
      }

    }

    setChannelsList(value) {      
      this._channelsList = value;
    }

    _setCurrentChannelId(channelObj) {

      let name = channelObj.name;
      let imgUrl = channelObj.url;
      let channelId = channelObj.id;

      console.log(`New channel: ${name}`);

      this._screenContent.style.backgroundImage = `url('${imgUrl}')`;
      this._screenContent.textContent = name;
      this._currentChannelInfo.textContent = name;

      if (this._channelBtns !== undefined) {

        if (document.querySelector('.channel-btn.active')) {
          document.querySelector('.channel-btn.active').classList.remove('active');
        }

        document.getElementById(`channel-${channelId}-btn`).classList.add('active');
      }
    }
    
    set _isOn(value) {
      
    }

    set _isMuted(value) {
      
    }

    updateStates() {

      let self = this;
      
      let xhr = new XMLHttpRequest();

      xhr.open("GET", '/update-state', true);
      xhr.send();

      xhr.onreadystatechange = function () {

        if (this.readyState != 4) return;

        // on error - reload page

        if (xhr.status != 200) {
          self.updateStates();
          return;
        }

        let response = this.responseText;
        
        console.log('Data achieved: ' + response);

        response = JSON.parse(response);

        self.refreshValues(response);
        
        self.updateStates();
      }


      // let f = fetch('/update-state', {method: 'GET'})
      //   .then((res) => {
      //     return res.json();
      //   })
      //   .then((result) => {
      //     if (result.volume) {
      //       this._setVolume(result.volume);
      //     }
          
      //     f.abort();

      //     this.updateStates();
      //   })
      //   .catch((err) => {
      //     console.dir(err);

      //     this.updateStates();
      //   });   
        
    }

    toggleAsideList(btnId) {

      let self = this;

      function changeClasses(cssClass) {
        if (self._asideListContainer.classList.contains(cssClass)) {
          self._asideListContainer.classList.remove(cssClass);
        } else {
          self._asideListContainer.cssClass = 'aside-list-container';
          self._asideListContainer.classList.add(cssClass);
        }

        if (response.currentChannelId) {
          self._setCurrentChannelId(response.currentChannelId);
        }
        
        self.updateStates();
      }

      switch(btnId) {
        case 'channels-btn':
          changeClasses('show-channels');
          break;
        case 'watchlist-btn':
          changeClasses('show-watchlist');
          break;
        case 'reclist-btn':
          changeClasses('show-reclist');
          break;
        case 'blocklist-btn':
          changeClasses('show-blocklist');
          break;
      }
    }

    renderChannelsList() {
      const channels = this._channelsList;
      let HTML = '';

      function updateCurrentChannel(channelId) {

          let body = `{"currentChannel":{"id":"${channelId}","name":"${channels[channelId].name}","url":"${channels[channelId].url}"}}`;    
          let xhr = new XMLHttpRequest();

          console.dir(JSON.parse(body));

          xhr.open("POST", '/update-state', true)
          xhr.setRequestHeader('Content-Type', 'application/json');

          xhr.onreadystatechange = function () {

            if (this.readyState != 4) return;      
            console.log('POST-request done.');

          }

          xhr.send(body);

      }

      for (let key in channels) {
        HTML += `<li class="channels-list-item">
                  <button class="channel-btn" id="channel-${key}-btn" data-channel-id="${key}">
                  <img src="${channels[key].url}" alt="${channels[key].name}" class="channel-img">
                  <span class"channel-heading">${channels[key].name}</span>
                  </button>
                </li>`;
      }

      this._channelsContainer.innerHTML = HTML;
      
      this._channelBtns = document.querySelectorAll('.channel-btn');

      for (let i = 0, max = this._channelBtns.length; i < max; i += 1) {
        this._channelBtns[i].onclick = function () {
          updateCurrentChannel(this.dataset.channelId);
        }
      }
    }

  }



})();