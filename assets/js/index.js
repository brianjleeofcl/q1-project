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
    const radioCat = $('select.rules').val();

    $('input:radio:enabled:checked').each((index, element) => {
      radioVal.push($(element).val());
    });

    return radioCat.length !== 0 && radioVal.length === radioCat.length;
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

    remainingRuns = parseInt(inputData.q4);
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
        const card = {};

        card.code = obj.code;
        card.images = obj.images;

        if (obj.value === inputData.rule.value && obj.suit === inputData.rule.suit) {
          card.condition = true;
        }
        else if (typeof inputData.rule.suit === 'undefined' && obj.value === inputData.rule.value) {
          card.condition = true;
        }
        else if (typeof inputData.rule.value === 'undefined' && obj.suit === inputData.rule.suit) {
          card.condition = true;
        }
        else {
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
      $('#calculation').text('$$\\frac{1}{4} \\times \\frac{1}{13}$$');
      $('#calc-prob').text('$$\\frac{1}{52} = 1.92\\%$$');
    }
    else if (arr.length === 1 && arr.includes('suit')) {
      $('#calculation').text('$$\\frac{1}{4}$$');
      $('#calc-prob').text('$$\\frac{1}{4} = 25.00\\%$$');
    }
    else if (arr.length === 1 && arr.includes('value')) {
      $('#calculation').text('$$\\frac{1}{13}$$');
      $('#calc-prob').text('$$\\frac{1}{13} = 7.69\\%');
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

  const modalText = function() {
    const ruleArr = Object.keys(inputData.rule);

    $('#modal1 ul.modal-rules').append($('<li>').text(`Creating a deck with ${inputData.q1} standard deck`));
    $('#modal1 ul.modal-rules').append($('<li>').addClass('modal-condition'));

    if (ruleArr.length === 2) {
      $('li.modal-condition').text(`Looking for ${inputData.rule.value} of ${inputData.rule.suit}.`);
    }
    else if (ruleArr.length === 1 && ruleArr.includes('suit')) {
      $('li.modal-condition').text(`Looking for any ${inputData.rule[ruleArr[0]]}.`);
    }
    else if (ruleArr.length === 1 && ruleArr.includes('value')) {
      $('li.modal-condition').text(`Looking for all ${inputData.rule[ruleArr[0]]} of any suit.`);
    }

    $('#modal1 ul.modal-rules').append($('<li>').text(`Repeating ${inputData.q4} times.`));
  };

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

  $('#modal-btn1').on('click', () => {
    collectData();
    modalText();
  });

  $('#submit-input').on('click', () => {
    $('#rule-page').text('RULE: ' + $('li.modal-condition').text());
    $('#input').css('min-height', 0);
    $('#input').slideUp();
    generateDeck(inputData);
    MathJax.Hub.Queue(
      [displayCalculation, inputData.rule],
      ['Typeset', MathJax.Hub]
    );
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
    const progress = currentState.total / inputData.q4 * 100;

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
    } else {
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
    timer.start(speed);
  });

  $('button[name="pause"]').on('click', () => {
    $('button[name="start"]').toggleClass('hide');
    $('button[name="pause"]').toggleClass('hide');
    timer.stop();
  });

  $('.reset').on('click', () => {
    $('#modal2').modal('open');
  });

  $('#reset').on('click', () => {
    document.location.reload();
  });
})();
