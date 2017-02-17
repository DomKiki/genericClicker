function generator(d, n, p, i, r) {

    this.id         = d;
    this.name       = n;
    this.base_price = p;
	this.price      = p;
    this.income     = i;
    this.rate       = r;
    this.level      = 0;
	
    this.updatePrice = function() { 
		// Need number.mult()
		// this.price = this.base_price * level * rate; 
		// For now, double price each time
		this.price.add(this.price);
		
	}
	
	this.updateIncome = function() {
		// Code was here
	}
	
	this.updateLevel = function(amount) { 
		this.level += amount;
		this.updatePrice();
		this.updateIncome();
	}
	
	this.getPrice = function(amount) {
		return (this.price * amount * rate);
	}

}