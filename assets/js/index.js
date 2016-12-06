(function() {
  'use strict';

  $('select').material_select();
  $('.modal').modal();

  let deck = [];
  let inputData = {};
  let maxRun = 0;
  let currentState = {
    occurrence: 0,
    total: 0
  };

  const numberValidate = function($input) {
    if ($input.val() !== '') {
      return true;
    } else {
      return false;
    }
  };

  const inputValidation = function($target) {
    const targetType = $target.find('input').attr('type');

    if (targetType === 'number') {
      return numberValidate($target.find('input'));
    }

    const radioVal = [];
    const radioCat = $('select.rules').val();

    $('input:radio:enabled:checked').each((index, element) => {
      radioVal.push($(element).val());
    });

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
  };

  const collectData = function() {
    inputData = {};
    inputData.rule = {};

    $('.input-field').find('input[type="number"]').each((index, element) => {
      inputData[element.id] = element.value;
    });
    $('.input-field').find('input:radio:checked').each((index, element) => {
      inputData.rule[element.name] = element.value;
    });

    maxRun = parseInt(inputData.q4);
    console.log(inputData);
  };

  const drawDeck = function(id, deckCount) {
    const cardCount = deckCount * 52;
    const $xhr = $.ajax({
      method: 'GET',
      url: `https://deckofcardsapi.com/api/deck/${id}/draw/?count=${cardCount}`,
      dataType: 'json'
    });

    $xhr.done((result) => {
      if ($xhr.status !== 200) {
        return;
      }

      deck = result.cards.map((obj) => {
        console.log(obj);
        const card = {};

        card.code = obj.code;
        card.images = obj.images;

        if (obj.value === inputData.rule.value && obj.suit === inputData.rule.suit) {
          card.condition = true;
        } else if (typeof inputData.suit === 'undefined' && obj.value === inputData.value) {
          card.condition = true;
        } else if (typeof inputData.value === 'undefined' && obj.suit === inputData.suit) {
          card.condition = true;
        } else {
          card.condition = false;
        }

        return card;
      });
    });
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
  };

  const displayCalculation = function(obj) {
    const arr = Object.keys(obj);

    if (arr.length === 2) {
      $('#calculation').text('1/4 x 1/13');
      $('#calc-prob').text('1/52 = 1.92%');
    } else if (arr.length === 1 && arr.includes('suit')) {
      $('#calculation').text('1/4');
      $('#calc-prob').text('1/4 = 25.00%');
    } else if (arr.length === 1 && arr.includes('value')) {
      $('#calculation').text('1/13');
      $('#calc-prob').text('1/13 = 7.69%');
    }
  };

  $('.question-field').on('click', '.current button', () => {
    event.preventDefault();
    const $curQuestion = $('.current');

    if (inputValidation($curQuestion)) {
      displayNextQ($curQuestion);
    } else {
      Materialize.toast('Please enter a valid response.', 2000);
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
    displayCalculation(inputData.rule);
  });

  const drawCard = function() {
    const len = deck.length;
    return deck[Math.floor(Math.random() * len)];
  };

  const updateMeasurement = function(obj) {
    if (obj.condition) {
      currentState.occurrence++;
    }
    currentState.total++;
  };

  const renderCard = function() {
    const card = drawCard();

    $('#card-image img').attr('src', card.images.png);
    if (card.condition) {
      $('#card-image img').addClass('occurrence');
    } else {
      $('#card-image img').removeClass('occurrence');
    }

    updateMeasurement(card);
    $('.mes-oc').text(currentState.occurrence);
    $('.mes-to').text(currentState.total);
    $('.mes-pr').text((currentState.occurrence / currentState.total * 100).toFixed(2));
  };

  const execution = function(fn, duration){
    let intervalID;

    return {
      start() {
        intervalID = setInterval(fn, duration);
      },
      stop() {
        clearInterval(intervalID);
      }
    };
  };

  const timer = execution(() => {
    renderCard();
    maxRun--;
  }, 1000);

  $('button[name="start"]').on('click', () => {
    $('button[name="start"]').toggleClass('hide');
    $('button[name="pause"]').toggleClass('hide');
    timer.start();
  });

  $('button[name="pause"]').on('click', () => {
    $('button[name="start"]').toggleClass('hide');
    $('button[name="pause"]').toggleClass('hide');
    timer.stop();
  });

})();
