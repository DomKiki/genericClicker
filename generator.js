function generator(d, n, p, i, r) {

    this.id          = d;
    this.name        = n;
    this.base_price  = p;
	this.price       = p;
	this.base_income = i;
    this.income      = i;
    this.rate        = r;
    this.level       = 0;
	
    this.updatePrice = function() { 
		
		// Price = Base_Price * Level * Rate
		this.price = new number([0],0);
		this.price.add(this.base_price);
		this.price.mult(this.level);
		this.price.mult(this.rate); 
		
	}
	
	this.updateIncome = function() {
	
		// Income = Base_Income * Level * Rate
		this.income = new number([0], 0);
		this.income.add(this.base_income);
		this.income.mult(this.level);
		this.income.mult(this.rate);
		
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