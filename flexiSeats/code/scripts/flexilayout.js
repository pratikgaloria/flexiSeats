/* flexiSeats: jQuery plugin to create flexible and interactive seating layouts */
/* Author: Pratik Galoria */
/* Version 1.0 */

(function ($) {
    $.fn.flexiSeats = function (options) {
        var scope = this;

        //Options
        var settings = $.extend({
            rows: 10,
            columns: 10,
            booked: [],
            notavailable: [],
            multiple: false
        }, options);

        //Local Variables
        var _available = [];
        var _notavailable = [];
        var _booked = [];
        var _selected = [];
        
        var _multiCursor = 0;
        var _multiStart = '';
        var _multiEnd = '';


        //Create Initial Layout
        for (i = 0; i < settings.rows; i++) {
            var _row = $('<div class="row"></div>');
            for (j = 0; j < settings.columns; j++) {
                var _id = i + '-' + j;

                var _checkbox = $('<input id="seat' + _id + '" type="checkbox" />');
                var _label = $('<label for="seat' + _id + '"></label>');

                if ($.inArray(_id, settings.booked) >= 0) {
                    _checkbox.prop('disabled', 'disabled');
                    _checkbox.attr('data-status', 'booked');
                    _booked.push(_id);
                }
                else if ($.inArray(_id, settings.notavailable)>=0){
                    _checkbox.prop('disabled', 'disabled');
                    _checkbox.attr('data-status', 'notavailable');
                    _notavailable.push(_id);
                }
                else
                {
                    _available.push(_id);
                }

                _row.append(_checkbox);
                _row.append(_label);
            }
            this.append(_row);
        }

        //Events
        this.on('click', 'input:checkbox', function () {
            if ($(this).data('status') == 'booked')
                return false;

            var _id = $(this).prop('id').substr(4);

            if (settings.multiple === true) {
                if (_multiCursor == 0) {
                    _multiCursor = 1;
                    _multiStart = _id;
                }
                else {
                    _multiCursor = 0;
                    _multiEnd = _id;
                    selectMultiple(_multiStart, _multiEnd);
                    _multiStart = '';
                    _multiEnd = '';
                }                
            }
            else {
                if ($(this).prop('checked') == true)
                    selectSeat(_id);
                else {
                    deselectSeat(_id);
                }
            }
        });

        //Private Functions
        function selectSeat(id) {
            if ($.inArray(id, _selected) == -1)
                _selected.push(id);
        }

        function deselectSeat(id) {
            _selected = $.grep(_selected, function (item) {
                return item !== _id;
            });
        }

        function selectMultiple(start, end) {            
            var _i = start.split('-');
            var _j = end.split('-');

            if (parseInt(_i[0]) > parseInt(_j[0])) {
                var _temp = _i[0];
                _i[0] = _j[0];
                _j[0] = _temp;
            }

            if (parseInt(_i[1]) > parseInt(_j[1])) {
                var _temp = _i[1];
                _i[1] = _j[1];
                _j[1] = _temp;
            }

            for (i = parseInt(_i[0]) ; i <= parseInt(_j[0]) ; i++) {
                for (j = parseInt(_i[1]) ; j <= parseInt(_j[1]) ; j++) {
                    if ($('input:checkbox[id="seat' + i + '-' + j + '"]', scope).data('status') != 'notavailable' && $('input:checkbox[id="seat' + i + '-' + j + '"]', scope).data('status') != 'booked') {
                        $('input:checkbox[id="seat' + i + '-' + j + '"]', scope).prop('checked', 'checked');
                        selectSeat(i + '-' + j);
                    }
                }
            }
        }

        //Methods
        return {            
            getAvailable: function(){
                return _available;
            },
            getNotAvailable: function () {
                return _notavailable;
            },
            getBooked: function () {
                return _booked;
            },
            getSelected: function () {
                alert(_selected);
            },
            setMultiple: function (value) {
                _multiCursor = 0;
                settings.multiple = value === 'true';
            }
        }
    };
}(jQuery));
