(function() {
  'use strict';



  const tabSlideUp = function() {
    
    $('#input').slideUp();
  };

  $('#submit-input').on('click', () => {
    event.preventDefault();

    tabSlideUp();
  });

})();
