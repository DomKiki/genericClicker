function kernel(ms) {

	// Context persistency
	var self = this;

	this.tickDef        = 1000;
	this.tickUser       = ms;
	this.tickMs         = this.tickDef;
	
	// Ratios
	this.unitsPerCRatio = 0.3;			// 30% of totalUnitsPerS
	
	// Display
	this.itemsByRow     = 4;
	
	// Upgrades
	this.generators     = null;
	this.multiplicators = null;
	
	// Units
	this.totalUnits     = number.ZERO();
	this.unitsPerT      = number.ZERO();
	this.unitsPerS      = number.ZERO();
	this.unitsPerC      = new number([1],10); //number.ONE();	
	
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
		
			self.formatFile(e.target.result);
						
			var rows = Math.round(self.generators.length / self.itemsByRow);
			if ((self.generators.length % self.itemsByRow) != 0) 
				rows++;
				
			self.initGenerators(rows, self.itemsByRow);
			self.initMultiplicators(rows, self.itemsByRow);
			
		};
		reader.readAsText(file);
				
	}
	
	this.formatFile = function(content) {
	
		var target = null;
		var cpt    = 0;
		var strs   = content.split("\r\n");
		this.generators = new Array(strs.length);
		
		var gen  = new Array();
		var mult = new Array();
		
		// Fill raw arrays (beware of context, this != self)
		strs.forEach(function(line) {
		
			// Generators
			if (line == "Generators:")
				target = "gen";
			else if (line == "Multiplicators:")
				target = "mult";
			else {
				
				if (target === "gen") 
					gen.push(line);
				else if (target === "mult")
					mult.push(line);	
					
			}
			
		});
		
		// Format
		this.formatGenerators(gen);
		this.formatMultiplicators(mult);
		
		//
		for (var i = 0; i < 68; i++)
			this.generators[0].update(1);
		//
	
	}
	
	this.saveState = function() {
	
		if (!this.generators)
			return null;
	
		var units = this.totalUnits.export() + "/" + this.unitsPerS.export();
		
		var gen   = "";
		this.generators.forEach(function(g, i) { 
			gen += g.level;
			if (i < (self.generators.length - 1))
				gen += "/"; 
		});
		
		var mult  = "";
		this.multiplicators.forEach(function(m, i) { 
			mult += m.level;
			if (i < (self.multiplicators.length - 1))
				mult += "/"; 
		});
		
		return units + ";" + gen + ";" + mult;
		
	}
	
	this.loadState = function(save) {
	
		// Checks
			// Game init
		if ((!this.generators) && (!this.multiplicators))
			return 1;
			// Syntax
		var content = save.split(";");
		if (content.length < 3)
			return 2;
				// Units
		var units = content[0].split("/");
		if (units.length < 2)
			return 2;
				// Generators
		var gen = content[1].split("/");
		if (gen.length < this.generators.length)
			return 2;
				// Multiplicators
		var mult = content[2];
		if (mult.length < this.multiplicators.length)
			return 2;
	
		// Units
		var tU = units[0].split(",");
		var tU_o = parseInt(tU[tU.length - 1]);
		tU.splice(tU.length - 1, 1);
		tU.forEach(function(u) { u = parseInt(u); });

		var uPS = units[1].split(",");
		var uPS_o = parseInt(uPS[uPS.length - 1]);
		uPS.splice(uPS.length - 1, 1);
		uPS.forEach(function(u) { u = parseInt(u); });
		
		this.totalUnits = new number(tU, tU_o);
		this.unitsPerS = new number(uPS, uPS_o);
		this.updateUnitsPerC();
		
		this.display("unitsPerS",  this.unitsPerS);
		this.display("unitsPerC",  this.unitsPerC);
		
		// Generators
		this.generators.forEach(function(g) { g.reset(); });
		gen.forEach(function(g, i) { 
			if (parseInt(g) > 0) {
				self.generators[i].update(parseInt(g)); 
				self.updateGenerator(i);
			}
		});
		
		// Multiplicators
		this.multiplicators.forEach(function(m) { m.reset(); });
		mult.forEach(function(m, i) { 
			if (parseInt(m) > 0) {
				self.multiplicators[i].update(parseInt(m)); 
				self.updateMultiplicator(i);
			}
		});
		
		return 0;
	
	}
	
	/* --------------------------------- Format ------------------------------- */
	
	this.formatGenerators = function(strs) {
		
		var cpt  = 0;
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
			
			// Instantiate generator
			self.generators[cpt] = new generator(cpt++, l[0], price, income, parseFloat(l[3]));
			
		});
	
	}
	
	this.formatMultiplicators = function(strs) {
	
		var cpt = 0;
		this.multiplicators = new Array(strs.length);
		
		// Format multiplicators
		strs.forEach(function(line) {
		
			var l = line.split(";");
			
			// Price
			var price_vals = l[1].split(",");
			var price_o = parseInt(price_vals[price_vals.length - 1]);
			price_vals.splice(price_vals.length - 1, 1);
			var price = new number(price_vals, price_o);
			
			// Multiplicator
			var mult_vals = l[2].split(",");
			var mult_o = parseInt(mult_vals[mult_vals.length - 1]);
			mult_vals.splice(mult_vals.length - 1, 1);
			var mult = new number(mult_vals, mult_o);
			
			// Instantiate multiplicator
			self.multiplicators[cpt] = new multiplicator(cpt++, l[0], price, mult, parseFloat(l[3]));
		
		});
	
	}
	
	/* -------------------------------- Display ------------------------------- */
	
	this.display = function(element, number) {
		document.getElementById(element).innerHTML = number.toString();
	}
	
	/* ----------------------------- Units Updates ---------------------------- */

	this.updateTotalUnits = function() {
	
		/* One tick or one second ?
		if (this.unitsPerT != 0) {
			this.totalUnits.add(this.unitsPerT);
			if (this.tickMs == this.tickDef)
				this.tickMs = this.tickUser;
		}
		else { */
			this.totalUnits.add(this.unitsPerS);
			/*if (this.tickMs == this.tickUser)
				this.tickMs = this.tickDef;
		}*/
			
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
			
			// Generator income
			var income = g.income.clone();
			
			// Multiplicator
			if ((g.id < self.multiplicators.length) && (self.multiplicators[g.id].level > 0))
				income.mult(self.multiplicators[g.id].multi);
			
			s.add(income);
			
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
		return "<td id='generator_" + id + "' onclick='k.addGenerator(" + id + ")'>" + g.name + "<br>Level " + g.level + "<br>" + g.price.toString() + "</td>";
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
		var s = g.name + "<br>Level " + g.level + "<br>" + g.price.toString();
		document.getElementById("generator_" + id).innerHTML = s;
		
	}
	
	/* ----------------------------- Multiplicators ----------------------------- */
	
	this.initMultiplicators = function(rows, cols) {
	
		// Reset table content
		document.getElementById("table_multiplicators").innerHTML = "";
	
		// Fill with this.generators
		for (var i = 0; i < rows; i++) {
		
			$("#table_multiplicators").append("<tr>");
			
			for (var j = 0; j < cols; j++) {
				var index = (i * cols) + j;
				if (index < this.multiplicators.length)
					$("#table_multiplicators").append(this.printMultiplicatorHTML(index));
				else
					break;
			}
				
			$("#table_multiplicators").append("</tr>");
			
		}
	
	}
	
	this.addMultiplicator = function(id) {
			
		// If enough units in bank
		if (this.totalUnits.isGreater(this.multiplicators[id].price)) {
		
			// Substract from bank
			this.totalUnits.sub(this.multiplicators[id].price);
			
			// Update multiplicator level
			this.multiplicators[id].update(1);
			// Update unitsPerS, unitsPerT and unitsPerC
			this.updateUnitsPerS();
			//this.updateUnitsPerT();
			this.updateUnitsPerC();
			
			// Display multiplicator, unitsPerS, unitsPerC and totalUnits
			this.display("unitsPerS",  this.unitsPerS);
			this.display("unitsPerC",  this.unitsPerC);
			this.display("totalUnits", this.totalUnits);
			this.updateMultiplicator(id);
			
		}

	}
	
	this.updateMultiplicator = function(id) {
	
		var m = this.multiplicators[id];
		var s = m.name + "<br>Level " + m.level + "<br>" + m.price.toString();
		document.getElementById("multiplicator_" + id).innerHTML = s;
		
	}
	
	this.printMultiplicatorHTML = function(id) {
		var m = this.multiplicators[id];
		return "<td id='multiplicator_" + id + "' onclick='k.addMultiplicator(" + id + ")'>" + m.name + "<br>Level " + m.level + "<br>" + m.price.toString() + "</td>";
	}
	
}