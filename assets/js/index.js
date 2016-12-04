(function() {
  'use strict';

  $('.question-field').on('click', '.current button', () => {
    event.preventDefault();
    const $target = $('.current');

    $target.toggleClass('current grey-text')
    $target.find('input').prop('disabled', true)
    $target.next().toggleClass('current hide')
    $(event.target).prop('disabled', true)
  })

  $('#submit-input').on('click', () => {
    $("#input").css('min-height', 0)
    $('#input').slideUp();
  });

})();
