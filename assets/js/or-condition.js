(function() {
  'use strict';

  let condCount = 0;
  const buttonData = radioOptions;

  const selection = function() {
    const $select = $('<select>').attr('id', 'rules-' + condCount);
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

  const radioBuild = function($parent) {
    for (const type of buttonData) {
      const $buttonRow = $('<div>').addClass(`${type.class}s`);

      for (const obj of type.radio) {
        const $span = $('<span>');
        const $input = $('<input>');
        const $label = $('<label>');

        $input.prop('disabled', true).attr('type', 'radio').addClass('filled-in');
        $input.attr('name', `${type.class}-${condCount}`);
        $input.attr('id', `${obj.id}-${condCount}`);
        $input.attr('value', obj.value);
        $label.attr('for', `${obj.id}-${condCount}`);

        if (['ACE', 'JACK', 'QUEEN', 'KING'].includes(obj.value)) {
          $label.text(obj.value[0]);
        } else {
          $label.text(obj.value);
        }
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

    $radio.addClass('rules-' + condCount);
    $select.append(selection());
    radioBuild($radio);
    $row.append([$blank, $select, $radio]);
    $row.insertBefore($('#insert-before'));
    condCount += 1;

    if (killBool) {
      const $icon = $('<i>').addClass('material-icons grey-text delete').text('delete_forever')

      $blank.append($icon);
    }
  };

  $(document).on('ready', newConditions(false));
  $('#add-condition').on('click', () => {
    newConditions(true);
    $('select').material_select();
  });

  $('#input').on('change', 'select', () => {
    const ruleSet = $(event.target).parents('ul').siblings('select').attr('id');
    const selected = $('#' + ruleSet).val();

    if (selected.includes('suit')) {
      $(`.${ruleSet} .suits input[type="radio"]`).prop('disabled', false);
    } else {
      $(`.${ruleSet} .suits input[type="radio"]`).prop({
        disabled: true,
        checked: false
      });
    }

    if (selected.includes('value')) {
      $(`.${ruleSet} .values input[type="radio"]`).prop('disabled', false);
    } else {
      $(`.${ruleSet} .values input[type="radio"]`).prop({
        disabled: true,
        checked: false
      });
    }
  });

  $('#input').on('mouseenter mouseleave', 'i.delete', () => {
    $(event.target).toggleClass('grey-text red-text');
  });

  $('#input').on('click', 'i.delete', () => {
    $(event.target).parents('.condition-row').remove();
  })
})();
