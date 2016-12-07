(function() {
  'use strict';

  $('#add-condition').on('click', () => {
    $('.conditions-input').clone(true, true).insertBefore($('.prepend-target'))
  });
})();
