(function() {  

  class App {
    constructor(states, UIElems) {

      // STATES

      this._volume = states.volume;
      this._currentChannel = states.currentChannel;
      // this._isOn = states.isOn;
      // this._isMuted = states.isMuted;

      this._channelsList = undefined;
      this._watchList = [];

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

      this._channelsContainer.addEventListener('click', (e) => {
        let target = e.target.closest('.channel-btn');

        if (!target) return;

        let channelId = target.dataset.channelId;

        if (channelId === this._currentChannel.id) return;

        this.postNewChannel(channelId);
      });
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

    // render watchlistin document using app._watchList

    _renderWatchList() {

      const html = this._getWatchListHTML();

      this._watchlistContainer.innerHTML = html;

      // edit-button handler

      this._watchlistContainer.addEventListener('click', (e) => {

        // event's target must be edit button. else - 'return' 

        const target = e.target.closest('.watch-item-edit');

        if (!target) return;

        // look for item's container, append for in it

        const itemContainer = target.closest('.watchlist-item');

        // render editing form and hide item content by adding class 'editing'

        itemContainer.classList.add('editing');
        
        // get item's ID from button's data-attribute

        const watchListId = target.dataset.watchlistId;

        // get object from clients DB by ID

        const watchObj = this._watchList[watchListId];

        // generate editing form HTML

        const editingForm = this.getWatchListForm(watchObj);

        // create form wrapper and render editing form

        const formContainer = document.createElement('div');

        formContainer.innerHTML = editingForm;

        itemContainer.append(formContainer);

      });

      // delete-button handler
      
      this._watchlistContainer.addEventListener('click', (e) => {

        //save app object in variable
        
        const self = this;

        // event's target must be delete button. else - 'return' 

        const target = e.target.closest('.watch-item-delete');

        if (!target) return;

        // ask confirm for operation

        const confirmDelete = confirm("Are you sure you want to delete this?");

        if (!confirmDelete) return;

        const xhr = new XMLHttpRequest();

        // get item's ID from button's data-attribute

        const watchListId = target.dataset.watchlistId;

        xhr.open('DELETE', `watchlist/${watchListId}`);

        xhr.send();

        xhr.onreadystatechange = function () {

          if (this.readyState != 4) return;
          
          if (this.status !== 200) {
            console.log('Something went wrong.');
            return;
          }

          // on success delete item in client's DB

          self._watchList.splice(watchListId, 1);

          // render new watchlist with new data

          self._watchlistContainer.innerHTML = self._getWatchListHTML();

          // if new watchlist form was opened - it will be deleted. 
          // so new watchlist form button must show closed state 

          self._newWatchListFormBtn.classList.remove('opened');
        }

      });

      // new item creating handler
      
      this._watchlistContainer.addEventListener('submit', (e) => {        

        //save app object in variable
        
        const self = this;

        // cancel default action

        e.preventDefault();

        // cancel action in case form is not form for adding new item

        const target = e.target;

        if (target.getAttribute('name') !== 'new-watchlist-form') return;

        // get data from inputs
        
        const newName = target.name.value,
              newTime = target.time.value,
              newChannel = target.channelId.value;

        // create new item

        const data = {
          name: newName,
          time: newTime,
          channelId: newChannel
        }

        // encode item for sending on server
        
        let body = [];

        for (let key in data) {
          body.push(`${key}=${encodeURIComponent(data[key])}`);
        }

        body = body.join('&');
        
        let xhr = new XMLHttpRequest();

        xhr.open('POST', target.action);

        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.send(body);

        xhr.onreadystatechange = function () {

          if (this.readyState != 4) return;
          
          if (this.status !== 200) {
            console.log('Something went wrong.');
            return;
          }

          // on success add new item in client's DB 

          const watchList = self._watchList;
          
          watchList.push(data);

          // sort new watchlist array by date

          watchList.sort((a, b) => {
            return new Date(a.time) > new Date(b.time) ? 1 : -1;
          });
          
          // target.closest('.new-watchlist-form').parentNode.remove();

          // render new watchlist with new data

          self._watchlistContainer.innerHTML = self._getWatchListHTML();          

          // if new watchlist form was opened - it will be deleted. 
          // so new watchlist form button must show closed state 

          self._newWatchListFormBtn.classList.remove('opened');
        }
      });
      
      // edit watchlist item handler

      this._watchlistContainer.addEventListener('submit', (e) => {
        
        //save app object in variable

        const self = this;

        // cancel default sction

        e.preventDefault();

        const target = e.target;

        // if 'submit' was envoked by new watchlist item form - cancel action

        if (target.getAttribute('name') === 'new-watchlist-form') return;

        // get item ID from form action attribute

        const action = target.getAttribute('action');

        const watchListId = action.slice(action.lastIndexOf('/') + 1);
        
        const newName = target.name.value,
              newTime = target.time.value,
              newChannel = target.channelId.value;

        const watchlistOld = this._watchList[watchListId];

        // if values didn't change - show old content and remove form

        if (newName === watchlistOld.name && newTime === watchlistOld.time && newChannel === watchlistOld.channelId) {
          
          target.closest('.watchlist-item').classList.remove('editing');

          target.closest('.new-watchlist-form').parentNode.remove();
          
          return;

        }

        // create new item

        const data = {
          name: newName,
          time: newTime,
          channelId: newChannel
        }

        // encode item for sending on server
        
        let body = [];

        for (let key in data) {
          body.push(`${key}=${encodeURIComponent(data[key])}`);
        }

        body = body.join('&');
        
        let xhr = new XMLHttpRequest();

        xhr.open('PUT', target.action);

        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        console.log(decodeURIComponent(data));

        xhr.send(body);

        xhr.onreadystatechange = function () {

          if (this.readyState != 4) return;
          
          if (this.status !== 200) {
            console.log('Something went wrong.');
            return;
          }

          // on success remove old object, add new to watchlist and render new on page

          const watchList = self._watchList;
          
          watchList.splice(watchListId, 1);

          watchList.push(data);

          watchList.sort((a, b) => {
            return new Date(a.time) > new Date(b.time) ? 1 : -1;
          });

          self._watchlistContainer.innerHTML = self._getWatchListHTML();

          // if new watchlist form was opened - it will be deleted. 
          // so new watchlist form button must show closed state 

          self._newWatchListFormBtn.classList.remove('opened');

        }

      });
      
      this._watchlistContainer.addEventListener('click', (e) => {

        const target = e.target.closest('.watch-cancel-btn');

        if (!target) return;

        // show content, remove form
        
        target.closest('.watchlist-item').classList.remove('editing');

        target.closest('.new-watchlist-form').parentNode.remove();

      });
    }

    // generate watchlist HTML

    _getWatchListHTML() {  
      
      let html = '';

      const self = this;
      
      this._watchList.forEach(function(item, i, arr) {
        
        let time = new Date(item.time).toLocaleString('en-GB', {
          weekday: 'short', 
          hour: '2-digit',
          minute: '2-digit'
        });

        html += `<li class="watchlist-item"> 
                  <div class="watch-item-container">                 
                    <h3 class="watch-item-name">${item.name}</h3>
                    <div class="watch-item-logo" 
                        style="background-image: url('${self._channelsList[item.channelId].url}');">
                    </div>
                    <div class="watch-item-channel">
                      <span class="watch-time">${time}</span>, ${self._channelsList[item.channelId].name}
                    </div>
                    <div class="watch-item-btns">
                      <button class="watch-item-btn watch-item-edit" data-watchlist-id="${i}">
                        <i class="fa fa-pencil" aria-hidden="true"></i>
                      </button>
                      <button class="watch-item-btn watch-item-delete" data-watchlist-id="${i}">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </li>`
      })

      return html;
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
          self.getCurrentWatchList();
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

    // show/hide new watchlist item form

    toggleNewWatchListItemForm() {

      // if there wasn't new watchlist item form - render it
      
      if (!document.forms['new-watchlist-form']) {
        this._renderNewWatchListItemForm();
      }

      let newWatchlistFormContainer = document.forms['new-watchlist-form'].parentNode;
      
      newWatchlistFormContainer.classList.toggle('active');
      this._newWatchListFormBtn.classList.toggle('opened');
    }

    //creating new watchlist item form and render on page

    _renderNewWatchListItemForm() {

      var formContainer = document.createElement('li');

      formContainer.className = 'watchlist-item new-watchlist-form-container';

      let html = this.getWatchListForm();

      formContainer.innerHTML = html;

      this._watchlistContainer.insertBefore(formContainer, document.querySelector('.watchlist-item:first-child'));
      
      let self = this;
    }

    // generate watchlist form HTML. if watchlist object exists - edit form, else - new watchlist item form;

    getWatchListForm(watchListObj) {

      let watchListId = watchListObj ? this._watchList.indexOf(watchListObj) : undefined;
      
      let channels = this._channelsList;
      
      let url = watchListObj ?
                `${watchListId}` :
                'new';
      let formName = watchListObj ?
                     `edit-watchlist-${watchListId}-form`:
                     'new-watchlist-form';
      let nameValue = watchListObj ? watchListObj.name : '';
      let timeValue = watchListObj ? watchListObj.time : '';
      let channelId = watchListObj ? watchListObj.channelId : '';
      let logoURL = watchListObj ? `url('${channels[channelId].url}')` : '' ;
      let inputId = watchListObj ? `${channelId}-` : '';

      let html = `<form method="POST" 
                        action="watchlist/${url}" 
                        class="new-watchlist-form watch-item-container" 
                        name="${formName}">
                    <div class="watch-item-logo" 
                         id="watch-item-form-logo"
                         style="background-image: ${logoURL}">
                    </div>
                    <div class="watch-item-field-container">
                      <label for="watch-item-${inputId}name-field"
                              class="watch-item-label watch-item-name-label">
                        Name
                      </label>
                      <input type="name" 
                             name="name"
                             id="watch-item-${inputId}name-field" 
                             class="watch-item-field watch-item-name-field"
                             value="${nameValue}"
                             required>   
                    </div>
                    <div class="watch-item-field-container">                                 
                      <label for="watch-item-${inputId}time-field"
                              class="watch-item-label watch-item-time-label">
                        Time
                      </label>
                      <input type="datetime-local" 
                             name="time"
                             id="watch-item-${inputId}time-field" 
                             class="watch-item-field watch-item-time-field" 
                             value="${timeValue}"
                             required>   
                    </div>
                    <div class="watch-item-field-container">                                                            
                    <label for="watch-item-${inputId}channel-select"
                            class="watch-item-label watch-item-channel-label">
                      Channel
                    </label>
                    <select id="watch-item-${inputId}channel-select"
                            name="channelId"
                            class="watch-item-field watch-item-channel-select"
                            required>
                      <option></option>`;
      
      let selectOptions = '';

      if(watchListObj) {
        for (let key in channels) {
          selectOptions += `<option value="${key}"${channelId === key ?
                           ' selected' :
                           ''}>${channels[key].name}</option>`;
        }
      } else {
        for (let key in channels) {
          selectOptions += `<option value="${key}">${channels[key].name}</option>`;
        }
      }
      
      html += selectOptions + `</select>
                                </div>
                                <input type="submit" value="Add new">
                                ${ watchListObj ?
                                  '<button type="button" class="watch-cancel-btn">Cancel</button>' :
                                  '<input type="reset" value="Reset">'
                                }
                              </form>`;

      this._watchlistContainer.addEventListener('change', (e) => {
        let target = e.target.closest('.watch-item-channel-select');

        if (!target) return;

        let targetContainer = target.closest('.new-watchlist-form');

        let logoContainer = targetContainer.querySelector('.watch-item-logo');

        let channels = this._channelsList;

        let imgUrl = `url('${channels[target.value].url}')`;

        logoContainer.style.backgroundImage = imgUrl;
      })

      return html;
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