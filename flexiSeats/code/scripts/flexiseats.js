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
        var _blocks = [];
        var _seats = [];

        var _available = [];
        var _selected = [];
        
        var _multiCursor = 0;
        var _multiStart = '';
        var _multiEnd = '';

        //Objects
        block = function () { };
        block.prototype = {
            label: null,
            price: null,
            color: null
        }

        seat = function () { };
        seat.prototype = {
            id: null,
            block: null,
            booked: false,
            available: true,
            notavailable: false,
            selected: false
        }        

        //Initialize
        var _container = this;
        init();
        draw(_container);

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

        //Initialize
        function init(){
            for (i = 0; i < settings.rows; i++) {   
                for (j = 0; j < settings.columns; j++) {
                    
                    //Defining ID
                    var _id = i + '-' + j;
                    
                    //Creating new seat object and providing ID
                    var _seatObject = new seat();
                    _seatObject.id = _id;                  

                    //Check if seat is already in booked status
                    if ($.inArray(_id, settings.booked) >= 0) {
                        _seatObject.booked = true;
                    }

                    //Check if seat is available for booking
                    else if ($.inArray(_id, settings.notavailable) >= 0) {
                        _seatObject.available = false;
                        _seatObject.notavailable = true;
                    }

                    //Other conditions
                    else {
                    }

                    _seats.push(_seatObject);
                }
            }
        }

        //Draw layout
        function draw(container) {
            //Clearing the current layout
            container.empty();

            //Providing Column labels
            var _rowLabel = $('<div class="row"><span class="row-label"></span></div>');
            for (c = 0; c < settings.columns; c++) {
                _rowLabel.append('<span class="col-label">' + c + '</span>');
            }

            container.append(_rowLabel);
            
            //Creating Initial Layout
            for (i = 0; i < settings.rows; i++) {

                //Providing Row label
                var _row = $('<div class="row"></div>');
                var _colLabel = $('<span class="row-label">' + String.fromCharCode(65+i) + '</span>');
                _row.append(_colLabel);

                for (j = 0; j < settings.columns; j++) {
                    var _id = i + '-' + j;

                    //Finding the seat from the array
                    var _seatObject = _seats.filter(function(seat){
                        return seat.id == _id;
                    })[0];                  

                    

                    var _seatClass = 'seat';
                    var _seatBlockColor = '#fff';
                    var _price = 0;

                    if (_seatObject.block != null) {
                        _seatBlockColor = _blocks.filter(function (block) { return block.label == _seatObject.block })[0].color;
                        var _block = _blocks.filter(function (block) {
                            return block.label == _seatObject.block;
                        });
                        _price = _block[0].price;
                    }

                    var _checkbox = $('<input id="seat' + _seatObject.id + '" data-block="' + _seatObject.block + '" type="checkbox" />');
                    var _seat = $('<label class="' + _seatClass + '" for="seat' + _seatObject.id + '" style="background-color: ' + _seatBlockColor + '"  title="#' + String.fromCharCode(65 + i) + '-' + j + ', ' + _price + ' Rs."></label>');

                    if (_seatObject.booked) {
                        _checkbox.prop('disabled', 'disabled');
                        _checkbox.attr('data-status', 'booked');
                    }
                    else if (_seatObject.notavailable) {
                        _checkbox.prop('disabled', 'disabled');
                        _checkbox.attr('data-status', 'notavailable');
                    }
                    else {

                    }

                    _row.append(_checkbox);
                    _row.append(_seat);
                }
                container.append(_row);
            }
        }

        //Select a single seat
        function selectSeat(id) {
            if ($.inArray(id, _selected) == -1) {
                _selected.push(id);                
                var _seatObj = _seats.filter(function (seat) {
                    return seat.id == id;
                });
                _seatObj[0].selected = true;
            }
        }

        //Deselect a single seat
        function deselectSeat(id) {
            _selected = $.grep(_selected, function (item) {
                return item !== id;
            });
            var _seatObj = _seats.filter(function (seat) {
                return seat.id == id;
            });
            _seatObj[0].selected = false;
        }

        //Select multiple seats
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
            draw: function () {
                draw(_container);
            },
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
            },
            getBlocks: function(){
                return _blocks;
            },
            addBlock: function (label, price, color) {
                var _newBlock = new block();
                _newBlock.label = label;
                _newBlock.price = price;
                _newBlock.color = color;
                _blocks.push(_newBlock);
            },
            removeBlock: function (label) {
                _blocks = $.grep(_blocks, function (item) {
                    return item.label !== label;
                });
            },
            defineBlock: function (label, seats) {
                $.each(seats, function (i, v) {
                    var _this = this;                    
                    var _seat = _seats.filter(function (seat) {
                        return seat.id == _this.id;
                    });                    
                    _seat[0].block = label;
                    _seat[0].selected = false;
                });                
                draw(_container);
            }
        }
    };
}(jQuery));
