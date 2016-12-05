(function() {
  'use strict';

  $('select').material_select();
  $('.modal').modal();

  let deck = [];
  let inputData = {};

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
    inputData = {};

    $('.input-field').find('input[type="number"]').each((index, element) => {
      inputData[element.id] = element.value;
    })
    $('.input-field').find('input:radio:checked').each((index, element) => {
      inputData[element.name] = element.value;
    })
  }

  const drawDeck = function(id, deckCount) {
    const cardCount = deckCount * 52
    const $xhr = $.ajax({
      method: 'GET',
      url:`https://deckofcardsapi.com/api/deck/${id}/draw/?count=${cardCount}`,
      dataType: 'json'
    })

    $xhr.done((result) => {
      if ($xhr.status !== 200) {
        return;
      }

      deck = result.cards.map((obj) => {
        const card = {};
        card.code = obj.code;
        card.images = obj.images;
        if (obj.value === inputData.value && obj.suit === inputData.suit) {
          card.condition = true;
        } else if (typeof(inputData.suit) === 'undefined' && obj.value === inputData.value) {
          card.condition = true;
        } else if (typeof(inputData.value) === 'undefined' && obj.suit === inputData.suit) {
          card.condition = true;
        } else {
          card.condition = false
        }
        return card;
      })
    })
  };

  const generateDeck = function(data) {
    const $xhr = $.ajax({
      method: 'GET',
      url: `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${data.q1}`,
      dataType: 'json'
    });

    $xhr.done((result) => {
      if ($xhr.status !== 200) {
        return;
      }

      const deckID = result.deck_id;

      drawDeck(deckID, data.q1);
    });
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
    collectData();
    generateDeck(inputData);
  });
})();
