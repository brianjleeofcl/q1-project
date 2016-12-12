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
  let instance = 0;
  let cardHistory = [];

  const numberValidate = function($input) {
    const num = parseInt($input.val());

    return $input.val() !== '' && num > 0 && num <= 100000;
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

  Array.prototype.clean = function(deleteValue) {
    for (let i = 0; i < this.length; i++) {
      if (this[i] === deleteValue) {
        this.splice(i, 1);
        i--;
      }
    }

    return this;
  };

  const collectData = function() {
    inputData = {};
    inputData.rule = [];

    $('.input-field').find('input[type="number"]').each((index, element) => {
      inputData[element.id] = element.value;
    });
    $('.input-field').find(':radio:checked').each((index, element) => {
      const arrIndex = parseInt(element.name.match(/\d+/));
      const type = element.name.match(/\w+/);

      inputData.rule[arrIndex] = inputData.rule[arrIndex] || {};
      inputData.rule[arrIndex][type] = element.value;
    });

    inputData.rule.clean(undefined);
    remainingRuns = parseInt(inputData.repeats);
  };

  const convertFraction = function(obj) {
    const arr = Object.keys(obj);

    if (arr.length === 2) {
      return '1/4 x 1/13';
    }
    else if (arr.length === 1 && arr.includes('suit')) {
      return '1/4';
    }
    else if (arr.length === 1 && arr.includes('value')) {
      return '1/13';
    }
  };

  const sumValue = function(string) {
    if (string === '1/4 x 1/13') {
      return 1;
    }
    else if (string === '1/4') {
      return 13;
    }
    else if (string === '1/13') {
      return 4;
    }
  };

  const $fraction = function(nomin, denom) {
    const $frac = $('<div>').addClass('frac');
    const $nom = $('<div>').addClass('nom');
    const $dnom = $('<div>').addClass('dnom');

    $nom.append($('<span>').text(nomin));
    $dnom.append($('<span>').text(denom));
    $frac.append($nom, $dnom);

    return $frac;
  };

  const mathDOM = function(string) {
    if (string === '1/4 x 1/13') {
      const $x = $('<div>').text('×');

      return [$fraction('1', '4'), $x, $fraction('1', '13')];
    }
    else if (string === '1/4') {
      return $fraction('1', '4');
    }
    else if (string === '1/13') {
      return $fraction('1', '13');
    }
  };

  const displayCalculation = function(array) {
    const fracArray = array.map((element) => {
      return convertFraction(element);
    });
    const sum = fracArray.map((item) => {
      return sumValue(item);
    }).reduce((num1, num2) => {
      return num1 + num2;
    }, 0);
    const union = sum - instance;
    const probability = instance / 52 * 100;

    const $math = $('<div>').addClass('math');

    for (let i = 0; i < fracArray.length; i++) {
      if (i) {
        $math.append($('<div>').text('+'));
      }
      $math.append(mathDOM(fracArray[i]));
    }

    if (union) {
      $math.append($('<div>').text('–'), $fraction(union, '52'));
    }

    $('#calculation').append($math);
    $('#inst').text(instance);
    $('#calc-prob').text(`${probability.toFixed(2)}%`);
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
            if (!card.condition) {
              instance += 1;
            }
            card.condition = true;
          }
          else if (typeof ruleObj.suit === 'undefined' && obj.value === ruleObj.value) {
            if (!card.condition) {
              instance += 1;
            }
            card.condition = true;
          }
          else if (typeof ruleObj.value === 'undefined' && obj.suit === ruleObj.suit) {
            if (!card.condition) {
              instance += 1;
            }
            card.condition = true;
          }
        }

        return card;
      });

      displayCalculation(inputData.rule);
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
    $('html, body').animate({ scrollTop: $(document).height() }, 1000);
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

    $modalRules.empty();
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
    $('#equals').removeClass('hide');
  };

  const updateProgressBar = function() {
    const progress = currentState.total / inputData.repeats * 100;

    $('#progress').attr('style', `width: ${progress}%`);
  };

  const updateImageHistory = function(array) {
    $('#card-history-row').empty();

    for (const card of array) {
      const $img = $('<img>').attr('src', card.images.png);

      if (card.condition) {
        $img.addClass('occurrence');
      }

      $('#card-history-row').append($img);
    }
  }

  const renderCard = function() {
    const card = drawCard();

    cardHistory.push(card);

    if (cardHistory.length > 10) {
      cardHistory.shift();
    }

    updateImageHistory(cardHistory);

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
    $('#mes-pr').text(`${(currentState.occurrence / currentState.total * 100).toFixed(2)}%`);
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
      $('button[name="finish"]').prop('disabled', true);
      timer.stop();
    }
  });

  const drawLoop = function() {
    cardHistory.length = 0;

    while (remainingRuns > 0) {
      const card = drawCard();

      if (remainingRuns <= 10) {
        cardHistory.push(card);
      }

      updateMeasurement(card);
      $('.mes-oc').text(currentState.occurrence);
      $('.mes-to').text(currentState.total);
      $('#mes-pr').text(`${(currentState.occurrence / currentState.total * 100).toFixed(2)}%`);
      updateProgressBar();
      remainingRuns -= 1;
    }
    $('button[name="pause"]').prop('disabled', true);
    updateImageHistory(cardHistory);
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
    $('button[name="next"]').prop('disabled', true);
    timer.start(speed);
  });

  $('button[name="pause"]').on('click', () => {
    $('button[name="start"]').toggleClass('hide');
    $('button[name="pause"]').toggleClass('hide');
    $('button[name="next"]').prop('disabled', false);
    timer.stop();
  });

  $('button[name="next"]').on('click', () => {
    renderCard();
    remainingRuns -= 1;
    if (remainingRuns === 0) {
      $('button[name="start"]').prop('disabled', true);
      $('button[name="finish"]').prop('disabled', true);
      $('button[name="next"]').prop('disabled', true);
    }
  });

  $('button[name="finish"]').on('click', () => {
    drawLoop();
    $('button[name="start"]').prop('disabled', true);
    $('button[name="finish"]').prop('disabled', true);
    $('button[name="next"]').prop('disabled', true);
  });

  $('#run-again').on('click', () => {
    timer.stop();
    currentState = {
      occurrence: 0,
      total: 0
    };
    remainingRuns = parseInt(inputData.repeats);
    $('button[name="start"]').removeClass('hide');
    $('button[name="pause"]').addClass('hide');
    $('button[name="pause"]').prop('disabled', false);
    $('button[name="start"]').prop('disabled', false);
    $('button[name="finish"]').prop('disabled', false);
    $('button[name="next"]').prop('disabled', false);
    $('.mes-oc').text('');
    $('.mes-to').text('');
    $('#mes-pr').text('');
    $('#progress').attr('style', 'width: 0%');
  });

  $('.reset').on('click', () => {
    $('#modal2').modal('open');
  });

  $('#reset').on('click', () => {
    document.location.reload();
  });
})();
