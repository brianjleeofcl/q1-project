(function() {
  'use strict';

  $('select').material_select();
  $('.modal').modal();

  const numberValidate = function($input) {
    if ($input.val() !== '') {
      return true;
    } else {
      return false;
    }
  }

  const inputValidation = function($target) {
    const targetType = $target.find('input').attr('type');

    if (targetType === 'number') {
      return numberValidate($target.find('input'));
    }

    const radioVal = [];
    const radioCat = $('select.rules').val()

    $('input:radio:enabled:checked').each((index, element) => {
      radioVal.push($(element).val());
    })

    console.log(radioVal.length, radioCat.length);
    if (radioCat.length !== 0 && radioVal.length === radioCat.length) {
      return true;
    } else {
      return false;
    }
  };

  const displayNextQ = function($target) {
    $target.toggleClass('current grey-text');
    $target.find('input').prop('disabled', true);
    $target.find('button').prop('disabled', true);
    $target.next().toggleClass('current hide');
  }

  const collectData = function() {
    const obj = {};
    $('.input-field').find('input[type="number"]').each((index, element) => {
      obj[element.id] = element.value;
    })
    $('.input-field').find('input:radio:checked').each((index, element) => {
      obj[element.name] = element.value;
    })
    return obj
  }

  $('.question-field').on('click', '.current button', () => {
    event.preventDefault();
    const $curQuestion = $('.current');

    if (inputValidation($curQuestion)) {
      displayNextQ($curQuestion);
    } else {
      Materialize.toast('Please enter a valid response.', 2000)
    }
  });

  $('select.rules').on('change', () => {
    const selected = $('select.rules').val();

    if (selected.includes('suit')) {
      $('.suits input[type="radio"]').prop('disabled', false);
    } else {
      $('.suits input[type="radio"]').prop('disabled', true);
    }

    if (selected.includes('value')) {
      $('.values input[type="radio"]').prop('disabled', false);
    } else {
      $('.values input[type="radio"]').prop('disabled', true);
    }
  });

  $('#submit-input').on('click', () => {
    $('#input').css('min-height', 0);
    $('#input').slideUp();
    const data = collectData();
    console.log(data);
  });
})();
