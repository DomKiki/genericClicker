function kernell(ms) {

	this.tickMs     = ms;
	
	// Buildings
	this.generators = new Array(12);
	
	// Values
	this.totalUnits = new number([0], 0);
	this.unitsPerT  = new number([0], 0);
	this.unitsPerS  = new number([0], 0);
	this.unitsPerC  = new number([10], 0);

	this.click = function() {
	
		this.totalUnits.add(this.unitsPerC);
		this.display("totalUnits", this.totalUnits);
		
	}
	
	/* --------------------------------- I / O -------------------------------- */
	
	this.readSingleFile = function(e) {
	
		var file = e.target.files[0];
		if (!file) return;
  
		var reader = new FileReader();
		reader.onload = function(e) {
			console.log(e.target.result);
			//this.formatGenerators(e.target.result);
			//this.initGenerators();
		};
		reader.readAsText(file);
	}
	
	this.formatGenerators = function(str) {
	
		var cpt  = 0;
		var strs = str.split("\r\n");
		this.generators = new Array(strs.length);
		console.log(strs);
		
		strs.forEach(function(line) {
		
			var l = line.split(";");
		
			// Price
			var price_vals = l[1].split(",");
			var price_o = price_vals[price_vals.length - 1];
			price_vals.splice(price_vals.length - 1, 1);
			// Income
			var income_vals = l[2].split(",");
			var income_o = income_vals[income_vals.length - 1];
			income_vals.splice(income_vals.length - 1, 1);
			
			// Instantiate generator (and inc cpt)
			this.generators[cpt] = new generator(cpt++, l[0], new number(price_vals, price_o), new number(income_vals, income_o), l[3]);
			
		});
	
	}
	
	/* -------------------------------- Display ------------------------------- */
	
	this.display = function(element, number) {
		document.getElementById(element).innerHTML = number.toString();
	}
	
	/* -------------------------------- Updates ------------------------------- */

	this.updateTotalUnits = function() {
		this.totalUnits.add(this.unitsPerS);
	}
	
	this.updateUnitsPerT = function() {
		
		var u     = this.unitsPerS.clone();
		var tick  = Math.floor(1000 / this.tickMs);
		
		/* If offset = 0, check that number can be divided by (1/tick)
		if ((u.offset != 0) || 
		   ((u.offset == 0) && (u.vals[0] >= (1.0 / tick))) { */
			u.mult((1.0 / tick));
			this.unitsPerT = u;
			console.log(this.unitsPerS + "U/s => " + this.unitsPerT + "U/" + this.tickMs + " ms");
		//}
		
	}
	
	this.updateUnitsPerS = function() {

		var s = new number([0], 0);
		this.generators.forEach(function (g) {
			s.add(new number([g.income * g.level], 0));
		});
		this.unitsPerS = s;
		
	}
	
	this.updateUnitsPerC = function() {
		// Code is somewhere around here
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
		return "<td id='generator_" + id + "' onclick='kernel.addGenerator(" + id + ")'>" + g.name + "<br> x" + g.level + "<br>" + g.price.toString() + "</td>";
	}
	
	this.loadGenerators = function(e) {

		for (var i = 0; i < 12; i++)
			this.generators[i] = new generator(i, "Cursor_" + i, new number([10], 0), new number([10], 0), 1.5);
		this.initGenerators();

	}

	this.initGenerators = function() {
	
		// Reset table content
		document.getElementById("table_generators").innerHTML = "";
	
		// Fill with this.generators
		for (var i = 0; i < 3; i++) {
			$("#table_generators").append("<tr>");
			for (var j = 0; j < 4; j++) {
				var index = ((i * 4) + j);
				var g = this.generators[index];
				$("#table_generators").append(this.printGeneratorHTML(index));
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
			this.updateUnitsPerT();
			this.updateUnitsPerC();
			
			// Display generatorm unitsPerS and totalUnits
			this.updateGenerator(id);
			this.display("unitsPerS",  this.unitsPerS);
			this.display("totalUnits", this.totalUnits);
			
		}

	}
	
	this.updateGenerator = function(id) {
	
		var g = this.generators[id];
		var s = g.name + "<br> x" + g.level + "<br>" + g.price.toString();
		document.getElementById("generator_" + id).innerHTML = s;
		
	}
	
}