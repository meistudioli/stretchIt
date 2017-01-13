(function() {
	var createCSSClass, escapeHTML, updateContent, getSize, isCSSSupport, fcamelCase, camelCase, getStyle, attachedCallback, evtHandler, getRand, e, cloneStyle, vanquish;

	if (typeof getComputedStyle == 'undefined' || typeof MutationObserver == 'undefined' || typeof requestAnimationFrame == 'undefined') return;

	//method
	createCSSClass = function(selector, style, brandNew) {
		if (!document.styleSheets || document.getElementsByTagName('head').length == 0) return;
	    var styleSheet, mediaType, getSheet = false;
		if (typeof brandNew != 'undefined' && brandNew) {
			if (typeof brandNew.sheet != 'undefined') {
				styleSheet = brandNew.sheet;
				mediaType = typeof styleSheet.media;
				getSheet = true;
			} else {
				var s = document.createElement('style');
				s.type = 'text/css';
				document.getElementsByTagName('head')[0].appendChild(s);
				s.usable = true;
				navigator.ssHost = s.sheet;
			}//end if
		}//end if
		if (!getSheet) {
			if (navigator.ssHost) {
				styleSheet = navigator.ssHost;
				mediaType = typeof styleSheet.media;
			} else {
				for (var i=-1,l=document.styleSheets.length;++i<l;) {
					var ss = document.styleSheets[i], media, isCrossDomain, mediaText;
					if (ss.disabled || (typeof ss.usable != 'undefined' && !ss.usable)) continue;
					media = ss.media;
					mediaType = typeof media;
					if (typeof ss.usable == 'undefined') ss.usable = false;
					if (mediaType == 'string') {
						try {
							isCrossDomain = (ss.rules == null) ? true : false;
						} catch(e) { isCrossDomain = true; }
						if ((media == '' || media.indexOf('screen') != -1) && !isCrossDomain) { styleSheet = ss; ss.usable = true; }
					} else if (mediaType == 'object') {
						try {
							isCrossDomain = (ss.cssRules == null) ? true : false;
							mediaText = media.mediaText;
						} catch(e) {isCrossDomain = true;}
						if (!isCrossDomain && (typeof mediaText != 'undefined' && (mediaText == '' || mediaText.indexOf('screen') != -1))) { styleSheet = ss; ss.usable = true; }
					}//end if
					if (typeof styleSheet != 'undefined') break;
				}//end for
				if (typeof styleSheet == 'undefined') {
					var s = document.createElement('style');
					s.type = 'text/css';
					document.getElementsByTagName('head')[0].appendChild(s);
					s.usable = true;
					styleSheet = s.sheet;
					mediaType = typeof styleSheet.media;
				}//end if
				navigator.ssHost = styleSheet;
			}//end if
		}//end if

	    if (mediaType == 'string') {
			for (var i=-1,l=styleSheet.rules.length;++i<l;) if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) { styleSheet.rules[i].style.cssText = style; return; }
			styleSheet.addRule(selector, style);
	    } else if (mediaType == 'object') {
	        var isClear;
	        try {
	            isClear = (styleSheet.cssRules == null) ? false : true;
	        } catch(err) { isClear = false; }
	        if (isClear) {
	            for (var i=-1,l=styleSheet.cssRules.length;++i<l;) if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) { styleSheet.cssRules[i].style.cssText = style; return; }
	            styleSheet.insertRule(selector + '{' + style + '}', 0);
	        } else {
	            styleSheet.insertRule(selector + '{' + style + '}', 0);
	        }//end if
	    }//end if
	};

	fcamelCase = function(all, letter) {
		return letter.toUpperCase();
	};

	camelCase = function(str) {
		return str.replace(/-([a-z])/ig, fcamelCase);
	};

	isCSSSupport = function(css, element) {
		var e = document.createElement('div'), css, isSupported;
		css = (/^-ms/.test(css)) ? ('ms' + camelCase(css.replace(/-ms/,''))) : camelCase(css);
		if (element && element.tagName) e = element.cloneNode(true);
		isSupported = (css in e.style);
		e = null;
		return isSupported;
	};

	getStyle = function(e, property) {
		return document.defaultView.getComputedStyle(e,null).getPropertyValue(property.replace(/([A-Z])/g,'-$1').toLowerCase());
	};

	getRand = function(min, max) {
		return Math.floor(Math.random()*(max-min+1)+min);
	};

	getSize = function(e) {
		var display = getStyle(e,'display'), size;
		if (display && display != 'none') size = [e.offsetWidth,e.offsetHeight];
		else {
			var style = e.style;
			var oriStyle = {visibility:style.visibility, position:style.position, display:style.display},
				newStyle = {visibility:'hidden', display:'block'};
			if (oriStyle.position !== 'fixed') newStyle.position = 'absolute';
			for (var i in newStyle) style[i] = newStyle[i];
			size = [e.offsetWidth,e.offsetHeight];
			for (var i in oriStyle) style[i] = oriStyle[i];
		}//end if
		return size;
	};

	cloneStyle = function(target) {
		var cs, property;

		cs = window.getComputedStyle(target, null); 
		property = [];
		[].slice.call(cs).forEach(
			function(key, idx) {
				property.push(key+':'+cs.getPropertyValue(key));
			}
		);

		//reset
		property.push('height:auto');
		property.push('min-height:0');
		property.push('max-height:none');

		return property.join(';');
	};

	escapeHTML = function(str) {
		return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	};

	evtHandler = function(e) {
		updateContent(this);
	};

	updateContent = function(node) {
		var k, h;
		if (!node.stretchItShadow) return;

		if (parseFloat(node.stretchH) != node.stretchH) node.stretchH = -1;
		node.stretchItShadow.innerHTML = escapeHTML(node.value).replace(/\n/gm, '<br>') + '<br>';
		if (vanquish.parentNode != document.body) document.body.appendChild(vanquish);
		h = getSize(node.stretchItShadow)[1];

		if (h == node.stretchH) return;

		node.stretchH = h;
		k = node.id;
		k = (idFirst) ? 'textarea#' + k + '[data-stretch-it]:not(hidden)' : 'textarea[data-stretch-it]:not(hidden)#' + k;
		requestAnimationFrame(
			function() {
				createCSSClass(k, 'height:' + h + 'px;max-height:none;resize:none;overflow:hidden;');
			}
		);
	};

	attachedCallback = function(node) {
		var stretchItValue, ens, prop, maxlength;
		if (typeof node.tagName == 'undefined' || !/textarea/i.test(node.tagName) || typeof node.stretchIt != 'undefined') return;
		
		stretchItValue = false;
		maxlength = -1;
		if (!node.id) node.id = 'stretchIt-' + getRand(1, 10000) + '-' + getRand(1, 1000);

		//vanquish
		ens = document.createElement('div');
		ens.id = node.id + '-shadow';
		vanquish.appendChild(ens);

		prop = {
			stretchH: {
				configurable: false,
				enumerable: false,
				value: -1,
				writable: true
			},
			stretchItShadow: {
				enumerable: false,
				configurable: false,
				value: ens
			},
			stretchItRefresh: {
				configurable: false,
				value: function() {
					if (!this.stretchItShadow) return;
					createCSSClass('#'+this.stretchItShadow.id, cloneStyle(this));
					updateContent(this);
				}
			},
			stretchIt: {
				enumerable: true,
				configurable: false,
				get: function() {
					return stretchItValue;
				},
				set: function(flag) {
					var acts;
					if (typeof flag != 'boolean') return;
					
					stretchItValue = flag;
					acts = ['input'];

					if (stretchItValue) {
						if (!this.hasAttribute('data-stretch-it')) this.setAttribute('data-stretch-it', 'on');
						acts.forEach(
							function(act) {
								this.addEventListener(act, evtHandler, false);
							}
						, this);
						this.stretchItRefresh();
					} else {
						if (this.hasAttribute('data-stretch-it')) this.removeAttribute('data-stretch-it', 'on');
						acts.forEach(
							function(act) {
								this.removeEventListener(act, evtHandler, false);
							}
						, this);
					}//end if
				}
			}
		};

		//add maxLength
		if (typeof node.maxLength == 'undefined') {
			prop.maxLength = {
				enumerable: true,
				configurable: false,
				get: function() {
					return maxlength;
				},
				set: function(num) {
					maxlength = (typeof num == 'undefined' || parseInt(num, 10) != num) ? 0 : parseInt(num, 10);
					this.setAttribute('maxlength', maxlength);
				}
			};
			node.addEventListener('input',
				function(e) {
					var max;
					if (!this.hasAttribute('maxlength')) return;
					max = this.getAttribute('maxlength');
					if (parseInt(max, 10) != max) return;

					max = parseInt(max, 10);
					if (this.value.length > max) this.value = this.value.substr(0, max);
				}
			, false);
		}//end if
		Object.defineProperties(node, prop);

		//attrChange
		new MutationObserver(
			function(mutations) {
				mutations.forEach(function(mutation) {
					var target, flag;
					if (mutation.type != 'attributes') return;

					target = mutation.target;
					flag = target.hasAttribute('data-stretch-it');
					if (flag) {
						if (!target.stretchIt) target.stretchIt = true;
						else target.stretchItRefresh();
					} else {
						if (target.stretchIt) target.stretchIt = false;
					}//end if
				});
			}
		).observe(node, {attributes:true});

		node.stretchItRefresh();
		node.stretchIt = node.hasAttribute('data-stretch-it');
	};

	e = {};
	e.dummy = document.createElement('textarea');
	e.sets = [];
	for (var i in e.dummy) if (/^id$|^classname$/i.test(i)) e.sets.push(i.toLowerCase());
	idFirst = (e.sets[0] == 'id' || isCSSSupport('-moz-appearance')) ? true : false;

	//childList
	new MutationObserver(
		function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type != 'childList') return;
				[].slice.call(mutation.addedNodes).forEach(
					function(node) {
						if (node.childNodes.length) {
							[].slice.call(node.querySelectorAll('textarea')).forEach(
								function(target) {
									attachedCallback(target);
								}
							);
						} else {
							attachedCallback(node);
						}//end if
					}
				);
			});
		}
	).observe(document.body, {childList:true, subtree:true});

	//init
	createCSSClass('.stretch-it-vanquish', 'width:100%;height:0;display:block;overflow:hidden;');
	vanquish = document.createElement('div');
	vanquish.className = 'stretch-it-vanquish';
	document.body.appendChild(vanquish);

	window.addEventListener('resize',
		function() {
			[].slice.call(document.querySelectorAll('textarea')).forEach(
				function(node) {
					node.stretchItRefresh();
				}
			);
		}
	, false);

	//attach
	[].slice.call(document.querySelectorAll('textarea')).forEach(
		function(node) {
			attachedCallback(node);
		}
	);

	//clear
	for (var i in e) e[i] = null;
	e = null;
})();
/*programed by mei(李維翰), http://www.facebook.com/mei.studio.li*/