(function() {
  'use strict';

  let condCount = 0;
  const buttonData = radioOptions;

  const selection = function() {
    const $select = $('<select>').addClass('rules').prop('multiple', true);
    const $opt1 = $('<option>').attr('value', '');
    const $opt2 = $('<option>').attr('value', 'suit').text('suit');
    const $opt3 = $('<option>').attr('value', 'value').text('value');
    const $label = $('<label>').text('Choose suit, value or both');

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
        $input.attr('name', type.class);
        $input.attr('id', obj.id + condCount);
        $input.attr('value', obj.value);
        $label.attr('for', obj.id + condCount);

        if (['ACE', 'JACK', 'QUEEN', 'KING'].includes(obj.value)) {
          $label.text(obj.value[0])
        } else {
          $label.text(obj.value);
        }
        $span.append($input, $label);

        $buttonRow.append($span);
      }
      $buttonRow.appendTo($parent);
    }
  };

  const newConditions = function() {
    const $row = $('<div>').addClass('row');
    const $select = $('<div>').addClass('col s3 input-field');
    const $radio = $('<div>').addClass('col s9 input-field rules radio');

    $select.append(selection());
    radioBuild($radio);
    $row.append([$select, $radio]);

    $row.insertBefore($('#insert-before'));
    condCount += 1;
    console.log(condCount);
  };

  $(document).on('ready', newConditions());
  $('#add-condition').on('click', () => {
     newConditions();
     $('select').material_select();
  });
})();
