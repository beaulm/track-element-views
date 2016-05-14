//Sends events to GA if at least the specified percentage of the element is on screen for the minimum amount of time supplied
function trackViews(minimumScrollPause, percentVisible, selector) {
	//Taken from Underscore.js
	//Doesn't execute the function passed in until debounce hasn't been called for `wait` milliseconds
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	//Choose something to report back to google analytics
	function getNameForElement(element) {
		//Rearrange these IF statements in order of preference
		if(element.getAttribute('data-trackname') !== null) {
			return element.getAttribute('data-trackname');
		}
		if(element.getAttribute('id') !== null) {
			return element.getAttribute('id');
		}
		if(element.getAttribute('src') !== null) {
			return element.getAttribute('src');
		}
		if(element.getAttribute('name') !== null) {
			return element.getAttribute('name');
		}
		if(element.innerText.substr(0, 64) !== '') {
			return element.innerText.substr(0, 64);
		}
		if(element.getAttribute('alt') !== null) {
			return element.getAttribute('alt');
		}
	}

	//Track/emit events
	function emitEvent(action, label, value) {
		//If Google Universal Analytics is present
		if(window.hasOwnProperty('ga') && typeof(window.ga) === 'function') {
			//Send a ga event
			window.ga('send', 'event', 'Element', action, label, value);
		}

		//Create a custom "synthetic" event to dispatch
		var syntheticEvent = new CustomEvent(action, {
			detail: {
				action: label,
				label: value
			}
		});

		//Dispatch the custom event
		window.dispatchEvent(syntheticEvent);
	}

	//Make sure the browser gives the date properly (IE < 8: I'm looking in your direction)
	if(!Date.now) {
    Date.now = function() { return new Date().getTime(); }
	}

	//Initialize an empty list of currently visible elements
	var visibleElements = {};

	//Initialize a list of visible element timings
	var elementTimings = {};

	//When the user has stopped scrolling for the specified amount of time
	window.onscroll = debounce(function() {

		//Create a list of elements currently in view
		var inView = [];

		//Get all the elements of the specified type on the page
		var allElements = document.querySelectorAll(selector);

		//Go through each element
		for(var i=0; i<allElements.length; i++) {

			//Get the bounding rectangle of the current element
			var rect = allElements[i].getBoundingClientRect();

			//Get the area of the whole element
			var elementArea = (rect.width * rect.height);

			//Get the measurements of the current viewport
			var windowHeight = window.innerHeight || document.documentElement.clientHeight;
			var windowWidth = window.innerWidth || document.documentElement.clientWidth;

			//Initialize the edges of the visible portion of the element
			var vTop = rect.top;
			var vBottom = rect.bottom;
			var vLeft = rect.left;
			var vRight = rect.right;

			//Adjust them to where the element is actually cut off
			if(vTop < 0) {
				vTop = 0;
			}
			if(vBottom > windowHeight) {
				vBottom = windowHeight;
			}
			if(vLeft < 0) {
				vLeft = 0;
			}
			if(vRight > windowWidth) {
				vRight = windowWidth;
			}

			//Calculate the visible area
			var visibleArea = ((vRight-vLeft) * (vBottom-vTop));

			//If a large enough portion of the element is visible to be counted as being in view
			if((visibleArea/elementArea*100) >= percentVisible) {
				//Add it to our list of elements that are currently in view (to be used below)
				inView.push(getNameForElement(allElements[i]));
			}
		}

		//For each element that was in view last time we checked
		for(var currentElement in visibleElements) {
			if(visibleElements.hasOwnProperty(currentElement)) {

				//If it's not currently in view
				if(inView.indexOf(currentElement) === -1) {

					//If it doesn't already have records in our log
					if(!elementTimings.hasOwnProperty(currentElement)) {

						//Create a new record for this element in our log
						elementTimings[currentElement] = [];
					}

					//Calculate how long it was visible for
					var visibleFor = Date.now()-visibleElements[currentElement];

					//Add the new timing to it's record
					elementTimings[currentElement].push(visibleFor);

					//Track an event for this particular view
					emitEvent('individualView', currentElement, visibleFor);

					//Remove it from the list of elements in view
					delete visibleElements[currentElement];
				}
			}
		}

		//For each element that's currently in view
		for(var j=0; j<inView.length; j++) {

			//If it's not already in the list of elements in view
			if(!visibleElements.hasOwnProperty(inView[j])) {

				//Add it to the list
				visibleElements[inView[j]] = Date.now();

			}
		}
	}, minimumScrollPause, false);

	//Just before navigating away from the page (closing the window or changing pages etc)
	window.onbeforeunload = function() {

		//Go through each element that was recorded as being visible
		for(var element in elementTimings) {

			//Send a ga event for the total number of views
			emitEvent('totalViews', element, elementTimings[element].length);

			//Send a ga event for the total time visible
			emitEvent('viewedFor', element, elementTimings[element].reduce(function(pv, cv) { return pv + cv; }, 0));
		}
	};
}
