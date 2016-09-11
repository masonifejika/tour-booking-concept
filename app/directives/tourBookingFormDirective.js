tourBookingApp.directive('tourBookingForm', function () {
	
	return {
		restrict: 'E',
		templateUrl: 'app/views/tourbooking.form.html',
		controller: ['$scope', 'creditCardService', function ($scope, creditCardService) {
			
			$scope.tourBooking = {
				information: {
					photo: 'content/images/canary_wharf_aerial_photo.jpg',
					title: 'Canary Wharf Helicopter Tour',
					currency: '£',
					price: '300.00'
				},
				customer: {
					fullName: null,
					creditCardNo: null,
					creditCardExpiryMonth: null,
					creditCardExpiryYear: null,
					creditCardCVV: null,
					creditCardType: null
				},
				bookingButtonText: 'Book This Tour',
				bookTour: function () {
					if ($scope.isCardValid()) {
						makePayment();
					};
				}
			};
			
			// get the card type, based on the card number provided
			$scope.getCardType = function (cardNumber) {
				var cardType = creditCardService.getCardType(cardNumber);
				$scope.tourBooking.customer.creditCardType = cardType;
				return cardType;
			};
			
			// check whether the card is valid
			$scope.isCardValid = function () {
				var isValid = false;
				// only accept visa, mastercard and amex for the purposes of this concept
				if (!$scope.tourBooking.customer.creditCardType) {
					$scope.errorMessage = 'sorry, but we are only accepting visa, mastercard and american express at this time';
					return isValid;
				}
				else {
					// the card type is valid, so check that the number of digits are correct
					if (!creditCardService.isCardNumberLengthValid($scope.tourBooking.customer.creditCardType, $scope.tourBooking.customer.creditCardNo)) {
						switch ($scope.tourBooking.customer.creditCardType) {
							case 'visa':
								$scope.errorMessage = 'your visa card number should consist of 13, 16 or 19 digits. the card number you entered has ' + $scope.tourBooking.customer.creditCardNo.toString().length + ' digits';
								break;
							case 'mastercard':
								$scope.errorMessage = 'your mastercard number should consist of 16 digits. the card number you entered has ' + $scope.tourBooking.customer.creditCardNo.toString().length + ' digits';
								break;
							case 'amex':
								$scope.errorMessage = 'your american express card number should consist of 15 digits. the card number you entered has ' + $scope.tourBooking.customer.creditCardNo.toString().length + ' digits';
								break;
						}
						return isValid;
					}
				}
				// validate the card number against the Luhn algorithm
				if (!creditCardService.isVerifiedWithLuhnAlgorithm($scope.tourBooking.customer.creditCardNo)) {
					$scope.errorMessage = 'please enter a valid credit or debit card number';
					return isValid;
				}
				// if we've got this far, then the card number must be valid!
				$scope.errorMessage = null;
				isValid = true;
				return isValid;
			};
			
			$scope.errorMessage = null;
			
			// contect the credit card service API and attempt to make the payment
			var makePayment = function () {
				$scope.tourBooking.bookingButtonText = 'Processing Your Payment...';
				var customer = $scope.tourBooking.customer;
				creditCardService.makePayment(customer.fullName, customer.creditCardNo, customer.creditCardExpiryMonth, customer.creditCardExpiryYear, customer.creditCardCVV, $scope.tourBooking.information.price).then(function (response) {
					// the transaction was successful, now display a thank you message to the customer.
					// however, for the purposes of this concept, there is no payment API so it will never be successful
				}, function (response) {
					// the transaction was unsuccessful
					$scope.errorMessage = 'sorry, the transaction failed. please try again';
					$scope.tourBooking.bookingButtonText = 'Book This Tour (Retry)';
				});
			};
			
		}],
		link: function (scope, element, attrs) {
			
		}
	};
	
});
