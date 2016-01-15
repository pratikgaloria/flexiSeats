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
        var _seats = [];

        var _available = [];
        var _notavailable = [];
        var _booked = [];
        var _selected = [];
        
        var _multiCursor = 0;
        var _multiStart = '';
        var _multiEnd = '';

        //Objects
        seat = function () { };
        seat.prototype = {
            id: null,
            price: null,
            booked: false,
            available: true,
            notavailable: false,
            selected: false
        }
        

        //Initialize
        draw(this);

        //Events
        this.on('click', 'input:checkbox', function () {
            if ($(this).data('status') == 'booked')
                return false;

            var _id = $(this).prop('id').substr(4);

            if (settings.multiple === true) {
                if (_multiCursor == 0) {
                    _multiCursor = 1;
                    _multiStart = _id;
                    selectSeat(_id);
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
        function draw(container) {
            //Clearing the current layout
            container.empty();

            //Providing Column labels
            var _rowLabel = $('<div class="row"><span class="row-label"></span></div>');
            for (c = 0; c < settings.columns; c++) {
                _rowLabel.append('<span class="col-label">' + c + '</span>');
            }

            container.append(_rowLabel);

            //Create Initial Layout
            for (i = 0; i < settings.rows; i++) {

                //Providing Row label
                var _row = $('<div class="row"></div>');
                var _colLabel = $('<span class="row-label">' + String.fromCharCode(65+i) + '</span>');
                _row.append(_colLabel);

                for (j = 0; j < settings.columns; j++) {
                    var _id = i + '-' + j;

                    //Creating new Seat object
                    var _seatObject = new seat();
                    _seatObject.id = _id;
                    _seatObject.price = 2;                    

                    var _checkbox = $('<input id="seat' + _id + '" type="checkbox" />');
                    var _seat = $('<label class="seat" for="seat' + _id + '" title="<h5>#'+String.fromCharCode(65+i)+'-'+j+'</h5><h6>$2.00</h6>"></label>');

                    if ($.inArray(_id, settings.booked) >= 0) {
                        _checkbox.prop('disabled', 'disabled');
                        _checkbox.attr('data-status', 'booked');
                        _seatObject.booked = true;
                        _booked.push(_id);
                    }
                    else if ($.inArray(_id, settings.notavailable) >= 0) {
                        _checkbox.prop('disabled', 'disabled');
                        _checkbox.attr('data-status', 'notavailable');
                        _seatObject.available = false;
                        _seatObject.notavailable = true;
                        _notavailable.push(_id);
                    }
                    else {
                        _available.push(_id);
                    }

                    _row.append(_checkbox);
                    _row.append(_seat);

                    _seats.push(_seatObject);
                }
                container.append(_row);
            }
        }

        function selectSeat(id) {
            if ($.inArray(id, _selected) == -1) {
                _selected.push(id);                
                var _seatObj = _seats.filter(function (seat) {
                    return seat.id == id;
                });
                _seatObj[0].selected = true;
            }
        }

        function deselectSeat(id) {
            _selected = $.grep(_selected, function (item) {
                return item !== id;
            });
            var _seatObj = _seats.filter(function (seat) {
                return seat.id == id;
            });
            _seatObj[0].selected = false;
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

        //API
        return {            
            getAvailable: function () {
                return _seats.filter(function (seat) {
                    return seat.available == true;
                });
            },
            getNotAvailable: function () {
                return _seats.filter(function (seat) {
                    return seat.notavailable == true;
                });
            },
            getBooked: function () {
                return _seats.filter(function (seat) {
                    return seat.booked == true;
                });
            },
            getSelected: function () {
                return _seats.filter(function (seat) {
                    return seat.selected == true;
                });
            },
            setMultiple: function (value) {
                _multiCursor = 0;
                settings.multiple = value === 'true';
            }
        }
    };
}(jQuery));
