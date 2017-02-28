function multiplicator(d, n, p, m, r) {

	this.id         = d;
	this.name       = n;
	this.base_price = p;
	this.price      = p;
	this.base_multi = m;
	this.rate       = r;
	
	// Initial values
	this.level      = 0;
	this.multi      = number.ONE();
	
	this.updatePrice = function() {
		
		// Price = Base_Price * Level * Rate
		this.price = this.base_price.clone();
		this.price.mult(this.level);
		this.price.mult(this.rate);
	
	}
	
	this.updateMulti = function() {
	
		// Income = Base_Mult * Level * Rate
		this.multi = this.base_multi.clone();
		this.multi.mult(this.level);
	
	}
	
	this.updateRate = function(amount) {
	
		this.rate *= (1 + (amount * 0.1));
	
	}
	
	this.update = function(amount) {
	
		this.level += amount;
		this.updatePrice();
		this.updateMulti();
		this.updateRate(amount);
	
	}
	

}