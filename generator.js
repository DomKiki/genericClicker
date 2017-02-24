function generator(d, n, p, i, r) {

    this.id          = d;
    this.name        = n;
    this.base_price  = p;
	this.price       = p;
	this.base_income = i;
    this.rate        = r;
	
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
	
		this.rate *= (1 + (amount * 0.1));
	
	}
	
	this.update = function(amount) { 
	
		this.level += amount;
		this.updatePrice();
		this.updateIncome();
		this.updateRate(amount);
		
	}

}