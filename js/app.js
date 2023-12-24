let selectedLayout = 1;

$(document).ready(function() {
    generateLayout($('#layout1'), 1);
    generateLayout($('#layout2'), 2);
    generateLayout($('#layout3'), 3);
    generateLayout($('#layout4'), 4);
    
    generateBitboard($('#bitboard1'), $('#decBitboard1'), false, false);
    generateBitboard($('#bitboard3'), $('#decBitboard3'), true, false);
    
    loadCookies();   
    $('#container').show();
    
    $('#layoutRadio1').click(() => changeLayout(1));
    $('#layoutRadio2').click(() => changeLayout(2));
    $('#layoutRadio3').click(() => changeLayout(3));
    $('#layoutRadio4').click(() => changeLayout(4));
    
    $('#decBitboard1').keyup(() => decKeyUp($('#bitboard1'), $('#decBitboard1'), $('#hexBitboard1'), $('#binBitboard1')));
    $('#hexBitboard1').keyup(() => hexKeyUp($('#bitboard1'), $('#decBitboard1'), $('#hexBitboard1'), $('#binBitboard1')));
    $('#binBitboard1').keyup(() => binKeyUp($('#bitboard1'), $('#decBitboard1'), $('#hexBitboard1'), $('#binBitboard1')));

    generateMoveTypeListeners();
    
    // $('#fillBitboard1').click(() => fillBitboard($('#decBitboard1')));
    
    // $('#clearBitboard1').click(() => clearBitboard($('#decBitboard1')));
    
    // $('#shlBitboard1').click(() => shlBitboard($('#decBitboard1')));
    
    // $('#shrBitboard1').click(() => shrBitboard($('#decBitboard1')));
    
    // $('#notBitboard1').click(() => notBitboard($('#decBitboard1')));
    
    // $('#andBitboard3').click(() => doOperation((x, y) => x & y));
    // $('#orBitboard3').click(() => doOperation((x, y) => x | y));
    // $('#xorBitboard3').click(() => doOperation((x, y) => x ^ y));

    updateBitboard($('#bitboard1'),BigInt($('#decBitboard1').val()));
    updateBitboard($('#bitboard3'),BigInt($('#decBitboard1').val()));
});

function generateMoveTypeListeners() {
    for (var i = BigInt(0); i < 16; i++) {
        $(`#moveType${i}`).click(((i) => {
            return function() {
                var bigIntValue = BigInt($('#decBitboard1').val());
                bigIntValue = bigIntValue & ~(15n << 12n)
                bigIntValue = bigIntValue | BigInt(i << 12n);
                $('#decBitboard1').val(bigIntValue);
                decKeyUp($('#bitboard1'), $('#decBitboard1'), $('#hexBitboard1'), $('#binBitboard1'));
            }
        })(i));
    }
}

function generateLayout(layout, variant) {
    for (var y = 0; y < 8; y++) {
        var row = $(document.createElement('div')).prop({
            class: 'layout-row'
        });
        
        for (var x = 0; x < 8; x++) {
            var value = getselectedLayoutByXY(variant, x, y);
            if (value < 10) {
                value = '0' + value;
            }
            
            var span = $(document.createElement('span')).html(value);
            row.append(span);
        }
        
        layout.append(row);
    }
}

function generateBitboard(bitboard, decTextbox, readOnly, fillButtons) {
	// Add bottom div for column buttons
	if (!readOnly) {
		var bottomrow = $(document.createElement('div')).prop({
			class: 'bitboard-row'
		});
	}
	
	for (var y = 0; y < 8; y++) {
		var row = $(document.createElement('div')).prop({
			class: 'bitboard-row'
		});
		
		// Add buttons to fill a row
		if (!readOnly && fillButtons){
			var rowbutton = $(document.createElement('button')).prop({
				type: 'rowbutton',
				value: y,
				id: y,
				class: "btn btn-primary",
			});
			
			rowbutton.click(((v) => () => rowClick(bitboard, decTextbox, v))(y))
		}
		
		// Buttons to fill columns
		const files =  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
		if (!readOnly && fillButtons) {
			var colbutton = $(document.createElement('button')).prop({
				type: 'colbutton',
				value: files[y],
				id: y,
				class: "btn btn-primary",
				style: y == 0 ? "margin-left: 22px" : ""
			});
			
			colbutton.click(((v) => () => colClick(bitboard, decTextbox, v))(files[y]))
		}
		
		// Checkboxes
		for (var x = 0; x < 8; x++) {
			var value = x + y * 8;
			var checkbox = $(document.createElement('input')).prop({
				type: 'checkbox',
				value: value,
                status: 0,
			});
			
			if (readOnly) {
				checkbox.prop('readonly', true);
			}


            checkbox.click(((v) => {
                return function() {
                    $(this).prop('status', $(this).prop('status') + 1)
                    
                    if ($(this).prop('status') == 3) s = $(this).prop('status', 0);

                    if ($(this).prop('status') == 0) {
                        $(this).prop('checked', false).css("accent-color", "white");
                    } else if ($(this).prop('status') == 1) {
                        $(this).prop('checked', true).css("accent-color", "green");
                    } else { // s == 2
                        $(this).prop('checked', true).css("accent-color", "red");
                    }

                    bitboardCheckboxClick(bitboard, decTextbox, v)
                }
            })(value));
			
			if (!readOnly && fillButtons) {
				row.prepend(rowbutton);
			}
				
			if (!readOnly && fillButtons) {
				bottomrow.append(colbutton);
			}
			
			row.append(checkbox);
		}
		
		bitboard.append(row);
		
		if (!readOnly) {
			bitboard.append(bottomrow)
		};

	}
	
	if (readOnly){
		var colspacer = $(document.createElement('div')).prop({
			class: 'colspacer'
		});
		bitboard.append(colspacer)
    }
}

