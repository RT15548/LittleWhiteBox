(function() {
	var Gt = function(t, e) {
		return Gt = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
			n.__proto__ = r;
		} || function(n, r) {
			for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
		}, Gt(t, e);
	};
	function Qr(t, e) {
		if (typeof e != "function" && e !== null) throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
		Gt(t, e);
		function n() {
			this.constructor = t;
		}
		t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
	}
	var K = function() {
		return K = Object.assign || function(e) {
			for (var n, r = 1, i = arguments.length; r < i; r++) {
				n = arguments[r];
				for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
			}
			return e;
		}, K.apply(this, arguments);
	};
	function mt(t, e, n) {
		if (n || arguments.length === 2) for (var r = 0, i = e.length, o; r < i; r++) (o || !(r in e)) && (o || (o = Array.prototype.slice.call(e, 0, r)), o[r] = e[r]);
		return t.concat(o || Array.prototype.slice.call(e));
	}
	var ee = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : globalThis, Q = Object.keys, U = Array.isArray;
	typeof Promise < "u" && !ee.Promise && (ee.Promise = Promise);
	function re(t, e) {
		return typeof e != "object" || Q(e).forEach(function(n) {
			t[n] = e[n];
		}), t;
	}
	var Ne = Object.getPrototypeOf, Xr = {}.hasOwnProperty;
	function ne(t, e) {
		return Xr.call(t, e);
	}
	function je(t, e) {
		typeof e == "function" && (e = e(Ne(t))), (typeof Reflect > "u" ? Q : Reflect.ownKeys)(e).forEach(function(n) {
			ge(t, n, e[n]);
		});
	}
	var Ln = Object.defineProperty;
	function ge(t, e, n, r) {
		Ln(t, e, re(n && ne(n, "get") && typeof n.get == "function" ? {
			get: n.get,
			set: n.set,
			configurable: !0
		} : {
			value: n,
			configurable: !0,
			writable: !0
		}, r));
	}
	function ze(t) {
		return { from: function(e) {
			return t.prototype = Object.create(e.prototype), ge(t.prototype, "constructor", t), { extend: je.bind(null, t.prototype) };
		} };
	}
	var Jr = Object.getOwnPropertyDescriptor;
	function Wn(t, e) {
		var n = Jr(t, e), r;
		return n || (r = Ne(t)) && Wn(r, e);
	}
	var Zr = [].slice;
	function yt(t, e, n) {
		return Zr.call(t, e, n);
	}
	function Un(t, e) {
		return e(t);
	}
	function nt(t) {
		if (!t) throw new Error("Assertion Failed");
	}
	function qn(t) {
		ee.setImmediate ? setImmediate(t) : setTimeout(t, 0);
	}
	function ei(t, e) {
		return t.reduce(function(n, r, i) {
			var o = e(r, i);
			return o && (n[o[0]] = o[1]), n;
		}, {});
	}
	function de(t, e) {
		if (typeof e == "string" && ne(t, e)) return t[e];
		if (!e) return t;
		if (typeof e != "string") {
			for (var n = [], r = 0, i = e.length; r < i; ++r) {
				var o = de(t, e[r]);
				n.push(o);
			}
			return n;
		}
		var a = e.indexOf(".");
		if (a !== -1) {
			var u = t[e.substr(0, a)];
			return u == null ? void 0 : de(u, e.substr(a + 1));
		}
	}
	function ie(t, e, n) {
		if (!(!t || e === void 0) && !("isFrozen" in Object && Object.isFrozen(t))) if (typeof e != "string" && "length" in e) {
			nt(typeof n != "string" && "length" in n);
			for (var r = 0, i = e.length; r < i; ++r) ie(t, e[r], n[r]);
		} else {
			var o = e.indexOf(".");
			if (o !== -1) {
				var a = e.substr(0, o), u = e.substr(o + 1);
				if (u === "") n === void 0 ? U(t) && !isNaN(parseInt(a)) ? t.splice(a, 1) : delete t[a] : t[a] = n;
				else {
					var s = t[a];
					(!s || !ne(t, a)) && (s = t[a] = {}), ie(s, u, n);
				}
			} else n === void 0 ? U(t) && !isNaN(parseInt(e)) ? t.splice(e, 1) : delete t[e] : t[e] = n;
		}
	}
	function ti(t, e) {
		typeof e == "string" ? ie(t, e, void 0) : "length" in e && [].map.call(e, function(n) {
			ie(t, n, void 0);
		});
	}
	function Gn(t) {
		var e = {};
		for (var n in t) ne(t, n) && (e[n] = t[n]);
		return e;
	}
	var ni = [].concat;
	function Hn(t) {
		return ni.apply([], t);
	}
	var ri = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(Hn([
		8,
		16,
		32,
		64
	].map(function(t) {
		return [
			"Int",
			"Uint",
			"Float"
		].map(function(e) {
			return e + t + "Array";
		});
	}))).filter(function(t) {
		return ee[t];
	}), Yn = new Set(ri.map(function(t) {
		return ee[t];
	}));
	function Qn(t) {
		var e = {};
		for (var n in t) if (ne(t, n)) {
			var r = t[n];
			e[n] = !r || typeof r != "object" || Yn.has(r.constructor) ? r : Qn(r);
		}
		return e;
	}
	function ii(t) {
		for (var e in t) if (ne(t, e)) return !1;
		return !0;
	}
	var rt = null;
	function Me(t) {
		rt = /* @__PURE__ */ new WeakMap();
		var e = Ht(t);
		return rt = null, e;
	}
	function Ht(t) {
		if (!t || typeof t != "object") return t;
		var e = rt.get(t);
		if (e) return e;
		if (U(t)) {
			e = [], rt.set(t, e);
			for (var n = 0, r = t.length; n < r; ++n) e.push(Ht(t[n]));
		} else if (Yn.has(t.constructor)) e = t;
		else {
			var i = Ne(t);
			e = i === Object.prototype ? {} : Object.create(i), rt.set(t, e);
			for (var o in t) ne(t, o) && (e[o] = Ht(t[o]));
		}
		return e;
	}
	var oi = {}.toString;
	function Yt(t) {
		return oi.call(t).slice(8, -1);
	}
	var Qt = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", ai = typeof Qt == "symbol" ? function(t) {
		var e;
		return t != null && (e = t[Qt]) && e.apply(t);
	} : function() {
		return null;
	};
	function Te(t, e) {
		var n = t.indexOf(e);
		return n >= 0 && t.splice(n, 1), n >= 0;
	}
	var Le = {};
	function pe(t) {
		var e, n, r, i;
		if (arguments.length === 1) {
			if (U(t)) return t.slice();
			if (this === Le && typeof t == "string") return [t];
			if (i = ai(t)) {
				for (n = []; r = i.next(), !r.done;) n.push(r.value);
				return n;
			}
			if (t == null) return [t];
			if (e = t.length, typeof e == "number") {
				for (n = new Array(e); e--;) n[e] = t[e];
				return n;
			}
			return [t];
		}
		for (e = arguments.length, n = new Array(e); e--;) n[e] = arguments[e];
		return n;
	}
	var Xt = typeof Symbol < "u" ? function(t) {
		return t[Symbol.toStringTag] === "AsyncFunction";
	} : function() {
		return !1;
	}, si = [
		"Modify",
		"Bulk",
		"OpenFailed",
		"VersionChange",
		"Schema",
		"Upgrade",
		"InvalidTable",
		"MissingAPI",
		"NoSuchDatabase",
		"InvalidArgument",
		"SubTransaction",
		"Unsupported",
		"Internal",
		"DatabaseClosed",
		"PrematureCommit",
		"ForeignAwait"
	], Xn = [
		"Unknown",
		"Constraint",
		"Data",
		"TransactionInactive",
		"ReadOnly",
		"Version",
		"NotFound",
		"InvalidState",
		"InvalidAccess",
		"Abort",
		"Timeout",
		"QuotaExceeded",
		"Syntax",
		"DataClone"
	], Jt = si.concat(Xn), ui = {
		VersionChanged: "Database version changed by other database connection",
		DatabaseClosed: "Database has been closed",
		Abort: "Transaction aborted",
		TransactionInactive: "Transaction has already completed or failed",
		MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
	};
	function We(t, e) {
		this.name = t, this.message = e;
	}
	ze(We).from(Error).extend({ toString: function() {
		return this.name + ": " + this.message;
	} });
	function Jn(t, e) {
		return t + ". Errors: " + Object.keys(e).map(function(n) {
			return e[n].toString();
		}).filter(function(n, r, i) {
			return i.indexOf(n) === r;
		}).join(`
`);
	}
	function gt(t, e, n, r) {
		this.failures = e, this.failedKeys = r, this.successCount = n, this.message = Jn(t, e);
	}
	ze(gt).from(We);
	function Ue(t, e) {
		this.name = "BulkError", this.failures = Object.keys(e).map(function(n) {
			return e[n];
		}), this.failuresByPos = e, this.message = Jn(t, this.failures);
	}
	ze(Ue).from(We);
	var Zt = Jt.reduce(function(t, e) {
		return t[e] = e + "Error", t;
	}, {}), ci = We, O = Jt.reduce(function(t, e) {
		var n = e + "Error";
		function r(i, o) {
			this.name = n, i ? typeof i == "string" ? (this.message = "".concat(i).concat(o ? `
 ` + o : ""), this.inner = o || null) : typeof i == "object" && (this.message = "".concat(i.name, " ").concat(i.message), this.inner = i) : (this.message = ui[e] || n, this.inner = null);
		}
		return ze(r).from(ci), t[e] = r, t;
	}, {});
	O.Syntax = SyntaxError, O.Type = TypeError, O.Range = RangeError;
	var Zn = Xn.reduce(function(t, e) {
		return t[e + "Error"] = O[e], t;
	}, {});
	function li(t, e) {
		if (!t || t instanceof We || t instanceof TypeError || t instanceof SyntaxError || !t.name || !Zn[t.name]) return t;
		var n = new Zn[t.name](e || t.message, t);
		return "stack" in t && ge(n, "stack", { get: function() {
			return this.inner.stack;
		} }), n;
	}
	var wt = Jt.reduce(function(t, e) {
		return [
			"Syntax",
			"Type",
			"Range"
		].indexOf(e) === -1 && (t[e + "Error"] = O[e]), t;
	}, {});
	wt.ModifyError = gt, wt.DexieError = We, wt.BulkError = Ue;
	function N() {}
	function it(t) {
		return t;
	}
	function fi(t, e) {
		return t == null || t === it ? e : function(n) {
			return e(t(n));
		};
	}
	function Ce(t, e) {
		return function() {
			t.apply(this, arguments), e.apply(this, arguments);
		};
	}
	function hi(t, e) {
		return t === N ? e : function() {
			var n = t.apply(this, arguments);
			n !== void 0 && (arguments[0] = n);
			var r = this.onsuccess, i = this.onerror;
			this.onsuccess = null, this.onerror = null;
			var o = e.apply(this, arguments);
			return r && (this.onsuccess = this.onsuccess ? Ce(r, this.onsuccess) : r), i && (this.onerror = this.onerror ? Ce(i, this.onerror) : i), o !== void 0 ? o : n;
		};
	}
	function di(t, e) {
		return t === N ? e : function() {
			t.apply(this, arguments);
			var n = this.onsuccess, r = this.onerror;
			this.onsuccess = this.onerror = null, e.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? Ce(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? Ce(r, this.onerror) : r);
		};
	}
	function pi(t, e) {
		return t === N ? e : function(n) {
			var r = t.apply(this, arguments);
			re(n, r);
			var i = this.onsuccess, o = this.onerror;
			this.onsuccess = null, this.onerror = null;
			var a = e.apply(this, arguments);
			return i && (this.onsuccess = this.onsuccess ? Ce(i, this.onsuccess) : i), o && (this.onerror = this.onerror ? Ce(o, this.onerror) : o), r === void 0 ? a === void 0 ? void 0 : a : re(r, a);
		};
	}
	function vi(t, e) {
		return t === N ? e : function() {
			return e.apply(this, arguments) === !1 ? !1 : t.apply(this, arguments);
		};
	}
	function en(t, e) {
		return t === N ? e : function() {
			var n = t.apply(this, arguments);
			if (n && typeof n.then == "function") {
				for (var r = this, i = arguments.length, o = new Array(i); i--;) o[i] = arguments[i];
				return n.then(function() {
					return e.apply(r, o);
				});
			}
			return e.apply(this, arguments);
		};
	}
	var le = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
	function er(t, e) {
		le = t;
	}
	var ot = {}, tr = 100, tn = typeof Promise > "u" ? [] : (function() {
		var t = Promise.resolve();
		if (typeof crypto > "u" || !crypto.subtle) return [
			t,
			Ne(t),
			t
		];
		var e = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
		return [
			e,
			Ne(e),
			t
		];
	})(), nr = tn[0], rr = tn[1], mi = tn[2], yi = rr && rr.then, Pe = nr && nr.constructor, nn = !!mi;
	function gi() {
		queueMicrotask(bi);
	}
	var at = function(t, e) {
		st.push([t, e]), bt && (gi(), bt = !1);
	}, rn = !0, bt = !0, Re = [], _t = [], on = it, we = {
		id: "global",
		global: !0,
		ref: 0,
		unhandleds: [],
		onunhandled: N,
		pgp: !1,
		env: {},
		finalize: N
	}, R = we, st = [], Oe = 0, St = [];
	function E(t) {
		if (typeof this != "object") throw new TypeError("Promises must be constructed via new");
		this._listeners = [], this._lib = !1;
		var e = this._PSD = R;
		if (typeof t != "function") {
			if (t !== ot) throw new TypeError("Not a function");
			this._state = arguments[1], this._value = arguments[2], this._state === !1 && sn(this, this._value);
			return;
		}
		this._state = null, this._value = null, ++e.ref, or(this, t);
	}
	var an = {
		get: function() {
			var t = R, e = Et;
			function n(r, i) {
				var o = this, a = !t.global && (t !== R || e !== Et), u = a && !_e(), s = new E(function(c, h) {
					un(o, new ir(ur(r, t, a, u), ur(i, t, a, u), c, h, t));
				});
				return this._consoleTask && (s._consoleTask = this._consoleTask), s;
			}
			return n.prototype = ot, n;
		},
		set: function(t) {
			ge(this, "then", t && t.prototype === ot ? an : {
				get: function() {
					return t;
				},
				set: an.set
			});
		}
	};
	je(E.prototype, {
		then: an,
		_then: function(t, e) {
			un(this, new ir(null, null, t, e, R));
		},
		catch: function(t) {
			if (arguments.length === 1) return this.then(null, t);
			var e = arguments[0], n = arguments[1];
			return typeof e == "function" ? this.then(null, function(r) {
				return r instanceof e ? n(r) : It(r);
			}) : this.then(null, function(r) {
				return r && r.name === e ? n(r) : It(r);
			});
		},
		finally: function(t) {
			return this.then(function(e) {
				return E.resolve(t()).then(function() {
					return e;
				});
			}, function(e) {
				return E.resolve(t()).then(function() {
					return It(e);
				});
			});
		},
		timeout: function(t, e) {
			var n = this;
			return t < Infinity ? new E(function(r, i) {
				var o = setTimeout(function() {
					return i(new O.Timeout(e));
				}, t);
				n.then(r, i).finally(clearTimeout.bind(null, o));
			}) : this;
		}
	}), typeof Symbol < "u" && Symbol.toStringTag && ge(E.prototype, Symbol.toStringTag, "Dexie.Promise"), we.env = sr();
	function ir(t, e, n, r, i) {
		this.onFulfilled = typeof t == "function" ? t : null, this.onRejected = typeof e == "function" ? e : null, this.resolve = n, this.reject = r, this.psd = i;
	}
	je(E, {
		all: function() {
			var t = pe.apply(null, arguments).map(At);
			return new E(function(e, n) {
				t.length === 0 && e([]);
				var r = t.length;
				t.forEach(function(i, o) {
					return E.resolve(i).then(function(a) {
						t[o] = a, --r || e(t);
					}, n);
				});
			});
		},
		resolve: function(t) {
			return t instanceof E ? t : t && typeof t.then == "function" ? new E(function(e, n) {
				t.then(e, n);
			}) : new E(ot, !0, t);
		},
		reject: It,
		race: function() {
			var t = pe.apply(null, arguments).map(At);
			return new E(function(e, n) {
				t.map(function(r) {
					return E.resolve(r).then(e, n);
				});
			});
		},
		PSD: {
			get: function() {
				return R;
			},
			set: function(t) {
				return R = t;
			}
		},
		totalEchoes: { get: function() {
			return Et;
		} },
		newPSD: be,
		usePSD: Fe,
		scheduler: {
			get: function() {
				return at;
			},
			set: function(t) {
				at = t;
			}
		},
		rejectionMapper: {
			get: function() {
				return on;
			},
			set: function(t) {
				on = t;
			}
		},
		follow: function(t, e) {
			return new E(function(n, r) {
				return be(function(i, o) {
					var a = R;
					a.unhandleds = [], a.onunhandled = o, a.finalize = Ce(function() {
						var u = this;
						_i(function() {
							u.unhandleds.length === 0 ? i() : o(u.unhandleds[0]);
						});
					}, a.finalize), t();
				}, e, n, r);
			});
		}
	}), Pe && (Pe.allSettled && ge(E, "allSettled", function() {
		var t = pe.apply(null, arguments).map(At);
		return new E(function(e) {
			t.length === 0 && e([]);
			var n = t.length, r = new Array(n);
			t.forEach(function(i, o) {
				return E.resolve(i).then(function(a) {
					return r[o] = {
						status: "fulfilled",
						value: a
					};
				}, function(a) {
					return r[o] = {
						status: "rejected",
						reason: a
					};
				}).then(function() {
					return --n || e(r);
				});
			});
		});
	}), Pe.any && typeof AggregateError < "u" && ge(E, "any", function() {
		var t = pe.apply(null, arguments).map(At);
		return new E(function(e, n) {
			t.length === 0 && n(/* @__PURE__ */ new AggregateError([]));
			var r = t.length, i = new Array(r);
			t.forEach(function(o, a) {
				return E.resolve(o).then(function(u) {
					return e(u);
				}, function(u) {
					i[a] = u, --r || n(new AggregateError(i));
				});
			});
		});
	}), Pe.withResolvers && (E.withResolvers = Pe.withResolvers));
	function or(t, e) {
		try {
			e(function(n) {
				if (t._state === null) {
					if (n === t) throw new TypeError("A promise cannot be resolved with itself.");
					var r = t._lib && qe();
					n && typeof n.then == "function" ? or(t, function(i, o) {
						n instanceof E ? n._then(i, o) : n.then(i, o);
					}) : (t._state = !0, t._value = n, ar(t)), r && Ge();
				}
			}, sn.bind(null, t));
		} catch (n) {
			sn(t, n);
		}
	}
	function sn(t, e) {
		if (_t.push(e), t._state === null) {
			var n = t._lib && qe();
			e = on(e), t._state = !1, t._value = e, Si(t), ar(t), n && Ge();
		}
	}
	function ar(t) {
		var e = t._listeners;
		t._listeners = [];
		for (var n = 0, r = e.length; n < r; ++n) un(t, e[n]);
		var i = t._PSD;
		--i.ref || i.finalize(), Oe === 0 && (++Oe, at(function() {
			--Oe === 0 && cn();
		}, []));
	}
	function un(t, e) {
		if (t._state === null) {
			t._listeners.push(e);
			return;
		}
		var n = t._state ? e.onFulfilled : e.onRejected;
		if (n === null) return (t._state ? e.resolve : e.reject)(t._value);
		++e.psd.ref, ++Oe, at(wi, [
			n,
			t,
			e
		]);
	}
	function wi(t, e, n) {
		try {
			var r, i = e._value;
			!e._state && _t.length && (_t = []), r = le && e._consoleTask ? e._consoleTask.run(function() {
				return t(i);
			}) : t(i), !e._state && _t.indexOf(i) === -1 && Ii(e), n.resolve(r);
		} catch (o) {
			n.reject(o);
		} finally {
			--Oe === 0 && cn(), --n.psd.ref || n.psd.finalize();
		}
	}
	function bi() {
		Fe(we, function() {
			qe() && Ge();
		});
	}
	function qe() {
		var t = rn;
		return rn = !1, bt = !1, t;
	}
	function Ge() {
		var t, e, n;
		do
			for (; st.length > 0;) for (t = st, st = [], n = t.length, e = 0; e < n; ++e) {
				var r = t[e];
				r[0].apply(null, r[1]);
			}
		while (st.length > 0);
		rn = !0, bt = !0;
	}
	function cn() {
		var t = Re;
		Re = [], t.forEach(function(r) {
			r._PSD.onunhandled.call(null, r._value, r);
		});
		for (var e = St.slice(0), n = e.length; n;) e[--n]();
	}
	function _i(t) {
		function e() {
			t(), St.splice(St.indexOf(e), 1);
		}
		St.push(e), ++Oe, at(function() {
			--Oe === 0 && cn();
		}, []);
	}
	function Si(t) {
		Re.some(function(e) {
			return e._value === t._value;
		}) || Re.push(t);
	}
	function Ii(t) {
		for (var e = Re.length; e;) if (Re[--e]._value === t._value) {
			Re.splice(e, 1);
			return;
		}
	}
	function It(t) {
		return new E(ot, !1, t);
	}
	function L(t, e) {
		var n = R;
		return function() {
			var r = qe(), i = R;
			try {
				return Se(n, !0), t.apply(this, arguments);
			} catch (o) {
				e && e(o);
			} finally {
				Se(i, !1), r && Ge();
			}
		};
	}
	var X = {
		awaits: 0,
		echoes: 0,
		id: 0
	}, ki = 0, kt = [], xt = 0, Et = 0, xi = 0;
	function be(t, e, n, r) {
		var i = R, o = Object.create(i);
		o.parent = i, o.ref = 0, o.global = !1, o.id = ++xi, we.env, o.env = nn ? {
			Promise: E,
			PromiseProp: {
				value: E,
				configurable: !0,
				writable: !0
			},
			all: E.all,
			race: E.race,
			allSettled: E.allSettled,
			any: E.any,
			resolve: E.resolve,
			reject: E.reject
		} : {}, e && re(o, e), ++i.ref, o.finalize = function() {
			--this.parent.ref || this.parent.finalize();
		};
		var a = Fe(o, t, n, r);
		return o.ref === 0 && o.finalize(), a;
	}
	function He() {
		return X.id || (X.id = ++ki), ++X.awaits, X.echoes += tr, X.id;
	}
	function _e() {
		return X.awaits ? (--X.awaits === 0 && (X.id = 0), X.echoes = X.awaits * tr, !0) : !1;
	}
	("" + yi).indexOf("[native code]") === -1 && (He = _e = N);
	function At(t) {
		return X.echoes && t && t.constructor === Pe ? (He(), t.then(function(e) {
			return _e(), e;
		}, function(e) {
			return _e(), q(e);
		})) : t;
	}
	function Ei(t) {
		++Et, (!X.echoes || --X.echoes === 0) && (X.echoes = X.awaits = X.id = 0), kt.push(R), Se(t, !0);
	}
	function Ai() {
		var t = kt[kt.length - 1];
		kt.pop(), Se(t, !1);
	}
	function Se(t, e) {
		var n = R;
		if ((e ? X.echoes && (!xt++ || t !== R) : xt && (!--xt || t !== R)) && queueMicrotask(e ? Ei.bind(null, t) : Ai), t !== R && (R = t, n === we && (we.env = sr()), nn)) {
			var r = we.env.Promise, i = t.env;
			(n.global || t.global) && (Object.defineProperty(ee, "Promise", i.PromiseProp), r.all = i.all, r.race = i.race, r.resolve = i.resolve, r.reject = i.reject, i.allSettled && (r.allSettled = i.allSettled), i.any && (r.any = i.any));
		}
	}
	function sr() {
		var t = ee.Promise;
		return nn ? {
			Promise: t,
			PromiseProp: Object.getOwnPropertyDescriptor(ee, "Promise"),
			all: t.all,
			race: t.race,
			allSettled: t.allSettled,
			any: t.any,
			resolve: t.resolve,
			reject: t.reject
		} : {};
	}
	function Fe(t, e, n, r, i) {
		var o = R;
		try {
			return Se(t, !0), e(n, r, i);
		} finally {
			Se(o, !1);
		}
	}
	function ur(t, e, n, r) {
		return typeof t != "function" ? t : function() {
			var i = R;
			n && He(), Se(e, !0);
			try {
				return t.apply(this, arguments);
			} finally {
				Se(i, !1), r && queueMicrotask(_e);
			}
		};
	}
	function ln(t) {
		Promise === Pe && X.echoes === 0 ? xt === 0 ? t() : enqueueNativeMicroTask(t) : setTimeout(t, 0);
	}
	var q = E.reject;
	function fn(t, e, n, r) {
		if (!t.idbdb || !t._state.openComplete && !R.letThrough && !t._vip) {
			if (t._state.openComplete) return q(new O.DatabaseClosed(t._state.dbOpenError));
			if (!t._state.isBeingOpened) {
				if (!t._state.autoOpen) return q(new O.DatabaseClosed());
				t.open().catch(N);
			}
			return t._state.dbReadyPromise.then(function() {
				return fn(t, e, n, r);
			});
		} else {
			var i = t._createTransaction(e, n, t._dbSchema);
			try {
				i.create(), t._state.PR1398_maxLoop = 3;
			} catch (o) {
				return o.name === Zt.InvalidState && t.isOpen() && --t._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), t.close({ disableAutoOpen: !1 }), t.open().then(function() {
					return fn(t, e, n, r);
				})) : q(o);
			}
			return i._promise(e, function(o, a) {
				return be(function() {
					return R.trans = i, r(o, a, i);
				});
			}).then(function(o) {
				if (e === "readwrite") try {
					i.idbtrans.commit();
				} catch {}
				return e === "readonly" ? o : i._completion.then(function() {
					return o;
				});
			});
		}
	}
	var cr = "4.0.10", Ke = "￿", hn = -Infinity, ve = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", lr = "String expected.", Ye = [], Mt = "__dbnames", dn = "readonly", pn = "readwrite";
	function De(t, e) {
		return t ? e ? function() {
			return t.apply(this, arguments) && e.apply(this, arguments);
		} : t : e;
	}
	var fr = {
		type: 3,
		lower: -Infinity,
		lowerOpen: !1,
		upper: [[]],
		upperOpen: !1
	};
	function Tt(t) {
		return typeof t == "string" && !/\./.test(t) ? function(e) {
			return e[t] === void 0 && t in e && (e = Me(e), delete e[t]), e;
		} : function(e) {
			return e;
		};
	}
	function Mi() {
		throw O.Type();
	}
	function B(t, e) {
		try {
			var n = hr(t), r = hr(e);
			if (n !== r) return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r !== "Date" ? NaN : -1;
			switch (n) {
				case "number":
				case "Date":
				case "string": return t > e ? 1 : t < e ? -1 : 0;
				case "binary": return Ci(dr(t), dr(e));
				case "Array": return Ti(t, e);
			}
		} catch {}
		return NaN;
	}
	function Ti(t, e) {
		for (var n = t.length, r = e.length, i = n < r ? n : r, o = 0; o < i; ++o) {
			var a = B(t[o], e[o]);
			if (a !== 0) return a;
		}
		return n === r ? 0 : n < r ? -1 : 1;
	}
	function Ci(t, e) {
		for (var n = t.length, r = e.length, i = n < r ? n : r, o = 0; o < i; ++o) if (t[o] !== e[o]) return t[o] < e[o] ? -1 : 1;
		return n === r ? 0 : n < r ? -1 : 1;
	}
	function hr(t) {
		var e = typeof t;
		if (e !== "object") return e;
		if (ArrayBuffer.isView(t)) return "binary";
		var n = Yt(t);
		return n === "ArrayBuffer" ? "binary" : n;
	}
	function dr(t) {
		return t instanceof Uint8Array ? t : ArrayBuffer.isView(t) ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : new Uint8Array(t);
	}
	var pr = (function() {
		function t() {}
		return t.prototype._trans = function(e, n, r) {
			var i = this._tx || R.trans, o = this.name, a = le && typeof console < "u" && console.createTask && console.createTask("Dexie: ".concat(e === "readonly" ? "read" : "write", " ").concat(this.name));
			function u(h, l, p) {
				if (!p.schema[o]) throw new O.NotFound("Table " + o + " not part of transaction");
				return n(p.idbtrans, p);
			}
			var s = qe();
			try {
				var c = i && i.db._novip === this.db._novip ? i === R.trans ? i._promise(e, u, r) : be(function() {
					return i._promise(e, u, r);
				}, {
					trans: i,
					transless: R.transless || R
				}) : fn(this.db, e, [this.name], u);
				return a && (c._consoleTask = a, c = c.catch(function(h) {
					return console.trace(h), q(h);
				})), c;
			} finally {
				s && Ge();
			}
		}, t.prototype.get = function(e, n) {
			var r = this;
			return e && e.constructor === Object ? this.where(e).first(n) : e == null ? q(new O.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(i) {
				return r.core.get({
					trans: i,
					key: e
				}).then(function(o) {
					return r.hook.reading.fire(o);
				});
			}).then(n);
		}, t.prototype.where = function(e) {
			if (typeof e == "string") return new this.db.WhereClause(this, e);
			if (U(e)) return new this.db.WhereClause(this, "[".concat(e.join("+"), "]"));
			var n = Q(e);
			if (n.length === 1) return this.where(n[0]).equals(e[n[0]]);
			var r = this.schema.indexes.concat(this.schema.primKey).filter(function(h) {
				if (h.compound && n.every(function(p) {
					return h.keyPath.indexOf(p) >= 0;
				})) {
					for (var l = 0; l < n.length; ++l) if (n.indexOf(h.keyPath[l]) === -1) return !1;
					return !0;
				}
				return !1;
			}).sort(function(h, l) {
				return h.keyPath.length - l.keyPath.length;
			})[0];
			if (r && this.db._maxKey !== Ke) {
				var i = r.keyPath.slice(0, n.length);
				return this.where(i).equals(i.map(function(h) {
					return e[h];
				}));
			}
			!r && le && console.warn("The query ".concat(JSON.stringify(e), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(n.join("+"), "]"));
			var o = this.schema.idxByName;
			function a(h, l) {
				return B(h, l) === 0;
			}
			var u = n.reduce(function(h, l) {
				var p = h[0], y = h[1], f = o[l], v = e[l];
				return [p || f, p || !f ? De(y, f && f.multi ? function(m) {
					var w = de(m, l);
					return U(w) && w.some(function(d) {
						return a(v, d);
					});
				} : function(m) {
					return a(v, de(m, l));
				}) : y];
			}, [null, null]), s = u[0], c = u[1];
			return s ? this.where(s.name).equals(e[s.keyPath]).filter(c) : r ? this.filter(c) : this.where(n).equals("");
		}, t.prototype.filter = function(e) {
			return this.toCollection().and(e);
		}, t.prototype.count = function(e) {
			return this.toCollection().count(e);
		}, t.prototype.offset = function(e) {
			return this.toCollection().offset(e);
		}, t.prototype.limit = function(e) {
			return this.toCollection().limit(e);
		}, t.prototype.each = function(e) {
			return this.toCollection().each(e);
		}, t.prototype.toArray = function(e) {
			return this.toCollection().toArray(e);
		}, t.prototype.toCollection = function() {
			return new this.db.Collection(new this.db.WhereClause(this));
		}, t.prototype.orderBy = function(e) {
			return new this.db.Collection(new this.db.WhereClause(this, U(e) ? "[".concat(e.join("+"), "]") : e));
		}, t.prototype.reverse = function() {
			return this.toCollection().reverse();
		}, t.prototype.mapToClass = function(e) {
			var n = this, r = n.db, i = n.name;
			this.schema.mappedClass = e, e.prototype instanceof Mi && (e = (function(s) {
				Qr(c, s);
				function c() {
					return s !== null && s.apply(this, arguments) || this;
				}
				return Object.defineProperty(c.prototype, "db", {
					get: function() {
						return r;
					},
					enumerable: !1,
					configurable: !0
				}), c.prototype.table = function() {
					return i;
				}, c;
			})(e));
			for (var o = /* @__PURE__ */ new Set(), a = e.prototype; a; a = Ne(a)) Object.getOwnPropertyNames(a).forEach(function(s) {
				return o.add(s);
			});
			var u = function(s) {
				if (!s) return s;
				var c = Object.create(e.prototype);
				for (var h in s) if (!o.has(h)) try {
					c[h] = s[h];
				} catch {}
				return c;
			};
			return this.schema.readHook && this.hook.reading.unsubscribe(this.schema.readHook), this.schema.readHook = u, this.hook("reading", u), e;
		}, t.prototype.defineClass = function() {
			function e(n) {
				re(this, n);
			}
			return this.mapToClass(e);
		}, t.prototype.add = function(e, n) {
			var r = this, i = this.schema.primKey, o = i.auto, a = i.keyPath, u = e;
			return a && o && (u = Tt(a)(e)), this._trans("readwrite", function(s) {
				return r.core.mutate({
					trans: s,
					type: "add",
					keys: n != null ? [n] : null,
					values: [u]
				});
			}).then(function(s) {
				return s.numFailures ? E.reject(s.failures[0]) : s.lastResult;
			}).then(function(s) {
				if (a) try {
					ie(e, a, s);
				} catch {}
				return s;
			});
		}, t.prototype.update = function(e, n) {
			if (typeof e == "object" && !U(e)) {
				var r = de(e, this.schema.primKey.keyPath);
				return r === void 0 ? q(new O.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(r).modify(n);
			} else return this.where(":id").equals(e).modify(n);
		}, t.prototype.put = function(e, n) {
			var r = this, i = this.schema.primKey, o = i.auto, a = i.keyPath, u = e;
			return a && o && (u = Tt(a)(e)), this._trans("readwrite", function(s) {
				return r.core.mutate({
					trans: s,
					type: "put",
					values: [u],
					keys: n != null ? [n] : null
				});
			}).then(function(s) {
				return s.numFailures ? E.reject(s.failures[0]) : s.lastResult;
			}).then(function(s) {
				if (a) try {
					ie(e, a, s);
				} catch {}
				return s;
			});
		}, t.prototype.delete = function(e) {
			var n = this;
			return this._trans("readwrite", function(r) {
				return n.core.mutate({
					trans: r,
					type: "delete",
					keys: [e]
				});
			}).then(function(r) {
				return r.numFailures ? E.reject(r.failures[0]) : void 0;
			});
		}, t.prototype.clear = function() {
			var e = this;
			return this._trans("readwrite", function(n) {
				return e.core.mutate({
					trans: n,
					type: "deleteRange",
					range: fr
				});
			}).then(function(n) {
				return n.numFailures ? E.reject(n.failures[0]) : void 0;
			});
		}, t.prototype.bulkGet = function(e) {
			var n = this;
			return this._trans("readonly", function(r) {
				return n.core.getMany({
					keys: e,
					trans: r
				}).then(function(i) {
					return i.map(function(o) {
						return n.hook.reading.fire(o);
					});
				});
			});
		}, t.prototype.bulkAdd = function(e, n, r) {
			var i = this, o = Array.isArray(n) ? n : void 0;
			r = r || (o ? void 0 : n);
			var a = r ? r.allKeys : void 0;
			return this._trans("readwrite", function(u) {
				var s = i.schema.primKey, c = s.auto, h = s.keyPath;
				if (h && o) throw new O.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
				if (o && o.length !== e.length) throw new O.InvalidArgument("Arguments objects and keys must have the same length");
				var l = e.length, p = h && c ? e.map(Tt(h)) : e;
				return i.core.mutate({
					trans: u,
					type: "add",
					keys: o,
					values: p,
					wantResults: a
				}).then(function(y) {
					var f = y.numFailures, v = y.results, m = y.lastResult, w = y.failures, d = a ? v : m;
					if (f === 0) return d;
					throw new Ue("".concat(i.name, ".bulkAdd(): ").concat(f, " of ").concat(l, " operations failed"), w);
				});
			});
		}, t.prototype.bulkPut = function(e, n, r) {
			var i = this, o = Array.isArray(n) ? n : void 0;
			r = r || (o ? void 0 : n);
			var a = r ? r.allKeys : void 0;
			return this._trans("readwrite", function(u) {
				var s = i.schema.primKey, c = s.auto, h = s.keyPath;
				if (h && o) throw new O.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
				if (o && o.length !== e.length) throw new O.InvalidArgument("Arguments objects and keys must have the same length");
				var l = e.length, p = h && c ? e.map(Tt(h)) : e;
				return i.core.mutate({
					trans: u,
					type: "put",
					keys: o,
					values: p,
					wantResults: a
				}).then(function(y) {
					var f = y.numFailures, v = y.results, m = y.lastResult, w = y.failures, d = a ? v : m;
					if (f === 0) return d;
					throw new Ue("".concat(i.name, ".bulkPut(): ").concat(f, " of ").concat(l, " operations failed"), w);
				});
			});
		}, t.prototype.bulkUpdate = function(e) {
			var n = this, r = this.core, i = e.map(function(u) {
				return u.key;
			}), o = e.map(function(u) {
				return u.changes;
			}), a = [];
			return this._trans("readwrite", function(u) {
				return r.getMany({
					trans: u,
					keys: i,
					cache: "clone"
				}).then(function(s) {
					var c = [], h = [];
					e.forEach(function(p, y) {
						var f = p.key, v = p.changes, m = s[y];
						if (m) {
							for (var w = 0, d = Object.keys(v); w < d.length; w++) {
								var g = d[w], b = v[g];
								if (g === n.schema.primKey.keyPath) {
									if (B(b, f) !== 0) throw new O.Constraint("Cannot update primary key in bulkUpdate()");
								} else ie(m, g, b);
							}
							a.push(y), c.push(f), h.push(m);
						}
					});
					var l = c.length;
					return r.mutate({
						trans: u,
						type: "put",
						keys: c,
						values: h,
						updates: {
							keys: i,
							changeSpecs: o
						}
					}).then(function(p) {
						var y = p.numFailures, f = p.failures;
						if (y === 0) return l;
						for (var v = 0, m = Object.keys(f); v < m.length; v++) {
							var w = m[v], d = a[Number(w)];
							if (d != null) {
								var g = f[w];
								delete f[w], f[d] = g;
							}
						}
						throw new Ue("".concat(n.name, ".bulkUpdate(): ").concat(y, " of ").concat(l, " operations failed"), f);
					});
				});
			});
		}, t.prototype.bulkDelete = function(e) {
			var n = this, r = e.length;
			return this._trans("readwrite", function(i) {
				return n.core.mutate({
					trans: i,
					type: "delete",
					keys: e
				});
			}).then(function(i) {
				var o = i.numFailures, a = i.lastResult, u = i.failures;
				if (o === 0) return a;
				throw new Ue("".concat(n.name, ".bulkDelete(): ").concat(o, " of ").concat(r, " operations failed"), u);
			});
		}, t;
	})();
	function ut(t) {
		var e = {}, n = function(u, s) {
			if (s) {
				for (var c = arguments.length, h = new Array(c - 1); --c;) h[c - 1] = arguments[c];
				return e[u].subscribe.apply(null, h), t;
			} else if (typeof u == "string") return e[u];
		};
		n.addEventType = o;
		for (var r = 1, i = arguments.length; r < i; ++r) o(arguments[r]);
		return n;
		function o(u, s, c) {
			if (typeof u == "object") return a(u);
			s || (s = vi), c || (c = N);
			var h = {
				subscribers: [],
				fire: c,
				subscribe: function(l) {
					h.subscribers.indexOf(l) === -1 && (h.subscribers.push(l), h.fire = s(h.fire, l));
				},
				unsubscribe: function(l) {
					h.subscribers = h.subscribers.filter(function(p) {
						return p !== l;
					}), h.fire = h.subscribers.reduce(s, c);
				}
			};
			return e[u] = n[u] = h, h;
		}
		function a(u) {
			Q(u).forEach(function(s) {
				var c = u[s];
				if (U(c)) o(s, u[s][0], u[s][1]);
				else if (c === "asap") var h = o(s, it, function() {
					for (var p = arguments.length, y = new Array(p); p--;) y[p] = arguments[p];
					h.subscribers.forEach(function(f) {
						qn(function() {
							f.apply(null, y);
						});
					});
				});
				else throw new O.InvalidArgument("Invalid event config");
			});
		}
	}
	function ct(t, e) {
		return ze(e).from({ prototype: t }), e;
	}
	function Pi(t) {
		return ct(pr.prototype, function(n, r, i) {
			this.db = t, this._tx = i, this.name = n, this.schema = r, this.hook = t._allTables[n] ? t._allTables[n].hook : ut(null, {
				creating: [hi, N],
				reading: [fi, it],
				updating: [pi, N],
				deleting: [di, N]
			});
		});
	}
	function Qe(t, e) {
		return !(t.filter || t.algorithm || t.or) && (e ? t.justLimit : !t.replayFilter);
	}
	function vn(t, e) {
		t.filter = De(t.filter, e);
	}
	function mn(t, e, n) {
		var r = t.replayFilter;
		t.replayFilter = r ? function() {
			return De(r(), e());
		} : e, t.justLimit = n && !r;
	}
	function Ri(t, e) {
		t.isMatch = De(t.isMatch, e);
	}
	function Ct(t, e) {
		if (t.isPrimKey) return e.primaryKey;
		var n = e.getIndexByKeyPath(t.index);
		if (!n) throw new O.Schema("KeyPath " + t.index + " on object store " + e.name + " is not indexed");
		return n;
	}
	function vr(t, e, n) {
		var r = Ct(t, e.schema);
		return e.openCursor({
			trans: n,
			values: !t.keysOnly,
			reverse: t.dir === "prev",
			unique: !!t.unique,
			query: {
				index: r,
				range: t.range
			}
		});
	}
	function Pt(t, e, n, r) {
		var i = t.replayFilter ? De(t.filter, t.replayFilter()) : t.filter;
		if (t.or) {
			var o = {}, a = function(u, s, c) {
				if (!i || i(s, c, function(p) {
					return s.stop(p);
				}, function(p) {
					return s.fail(p);
				})) {
					var h = s.primaryKey, l = "" + h;
					l === "[object ArrayBuffer]" && (l = "" + new Uint8Array(h)), ne(o, l) || (o[l] = !0, e(u, s, c));
				}
			};
			return Promise.all([t.or._iterate(a, n), mr(vr(t, r, n), t.algorithm, a, !t.keysOnly && t.valueMapper)]);
		} else return mr(vr(t, r, n), De(t.algorithm, i), e, !t.keysOnly && t.valueMapper);
	}
	function mr(t, e, n, r) {
		var i = L(r ? function(o, a, u) {
			return n(r(o), a, u);
		} : n);
		return t.then(function(o) {
			if (o) return o.start(function() {
				var a = function() {
					return o.continue();
				};
				(!e || e(o, function(u) {
					return a = u;
				}, function(u) {
					o.stop(u), a = N;
				}, function(u) {
					o.fail(u), a = N;
				})) && i(o.value, o, function(u) {
					return a = u;
				}), a();
			});
		});
	}
	var Oi = (function() {
		function t(e) {
			Object.assign(this, e);
		}
		return t.prototype.execute = function(e) {
			var n;
			if (this.add !== void 0) {
				var r = this.add;
				if (U(r)) return mt(mt([], U(e) ? e : [], !0), r, !0).sort();
				if (typeof r == "number") return (Number(e) || 0) + r;
				if (typeof r == "bigint") try {
					return BigInt(e) + r;
				} catch {
					return BigInt(0) + r;
				}
				throw new TypeError("Invalid term ".concat(r));
			}
			if (this.remove !== void 0) {
				var i = this.remove;
				if (U(i)) return U(e) ? e.filter(function(a) {
					return !i.includes(a);
				}).sort() : [];
				if (typeof i == "number") return Number(e) - i;
				if (typeof i == "bigint") try {
					return BigInt(e) - i;
				} catch {
					return BigInt(0) - i;
				}
				throw new TypeError("Invalid subtrahend ".concat(i));
			}
			var o = (n = this.replacePrefix) === null || n === void 0 ? void 0 : n[0];
			return o && typeof e == "string" && e.startsWith(o) ? this.replacePrefix[1] + e.substring(o.length) : e;
		}, t;
	})(), Fi = (function() {
		function t() {}
		return t.prototype._read = function(e, n) {
			var r = this._ctx;
			return r.error ? r.table._trans(null, q.bind(null, r.error)) : r.table._trans("readonly", e).then(n);
		}, t.prototype._write = function(e) {
			var n = this._ctx;
			return n.error ? n.table._trans(null, q.bind(null, n.error)) : n.table._trans("readwrite", e, "locked");
		}, t.prototype._addAlgorithm = function(e) {
			var n = this._ctx;
			n.algorithm = De(n.algorithm, e);
		}, t.prototype._iterate = function(e, n) {
			return Pt(this._ctx, e, n, this._ctx.table.core);
		}, t.prototype.clone = function(e) {
			var n = Object.create(this.constructor.prototype), r = Object.create(this._ctx);
			return e && re(r, e), n._ctx = r, n;
		}, t.prototype.raw = function() {
			return this._ctx.valueMapper = null, this;
		}, t.prototype.each = function(e) {
			var n = this._ctx;
			return this._read(function(r) {
				return Pt(n, e, r, n.table.core);
			});
		}, t.prototype.count = function(e) {
			var n = this;
			return this._read(function(r) {
				var i = n._ctx, o = i.table.core;
				if (Qe(i, !0)) return o.count({
					trans: r,
					query: {
						index: Ct(i, o.schema),
						range: i.range
					}
				}).then(function(u) {
					return Math.min(u, i.limit);
				});
				var a = 0;
				return Pt(i, function() {
					return ++a, !1;
				}, r, o).then(function() {
					return a;
				});
			}).then(e);
		}, t.prototype.sortBy = function(e, n) {
			var r = e.split(".").reverse(), i = r[0], o = r.length - 1;
			function a(c, h) {
				return h ? a(c[r[h]], h - 1) : c[i];
			}
			var u = this._ctx.dir === "next" ? 1 : -1;
			function s(c, h) {
				return B(a(c, o), a(h, o)) * u;
			}
			return this.toArray(function(c) {
				return c.sort(s);
			}).then(n);
		}, t.prototype.toArray = function(e) {
			var n = this;
			return this._read(function(r) {
				var i = n._ctx;
				if (i.dir === "next" && Qe(i, !0) && i.limit > 0) {
					var o = i.valueMapper, a = Ct(i, i.table.core.schema);
					return i.table.core.query({
						trans: r,
						limit: i.limit,
						values: !0,
						query: {
							index: a,
							range: i.range
						}
					}).then(function(s) {
						var c = s.result;
						return o ? c.map(o) : c;
					});
				} else {
					var u = [];
					return Pt(i, function(s) {
						return u.push(s);
					}, r, i.table.core).then(function() {
						return u;
					});
				}
			}, e);
		}, t.prototype.offset = function(e) {
			var n = this._ctx;
			return e <= 0 ? this : (n.offset += e, Qe(n) ? mn(n, function() {
				var r = e;
				return function(i, o) {
					return r === 0 ? !0 : r === 1 ? (--r, !1) : (o(function() {
						i.advance(r), r = 0;
					}), !1);
				};
			}) : mn(n, function() {
				var r = e;
				return function() {
					return --r < 0;
				};
			}), this);
		}, t.prototype.limit = function(e) {
			return this._ctx.limit = Math.min(this._ctx.limit, e), mn(this._ctx, function() {
				var n = e;
				return function(r, i, o) {
					return --n <= 0 && i(o), n >= 0;
				};
			}, !0), this;
		}, t.prototype.until = function(e, n) {
			return vn(this._ctx, function(r, i, o) {
				return e(r.value) ? (i(o), n) : !0;
			}), this;
		}, t.prototype.first = function(e) {
			return this.limit(1).toArray(function(n) {
				return n[0];
			}).then(e);
		}, t.prototype.last = function(e) {
			return this.reverse().first(e);
		}, t.prototype.filter = function(e) {
			return vn(this._ctx, function(n) {
				return e(n.value);
			}), Ri(this._ctx, e), this;
		}, t.prototype.and = function(e) {
			return this.filter(e);
		}, t.prototype.or = function(e) {
			return new this.db.WhereClause(this._ctx.table, e, this);
		}, t.prototype.reverse = function() {
			return this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev", this._ondirectionchange && this._ondirectionchange(this._ctx.dir), this;
		}, t.prototype.desc = function() {
			return this.reverse();
		}, t.prototype.eachKey = function(e) {
			var n = this._ctx;
			return n.keysOnly = !n.isMatch, this.each(function(r, i) {
				e(i.key, i);
			});
		}, t.prototype.eachUniqueKey = function(e) {
			return this._ctx.unique = "unique", this.eachKey(e);
		}, t.prototype.eachPrimaryKey = function(e) {
			var n = this._ctx;
			return n.keysOnly = !n.isMatch, this.each(function(r, i) {
				e(i.primaryKey, i);
			});
		}, t.prototype.keys = function(e) {
			var n = this._ctx;
			n.keysOnly = !n.isMatch;
			var r = [];
			return this.each(function(i, o) {
				r.push(o.key);
			}).then(function() {
				return r;
			}).then(e);
		}, t.prototype.primaryKeys = function(e) {
			var n = this._ctx;
			if (n.dir === "next" && Qe(n, !0) && n.limit > 0) return this._read(function(i) {
				var o = Ct(n, n.table.core.schema);
				return n.table.core.query({
					trans: i,
					values: !1,
					limit: n.limit,
					query: {
						index: o,
						range: n.range
					}
				});
			}).then(function(i) {
				return i.result;
			}).then(e);
			n.keysOnly = !n.isMatch;
			var r = [];
			return this.each(function(i, o) {
				r.push(o.primaryKey);
			}).then(function() {
				return r;
			}).then(e);
		}, t.prototype.uniqueKeys = function(e) {
			return this._ctx.unique = "unique", this.keys(e);
		}, t.prototype.firstKey = function(e) {
			return this.limit(1).keys(function(n) {
				return n[0];
			}).then(e);
		}, t.prototype.lastKey = function(e) {
			return this.reverse().firstKey(e);
		}, t.prototype.distinct = function() {
			var e = this._ctx, n = e.index && e.table.schema.idxByName[e.index];
			if (!n || !n.multi) return this;
			var r = {};
			return vn(this._ctx, function(i) {
				var o = i.primaryKey.toString(), a = ne(r, o);
				return r[o] = !0, !a;
			}), this;
		}, t.prototype.modify = function(e) {
			var n = this, r = this._ctx;
			return this._write(function(i) {
				var o;
				if (typeof e == "function") o = e;
				else {
					var a = Q(e), u = a.length;
					o = function(d) {
						for (var g = !1, b = 0; b < u; ++b) {
							var _ = a[b], I = e[_], A = de(d, _);
							I instanceof Oi ? (ie(d, _, I.execute(A)), g = !0) : A !== I && (ie(d, _, I), g = !0);
						}
						return g;
					};
				}
				var s = r.table.core, c = s.schema.primaryKey, h = c.outbound, l = c.extractKey, p = 200, y = n.db._options.modifyChunkSize;
				y && (typeof y == "object" ? p = y[s.name] || y["*"] || 200 : p = y);
				var f = [], v = 0, m = [], w = function(d, g) {
					var b = g.failures, _ = g.numFailures;
					v += d - _;
					for (var I = 0, A = Q(b); I < A.length; I++) {
						var M = A[I];
						f.push(b[M]);
					}
				};
				return n.clone().primaryKeys().then(function(d) {
					var g = Qe(r) && r.limit === Infinity && (typeof e != "function" || e === yn) && {
						index: r.index,
						range: r.range
					}, b = function(_) {
						var I = Math.min(p, d.length - _);
						return s.getMany({
							trans: i,
							keys: d.slice(_, _ + I),
							cache: "immutable"
						}).then(function(A) {
							for (var M = [], P = [], T = h ? [] : null, F = [], k = 0; k < I; ++k) {
								var S = A[k], C = {
									value: Me(S),
									primKey: d[_ + k]
								};
								o.call(C, C.value, C) !== !1 && (C.value == null ? F.push(d[_ + k]) : !h && B(l(S), l(C.value)) !== 0 ? (F.push(d[_ + k]), M.push(C.value)) : (P.push(C.value), h && T.push(d[_ + k])));
							}
							return Promise.resolve(M.length > 0 && s.mutate({
								trans: i,
								type: "add",
								values: M
							}).then(function(x) {
								for (var $ in x.failures) F.splice(parseInt($), 1);
								w(M.length, x);
							})).then(function() {
								return (P.length > 0 || g && typeof e == "object") && s.mutate({
									trans: i,
									type: "put",
									keys: T,
									values: P,
									criteria: g,
									changeSpec: typeof e != "function" && e,
									isAdditionalChunk: _ > 0
								}).then(function(x) {
									return w(P.length, x);
								});
							}).then(function() {
								return (F.length > 0 || g && e === yn) && s.mutate({
									trans: i,
									type: "delete",
									keys: F,
									criteria: g,
									isAdditionalChunk: _ > 0
								}).then(function(x) {
									return w(F.length, x);
								});
							}).then(function() {
								return d.length > _ + I && b(_ + p);
							});
						});
					};
					return b(0).then(function() {
						if (f.length > 0) throw new gt("Error modifying one or more objects", f, v, m);
						return d.length;
					});
				});
			});
		}, t.prototype.delete = function() {
			var e = this._ctx, n = e.range;
			return Qe(e) && (e.isPrimKey || n.type === 3) ? this._write(function(r) {
				var i = e.table.core.schema.primaryKey, o = n;
				return e.table.core.count({
					trans: r,
					query: {
						index: i,
						range: o
					}
				}).then(function(a) {
					return e.table.core.mutate({
						trans: r,
						type: "deleteRange",
						range: o
					}).then(function(u) {
						var s = u.failures;
						u.lastResult, u.results;
						var c = u.numFailures;
						if (c) throw new gt("Could not delete some values", Object.keys(s).map(function(h) {
							return s[h];
						}), a - c);
						return a - c;
					});
				});
			}) : this.modify(yn);
		}, t;
	})(), yn = function(t, e) {
		return e.value = null;
	};
	function Ki(t) {
		return ct(Fi.prototype, function(n, r) {
			this.db = t;
			var i = fr, o = null;
			if (r) try {
				i = r();
			} catch (c) {
				o = c;
			}
			var a = n._ctx, u = a.table, s = u.hook.reading.fire;
			this._ctx = {
				table: u,
				index: a.index,
				isPrimKey: !a.index || u.schema.primKey.keyPath && a.index === u.schema.primKey.name,
				range: i,
				keysOnly: !1,
				dir: "next",
				unique: "",
				algorithm: null,
				filter: null,
				replayFilter: null,
				justLimit: !0,
				isMatch: null,
				offset: 0,
				limit: Infinity,
				error: o,
				or: a.or,
				valueMapper: s !== it ? s : null
			};
		});
	}
	function Di(t, e) {
		return t < e ? -1 : t === e ? 0 : 1;
	}
	function Bi(t, e) {
		return t > e ? -1 : t === e ? 0 : 1;
	}
	function oe(t, e, n) {
		var r = t instanceof gr ? new t.Collection(t) : t;
		return r._ctx.error = n ? new n(e) : new TypeError(e), r;
	}
	function Xe(t) {
		return new t.Collection(t, function() {
			return yr("");
		}).limit(0);
	}
	function Vi(t) {
		return t === "next" ? function(e) {
			return e.toUpperCase();
		} : function(e) {
			return e.toLowerCase();
		};
	}
	function $i(t) {
		return t === "next" ? function(e) {
			return e.toLowerCase();
		} : function(e) {
			return e.toUpperCase();
		};
	}
	function Ni(t, e, n, r, i, o) {
		for (var a = Math.min(t.length, r.length), u = -1, s = 0; s < a; ++s) {
			var c = e[s];
			if (c !== r[s]) return i(t[s], n[s]) < 0 ? t.substr(0, s) + n[s] + n.substr(s + 1) : i(t[s], r[s]) < 0 ? t.substr(0, s) + r[s] + n.substr(s + 1) : u >= 0 ? t.substr(0, u) + e[u] + n.substr(u + 1) : null;
			i(t[s], c) < 0 && (u = s);
		}
		return a < r.length && o === "next" ? t + n.substr(t.length) : a < t.length && o === "prev" ? t.substr(0, n.length) : u < 0 ? null : t.substr(0, u) + r[u] + n.substr(u + 1);
	}
	function Rt(t, e, n, r) {
		var i, o, a, u, s, c, h, l = n.length;
		if (!n.every(function(v) {
			return typeof v == "string";
		})) return oe(t, lr);
		function p(v) {
			i = Vi(v), o = $i(v), a = v === "next" ? Di : Bi;
			var m = n.map(function(w) {
				return {
					lower: o(w),
					upper: i(w)
				};
			}).sort(function(w, d) {
				return a(w.lower, d.lower);
			});
			u = m.map(function(w) {
				return w.upper;
			}), s = m.map(function(w) {
				return w.lower;
			}), c = v, h = v === "next" ? "" : r;
		}
		p("next");
		var y = new t.Collection(t, function() {
			return Ie(u[0], s[l - 1] + r);
		});
		y._ondirectionchange = function(v) {
			p(v);
		};
		var f = 0;
		return y._addAlgorithm(function(v, m, w) {
			var d = v.key;
			if (typeof d != "string") return !1;
			var g = o(d);
			if (e(g, s, f)) return !0;
			for (var b = null, _ = f; _ < l; ++_) {
				var I = Ni(d, g, u[_], s[_], a, c);
				I === null && b === null ? f = _ + 1 : (b === null || a(b, I) > 0) && (b = I);
			}
			return m(b !== null ? function() {
				v.continue(b + h);
			} : w), !1;
		}), y;
	}
	function Ie(t, e, n, r) {
		return {
			type: 2,
			lower: t,
			upper: e,
			lowerOpen: n,
			upperOpen: r
		};
	}
	function yr(t) {
		return {
			type: 1,
			lower: t,
			upper: t
		};
	}
	var gr = (function() {
		function t() {}
		return Object.defineProperty(t.prototype, "Collection", {
			get: function() {
				return this._ctx.table.db.Collection;
			},
			enumerable: !1,
			configurable: !0
		}), t.prototype.between = function(e, n, r, i) {
			r = r !== !1, i = i === !0;
			try {
				return this._cmp(e, n) > 0 || this._cmp(e, n) === 0 && (r || i) && !(r && i) ? Xe(this) : new this.Collection(this, function() {
					return Ie(e, n, !r, !i);
				});
			} catch {
				return oe(this, ve);
			}
		}, t.prototype.equals = function(e) {
			return e == null ? oe(this, ve) : new this.Collection(this, function() {
				return yr(e);
			});
		}, t.prototype.above = function(e) {
			return e == null ? oe(this, ve) : new this.Collection(this, function() {
				return Ie(e, void 0, !0);
			});
		}, t.prototype.aboveOrEqual = function(e) {
			return e == null ? oe(this, ve) : new this.Collection(this, function() {
				return Ie(e, void 0, !1);
			});
		}, t.prototype.below = function(e) {
			return e == null ? oe(this, ve) : new this.Collection(this, function() {
				return Ie(void 0, e, !1, !0);
			});
		}, t.prototype.belowOrEqual = function(e) {
			return e == null ? oe(this, ve) : new this.Collection(this, function() {
				return Ie(void 0, e);
			});
		}, t.prototype.startsWith = function(e) {
			return typeof e != "string" ? oe(this, lr) : this.between(e, e + Ke, !0, !0);
		}, t.prototype.startsWithIgnoreCase = function(e) {
			return e === "" ? this.startsWith(e) : Rt(this, function(n, r) {
				return n.indexOf(r[0]) === 0;
			}, [e], Ke);
		}, t.prototype.equalsIgnoreCase = function(e) {
			return Rt(this, function(n, r) {
				return n === r[0];
			}, [e], "");
		}, t.prototype.anyOfIgnoreCase = function() {
			var e = pe.apply(Le, arguments);
			return e.length === 0 ? Xe(this) : Rt(this, function(n, r) {
				return r.indexOf(n) !== -1;
			}, e, "");
		}, t.prototype.startsWithAnyOfIgnoreCase = function() {
			var e = pe.apply(Le, arguments);
			return e.length === 0 ? Xe(this) : Rt(this, function(n, r) {
				return r.some(function(i) {
					return n.indexOf(i) === 0;
				});
			}, e, Ke);
		}, t.prototype.anyOf = function() {
			var e = this, n = pe.apply(Le, arguments), r = this._cmp;
			try {
				n.sort(r);
			} catch {
				return oe(this, ve);
			}
			if (n.length === 0) return Xe(this);
			var i = new this.Collection(this, function() {
				return Ie(n[0], n[n.length - 1]);
			});
			i._ondirectionchange = function(a) {
				r = a === "next" ? e._ascending : e._descending, n.sort(r);
			};
			var o = 0;
			return i._addAlgorithm(function(a, u, s) {
				for (var c = a.key; r(c, n[o]) > 0;) if (++o, o === n.length) return u(s), !1;
				return r(c, n[o]) === 0 ? !0 : (u(function() {
					a.continue(n[o]);
				}), !1);
			}), i;
		}, t.prototype.notEqual = function(e) {
			return this.inAnyRange([[hn, e], [e, this.db._maxKey]], {
				includeLowers: !1,
				includeUppers: !1
			});
		}, t.prototype.noneOf = function() {
			var e = pe.apply(Le, arguments);
			if (e.length === 0) return new this.Collection(this);
			try {
				e.sort(this._ascending);
			} catch {
				return oe(this, ve);
			}
			var n = e.reduce(function(r, i) {
				return r ? r.concat([[r[r.length - 1][1], i]]) : [[hn, i]];
			}, null);
			return n.push([e[e.length - 1], this.db._maxKey]), this.inAnyRange(n, {
				includeLowers: !1,
				includeUppers: !1
			});
		}, t.prototype.inAnyRange = function(e, n) {
			var r = this, i = this._cmp, o = this._ascending, a = this._descending, u = this._min, s = this._max;
			if (e.length === 0) return Xe(this);
			if (!e.every(function(_) {
				return _[0] !== void 0 && _[1] !== void 0 && o(_[0], _[1]) <= 0;
			})) return oe(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", O.InvalidArgument);
			var c = !n || n.includeLowers !== !1, h = n && n.includeUppers === !0;
			function l(_, I) {
				for (var A = 0, M = _.length; A < M; ++A) {
					var P = _[A];
					if (i(I[0], P[1]) < 0 && i(I[1], P[0]) > 0) {
						P[0] = u(P[0], I[0]), P[1] = s(P[1], I[1]);
						break;
					}
				}
				return A === M && _.push(I), _;
			}
			var p = o;
			function y(_, I) {
				return p(_[0], I[0]);
			}
			var f;
			try {
				f = e.reduce(l, []), f.sort(y);
			} catch {
				return oe(this, ve);
			}
			var v = 0, m = h ? function(_) {
				return o(_, f[v][1]) > 0;
			} : function(_) {
				return o(_, f[v][1]) >= 0;
			}, w = c ? function(_) {
				return a(_, f[v][0]) > 0;
			} : function(_) {
				return a(_, f[v][0]) >= 0;
			};
			function d(_) {
				return !m(_) && !w(_);
			}
			var g = m, b = new this.Collection(this, function() {
				return Ie(f[0][0], f[f.length - 1][1], !c, !h);
			});
			return b._ondirectionchange = function(_) {
				_ === "next" ? (g = m, p = o) : (g = w, p = a), f.sort(y);
			}, b._addAlgorithm(function(_, I, A) {
				for (var M = _.key; g(M);) if (++v, v === f.length) return I(A), !1;
				return d(M) ? !0 : (r._cmp(M, f[v][1]) === 0 || r._cmp(M, f[v][0]) === 0 || I(function() {
					p === o ? _.continue(f[v][0]) : _.continue(f[v][1]);
				}), !1);
			}), b;
		}, t.prototype.startsWithAnyOf = function() {
			var e = pe.apply(Le, arguments);
			return e.every(function(n) {
				return typeof n == "string";
			}) ? e.length === 0 ? Xe(this) : this.inAnyRange(e.map(function(n) {
				return [n, n + Ke];
			})) : oe(this, "startsWithAnyOf() only works with strings");
		}, t;
	})();
	function ji(t) {
		return ct(gr.prototype, function(n, r, i) {
			if (this.db = t, this._ctx = {
				table: n,
				index: r === ":id" ? null : r,
				or: i
			}, this._cmp = this._ascending = B, this._descending = function(o, a) {
				return B(a, o);
			}, this._max = function(o, a) {
				return B(o, a) > 0 ? o : a;
			}, this._min = function(o, a) {
				return B(o, a) < 0 ? o : a;
			}, this._IDBKeyRange = t._deps.IDBKeyRange, !this._IDBKeyRange) throw new O.MissingAPI();
		});
	}
	function fe(t) {
		return L(function(e) {
			return lt(e), t(e.target.error), !1;
		});
	}
	function lt(t) {
		t.stopPropagation && t.stopPropagation(), t.preventDefault && t.preventDefault();
	}
	var ft = "storagemutated", gn = "x-storagemutated-1", ke = ut(null, ft), zi = (function() {
		function t() {}
		return t.prototype._lock = function() {
			return nt(!R.global), ++this._reculock, this._reculock === 1 && !R.global && (R.lockOwnerFor = this), this;
		}, t.prototype._unlock = function() {
			if (nt(!R.global), --this._reculock === 0) for (R.global || (R.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked();) {
				var e = this._blockedFuncs.shift();
				try {
					Fe(e[1], e[0]);
				} catch {}
			}
			return this;
		}, t.prototype._locked = function() {
			return this._reculock && R.lockOwnerFor !== this;
		}, t.prototype.create = function(e) {
			var n = this;
			if (!this.mode) return this;
			var r = this.db.idbdb, i = this.db._state.dbOpenError;
			if (nt(!this.idbtrans), !e && !r) switch (i && i.name) {
				case "DatabaseClosedError": throw new O.DatabaseClosed(i);
				case "MissingAPIError": throw new O.MissingAPI(i.message, i);
				default: throw new O.OpenFailed(i);
			}
			if (!this.active) throw new O.TransactionInactive();
			return nt(this._completion._state === null), e = this.idbtrans = e || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : r.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })), e.onerror = L(function(o) {
				lt(o), n._reject(e.error);
			}), e.onabort = L(function(o) {
				lt(o), n.active && n._reject(new O.Abort(e.error)), n.active = !1, n.on("abort").fire(o);
			}), e.oncomplete = L(function() {
				n.active = !1, n._resolve(), "mutatedParts" in e && ke.storagemutated.fire(e.mutatedParts);
			}), this;
		}, t.prototype._promise = function(e, n, r) {
			var i = this;
			if (e === "readwrite" && this.mode !== "readwrite") return q(new O.ReadOnly("Transaction is readonly"));
			if (!this.active) return q(new O.TransactionInactive());
			if (this._locked()) return new E(function(a, u) {
				i._blockedFuncs.push([function() {
					i._promise(e, n, r).then(a, u);
				}, R]);
			});
			if (r) return be(function() {
				var a = new E(function(u, s) {
					i._lock();
					var c = n(u, s, i);
					c && c.then && c.then(u, s);
				});
				return a.finally(function() {
					return i._unlock();
				}), a._lib = !0, a;
			});
			var o = new E(function(a, u) {
				var s = n(a, u, i);
				s && s.then && s.then(a, u);
			});
			return o._lib = !0, o;
		}, t.prototype._root = function() {
			return this.parent ? this.parent._root() : this;
		}, t.prototype.waitFor = function(e) {
			var n = this._root(), r = E.resolve(e);
			if (n._waitingFor) n._waitingFor = n._waitingFor.then(function() {
				return r;
			});
			else {
				n._waitingFor = r, n._waitingQueue = [];
				var i = n.idbtrans.objectStore(n.storeNames[0]);
				(function a() {
					for (++n._spinCount; n._waitingQueue.length;) n._waitingQueue.shift()();
					n._waitingFor && (i.get(-Infinity).onsuccess = a);
				})();
			}
			var o = n._waitingFor;
			return new E(function(a, u) {
				r.then(function(s) {
					return n._waitingQueue.push(L(a.bind(null, s)));
				}, function(s) {
					return n._waitingQueue.push(L(u.bind(null, s)));
				}).finally(function() {
					n._waitingFor === o && (n._waitingFor = null);
				});
			});
		}, t.prototype.abort = function() {
			this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new O.Abort()));
		}, t.prototype.table = function(e) {
			var n = this._memoizedTables || (this._memoizedTables = {});
			if (ne(n, e)) return n[e];
			var r = this.schema[e];
			if (!r) throw new O.NotFound("Table " + e + " not part of transaction");
			var i = new this.db.Table(e, r, this);
			return i.core = this.db.core.table(e), n[e] = i, i;
		}, t;
	})();
	function Li(t) {
		return ct(zi.prototype, function(n, r, i, o, a) {
			var u = this;
			this.db = t, this.mode = n, this.storeNames = r, this.schema = i, this.chromeTransactionDurability = o, this.idbtrans = null, this.on = ut(this, "complete", "error", "abort"), this.parent = a || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new E(function(s, c) {
				u._resolve = s, u._reject = c;
			}), this._completion.then(function() {
				u.active = !1, u.on.complete.fire();
			}, function(s) {
				var c = u.active;
				return u.active = !1, u.on.error.fire(s), u.parent ? u.parent._reject(s) : c && u.idbtrans && u.idbtrans.abort(), q(s);
			});
		});
	}
	function wn(t, e, n, r, i, o, a) {
		return {
			name: t,
			keyPath: e,
			unique: n,
			multi: r,
			auto: i,
			compound: o,
			src: (n && !a ? "&" : "") + (r ? "*" : "") + (i ? "++" : "") + wr(e)
		};
	}
	function wr(t) {
		return typeof t == "string" ? t : t ? "[" + [].join.call(t, "+") + "]" : "";
	}
	function bn(t, e, n) {
		return {
			name: t,
			primKey: e,
			indexes: n,
			mappedClass: null,
			idxByName: ei(n, function(r) {
				return [r.name, r];
			})
		};
	}
	function Wi(t) {
		return t.length === 1 ? t[0] : t;
	}
	var ht = function(t) {
		try {
			return t.only([[]]), ht = function() {
				return [[]];
			}, [[]];
		} catch {
			return ht = function() {
				return Ke;
			}, Ke;
		}
	};
	function _n(t) {
		return t == null ? function() {} : typeof t == "string" ? Ui(t) : function(e) {
			return de(e, t);
		};
	}
	function Ui(t) {
		return t.split(".").length === 1 ? function(e) {
			return e[t];
		} : function(e) {
			return de(e, t);
		};
	}
	function br(t) {
		return [].slice.call(t);
	}
	var qi = 0;
	function dt(t) {
		return t == null ? ":id" : typeof t == "string" ? t : "[".concat(t.join("+"), "]");
	}
	function Gi(t, e, n) {
		function r(l, p) {
			var y = br(l.objectStoreNames);
			return {
				schema: {
					name: l.name,
					tables: y.map(function(f) {
						return p.objectStore(f);
					}).map(function(f) {
						var v = f.keyPath, m = f.autoIncrement, w = U(v), d = v == null, g = {}, b = {
							name: f.name,
							primaryKey: {
								name: null,
								isPrimaryKey: !0,
								outbound: d,
								compound: w,
								keyPath: v,
								autoIncrement: m,
								unique: !0,
								extractKey: _n(v)
							},
							indexes: br(f.indexNames).map(function(_) {
								return f.index(_);
							}).map(function(_) {
								var I = _.name, A = _.unique, M = _.multiEntry, P = _.keyPath, T = {
									name: I,
									compound: U(P),
									keyPath: P,
									unique: A,
									multiEntry: M,
									extractKey: _n(P)
								};
								return g[dt(P)] = T, T;
							}),
							getIndexByKeyPath: function(_) {
								return g[dt(_)];
							}
						};
						return g[":id"] = b.primaryKey, v != null && (g[dt(v)] = b.primaryKey), b;
					})
				},
				hasGetAll: y.length > 0 && "getAll" in p.objectStore(y[0]) && !(typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
			};
		}
		function i(l) {
			if (l.type === 3) return null;
			if (l.type === 4) throw new Error("Cannot convert never type to IDBKeyRange");
			var p = l.lower, y = l.upper, f = l.lowerOpen, v = l.upperOpen;
			return p === void 0 ? y === void 0 ? null : e.upperBound(y, !!v) : y === void 0 ? e.lowerBound(p, !!f) : e.bound(p, y, !!f, !!v);
		}
		function o(l) {
			var p = l.name;
			function y(m) {
				var w = m.trans, d = m.type, g = m.keys, b = m.values, _ = m.range;
				return new Promise(function(I, A) {
					I = L(I);
					var M = w.objectStore(p), P = M.keyPath == null, T = d === "put" || d === "add";
					if (!T && d !== "delete" && d !== "deleteRange") throw new Error("Invalid operation type: " + d);
					var F = (g || b || { length: 1 }).length;
					if (g && b && g.length !== b.length) throw new Error("Given keys array must have same length as given values array.");
					if (F === 0) return I({
						numFailures: 0,
						failures: {},
						results: [],
						lastResult: void 0
					});
					var k, S = [], C = [], x = 0, $ = function(Z) {
						++x, lt(Z);
					};
					if (d === "deleteRange") {
						if (_.type === 4) return I({
							numFailures: x,
							failures: C,
							results: [],
							lastResult: void 0
						});
						_.type === 3 ? S.push(k = M.clear()) : S.push(k = M.delete(i(_)));
					} else {
						var D = T ? P ? [b, g] : [b, null] : [g, null], j = D[0], W = D[1];
						if (T) for (var z = 0; z < F; ++z) S.push(k = W && W[z] !== void 0 ? M[d](j[z], W[z]) : M[d](j[z])), k.onerror = $;
						else for (var z = 0; z < F; ++z) S.push(k = M[d](j[z])), k.onerror = $;
					}
					var G = function(Z) {
						var se = Z.target.result;
						S.forEach(function(V, ye) {
							return V.error != null && (C[ye] = V.error);
						}), I({
							numFailures: x,
							failures: C,
							results: d === "delete" ? g : S.map(function(V) {
								return V.result;
							}),
							lastResult: se
						});
					};
					k.onerror = function(Z) {
						$(Z), G(Z);
					}, k.onsuccess = G;
				});
			}
			function f(m) {
				var w = m.trans, d = m.values, g = m.query, b = m.reverse, _ = m.unique;
				return new Promise(function(I, A) {
					I = L(I);
					var M = g.index, P = g.range, T = w.objectStore(p), F = M.isPrimaryKey ? T : T.index(M.name), k = b ? _ ? "prevunique" : "prev" : _ ? "nextunique" : "next", S = d || !("openKeyCursor" in F) ? F.openCursor(i(P), k) : F.openKeyCursor(i(P), k);
					S.onerror = fe(A), S.onsuccess = L(function(C) {
						var x = S.result;
						if (!x) {
							I(null);
							return;
						}
						x.___id = ++qi, x.done = !1;
						var $ = x.continue.bind(x), D = x.continuePrimaryKey;
						D && (D = D.bind(x));
						var j = x.advance.bind(x), W = function() {
							throw new Error("Cursor not started");
						}, z = function() {
							throw new Error("Cursor not stopped");
						};
						x.trans = w, x.stop = x.continue = x.continuePrimaryKey = x.advance = W, x.fail = L(A), x.next = function() {
							var G = this, Z = 1;
							return this.start(function() {
								return Z-- ? G.continue() : G.stop();
							}).then(function() {
								return G;
							});
						}, x.start = function(G) {
							var Z = new Promise(function(V, ye) {
								V = L(V), S.onerror = fe(ye), x.fail = ye, x.stop = function(Oa) {
									x.stop = x.continue = x.continuePrimaryKey = x.advance = z, V(Oa);
								};
							}), se = function() {
								if (S.result) try {
									G();
								} catch (V) {
									x.fail(V);
								}
								else x.done = !0, x.start = function() {
									throw new Error("Cursor behind last entry");
								}, x.stop();
							};
							return S.onsuccess = L(function(V) {
								S.onsuccess = se, se();
							}), x.continue = $, x.continuePrimaryKey = D, x.advance = j, se(), Z;
						}, I(x);
					}, A);
				});
			}
			function v(m) {
				return function(w) {
					return new Promise(function(d, g) {
						d = L(d);
						var b = w.trans, _ = w.values, I = w.limit, A = w.query, M = I === Infinity ? void 0 : I, P = A.index, T = A.range, F = b.objectStore(p), k = P.isPrimaryKey ? F : F.index(P.name), S = i(T);
						if (I === 0) return d({ result: [] });
						if (m) {
							var C = _ ? k.getAll(S, M) : k.getAllKeys(S, M);
							C.onsuccess = function(j) {
								return d({ result: j.target.result });
							}, C.onerror = fe(g);
						} else {
							var x = 0, $ = _ || !("openKeyCursor" in k) ? k.openCursor(S) : k.openKeyCursor(S), D = [];
							$.onsuccess = function(j) {
								var W = $.result;
								if (!W) return d({ result: D });
								if (D.push(_ ? W.value : W.primaryKey), ++x === I) return d({ result: D });
								W.continue();
							}, $.onerror = fe(g);
						}
					});
				};
			}
			return {
				name: p,
				schema: l,
				mutate: y,
				getMany: function(m) {
					var w = m.trans, d = m.keys;
					return new Promise(function(g, b) {
						g = L(g);
						for (var _ = w.objectStore(p), I = d.length, A = new Array(I), M = 0, P = 0, T, F = function(C) {
							var x = C.target;
							A[x._pos] = x.result, ++P === M && g(A);
						}, k = fe(b), S = 0; S < I; ++S) d[S] != null && (T = _.get(d[S]), T._pos = S, T.onsuccess = F, T.onerror = k, ++M);
						M === 0 && g(A);
					});
				},
				get: function(m) {
					var w = m.trans, d = m.key;
					return new Promise(function(g, b) {
						g = L(g);
						var _ = w.objectStore(p).get(d);
						_.onsuccess = function(I) {
							return g(I.target.result);
						}, _.onerror = fe(b);
					});
				},
				query: v(s),
				openCursor: f,
				count: function(m) {
					var w = m.query, d = m.trans, g = w.index, b = w.range;
					return new Promise(function(_, I) {
						var A = d.objectStore(p), M = g.isPrimaryKey ? A : A.index(g.name), P = i(b), T = P ? M.count(P) : M.count();
						T.onsuccess = L(function(F) {
							return _(F.target.result);
						}), T.onerror = fe(I);
					});
				}
			};
		}
		var a = r(t, n), u = a.schema, s = a.hasGetAll, c = u.tables.map(function(l) {
			return o(l);
		}), h = {};
		return c.forEach(function(l) {
			return h[l.name] = l;
		}), {
			stack: "dbcore",
			transaction: t.transaction.bind(t),
			table: function(l) {
				if (!h[l]) throw new Error("Table '".concat(l, "' not found"));
				return h[l];
			},
			MIN_KEY: -Infinity,
			MAX_KEY: ht(e),
			schema: u
		};
	}
	function Hi(t, e) {
		return e.reduce(function(n, r) {
			var i = r.create;
			return K(K({}, n), i(n));
		}, t);
	}
	function Yi(t, e, n, r) {
		var i = n.IDBKeyRange;
		return n.indexedDB, { dbcore: Hi(Gi(e, i, r), t.dbcore) };
	}
	function Ot(t, e) {
		var n = e.db;
		t.core = Yi(t._middlewares, n, t._deps, e).dbcore, t.tables.forEach(function(r) {
			var i = r.name;
			t.core.schema.tables.some(function(o) {
				return o.name === i;
			}) && (r.core = t.core.table(i), t[i] instanceof t.Table && (t[i].core = r.core));
		});
	}
	function Ft(t, e, n, r) {
		n.forEach(function(i) {
			var o = r[i];
			e.forEach(function(a) {
				var u = Wn(a, i);
				(!u || "value" in u && u.value === void 0) && (a === t.Transaction.prototype || a instanceof t.Transaction ? ge(a, i, {
					get: function() {
						return this.table(i);
					},
					set: function(s) {
						Ln(this, i, {
							value: s,
							writable: !0,
							configurable: !0,
							enumerable: !0
						});
					}
				}) : a[i] = new t.Table(i, o));
			});
		});
	}
	function Sn(t, e) {
		e.forEach(function(n) {
			for (var r in n) n[r] instanceof t.Table && delete n[r];
		});
	}
	function Qi(t, e) {
		return t._cfg.version - e._cfg.version;
	}
	function Xi(t, e, n, r) {
		var i = t._dbSchema;
		n.objectStoreNames.contains("$meta") && !i.$meta && (i.$meta = bn("$meta", Sr("")[0], []), t._storeNames.push("$meta"));
		var o = t._createTransaction("readwrite", t._storeNames, i);
		o.create(n), o._completion.catch(r);
		var a = o._reject.bind(o), u = R.transless || R;
		be(function() {
			if (R.trans = o, R.transless = u, e === 0) Q(i).forEach(function(s) {
				kn(n, s, i[s].primKey, i[s].indexes);
			}), Ot(t, n), E.follow(function() {
				return t.on.populate.fire(o);
			}).catch(a);
			else return Ot(t, n), Zi(t, o, e).then(function(s) {
				return eo(t, s, o, n);
			}).catch(a);
		});
	}
	function Ji(t, e) {
		_r(t._dbSchema, e), e.db.version % 10 === 0 && !e.objectStoreNames.contains("$meta") && e.db.createObjectStore("$meta").add(Math.ceil(e.db.version / 10 - 1), "version");
		var n = Dt(t, t.idbdb, e);
		Bt(t, t._dbSchema, e);
		for (var r = In(n, t._dbSchema), i = function(c) {
			if (c.change.length || c.recreate) return console.warn("Unable to patch indexes of table ".concat(c.name, " because it has changes on the type of index or primary key.")), { value: void 0 };
			var h = e.objectStore(c.name);
			c.add.forEach(function(l) {
				le && console.debug("Dexie upgrade patch: Creating missing index ".concat(c.name, ".").concat(l.src)), Kt(h, l);
			});
		}, o = 0, a = r.change; o < a.length; o++) {
			var u = a[o], s = i(u);
			if (typeof s == "object") return s.value;
		}
	}
	function Zi(t, e, n) {
		return e.storeNames.includes("$meta") ? e.table("$meta").get("version").then(function(r) {
			return r ?? n;
		}) : E.resolve(n);
	}
	function eo(t, e, n, r) {
		var i = [], o = t._versions, a = t._dbSchema = Dt(t, t.idbdb, r), u = o.filter(function(c) {
			return c._cfg.version >= e;
		});
		if (u.length === 0) return E.resolve();
		u.forEach(function(c) {
			i.push(function() {
				var h = a, l = c._cfg.dbschema;
				Bt(t, h, r), Bt(t, l, r), a = t._dbSchema = l;
				var p = In(h, l);
				p.add.forEach(function(d) {
					kn(r, d[0], d[1].primKey, d[1].indexes);
				}), p.change.forEach(function(d) {
					if (d.recreate) throw new O.Upgrade("Not yet support for changing primary key");
					var g = r.objectStore(d.name);
					d.add.forEach(function(b) {
						return Kt(g, b);
					}), d.change.forEach(function(b) {
						g.deleteIndex(b.name), Kt(g, b);
					}), d.del.forEach(function(b) {
						return g.deleteIndex(b);
					});
				});
				var y = c._cfg.contentUpgrade;
				if (y && c._cfg.version > e) {
					Ot(t, r), n._memoizedTables = {};
					var f = Gn(l);
					p.del.forEach(function(d) {
						f[d] = h[d];
					}), Sn(t, [t.Transaction.prototype]), Ft(t, [t.Transaction.prototype], Q(f), f), n.schema = f;
					var v = Xt(y);
					v && He();
					var m, w = E.follow(function() {
						if (m = y(n), m && v) {
							var d = _e.bind(null, null);
							m.then(d, d);
						}
					});
					return m && typeof m.then == "function" ? E.resolve(m) : w.then(function() {
						return m;
					});
				}
			}), i.push(function(h) {
				var l = c._cfg.dbschema;
				to(l, h), Sn(t, [t.Transaction.prototype]), Ft(t, [t.Transaction.prototype], t._storeNames, t._dbSchema), n.schema = t._dbSchema;
			}), i.push(function(h) {
				t.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(t.idbdb.version / 10) === c._cfg.version ? (t.idbdb.deleteObjectStore("$meta"), delete t._dbSchema.$meta, t._storeNames = t._storeNames.filter(function(l) {
					return l !== "$meta";
				})) : h.objectStore("$meta").put(c._cfg.version, "version"));
			});
		});
		function s() {
			return i.length ? E.resolve(i.shift()(n.idbtrans)).then(s) : E.resolve();
		}
		return s().then(function() {
			_r(a, r);
		});
	}
	function In(t, e) {
		var n = {
			del: [],
			add: [],
			change: []
		}, r;
		for (r in t) e[r] || n.del.push(r);
		for (r in e) {
			var i = t[r], o = e[r];
			if (!i) n.add.push([r, o]);
			else {
				var a = {
					name: r,
					def: o,
					recreate: !1,
					del: [],
					add: [],
					change: []
				};
				if ("" + (i.primKey.keyPath || "") != "" + (o.primKey.keyPath || "") || i.primKey.auto !== o.primKey.auto) a.recreate = !0, n.change.push(a);
				else {
					var u = i.idxByName, s = o.idxByName, c = void 0;
					for (c in u) s[c] || a.del.push(c);
					for (c in s) {
						var h = u[c], l = s[c];
						h ? h.src !== l.src && a.change.push(l) : a.add.push(l);
					}
					(a.del.length > 0 || a.add.length > 0 || a.change.length > 0) && n.change.push(a);
				}
			}
		}
		return n;
	}
	function kn(t, e, n, r) {
		var i = t.db.createObjectStore(e, n.keyPath ? {
			keyPath: n.keyPath,
			autoIncrement: n.auto
		} : { autoIncrement: n.auto });
		return r.forEach(function(o) {
			return Kt(i, o);
		}), i;
	}
	function _r(t, e) {
		Q(t).forEach(function(n) {
			e.db.objectStoreNames.contains(n) || (le && console.debug("Dexie: Creating missing table", n), kn(e, n, t[n].primKey, t[n].indexes));
		});
	}
	function to(t, e) {
		[].slice.call(e.db.objectStoreNames).forEach(function(n) {
			return t[n] == null && e.db.deleteObjectStore(n);
		});
	}
	function Kt(t, e) {
		t.createIndex(e.name, e.keyPath, {
			unique: e.unique,
			multiEntry: e.multi
		});
	}
	function Dt(t, e, n) {
		var r = {};
		return yt(e.objectStoreNames, 0).forEach(function(i) {
			for (var o = n.objectStore(i), a = o.keyPath, u = wn(wr(a), a || "", !0, !1, !!o.autoIncrement, a && typeof a != "string", !0), s = [], c = 0; c < o.indexNames.length; ++c) {
				var h = o.index(o.indexNames[c]);
				a = h.keyPath;
				var l = wn(h.name, a, !!h.unique, !!h.multiEntry, !1, a && typeof a != "string", !1);
				s.push(l);
			}
			r[i] = bn(i, u, s);
		}), r;
	}
	function no(t, e, n) {
		t.verno = e.version / 10;
		var r = t._dbSchema = Dt(t, e, n);
		t._storeNames = yt(e.objectStoreNames, 0), Ft(t, [t._allTables], Q(r), r);
	}
	function ro(t, e) {
		var n = In(Dt(t, t.idbdb, e), t._dbSchema);
		return !(n.add.length || n.change.some(function(r) {
			return r.add.length || r.change.length;
		}));
	}
	function Bt(t, e, n) {
		for (var r = n.db.objectStoreNames, i = 0; i < r.length; ++i) {
			var o = r[i], a = n.objectStore(o);
			t._hasGetAll = "getAll" in a;
			for (var u = 0; u < a.indexNames.length; ++u) {
				var s = a.indexNames[u], c = a.index(s).keyPath, h = typeof c == "string" ? c : "[" + yt(c).join("+") + "]";
				if (e[o]) {
					var l = e[o].idxByName[h];
					l && (l.name = s, delete e[o].idxByName[h], e[o].idxByName[s] = l);
				}
			}
		}
		typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && ee.WorkerGlobalScope && ee instanceof ee.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 && (t._hasGetAll = !1);
	}
	function Sr(t) {
		return t.split(",").map(function(e, n) {
			e = e.trim();
			var r = e.replace(/([&*]|\+\+)/g, ""), i = /^\[/.test(r) ? r.match(/^\[(.*)\]$/)[1].split("+") : r;
			return wn(r, i || null, /\&/.test(e), /\*/.test(e), /\+\+/.test(e), U(i), n === 0);
		});
	}
	var io = (function() {
		function t() {}
		return t.prototype._parseStoresSpec = function(e, n) {
			Q(e).forEach(function(r) {
				if (e[r] !== null) {
					var i = Sr(e[r]), o = i.shift();
					if (o.unique = !0, o.multi) throw new O.Schema("Primary key cannot be multi-valued");
					i.forEach(function(a) {
						if (a.auto) throw new O.Schema("Only primary key can be marked as autoIncrement (++)");
						if (!a.keyPath) throw new O.Schema("Index must have a name and cannot be an empty string");
					}), n[r] = bn(r, o, i);
				}
			});
		}, t.prototype.stores = function(e) {
			var n = this.db;
			this._cfg.storesSource = this._cfg.storesSource ? re(this._cfg.storesSource, e) : e;
			var r = n._versions, i = {}, o = {};
			return r.forEach(function(a) {
				re(i, a._cfg.storesSource), o = a._cfg.dbschema = {}, a._parseStoresSpec(i, o);
			}), n._dbSchema = o, Sn(n, [
				n._allTables,
				n,
				n.Transaction.prototype
			]), Ft(n, [
				n._allTables,
				n,
				n.Transaction.prototype,
				this._cfg.tables
			], Q(o), o), n._storeNames = Q(o), this;
		}, t.prototype.upgrade = function(e) {
			return this._cfg.contentUpgrade = en(this._cfg.contentUpgrade || N, e), this;
		}, t;
	})();
	function oo(t) {
		return ct(io.prototype, function(n) {
			this.db = t, this._cfg = {
				version: n,
				storesSource: null,
				dbschema: {},
				tables: {},
				contentUpgrade: null
			};
		});
	}
	function xn(t, e) {
		var n = t._dbNamesDB;
		return n || (n = t._dbNamesDB = new vt(Mt, {
			addons: [],
			indexedDB: t,
			IDBKeyRange: e
		}), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
	}
	function En(t) {
		return t && typeof t.databases == "function";
	}
	function ao(t) {
		var e = t.indexedDB, n = t.IDBKeyRange;
		return En(e) ? Promise.resolve(e.databases()).then(function(r) {
			return r.map(function(i) {
				return i.name;
			}).filter(function(i) {
				return i !== Mt;
			});
		}) : xn(e, n).toCollection().primaryKeys();
	}
	function so(t, e) {
		var n = t.indexedDB, r = t.IDBKeyRange;
		!En(n) && e !== Mt && xn(n, r).put({ name: e }).catch(N);
	}
	function uo(t, e) {
		var n = t.indexedDB, r = t.IDBKeyRange;
		!En(n) && e !== Mt && xn(n, r).delete(e).catch(N);
	}
	function An(t) {
		return be(function() {
			return R.letThrough = !0, t();
		});
	}
	function co() {
		if (!(!navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent)) || !indexedDB.databases) return Promise.resolve();
		var t;
		return new Promise(function(e) {
			var n = function() {
				return indexedDB.databases().finally(e);
			};
			t = setInterval(n, 100), n();
		}).finally(function() {
			return clearInterval(t);
		});
	}
	var Mn;
	function Tn(t) {
		return !("from" in t);
	}
	var te = function(t, e) {
		if (this) re(this, arguments.length ? {
			d: 1,
			from: t,
			to: arguments.length > 1 ? e : t
		} : { d: 0 });
		else {
			var n = new te();
			return t && "d" in t && re(n, t), n;
		}
	};
	je(te.prototype, (Mn = {
		add: function(t) {
			return Vt(this, t), this;
		},
		addKey: function(t) {
			return pt(this, t, t), this;
		},
		addKeys: function(t) {
			var e = this;
			return t.forEach(function(n) {
				return pt(e, n, n);
			}), this;
		},
		hasKey: function(t) {
			var e = $t(this).next(t).value;
			return e && B(e.from, t) <= 0 && B(e.to, t) >= 0;
		}
	}, Mn[Qt] = function() {
		return $t(this);
	}, Mn));
	function pt(t, e, n) {
		var r = B(e, n);
		if (!isNaN(r)) {
			if (r > 0) throw RangeError();
			if (Tn(t)) return re(t, {
				from: e,
				to: n,
				d: 1
			});
			var i = t.l, o = t.r;
			if (B(n, t.from) < 0) return i ? pt(i, e, n) : t.l = {
				from: e,
				to: n,
				d: 1,
				l: null,
				r: null
			}, Ir(t);
			if (B(e, t.to) > 0) return o ? pt(o, e, n) : t.r = {
				from: e,
				to: n,
				d: 1,
				l: null,
				r: null
			}, Ir(t);
			B(e, t.from) < 0 && (t.from = e, t.l = null, t.d = o ? o.d + 1 : 1), B(n, t.to) > 0 && (t.to = n, t.r = null, t.d = t.l ? t.l.d + 1 : 1);
			var a = !t.r;
			i && !t.l && Vt(t, i), o && a && Vt(t, o);
		}
	}
	function Vt(t, e) {
		function n(r, i) {
			var o = i.from, a = i.to, u = i.l, s = i.r;
			pt(r, o, a), u && n(r, u), s && n(r, s);
		}
		Tn(e) || n(t, e);
	}
	function lo(t, e) {
		var n = $t(e), r = n.next();
		if (r.done) return !1;
		for (var i = r.value, o = $t(t), a = o.next(i.from), u = a.value; !r.done && !a.done;) {
			if (B(u.from, i.to) <= 0 && B(u.to, i.from) >= 0) return !0;
			B(i.from, u.from) < 0 ? i = (r = n.next(u.from)).value : u = (a = o.next(i.from)).value;
		}
		return !1;
	}
	function $t(t) {
		var e = Tn(t) ? null : {
			s: 0,
			n: t
		};
		return { next: function(n) {
			for (var r = arguments.length > 0; e;) switch (e.s) {
				case 0: if (e.s = 1, r) for (; e.n.l && B(n, e.n.from) < 0;) e = {
					up: e,
					n: e.n.l,
					s: 1
				};
				else for (; e.n.l;) e = {
					up: e,
					n: e.n.l,
					s: 1
				};
				case 1: if (e.s = 2, !r || B(n, e.n.to) <= 0) return {
					value: e.n,
					done: !1
				};
				case 2: if (e.n.r) {
					e.s = 3, e = {
						up: e,
						n: e.n.r,
						s: 0
					};
					continue;
				}
				case 3: e = e.up;
			}
			return { done: !0 };
		} };
	}
	function Ir(t) {
		var e, n, r = (((e = t.r) === null || e === void 0 ? void 0 : e.d) || 0) - (((n = t.l) === null || n === void 0 ? void 0 : n.d) || 0), i = r > 1 ? "r" : r < -1 ? "l" : "";
		if (i) {
			var o = i === "r" ? "l" : "r", a = K({}, t), u = t[i];
			t.from = u.from, t.to = u.to, t[i] = u[i], a[i] = u[o], t[o] = a, a.d = kr(a);
		}
		t.d = kr(t);
	}
	function kr(t) {
		var e = t.r, n = t.l;
		return (e ? n ? Math.max(e.d, n.d) : e.d : n ? n.d : 0) + 1;
	}
	function Nt(t, e) {
		return Q(e).forEach(function(n) {
			t[n] ? Vt(t[n], e[n]) : t[n] = Qn(e[n]);
		}), t;
	}
	function Cn(t, e) {
		return t.all || e.all || Object.keys(t).some(function(n) {
			return e[n] && lo(e[n], t[n]);
		});
	}
	var Be = {}, Pn = {}, Rn = !1;
	function jt(t, e) {
		Nt(Pn, t), Rn || (Rn = !0, setTimeout(function() {
			Rn = !1;
			var n = Pn;
			Pn = {}, On(n, !1);
		}, 0));
	}
	function On(t, e) {
		e === void 0 && (e = !1);
		var n = /* @__PURE__ */ new Set();
		if (t.all) for (var r = 0, i = Object.values(Be); r < i.length; r++) {
			var o = i[r];
			xr(o, t, n, e);
		}
		else for (var a in t) {
			var u = /^idb\:\/\/(.*)\/(.*)\//.exec(a);
			if (u) {
				var s = u[1], c = u[2], o = Be["idb://".concat(s, "/").concat(c)];
				o && xr(o, t, n, e);
			}
		}
		n.forEach(function(h) {
			return h();
		});
	}
	function xr(t, e, n, r) {
		for (var i = [], o = 0, a = Object.entries(t.queries.query); o < a.length; o++) {
			for (var u = a[o], s = u[0], c = u[1], h = [], l = 0, p = c; l < p.length; l++) {
				var y = p[l];
				Cn(e, y.obsSet) ? y.subscribers.forEach(function(w) {
					return n.add(w);
				}) : r && h.push(y);
			}
			r && i.push([s, h]);
		}
		if (r) for (var f = 0, v = i; f < v.length; f++) {
			var m = v[f], s = m[0], h = m[1];
			t.queries.query[s] = h;
		}
	}
	function fo(t) {
		var e = t._state, n = t._deps.indexedDB;
		if (e.isBeingOpened || t.idbdb) return e.dbReadyPromise.then(function() {
			return e.dbOpenError ? q(e.dbOpenError) : t;
		});
		e.isBeingOpened = !0, e.dbOpenError = null, e.openComplete = !1;
		var r = e.openCanceller, i = Math.round(t.verno * 10), o = !1;
		function a() {
			if (e.openCanceller !== r) throw new O.DatabaseClosed("db.open() was cancelled");
		}
		var u = e.dbReadyResolve, s = null, c = !1, h = function() {
			return new E(function(l, p) {
				if (a(), !n) throw new O.MissingAPI();
				var y = t.name, f = e.autoSchema || !i ? n.open(y) : n.open(y, i);
				if (!f) throw new O.MissingAPI();
				f.onerror = fe(p), f.onblocked = L(t._fireOnBlocked), f.onupgradeneeded = L(function(v) {
					if (s = f.transaction, e.autoSchema && !t._options.allowEmptyDB) {
						f.onerror = lt, s.abort(), f.result.close();
						var m = n.deleteDatabase(y);
						m.onsuccess = m.onerror = L(function() {
							p(new O.NoSuchDatabase("Database ".concat(y, " doesnt exist")));
						});
					} else {
						s.onerror = fe(p);
						var w = v.oldVersion > Math.pow(2, 62) ? 0 : v.oldVersion;
						c = w < 1, t.idbdb = f.result, o && Ji(t, s), Xi(t, w / 10, s, p);
					}
				}, p), f.onsuccess = L(function() {
					s = null;
					var v = t.idbdb = f.result, m = yt(v.objectStoreNames);
					if (m.length > 0) try {
						var w = v.transaction(Wi(m), "readonly");
						if (e.autoSchema) no(t, v, w);
						else if (Bt(t, t._dbSchema, w), !ro(t, w) && !o) return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), v.close(), i = v.version + 1, o = !0, l(h());
						Ot(t, w);
					} catch {}
					Ye.push(t), v.onversionchange = L(function(d) {
						e.vcFired = !0, t.on("versionchange").fire(d);
					}), v.onclose = L(function(d) {
						t.on("close").fire(d);
					}), c && so(t._deps, y), l();
				}, p);
			}).catch(function(l) {
				switch (l?.name) {
					case "UnknownError":
						if (e.PR1398_maxLoop > 0) return e.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), h();
						break;
					case "VersionError":
						if (i > 0) return i = 0, h();
						break;
				}
				return E.reject(l);
			});
		};
		return E.race([r, (typeof navigator > "u" ? E.resolve() : co()).then(h)]).then(function() {
			return a(), e.onReadyBeingFired = [], E.resolve(An(function() {
				return t.on.ready.fire(t.vip);
			})).then(function l() {
				if (e.onReadyBeingFired.length > 0) {
					var p = e.onReadyBeingFired.reduce(en, N);
					return e.onReadyBeingFired = [], E.resolve(An(function() {
						return p(t.vip);
					})).then(l);
				}
			});
		}).finally(function() {
			e.openCanceller === r && (e.onReadyBeingFired = null, e.isBeingOpened = !1);
		}).catch(function(l) {
			e.dbOpenError = l;
			try {
				s && s.abort();
			} catch {}
			return r === e.openCanceller && t._close(), q(l);
		}).finally(function() {
			e.openComplete = !0, u();
		}).then(function() {
			if (c) {
				var l = {};
				t.tables.forEach(function(p) {
					p.schema.indexes.forEach(function(y) {
						y.name && (l["idb://".concat(t.name, "/").concat(p.name, "/").concat(y.name)] = new te(-Infinity, [[[]]]));
					}), l["idb://".concat(t.name, "/").concat(p.name, "/")] = l["idb://".concat(t.name, "/").concat(p.name, "/:dels")] = new te(-Infinity, [[[]]]);
				}), ke(ft).fire(l), On(l, !0);
			}
			return t;
		});
	}
	function Fn(t) {
		var e = function(a) {
			return t.next(a);
		}, n = function(a) {
			return t.throw(a);
		}, r = o(e), i = o(n);
		function o(a) {
			return function(u) {
				var s = a(u), c = s.value;
				return s.done ? c : !c || typeof c.then != "function" ? U(c) ? Promise.all(c).then(r, i) : r(c) : c.then(r, i);
			};
		}
		return o(e)();
	}
	function ho(t, e, n) {
		var r = arguments.length;
		if (r < 2) throw new O.InvalidArgument("Too few arguments");
		for (var i = new Array(r - 1); --r;) i[r - 1] = arguments[r];
		return n = i.pop(), [
			t,
			Hn(i),
			n
		];
	}
	function Er(t, e, n, r, i) {
		return E.resolve().then(function() {
			var o = R.transless || R, a = t._createTransaction(e, n, t._dbSchema, r);
			a.explicit = !0;
			var u = {
				trans: a,
				transless: o
			};
			if (r) a.idbtrans = r.idbtrans;
			else try {
				a.create(), a.idbtrans._explicit = !0, t._state.PR1398_maxLoop = 3;
			} catch (l) {
				return l.name === Zt.InvalidState && t.isOpen() && --t._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), t.close({ disableAutoOpen: !1 }), t.open().then(function() {
					return Er(t, e, n, null, i);
				})) : q(l);
			}
			var s = Xt(i);
			s && He();
			var c, h = E.follow(function() {
				if (c = i.call(a, a), c) if (s) {
					var l = _e.bind(null, null);
					c.then(l, l);
				} else typeof c.next == "function" && typeof c.throw == "function" && (c = Fn(c));
			}, u);
			return (c && typeof c.then == "function" ? E.resolve(c).then(function(l) {
				return a.active ? l : q(new O.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
			}) : h.then(function() {
				return c;
			})).then(function(l) {
				return r && a._resolve(), a._completion.then(function() {
					return l;
				});
			}).catch(function(l) {
				return a._reject(l), q(l);
			});
		});
	}
	function zt(t, e, n) {
		for (var r = U(t) ? t.slice() : [t], i = 0; i < n; ++i) r.push(e);
		return r;
	}
	function po(t) {
		return K(K({}, t), { table: function(e) {
			var n = t.table(e), r = n.schema, i = {}, o = [];
			function a(f, v, m) {
				var w = dt(f), d = i[w] = i[w] || [], g = f == null ? 0 : typeof f == "string" ? 1 : f.length, b = v > 0, _ = K(K({}, m), {
					name: b ? "".concat(w, "(virtual-from:").concat(m.name, ")") : m.name,
					lowLevelIndex: m,
					isVirtual: b,
					keyTail: v,
					keyLength: g,
					extractKey: _n(f),
					unique: !b && m.unique
				});
				return d.push(_), _.isPrimaryKey || o.push(_), g > 1 && a(g === 2 ? f[0] : f.slice(0, g - 1), v + 1, m), d.sort(function(I, A) {
					return I.keyTail - A.keyTail;
				}), _;
			}
			var u = a(r.primaryKey.keyPath, 0, r.primaryKey);
			i[":id"] = [u];
			for (var s = 0, c = r.indexes; s < c.length; s++) {
				var h = c[s];
				a(h.keyPath, 0, h);
			}
			function l(f) {
				var v = i[dt(f)];
				return v && v[0];
			}
			function p(f, v) {
				return {
					type: f.type === 1 ? 2 : f.type,
					lower: zt(f.lower, f.lowerOpen ? t.MAX_KEY : t.MIN_KEY, v),
					lowerOpen: !0,
					upper: zt(f.upper, f.upperOpen ? t.MIN_KEY : t.MAX_KEY, v),
					upperOpen: !0
				};
			}
			function y(f) {
				var v = f.query.index;
				return v.isVirtual ? K(K({}, f), { query: {
					index: v.lowLevelIndex,
					range: p(f.query.range, v.keyTail)
				} }) : f;
			}
			return K(K({}, n), {
				schema: K(K({}, r), {
					primaryKey: u,
					indexes: o,
					getIndexByKeyPath: l
				}),
				count: function(f) {
					return n.count(y(f));
				},
				query: function(f) {
					return n.query(y(f));
				},
				openCursor: function(f) {
					var v = f.query.index, m = v.keyTail, w = v.isVirtual, d = v.keyLength;
					if (!w) return n.openCursor(f);
					function g(b) {
						function _(I) {
							I != null ? b.continue(zt(I, f.reverse ? t.MAX_KEY : t.MIN_KEY, m)) : f.unique ? b.continue(b.key.slice(0, d).concat(f.reverse ? t.MIN_KEY : t.MAX_KEY, m)) : b.continue();
						}
						return Object.create(b, {
							continue: { value: _ },
							continuePrimaryKey: { value: function(I, A) {
								b.continuePrimaryKey(zt(I, t.MAX_KEY, m), A);
							} },
							primaryKey: { get: function() {
								return b.primaryKey;
							} },
							key: { get: function() {
								var I = b.key;
								return d === 1 ? I[0] : I.slice(0, d);
							} },
							value: { get: function() {
								return b.value;
							} }
						});
					}
					return n.openCursor(y(f)).then(function(b) {
						return b && g(b);
					});
				}
			});
		} });
	}
	var vo = {
		stack: "dbcore",
		name: "VirtualIndexMiddleware",
		level: 1,
		create: po
	};
	function Kn(t, e, n, r) {
		return n = n || {}, r = r || "", Q(t).forEach(function(i) {
			if (!ne(e, i)) n[r + i] = void 0;
			else {
				var o = t[i], a = e[i];
				if (typeof o == "object" && typeof a == "object" && o && a) {
					var u = Yt(o);
					u !== Yt(a) ? n[r + i] = e[i] : u === "Object" ? Kn(o, a, n, r + i + ".") : o !== a && (n[r + i] = e[i]);
				} else o !== a && (n[r + i] = e[i]);
			}
		}), Q(e).forEach(function(i) {
			ne(t, i) || (n[r + i] = e[i]);
		}), n;
	}
	function Dn(t, e) {
		return e.type === "delete" ? e.keys : e.keys || e.values.map(t.extractKey);
	}
	var mo = {
		stack: "dbcore",
		name: "HooksMiddleware",
		level: 2,
		create: function(t) {
			return K(K({}, t), { table: function(e) {
				var n = t.table(e), r = n.schema.primaryKey;
				return K(K({}, n), { mutate: function(i) {
					var o = R.trans, a = o.table(e).hook, u = a.deleting, s = a.creating, c = a.updating;
					switch (i.type) {
						case "add":
							if (s.fire === N) break;
							return o._promise("readwrite", function() {
								return h(i);
							}, !0);
						case "put":
							if (s.fire === N && c.fire === N) break;
							return o._promise("readwrite", function() {
								return h(i);
							}, !0);
						case "delete":
							if (u.fire === N) break;
							return o._promise("readwrite", function() {
								return h(i);
							}, !0);
						case "deleteRange":
							if (u.fire === N) break;
							return o._promise("readwrite", function() {
								return l(i);
							}, !0);
					}
					return n.mutate(i);
					function h(y) {
						var f = R.trans, v = y.keys || Dn(r, y);
						if (!v) throw new Error("Keys missing");
						return y = y.type === "add" || y.type === "put" ? K(K({}, y), { keys: v }) : K({}, y), y.type !== "delete" && (y.values = mt([], y.values, !0)), y.keys && (y.keys = mt([], y.keys, !0)), yo(n, y, v).then(function(m) {
							var w = v.map(function(d, g) {
								var b = m[g], _ = {
									onerror: null,
									onsuccess: null
								};
								if (y.type === "delete") u.fire.call(_, d, b, f);
								else if (y.type === "add" || b === void 0) {
									var I = s.fire.call(_, d, y.values[g], f);
									d == null && I != null && (d = I, y.keys[g] = d, r.outbound || ie(y.values[g], r.keyPath, d));
								} else {
									var A = Kn(b, y.values[g]), M = c.fire.call(_, A, d, b, f);
									if (M) {
										var P = y.values[g];
										Object.keys(M).forEach(function(T) {
											ne(P, T) ? P[T] = M[T] : ie(P, T, M[T]);
										});
									}
								}
								return _;
							});
							return n.mutate(y).then(function(d) {
								for (var g = d.failures, b = d.results, _ = d.numFailures, I = d.lastResult, A = 0; A < v.length; ++A) {
									var M = b ? b[A] : v[A], P = w[A];
									M == null ? P.onerror && P.onerror(g[A]) : P.onsuccess && P.onsuccess(y.type === "put" && m[A] ? y.values[A] : M);
								}
								return {
									failures: g,
									results: b,
									numFailures: _,
									lastResult: I
								};
							}).catch(function(d) {
								return w.forEach(function(g) {
									return g.onerror && g.onerror(d);
								}), Promise.reject(d);
							});
						});
					}
					function l(y) {
						return p(y.trans, y.range, 1e4);
					}
					function p(y, f, v) {
						return n.query({
							trans: y,
							values: !1,
							query: {
								index: r,
								range: f
							},
							limit: v
						}).then(function(m) {
							var w = m.result;
							return h({
								type: "delete",
								keys: w,
								trans: y
							}).then(function(d) {
								return d.numFailures > 0 ? Promise.reject(d.failures[0]) : w.length < v ? {
									failures: [],
									numFailures: 0,
									lastResult: void 0
								} : p(y, K(K({}, f), {
									lower: w[w.length - 1],
									lowerOpen: !0
								}), v);
							});
						});
					}
				} });
			} });
		}
	};
	function yo(t, e, n) {
		return e.type === "add" ? Promise.resolve([]) : t.getMany({
			trans: e.trans,
			keys: n,
			cache: "immutable"
		});
	}
	function Ar(t, e, n) {
		try {
			if (!e || e.keys.length < t.length) return null;
			for (var r = [], i = 0, o = 0; i < e.keys.length && o < t.length; ++i) B(e.keys[i], t[o]) === 0 && (r.push(n ? Me(e.values[i]) : e.values[i]), ++o);
			return r.length === t.length ? r : null;
		} catch {
			return null;
		}
	}
	var go = {
		stack: "dbcore",
		level: -1,
		create: function(t) {
			return { table: function(e) {
				var n = t.table(e);
				return K(K({}, n), {
					getMany: function(r) {
						if (!r.cache) return n.getMany(r);
						var i = Ar(r.keys, r.trans._cache, r.cache === "clone");
						return i ? E.resolve(i) : n.getMany(r).then(function(o) {
							return r.trans._cache = {
								keys: r.keys,
								values: r.cache === "clone" ? Me(o) : o
							}, o;
						});
					},
					mutate: function(r) {
						return r.type !== "add" && (r.trans._cache = null), n.mutate(r);
					}
				});
			} };
		}
	};
	function Mr(t, e) {
		return t.trans.mode === "readonly" && !!t.subscr && !t.trans.explicit && t.trans.db._options.cache !== "disabled" && !e.schema.primaryKey.outbound;
	}
	function Tr(t, e) {
		switch (t) {
			case "query": return e.values && !e.unique;
			case "get": return !1;
			case "getMany": return !1;
			case "count": return !1;
			case "openCursor": return !1;
		}
	}
	var wo = {
		stack: "dbcore",
		level: 0,
		name: "Observability",
		create: function(t) {
			var e = t.schema.name, n = new te(t.MIN_KEY, t.MAX_KEY);
			return K(K({}, t), {
				transaction: function(r, i, o) {
					if (R.subscr && i !== "readonly") throw new O.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(R.querier));
					return t.transaction(r, i, o);
				},
				table: function(r) {
					var i = t.table(r), o = i.schema, a = o.primaryKey, u = o.indexes, s = a.extractKey, c = a.outbound, h = a.autoIncrement && u.filter(function(f) {
						return f.compound && f.keyPath.includes(a.keyPath);
					}), l = K(K({}, i), { mutate: function(f) {
						var v, m, w = f.trans, d = f.mutatedParts || (f.mutatedParts = {}), g = function(S) {
							var C = "idb://".concat(e, "/").concat(r, "/").concat(S);
							return d[C] || (d[C] = new te());
						}, b = g(""), _ = g(":dels"), I = f.type, A = f.type === "deleteRange" ? [f.range] : f.type === "delete" ? [f.keys] : f.values.length < 50 ? [Dn(a, f).filter(function(S) {
							return S;
						}), f.values] : [], M = A[0], P = A[1], T = f.trans._cache;
						if (U(M)) {
							b.addKeys(M);
							var F = I === "delete" || M.length === P.length ? Ar(M, T) : null;
							F || _.addKeys(M), (F || P) && bo(g, o, F, P);
						} else if (M) {
							var k = {
								from: (v = M.lower) !== null && v !== void 0 ? v : t.MIN_KEY,
								to: (m = M.upper) !== null && m !== void 0 ? m : t.MAX_KEY
							};
							_.add(k), b.add(k);
						} else b.add(n), _.add(n), o.indexes.forEach(function(S) {
							return g(S.name).add(n);
						});
						return i.mutate(f).then(function(S) {
							return M && (f.type === "add" || f.type === "put") && (b.addKeys(S.results), h && h.forEach(function(C) {
								for (var x = f.values.map(function(W) {
									return C.extractKey(W);
								}), $ = C.keyPath.findIndex(function(W) {
									return W === a.keyPath;
								}), D = 0, j = S.results.length; D < j; ++D) x[D][$] = S.results[D];
								g(C.name).addKeys(x);
							})), w.mutatedParts = Nt(w.mutatedParts || {}, d), S;
						});
					} }), p = function(f) {
						var v, m, w = f.query, d = w.index, g = w.range;
						return [d, new te((v = g.lower) !== null && v !== void 0 ? v : t.MIN_KEY, (m = g.upper) !== null && m !== void 0 ? m : t.MAX_KEY)];
					}, y = {
						get: function(f) {
							return [a, new te(f.key)];
						},
						getMany: function(f) {
							return [a, new te().addKeys(f.keys)];
						},
						count: p,
						query: p,
						openCursor: p
					};
					return Q(y).forEach(function(f) {
						l[f] = function(v) {
							var m = R.subscr, w = !!m, d = Mr(R, i) && Tr(f, v) ? v.obsSet = {} : m;
							if (w) {
								var g = function(T) {
									var F = "idb://".concat(e, "/").concat(r, "/").concat(T);
									return d[F] || (d[F] = new te());
								}, b = g(""), _ = g(":dels"), I = y[f](v), A = I[0], M = I[1];
								if (f === "query" && A.isPrimaryKey && !v.values ? _.add(M) : g(A.name || "").add(M), !A.isPrimaryKey) if (f === "count") _.add(n);
								else {
									var P = f === "query" && c && v.values && i.query(K(K({}, v), { values: !1 }));
									return i[f].apply(this, arguments).then(function(T) {
										if (f === "query") {
											if (c && v.values) return P.then(function(C) {
												var x = C.result;
												return b.addKeys(x), T;
											});
											var F = v.values ? T.result.map(s) : T.result;
											v.values ? b.addKeys(F) : _.addKeys(F);
										} else if (f === "openCursor") {
											var k = T, S = v.values;
											return k && Object.create(k, {
												key: { get: function() {
													return _.addKey(k.primaryKey), k.key;
												} },
												primaryKey: { get: function() {
													var C = k.primaryKey;
													return _.addKey(C), C;
												} },
												value: { get: function() {
													return S && b.addKey(k.primaryKey), k.value;
												} }
											});
										}
										return T;
									});
								}
							}
							return i[f].apply(this, arguments);
						};
					}), l;
				}
			});
		}
	};
	function bo(t, e, n, r) {
		function i(o) {
			var a = t(o.name || "");
			function u(c) {
				return c != null ? o.extractKey(c) : null;
			}
			var s = function(c) {
				return o.multiEntry && U(c) ? c.forEach(function(h) {
					return a.addKey(h);
				}) : a.addKey(c);
			};
			(n || r).forEach(function(c, h) {
				var l = n && u(n[h]), p = r && u(r[h]);
				B(l, p) !== 0 && (l != null && s(l), p != null && s(p));
			});
		}
		e.indexes.forEach(i);
	}
	function Cr(t, e, n) {
		if (n.numFailures === 0) return e;
		if (e.type === "deleteRange") return null;
		var r = e.keys ? e.keys.length : "values" in e && e.values ? e.values.length : 1;
		if (n.numFailures === r) return null;
		var i = K({}, e);
		return U(i.keys) && (i.keys = i.keys.filter(function(o, a) {
			return !(a in n.failures);
		})), "values" in i && U(i.values) && (i.values = i.values.filter(function(o, a) {
			return !(a in n.failures);
		})), i;
	}
	function _o(t, e) {
		return e.lower === void 0 ? !0 : e.lowerOpen ? B(t, e.lower) > 0 : B(t, e.lower) >= 0;
	}
	function So(t, e) {
		return e.upper === void 0 ? !0 : e.upperOpen ? B(t, e.upper) < 0 : B(t, e.upper) <= 0;
	}
	function Bn(t, e) {
		return _o(t, e) && So(t, e);
	}
	function Pr(t, e, n, r, i, o) {
		if (!n || n.length === 0) return t;
		var a = e.query.index, u = a.multiEntry, s = e.query.range, c = r.schema.primaryKey.extractKey, h = a.extractKey, l = (a.lowLevelIndex || a).extractKey, p = n.reduce(function(y, f) {
			var v = y, m = [];
			if (f.type === "add" || f.type === "put") for (var w = new te(), d = f.values.length - 1; d >= 0; --d) {
				var g = f.values[d], b = c(g);
				if (!w.hasKey(b)) {
					var _ = h(g);
					(u && U(_) ? _.some(function(T) {
						return Bn(T, s);
					}) : Bn(_, s)) && (w.addKey(b), m.push(g));
				}
			}
			switch (f.type) {
				case "add":
					var I = new te().addKeys(e.values ? y.map(function(T) {
						return c(T);
					}) : y);
					v = y.concat(e.values ? m.filter(function(T) {
						var F = c(T);
						return I.hasKey(F) ? !1 : (I.addKey(F), !0);
					}) : m.map(function(T) {
						return c(T);
					}).filter(function(T) {
						return I.hasKey(T) ? !1 : (I.addKey(T), !0);
					}));
					break;
				case "put":
					var A = new te().addKeys(f.values.map(function(T) {
						return c(T);
					}));
					v = y.filter(function(T) {
						return !A.hasKey(e.values ? c(T) : T);
					}).concat(e.values ? m : m.map(function(T) {
						return c(T);
					}));
					break;
				case "delete":
					var M = new te().addKeys(f.keys);
					v = y.filter(function(T) {
						return !M.hasKey(e.values ? c(T) : T);
					});
					break;
				case "deleteRange":
					var P = f.range;
					v = y.filter(function(T) {
						return !Bn(c(T), P);
					});
					break;
			}
			return v;
		}, t);
		return p === t ? t : (p.sort(function(y, f) {
			return B(l(y), l(f)) || B(c(y), c(f));
		}), e.limit && e.limit < Infinity && (p.length > e.limit ? p.length = e.limit : t.length === e.limit && p.length < e.limit && (i.dirty = !0)), o ? Object.freeze(p) : p);
	}
	function Rr(t, e) {
		return B(t.lower, e.lower) === 0 && B(t.upper, e.upper) === 0 && !!t.lowerOpen == !!e.lowerOpen && !!t.upperOpen == !!e.upperOpen;
	}
	function Io(t, e, n, r) {
		if (t === void 0) return e !== void 0 ? -1 : 0;
		if (e === void 0) return 1;
		var i = B(t, e);
		if (i === 0) {
			if (n && r) return 0;
			if (n) return 1;
			if (r) return -1;
		}
		return i;
	}
	function ko(t, e, n, r) {
		if (t === void 0) return e !== void 0 ? 1 : 0;
		if (e === void 0) return -1;
		var i = B(t, e);
		if (i === 0) {
			if (n && r) return 0;
			if (n) return -1;
			if (r) return 1;
		}
		return i;
	}
	function xo(t, e) {
		return Io(t.lower, e.lower, t.lowerOpen, e.lowerOpen) <= 0 && ko(t.upper, e.upper, t.upperOpen, e.upperOpen) >= 0;
	}
	function Eo(t, e, n, r) {
		var i = Be["idb://".concat(t, "/").concat(e)];
		if (!i) return [];
		var o = i.queries[n];
		if (!o) return [
			null,
			!1,
			i,
			null
		];
		var a = o[(r.query ? r.query.index.name : null) || ""];
		if (!a) return [
			null,
			!1,
			i,
			null
		];
		switch (n) {
			case "query":
				var u = a.find(function(c) {
					return c.req.limit === r.limit && c.req.values === r.values && Rr(c.req.query.range, r.query.range);
				});
				return u ? [
					u,
					!0,
					i,
					a
				] : [
					a.find(function(c) {
						return ("limit" in c.req ? c.req.limit : Infinity) >= r.limit && (r.values ? c.req.values : !0) && xo(c.req.query.range, r.query.range);
					}),
					!1,
					i,
					a
				];
			case "count":
				var s = a.find(function(c) {
					return Rr(c.req.query.range, r.query.range);
				});
				return [
					s,
					!!s,
					i,
					a
				];
		}
	}
	function Ao(t, e, n, r) {
		t.subscribers.add(n), r.addEventListener("abort", function() {
			t.subscribers.delete(n), t.subscribers.size === 0 && Mo(t, e);
		});
	}
	function Mo(t, e) {
		setTimeout(function() {
			t.subscribers.size === 0 && Te(e, t);
		}, 3e3);
	}
	var To = {
		stack: "dbcore",
		level: 0,
		name: "Cache",
		create: function(t) {
			var e = t.schema.name;
			return K(K({}, t), {
				transaction: function(n, r, i) {
					var o = t.transaction(n, r, i);
					if (r === "readwrite") {
						var a = new AbortController(), u = a.signal, s = function(c) {
							return function() {
								if (a.abort(), r === "readwrite") {
									for (var h = /* @__PURE__ */ new Set(), l = 0, p = n; l < p.length; l++) {
										var y = p[l], f = Be["idb://".concat(e, "/").concat(y)];
										if (f) {
											var v = t.table(y), m = f.optimisticOps.filter(function(S) {
												return S.trans === o;
											});
											if (o._explicit && c && o.mutatedParts) for (var w = 0, d = Object.values(f.queries.query); w < d.length; w++) for (var g = d[w], b = 0, _ = g.slice(); b < _.length; b++) {
												var I = _[b];
												Cn(I.obsSet, o.mutatedParts) && (Te(g, I), I.subscribers.forEach(function(S) {
													return h.add(S);
												}));
											}
											else if (m.length > 0) {
												f.optimisticOps = f.optimisticOps.filter(function(S) {
													return S.trans !== o;
												});
												for (var A = 0, M = Object.values(f.queries.query); A < M.length; A++) for (var g = M[A], P = 0, T = g.slice(); P < T.length; P++) {
													var I = T[P];
													if (I.res != null && o.mutatedParts) if (c && !I.dirty) {
														var F = Object.isFrozen(I.res), k = Pr(I.res, I.req, m, v, I, F);
														I.dirty ? (Te(g, I), I.subscribers.forEach(function(x) {
															return h.add(x);
														})) : k !== I.res && (I.res = k, I.promise = E.resolve({ result: k }));
													} else I.dirty && Te(g, I), I.subscribers.forEach(function(x) {
														return h.add(x);
													});
												}
											}
										}
									}
									h.forEach(function(S) {
										return S();
									});
								}
							};
						};
						o.addEventListener("abort", s(!1), { signal: u }), o.addEventListener("error", s(!1), { signal: u }), o.addEventListener("complete", s(!0), { signal: u });
					}
					return o;
				},
				table: function(n) {
					var r = t.table(n), i = r.schema.primaryKey;
					return K(K({}, r), {
						mutate: function(o) {
							var a = R.trans;
							if (i.outbound || a.db._options.cache === "disabled" || a.explicit || a.idbtrans.mode !== "readwrite") return r.mutate(o);
							var u = Be["idb://".concat(e, "/").concat(n)];
							if (!u) return r.mutate(o);
							var s = r.mutate(o);
							return (o.type === "add" || o.type === "put") && (o.values.length >= 50 || Dn(i, o).some(function(c) {
								return c == null;
							})) ? s.then(function(c) {
								var h = Cr(u, K(K({}, o), { values: o.values.map(function(l, p) {
									var y;
									if (c.failures[p]) return l;
									var f = !((y = i.keyPath) === null || y === void 0) && y.includes(".") ? Me(l) : K({}, l);
									return ie(f, i.keyPath, c.results[p]), f;
								}) }), c);
								u.optimisticOps.push(h), queueMicrotask(function() {
									return o.mutatedParts && jt(o.mutatedParts);
								});
							}) : (u.optimisticOps.push(o), o.mutatedParts && jt(o.mutatedParts), s.then(function(c) {
								if (c.numFailures > 0) {
									Te(u.optimisticOps, o);
									var h = Cr(u, o, c);
									h && u.optimisticOps.push(h), o.mutatedParts && jt(o.mutatedParts);
								}
							}), s.catch(function() {
								Te(u.optimisticOps, o), o.mutatedParts && jt(o.mutatedParts);
							})), s;
						},
						query: function(o) {
							var a;
							if (!Mr(R, r) || !Tr("query", o)) return r.query(o);
							var u = ((a = R.trans) === null || a === void 0 ? void 0 : a.db._options.cache) === "immutable", s = R, c = s.requery, h = s.signal, l = Eo(e, n, "query", o), p = l[0], y = l[1], f = l[2], v = l[3];
							if (p && y) p.obsSet = o.obsSet;
							else {
								var m = r.query(o).then(function(w) {
									var d = w.result;
									if (p && (p.res = d), u) {
										for (var g = 0, b = d.length; g < b; ++g) Object.freeze(d[g]);
										Object.freeze(d);
									} else w.result = Me(d);
									return w;
								}).catch(function(w) {
									return v && p && Te(v, p), Promise.reject(w);
								});
								p = {
									obsSet: o.obsSet,
									promise: m,
									subscribers: /* @__PURE__ */ new Set(),
									type: "query",
									req: o,
									dirty: !1
								}, v ? v.push(p) : (v = [p], f || (f = Be["idb://".concat(e, "/").concat(n)] = {
									queries: {
										query: {},
										count: {}
									},
									objs: /* @__PURE__ */ new Map(),
									optimisticOps: [],
									unsignaledParts: {}
								}), f.queries.query[o.query.index.name || ""] = v);
							}
							return Ao(p, v, c, h), p.promise.then(function(w) {
								return { result: Pr(w.result, o, f?.optimisticOps, r, p, u) };
							});
						}
					});
				}
			});
		}
	};
	function Lt(t, e) {
		return new Proxy(t, { get: function(n, r, i) {
			return r === "db" ? e : Reflect.get(n, r, i);
		} });
	}
	var vt = (function() {
		function t(e, n) {
			var r = this;
			this._middlewares = {}, this.verno = 0;
			var i = t.dependencies;
			this._options = n = K({
				addons: t.addons,
				autoOpen: !0,
				indexedDB: i.indexedDB,
				IDBKeyRange: i.IDBKeyRange,
				cache: "cloned"
			}, n), this._deps = {
				indexedDB: n.indexedDB,
				IDBKeyRange: n.IDBKeyRange
			};
			var o = n.addons;
			this._dbSchema = {}, this._versions = [], this._storeNames = [], this._allTables = {}, this.idbdb = null, this._novip = this;
			var a = {
				dbOpenError: null,
				isBeingOpened: !1,
				onReadyBeingFired: null,
				openComplete: !1,
				dbReadyResolve: N,
				dbReadyPromise: null,
				cancelOpen: N,
				openCanceller: null,
				autoSchema: !0,
				PR1398_maxLoop: 3,
				autoOpen: n.autoOpen
			};
			a.dbReadyPromise = new E(function(s) {
				a.dbReadyResolve = s;
			}), a.openCanceller = new E(function(s, c) {
				a.cancelOpen = c;
			}), this._state = a, this.name = e, this.on = ut(this, "populate", "blocked", "versionchange", "close", { ready: [en, N] }), this.on.ready.subscribe = Un(this.on.ready.subscribe, function(s) {
				return function(c, h) {
					t.vip(function() {
						var l = r._state;
						if (l.openComplete) l.dbOpenError || E.resolve().then(c), h && s(c);
						else if (l.onReadyBeingFired) l.onReadyBeingFired.push(c), h && s(c);
						else {
							s(c);
							var p = r;
							h || s(function y() {
								p.on.ready.unsubscribe(c), p.on.ready.unsubscribe(y);
							});
						}
					});
				};
			}), this.Collection = Ki(this), this.Table = Pi(this), this.Transaction = Li(this), this.Version = oo(this), this.WhereClause = ji(this), this.on("versionchange", function(s) {
				s.newVersion > 0 ? console.warn("Another connection wants to upgrade database '".concat(r.name, "'. Closing db now to resume the upgrade.")) : console.warn("Another connection wants to delete database '".concat(r.name, "'. Closing db now to resume the delete request.")), r.close({ disableAutoOpen: !1 });
			}), this.on("blocked", function(s) {
				!s.newVersion || s.newVersion < s.oldVersion ? console.warn("Dexie.delete('".concat(r.name, "') was blocked")) : console.warn("Upgrade '".concat(r.name, "' blocked by other connection holding version ").concat(s.oldVersion / 10));
			}), this._maxKey = ht(n.IDBKeyRange), this._createTransaction = function(s, c, h, l) {
				return new r.Transaction(s, c, h, r._options.chromeTransactionDurability, l);
			}, this._fireOnBlocked = function(s) {
				r.on("blocked").fire(s), Ye.filter(function(c) {
					return c.name === r.name && c !== r && !c._state.vcFired;
				}).map(function(c) {
					return c.on("versionchange").fire(s);
				});
			}, this.use(go), this.use(To), this.use(wo), this.use(vo), this.use(mo);
			var u = new Proxy(this, { get: function(s, c, h) {
				if (c === "_vip") return !0;
				if (c === "table") return function(p) {
					return Lt(r.table(p), u);
				};
				var l = Reflect.get(s, c, h);
				return l instanceof pr ? Lt(l, u) : c === "tables" ? l.map(function(p) {
					return Lt(p, u);
				}) : c === "_createTransaction" ? function() {
					return Lt(l.apply(this, arguments), u);
				} : l;
			} });
			this.vip = u, o.forEach(function(s) {
				return s(r);
			});
		}
		return t.prototype.version = function(e) {
			if (isNaN(e) || e < .1) throw new O.Type("Given version is not a positive number");
			if (e = Math.round(e * 10) / 10, this.idbdb || this._state.isBeingOpened) throw new O.Schema("Cannot add version when database is open");
			this.verno = Math.max(this.verno, e);
			var n = this._versions, r = n.filter(function(i) {
				return i._cfg.version === e;
			})[0];
			return r || (r = new this.Version(e), n.push(r), n.sort(Qi), r.stores({}), this._state.autoSchema = !1, r);
		}, t.prototype._whenReady = function(e) {
			var n = this;
			return this.idbdb && (this._state.openComplete || R.letThrough || this._vip) ? e() : new E(function(r, i) {
				if (n._state.openComplete) return i(new O.DatabaseClosed(n._state.dbOpenError));
				if (!n._state.isBeingOpened) {
					if (!n._state.autoOpen) {
						i(new O.DatabaseClosed());
						return;
					}
					n.open().catch(N);
				}
				n._state.dbReadyPromise.then(r, i);
			}).then(e);
		}, t.prototype.use = function(e) {
			var n = e.stack, r = e.create, i = e.level, o = e.name;
			o && this.unuse({
				stack: n,
				name: o
			});
			var a = this._middlewares[n] || (this._middlewares[n] = []);
			return a.push({
				stack: n,
				create: r,
				level: i ?? 10,
				name: o
			}), a.sort(function(u, s) {
				return u.level - s.level;
			}), this;
		}, t.prototype.unuse = function(e) {
			var n = e.stack, r = e.name, i = e.create;
			return n && this._middlewares[n] && (this._middlewares[n] = this._middlewares[n].filter(function(o) {
				return i ? o.create !== i : r ? o.name !== r : !1;
			})), this;
		}, t.prototype.open = function() {
			var e = this;
			return Fe(we, function() {
				return fo(e);
			});
		}, t.prototype._close = function() {
			var e = this._state, n = Ye.indexOf(this);
			if (n >= 0 && Ye.splice(n, 1), this.idbdb) {
				try {
					this.idbdb.close();
				} catch {}
				this.idbdb = null;
			}
			e.isBeingOpened || (e.dbReadyPromise = new E(function(r) {
				e.dbReadyResolve = r;
			}), e.openCanceller = new E(function(r, i) {
				e.cancelOpen = i;
			}));
		}, t.prototype.close = function(e) {
			var n = (e === void 0 ? { disableAutoOpen: !0 } : e).disableAutoOpen, r = this._state;
			n ? (r.isBeingOpened && r.cancelOpen(new O.DatabaseClosed()), this._close(), r.autoOpen = !1, r.dbOpenError = new O.DatabaseClosed()) : (this._close(), r.autoOpen = this._options.autoOpen || r.isBeingOpened, r.openComplete = !1, r.dbOpenError = null);
		}, t.prototype.delete = function(e) {
			var n = this;
			e === void 0 && (e = { disableAutoOpen: !0 });
			var r = arguments.length > 0 && typeof arguments[0] != "object", i = this._state;
			return new E(function(o, a) {
				var u = function() {
					n.close(e);
					var s = n._deps.indexedDB.deleteDatabase(n.name);
					s.onsuccess = L(function() {
						uo(n._deps, n.name), o();
					}), s.onerror = fe(a), s.onblocked = n._fireOnBlocked;
				};
				if (r) throw new O.InvalidArgument("Invalid closeOptions argument to db.delete()");
				i.isBeingOpened ? i.dbReadyPromise.then(u) : u();
			});
		}, t.prototype.backendDB = function() {
			return this.idbdb;
		}, t.prototype.isOpen = function() {
			return this.idbdb !== null;
		}, t.prototype.hasBeenClosed = function() {
			var e = this._state.dbOpenError;
			return e && e.name === "DatabaseClosed";
		}, t.prototype.hasFailed = function() {
			return this._state.dbOpenError !== null;
		}, t.prototype.dynamicallyOpened = function() {
			return this._state.autoSchema;
		}, Object.defineProperty(t.prototype, "tables", {
			get: function() {
				var e = this;
				return Q(this._allTables).map(function(n) {
					return e._allTables[n];
				});
			},
			enumerable: !1,
			configurable: !0
		}), t.prototype.transaction = function() {
			var e = ho.apply(this, arguments);
			return this._transaction.apply(this, e);
		}, t.prototype._transaction = function(e, n, r) {
			var i = this, o = R.trans;
			(!o || o.db !== this || e.indexOf("!") !== -1) && (o = null);
			var a = e.indexOf("?") !== -1;
			e = e.replace("!", "").replace("?", "");
			var u, s;
			try {
				if (s = n.map(function(h) {
					var l = h instanceof i.Table ? h.name : h;
					if (typeof l != "string") throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
					return l;
				}), e == "r" || e === dn) u = dn;
				else if (e == "rw" || e == pn) u = pn;
				else throw new O.InvalidArgument("Invalid transaction mode: " + e);
				if (o) {
					if (o.mode === dn && u === pn) if (a) o = null;
					else throw new O.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
					o && s.forEach(function(h) {
						if (o && o.storeNames.indexOf(h) === -1) if (a) o = null;
						else throw new O.SubTransaction("Table " + h + " not included in parent transaction.");
					}), a && o && !o.active && (o = null);
				}
			} catch (h) {
				return o ? o._promise(null, function(l, p) {
					p(h);
				}) : q(h);
			}
			var c = Er.bind(null, this, u, s, o, r);
			return o ? o._promise(u, c, "lock") : R.trans ? Fe(R.transless, function() {
				return i._whenReady(c);
			}) : this._whenReady(c);
		}, t.prototype.table = function(e) {
			if (!ne(this._allTables, e)) throw new O.InvalidTable("Table ".concat(e, " does not exist"));
			return this._allTables[e];
		}, t;
	})(), Co = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable", Po = (function() {
		function t(e) {
			this._subscribe = e;
		}
		return t.prototype.subscribe = function(e, n, r) {
			return this._subscribe(!e || typeof e == "function" ? {
				next: e,
				error: n,
				complete: r
			} : e);
		}, t.prototype[Co] = function() {
			return this;
		}, t;
	})(), Wt;
	try {
		Wt = {
			indexedDB: ee.indexedDB || ee.mozIndexedDB || ee.webkitIndexedDB || ee.msIndexedDB,
			IDBKeyRange: ee.IDBKeyRange || ee.webkitIDBKeyRange
		};
	} catch {
		Wt = {
			indexedDB: null,
			IDBKeyRange: null
		};
	}
	function Ro(t) {
		var e = !1, n, r = new Po(function(i) {
			var o = Xt(t);
			function a(w) {
				var d = qe();
				try {
					o && He();
					var g = be(t, w);
					return o && (g = g.finally(_e)), g;
				} finally {
					d && Ge();
				}
			}
			var u = !1, s, c = {}, h = {}, l = {
				get closed() {
					return u;
				},
				unsubscribe: function() {
					u || (u = !0, s && s.abort(), p && ke.storagemutated.unsubscribe(v));
				}
			};
			i.start && i.start(l);
			var p = !1, y = function() {
				return ln(m);
			};
			function f() {
				return Cn(h, c);
			}
			var v = function(w) {
				Nt(c, w), f() && y();
			}, m = function() {
				if (!(u || !Wt.indexedDB)) {
					c = {};
					var w = {};
					s && s.abort(), s = new AbortController();
					var d = {
						subscr: w,
						signal: s.signal,
						requery: y,
						querier: t,
						trans: null
					}, g = a(d);
					Promise.resolve(g).then(function(b) {
						e = !0, n = b, !(u || d.signal.aborted) && (c = {}, h = w, !ii(h) && !p && (ke(ft, v), p = !0), ln(function() {
							return !u && i.next && i.next(b);
						}));
					}, function(b) {
						e = !1, ["DatabaseClosedError", "AbortError"].includes(b?.name) || u || ln(function() {
							u || i.error && i.error(b);
						});
					});
				}
			};
			return setTimeout(y, 0), l;
		});
		return r.hasValue = function() {
			return e;
		}, r.getValue = function() {
			return n;
		}, r;
	}
	var Ve = vt;
	je(Ve, K(K({}, wt), {
		delete: function(t) {
			return new Ve(t, { addons: [] }).delete();
		},
		exists: function(t) {
			return new Ve(t, { addons: [] }).open().then(function(e) {
				return e.close(), !0;
			}).catch("NoSuchDatabaseError", function() {
				return !1;
			});
		},
		getDatabaseNames: function(t) {
			try {
				return ao(Ve.dependencies).then(t);
			} catch {
				return q(new O.MissingAPI());
			}
		},
		defineClass: function() {
			function t(e) {
				re(this, e);
			}
			return t;
		},
		ignoreTransaction: function(t) {
			return R.trans ? Fe(R.transless, t) : t();
		},
		vip: An,
		async: function(t) {
			return function() {
				try {
					var e = Fn(t.apply(this, arguments));
					return !e || typeof e.then != "function" ? E.resolve(e) : e;
				} catch (n) {
					return q(n);
				}
			};
		},
		spawn: function(t, e, n) {
			try {
				var r = Fn(t.apply(n, e || []));
				return !r || typeof r.then != "function" ? E.resolve(r) : r;
			} catch (i) {
				return q(i);
			}
		},
		currentTransaction: { get: function() {
			return R.trans || null;
		} },
		waitFor: function(t, e) {
			var n = E.resolve(typeof t == "function" ? Ve.ignoreTransaction(t) : t).timeout(e || 6e4);
			return R.trans ? R.trans.waitFor(n) : n;
		},
		Promise: E,
		debug: {
			get: function() {
				return le;
			},
			set: function(t) {
				er(t);
			}
		},
		derive: ze,
		extend: re,
		props: je,
		override: Un,
		Events: ut,
		on: ke,
		liveQuery: Ro,
		extendObservabilitySet: Nt,
		getByKeyPath: de,
		setByKeyPath: ie,
		delByKeyPath: ti,
		shallowClone: Gn,
		deepClone: Me,
		getObjectDiff: Kn,
		cmp: B,
		asap: qn,
		minKey: hn,
		addons: [],
		connections: Ye,
		errnames: Zt,
		dependencies: Wt,
		cache: Be,
		semVer: cr,
		version: cr.split(".").map(function(t) {
			return parseInt(t);
		}).reduce(function(t, e, n) {
			return t + e / Math.pow(10, n * 2);
		})
	})), Ve.maxKey = ht(Ve.dependencies.IDBKeyRange), typeof dispatchEvent < "u" && typeof addEventListener < "u" && (ke(ft, function(t) {
		if (!xe) {
			var e = new CustomEvent(gn, { detail: t });
			xe = !0, dispatchEvent(e), xe = !1;
		}
	}), addEventListener(gn, function(t) {
		var e = t.detail;
		xe || Vn(e);
	}));
	function Vn(t) {
		var e = xe;
		try {
			xe = !0, ke.storagemutated.fire(t), On(t, !0);
		} finally {
			xe = e;
		}
	}
	var xe = !1, Ee, $n = function() {};
	typeof BroadcastChannel < "u" && ($n = function() {
		Ee = new BroadcastChannel(gn), Ee.onmessage = function(t) {
			return t.data && Vn(t.data);
		};
	}, $n(), typeof Ee.unref == "function" && Ee.unref(), ke(ft, function(t) {
		xe || Ee.postMessage(t);
	})), typeof addEventListener < "u" && (addEventListener("pagehide", function(t) {
		if (!vt.disableBfCache && t.persisted) {
			le && console.debug("Dexie: handling persisted pagehide"), Ee?.close();
			for (var e = 0, n = Ye; e < n.length; e++) n[e].close({ disableAutoOpen: !1 });
		}
	}), addEventListener("pageshow", function(t) {
		!vt.disableBfCache && t.persisted && (le && console.debug("Dexie: handling persisted pageshow"), $n(), Vn({ all: new te(-Infinity, [[]]) }));
	})), E.rejectionMapper = li, er(le);
	const Oo = "LittleWhiteBox_Memory", Fo = 3, Je = new vt(Oo);
	Je.version(Fo).stores({
		meta: "chatId",
		chunks: "[chatId+chunkId], chatId, [chatId+floor]",
		chunkVectors: "[chatId+chunkId], chatId",
		eventVectors: "[chatId+eventId], chatId",
		stateVectors: "[chatId+atomId], chatId, [chatId+floor]"
	});
	const Ko = Je.meta, Do = Je.chunks, Bo = Je.chunkVectors, Vo = Je.eventVectors, $o = Je.stateVectors;
	function ue(t) {
		return t ? t instanceof Float32Array ? t : t instanceof ArrayBuffer ? new Float32Array(t) : ArrayBuffer.isView(t) ? new Float32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4)) : Array.isArray(t) ? new Float32Array(t) : null : null;
	}
	function No(t) {
		return t ? t instanceof ArrayBuffer ? t : ArrayBuffer.isView(t) ? t.buffer.slice(t.byteOffset, t.byteOffset + t.byteLength) : Array.isArray(t) ? new Float32Array(t).buffer : null : null;
	}
	function Nn(t, e) {
		const n = ue(t), r = ue(e);
		if (!n?.length || !r?.length || n.length !== r.length) return 0;
		let i = 0, o = 0, a = 0;
		for (let u = 0; u < n.length; u++) i += n[u] * r[u], o += n[u] * n[u], a += r[u] * r[u];
		return o && a ? i / (Math.sqrt(o) * Math.sqrt(a)) : 0;
	}
	function jo(t = [], e) {
		const n = [], r = ue(e);
		if (!r?.length) return n;
		for (const i of t || []) i?.atomId && n.push({
			atomId: i.atomId,
			floor: i.floor,
			similarity: Nn(r, i.vector)
		});
		return n.sort((i, o) => o.similarity - i.similarity), n;
	}
	function zo(t = [], e) {
		const n = [], r = ue(e);
		if (!r?.length) return n;
		for (const i of t || []) i?.eventId && n.push({
			eventId: i.eventId,
			similarity: Nn(r, i.vector)
		});
		return n.sort((i, o) => o.similarity - i.similarity), n;
	}
	function Lo(t = [], e = [], n) {
		const r = performance.now(), i = {
			requestedFloors: 0,
			chunkCount: t?.length || 0,
			vectorHits: 0,
			missingVectors: 0,
			chunkFetchTime: 0,
			vectorFetchTime: 0,
			deserializeTime: 0,
			scoreTime: 0,
			sortTime: 0,
			totalTime: 0,
			chunkCacheHits: 0,
			chunkCacheMisses: 0,
			vectorCacheHits: 0,
			vectorCacheMisses: 0,
			cacheFallbackDbTime: 0,
			cacheWarm: !0,
			backend: "runtime"
		}, o = [], a = ue(n);
		if (!a?.length || !t?.length) return i.totalTime = Math.round(performance.now() - r), {
			result: o,
			stats: i
		};
		const u = performance.now(), s = /* @__PURE__ */ new Map();
		for (const l of e || []) {
			if (!l?.chunkId) continue;
			const p = ue(l.vector);
			p?.length && s.set(l.chunkId, p);
		}
		i.deserializeTime = Math.round(performance.now() - u), i.vectorHits = s.size, i.missingVectors = Math.max(0, t.length - s.size);
		const c = performance.now();
		for (const l of t) {
			const p = s.get(l.chunkId);
			o.push({
				chunkId: l.chunkId,
				floor: l.floor,
				chunkIdx: l.chunkIdx,
				speaker: l.speaker,
				isUser: l.isUser,
				text: l.text,
				_cosineScore: p?.length ? Nn(a, p) : 0,
				_vectorPresent: !!p?.length
			});
		}
		i.scoreTime = Math.round(performance.now() - c);
		const h = performance.now();
		return o.sort((l, p) => {
			const y = Number(l.floor || 0) - Number(p.floor || 0);
			return y !== 0 ? y : p._cosineScore - l._cosineScore;
		}), i.sortTime = Math.round(performance.now() - h), i.totalTime = Math.round(performance.now() - r), {
			result: o,
			stats: i
		};
	}
	const jn = "diffusion", Or = { info() {} }, H = {
		ALPHA: .15,
		EPSILON: 1e-5,
		MAX_ITER: 50,
		GAMMA: {
			what: .4,
			rSem: .4,
			who: .1,
			where: .05,
			time: .05
		},
		R_SEM_MIN_SIM: .62,
		R_SEM_TOPK: 8,
		TIME_WINDOW_MAX: 80,
		TIME_DECAY_DIVISOR: 12,
		WHERE_MAX_GROUP_SIZE: 16,
		WHERE_FREQ_DAMP_PIVOT: 6,
		WHERE_FREQ_DAMP_MIN: .2,
		COSINE_GATE: .46,
		SCORE_FLOOR: .1,
		DIFFUSION_CAP: 100
	};
	function Ze(t) {
		return String(t || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim().toLowerCase();
	}
	function Fr(t, e) {
		if (!t?.length || !e?.length || t.length !== e.length) return 0;
		let n = 0, r = 0, i = 0;
		for (let o = 0; o < t.length; o++) n += t[o] * e[o], r += t[o] * t[o], i += e[o] * e[o];
		return r && i ? n / (Math.sqrt(r) * Math.sqrt(i)) : 0;
	}
	function Wo(t, e = /* @__PURE__ */ new Set()) {
		const n = /* @__PURE__ */ new Set();
		for (const r of t.edges || []) {
			const i = Ze(r?.s), o = Ze(r?.t);
			i && !e.has(i) && n.add(i), o && !e.has(o) && n.add(o);
		}
		return n;
	}
	function Uo(t, e = /* @__PURE__ */ new Set()) {
		const n = /* @__PURE__ */ new Set();
		for (const r of t.edges || []) {
			const i = Ze(r?.s), o = Ze(r?.t);
			if (i && o && !e.has(i) && !e.has(o)) {
				const a = [i, o].sort().join("↔");
				n.add(a);
			}
		}
		return n;
	}
	function qo(t) {
		return Ze(t.where);
	}
	function Go(t, e) {
		const n = Number(t?.floor || 0), r = Number(e?.floor || 0);
		return Math.abs(n - r);
	}
	function Ho(t) {
		return Math.exp(-t / H.TIME_DECAY_DIVISOR);
	}
	function Yo(t, e) {
		if (!t.size || !e.size) return 0;
		let n = 0;
		const [r, i] = t.size <= e.size ? [t, e] : [e, t];
		for (const a of r) i.has(a) && n++;
		const o = t.size + e.size - n;
		return o > 0 ? n / o : 0;
	}
	function Qo(t, e) {
		if (!t.size || !e.size) return 0;
		let n = 0;
		const [r, i] = t.size <= e.size ? [t, e] : [e, t];
		for (const o of r) i.has(o) && n++;
		return n / r.size;
	}
	function Xo(t, e = /* @__PURE__ */ new Set()) {
		return t.map((n) => ({
			entities: Wo(n, e),
			interactionPairs: Uo(n, e),
			location: qo(n)
		}));
	}
	function Jo(t) {
		const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
		for (let r = 0; r < t.length; r++) {
			for (const o of t[r].interactionPairs) e.has(o) || e.set(o, []), e.get(o).push(r);
			const i = t[r].location;
			i && n.set(i, (n.get(i) || 0) + 1);
		}
		return {
			whatIndex: e,
			locationFreq: n
		};
	}
	function Zo(t, e, n, r) {
		let i = 0;
		for (const o of t.values()) {
			const a = o.map((s) => ({
				idx: s,
				floor: Number(r[s]?.floor || 0)
			})).sort((s, c) => s.floor - c.floor), u = [];
			for (let s = 0; s < a.length; s++) for (let c = s + 1; c < a.length && !(a[c].floor - a[s].floor > H.TIME_WINDOW_MAX); c++) {
				const h = Math.min(a[s].idx, a[c].idx), l = Math.max(a[s].idx, a[c].idx);
				u.push(h * n + l);
			}
			i += o.length * (o.length - 1) / 2 - u.length, u.sort((s, c) => s - c);
			for (const s of u) e.add(s);
		}
		return i;
	}
	function ea(t, e = [], n = /* @__PURE__ */ new Set(), r = Or) {
		const i = t.length, o = performance.now(), a = Xo(t, n), { whatIndex: u, locationFreq: s } = Jo(a), c = /* @__PURE__ */ new Set(), h = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Set(), y = Zo(u, c, i, t), f = new Map((e || []).filter((S) => S?.atomId && S?.rVector?.length).map((S) => [S.atomId, S.rVector])), v = t.map((S) => f.get(S.atomId) || null), m = Array.from({ length: i }, () => []);
		let w = 0, d = 0, g = 0;
		const b = t.map((S, C) => ({
			idx: C,
			floor: Number(S?.floor || 0)
		})).sort((S, C) => S.floor - C.floor);
		for (let S = 0; S < b.length; S++) {
			const C = b[S].idx, x = b[S].floor;
			for (let $ = S + 1; $ < b.length && !(b[$].floor - x > H.TIME_WINDOW_MAX); $++) {
				const D = b[$].idx, j = v[C], W = v[D];
				if (!j?.length || !W?.length) continue;
				const z = Fr(j, W);
				z < H.R_SEM_MIN_SIM || (m[C].push({
					target: D,
					sim: z
				}), m[D].push({
					target: C,
					sim: z
				}), w += z, d++);
			}
		}
		for (let S = 0; S < i; S++) {
			const C = m[S];
			if (C.length) {
				C.sort((x, $) => $.sim - x.sim), C.length > H.R_SEM_TOPK && (g += C.length - H.R_SEM_TOPK);
				for (const x of C.slice(0, H.R_SEM_TOPK)) {
					const $ = Math.min(S, x.target), D = Math.max(S, x.target), j = $ * i + D;
					h.add(j);
					const W = l.get(j) || 0;
					x.sim > W && l.set(j, x.sim);
				}
			}
		}
		for (const S of c) p.add(S);
		for (const S of h) p.add(S);
		const _ = Array.from({ length: i }, () => []);
		let I = 0;
		const A = {
			what: 0,
			where: 0,
			rSem: 0,
			who: 0
		};
		let M = 0, P = 0;
		for (const S of p) {
			const C = Math.floor(S / i), x = S % i, $ = Ho(Go(t[C], t[x])), D = a[C], j = a[x], W = Qo(D.interactionPairs, j.interactionPairs), z = l.get(S) || 0, G = Yo(D.entities, j.entities);
			let Z = 0;
			if (D.location && D.location === j.location) {
				const V = s.get(D.location) || 1;
				Z = Math.max(H.WHERE_FREQ_DAMP_MIN, Math.min(1, H.WHERE_FREQ_DAMP_PIVOT / Math.max(1, V)));
			}
			const se = H.GAMMA.what * W + H.GAMMA.rSem * z + H.GAMMA.who * G + H.GAMMA.where * Z + H.GAMMA.time * $;
			se > 0 && (_[C].push({
				target: x,
				weight: se
			}), _[x].push({
				target: C,
				weight: se
			}), I++, W > 0 && A.what++, z > 0 && A.rSem++, G > 0 && A.who++, Z > 0 && A.where++, G > 0 && M++, Z > 0 && P++);
		}
		const T = Math.round(performance.now() - o);
		r.info(jn, `Graph: ${i} nodes, ${I} edges (candidate_by_what=${c.size} candidate_by_r_sem=${h.size}) (what=${A.what} r_sem=${A.rSem} who=${A.who} where=${A.where}) (reweight_who_used=${M} reweight_where_used=${P}) (what_window_skipped_occurrences=${y} topk_pruned=${g}) (${T}ms)`);
		const F = i > 1 ? i * (i - 1) / 2 : 0, k = F > 0 ? Number((I / F * 100).toFixed(2)) : 0;
		return {
			neighbors: _,
			edgeCount: I,
			channelStats: A,
			buildTime: T,
			candidatePairs: p.size,
			pairsFromWhat: c.size,
			pairsFromRSem: h.size,
			rSemAvgSim: d ? Number((w / d).toFixed(3)) : 0,
			whatWindowSkippedOccurrences: y,
			topKPrunedPairs: g,
			reweightWhoUsed: M,
			reweightWhereUsed: P,
			edgeDensity: k
		};
	}
	function ta(t, e, n) {
		const r = new Float64Array(n);
		let i = 0;
		for (const o of t) {
			const a = e.get(o.atomId);
			if (a == null) continue;
			const u = Math.max(0, o.rerankScore || o.similarity || 0);
			r[a] += u, i += u;
		}
		if (i > 0) for (let o = 0; o < n; o++) r[o] /= i;
		return r;
	}
	function na(t, e) {
		const n = Array.from({ length: e }, () => []), r = [];
		for (let i = 0; i < e; i++) {
			const o = t[i];
			let a = 0;
			for (let s = 0; s < o.length; s++) a += o[s].weight;
			if (a <= 0) {
				r.push(i);
				continue;
			}
			const u = n[i];
			for (let s = 0; s < o.length; s++) u.push({
				target: o[s].target,
				prob: o[s].weight / a
			});
		}
		return {
			columns: n,
			dangling: r
		};
	}
	function ra(t, e, n, r) {
		const i = H.ALPHA, o = 1 - i, a = H.EPSILON, u = H.MAX_ITER;
		let s = new Float64Array(r);
		for (let l = 0; l < r; l++) s[l] = e[l];
		let c = 0, h = 0;
		for (let l = 0; l < u; l++) {
			const p = new Float64Array(r);
			let y = 0;
			for (let m = 0; m < n.length; m++) y += s[n[m]];
			for (let m = 0; m < r; m++) {
				const w = s[m];
				if (w === 0) continue;
				const d = t[m], g = o * w;
				for (let b = 0; b < d.length; b++) p[d[b].target] += g * d[b].prob;
			}
			const f = i + o * y;
			for (let m = 0; m < r; m++) p[m] += f * e[m];
			let v = 0;
			for (let m = 0; m < r; m++) v += Math.abs(p[m] - s[m]);
			if (s = p, c = l + 1, h = v, v < a) break;
		}
		return {
			pi: s,
			iterations: c,
			finalError: h
		};
	}
	function ia(t, e, n, r, i, o) {
		const a = e.length, u = {
			passed: 0,
			filtered: 0,
			noVector: 0
		};
		let s = 0;
		for (let h = 0; h < a; h++) t[h] > 0 && !r.has(e[h]) && t[h] > s && (s = t[h]);
		if (s <= 0) return {
			diffused: [],
			gateStats: u
		};
		const c = [];
		for (let h = 0; h < a; h++) {
			const l = e[h];
			if (r.has(l) || t[h] <= 0) continue;
			const p = i.get(l);
			if (!p?.length) {
				u.noVector++;
				continue;
			}
			const y = Fr(o, p);
			if (y < H.COSINE_GATE) {
				u.filtered++;
				continue;
			}
			const f = t[h] / s, v = f * y;
			if (v < H.SCORE_FLOOR) {
				u.filtered++;
				continue;
			}
			u.passed++;
			const m = n.get(l);
			m && c.push({
				atomId: l,
				floor: m.floor,
				atom: m,
				finalScore: v,
				pprScore: t[h],
				pprNormalized: f,
				cosine: y
			});
		}
		return c.sort((h, l) => l.finalScore - h.finalScore), {
			diffused: c.slice(0, H.DIFFUSION_CAP),
			gateStats: u
		};
	}
	function oa(t, e, n, r, i, o = {}) {
		const a = performance.now(), u = o?.logger || Or;
		if (!t?.length || !e?.length || !r?.length) return Kr(i), [];
		const { name1: s } = o || {}, c = /* @__PURE__ */ new Set();
		s && c.add(Ze(s));
		const h = performance.now(), l = /* @__PURE__ */ new Map(), p = [], y = /* @__PURE__ */ new Map();
		for (let V = 0; V < e.length; V++) {
			const ye = e[V];
			l.set(ye.atomId, ye), p.push(ye.atomId), y.set(ye.atomId, V);
		}
		const f = e.length, v = Math.round(performance.now() - h), m = t.filter((V) => y.has(V.atomId)), w = new Set(m.map((V) => V.atomId));
		if (!m.length) return Kr(i), [];
		const d = ea(e, n, c, u);
		if (d.edgeCount === 0) return Dr(i, {
			seedCount: m.length,
			graphNodes: f,
			graphEdges: 0,
			channelStats: d.channelStats,
			candidatePairs: d.candidatePairs,
			pairsFromWhat: d.pairsFromWhat,
			pairsFromRSem: d.pairsFromRSem,
			rSemAvgSim: d.rSemAvgSim,
			whatWindowSkippedOccurrences: d.whatWindowSkippedOccurrences,
			topKPrunedPairs: d.topKPrunedPairs,
			edgeDensity: d.edgeDensity,
			reweightWhoUsed: d.reweightWhoUsed,
			reweightWhereUsed: d.reweightWhereUsed,
			indexTime: v,
			time: d.buildTime
		}), u.info(jn, "No graph edges - skipping diffusion"), [];
		const g = performance.now(), b = ta(m, y, f), _ = Math.round(performance.now() - g), I = performance.now(), { columns: A, dangling: M } = na(d.neighbors, f), P = Math.round(performance.now() - I), T = performance.now(), { pi: F, iterations: k, finalError: S } = ra(A, b, M, f), C = Math.round(performance.now() - T);
		let x = 0;
		for (let V = 0; V < f; V++) F[V] > 0 && !w.has(p[V]) && x++;
		const $ = performance.now(), D = /* @__PURE__ */ new Map();
		for (const V of n || []) D.set(V.atomId, V.vector);
		const j = Math.round(performance.now() - $), W = performance.now(), { diffused: z, gateStats: G } = ia(F, p, l, w, D, r), Z = Math.round(performance.now() - W), se = Math.round(performance.now() - a);
		return Dr(i, {
			seedCount: m.length,
			graphNodes: f,
			graphEdges: d.edgeCount,
			channelStats: d.channelStats,
			candidatePairs: d.candidatePairs,
			pairsFromWhat: d.pairsFromWhat,
			pairsFromRSem: d.pairsFromRSem,
			rSemAvgSim: d.rSemAvgSim,
			whatWindowSkippedOccurrences: d.whatWindowSkippedOccurrences,
			topKPrunedPairs: d.topKPrunedPairs,
			edgeDensity: d.edgeDensity,
			reweightWhoUsed: d.reweightWhoUsed,
			reweightWhereUsed: d.reweightWhereUsed,
			indexTime: v,
			buildTime: d.buildTime,
			seedVectorTime: _,
			normalizeTime: P,
			iterations: k,
			convergenceError: S,
			pprTime: C,
			pprActivated: x,
			cosineGatePassed: G.passed,
			cosineGateFiltered: G.filtered,
			cosineGateNoVector: G.noVector,
			vectorMapTime: j,
			postVerifyTime: Z,
			postGatePassRate: x > 0 ? Math.round(G.passed / x * 100) : 0,
			finalCount: z.length,
			scoreDistribution: z.length > 0 ? aa(z.map((V) => V.finalScore)) : {
				min: 0,
				max: 0,
				mean: 0
			},
			time: se
		}), u.info(jn, `Diffusion: ${m.length} seeds → graph(${f}n/${d.edgeCount}e) → PPR(${k}it, ε=${S.toExponential(1)}, ${C}ms) → ${x} activated → gate(${G.passed}✓/${G.filtered}✗${G.noVector ? `/${G.noVector}?` : ""}) → ${z.length} final (index=${v}ms graph=${d.buildTime}ms seed=${_}ms normalize=${P}ms ppr=${C}ms vectorMap=${j}ms post=${Z}ms total=${se}ms)`), z;
	}
	function aa(t) {
		if (!t.length) return {
			min: 0,
			max: 0,
			mean: 0
		};
		const e = [...t].sort((r, i) => r - i), n = e.reduce((r, i) => r + i, 0);
		return {
			min: Number(e[0].toFixed(3)),
			max: Number(e[e.length - 1].toFixed(3)),
			mean: Number((n / e.length).toFixed(3))
		};
	}
	function Kr(t) {
		t && (t.diffusion = {
			seedCount: 0,
			graphNodes: 0,
			graphEdges: 0,
			iterations: 0,
			convergenceError: 0,
			pprActivated: 0,
			cosineGatePassed: 0,
			cosineGateFiltered: 0,
			cosineGateNoVector: 0,
			finalCount: 0,
			scoreDistribution: {
				min: 0,
				max: 0,
				mean: 0
			},
			byChannel: {
				what: 0,
				where: 0,
				rSem: 0,
				who: 0
			},
			candidatePairs: 0,
			pairsFromWhat: 0,
			pairsFromRSem: 0,
			rSemAvgSim: 0,
			whatWindowSkippedOccurrences: 0,
			topKPrunedPairs: 0,
			edgeDensity: 0,
			reweightWhoUsed: 0,
			reweightWhereUsed: 0,
			indexTime: 0,
			buildTime: 0,
			seedVectorTime: 0,
			normalizeTime: 0,
			pprTime: 0,
			vectorMapTime: 0,
			postVerifyTime: 0,
			postGatePassRate: 0,
			time: 0
		});
	}
	function Dr(t, e) {
		t && (t.diffusion = {
			seedCount: e.seedCount || 0,
			graphNodes: e.graphNodes || 0,
			graphEdges: e.graphEdges || 0,
			iterations: e.iterations || 0,
			convergenceError: e.convergenceError || 0,
			pprActivated: e.pprActivated || 0,
			cosineGatePassed: e.cosineGatePassed || 0,
			cosineGateFiltered: e.cosineGateFiltered || 0,
			cosineGateNoVector: e.cosineGateNoVector || 0,
			postGatePassRate: e.postGatePassRate || 0,
			finalCount: e.finalCount || 0,
			scoreDistribution: e.scoreDistribution || {
				min: 0,
				max: 0,
				mean: 0
			},
			byChannel: e.channelStats || {
				what: 0,
				where: 0,
				rSem: 0,
				who: 0
			},
			candidatePairs: e.candidatePairs || 0,
			pairsFromWhat: e.pairsFromWhat || 0,
			pairsFromRSem: e.pairsFromRSem || 0,
			rSemAvgSim: e.rSemAvgSim || 0,
			whatWindowSkippedOccurrences: e.whatWindowSkippedOccurrences || 0,
			topKPrunedPairs: e.topKPrunedPairs || 0,
			edgeDensity: e.edgeDensity || 0,
			reweightWhoUsed: e.reweightWhoUsed || 0,
			reweightWhereUsed: e.reweightWhereUsed || 0,
			indexTime: e.indexTime || 0,
			buildTime: e.buildTime || 0,
			seedVectorTime: e.seedVectorTime || 0,
			normalizeTime: e.normalizeTime || 0,
			pprTime: e.pprTime || 0,
			vectorMapTime: e.vectorMapTime || 0,
			postVerifyTime: e.postVerifyTime || 0,
			time: e.time || 0
		});
	}
	const sa = Object.freeze({
		maxProtectedEvents: 5,
		maxCandidateShare: .4,
		maxEvidenceBudgetShare: .4
	});
	function Br(t) {
		return String(t || "").replace(/\s+/g, "").replace(/：/g, ":");
	}
	function ua(t) {
		const e = String(t || "").match(/\(#(\d+)(?:-(\d+))?\)/);
		return e ? {
			start: Math.max(0, Number(e[1]) - 1),
			end: Math.max(0, Number(e[2] || e[1]) - 1)
		} : null;
	}
	function ca(t, e) {
		const n = Math.max(0, Math.floor(Number(t) || 0)), r = Number(e);
		return Math.floor(n * (Number.isFinite(r) ? Math.max(0, Math.min(1, r)) : 0));
	}
	function la(t, e) {
		return e?.marker ? e.querySpeaker === "user" ? t?.isUser === !0 && (e.userFloors || []).includes(t.floor) : e.querySpeaker === "assistant" ? t?.isUser !== !0 && (e.assistantFloors || []).includes(t.floor) : Br(t?.text).includes(Br(e.marker)) : !1;
	}
	const ce = Object.freeze({
		perLane: 3,
		shortlistPerSource: 32,
		minSimilarity: .5,
		lambda: .85,
		rrfK: 60,
		admissionBatchSize: 3
	});
	function Vr(t) {
		const e = ue(t);
		if (!e?.length) return null;
		let n = 0;
		for (const o of e) {
			if (!Number.isFinite(o)) return null;
			n += o * o;
		}
		if (!n) return null;
		const r = Math.sqrt(n), i = new Float32Array(e.length);
		for (let o = 0; o < e.length; o++) i[o] = e[o] / r;
		return i;
	}
	function $r(t, e) {
		if (!t || !e || t.length !== e.length) return 0;
		let n = 0;
		for (let r = 0; r < t.length; r++) n += t[r] * e[r];
		return n;
	}
	function $e(t, e) {
		return t.sort((n, r) => e(r) - e(n) || n.chunk.floor - r.chunk.floor || n.chunk.chunkIdx - r.chunk.chunkIdx);
	}
	function fa(t) {
		const e = ce, n = $e(t.filter((i) => i.queryScore >= e.minSimilarity), (i) => i.queryScore), r = $e(t.filter((i) => i.lexicalScore > 0), (i) => i.lexicalScore);
		for (const i of [n, r]) for (const [o, a] of i.entries()) a.conversationScore += (e.rrfK + 1) / (e.rrfK + o + 1) / 2;
		return {
			queryRows: n,
			conversationRows: $e(t.filter((i) => i.conversationScore > 0), (i) => i.conversationScore),
			lexicalRows: r,
			temporalRows: t.filter((i) => i.temporal).sort((i, o) => o.conversationScore - i.conversationScore || o.queryScore - i.queryScore || i.chunk.floor - o.chunk.floor || i.chunk.chunkIdx - o.chunk.chunkIdx),
			selected: []
		};
	}
	function Nr(t, e) {
		const n = /* @__PURE__ */ new Map();
		for (const r of t) {
			let i = 0;
			for (const o of r) if (e(o) && (n.set(o.chunk.chunkId, o), ++i >= ce.shortlistPerSource)) break;
		}
		return [...n.values()];
	}
	async function ha(t, e, n, r, i, o) {
		const a = (l) => !n.has(l.chunk.chunkId), u = (l) => a(l) && r(l);
		if (e === 0) {
			const l = t.temporalRows.find(u);
			if (l) return l;
		}
		const s = [...new Map([...Nr([t.conversationRows, t.lexicalRows], a), ...Nr([t.temporalRows], u)].map((l) => [l.chunk.chunkId, l])).values()];
		let c = null, h = -Infinity;
		e > 0 && (o.maxMmrCandidates = Math.max(o.maxMmrCandidates, s.length));
		for (const [l, p] of s.entries()) {
			l % 32 === 0 && await i();
			const y = p.conversationScore;
			let f = 0;
			if (e > 0) for (const m of t.selected) f = Math.max(f, $r(p.vector, m.vector)), o.mmrComparisons++;
			const v = ce.lambda * y - (1 - ce.lambda) * f;
			v > h && (c = p, h = v);
		}
		return c;
	}
	function da(t, e, n) {
		const r = [
			{
				items: e,
				limit: n
			},
			{
				items: t.filter((a) => a.evidenceLane === "floor"),
				limit: Infinity
			},
			{
				items: t.filter((a) => a.evidenceLane === "conversation"),
				limit: Infinity
			}
		].map((a) => ({
			...a,
			cursor: 0,
			emitted: 0
		})), i = /* @__PURE__ */ new Set(), o = [];
		for (; r.some((a) => a.cursor < a.items.length && a.emitted < a.limit);) for (const a of r) {
			let u = 0;
			for (; a.cursor < a.items.length && a.emitted < a.limit && u < ce.admissionBatchSize;) {
				const s = a.items[a.cursor++];
				i.has(s.chunkId) || (i.add(s.chunkId), o.push(s), a.emitted++, u++);
			}
		}
		return o;
	}
	function jr(t, e, n) {
		return {
			...t.chunk,
			evidenceLane: e,
			queryScore: t.queryScore,
			lexicalScore: t.lexicalScore,
			_directEvidenceTemporalMatch: t.temporal,
			_directEvidenceTemporalCarrier: n,
			_directEvidencePassedMinScore: t.queryScore >= ce.minSimilarity || t.lexicalScore > 0
		};
	}
	async function pa(t, e, n = {}) {
		const r = Vr(n.queryVector), i = new Map((n.lexicalScores || []).map((k) => [k.chunkId, Number(k.score) || 0])), o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map(), c = [], h = [], l = {
			parents: 0,
			floors: 0,
			sourceCandidates: 0,
			vectorHits: 0,
			missingVectors: 0,
			queryItems: 0,
			floorItems: 0,
			conversationItems: 0,
			lexicalItems: 0,
			temporalCandidates: 0,
			temporalFloorWinners: 0,
			temporalProtectedCandidates: 0,
			maxMmrCandidates: 0,
			mmrComparisons: 0
		}, p = () => {
			if (n.signal?.throwIfAborted(), n.isCurrent && !n.isCurrent()) throw new DOMException("Recall session released", "AbortError");
		};
		let y = performance.now();
		const f = async () => {
			performance.now() - y >= 8 && (await new Promise((k) => setTimeout(k, 0)), y = performance.now()), p();
		}, v = [];
		for (const k of t || []) {
			p();
			const S = k?.event, C = ua(S?.summary);
			!S?.id || u.has(S.id) || !C || C.end < C.start || (u.add(S.id), l.parents++, v.push(C));
		}
		const m = new Set((n.sourceTurns || []).flatMap((k) => [k.floor, k.contextFloor].filter(Number.isInteger)));
		let w = 0;
		for (const [k, S] of e.chunksByFloor) {
			if (await f(), Number.isInteger(n.hiddenThrough) && k > n.hiddenThrough || !m.has(k) && !v.some((x) => k >= x.start && k <= x.end)) continue;
			const C = [];
			for (const x of S) {
				if (!String(x.text || "").trim()) continue;
				const $ = Vr(e.chunkVectorsById.get(x.chunkId)?.vector), D = $ && (!r || $.length === r.length) ? $ : null;
				l[D ? "vectorHits" : "missingVectors"]++;
				const j = la(x, n.temporalCarrier);
				j && l.temporalCandidates++, C.push({
					chunk: x,
					vector: D,
					queryScore: $r(r, D),
					lexicalScore: i.get(x.chunkId) || 0,
					temporal: j,
					conversationScore: 0
				}), ++w % 32 === 0 && await f();
			}
			o.set(k, C);
		}
		const d = [...o.values()].flat(), g = fa(d);
		for (const k of g.temporalRows) s.has(k.chunk.floor) || s.set(k.chunk.floor, k.chunk.chunkId);
		const b = (k) => ({
			queryRows: $e(k.filter((S) => S.queryScore >= ce.minSimilarity), (S) => S.queryScore),
			lexicalRows: $e(k.filter((S) => S.lexicalScore > 0), (S) => S.lexicalScore),
			conversationRows: $e(k.filter((S) => S.conversationScore > 0), (S) => S.conversationScore),
			temporalRows: g.temporalRows.filter((S) => k.includes(S)),
			selected: []
		}), _ = /* @__PURE__ */ new Set();
		for (const k of n.sourceTurns || []) _.has(k.floor) || (_.add(k.floor), h.push(b([...o.get(k.floor) || [], ...o.get(k.contextFloor) || []])));
		const I = [...o.values()].map(b).sort((k, S) => (S.conversationRows[0]?.conversationScore || 0) - (k.conversationRows[0]?.conversationScore || 0) || (S.queryRows[0]?.queryScore || 0) - (k.queryRows[0]?.queryScore || 0) || (k.queryRows[0]?.chunk.floor || 0) - (S.queryRows[0]?.chunk.floor || 0)), A = ca(Math.max(l.parents, h.length) * ce.perLane * 2, sa.maxCandidateShare), M = (k) => s.get(k.chunk.floor) === k.chunk.chunkId && l.temporalProtectedCandidates < A, P = (k, S) => {
			const C = M(k);
			C && l.temporalProtectedCandidates++, a.add(k.chunk.chunkId), c.push(jr(k, S, C));
		};
		for (const k of h) {
			await f();
			const S = $e([...new Set([...k.queryRows, ...k.lexicalRows])], (C) => C.queryScore);
			for (const C of S.filter((x) => !a.has(x.chunk.chunkId)).slice(0, ce.perLane)) P(C, "floor");
		}
		for (let k = 0; k < ce.perLane; k++) for (const S of I) {
			const C = await ha(S, k, a, M, f, l);
			C && (S.selected.push(C), P(C, "conversation"));
		}
		const T = new Map(c.map((k) => [k.chunkId, k])), F = da(c, g.queryRows.map((k) => ({
			...T.get(k.chunk.chunkId) || jr(k, "query", !1),
			evidenceLane: "query"
		})), o.size * ce.perLane);
		return l.temporalFloorWinners = s.size, l.floors = o.size, l.sourceCandidates = d.length, l.queryItems = F.filter((k) => k.evidenceLane === "query").length, l.floorItems = F.filter((k) => k.evidenceLane === "floor").length, l.conversationItems = F.filter((k) => k.evidenceLane === "conversation").length, l.lexicalItems = F.filter((k) => k.lexicalScore > 0).length, l.candidates = l.relevantItems = F.length, p(), {
			items: F,
			stats: l,
			status: l.missingVectors ? "partial-vectors" : "applied"
		};
	}
	const va = 12e4;
	function Ut(t) {
		return String(t || "") || null;
	}
	function ma(t = {}) {
		const e = Math.max(1, Number(t.ttlMs || 12e4)), n = typeof t.now == "function" ? t.now : Date.now, r = typeof t.schedule == "function" ? t.schedule : setTimeout, i = typeof t.cancel == "function" ? t.cancel : clearTimeout, o = typeof t.onExpire == "function" ? t.onExpire : null, a = /* @__PURE__ */ new Map();
		function u(f, v, m) {
			const w = Ut(f);
			if (!w || !v) return {
				released: !1,
				chatId: w,
				leaseId: v,
				activeSessions: 0
			};
			const d = a.get(w), g = d?.get(v);
			return g ? (d.delete(v), m && i(g.timer), d.size || a.delete(w), {
				released: !0,
				chatId: w,
				leaseId: v,
				startedAt: g.startedAt,
				expiresAt: g.expiresAt,
				activeSessions: d.size
			}) : {
				released: !1,
				chatId: w,
				leaseId: v,
				activeSessions: d?.size || 0
			};
		}
		function s(f, v, m = {}) {
			const w = Ut(f);
			if (!w || !v) return null;
			u(w, v, !0);
			const d = Number(m.startedAt) || n(), g = Number(m.expiresAt) || d + e;
			let b = a.get(w);
			b || (b = /* @__PURE__ */ new Map(), a.set(w, b));
			const _ = r(() => {
				const I = u(w, v, !1);
				if (I.released) try {
					o?.(I);
				} catch {}
			}, Math.max(0, g - n()));
			return b.set(v, {
				startedAt: d,
				expiresAt: g,
				timer: _
			}), {
				chatId: w,
				leaseId: v,
				startedAt: d,
				expiresAt: g
			};
		}
		function c(f, v) {
			return u(f, v, !0);
		}
		function h(f, v) {
			const m = Ut(f);
			return !!m && !!v && a.get(m)?.has(v);
		}
		function l(f) {
			const v = Ut(f);
			return v && a.get(v)?.size || 0;
		}
		function p(f) {
			return l(f) > 0;
		}
		function y() {
			for (const f of a.values()) for (const v of f.values()) i(v.timer);
			a.clear();
		}
		return {
			add: s,
			release: c,
			hasLease: h,
			hasChat: p,
			count: l,
			clear: y
		};
	}
	const zr = "recall-runtime-worker";
	function ya() {
		return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
	}
	function Lr(t) {
		return String(t || "") || null;
	}
	function ga(t) {
		try {
			return JSON.stringify(t);
		} catch {
			try {
				return String(t);
			} catch {
				return "[unstringifiable]";
			}
		}
	}
	function me(t) {
		if (!t) return "none";
		const e = t.stats || t;
		return !e || typeof e != "object" ? ga(e) : [
			`chat=${e.chatId || "-"}`,
			`status=${e.status || "-"}`,
			`ready=${e.ready ? 1 : 0}`,
			`warming=${e.warming ? 1 : 0}`,
			`meta=${e.meta ? 1 : 0}`,
			`floors=${e.chunkFloors ?? "-"}`,
			`chunks=${e.chunks ?? "-"}`,
			`l1v=${e.chunkVectors ?? "-"}`,
			`l2v=${e.eventVectors ?? "-"}`,
			`l0v=${e.stateVectors ?? "-"}`,
			`ver=${e.version ?? "-"}`,
			`err=${e.lastError || "-"}`
		].join(" ");
	}
	function wa(t = {}) {
		if (!t || typeof t != "object") return "unknown";
		const e = [`type=${t.type || "unknown"}`];
		return Number.isFinite(Number(t.floor)) && e.push(`floor=${Number(t.floor)}`), Array.isArray(t.items) && e.push(`items=${t.items.length}`), Array.isArray(t.chunks) && e.push(`chunks=${t.chunks.length}`), Array.isArray(t.eventIds) && e.push(`eventIds=${t.eventIds.length}`), t.domain && e.push(`domain=${t.domain}`), t.meta && typeof t.meta == "object" && e.push(`metaKeys=${Object.keys(t.meta).length}`), e.join(" ");
	}
	function ae(t, e = "") {
		self.postMessage({
			type: "__log",
			payload: {
				level: "info",
				moduleId: zr,
				message: `${t}${e ? ` ${e}` : ""}`
			}
		});
	}
	function et(t, e = "") {
		self.postMessage({
			type: "__log",
			payload: {
				level: "warn",
				moduleId: zr,
				message: `${t}${e ? ` ${e}` : ""}`
			}
		});
	}
	function Wr(t) {
		return {
			chatId: t,
			meta: null,
			chunksByFloor: /* @__PURE__ */ new Map(),
			chunkVectorsById: /* @__PURE__ */ new Map(),
			eventVectorsById: /* @__PURE__ */ new Map(),
			stateVectorsById: /* @__PURE__ */ new Map(),
			ready: !1,
			warming: null,
			version: 0,
			status: "cold",
			lastError: null,
			refreshedAt: 0,
			timings: {}
		};
	}
	const Y = /* @__PURE__ */ new Map(), he = ma({
		ttlMs: va,
		onExpire({ chatId: t, leaseId: e, activeSessions: n }) {
			n || Y.delete(t), et("session expired", `chat=${t} lease=${e} active=${n}`);
		}
	});
	function tt(t, e = {}) {
		return {
			backend: "worker",
			owner: "worker",
			chatId: String(t || ""),
			ready: !1,
			warming: !1,
			status: "session-cache idle",
			lastError: null,
			refreshedAt: 0,
			version: 0,
			meta: !1,
			chunkFloors: 0,
			chunks: 0,
			chunkVectors: 0,
			eventVectors: 0,
			stateVectors: 0,
			activeSessions: 0,
			timings: {},
			...e
		};
	}
	function qt(t) {
		const e = String(t || "");
		if (!e) return null;
		let n = Y.get(e);
		return n || (n = Wr(e), Y.set(e, n), ae("entry created", `chat=${e}`)), n;
	}
	function ba(t, e) {
		return {
			...t,
			chatId: e,
			floor: Number(t?.floor),
			chunkIdx: Number(t?.chunkIdx || 0)
		};
	}
	function _a(t) {
		const e = ue(t?.vector);
		return !t?.chunkId || !e?.length ? null : {
			chunkId: t.chunkId,
			vector: e,
			fingerprint: t.fingerprint
		};
	}
	function Sa(t) {
		const e = ue(t?.vector);
		return !t?.eventId || !e?.length ? null : {
			eventId: t.eventId,
			vector: e,
			fingerprint: t.fingerprint
		};
	}
	function Ia(t) {
		const e = ue(t?.vector);
		return !t?.atomId || !e?.length ? null : {
			atomId: t.atomId,
			floor: t.floor,
			vector: e,
			rVector: t.rVector ? ue(t.rVector) : null,
			fingerprint: t.fingerprint
		};
	}
	function Ur(t, e = []) {
		for (const n of e || []) {
			const r = ba(n, t.chatId);
			if (!Number.isInteger(r.floor) || !r.chunkId) continue;
			const i = (t.chunksByFloor.get(r.floor) || []).filter((o) => o.chunkId !== r.chunkId);
			i.push(r), i.sort((o, a) => (o.chunkIdx || 0) - (a.chunkIdx || 0)), t.chunksByFloor.set(r.floor, i);
		}
	}
	function qr(t, e = []) {
		for (const n of e || []) {
			const r = _a(n);
			r && t.chunkVectorsById.set(r.chunkId, r);
		}
	}
	function Gr(t, e = []) {
		for (const n of e || []) {
			const r = Sa(n);
			r && t.eventVectorsById.set(r.eventId, r);
		}
	}
	function Hr(t, e = []) {
		for (const n of e || []) {
			const r = Ia(n);
			r && t.stateVectorsById.set(r.atomId, r);
		}
	}
	function ka(t, e = []) {
		const n = [];
		for (const r of e || []) {
			const i = t?.eventVectorsById.get(r);
			i && n.push({
				...i,
				vector: No(i.vector)
			});
		}
		return n;
	}
	function xa(t, e) {
		for (const [n, r] of [...t.chunksByFloor.entries()]) if (!(n < e)) {
			for (const i of r) t.chunkVectorsById.delete(i.chunkId);
			t.chunksByFloor.delete(n);
		}
	}
	function Ea(t, e) {
		const n = t.chunksByFloor.get(e) || [];
		for (const r of n) t.chunkVectorsById.delete(r.chunkId);
		t.chunksByFloor.delete(e), t.meta?.lastChunkFloor >= e && (t.meta = {
			...t.meta,
			lastChunkFloor: e - 1
		});
	}
	function Aa(t, e) {
		for (const [n, r] of [...t.stateVectorsById.entries()]) Number(r.floor) >= e && t.stateVectorsById.delete(n);
	}
	function Yr(t, e = "all") {
		(e === "all" || e === "chunks") && (t.chunksByFloor.clear(), t.chunkVectorsById.clear()), (e === "all" || e === "events") && t.eventVectorsById.clear(), (e === "all" || e === "state") && t.stateVectorsById.clear(), e === "all" && (t.meta = null, t.ready = !1, t.status = "cold");
	}
	function J(t) {
		if (!t) return null;
		let e = 0;
		for (const n of t.chunksByFloor.values()) e += n.length;
		return {
			backend: "worker",
			owner: "worker",
			chatId: t.chatId,
			ready: t.ready,
			warming: !!t.warming,
			status: t.status,
			lastError: t.lastError,
			refreshedAt: t.refreshedAt,
			version: t.version,
			meta: !!t.meta,
			chunkFloors: t.chunksByFloor.size,
			chunks: e,
			chunkVectors: t.chunkVectorsById.size,
			eventVectors: t.eventVectorsById.size,
			stateVectors: t.stateVectorsById.size,
			activeSessions: he.count(t.chatId),
			timings: t.timings || {}
		};
	}
	async function zn(t, e = "manual") {
		const n = qt(t);
		if (!n) return null;
		if (n.warming) return ae("refresh join in-flight", `chat=${n.chatId} reason=${e} before=${me(J(n))}`), n.warming;
		const r = n.version, i = J(n);
		return n.status = "warming", n.lastError = null, ae("refresh start", `chat=${n.chatId} reason=${e} before=${me(i)}`), n.warming = (async () => {
			const o = performance.now(), [a, u, s, c, h] = await Promise.all([
				Ko.get(n.chatId),
				Do.where("chatId").equals(n.chatId).toArray(),
				Bo.where("chatId").equals(n.chatId).toArray(),
				Vo.where("chatId").equals(n.chatId).toArray(),
				$o.where("chatId").equals(n.chatId).toArray()
			]), l = Math.round(performance.now() - o);
			if (n.version !== r) {
				n.status = n.ready ? "ready" : "stale-refresh-skipped";
				const m = {
					ready: !1,
					stale: !0,
					reason: e,
					stats: J(n)
				};
				return et("refresh stale", `chat=${n.chatId} reason=${e} startedVersion=${r} currentVersion=${n.version} after=${me(m)}`), m;
			}
			const p = Wr(n.chatId);
			p.version = n.version;
			const y = performance.now();
			p.meta = a || null, Ur(p, u), qr(p, s), Gr(p, c), Hr(p, h);
			const f = Math.round(performance.now() - y);
			if (p.ready = !0, p.status = "ready", p.refreshedAt = Date.now(), p.timings = {
				...p.timings || {},
				loadFromDBMs: l,
				buildEntryMs: f
			}, !he.hasChat(n.chatId)) {
				const m = {
					ready: !1,
					stale: !0,
					expired: !0,
					reason: e,
					stats: tt(n.chatId)
				};
				return et("refresh discarded without active session", `chat=${n.chatId} reason=${e}`), m;
			}
			Y.set(n.chatId, p);
			const v = {
				ready: !0,
				stale: !1,
				reason: e,
				stats: J(p)
			};
			return ae("refresh success", `chat=${n.chatId} reason=${e} after=${me(v)}`), v;
		})().catch((o) => {
			throw n.status = "refresh failed", n.lastError = o?.message || String(o), et("refresh failed", `chat=${n.chatId} reason=${e} after=${me(J(n))}`), o;
		}).finally(() => {
			Y.get(n.chatId) === n && (n.warming = null);
		}), n.warming;
	}
	async function Ae(t) {
		const e = qt(t);
		if (!e) return null;
		if (e.ready) return e;
		ae("ensureReady trigger refresh", `chat=${e.chatId} status=${e.status} ready=${e.ready ? 1 : 0}`);
		const n = await zn(t, "ensure-ready");
		return n?.expired ? null : (n?.ready || (et("ensureReady retry", `chat=${e.chatId} first=${me(n)}`), await zn(t, "ensure-ready-retry")), qt(t));
	}
	async function Ma(t, e = "recall") {
		const n = Lr(t);
		if (!n) return null;
		const r = performance.now(), i = ya(), o = he.add(n, i);
		try {
			const a = await Ae(n);
			if (!he.hasLease(n, i)) throw new Error(`RecallRuntime session expired while loading: ${n}`);
			return a && (a.timings = {
				...a.timings || {},
				beginSessionTotalMs: Math.round(performance.now() - r)
			}), ae("begin session", `chat=${n} lease=${i} reason=${e} active=${he.count(n)}`), {
				...o,
				ready: !!a?.ready,
				stats: J(a)
			};
		} catch (a) {
			throw he.release(n, i).activeSessions || Y.delete(n), a;
		}
	}
	function Ta(t = {}) {
		const e = Lr(t.chatId), n = t.leaseId;
		if (!e || !n) return tt(e, { endSessionClearMs: 0 });
		const r = performance.now(), i = he.release(e, n);
		if (!i.released) return et("end session ignored", `chat=${e} lease=${n}`), Y.has(e) ? J(Y.get(e)) : tt(e, { endSessionClearMs: 0 });
		if (!i.activeSessions) {
			Y.delete(e);
			const a = Math.round(performance.now() - r);
			return ae("end session cleared", `chat=${e} lease=${n} clear=${a}ms`), tt(e, { endSessionClearMs: a });
		}
		const o = Y.get(e);
		return o && (o.timings = {
			...o.timings || {},
			endSessionClearMs: Math.round(performance.now() - r)
		}), ae("end session retained", `chat=${e} lease=${n} active=${i.activeSessions}`), o ? J(o) : tt(e);
	}
	function Ca(t, e = {}) {
		const n = Y.get(String(t || ""));
		if (!n) return tt(t);
		const r = J(n);
		switch (n.version++, e.type) {
			case "meta":
				n.meta = {
					...n.meta || { chatId: n.chatId },
					...e.meta || {}
				};
				break;
			case "upsertChunks":
				Ur(n, e.chunks || []);
				break;
			case "upsertChunkVectors":
				qr(n, e.items || []);
				break;
			case "upsertEventVectors":
				Gr(n, e.items || []);
				break;
			case "upsertStateVectors":
				Hr(n, e.items || []);
				break;
			case "deleteChunksFromFloor":
				xa(n, Number(e.floor || 0));
				break;
			case "deleteChunksAtFloor":
				Ea(n, Number(e.floor || 0));
				break;
			case "deleteStateVectorsFromFloor":
				Aa(n, Number(e.floor || 0));
				break;
			case "deleteStateVectorsAtFloors":
				for (const [o, a] of n.stateVectorsById) e.floors.includes(a.floor) && n.stateVectorsById.delete(o);
				break;
			case "deleteEventVectorsByIds":
				for (const o of e.eventIds || []) n.eventVectorsById.delete(o);
				break;
			case "clear":
				Yr(n, e.domain || "all");
				break;
			default: break;
		}
		n.ready && n.status !== "warming" && (n.status = "ready");
		const i = J(n);
		return ae("mutation applied", `chat=${n.chatId} ${wa(e)} before=${me(r)} after=${me(i)}`), i;
	}
	async function Pa(t, e = [], n) {
		const r = await Ae(t), i = performance.now(), o = (e || []).map(Number).filter(Number.isInteger), a = [], u = [];
		for (const h of o) a.push(...r?.chunksByFloor.get(h) || []);
		for (const h of a) {
			const l = r?.chunkVectorsById.get(h.chunkId);
			l && u.push(l);
		}
		const s = Lo(a, u, n);
		s.stats.requestedFloors = o.length, s.stats.chunkCacheHits = o.length, s.stats.chunkCacheMisses = 0, s.stats.vectorCacheHits = s.stats.vectorHits, s.stats.vectorCacheMisses = s.stats.missingVectors, s.stats.cacheWarm = !0, s.stats.backend = "worker", s.stats.cacheOwner = "worker", s.stats.requestedL1Floors = o.length;
		const c = Math.round(performance.now() - i);
		return s.stats.runtimeScoreL1Ms = c, r && (r.timings = {
			...r.timings || {},
			scoreL1Ms: c
		}), s;
	}
	async function Ra(t, e = {}) {
		switch (t) {
			case "ping": return {
				pong: !0,
				backend: "worker"
			};
			case "beginSession": return await Ma(e.chatId, e.reason);
			case "endSession": return Ta(e.lease);
			case "refresh": return await zn(e.chatId, e.reason);
			case "applyMutation": return Ca(e.chatId, e.mutation);
			case "retainOnly": {
				const n = e.chatId ? String(e.chatId) : null;
				ae("retainOnly request", `keep=${n || "*"}`);
				for (const r of [...Y.keys()]) n && r === n || he.hasChat(r) || Y.delete(r);
				return [...Y.values()].map(J);
			}
			case "clear":
				if (ae("clear request", `chat=${e.chatId || "*"} domain=${e.domain || "all"}`), e.chatId) {
					const n = String(e.chatId || "");
					if (!he.hasChat(n)) {
						const r = qt(e.chatId);
						Yr(r, e.domain || "all"), ae("clear result", me(J(r)));
					}
				} else {
					for (const n of [...Y.keys()]) he.hasChat(n) || Y.delete(n);
					ae("clear result", "all entries removed");
				}
				return [...Y.values()].map(J);
			case "getMeta": return (await Ae(e.chatId))?.meta || null;
			case "getEventVectorsByIds": {
				const n = await Ae(e.chatId), r = performance.now(), i = ka(n, e.eventIds || []), o = Math.round(performance.now() - r);
				return n && (n.timings = {
					...n.timings || {},
					getEventVectorsByIdsMs: o
				}), {
					records: i,
					stats: J(n)
				};
			}
			case "scoreAnchors": {
				const n = await Ae(e.chatId), r = performance.now(), i = jo([...n?.stateVectorsById.values() || []], e.queryVector);
				return n && (n.timings = {
					...n.timings || {},
					scoreAnchorsMs: Math.round(performance.now() - r)
				}), {
					scores: i,
					stats: J(n)
				};
			}
			case "scoreEvents": {
				const n = await Ae(e.chatId), r = performance.now(), i = zo([...n?.eventVectorsById.values() || []], e.queryVector);
				return n && (n.timings = {
					...n.timings || {},
					scoreEventsMs: Math.round(performance.now() - r)
				}), {
					scores: i,
					stats: J(n)
				};
			}
			case "selectL1Evidence": {
				const n = await Ae(e.chatId);
				return {
					selection: await pa(e.parents, n, {
						...e.options,
						isCurrent: () => Y.get(e.chatId) === n
					}),
					stats: J(n)
				};
			}
			case "scoreL1": return await Pa(e.chatId, e.floors, e.queryVector);
			case "diffuseL0": {
				const n = await Ae(e.chatId), r = performance.now(), i = { diffusion: {} }, o = oa(e.seeds || [], e.allAtoms || [], [...n?.stateVectorsById.values() || []], e.queryVector, i, { name1: e.name1 || "" });
				return n && (n.timings = {
					...n.timings || {},
					diffuseL0Ms: Math.round(performance.now() - r)
				}), {
					diffused: o,
					metrics: i.diffusion || {}
				};
			}
			case "stats": return [...Y.values()].map(J);
			default: throw new Error(`Unknown RecallRuntime worker request: ${t}`);
		}
	}
	self.onmessage = async (t) => {
		const { id: e, type: n, payload: r } = t.data || {};
		if (e) try {
			const i = await Ra(n, r || {});
			self.postMessage({
				id: e,
				ok: !0,
				result: i
			});
		} catch (i) {
			self.postMessage({
				id: e,
				ok: !1,
				error: i?.message || String(i)
			});
		}
	};
})();
