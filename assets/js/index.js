(function() {
  'use strict';

  $('select').material_select();

  const inputValidation = function() {
    return
  };

  const displayNextQ = function($target) {
    $target.toggleClass('current grey-text');
    $target.find('input').prop('disabled', true);
    $target.find('button').prop('disabled', true);
    $target.next().toggleClass('current hide');
  }

  $('.question-field').on('click', '.current button', () => {
    event.preventDefault();
    const $curQuestion = $('.current');

    displayNextQ($curQuestion);
  });

  $('#submit-input').on('click', () => {
    $('#input').css('min-height', 0);
    $('#input').slideUp();
  });
})();