function loadCookies() {
    var selectedLayoutCookie = Cookies.get('selectedLayout');
    if (selectedLayoutCookie != undefined) {
        selectedLayout = parseInt(selectedLayoutCookie);
        $('#layoutRadio' + selectedLayoutCookie).prop('checked', true);
    }
    else {
        $('#layoutRadio1').prop('checked', true);
    }
}

function changeLayout(variant) {
    selectedLayout = variant;
    refreshValuesAfterLayoutChange();
    
    Cookies.set('selectedLayout', variant, { expires: 10 * 365 });
}

function refreshValuesAfterLayoutChange() {
    console.log("test")
    decKeyUp($('#bitboard1'), $('#decBitboard1'), $('#hexBitboard1'), $('#binBitboard1'));
    //decKeyUp($('#bitboard3'), $('#decBitboard3'), $('#hexBitboard3'), $('#binBitboard3'));
}

function doOperation(operation) {
    var value1 = BigInt($('#decBitboard1').val());
    var value2 = BigInt($('#decBitboard2').val());
    var result = operation(value1, value2);
    
    updateReadOnlyTextboxes(result);
    updateBitboard($('#bitboard3'), result);
}

function updateBitboard3(value) {
    updateReadOnlyTextboxes(value);
    updateBitboard($('#bitboard3'), value);
}

function decKeyUp(bitboard, decTextbox, hexTextbox, binTextbox) {
    var bigIntValue = BigInt(decTextbox.val());
    hexTextbox.val('0x' + bigIntValue.toString(16));
    binTextbox.val('0b' + bigIntValue.toString(2));
    
    updateBitboard(bitboard, bigIntValue);
    updateBitboard3(decTextbox.val());
}

function hexKeyUp(bitboard, decTextbox, hexTextbox, binTextbox) {
    var bigIntValue = BigInt(hexTextbox.val());
    decTextbox.val(bigIntValue.toString(10));
    binTextbox.val('0b' + bigIntValue.toString(2));
    
    updateBitboard(bitboard, bigIntValue);
}

function binKeyUp(bitboard, decTextbox, hexTextbox, binTextbox) {
    var bigIntValue = BigInt(binTextbox.val());
    decTextbox.val(bigIntValue.toString(10));
    hexTextbox.val('0x' + bigIntValue.toString(16));
    
    updateBitboard(bitboard, bigIntValue);
}

function updateReadOnlyTextboxes(value) {
    var to = value & 63;
    value = value >> 6;
    var from = value & 63;
    value = value >> 6;
    var flag = value;

    $('#typ3').val($(`#${flag}`).val() + `(${flag})`);
    $('#from3').val(from.toString());
    $('#to3').val(to.toString());
}

function updateBitboard(bitboard, value) {
    // for (var index = 0; index < 64; index++) {
    //     var bit = value & 1n;
    //     value = value >> 1n;
        
    //     var bitboardIndex = getselectedLayoutByIndex(selectedLayout, index);
    //     bitboard.find('input[type=checkbox][value=' + bitboardIndex + ']').prop('checked', bit != 0);
    // }
    value = BigInt(value)

    var to = value & 63n;
    value = value >> 6n;
    var from = value & 63n;
    value = value >> 6n;
    var flag = value;

    for (var index = 0; index < 64; index++) {
        var bit = value & 1n;
        value = value >> 1n;
        
        var bitboardIndex = getselectedLayoutByIndex(selectedLayout, index);
        if (index == to) {
            bitboard.find('input[type=checkbox][value=' + bitboardIndex + ']').prop('checked', true).prop("status", 2).css("accent-color", "red");
        } else if (index == from) {
            bitboard.find('input[type=checkbox][value=' + bitboardIndex + ']').prop('checked', true).prop("status", 1).css("accent-color", "green");
        } else {
            bitboard.find('input[type=checkbox][value=' + bitboardIndex + ']').prop('checked', false).prop("status", 0).css("accent-color", "white");
        }
    }
}

