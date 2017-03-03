function generator(d, n, p, i, r) {

    this.id          = d;
    this.name        = n;
    this.base_price  = p;
	this.price       = p;
	this.base_income = i;
    this.rate        = r;
	this.base_rate   = r;
	
	// Initial values
    this.level       = 0;
    this.income      = number.ZERO();
	
    this.updatePrice = function() { 
		
		// Price = Base_Price * Level * Rate
		this.price = this.base_price.clone();
		this.price.mult(this.level);
		this.price.mult(this.rate); 
		
	}
	
	this.updateIncome = function() {
	
		// Income = Base_Income * Level * Rate
		this.income = this.base_income.clone();
		this.income.mult(this.level);
		
	}
	
	this.updateRate = function(amount) {
	
		if (typeof this.rate === "number") {
	
			this.rate *= (1 + (amount * 0.1)); 
		
			// Convert to number if getting big
			if (this.rate >= 1000) {
				
				var n = new number([0],0);
				while (this.rate >= 1000) {
					n.offset++;
					this.rate = Math.floor(this.rate / 1000);
				}
				n.vals[0] = this.rate;
				this.rate = n.clone();
				
			}
			
		}
		
		else if (typeof this.rate === "object") {
		
			this.rate.mult(1 + (amount * 0.1)); 
			console.log("rate x " + (1 + (amount * 0.1)) + " => " + this.rate);
			
		}
	
	}
	
	this.update = function(amount) { 
		
		this.level += amount;
		this.updateRate(amount);
		this.updatePrice();
		this.updateIncome();
		
	}
	
	this.reset = function() {
	
		this.level  = 0;
		this.income = number.ZERO();
		this.price  = this.base_price.clone();
		this.rate   = this.base_rate;
	
	}
	
}