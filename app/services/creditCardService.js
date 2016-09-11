tourBookingApp.service('creditCardService', function ($http) {

	// send the customer's card details to an API to process the payment
    this.makePayment = function (fullName, cardNumber, expiryMonth, expiryYear, cvv, price) {
        return $http({
            url: 'api/makePayment',
            method: 'POST',
            // the payload should always be sent over a secure SSL connection
            data: {
            	customerName: fullName,
            	cardNumber: cardNumber,
            	cardExpiryMonth: expiryMonth,
            	cardExpiryYear: expiryYear,
            	cardCVV: cvv,
            	value: price
            }
        });
    };

	// get the card type based on the card number
    this.getCardType = function (cardNumber) {
		var cardType = null;
		// return nothing if there is no card number supplied
		if (!cardNumber) {
			return cardType;
		}
		// get the first 2 digits and first 4 digits for MasterCard
		var firstTwoDigits = cardNumber.toString().substring(0, 2),
			firstFourDigits = cardNumber.toString().substring(0, 4);
		// calculate the card type based on the first 1 to 4 digits of the card number
		if (cardNumber.toString().startsWith(4)) {
			cardType = 'visa';
		}
		else if ((firstFourDigits >= 2221 && firstFourDigits <= 2720) || (firstTwoDigits >= 51 && firstTwoDigits <= 55)) {
			cardType = 'mastercard';
		}
		else if (cardNumber.toString().startsWith(34) || cardNumber.toString().startsWith(37)) {
			cardType = 'amex';
		}
		return cardType;
    };
    
    // check whether the card number is the correct length according to the card type
    this.isCardNumberLengthValid = function (cardType, cardNumber) {
    	var isValid = false;
    	switch (cardType) {
    		case "visa":
    			isValid = (cardNumber.toString().length === 13 || cardNumber.toString().length === 16 || cardNumber.toString().length === 19);
    			break;
    		case "mastercard":
    			isValid = (cardNumber.toString().length === 16);
    			break;
    		case "amex":
    			isValid = (cardNumber.toString().length === 15);
    			break;
    	}
    	return isValid;
    };
    
    // validate the card number against the Luhn algorithm
    this.isVerifiedWithLuhnAlgorithm = function (cardNumber) {
    	var isVerified 				= false,
    		noOfDigits 				= cardNumber.toString().length,
    		startingIndex 			= noOfDigits - 2,
    		doubledDigits			= [],
    		totalOfDoubledDigits	= 0,
    		totalOfUnaffectedDigits	= 0,
    		luhnResult				= null;
    	// moving from right to left (from the 2nd to last digit), double the alternating digits
    	for (var i = 0; startingIndex >= i; startingIndex -= 2) {
    		var digit = cardNumber.toString().charAt(startingIndex),
    			doubledDigit = digit * 2;
    		doubledDigits.push(doubledDigit);
    	}
    	// add all the double digits together
    	var doubleDigitsJoined = doubledDigits.join('');
    	for (var i = 0, len = doubleDigitsJoined.length; i < len; i++) {
    		totalOfDoubledDigits += parseInt(doubleDigitsJoined[i]);
    	}
    	// add up all of the unaffected digits
    	for (var i = 1; i < (noOfDigits + 1); i += 2) {
    		var digit = cardNumber.toString().charAt(i);
    		totalOfUnaffectedDigits += parseInt(digit);
    	}
    	// now get the result of the Luhn algorithm, the total number needs to end with a zero to be valid
    	luhnResult = totalOfDoubledDigits + totalOfUnaffectedDigits;
    	isVerified = (luhnResult % 10 === 0);
    	return isVerified;
    }

});