function isBoardValid() {
    var bitboard = $('#bitboard1');
    var from = 0;
    var to = 0;

    for (var index = 0; index < 64; index++) {
        var bitboardIndex = getselectedLayoutByIndex(selectedLayout, index);
        if (bitboard.find('input[type=checkbox][value=' + bitboardIndex + ']').prop("status") == 2) to++;
        if (bitboard.find('input[type=checkbox][value=' + bitboardIndex + ']').prop("status") == 1) from++;
    }
    return from == 1 && to == 1;
}

function bitboardCheckboxClick(bitboard, decTextbox, index) {
    if (!isBoardValid()) return;

    var checkbox = bitboard.find('input[type=checkbox][value=' + index + ']');
    var state = checkbox.prop('checked');
    var variantIndex = BigInt(getselectedLayoutByIndex(selectedLayout, index));

    var value = BigInt(0);
    //value = (value & ~(1n << variantIndex)) | (BigInt(state ? 1 : 0) << variantIndex);

    for (var i = 0; i < 64; i++) {
        var bitboardIndex = getselectedLayoutByIndex(selectedLayout, i);
        if (bitboard.find('input[type=checkbox][value=' + bitboardIndex + ']').prop("status") == 2) { // red
            value = value | BigInt(i)
        } else if (bitboard.find('input[type=checkbox][value=' + bitboardIndex + ']').prop("status") == 1) { // green
            value = value | BigInt(i << 6)
        }
    }  
    
    decTextbox.val(value);
    
    refreshValuesAfterLayoutChange();
}

function rowClick(bitboard, decTextbox, rank){
    // Magic number is a fully filled 8th rank
    var toprow = 18374686479671623680n;
    // Inverse the shiftvalue for different layouts
    var shiftval = BigInt(calcRowShiftValue(selectedLayout, rank));
    var row = toprow >> (shiftval * 8n);
    // OR the existing field and the newly filled row
    var newvalue = BigInt(decTextbox.val()) | row;

    // If the row is filled, clear it
    if(newvalue === BigInt(decTextbox.val())){
        newvalue = newvalue & ~(row);
    }

    decTextbox.val(newvalue);
    
    refreshValuesAfterLayoutChange();
}

function colClick(bitboard, decTextbox, file){
    const files =  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    file = BigInt(files.indexOf(file));
    // Magic number is a fully filled H file
    var rightcol = 9259542123273814144n;
    // Inverse the shiftvalue for different layouts
    var shiftval = calcColShiftValue(selectedLayout, 7n - file);
    var col =  rightcol >> shiftval;
    // OR the existing field and the newly filled col
    var newvalue = BigInt(decTextbox.val()) | col;
    
    // If the row is filled, clear it
    if(newvalue === BigInt(decTextbox.val())){
        newvalue = newvalue & ~(col);
    }

    decTextbox.val(newvalue);
    
    refreshValuesAfterLayoutChange();
}

function fillBitboard(decTextbox) {
    decTextbox.val('18446744073709551615');
    refreshValuesAfterLayoutChange();
}

function clearBitboard(decTextbox) {
    decTextbox.val('0');
    refreshValuesAfterLayoutChange();
}

function shlBitboard(decTextbox) {
    var value = BigInt(decTextbox.val());
    var lastBitValue = value & (1n << 63n);
    if(lastBitValue != 0n) {
        value = value & ~lastBitValue; 
    }

    value = value << 1n;
    decTextbox.val(value);
    
    refreshValuesAfterLayoutChange();
}

function shrBitboard(decTextbox) {
    var value = BigInt(decTextbox.val());
    value = value >> 1n & ~(1n << 63n);
    decTextbox.val(value);
    
    refreshValuesAfterLayoutChange();
}

function notBitboard(decTextbox) {
    var value = BigInt(decTextbox.val());
    value = 18446744073709551615n - value;
    decTextbox.val(value);
    
    refreshValuesAfterLayoutChange();
}

function getselectedLayoutByXY(variant, x, y) {
    switch (variant) {
        case 1: return 63 - (7 - x + y * 8);
        case 2: return 63 - (x + y * 8);
        case 3: return x + y * 8;
        case 4: return 7 - x + y * 8;
    }
    
    return 0;
}

function getselectedLayoutByIndex(variant, index) {
    return getselectedLayoutByXY(variant, index % 8, Math.floor(index / 8));
}

function calcRowShiftValue(variant, value) {
    switch (variant) {
        case 1: return value;
        case 2: return value;
        case 3: return 7 - value;
        case 4: return 7 - value;
    }
}

function calcColShiftValue(variant, value) {
    switch (variant) {
        case 1: return value;
        case 2: return 7n - value;
        case 3: return value;
        case 4: return 7n - value;
    }
}