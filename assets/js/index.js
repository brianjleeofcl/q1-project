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

    remainingRuns = parseInt(inputData.repeats);
  };

  const convertFraction = function(obj) {
    const arr = Object.keys(obj);

    if (arr.length === 2) {
      return '\\frac{1}{4} \\times \\frac{1}{13}';
    }
    else if (arr.length === 1 && arr.includes('suit')) {
      return '\\frac{1}{4}';
    }
    else if (arr.length === 1 && arr.includes('value')) {
      return '\\frac{1}{13}';
    }
  };

  const sumValue = function(string) {
    if (string === '\\frac{1}{4} \\times \\frac{1}{13}') {
      return 1;
    }
    else if (string === '\\frac{1}{4}') {
      return 13;
    }
    else if (string === '\\frac{1}{13}') {
      return 4;
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

    if (union === 0) {
      $('#calculation').text(`$$${fracArray.join(' + ')}$$`);
    }
    else {
      $('#calculation').text(`$$${fracArray.join(' + ')} - \\frac{${union}}{52}$$`);
    }

    $('#calc-prob').text(`$$= \\frac{${instance}}{52} = ${probability.toFixed(2)}\\%$$`);
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
      
      MathJax.Hub.Queue(
        [displayCalculation, inputData.rule],
        ['Typeset', MathJax.Hub]
      );
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

  // const displayCalculation = function(obj) {
  //   const arr = Object.keys(obj);
  //
  //   if (arr.length === 2) {
  //     $('#calculation').text('$$\\frac{1}{4} \\times \\frac{1}{13}$$');
  //     $('#calc-prob').text('$$\\frac{1}{52} = 1.92\\%$$');
  //   }
  //   else if (arr.length === 1 && arr.includes('suit')) {
  //     $('#calculation').text('$$\\frac{1}{4}$$');
  //     $('#calc-prob').text('$$\\frac{1}{4} = 25.00\\%$$');
  //   }
  //   else if (arr.length === 1 && arr.includes('value')) {
  //     $('#calculation').text('$$\\frac{1}{13}$$');
  //     $('#calc-prob').text('$$\\frac{1}{13} = 7.69\\%');
  //   }
  // };

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
  };

  const updateProgressBar = function() {
    const progress = currentState.total / inputData.repeats * 100;

    $('#progress').attr('style', `width: ${progress}%`);
  };

  const measureProbability = function(obj) {
    const percent = (currentState.occurrence / currentState.total * 100).toFixed(2);

    $('.mes-oc').text(obj.occurrence);
    $('.mes-to').text(obj.total);
    $('#mes-prob').text(`$$\\frac{${obj.occurrence}}{${obj.total}} = ${percent}\\%$$`)
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
    // measureProbability(currentState)
    // $('#mes-prob').addClass('hide')
    MathJax.Hub.Queue(
      () => {
        document.getElementById('mes-prob').style.visibility = "hidden"
      },
      [measureProbability, currentState],
      ['Typeset', MathJax.Hub, 'mes-prob'],
      () => {
        document.getElementById('mes-prob').style.visibility = ""
      }
    );
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
    if (running) {
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

  $('.reset').on('click', () => {
    $('#modal2').modal('open');
  });

  $('#reset').on('click', () => {
    document.location.reload();
  });
})();
