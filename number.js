/* Constants */

number.ZERO = function() { return new number([0], 0); }
number.ONE  = function() { return new number([1], 0); }

var labels = [null, "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion", 
              "Decillion", "Undecillion", "Duodecillion", "Tredecillion", "Quattuordecillion", "Quindecillion", "Sexdecillion", "Septendecillion", "Octodecillion", "Novemdecillion",
			  "Vingtillion", "Unvingtillion", "Duovingtillion", "Trevingtillion", "Quattuorvingtillion", "Quinvingtillion", "Sexvingtillion", "Septenvingtillion", "Octovingtillion", "Novemvingtillion", 
			  "Trigintillion"];

function number(values, offset) {

	/* Constructor */

	this.vals   = values;
	this.offset = offset;
	
	/* Functions */
	
	this.clone = function() { return new number(this.vals.slice(), this.offset); }
	
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
		if (label) {
			str += " " + label;
			// Plural
			if (this.vals[0] > 1)
				str += "s";
		}
		
		return str;
		
	}
	
	this.format = function(digits, num) {
	
		var str = digits.toString();
		if (str.length < num)
			for (var i = str.length; i < num; i++)
				str = "0" + str;
		return str;
	
	}

	this.removeZeros = function() {
	
		// Left
		var zeros = 0;
		var j = 0;
		while (this.vals[j++] == 0) 
			zeros++;
		if (zeros != 0)
			this.vals.splice(0, zeros);
			
		// Right
		zeros = 0;
		j = this.vals.length - 1;
		while (this.vals[j--] == 0)
			zeros++;
		if (zeros != 0) {
			this.vals.splice(this.vals.length - zeros, zeros);
			this.offset += zeros;
		}
	
		// If empty, push a single 0
		if (this.vals.length == 0) this.vals.push(0);
		
	}
	
	/* Compare */
	
	this.equals = function (number) {
	
		// Unequal values lengths and offsets
		if ((this.offset != number.offset) || (this.vals.length != number.vals.length))
			return false;
			
		// Values check
		for (var i = 0; i < this.vals.length; i++)
			if (this.vals[i] != number.vals[i])
				return false;
		
		return true;
	
	}
	
	this.isGreater = function (number) {
	
		
		var myL  = this.vals.length   + this.offset;
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
		
			var s = parseInt(this.vals[i]) + parseInt(number.vals[i]);
			
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
		
		// Removing zeros
		this.removeZeros();
		
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
		
		// Remove zeros
		this.removeZeros();
		
	}
	
	/*
		this.vals.length --> len
		Test flow :
					+-- Float
					| |
					| +-- m >= 1000
					| | |
					| | +-- i = 0
					| | +-- i > 0
					| | 
					| +-- m < 1
					| | |
					| | +-- i < (len - 1)
					| | | |
					| | | +-- offset > 0
					| | | +-- offset = 0
					| | |
					| | +-- i = (len - 1)
					| |
					| +-- 1 <= m < 1000
					|   |
					|   +-- (i = (len - 1)) XNOR (offset = 0)
					|   +-- else
					|     |
					|     +-- i = (len - 1)
					|     +-- offset = 0
					|
					+-- Number Structure
					|
					|...
	
	*/
	this.mult = function (number) {
	
		var i, j, m;
			
		// Mult by float < 1000
		if (typeof number === "number") {
			
			for (i = (this.vals.length - 1); i >= 0; i--) {
		
				// Compute
				m = this.vals[i] * number;
				
				// Forward-propagation (values >= 1000)
				if (m >= 1000) {
				
					var thous = Math.floor(m / 1000);
					var units = Math.floor(m - (1000 * thous));
					
					// First value
					if (i == 0) {
					
						this.vals.unshift(thous); 
						this.vals[1] = units;
						
					} else {
					
						this.vals[i] = units;
						this.vals[i - 1] += thous; 
						
					}
					
				}
				// Back-propagation (values < 1)
				else if (m < 1) {
				
					// Last value
					if (i == (this.vals.length - 1)) {
					
						// No offset to decrement
						if (this.offset == 0)
							this.vals[i] = 0;
						else {
							this.vals[this.vals.length] = Math.floor(m * 1000);
							this.vals[i] = 0;
							this.offset--;
						}
						
					}
					
					else {
						this.vals[i] = 0;
						this.vals[i + 1] += Math.floor(m * 1000);
					}
				
				}
				// Default 
				else
				
					// If both lastEl and offset0 are true or false
					if (((i == (this.vals.length - 1)) && (this.offset == 0)) || ((i != (this.vals.length - 1)) && (this.offset != 0)))// (lastEl == offset0)
						this.vals[i] = Math.floor(m);
					else {
					
						// offset0 false
						if (i == (this.vals.length - 1)) {
							this.vals[this.vals.length] = Math.floor((m - Math.floor(m)) * 1000);
							this.vals[i] = Math.floor(m);
							this.offset--;
						}
						// lastEl false
						else if (this.offset == 0) {
							this.vals[i] = Math.floor(m);
							this.vals[i + 1] += Math.floor((m - Math.floor(m)) * 1000);
						}
						
					}
				
			}
			
		}
		
		// Mult by number (structure)
		else if (typeof number === "object") {
				
			console.log(this + " x " + number + " = ");	
				
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
					console.log("("+i+","+j+") m = "+m+", offset " +off);
					// 0 <= m <= 998'001 (999x999)
					// Format : [ thousands, units, offset ] (> 1000) OR [ units, offset ]
					if (m >= 1000) {
						var thous = Math.floor(m / 1000);
						var units = m - (1000 * Math.floor(m / 1000));
						console.log("[" + thous + "," + units + "," + off + "]");
						finalV.push([thous, units, off]); }
					else {
						finalV.push([m, off]);
						console.log(finalV[finalV.length - 1]);
					}
					
				}
			}
			
			console.log(finalV);
			
			// Format finalV[0] (ref)
			var pad = finalV[0][finalV[0].length - 1];
			finalV[0].splice(finalV[0].length - 1, 1);
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
			if (this.offset < number.offset)
				this.offset = number.offset;
			
			// Vals
			this.vals = ref;
			
			this.log();
						
		}
		
		// Remove zeros
		this.removeZeros();
		
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
	
	this.export = function() {
	
		var s = "";
		for (var i = 0; i < this.vals.length; i++) 
			s += this.vals[i].toString() + ",";
		s += this.offset.toString();
		
		return s;
	
	}

}