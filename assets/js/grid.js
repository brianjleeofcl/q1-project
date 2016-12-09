(function() {
  'use strict';

  const drawGrid = function() {
    const $grid = $('#preview-grid');

    for (const lr of ['S', 'H', 'C', 'D']) {
      const $row = $('<div>');

      for (const num of [
        'A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'
      ]) {
        const url = `http://deckofcardsapi.com/static/img/${num}${lr}.png`;
        const $img = $('<img>').attr('src', url);

        $img.addClass(`${lr} ${num}`);
        $img.appendTo($row);
      }

      $row.appendTo($grid);
    }
  };

  const applyShade = function(array) {
    for (const object of array) {
      const keyArr = Object.keys(object);

      if (keyArr.length === 2) {
        const lr = object.suit[0];
        let num;

        if (object.value === '10') {
          num = '0';
        }
        else {
          num = object.value[0];
        }

        $(`.${lr}.${num}`).addClass('shade');
      }
      else if (keyArr.length === 1 && keyArr.includes('suit')) {
        const lr = object.suit[0];

        $(`.${lr}`).addClass('shade');
      }
      else if (keyArr.length === 1 && keyArr.includes('value')) {
        let num;

        if (object.value === '10') {
          num = '0';
        }
        else {
          num = object.value[0];
        }

        $(`.${num}`).addClass('shade');
      }
    }
  };

  $(document).on('ready', () => {
    drawGrid();
  });

  $('#input').on('change', ':radio', () => {
    const rules = [];

    $('#preview-grid img').removeClass('shade');
    $('.input-field').find(':radio:checked').each((index, element) => {
      const arrIndex = parseInt(element.name.match(/\d+/));
      const type = element.name.match(/\w+/);

      rules[arrIndex] = rules[arrIndex] || {};
      rules[arrIndex][type] = element.value;
    });

    applyShade(rules);
  });
})();
