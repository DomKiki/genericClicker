var labels = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion"];

/* Constants */

number.ZERO = function() { return new number([0], 0); }
number.ONE  = function() { return new number([1], 0); }

function number(values, offset) {

	/* Constructor */

	this.vals   = values;
	this.offset = offset;

	/* Functions */
	
	this.clone = function() { return new number(this.vals.slice(), this.offset); }
	
	this.isGreater = function (number) {
	
		
		var myL  = this.vals.length + this.offset;
		var numL = number.vals.length + number.offset;
		
		if (myL != numL) return (myL > numL);
		else {
		
			var i = 0;
			while (i < this.vals.length) {
			
				var myV  = this.vals[i];
				var numV = number.vals[i];
				if (numV == undefined) return true;
				else if (myV != numV)  return (myV > numV);
				else i++;
			}
			
			// Equals
			if (myV == numV) return true;
			// Unreached (normally)
			return (this.vals.length > number.vals.length);
			
		}
		
	}
	
	this.pad = function (amount, num, side) {
	
		if (num == null)  num = 0;
		if (side == null) side = "right";
		
		if (side == "right")
			for (var i = 0; i < amount; i++)
				this.vals.push(num);
				
		else if (side == "left")
			for (var i = 0; i < amount; i++)
				this.vals.unshift(num);
				
	}
	
	this.toString = function (delim) { 
	
		if (delim == null) delim = ".";
		
		// Value
		var str;
		if (this.vals.length > 1)
			str = this.vals[0].toString() + delim + this.format(this.vals[1], 3);
		else
			str = this.vals[0].toString();
		
		// Unit
		var label = labels[this.vals.length + this.offset - 1];
		if (label != "") str += " " + label;
		
		return str;
		
	}
	
	this.format = function(digits, num) {
	
		var str = digits.toString();
		if (str.length < num)
			for (var i = str.length; i < num; i++)
				str = "0" + str;
		return str;
	
	}
		
	/* Operations */
	
	this.add = function (number) {
	
		// Equalize offsets
		if (this.offset != number.offset) {
			var diff = this.offset - number.offset;
			if (diff > 0) {
				this.pad(diff);
				this.offset -= diff;
			}
			else {
				number.pad(-1 * diff);
				number.offset += diff; 
			}
		}
		
		// Equalize arrays length
		if (this.vals.length != number.vals.length) {
			var diff = this.vals.length - number.vals.length;
			if (diff > 0)
				number.pad(diff, 0, "left");
			else
				this.pad(-1 * diff, 0, "left");
		}
		
		// Proper adding
		for (var i = (this.vals.length - 1); i >= 0; i--) {
		
			var s = this.vals[i] + number.vals[i];
			
			if (s >= 1000) {
			
				var ent = Math.floor(s / 1000);
				var dec = s - (1000 * Math.floor(s / 1000));
			
				if (i == 0) {
					this.vals.unshift(ent);
					this.vals[1] = dec;
				}
				else {
					this.vals[i - 1] += ent;
					this.vals[i] = dec;
				}
				
            } else
                this.vals[i] = s;
			
		}
		
		// Removing zeros and refreshing offset
		i = this.vals.length;
			while ((this.vals[--i] == 0) && (i > 0))
				this.offset++; 
		this.vals.splice(this.vals.length - this.offset, this.offset);
		// If result = 0 then this.vals should be empty, so we just push a value into it
		//if (this.vals.length == 0) this.vals.push(0);
		
    }

	this.sub = function (number) {
		
		// Equalize offsets
		if (this.offset != number.offset) {
			var diff = this.offset - number.offset;
			if (diff > 0) {
				this.pad(diff);
				this.offset -= diff;
			}
			else {
				number.pad(-1 * diff);
				number.offset += diff; 
			}
		}
		
		// Proper substraction
		i = this.vals.length - 1;
		for (var j = (number.vals.length - 1); j >= 0; j--) {
			
			var s = this.vals[i] - number.vals[j];
			if (s < 0) {
			
				// Where to decrement (index)
				var index = i;
				while (this.vals[--index] == 0) continue;
				this.vals[index]--;
				
				// Back-propagation
				while (index++ < (i - 1))
					this.vals[index] += 999; // + 1000 - 1
				this.vals[index] = s + 1000;
				
			} else
				this.vals[i] = s;
				
			i--;
			
        }
		
	}
	
	// What about values m < 0 ???
	// Should back-propagate decimal part to lower units
	this.mult = function (number) {
	
		var i, j, m;
			
		// Mult by float
		if (typeof number === "number") {
			
			for (i = (this.vals.length - 1); i >= 0; i--) {
				m = Math.floor(this.vals[i] * number);
				this.vals[i] = m;
			}
			
			// Check no value > 1000
			for (i = (this.vals.length - 1); i >= 0; i--) {
				m = this.vals[i];
				if (m >= 1000) {
					var thous = Math.floor(m / 1000);
					var units = m - (1000 * Math.floor(m / 1000));
					if (i == 0) {
						this.vals.unshift(thous); 
						this.vals[1] = units;
					}
					else {
						this.vals[i] = units;
						this.vals[i - 1] += thous; 
					}
				}
			}
			
		}
		
		// Mult by number (structure)
		else if (typeof number === "object") {
		
			var finalV = [];	
			var maxI   = this.vals.length - 1;
			var maxJ   = number.vals.length - 1;
		
			// Compute (mult)
			for (i = 0; i <= maxI; i++) {
				for (j = 0; j <= maxJ; j++) {
				
					var oI  = this.offset   + (maxI - i);
					var oJ  = number.offset + (maxJ - j);
					var off = oI + oJ;
					m       = this.vals[i] * number.vals[j];
					
					// 0 <= m <= 998'001 (999x999)
					// Format : [ thousands, units, offset ] (> 1000) OR [ units, offset ]
					if (m >= 1000) 
						finalV.push([Math.floor(m / 1000), m - (1000 * Math.floor(m / 1000)), off]);
					else 
						finalV.push([m, off]);
					
				}
			}
			
			
			// Format finalV[0] (ref)
			var pad = finalV[0][finalV[0].length - 1];
			finalV[0][finalV[0].length - 1] = 0;
			for (i = 1; i < pad; i++)
				finalV[0].push(0);
			var ref = finalV[0];	
			
			// Concatenate (add)
			for (i = 1; i < finalV.length; i++) {
				
				var add   = finalV[i];
				var off   = add[add.length - 1];
				var index = ref.length - off - 1;
				
				// Ignore last value (offset)
				for (j = add.length - 2; j >= 0; j--) {
					ref[index] += add[j];
					index--;
				}
				
			}
			// Check that no value > 1000
			for (i = (ref.length - 1); i > 0; i--)
				if (ref[i] >= 1000) {
					ref[i - 1] += Math.floor(ref[i] / 1000);
					ref[i] -= 1000 * Math.floor(ref[i] / 1000);
				}
			
			// Offset
			this.offset = 0;
			i = ref.length;
			while (ref[--i] == 0)
				this.offset++;
			
			// Vals
			ref.splice(ref.length - this.offset, this.offset);
			this.vals = ref;
			
		}
		
	}

	/* Debug */
	this.log = function () {
	
		var s = "[";
		for (var i = 0; i < this.vals.length; i++) {
			s += this.vals[i].toString();
			if (i < (this.vals.length - 1))
				s += ", ";
		}
		s += "], " + this.offset;
		console.log(s);
		
	}

}