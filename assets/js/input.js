(function() {
  'use strict';

  let condCount = 0;
  const buttonData = radioOptions;

  const selection = function() {
    const $select = $('<select>').attr('id', `rules-${condCount}`);
    const $opt1 = $('<option>').attr('value', '');
    const $opt2 = $('<option>').attr('value', 'suit').text('suit');
    const $opt3 = $('<option>').attr('value', 'value').text('value');
    const $label = $('<label>').text('Choose suit, value or both');

    $select.prop('multiple', true).addClass('rules');
    $opt1.prop({
      disabled: true,
      selected: true
    }).text('Options:');
    $select.append($opt1, $opt2, $opt3);

    return [$select, $label];
  };

  const radioText = function(text) {
    if (['ACE', 'JACK', 'QUEEN', 'KING'].includes(text)) {
      return text[0];
    }

    return text[0] + text.slice(1).toLowerCase();
  };

  const radioBuild = function($parent) {
    for (const type of buttonData) {
      const $buttonRow = $('<div>').addClass(`${type.class}s`);

      for (const obj of type.radio) {
        const $span = $('<span>');
        const $input = $('<input>');
        const $label = $('<label>');

        $input.prop('disabled', true);
        $input.addClass('filled-in');
        $input.attr({
          type: 'radio',
          name: `${type.class}-${condCount}`,
          id: `${obj.id}-${condCount}`,
          value: obj.value
        });
        $label.attr('for', `${obj.id}-${condCount}`);
        $label.text(radioText(obj.value));
        $span.append($input, $label);
        $buttonRow.append($span);
      }
      $buttonRow.appendTo($parent);
    }
  };

  const newConditions = function(killBool) {
    const $row = $('<div>').addClass('row condition-row');
    const $blank = $('<div>').addClass('col s1 right-align');
    const $select = $('<div>').addClass('col s3 input-field');
    const $radio = $('<div>').addClass('col s8 input-field radio');

    $radio.addClass(`rules-${condCount}`);
    $select.append(selection());
    radioBuild($radio);
    $row.append([$blank, $select, $radio]);
    $row.insertBefore($('#insert-before'));
    condCount += 1;

    if (killBool) {
      const $icon = $('<i>');

      $icon.addClass('material-icons grey-text delete').text('delete_forever');
      $blank.append($icon);
    }
  };

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
      const keyArr = Object.keys(object) || [];

      if (keyArr.length === 2) {
        const lr = object.suit[0];
        const num = object.value === '10' ? '0' : object.value[0];

        $(`.${lr}.${num}`).addClass('shade');
      }
      else if (keyArr.length === 1 && keyArr.includes('suit')) {
        const lr = object.suit[0];

        $(`.${lr}`).addClass('shade');
      }
      else if (keyArr.length === 1 && keyArr.includes('value')) {
        const num = object.value === '10' ? '0' : object.value[0];

        $(`.${num}`).addClass('shade');
      }
    }
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

  const collectRules = function() {
    const array = [];

    $('#input').find(':radio:checked').each((index, element) => {
      const arrIndex = parseInt(element.name.match(/\d+/));
      const type = element.name.match(/\w+/);

      array[arrIndex] = array[arrIndex] || {};
      array[arrIndex][type] = element.value;
    });

    return array.clean(undefined);
  };

  $(document).on('ready', () => {
    newConditions(false);
    $('select').material_select();
    drawGrid();
  });

  $('#add-condition').on('click', () => {
    newConditions(true);
    $('select').material_select();
  });

  $('#input').on('change', ':radio', () => {
    $('#preview-grid img').removeClass('shade');

    applyShade(collectRules());
  });

  $('#input').on('change', 'select', () => {
    const ruleSet = $(event.target).parents('ul').siblings('select').attr('id');
    const selected = $(`#${ruleSet}`).val();

    if (selected.includes('suit')) {
      $(`.${ruleSet} .suits input[type="radio"]`).prop('disabled', false);
    }
    else {
      $(`.${ruleSet} .suits input[type="radio"]`).prop({
        disabled: true,
        checked: false
      });
    }

    if (selected.includes('value')) {
      $(`.${ruleSet} .values input[type="radio"]`).prop('disabled', false);
    }
    else {
      $(`.${ruleSet} .values input[type="radio"]`).prop({
        disabled: true,
        checked: false
      });
    }

    $('#preview-grid img').removeClass('shade');

    applyShade(collectRules());
  });

  $('#input').on('mouseenter mouseleave', 'i.delete', () => {
    $(event.target).toggleClass('grey-text red-text');
  });

  $('#input').on('click', 'i.delete', () => {
    $(event.target).parents('.condition-row').remove();

    $('#preview-grid img').removeClass('shade');

    applyShade(collectRules());
  });
})();
