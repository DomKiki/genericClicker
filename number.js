var labels = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion"];

function number(values, offset) {

	/* Constructor */

	this.vals   = values;
	this.offset = offset;

	/* Functions */
	
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
		
	/* Operations */
	this.toString = function (delim) { 
	
		if (delim == null) delim = ".";
		
		var str;
		if (this.vals.length > 1)
			str = this.vals[0].toString() + delim + this.vals[1].toString(); // Format this.vals[1] as XXX !
		else
			str = this.vals[0].toString();
			
		return str + " " + labels[this.vals.length + this.offset - 1];
		
	}
	
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
		
		// Equalize arrys length
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
		for (var i = (this.vals.length - 1); i >= 0; i--) {
            var s = this.vals[i] - number.vals[i];
            if (s < 0) {
                this.vals[i - 1]--;
                this.vals[i] = s + 1000;
            } else
                this.vals[i] = s;
        }
		
	}
	
	this.mult = function (number) {
			
		var finalV = [];	
		var maxA   = this.vals.length - 1;
		var maxB   = number.vals.length - 1;
	
		// Compute (mult)
		for (var i = 0; i <= maxA; i++) {
			for (var j = 0; j <= maxB; j++) {
			
				var o = (maxA - i) + (maxB - j);
				var m = this.vals[i] * number.vals[j];
				
				// Format : [ thousands, units, offset ] (> 1000) OR [ units, offset ]
				if (m >= 1000) 
					finalV.push([Math.floor(m / 1000), m - (1000 * Math.floor(m / 1000)), o]);
				else 
					finalV.push([m, o]);
				
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
				if (ref[index] >= 1000) {
					ref[index - 1] += Math.floor(ref[index] / 1000);
					ref[index] -= 1000 * Math.floor(ref[index] / 1000);
				}
				
				index--;
				
			}
			
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