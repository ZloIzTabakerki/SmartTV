(function() {  

  class App {
    constructor(states, UIElems) {

      // STATES

      this._volume = states.volume;
      this._currentChannel = states.currentChannel;
      // this._isOn = states.isOn;
      // this._isMuted = states.isMuted;

      this._channelsList = undefined;

      // UI ELEMENTS

      this._volumeControl = UIElems.volumeControl;
      this._volumeIndicators = UIElems.volumeIndicators;
      this._screenContent = UIElems.screenContent;
      this._currentChannelInfo = UIElems.currentChannelInfo;

      // this._muteControll = UIElems.muteControll;
      // this._shutdownControll = UIElems.shutdownControll;

      this._channelsListBtn = UIElems.channelsListBtn;

      this._asideListContainer = UIElems.asideListContainer;
      this._closeAsideBtn = UIElems.closeAsideBtn;
      this._channelsContainer = UIElems.channelsContainer;
      this._watchlistContainer = UIElems.watchlistContainer;
      this._reclistContainer = UIElems.reclistContainer;
      this._blockContainer = UIElems.blockContainer;
      
      this._channelBtns = undefined;

      // UI ELEMENTS HANDLERS

      this._volumeControl.onchange = () => {
        this.postNewVolumeValue();
      };

      this._channelsListBtn.onclick = () => {        
        this.toggleChannelsList();
      }
      
      this._closeAsideBtn.onclick = () => {
        this.closeAsideList();
      }
    }

    // subscribing for server updates in JSON

    subscribeStateUpdates() {

      let self = this;
      
      let xhr = new XMLHttpRequest();

      xhr.open("GET", '/update-state', true);
      xhr.send();

      xhr.onreadystatechange = function () {

        if (this.readyState != 4) return;

        // on error - send request again

        if (xhr.status != 200) {
          self.subscribeStateUpdates();
          return;
        }

        let result = this.responseText;
        
        console.log('Data achieved: ' + result);

        result = JSON.parse(result);

        // on achived data - refresh app values and graphic, then send request again

        self._refreshValues(result);
        
        self.subscribeStateUpdates();
      }

    }

    // set app state values if it presents in states obj

    _refreshValues(states) {

      if (states.volume) {
        this.setVolume(states.volume);
      }

      if (states.currentChannel) {
        this.setCurrentChannel(states.currentChannel);
      }

    }
        
    // send new volume value to the server in JSON

    postNewVolumeValue() {

      let body = `{"${this._volumeControl.name}":"${this._volumeControl.value}"}`;    
      let xhr = new XMLHttpRequest();

      xhr.open("POST", '/update-state', true)
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = function () {

        if (this.readyState != 4) return;

        if (this.status === 200) {
          console.log('New volume sent.');
        } else {
          console.log('New volume value wasn\'t sent')
        }
      }

      xhr.send(body);

    }

    // set app volume and refresh volume graphic indicators
    
    setVolume(value) {

      this._volume = value;

      console.log(`New volume: ${value}`);       

      this._renderNewVolumeValue(value);
      
    }
    
    // render volume changes on page 

    _renderNewVolumeValue(value) {
      
    // set height and upper gradient color for audio indicators 

      let color = `rgb(
                  ${ Math.round(255 * value / 100) },
                  ${ Math.round(255 - (255 * value / 100)) },
                  0)`;
        
      for (let i = 0, length = this._volumeIndicators.length; i < length; i++) {
        this._volumeIndicators[i].style.height = `${value}%`;
        this._volumeIndicators[i].style.backgroundImage = `linear-gradient(to top,
                                                    green 0%,
                                                    ${color} 100%)`;
      }

    }
    
    // open or close channel aside list

    toggleChannelsList() {

      let channelsListBtn = this._channelsListBtn;

      // if app doesn't contain channels list - get one from server

      if (!this._channelsList) {
        this.getCurrentChannelsList();
      }

      // show/hide aside list

      this._toggleAsideList(channelsListBtn.id);

      // toggle 'active' class

      if (!channelsListBtn.classList.contains('active')) {
        if (document.querySelector('.nav-btn.active')) {
          document.querySelector('.nav-btn.active').classList.remove('active');
        }
        channelsListBtn.classList.add('active');
      } else {
        channelsListBtn.classList.remove('active');
      }
    }
    
    // send new channel to the server in JSON

    postNewChannel(channelId) {

      let channels = this._channelsList;

      let body = `{"currentChannel":{
                  "id":"${channelId}",
                  "name":"${channels[channelId].name}",
                  "url":"${channels[channelId].url}"}}`;
                    
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

    // set app current channel and refresh channel graphic indicators

    setCurrentChannel(channelObj) {

      this._currentChannel = channelObj;

      this._renderCurrentChannel(channelObj);

    }

    // render new current channel on page

    _renderCurrentChannel(channelObj) {

      let name = channelObj.name;
      let imgUrl = channelObj.url;
      let channelId = channelObj.id;

      console.log(`New channel: ${name}`);

      // refresh screen content and current channel info

      this._screenContent.style.backgroundImage = `url('${imgUrl}')`;
      this._screenContent.textContent = name;
      this._currentChannelInfo.textContent = name;

      // if channels list were rendered - refresh active channel button

      if (this._channelBtns !== undefined) {

        if (document.querySelector('.channel-btn.active')) {
          document.querySelector('.channel-btn.active').classList.remove('active');
        }

        document.getElementById(`channel-${channelId}-btn`).classList.add('active');
      }

    }

    // set app channels and render it in on the page

    setChannelsList(newList) {
      this._channelsList = newList;
      this._renderChannelsList(newList);
    }

    // get channels list data from the server in JSON and set it in the app

    getCurrentChannelsList() {

      let self = this;
      
      let xhr = new XMLHttpRequest();

      xhr.open("GET", '/channels', true);
      xhr.send();

      xhr.onreadystatechange = function () {

        if (this.readyState != 4) return;

        // on error - invoke hadler again;

        if (xhr.status != 200) {
          channelsListBtnHandler.call(thisBtn);
          return;
        }

        let result = this.responseText;
        
        result = JSON.parse(result);
        self.setChannelsList(result);
        console.dir(smartApp._channelsList);

      }
    }

    // render channels list in document
    
    _renderChannelsList(channels) {
      
      let html = '';

      //for each channel in list - generate list item and then paste them into aside list container

      for (let key in channels) {

        let isActive = this._currentChannel.id === key ? ' active' : '';

        html += `<li class="channels-list-item">
                  <button class="channel-btn${ isActive }" 
                          id="channel-${key}-btn" 
                          data-channel-id="${key}"
                          style="background-image: url('${channels[key].url}')">
                    <span class="channel-heading">${channels[key].name}</span>
                  </button>
                </li>`;
      }

      this._channelsContainer.innerHTML = html;
      
      this._channelBtns = document.querySelectorAll('.channel-btn');

      for (let i = 0, max = this._channelBtns.length; i < max; i += 1) {
        this._channelBtns[i].onclick = function () {
          smartApp.postNewChannel(this.dataset.channelId);
        }
      }
    }

    // show/hide requested aside list depends on navs buttons id

    _toggleAsideList(btnId) {

      let asideListContainer = this._asideListContainer;
      let htmlElem = document.documentElement;

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

      function changeClasses(cssClass) {
        if (asideListContainer.classList.contains(cssClass)) {
          asideListContainer.classList.remove(cssClass);
          htmlElem.classList.remove('aside-list-showed');
        } else {
          asideListContainer.className = 'aside-list-container';
          asideListContainer.classList.add(cssClass);
          htmlElem.classList.add('aside-list-showed');
        }
      }
    }

    // close aside list: leave class that makes it "display: none", 
    // remove "active" class from nav btn and remove class from html-elem for aligning layout

    closeAsideList() {
      this._asideListContainer.className = 'aside-list-container';    
      document.querySelector('.nav-btn.active').classList.remove('active');       
      document.documentElement.classList.remove('aside-list-showed');
    }

  }

  // create new app 
  
  let smartApp = new App(states, {
    volumeControl: document.querySelector('.sound-controls'), 
    volumeIndicators: document.querySelectorAll('.audio-indicator'),
    screenContent: document.getElementById('screen-content'),
    channelsListBtn: document.getElementById('channels-btn'),

    closeAsideBtn: document.getElementById('close-aside-button'),
    asideListContainer: document.querySelector('.aside-list-container'),
    currentChannelInfo: document.querySelector('.current-info'),
    
    channelsContainer: document.querySelector('.aside-channels-items'),
    watchlistContainer: document.querySelector('.aside-watchlist-items'),
    reclistContainer: document.querySelector('.aside-reclist-items'),
    blockContainer: document.querySelector('.aside-blocklist-items')
  });

  // turn on subscribe for server updates

  smartApp.subscribeStateUpdates();

})();