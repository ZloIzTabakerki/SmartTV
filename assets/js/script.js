(function() {  

  class App {
    constructor(states, UIElems) {

      // STATES

      this._volume = states.volume;
      this._currentChannel = states.currentChannel;
      // this._isOn = states.isOn;
      // this._isMuted = states.isMuted;

      this._channelsList = undefined;
      this._watchList = undefined;

      // UI ELEMENTS

      this._volumeControl = UIElems.volumeControl;
      this._volumeIndicators = UIElems.volumeIndicators;
      this._screenContent = UIElems.screenContent;
      this._currentChannelInfo = UIElems.currentChannelInfo;

      // this._muteControll = UIElems.muteControll;
      // this._shutdownControll = UIElems.shutdownControll;

      this._channelsListBtn = UIElems.channelsListBtn;
      this._watchListBtn = UIElems.watchListBtn;

      this._asideListContainer = UIElems.asideListContainer;
      this._closeAsideBtn = UIElems.closeAsideBtn;

      this._channelsContainer = UIElems.channelsContainer;
      this._watchlistContainer = UIElems.watchlistContainer;
      this._reclistContainer = UIElems.reclistContainer;
      this._blockContainer = UIElems.blockContainer;

      //watchlist elems

      this._newWatchListFormContainer = undefined;
      this._newWatchListFormBtn = UIElems.newWatchListFormBtn;
      
      this._channelBtns = undefined;

      // UI ELEMENTS HANDLERS

      this._volumeControl.onchange = () => {
        this.postNewVolumeValue();
      };

      this._channelsListBtn.onclick = () => {        
        this.toggleChannelsList();
      }
      
      this._watchListBtn.onclick = () => {        
        this.toggleWatchList();
      }
      
      this._closeAsideBtn.onclick = () => {
        this.closeAsideList();
      }

      this._newWatchListFormBtn.onclick = () => {
        this.toggleNewWatchListItemForm();
      }
    }
        
    // send new volume value to the server in JSON

    postNewVolumeValue() {

      let body = `{"${this._volumeControl.name}":"${this._volumeControl.value}"}`;
      let self = this;  
      let xhr = new XMLHttpRequest();

      xhr.open("POST", '/update-state', true)
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = function () {

        if (this.readyState != 4) return;

        if (this.status === 200) {
          self.setVolume(self._volumeControl.value);
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
        this.getCurrentChannelsList((result) => {
          this.setChannelsList(result);
          this._renderChannelsList();
        });
      }

      if (!this._channelBtns && this._channelsList) {
        this._renderChannelsList();
      }

      // show/hide aside list

      this._toggleAsideList(channelsListBtn.id);

      // toggle 'active' class on button

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
      let self = this;
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
        
        if (this.status === 200) {
          console.log('POST-request done.');
          self.setCurrentChannel({
            id: channelId,
            name: channels[channelId].name,
            url: channels[channelId].url
          });
        }

      }

      xhr.send(body);

    }

    // set app current channel and refresh channel graphic indicators

    setCurrentChannel(channelObj) {

      this._currentChannel = channelObj;

      this._renderCurrentChannel(channelObj);

    }
    
    // get channels list data from the server in JSON and set it in the app

    getCurrentChannelsList(func) {

      let self = this;
      
      let xhr = new XMLHttpRequest();

      xhr.open("GET", '/channels', true);
      xhr.send();

      xhr.onreadystatechange = function () {

        if (this.readyState != 4) return;

        // on error - invoke method again;

        if (xhr.status != 200) {
          self.getCurrentChannelsList();
          return;
        }

        let result = this.responseText;

        result = JSON.parse(result);
        
        func(result);
      }
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
    }
    
    // render channels list in document
    
    _renderChannelsList() {

      let channels = this._channelsList;
      
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

    toggleWatchList() {

      let watchListBtn = this._watchListBtn;
      
      // if app doesn't contain channels list - get one from server
      // then get watchlist and render it

      if (!this._channelsList) {
        this.getCurrentChannelsList((result) => {
          this.setChannelsList(result);
          this.getCurrentWatchList((result) => {
            this.setWatchList(result);
            this._renderWatchList();
          });
        });
      }
      
      // if app doesn't contain watch list - get one from server and render it

      if (!this._watchList && this._channelsList) {
        this.getCurrentWatchList((result) => {
          this.setWatchList(result);
          this._renderWatchList();
        });
      }

      // show/hide aside list

      this._toggleAsideList(watchListBtn.id);

      // toggle 'active' class

      if (!watchListBtn.classList.contains('active')) {
        if (document.querySelector('.nav-btn.active')) {
          document.querySelector('.nav-btn.active').classList.remove('active');
        }
        watchListBtn.classList.add('active');
      } else {
        watchListBtn.classList.remove('active');
      }
    }

    _renderWatchList() {
      let html = '';
      let self = this;

      this._watchList.forEach(function(item, i, arr) {
        html += `<li class="watchlist-item"> 
                  <div class="watch-item-container">                 
                    <h3 class="watch-item-name">${item.name}</h3>
                    <div class="watch-item-logo" 
                        style="background-image: url('${self._channelsList[item.channelId].url}');">
                    </div>
                    <div class="watch-item-channel">
                      <span class="watch-time">${item.time}</span>, ${self._channelsList[item.channelId].name}
                    </div>
                    <div class="watch-item-btns">
                      <button class="watch-item-btn watch-item-edit">
                        <i class="fa fa-pencil" aria-hidden="true"></i>
                      </button>
                      <button class="watch-item-btn watch-item-delete">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </li>`
      })

      this._watchlistContainer.innerHTML = html;
    }

    // set new watchlist and render it on page

    setWatchList(newWatchList) {
      this._watchList = newWatchList;
    }

    // get watchlist data from the server in JSON and set it in the app

    getCurrentWatchList(func) {

      let self = this;
      
      let xhr = new XMLHttpRequest();

      xhr.open("GET", '/watchlist', true);
      xhr.send();

      xhr.onreadystatechange = function () {

        if (this.readyState != 4) return;

        // on error - invoke hadler again;

        if (xhr.status != 200) {
          // self.getCurrentWatchList();

          let result = [{
            time: '10:00',
            name: 'Looney tunes',
            channelId: 1
          }, {
            time: '11:00',
            name: 'Rick and Morty',
            channelId: 3
          }, {
            time: '14:00',
            name: 'Archer',
            channelId: 6
          }, {
            time: '11:00',
            name: 'Rick and Morty',
            channelId: 3
          }, {
            time: '14:00',
            name: 'Archer',
            channelId: 6
          }, {
            time: '11:00',
            name: 'Rick and Morty',
            channelId: 3
          }, {
            time: '14:00',
            name: 'Archer',
            channelId: 6
          }, {
            time: '11:00',
            name: 'Rick and Morty',
            channelId: 3
          }, {
            time: '14:00',
            name: 'Archer',
            channelId: 6
          }, {
            time: '11:00',
            name: 'Rick and Morty',
            channelId: 3
          }, {
            time: '14:00',
            name: 'Archer',
            channelId: 6
          }];

          func(result);

          return;
        }

        let result = this.responseText;
        
        result = JSON.parse(result);
        func(result);

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

    toggleNewWatchListItemForm() {
      
      if (!this._newWatchListFormContainer) {
        this._renderNewWatchListItemForm();
      }

      let newWatchlistForm = document.forms['new-watchlist-form'];
      
      if (newWatchlistForm.getAttribute('action') !== 'watchlist/new') {
        newWatchlistForm.setAttribute('action', 'watchlist/new')
        newWatchlistForm.reset();
      };

      this._newWatchListFormContainer.classList.toggle('active');
      this._newWatchListFormBtn.classList.toggle('opened')
    }

    //

    _renderNewWatchListItemForm() {

      var formContainer = document.createElement('li');

      formContainer.className = 'watchlist-item new-watchlist-form-container';

      let html = `<form method="POST" 
                        action="watchlist/new" 
                        class="new-watchlist-form watch-item-container" 
                        name="new-watchlist-form">
                    <div class="watch-item-logo" id="watch-item-form-logo">
                    </div>
                    <div class="watch-item-field-container">
                      <label for="watch-item-name-field"
                              class="watch-item-label watch-item-name-label">
                        Name
                      </label>
                      <input type="name" 
                              name="name"
                              id="watch-item-name-field" 
                              class="watch-item-field watch-item-name-field"
                              required>   
                    </div>
                    <div class="watch-item-field-container">                                 
                      <label for="watch-item-time-field"
                              class="watch-item-label watch-item-time-label">
                        Time
                      </label>
                      <input type="datetime-local" 
                              name="time"
                              id="watch-item-time-field" 
                              class="watch-item-field watch-item-time-field" 
                              required>   
                    </div>
                    <div class="watch-item-field-container">                                                            
                    <label for="watch-item-channel-select"
                            class="watch-item-label watch-item-channel-select">
                      Channel
                    </label>
                    <select id="watch-item-channel-select"
                            name="channel"
                            class="watch-item-field watch-item-channel-select"
                            required>
                      <option></option>`
      
      let selectOptions = ''

      let channels = this._channelsList;

      for (let key in channels) {
        selectOptions += `<option value="${key}">${channels[key].name}</option>`
      }
      
      html += selectOptions + `</select>
                                </div>
                                <input type="submit" value="Add new">
                                <input type="reset" value="Reset">
                              </form>`;

      formContainer.innerHTML = html;

      this._watchlistContainer.insertBefore(formContainer, document.querySelector('.watchlist-item:first-child'));
      
      let self = this;

      document.getElementById('watch-item-channel-select').onchange = function () {
        let logoContainer = document.getElementById('watch-item-form-logo');
        let imageUrl = `url('${self._channelsList[this.value].url}')`;
        logoContainer.style.backgroundImage = imageUrl;
      }

      this.setNewWatchListFormContainer(formContainer);
    }

    setNewWatchListFormContainer(newContainer) {
      this._newWatchListFormContainer = newContainer
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
    watchListBtn: document.getElementById('watchlist-btn'),

    closeAsideBtn: document.getElementById('close-aside-button'),
    asideListContainer: document.querySelector('.aside-list-container'),
    currentChannelInfo: document.querySelector('.current-info'),
    
    channelsContainer: document.querySelector('.aside-channels-items'),
    watchlistContainer: document.querySelector('.aside-watchlist-items'),
    reclistContainer: document.querySelector('.aside-reclist-items'),
    blockContainer: document.querySelector('.aside-blocklist-items'),

    newWatchListFormBtn: document.getElementById('add-watch-item-btn'),
  });

  // turn on subscribe for server updates

})();