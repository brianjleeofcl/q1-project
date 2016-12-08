(function() {
  'use strict';

  $('select').material_select();
  $('.modal').modal();

  let deck = [];
  let inputData = {};
  let remainingRuns = 0;
  let currentState = {
    occurrence: 0,
    total: 0
  };

  const numberValidate = function($input) {
    return $input.val() !== '' && parseInt($input.val()) > 0;
  };

  const inputValidation = function($target) {
    const targetType = $target.find('input').attr('type');

    if (targetType === 'number') {
      return numberValidate($target.find('input'));
    }

    const radioVal = [];
    const radioCat = $('select.rules').map((i, element) => {
      return $(element).val();
    });

    $('input:radio:enabled:checked').each((index, element) => {
      radioVal.push($(element).val());
    });

    return radioCat.length !== 0 && radioVal.length === radioCat.length;
  };

  const displayNextQ = function($target) {
    $target.toggleClass('current grey-text');
    $target.find('input').prop('disabled', true);
    $target.find('button').toggleClass('hide');
    $target.find('a').toggleClass('hide');
    $target.next().toggleClass('current grey-text');
    $target.next().find('input').prop('disabled', false);
    $target.next().find('button').toggleClass('hide');
  };

  const collectData = function() {
    inputData = {};
    inputData.rule = [];

    $('.input-field').find('input[type="number"]').each((index, element) => {
      inputData[element.id] = element.value;
    });
    $('.input-field').find('input:radio:checked').each((index, element) => {
      const arrIndex = parseInt(element.name.match(/\d+/));
      const type = element.name.match(/\w+/);

      inputData.rule[arrIndex] = {};
      inputData.rule[arrIndex][type] = element.value;
    });

    remainingRuns = parseInt(inputData.repeats);
  };

  const drawDeck = function(id) {
    const $xhr = $.ajax({
      method: 'GET',
      url: `https://deckofcardsapi.com/api/deck/${id}/draw/?count=52`,
      dataType: 'json'
    });

    $xhr.done((result) => {
      if ($xhr.status !== 200) {
        return;
      }

      deck = result.cards.map((obj) => {
        const card = {};

        card.code = obj.code;
        card.images = obj.images;
        card.condition = false;

        for (const ruleObj of inputData.rule) {
          if (obj.value === ruleObj.value && obj.suit === ruleObj.suit) {
            card.condition = true;
          }
          else if (typeof ruleObj.suit === 'undefined' && obj.value === ruleObj.value) {
            card.condition = true;
          }
          else if (typeof ruleObj.value === 'undefined' && obj.suit === ruleObj.suit) {
            card.condition = true;
          }
        }

        return card;
      });
    });
  };

  const generateDeck = function(data) {
    const $xhr = $.ajax({
      method: 'GET',
      url: 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1',
      dataType: 'json'
    });

    $xhr.done((result) => {
      if ($xhr.status !== 200) {
        return;
      }

      const deckID = result.deck_id;

      drawDeck(deckID);
    });
  };

  const displayCalculation = function(obj) {
    const arr = Object.keys(obj);

    if (arr.length === 2) {
      $('#calculation').text('1/4 x 1/13');
      $('#calc-prob').text('1/52 = 1.92%');
    }
    else if (arr.length === 1 && arr.includes('suit')) {
      $('#calculation').text('1/4');
      $('#calc-prob').text('1/4 = 25.00%');
    }
    else if (arr.length === 1 && arr.includes('value')) {
      $('#calculation').text('1/13');
      $('#calc-prob').text('1/13 = 7.69%');
    }
  };

  $('.question-field').on('click', '.current button', () => {
    event.preventDefault();
    const $curQuestion = $('.current');

    if (inputValidation($curQuestion)) {
      displayNextQ($curQuestion);
    }
    else {
      Materialize.toast('Please enter a valid response.', 2000);
    }
  });

  $('.last-btn').on('click', () => {
    $('#submit-buttons').removeClass('hide');
  });

  const conditionText = function(inputObj, index) {
    const ruleArr = Object.keys(inputObj);
    const length = inputData.rule.length;
    let string;

    if (ruleArr.length === 2) {
      string = ` ${inputObj.value} of ${inputObj.suit}`;
    }
    else if (ruleArr.length === 1 && ruleArr.includes('suit')) {
      string = ` ${inputObj.suit} of any value`;
    }
    else if (ruleArr.length === 1 && ruleArr.includes('value')) {
      string = ` ${inputObj.value} of any suit`;
    }

    if (index <= length - 3) {
      string += ',';
    }
    else if (index === length - 2) {
      string += ' or';
    }

    return string;
  };

  const modalText = function() {
    const $modalRules = $('#modal1 ul.modal-rules');

    $('<li>').text('Creating a standard deck of cards').appendTo($modalRules);
    $('<li>').addClass('modal-condition').appendTo($modalRules);

    const condition = inputData.rule.reduce((string, object, index) => {
      return string + conditionText(object, index);
    }, 'Looking for');

    $('li.modal-condition').text(condition);
    $('<li>').text(`Repeating ${inputData.repeats} times.`).appendTo($('#modal1 ul.modal-rules'));
  };

  $('#modal-btn1').on('click', () => {
    collectData();
    modalText();
  });

  $('#submit-input').on('click', () => {
    $('#rule-page').text(`RULE: ${$('li.modal-condition').text()}`);
    $('#input').css('min-height', 0);
    $('#input').slideUp();
    generateDeck(inputData);
    displayCalculation(inputData.rule);
  });

  const drawCard = function() {
    const len = deck.length;

    return deck[Math.floor(Math.random() * len)];
  };

  const updateMeasurement = function(obj) {
    if (obj.condition) {
      currentState.occurrence += 1;
    }
    currentState.total += 1;
  };

  const updateProgressBar = function() {
    const progress = currentState.total / inputData.repeats * 100;

    $('#progress').attr('style', `width: ${progress}%`);
  };

  const renderCard = function() {
    const card = drawCard();

    $('#card-image img').attr('src', card.images.png);
    if (card.condition) {
      $('#card-image img').addClass('occurrence');
    }
    else {
      $('#card-image img').removeClass('occurrence');
    }

    updateMeasurement(card);
    $('.mes-oc').text(currentState.occurrence);
    $('.mes-to').text(currentState.total);
    $('.mes-pr').text((currentState.occurrence / currentState.total * 100).toFixed(2));
    updateProgressBar();
  };

  let running = false;

  const execution = function(fn) {
    let intervalID;

    return {
      start(duration) {
        intervalID = setInterval(fn, duration);
        running = true;
      },
      stop() {
        clearInterval(intervalID);
        running = false;
      }
    };
  };

  const timer = execution(() => {
    renderCard();
    remainingRuns -= 1;
    if (remainingRuns === 0) {
      $('button[name="pause"]').prop('disabled', true);
      timer.stop();
    }
  });

  const drawLoop = function() {
    while (remainingRuns > 0) {
      const card = drawCard();

      updateMeasurement(card);
      $('.mes-oc').text(currentState.occurrence);
      $('.mes-to').text(currentState.total);
      $('.mes-pr').text((currentState.occurrence / currentState.total * 100).toFixed(2));
      updateProgressBar();
      remainingRuns -= 1;
    }
    $('button[name="pause"]').prop('disabled', true);
    timer.stop();
  };

  $('#speed').on('change', () => {
    if (running === true) {
      const speed = parseFloat($('#speed').val()) * 1000;

      timer.stop();
      timer.start(speed);
    }
  });

  $('button[name="start"]').on('click', () => {
    const speed = parseFloat($('#speed').val()) * 1000;

    $('button[name="start"]').toggleClass('hide');
    $('button[name="pause"]').toggleClass('hide');
    timer.start(speed);
  });

  $('button[name="pause"]').on('click', () => {
    $('button[name="start"]').toggleClass('hide');
    $('button[name="pause"]').toggleClass('hide');
    timer.stop();
  });

  $('button[name="finish"]').on('click', () => {
    drawLoop();
  });

  $('.reset').on('click', () => {
    $('#modal2').modal('open');
  });

  $('#reset').on('click', () => {
    document.location.reload();
  });
})();
