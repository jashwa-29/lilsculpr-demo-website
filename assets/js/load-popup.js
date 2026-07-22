(function() {
  'use strict';
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'assets/html/workshop-popup.html', false);
    xhr.overrideMimeType('text/html');
    xhr.send();
    if (xhr.status === 200) {
      document.body.insertAdjacentHTML('beforeend', xhr.responseText);

      var popup = document.querySelector('.popup-container');
      var closeBtn = document.querySelector('.close-btn');
      var tab = document.querySelector('.popup-tab');

      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          if (popup) popup.classList.add('collapsed');
        });
      }

      if (tab) {
        tab.addEventListener('click', function() {
          if (popup) popup.classList.remove('collapsed');
        });
      }
    } else {
      console.error('Failed to load workshop popup: HTTP ' + xhr.status);
    }
  } catch (e) {
    console.error('Failed to load workshop popup:', e);
  }
})();
