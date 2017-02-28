function kernel(ms) {

	// Context persistency
	var self = this;

	this.tickDef        = 1000;
	this.tickUser       = ms;
	this.tickMs         = this.tickDef;
	
	// Ratios
	this.unitsPerCRatio = 0.4;			// 40% of totalUnits
	
	// Display
	this.itemsByRow     = 4;
	
	// Buildings
	this.generators     = null;
	
	// Units
	this.totalUnits     = number.ZERO();
	this.unitsPerT      = number.ZERO();
	this.unitsPerS      = number.ZERO();
	this.unitsPerC      = number.ONE();

	this.click = function() {
	
		this.totalUnits.add(this.unitsPerC);
		this.display("totalUnits", this.totalUnits);
		
	}
	
	/* --------------------------------- I / O -------------------------------- */
	
	
	this.readSingleFile = function(e) {
		
		var file = e.target.files[0];
		if (!file) return null;
  
		var reader = new FileReader();
		reader.onload = function(e) { 
		
			self.formatGenerators(e.target.result); 
			
			var rows = Math.round(self.generators.length / self.itemsByRow);
			if ((self.generators.length % self.itemsByRow) != 0) 
				rows++;
				
			self.initGenerators(rows, self.itemsByRow);
			
		};
		reader.readAsText(file);
				
	}
	
	this.formatGenerators = function(content) {
	
		var cpt  = 0;
		var strs = content.split("\r\n");
		this.generators = new Array(strs.length);
		
		// Format generators (beware of context, this != self)
		strs.forEach(function(line) {
		
			var l = line.split(";");
		
			// Price
			var price_vals = l[1].split(",");
			var price_o = parseInt(price_vals[price_vals.length - 1]);
			price_vals.splice(price_vals.length - 1, 1);
			var price = new number(price_vals, price_o);
			
			// Income
			var income_vals = l[2].split(",");
			var income_o = parseInt(income_vals[income_vals.length - 1]);
			income_vals.splice(income_vals.length - 1, 1);
			var income = new number(income_vals, income_o);
			
			// Instantiate generator (and inc cpt)
			self.generators[cpt] = new generator(cpt++, l[0], price, income, l[3]);
			
		});
	
	}
	
	/* -------------------------------- Display ------------------------------- */
	
	this.display = function(element, number) {
		document.getElementById(element).innerHTML = number.toString();
	}
	
	/* ----------------------------- Units Updates ---------------------------- */

	this.updateTotalUnits = function() {
	
		// One tick or one second ?
		if (this.unitsPerT != 0) {
			this.totalUnits.add(this.unitsPerT);
			if (this.tickMs == this.tickDef)
				this.tickMs = this.tickUser;
		}
		else { 
			this.totalUnits.add(this.unitsPerS);
			if (this.tickMs == this.tickUser)
				this.tickMs = this.tickDef;
		}
			
	}
	
	this.updateUnitsPerT = function() {
		
		var u    = this.unitsPerS.clone();
		var tick = Math.floor(1000 / this.tickMs);
		
		// If offset = 0, check that number can be divided by (1/tick)
		if ((u.offset != 0) || 
		    ((u.offset == 0) && (u.vals[0] >= (1.0 / tick)))) {
			u.mult((1.0 / tick));
			this.unitsPerT = u;
		}
		else
			this.unitsPerT = number.ZERO();
		
	}
	
	this.updateUnitsPerS = function() {

		var s = number.ZERO();
		this.generators.forEach(function (g) {
			s.add(g.income.clone());
		});
		this.unitsPerS = s;
		
	}
	
	this.updateUnitsPerC = function() {
		
		// % of unitsPerS
		this.unitsPerC = this.unitsPerS.clone();
		this.unitsPerC.mult(this.unitsPerCRatio);
		
		// Minimum of 1 uPC
		if (this.unitsPerC.equals(number.ZERO()))
			this.unitsPerC = number.ONE();
		
	}
	
	/* ------------------------------ Generators ------------------------------ */

	this.logGenerators = function(id) {
	
		console.log("Id\t\tName\t\tLevel\t\tPrice\t\tIncome");
		if (id == null)
			this.generators.forEach(function(g, i) {
				console.log(i + "\t\t" + g.name + "\t\t" + g.level + "\t\t" + g.base_price + "\t\t\t" + g.income);
			});
		else {
			var g = this.generators[id];
			console.log(id + "\t\t" + g.name + "\t\t" + g.level + "\t\t" + g.base_price + "\t\t\t" + g.income);	
		}
		
	}
	
	this.printGeneratorHTML = function(id) {
		var g = this.generators[id];
		return "<td id='generator_" + id + "' onclick='k.addGenerator(" + id + ")'>" + g.name + "<br> x" + g.level + "<br>" + g.price.toString() + "</td>";
	}

	this.initGenerators = function(rows, cols) {
	
		// Reset table content
		document.getElementById("table_generators").innerHTML = "";
	
		// Fill with this.generators
		for (var i = 0; i < rows; i++) {
		
			$("#table_generators").append("<tr>");
			
			for (var j = 0; j < cols; j++) {
				var index = (i * cols) + j;
				if (index < this.generators.length)
					$("#table_generators").append(this.printGeneratorHTML(index));
				else
					break;
			}
				
			$("#table_generators").append("</tr>");
			
		}

	}

	this.addGenerator = function(id) {
			
		// If enough units in bank
		if (this.totalUnits.isGreater(this.generators[id].price)) {
		
			// Substract from bank
			this.totalUnits.sub(this.generators[id].price);
			
			// Update generator level
			this.generators[id].update(1);
			// Update unitsPerS, unitsPerT and unitsPerC
			this.updateUnitsPerS();
			//this.updateUnitsPerT();
			this.updateUnitsPerC();
			
			// Display generator, unitsPerS, unitsPerC and totalUnits
			this.updateGenerator(id);
			this.display("unitsPerS",  this.unitsPerS);
			this.display("unitsPerC",  this.unitsPerC);
			this.display("totalUnits", this.totalUnits);
			
		}

	}
	
	this.updateGenerator = function(id) {
	
		var g = this.generators[id];
		var s = g.name + "<br> x" + g.level + "<br>" + g.price.toString();
		document.getElementById("generator_" + id).innerHTML = s;
		
	}
	
}