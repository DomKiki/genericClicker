function kernell() {


	this.generators = new Array(12);
	this.totalUnits = new number([0], 0);
	this.unitsPerS  = new number([0], 0);
	this.unitsPerC  = new number([100], 0);

	this.click = function() {
	
		this.totalUnits.add(this.unitsPerC);
		this.display("totalUnits", this.totalUnits);
		
	}

	/* ------------------------------- Intervals ------------------------------ */
	
	setInterval(function() {
		updateTotalUnits();
	}, 1000);
	
	/* -------------------------------- Display ------------------------------- */
	
	this.display = function(element, number) {
		document.getElementById(element).innerHTML = number.toString();
	}
	
	/* -------------------------------- Updates ------------------------------- */

	this.updateTotalUnits = function() {
		this.totalUnits.add(this.unitsPerS);
	}
	
	this.updateUnitsPerS = function() {

		var totalIncome = new number([0], 0);
		generators.forEach(function (g) {
			var income = new number([g.income * g.level], 0);
			totalIncome.add(income_ln);
		})
		return totalIncome;
		
	}
	
	this.updateUnitsPerC = function() {
		// Code is somewhere around here
		// Need some sort of division
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
		return "<td id='generator_" + id + "' onclick='kernel.addGenerator(" + id + ")'>" + g.name + " (" + g.level + ")<br>" + g.price.toString() + "</td>";
	}
	
	this.loadGenerators = function() {

		// REPLACE BY LOAD FROM FILE !!

		for (var i = 0; i < 12; i++)
			this.generators[i] = new generator(i, "Cursor_" + i, new number([10], 0), new number([10], 0), 1.5);
		this.initGenerators();

	}

	this.initGenerators = function() {
	
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
		
			// Substract
			this.totalUnits.sub(this.generators[id].price);
			// Inc unitsPerS
			this.unitsPerS.add(this.generators[id].income);
			// Update generator level
			this.generators[id].update(1);
			
			// Display generatorm unitsPerS and totalUnits
			this.updateGenerator(id);
			this.display("unitsPerS",  this.unitsPerS);
			this.display("totalUnits", this.totalUnits);
			
		} else 
			console.log("Not enough units in bank for generator " + id + ".");

	}
	
	this.updateGenerator = function(id) {
	
		var g = this.generators[id];
		var s = g.name + " (" + g.level + ")<br>" + g.price.toString();
		document.getElementById("generator_" + id).innerHTML = s;
		
	}
	
}