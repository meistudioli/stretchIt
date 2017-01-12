var DOMs = {
	tid: '',
	method: 'attach',
	isLoaded: false,
	isFire: false,
	ss: [],
	lAmt: 0,
	loaded: '',
	si: 'pageInit',
	sw: '',
	trim: function(str) {
		return str.replace(/^\s*|\s*$/g,'');
	},
	parseUrl: function(url) {
		var data = {}, others = '';
		data.protocol = /^https/i.test(url) ? 'https:' : 'http:';
		data.host = (/^(https?):\/\/([^\/]*)\/(.*)/.test(url)) ? url.replace(/^(https?):\/\/([^\/]*)\/(.*)/, '$2') : url.replace(/^(https?):\/\/(.*)/, '$2');
		return data;
	},
	sHandle: function(e) {
		var t = e, sets;
		if (typeof arguments[1] == 'undefined') {
			sets = ['error','load'];
			for (var i=-1,l=sets.length;++i<l;) this.removeEventListener(sets[i], DOMs.sHandle, false);
			t = this;
		} else { t.onload = t.onreadystatechange = null; }
		//try {t.parentNode.removeChild(t);} catch(e) {}
		if (DOMs.method == 'add') try {t.parentNode.removeChild(t);} catch(e) {}
		if (DOMs.loaded.indexOf(t.src) != -1) return;
		DOMs.loaded += t.src + '&';
		DOMs.lAmt++;
		if (DOMs.isLoaded && DOMs.lAmt == DOMs.ss.length && !DOMs.isFire) { DOMs.isFire = true; DOMs.init('sHandle'); }
	},
	preReady: function() {
		clearInterval(this.tid);
		this.tid = setInterval(function () {
			try {
				document.body.doScroll('left');
				DOMs.ready();
			} catch(ex) {};
		}, 5);
	},
	ready: function() {
		clearInterval(DOMs.tid);
		if (!performance.timing.domContentLoadedEventStart) performance.timing.domContentLoadedEventStart = new Date().getTime();
		if (DOMs.method == 'add') document.removeEventListener('DOMContentLoaded', arguments.callee, false);
		DOMs.tid = null;
		DOMs.isLoaded = true;
		if (DOMs.lAmt == DOMs.ss.length && !DOMs.isFire) { DOMs.isFire = true; DOMs.init('ready'); }
	},
	swRegister: function() {
		if (!this.sw || !('serviceWorker' in navigator)) return;
		navigator.serviceWorker.register(this.sw).then(
			function(registration) {
			    // Registration was successful
			}
		).catch(
			function(err) {
			    // registration failed :(
			}
		);
	},
	init: function(f) {
		var terminate = false;
		performance.timing.domNJSReady = new Date().getTime();
		//x-frame-options
		// if (document.documentElement.getAttributeNode('x-frame-options') || document.documentElement.hasAttribute('x-frame-options')) {
		if (document.documentElement.getAttributeNode('x-frame-options') || (document.documentElement.hasAttribute && document.documentElement.hasAttribute('x-frame-options'))) {
			if (top != self) {
				var b, v = this.trim(document.documentElement.getAttribute('x-frame-options')).toLowerCase(), uri = this.parseUrl(document.referrer);
				v = this.trim(v.replace(/\s+/g, ' '));
				uri = uri.protocol + '//' + uri.host;
				switch (v) {
					case 'deny':
						terminate = true;
						break;
					case 'sameorigin':
						terminate = uri != window.location.protocol + '//' + window.location.host;
						break;
					default:
						terminate = true;
						if (/^allow-from\s+.*/.test(v)) {
							v = this.trim(v.replace(/^allow-from\s+/, '')).replace(/'self'/g, window.location.protocol + '//' + window.location.host);
							if (v.length) {
								v = v.split(' ');
								for (var i=-1,l=v.length;++i<l;) {
									var p = v[i].replace(/\./g, '\\.');
									p = this.trim(p.replace(/\*/g, '\.\*'));
									if (!p.length) continue;
									p = new RegExp(p);
									if (p.test(uri)) { terminate = false; break; }
								}//end for
							}//end if
						}//end if
				}//end switch
				if (terminate) {
					b = document.body;
					while(b.childNodes.length) b.removeChild(b.firstChild);
				}//end if
			}//end if
			document.documentElement.removeAttribute('x-frame-options');
		}//end if
		if (!terminate)  { try {window[DOMs.si]();} catch(e) {} }
		this.swRegister();
		//clear
		for (var i in DOMs) DOMs[i] = null;
		DOMs = null;
	}
};

(function(){
	//scriptList
	if (typeof navigator.scriptList == 'undefined') navigator.scriptList = [];
	//performance
	if (typeof window.performance == 'undefined') {
		performance = {
			timing: {
				navigationStart: new Date().getTime()
			},
			now: function() { return new Date().getTime(); }
		};
	}//end if
	performance.timing.pageRenderStart = new Date().getTime();
	if (typeof window.addEventListener != 'undefined') {
		DOMs.method = 'add';
		document.addEventListener('DOMContentLoaded', DOMs.ready, false);
	} else DOMs.preReady();
	var sets = ['error','load'], h = document.getElementsByTagName('head')[0], se = document.getElementsByTagName('script')[0], ss = se.getAttribute('data-source'), si = se.getAttribute('data-init'), ts, sw = se.getAttribute('data-sw');
	if (si) DOMs.si = si;
	if (sw) DOMs.sw = sw;
	if (DOMs.method == 'attach') {
		ts = 'article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section,summary,time,mark,main,del,ins'.split(',');
		for (var i=-1,l=ts.length;++i<l;) document.createElement(ts[i]);
	}//end if
	if (!ss) return;
	ss = ss.split('&');
	for (var i=-1,l=ss.length;++i<l;) {
		var p = DOMs.trim(decodeURIComponent(ss[i])), s;
		if (p.length == 0) continue;
		if (navigator.scriptList.indexOf(p) == -1) navigator.scriptList.push(p);
		DOMs.ss.push(p);
		s = document.createElement('script');
		h.appendChild(s);
		if (DOMs.method == 'attach') {
			s.onload = s.onreadystatechange = function() {
				var rs = this.readyState;
				if (rs && (rs === 'loaded' || rs === 'complete')) DOMs.sHandle(this, 1);
			};
		} else for (var j=-1,l2=sets.length;++j<l2;) s.addEventListener(sets[j], DOMs.sHandle, false);
		s.async = true;
		s.src = p;
	}//end for
	se.parentNode.removeChild(se);
})();
/*programed by mei(李維翰), http://www.facebook.com/mei.studio.li*/