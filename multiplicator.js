function multiplicator(d, n, p, m, r) {

	this.id         = d;
	this.name       = n;
	this.base_price = p;
	this.mult       = m;
	this.rate       = r;
	
	// Initial values
	this.level      = 0;
	
	this.log = function() { console.log("[" + this.id + "] " + this.name + " (" + this.base_price.toString() + ") x" + this.mult); }
	

}