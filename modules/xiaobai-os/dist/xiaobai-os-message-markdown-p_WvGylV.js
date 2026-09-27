/* eslint-disable */
var _e = Object.create, le = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, we = Object.getOwnPropertyNames, be = Object.getPrototypeOf, ke = Object.prototype.hasOwnProperty, ve = (f, u) => () => (u || (f((u = { exports: {} }).exports, u), f = null), u.exports), ye = (f, u, d, h) => {
  if (u && typeof u == "object" || typeof u == "function")
    for (var n = we(u), m = 0, _ = n.length, v; m < _; m++)
      v = n[m], !ke.call(f, v) && v !== d && le(f, v, {
        get: ((C) => u[C]).bind(null, v),
        enumerable: !(h = ge(u, v)) || h.enumerable
      });
  return f;
}, Se = (f, u, d) => (d = f != null ? _e(be(f)) : {}, ye(u || !f || !f.__esModule ? le(d, "default", {
  value: f,
  enumerable: !0
}) : d, f)), Pe = /* @__PURE__ */ ve(((f, u) => {
  (function() {
    function d(e) {
      "use strict";
      var a = {
        omitExtraWLInCodeBlocks: {
          defaultValue: !1,
          describe: "Omit the default extra whiteline added to code blocks",
          type: "boolean"
        },
        noHeaderId: {
          defaultValue: !1,
          describe: "Turn on/off generated header id",
          type: "boolean"
        },
        prefixHeaderId: {
          defaultValue: !1,
          describe: "Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic 'section-' prefix",
          type: "string"
        },
        rawPrefixHeaderId: {
          defaultValue: !1,
          describe: 'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',
          type: "boolean"
        },
        ghCompatibleHeaderId: {
          defaultValue: !1,
          describe: "Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)",
          type: "boolean"
        },
        rawHeaderId: {
          defaultValue: !1,
          describe: `Remove only spaces, ' and " from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids`,
          type: "boolean"
        },
        headerLevelStart: {
          defaultValue: !1,
          describe: "The header blocks level start",
          type: "integer"
        },
        parseImgDimensions: {
          defaultValue: !1,
          describe: "Turn on/off image dimension parsing",
          type: "boolean"
        },
        simplifiedAutoLink: {
          defaultValue: !1,
          describe: "Turn on/off GFM autolink style",
          type: "boolean"
        },
        excludeTrailingPunctuationFromURLs: {
          defaultValue: !1,
          describe: "Excludes trailing punctuation from links generated with autoLinking",
          type: "boolean"
        },
        literalMidWordUnderscores: {
          defaultValue: !1,
          describe: "Parse midword underscores as literal underscores",
          type: "boolean"
        },
        literalMidWordAsterisks: {
          defaultValue: !1,
          describe: "Parse midword asterisks as literal asterisks",
          type: "boolean"
        },
        strikethrough: {
          defaultValue: !1,
          describe: "Turn on/off strikethrough support",
          type: "boolean"
        },
        tables: {
          defaultValue: !1,
          describe: "Turn on/off tables support",
          type: "boolean"
        },
        tablesHeaderId: {
          defaultValue: !1,
          describe: "Add an id to table headers",
          type: "boolean"
        },
        ghCodeBlocks: {
          defaultValue: !0,
          describe: "Turn on/off GFM fenced code blocks support",
          type: "boolean"
        },
        tasklists: {
          defaultValue: !1,
          describe: "Turn on/off GFM tasklist support",
          type: "boolean"
        },
        smoothLivePreview: {
          defaultValue: !1,
          describe: "Prevents weird effects in live previews due to incomplete input",
          type: "boolean"
        },
        smartIndentationFix: {
          defaultValue: !1,
          describe: "Tries to smartly fix indentation in es6 strings",
          type: "boolean"
        },
        disableForced4SpacesIndentedSublists: {
          defaultValue: !1,
          describe: "Disables the requirement of indenting nested sublists by 4 spaces",
          type: "boolean"
        },
        simpleLineBreaks: {
          defaultValue: !1,
          describe: "Parses simple line breaks as <br> (GFM Style)",
          type: "boolean"
        },
        requireSpaceBeforeHeadingText: {
          defaultValue: !1,
          describe: "Makes adding a space between `#` and the header text mandatory (GFM Style)",
          type: "boolean"
        },
        ghMentions: {
          defaultValue: !1,
          describe: "Enables github @mentions",
          type: "boolean"
        },
        ghMentionsLink: {
          defaultValue: "https://github.com/{u}",
          describe: "Changes the link generated by @mentions. Only applies if ghMentions option is enabled.",
          type: "string"
        },
        encodeEmails: {
          defaultValue: !0,
          describe: "Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities",
          type: "boolean"
        },
        openLinksInNewWindow: {
          defaultValue: !1,
          describe: "Open all links in new windows",
          type: "boolean"
        },
        backslashEscapesHTMLTags: {
          defaultValue: !1,
          describe: "Support for HTML Tag escaping. ex: <div>foo</div>",
          type: "boolean"
        },
        emoji: {
          defaultValue: !1,
          describe: "Enable emoji support. Ex: `this is a :smile: emoji`",
          type: "boolean"
        },
        underline: {
          defaultValue: !1,
          describe: "Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`",
          type: "boolean"
        },
        ellipsis: {
          defaultValue: !0,
          describe: "Replaces three dots with the ellipsis unicode character",
          type: "boolean"
        },
        completeHTMLDocument: {
          defaultValue: !1,
          describe: "Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags",
          type: "boolean"
        },
        metadata: {
          defaultValue: !1,
          describe: "Enable support for document metadata (defined at the top of the document between `«««` and `»»»` or between `---` and `---`).",
          type: "boolean"
        },
        splitAdjacentBlockquotes: {
          defaultValue: !1,
          describe: "Split adjacent blockquote blocks",
          type: "boolean"
        }
      };
      if (e === !1) return JSON.parse(JSON.stringify(a));
      var r = {};
      for (var t in a) a.hasOwnProperty(t) && (r[t] = a[t].defaultValue);
      return r;
    }
    function h() {
      "use strict";
      var e = d(!0), a = {};
      for (var r in e) e.hasOwnProperty(r) && (a[r] = !0);
      return a;
    }
    var n = {}, m = {}, _ = {}, v = d(!0), C = "vanilla", L = {
      github: {
        omitExtraWLInCodeBlocks: !0,
        simplifiedAutoLink: !0,
        excludeTrailingPunctuationFromURLs: !0,
        literalMidWordUnderscores: !0,
        strikethrough: !0,
        tables: !0,
        tablesHeaderId: !0,
        ghCodeBlocks: !0,
        tasklists: !0,
        disableForced4SpacesIndentedSublists: !0,
        simpleLineBreaks: !0,
        requireSpaceBeforeHeadingText: !0,
        ghCompatibleHeaderId: !0,
        ghMentions: !0,
        backslashEscapesHTMLTags: !0,
        emoji: !0,
        splitAdjacentBlockquotes: !0
      },
      original: {
        noHeaderId: !0,
        ghCodeBlocks: !1
      },
      ghost: {
        omitExtraWLInCodeBlocks: !0,
        parseImgDimensions: !0,
        simplifiedAutoLink: !0,
        excludeTrailingPunctuationFromURLs: !0,
        literalMidWordUnderscores: !0,
        strikethrough: !0,
        tables: !0,
        tablesHeaderId: !0,
        ghCodeBlocks: !0,
        tasklists: !0,
        smoothLivePreview: !0,
        simpleLineBreaks: !0,
        requireSpaceBeforeHeadingText: !0,
        ghMentions: !1,
        encodeEmails: !0
      },
      vanilla: d(!0),
      allOn: h()
    };
    n.helper = {}, n.extensions = {}, n.setOption = function(e, a) {
      "use strict";
      return v[e] = a, this;
    }, n.getOption = function(e) {
      "use strict";
      return v[e];
    }, n.getOptions = function() {
      "use strict";
      return v;
    }, n.resetOptions = function() {
      "use strict";
      v = d(!0);
    }, n.setFlavor = function(e) {
      "use strict";
      if (!L.hasOwnProperty(e)) throw Error(e + " flavor was not found");
      n.resetOptions();
      var a = L[e];
      C = e;
      for (var r in a) a.hasOwnProperty(r) && (v[r] = a[r]);
    }, n.getFlavor = function() {
      "use strict";
      return C;
    }, n.getFlavorOptions = function(e) {
      "use strict";
      if (L.hasOwnProperty(e)) return L[e];
    }, n.getDefaultOptions = function(e) {
      "use strict";
      return d(e);
    }, n.subParser = function(e, a) {
      "use strict";
      if (n.helper.isString(e)) if (typeof a < "u") m[e] = a;
      else {
        if (m.hasOwnProperty(e)) return m[e];
        throw Error("SubParser named " + e + " not registered!");
      }
    }, n.extension = function(e, a) {
      "use strict";
      if (!n.helper.isString(e)) throw Error("Extension 'name' must be a string");
      if (e = n.helper.stdExtName(e), n.helper.isUndefined(a)) {
        if (!_.hasOwnProperty(e)) throw Error("Extension named " + e + " is not registered!");
        return _[e];
      } else {
        typeof a == "function" && (a = a()), n.helper.isArray(a) || (a = [a]);
        var r = j(a, e);
        if (r.valid) _[e] = a;
        else throw Error(r.error);
      }
    }, n.getAllExtensions = function() {
      "use strict";
      return _;
    }, n.removeExtension = function(e) {
      "use strict";
      delete _[e];
    }, n.resetExtensions = function() {
      "use strict";
      _ = {};
    };
    function j(e, a) {
      "use strict";
      var r = a ? "Error in " + a + " extension->" : "Error in unnamed extension", t = {
        valid: !0,
        error: ""
      };
      n.helper.isArray(e) || (e = [e]);
      for (var o = 0; o < e.length; ++o) {
        var c = r + " sub-extension " + o + ": ", s = e[o];
        if (typeof s != "object")
          return t.valid = !1, t.error = c + "must be an object, but " + typeof s + " given", t;
        if (!n.helper.isString(s.type))
          return t.valid = !1, t.error = c + 'property "type" must be a string, but ' + typeof s.type + " given", t;
        var l = s.type = s.type.toLowerCase();
        if (l === "language" && (l = s.type = "lang"), l === "html" && (l = s.type = "output"), l !== "lang" && l !== "output" && l !== "listener")
          return t.valid = !1, t.error = c + "type " + l + ' is not recognized. Valid values: "lang/language", "output/html" or "listener"', t;
        if (l === "listener") {
          if (n.helper.isUndefined(s.listeners))
            return t.valid = !1, t.error = c + '. Extensions of type "listener" must have a property called "listeners"', t;
        } else if (n.helper.isUndefined(s.filter) && n.helper.isUndefined(s.regex))
          return t.valid = !1, t.error = c + l + ' extensions must define either a "regex" property or a "filter" method', t;
        if (s.listeners) {
          if (typeof s.listeners != "object")
            return t.valid = !1, t.error = c + '"listeners" property must be an object but ' + typeof s.listeners + " given", t;
          for (var k in s.listeners) if (s.listeners.hasOwnProperty(k) && typeof s.listeners[k] != "function")
            return t.valid = !1, t.error = c + '"listeners" property must be an hash of [event name]: [callback]. listeners.' + k + " must be a function but " + typeof s.listeners[k] + " given", t;
        }
        if (s.filter) {
          if (typeof s.filter != "function")
            return t.valid = !1, t.error = c + '"filter" must be a function, but ' + typeof s.filter + " given", t;
        } else if (s.regex) {
          if (n.helper.isString(s.regex) && (s.regex = new RegExp(s.regex, "g")), !(s.regex instanceof RegExp))
            return t.valid = !1, t.error = c + '"regex" property must either be a string or a RegExp object, but ' + typeof s.regex + " given", t;
          if (n.helper.isUndefined(s.replace))
            return t.valid = !1, t.error = c + '"regex" extensions must implement a replace string or function', t;
        }
      }
      return t;
    }
    n.validateExtension = function(e) {
      "use strict";
      var a = j(e, null);
      return a.valid ? !0 : (console.warn(a.error), !1);
    }, n.hasOwnProperty("helper") || (n.helper = {}), n.helper.isString = function(e) {
      "use strict";
      return typeof e == "string" || e instanceof String;
    }, n.helper.isFunction = function(e) {
      "use strict";
      return e && {}.toString.call(e) === "[object Function]";
    }, n.helper.isArray = function(e) {
      "use strict";
      return Array.isArray(e);
    }, n.helper.isUndefined = function(e) {
      "use strict";
      return typeof e > "u";
    }, n.helper.forEach = function(e, a) {
      "use strict";
      if (n.helper.isUndefined(e)) throw new Error("obj param is required");
      if (n.helper.isUndefined(a)) throw new Error("callback param is required");
      if (!n.helper.isFunction(a)) throw new Error("callback param must be a function/closure");
      if (typeof e.forEach == "function") e.forEach(a);
      else if (n.helper.isArray(e)) for (var r = 0; r < e.length; r++) a(e[r], r, e);
      else if (typeof e == "object")
        for (var t in e) e.hasOwnProperty(t) && a(e[t], t, e);
      else throw new Error("obj does not seem to be an array or an iterable object");
    }, n.helper.stdExtName = function(e) {
      "use strict";
      return e.replace(/[_?*+\/\\.^-]/g, "").replace(/\s/g, "").toLowerCase();
    };
    function M(e, a) {
      "use strict";
      return "¨E" + a.charCodeAt(0) + "E";
    }
    n.helper.escapeCharactersCallback = M, n.helper.escapeCharacters = function(e, a, r) {
      "use strict";
      var t = "([" + a.replace(/([\[\]\\])/g, "\\$1") + "])";
      r && (t = "\\\\" + t);
      var o = new RegExp(t, "g");
      return e = e.replace(o, M), e;
    }, n.helper.unescapeHTMLEntities = function(e) {
      "use strict";
      return e.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    };
    var A = function(e, a, r, t) {
      "use strict";
      var o = t || "", c = o.indexOf("g") > -1, s = new RegExp(a + "|" + r, "g" + o.replace(/g/g, "")), l = new RegExp(a, o.replace(/g/g, "")), k = [], b, g, w, i, p;
      do
        for (b = 0; w = s.exec(e); ) if (l.test(w[0]))
          b++ || (g = s.lastIndex, i = g - w[0].length);
        else if (b && !--b) {
          p = w.index + w[0].length;
          var y = {
            left: {
              start: i,
              end: g
            },
            match: {
              start: g,
              end: w.index
            },
            right: {
              start: w.index,
              end: p
            },
            wholeMatch: {
              start: i,
              end: p
            }
          };
          if (k.push(y), !c) return k;
        }
      while (b && (s.lastIndex = g));
      return k;
    };
    n.helper.matchRecursiveRegExp = function(e, a, r, t) {
      "use strict";
      for (var o = A(e, a, r, t), c = [], s = 0; s < o.length; ++s) c.push([
        e.slice(o[s].wholeMatch.start, o[s].wholeMatch.end),
        e.slice(o[s].match.start, o[s].match.end),
        e.slice(o[s].left.start, o[s].left.end),
        e.slice(o[s].right.start, o[s].right.end)
      ]);
      return c;
    }, n.helper.replaceRecursiveRegExp = function(e, a, r, t, o) {
      "use strict";
      if (!n.helper.isFunction(a)) {
        var c = a;
        a = function() {
          return c;
        };
      }
      var s = A(e, r, t, o), l = e, k = s.length;
      if (k > 0) {
        var b = [];
        s[0].wholeMatch.start !== 0 && b.push(e.slice(0, s[0].wholeMatch.start));
        for (var g = 0; g < k; ++g)
          b.push(a(e.slice(s[g].wholeMatch.start, s[g].wholeMatch.end), e.slice(s[g].match.start, s[g].match.end), e.slice(s[g].left.start, s[g].left.end), e.slice(s[g].right.start, s[g].right.end))), g < k - 1 && b.push(e.slice(s[g].wholeMatch.end, s[g + 1].wholeMatch.start));
        s[k - 1].wholeMatch.end < e.length && b.push(e.slice(s[k - 1].wholeMatch.end)), l = b.join("");
      }
      return l;
    }, n.helper.regexIndexOf = function(e, a, r) {
      "use strict";
      if (!n.helper.isString(e)) throw "InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";
      if (!(a instanceof RegExp)) throw "InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp";
      var t = e.substring(r || 0).search(a);
      return t >= 0 ? t + (r || 0) : t;
    }, n.helper.splitAtIndex = function(e, a) {
      "use strict";
      if (!n.helper.isString(e)) throw "InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";
      return [e.substring(0, a), e.substring(a)];
    }, n.helper.encodeEmailAddress = function(e) {
      "use strict";
      var a = [
        function(r) {
          return "&#" + r.charCodeAt(0) + ";";
        },
        function(r) {
          return "&#x" + r.charCodeAt(0).toString(16) + ";";
        },
        function(r) {
          return r;
        }
      ];
      return e = e.replace(/./g, function(r) {
        if (r === "@") r = a[Math.floor(Math.random() * 2)](r);
        else {
          var t = Math.random();
          r = t > 0.9 ? a[2](r) : t > 0.45 ? a[1](r) : a[0](r);
        }
        return r;
      }), e;
    }, n.helper.padEnd = function(a, r, t) {
      "use strict";
      return r = r >> 0, t = String(t || " "), a.length > r ? String(a) : (r = r - a.length, r > t.length && (t += t.repeat(r / t.length)), String(a) + t.slice(0, r));
    }, typeof console > "u" && (console = {
      warn: function(e) {
        "use strict";
        alert(e);
      },
      log: function(e) {
        "use strict";
        alert(e);
      },
      error: function(e) {
        "use strict";
        throw e;
      }
    }), n.helper.regexes = { asteriskDashAndColon: /([*_:~])/g }, n.helper.emojis = {
      "+1": "👍",
      "-1": "👎",
      100: "💯",
      1234: "🔢",
      "1st_place_medal": "🥇",
      "2nd_place_medal": "🥈",
      "3rd_place_medal": "🥉",
      "8ball": "🎱",
      a: "🅰️",
      ab: "🆎",
      abc: "🔤",
      abcd: "🔡",
      accept: "🉑",
      aerial_tramway: "🚡",
      airplane: "✈️",
      alarm_clock: "⏰",
      alembic: "⚗️",
      alien: "👽",
      ambulance: "🚑",
      amphora: "🏺",
      anchor: "⚓️",
      angel: "👼",
      anger: "💢",
      angry: "😠",
      anguished: "😧",
      ant: "🐜",
      apple: "🍎",
      aquarius: "♒️",
      aries: "♈️",
      arrow_backward: "◀️",
      arrow_double_down: "⏬",
      arrow_double_up: "⏫",
      arrow_down: "⬇️",
      arrow_down_small: "🔽",
      arrow_forward: "▶️",
      arrow_heading_down: "⤵️",
      arrow_heading_up: "⤴️",
      arrow_left: "⬅️",
      arrow_lower_left: "↙️",
      arrow_lower_right: "↘️",
      arrow_right: "➡️",
      arrow_right_hook: "↪️",
      arrow_up: "⬆️",
      arrow_up_down: "↕️",
      arrow_up_small: "🔼",
      arrow_upper_left: "↖️",
      arrow_upper_right: "↗️",
      arrows_clockwise: "🔃",
      arrows_counterclockwise: "🔄",
      art: "🎨",
      articulated_lorry: "🚛",
      artificial_satellite: "🛰",
      astonished: "😲",
      athletic_shoe: "👟",
      atm: "🏧",
      atom_symbol: "⚛️",
      avocado: "🥑",
      b: "🅱️",
      baby: "👶",
      baby_bottle: "🍼",
      baby_chick: "🐤",
      baby_symbol: "🚼",
      back: "🔙",
      bacon: "🥓",
      badminton: "🏸",
      baggage_claim: "🛄",
      baguette_bread: "🥖",
      balance_scale: "⚖️",
      balloon: "🎈",
      ballot_box: "🗳",
      ballot_box_with_check: "☑️",
      bamboo: "🎍",
      banana: "🍌",
      bangbang: "‼️",
      bank: "🏦",
      bar_chart: "📊",
      barber: "💈",
      baseball: "⚾️",
      basketball: "🏀",
      basketball_man: "⛹️",
      basketball_woman: "⛹️&zwj;♀️",
      bat: "🦇",
      bath: "🛀",
      bathtub: "🛁",
      battery: "🔋",
      beach_umbrella: "🏖",
      bear: "🐻",
      bed: "🛏",
      bee: "🐝",
      beer: "🍺",
      beers: "🍻",
      beetle: "🐞",
      beginner: "🔰",
      bell: "🔔",
      bellhop_bell: "🛎",
      bento: "🍱",
      biking_man: "🚴",
      bike: "🚲",
      biking_woman: "🚴&zwj;♀️",
      bikini: "👙",
      biohazard: "☣️",
      bird: "🐦",
      birthday: "🎂",
      black_circle: "⚫️",
      black_flag: "🏴",
      black_heart: "🖤",
      black_joker: "🃏",
      black_large_square: "⬛️",
      black_medium_small_square: "◾️",
      black_medium_square: "◼️",
      black_nib: "✒️",
      black_small_square: "▪️",
      black_square_button: "🔲",
      blonde_man: "👱",
      blonde_woman: "👱&zwj;♀️",
      blossom: "🌼",
      blowfish: "🐡",
      blue_book: "📘",
      blue_car: "🚙",
      blue_heart: "💙",
      blush: "😊",
      boar: "🐗",
      boat: "⛵️",
      bomb: "💣",
      book: "📖",
      bookmark: "🔖",
      bookmark_tabs: "📑",
      books: "📚",
      boom: "💥",
      boot: "👢",
      bouquet: "💐",
      bowing_man: "🙇",
      bow_and_arrow: "🏹",
      bowing_woman: "🙇&zwj;♀️",
      bowling: "🎳",
      boxing_glove: "🥊",
      boy: "👦",
      bread: "🍞",
      bride_with_veil: "👰",
      bridge_at_night: "🌉",
      briefcase: "💼",
      broken_heart: "💔",
      bug: "🐛",
      building_construction: "🏗",
      bulb: "💡",
      bullettrain_front: "🚅",
      bullettrain_side: "🚄",
      burrito: "🌯",
      bus: "🚌",
      business_suit_levitating: "🕴",
      busstop: "🚏",
      bust_in_silhouette: "👤",
      busts_in_silhouette: "👥",
      butterfly: "🦋",
      cactus: "🌵",
      cake: "🍰",
      calendar: "📆",
      call_me_hand: "🤙",
      calling: "📲",
      camel: "🐫",
      camera: "📷",
      camera_flash: "📸",
      camping: "🏕",
      cancer: "♋️",
      candle: "🕯",
      candy: "🍬",
      canoe: "🛶",
      capital_abcd: "🔠",
      capricorn: "♑️",
      car: "🚗",
      card_file_box: "🗃",
      card_index: "📇",
      card_index_dividers: "🗂",
      carousel_horse: "🎠",
      carrot: "🥕",
      cat: "🐱",
      cat2: "🐈",
      cd: "💿",
      chains: "⛓",
      champagne: "🍾",
      chart: "💹",
      chart_with_downwards_trend: "📉",
      chart_with_upwards_trend: "📈",
      checkered_flag: "🏁",
      cheese: "🧀",
      cherries: "🍒",
      cherry_blossom: "🌸",
      chestnut: "🌰",
      chicken: "🐔",
      children_crossing: "🚸",
      chipmunk: "🐿",
      chocolate_bar: "🍫",
      christmas_tree: "🎄",
      church: "⛪️",
      cinema: "🎦",
      circus_tent: "🎪",
      city_sunrise: "🌇",
      city_sunset: "🌆",
      cityscape: "🏙",
      cl: "🆑",
      clamp: "🗜",
      clap: "👏",
      clapper: "🎬",
      classical_building: "🏛",
      clinking_glasses: "🥂",
      clipboard: "📋",
      clock1: "🕐",
      clock10: "🕙",
      clock1030: "🕥",
      clock11: "🕚",
      clock1130: "🕦",
      clock12: "🕛",
      clock1230: "🕧",
      clock130: "🕜",
      clock2: "🕑",
      clock230: "🕝",
      clock3: "🕒",
      clock330: "🕞",
      clock4: "🕓",
      clock430: "🕟",
      clock5: "🕔",
      clock530: "🕠",
      clock6: "🕕",
      clock630: "🕡",
      clock7: "🕖",
      clock730: "🕢",
      clock8: "🕗",
      clock830: "🕣",
      clock9: "🕘",
      clock930: "🕤",
      closed_book: "📕",
      closed_lock_with_key: "🔐",
      closed_umbrella: "🌂",
      cloud: "☁️",
      cloud_with_lightning: "🌩",
      cloud_with_lightning_and_rain: "⛈",
      cloud_with_rain: "🌧",
      cloud_with_snow: "🌨",
      clown_face: "🤡",
      clubs: "♣️",
      cocktail: "🍸",
      coffee: "☕️",
      coffin: "⚰️",
      cold_sweat: "😰",
      comet: "☄️",
      computer: "💻",
      computer_mouse: "🖱",
      confetti_ball: "🎊",
      confounded: "😖",
      confused: "😕",
      congratulations: "㊗️",
      construction: "🚧",
      construction_worker_man: "👷",
      construction_worker_woman: "👷&zwj;♀️",
      control_knobs: "🎛",
      convenience_store: "🏪",
      cookie: "🍪",
      cool: "🆒",
      policeman: "👮",
      copyright: "©️",
      corn: "🌽",
      couch_and_lamp: "🛋",
      couple: "👫",
      couple_with_heart_woman_man: "💑",
      couple_with_heart_man_man: "👨&zwj;❤️&zwj;👨",
      couple_with_heart_woman_woman: "👩&zwj;❤️&zwj;👩",
      couplekiss_man_man: "👨&zwj;❤️&zwj;💋&zwj;👨",
      couplekiss_man_woman: "💏",
      couplekiss_woman_woman: "👩&zwj;❤️&zwj;💋&zwj;👩",
      cow: "🐮",
      cow2: "🐄",
      cowboy_hat_face: "🤠",
      crab: "🦀",
      crayon: "🖍",
      credit_card: "💳",
      crescent_moon: "🌙",
      cricket: "🏏",
      crocodile: "🐊",
      croissant: "🥐",
      crossed_fingers: "🤞",
      crossed_flags: "🎌",
      crossed_swords: "⚔️",
      crown: "👑",
      cry: "😢",
      crying_cat_face: "😿",
      crystal_ball: "🔮",
      cucumber: "🥒",
      cupid: "💘",
      curly_loop: "➰",
      currency_exchange: "💱",
      curry: "🍛",
      custard: "🍮",
      customs: "🛃",
      cyclone: "🌀",
      dagger: "🗡",
      dancer: "💃",
      dancing_women: "👯",
      dancing_men: "👯&zwj;♂️",
      dango: "🍡",
      dark_sunglasses: "🕶",
      dart: "🎯",
      dash: "💨",
      date: "📅",
      deciduous_tree: "🌳",
      deer: "🦌",
      department_store: "🏬",
      derelict_house: "🏚",
      desert: "🏜",
      desert_island: "🏝",
      desktop_computer: "🖥",
      male_detective: "🕵️",
      diamond_shape_with_a_dot_inside: "💠",
      diamonds: "♦️",
      disappointed: "😞",
      disappointed_relieved: "😥",
      dizzy: "💫",
      dizzy_face: "😵",
      do_not_litter: "🚯",
      dog: "🐶",
      dog2: "🐕",
      dollar: "💵",
      dolls: "🎎",
      dolphin: "🐬",
      door: "🚪",
      doughnut: "🍩",
      dove: "🕊",
      dragon: "🐉",
      dragon_face: "🐲",
      dress: "👗",
      dromedary_camel: "🐪",
      drooling_face: "🤤",
      droplet: "💧",
      drum: "🥁",
      duck: "🦆",
      dvd: "📀",
      "e-mail": "📧",
      eagle: "🦅",
      ear: "👂",
      ear_of_rice: "🌾",
      earth_africa: "🌍",
      earth_americas: "🌎",
      earth_asia: "🌏",
      egg: "🥚",
      eggplant: "🍆",
      eight_pointed_black_star: "✴️",
      eight_spoked_asterisk: "✳️",
      electric_plug: "🔌",
      elephant: "🐘",
      email: "✉️",
      end: "🔚",
      envelope_with_arrow: "📩",
      euro: "💶",
      european_castle: "🏰",
      european_post_office: "🏤",
      evergreen_tree: "🌲",
      exclamation: "❗️",
      expressionless: "😑",
      eye: "👁",
      eye_speech_bubble: "👁&zwj;🗨",
      eyeglasses: "👓",
      eyes: "👀",
      face_with_head_bandage: "🤕",
      face_with_thermometer: "🤒",
      fist_oncoming: "👊",
      factory: "🏭",
      fallen_leaf: "🍂",
      family_man_woman_boy: "👪",
      family_man_boy: "👨&zwj;👦",
      family_man_boy_boy: "👨&zwj;👦&zwj;👦",
      family_man_girl: "👨&zwj;👧",
      family_man_girl_boy: "👨&zwj;👧&zwj;👦",
      family_man_girl_girl: "👨&zwj;👧&zwj;👧",
      family_man_man_boy: "👨&zwj;👨&zwj;👦",
      family_man_man_boy_boy: "👨&zwj;👨&zwj;👦&zwj;👦",
      family_man_man_girl: "👨&zwj;👨&zwj;👧",
      family_man_man_girl_boy: "👨&zwj;👨&zwj;👧&zwj;👦",
      family_man_man_girl_girl: "👨&zwj;👨&zwj;👧&zwj;👧",
      family_man_woman_boy_boy: "👨&zwj;👩&zwj;👦&zwj;👦",
      family_man_woman_girl: "👨&zwj;👩&zwj;👧",
      family_man_woman_girl_boy: "👨&zwj;👩&zwj;👧&zwj;👦",
      family_man_woman_girl_girl: "👨&zwj;👩&zwj;👧&zwj;👧",
      family_woman_boy: "👩&zwj;👦",
      family_woman_boy_boy: "👩&zwj;👦&zwj;👦",
      family_woman_girl: "👩&zwj;👧",
      family_woman_girl_boy: "👩&zwj;👧&zwj;👦",
      family_woman_girl_girl: "👩&zwj;👧&zwj;👧",
      family_woman_woman_boy: "👩&zwj;👩&zwj;👦",
      family_woman_woman_boy_boy: "👩&zwj;👩&zwj;👦&zwj;👦",
      family_woman_woman_girl: "👩&zwj;👩&zwj;👧",
      family_woman_woman_girl_boy: "👩&zwj;👩&zwj;👧&zwj;👦",
      family_woman_woman_girl_girl: "👩&zwj;👩&zwj;👧&zwj;👧",
      fast_forward: "⏩",
      fax: "📠",
      fearful: "😨",
      feet: "🐾",
      female_detective: "🕵️&zwj;♀️",
      ferris_wheel: "🎡",
      ferry: "⛴",
      field_hockey: "🏑",
      file_cabinet: "🗄",
      file_folder: "📁",
      film_projector: "📽",
      film_strip: "🎞",
      fire: "🔥",
      fire_engine: "🚒",
      fireworks: "🎆",
      first_quarter_moon: "🌓",
      first_quarter_moon_with_face: "🌛",
      fish: "🐟",
      fish_cake: "🍥",
      fishing_pole_and_fish: "🎣",
      fist_raised: "✊",
      fist_left: "🤛",
      fist_right: "🤜",
      flags: "🎏",
      flashlight: "🔦",
      fleur_de_lis: "⚜️",
      flight_arrival: "🛬",
      flight_departure: "🛫",
      floppy_disk: "💾",
      flower_playing_cards: "🎴",
      flushed: "😳",
      fog: "🌫",
      foggy: "🌁",
      football: "🏈",
      footprints: "👣",
      fork_and_knife: "🍴",
      fountain: "⛲️",
      fountain_pen: "🖋",
      four_leaf_clover: "🍀",
      fox_face: "🦊",
      framed_picture: "🖼",
      free: "🆓",
      fried_egg: "🍳",
      fried_shrimp: "🍤",
      fries: "🍟",
      frog: "🐸",
      frowning: "😦",
      frowning_face: "☹️",
      frowning_man: "🙍&zwj;♂️",
      frowning_woman: "🙍",
      middle_finger: "🖕",
      fuelpump: "⛽️",
      full_moon: "🌕",
      full_moon_with_face: "🌝",
      funeral_urn: "⚱️",
      game_die: "🎲",
      gear: "⚙️",
      gem: "💎",
      gemini: "♊️",
      ghost: "👻",
      gift: "🎁",
      gift_heart: "💝",
      girl: "👧",
      globe_with_meridians: "🌐",
      goal_net: "🥅",
      goat: "🐐",
      golf: "⛳️",
      golfing_man: "🏌️",
      golfing_woman: "🏌️&zwj;♀️",
      gorilla: "🦍",
      grapes: "🍇",
      green_apple: "🍏",
      green_book: "📗",
      green_heart: "💚",
      green_salad: "🥗",
      grey_exclamation: "❕",
      grey_question: "❔",
      grimacing: "😬",
      grin: "😁",
      grinning: "😀",
      guardsman: "💂",
      guardswoman: "💂&zwj;♀️",
      guitar: "🎸",
      gun: "🔫",
      haircut_woman: "💇",
      haircut_man: "💇&zwj;♂️",
      hamburger: "🍔",
      hammer: "🔨",
      hammer_and_pick: "⚒",
      hammer_and_wrench: "🛠",
      hamster: "🐹",
      hand: "✋",
      handbag: "👜",
      handshake: "🤝",
      hankey: "💩",
      hatched_chick: "🐥",
      hatching_chick: "🐣",
      headphones: "🎧",
      hear_no_evil: "🙉",
      heart: "❤️",
      heart_decoration: "💟",
      heart_eyes: "😍",
      heart_eyes_cat: "😻",
      heartbeat: "💓",
      heartpulse: "💗",
      hearts: "♥️",
      heavy_check_mark: "✔️",
      heavy_division_sign: "➗",
      heavy_dollar_sign: "💲",
      heavy_heart_exclamation: "❣️",
      heavy_minus_sign: "➖",
      heavy_multiplication_x: "✖️",
      heavy_plus_sign: "➕",
      helicopter: "🚁",
      herb: "🌿",
      hibiscus: "🌺",
      high_brightness: "🔆",
      high_heel: "👠",
      hocho: "🔪",
      hole: "🕳",
      honey_pot: "🍯",
      horse: "🐴",
      horse_racing: "🏇",
      hospital: "🏥",
      hot_pepper: "🌶",
      hotdog: "🌭",
      hotel: "🏨",
      hotsprings: "♨️",
      hourglass: "⌛️",
      hourglass_flowing_sand: "⏳",
      house: "🏠",
      house_with_garden: "🏡",
      houses: "🏘",
      hugs: "🤗",
      hushed: "😯",
      ice_cream: "🍨",
      ice_hockey: "🏒",
      ice_skate: "⛸",
      icecream: "🍦",
      id: "🆔",
      ideograph_advantage: "🉐",
      imp: "👿",
      inbox_tray: "📥",
      incoming_envelope: "📨",
      tipping_hand_woman: "💁",
      information_source: "ℹ️",
      innocent: "😇",
      interrobang: "⁉️",
      iphone: "📱",
      izakaya_lantern: "🏮",
      jack_o_lantern: "🎃",
      japan: "🗾",
      japanese_castle: "🏯",
      japanese_goblin: "👺",
      japanese_ogre: "👹",
      jeans: "👖",
      joy: "😂",
      joy_cat: "😹",
      joystick: "🕹",
      kaaba: "🕋",
      key: "🔑",
      keyboard: "⌨️",
      keycap_ten: "🔟",
      kick_scooter: "🛴",
      kimono: "👘",
      kiss: "💋",
      kissing: "😗",
      kissing_cat: "😽",
      kissing_closed_eyes: "😚",
      kissing_heart: "😘",
      kissing_smiling_eyes: "😙",
      kiwi_fruit: "🥝",
      koala: "🐨",
      koko: "🈁",
      label: "🏷",
      large_blue_circle: "🔵",
      large_blue_diamond: "🔷",
      large_orange_diamond: "🔶",
      last_quarter_moon: "🌗",
      last_quarter_moon_with_face: "🌜",
      latin_cross: "✝️",
      laughing: "😆",
      leaves: "🍃",
      ledger: "📒",
      left_luggage: "🛅",
      left_right_arrow: "↔️",
      leftwards_arrow_with_hook: "↩️",
      lemon: "🍋",
      leo: "♌️",
      leopard: "🐆",
      level_slider: "🎚",
      libra: "♎️",
      light_rail: "🚈",
      link: "🔗",
      lion: "🦁",
      lips: "👄",
      lipstick: "💄",
      lizard: "🦎",
      lock: "🔒",
      lock_with_ink_pen: "🔏",
      lollipop: "🍭",
      loop: "➿",
      loud_sound: "🔊",
      loudspeaker: "📢",
      love_hotel: "🏩",
      love_letter: "💌",
      low_brightness: "🔅",
      lying_face: "🤥",
      m: "Ⓜ️",
      mag: "🔍",
      mag_right: "🔎",
      mahjong: "🀄️",
      mailbox: "📫",
      mailbox_closed: "📪",
      mailbox_with_mail: "📬",
      mailbox_with_no_mail: "📭",
      man: "👨",
      man_artist: "👨&zwj;🎨",
      man_astronaut: "👨&zwj;🚀",
      man_cartwheeling: "🤸&zwj;♂️",
      man_cook: "👨&zwj;🍳",
      man_dancing: "🕺",
      man_facepalming: "🤦&zwj;♂️",
      man_factory_worker: "👨&zwj;🏭",
      man_farmer: "👨&zwj;🌾",
      man_firefighter: "👨&zwj;🚒",
      man_health_worker: "👨&zwj;⚕️",
      man_in_tuxedo: "🤵",
      man_judge: "👨&zwj;⚖️",
      man_juggling: "🤹&zwj;♂️",
      man_mechanic: "👨&zwj;🔧",
      man_office_worker: "👨&zwj;💼",
      man_pilot: "👨&zwj;✈️",
      man_playing_handball: "🤾&zwj;♂️",
      man_playing_water_polo: "🤽&zwj;♂️",
      man_scientist: "👨&zwj;🔬",
      man_shrugging: "🤷&zwj;♂️",
      man_singer: "👨&zwj;🎤",
      man_student: "👨&zwj;🎓",
      man_teacher: "👨&zwj;🏫",
      man_technologist: "👨&zwj;💻",
      man_with_gua_pi_mao: "👲",
      man_with_turban: "👳",
      tangerine: "🍊",
      mans_shoe: "👞",
      mantelpiece_clock: "🕰",
      maple_leaf: "🍁",
      martial_arts_uniform: "🥋",
      mask: "😷",
      massage_woman: "💆",
      massage_man: "💆&zwj;♂️",
      meat_on_bone: "🍖",
      medal_military: "🎖",
      medal_sports: "🏅",
      mega: "📣",
      melon: "🍈",
      memo: "📝",
      men_wrestling: "🤼&zwj;♂️",
      menorah: "🕎",
      mens: "🚹",
      metal: "🤘",
      metro: "🚇",
      microphone: "🎤",
      microscope: "🔬",
      milk_glass: "🥛",
      milky_way: "🌌",
      minibus: "🚐",
      minidisc: "💽",
      mobile_phone_off: "📴",
      money_mouth_face: "🤑",
      money_with_wings: "💸",
      moneybag: "💰",
      monkey: "🐒",
      monkey_face: "🐵",
      monorail: "🚝",
      moon: "🌔",
      mortar_board: "🎓",
      mosque: "🕌",
      motor_boat: "🛥",
      motor_scooter: "🛵",
      motorcycle: "🏍",
      motorway: "🛣",
      mount_fuji: "🗻",
      mountain: "⛰",
      mountain_biking_man: "🚵",
      mountain_biking_woman: "🚵&zwj;♀️",
      mountain_cableway: "🚠",
      mountain_railway: "🚞",
      mountain_snow: "🏔",
      mouse: "🐭",
      mouse2: "🐁",
      movie_camera: "🎥",
      moyai: "🗿",
      mrs_claus: "🤶",
      muscle: "💪",
      mushroom: "🍄",
      musical_keyboard: "🎹",
      musical_note: "🎵",
      musical_score: "🎼",
      mute: "🔇",
      nail_care: "💅",
      name_badge: "📛",
      national_park: "🏞",
      nauseated_face: "🤢",
      necktie: "👔",
      negative_squared_cross_mark: "❎",
      nerd_face: "🤓",
      neutral_face: "😐",
      new: "🆕",
      new_moon: "🌑",
      new_moon_with_face: "🌚",
      newspaper: "📰",
      newspaper_roll: "🗞",
      next_track_button: "⏭",
      ng: "🆖",
      no_good_man: "🙅&zwj;♂️",
      no_good_woman: "🙅",
      night_with_stars: "🌃",
      no_bell: "🔕",
      no_bicycles: "🚳",
      no_entry: "⛔️",
      no_entry_sign: "🚫",
      no_mobile_phones: "📵",
      no_mouth: "😶",
      no_pedestrians: "🚷",
      no_smoking: "🚭",
      "non-potable_water": "🚱",
      nose: "👃",
      notebook: "📓",
      notebook_with_decorative_cover: "📔",
      notes: "🎶",
      nut_and_bolt: "🔩",
      o: "⭕️",
      o2: "🅾️",
      ocean: "🌊",
      octopus: "🐙",
      oden: "🍢",
      office: "🏢",
      oil_drum: "🛢",
      ok: "🆗",
      ok_hand: "👌",
      ok_man: "🙆&zwj;♂️",
      ok_woman: "🙆",
      old_key: "🗝",
      older_man: "👴",
      older_woman: "👵",
      om: "🕉",
      on: "🔛",
      oncoming_automobile: "🚘",
      oncoming_bus: "🚍",
      oncoming_police_car: "🚔",
      oncoming_taxi: "🚖",
      open_file_folder: "📂",
      open_hands: "👐",
      open_mouth: "😮",
      open_umbrella: "☂️",
      ophiuchus: "⛎",
      orange_book: "📙",
      orthodox_cross: "☦️",
      outbox_tray: "📤",
      owl: "🦉",
      ox: "🐂",
      package: "📦",
      page_facing_up: "📄",
      page_with_curl: "📃",
      pager: "📟",
      paintbrush: "🖌",
      palm_tree: "🌴",
      pancakes: "🥞",
      panda_face: "🐼",
      paperclip: "📎",
      paperclips: "🖇",
      parasol_on_ground: "⛱",
      parking: "🅿️",
      part_alternation_mark: "〽️",
      partly_sunny: "⛅️",
      passenger_ship: "🛳",
      passport_control: "🛂",
      pause_button: "⏸",
      peace_symbol: "☮️",
      peach: "🍑",
      peanuts: "🥜",
      pear: "🍐",
      pen: "🖊",
      pencil2: "✏️",
      penguin: "🐧",
      pensive: "😔",
      performing_arts: "🎭",
      persevere: "😣",
      person_fencing: "🤺",
      pouting_woman: "🙎",
      phone: "☎️",
      pick: "⛏",
      pig: "🐷",
      pig2: "🐖",
      pig_nose: "🐽",
      pill: "💊",
      pineapple: "🍍",
      ping_pong: "🏓",
      pisces: "♓️",
      pizza: "🍕",
      place_of_worship: "🛐",
      plate_with_cutlery: "🍽",
      play_or_pause_button: "⏯",
      point_down: "👇",
      point_left: "👈",
      point_right: "👉",
      point_up: "☝️",
      point_up_2: "👆",
      police_car: "🚓",
      policewoman: "👮&zwj;♀️",
      poodle: "🐩",
      popcorn: "🍿",
      post_office: "🏣",
      postal_horn: "📯",
      postbox: "📮",
      potable_water: "🚰",
      potato: "🥔",
      pouch: "👝",
      poultry_leg: "🍗",
      pound: "💷",
      rage: "😡",
      pouting_cat: "😾",
      pouting_man: "🙎&zwj;♂️",
      pray: "🙏",
      prayer_beads: "📿",
      pregnant_woman: "🤰",
      previous_track_button: "⏮",
      prince: "🤴",
      princess: "👸",
      printer: "🖨",
      purple_heart: "💜",
      purse: "👛",
      pushpin: "📌",
      put_litter_in_its_place: "🚮",
      question: "❓",
      rabbit: "🐰",
      rabbit2: "🐇",
      racehorse: "🐎",
      racing_car: "🏎",
      radio: "📻",
      radio_button: "🔘",
      radioactive: "☢️",
      railway_car: "🚃",
      railway_track: "🛤",
      rainbow: "🌈",
      rainbow_flag: "🏳️&zwj;🌈",
      raised_back_of_hand: "🤚",
      raised_hand_with_fingers_splayed: "🖐",
      raised_hands: "🙌",
      raising_hand_woman: "🙋",
      raising_hand_man: "🙋&zwj;♂️",
      ram: "🐏",
      ramen: "🍜",
      rat: "🐀",
      record_button: "⏺",
      recycle: "♻️",
      red_circle: "🔴",
      registered: "®️",
      relaxed: "☺️",
      relieved: "😌",
      reminder_ribbon: "🎗",
      repeat: "🔁",
      repeat_one: "🔂",
      rescue_worker_helmet: "⛑",
      restroom: "🚻",
      revolving_hearts: "💞",
      rewind: "⏪",
      rhinoceros: "🦏",
      ribbon: "🎀",
      rice: "🍚",
      rice_ball: "🍙",
      rice_cracker: "🍘",
      rice_scene: "🎑",
      right_anger_bubble: "🗯",
      ring: "💍",
      robot: "🤖",
      rocket: "🚀",
      rofl: "🤣",
      roll_eyes: "🙄",
      roller_coaster: "🎢",
      rooster: "🐓",
      rose: "🌹",
      rosette: "🏵",
      rotating_light: "🚨",
      round_pushpin: "📍",
      rowing_man: "🚣",
      rowing_woman: "🚣&zwj;♀️",
      rugby_football: "🏉",
      running_man: "🏃",
      running_shirt_with_sash: "🎽",
      running_woman: "🏃&zwj;♀️",
      sa: "🈂️",
      sagittarius: "♐️",
      sake: "🍶",
      sandal: "👡",
      santa: "🎅",
      satellite: "📡",
      saxophone: "🎷",
      school: "🏫",
      school_satchel: "🎒",
      scissors: "✂️",
      scorpion: "🦂",
      scorpius: "♏️",
      scream: "😱",
      scream_cat: "🙀",
      scroll: "📜",
      seat: "💺",
      secret: "㊙️",
      see_no_evil: "🙈",
      seedling: "🌱",
      selfie: "🤳",
      shallow_pan_of_food: "🥘",
      shamrock: "☘️",
      shark: "🦈",
      shaved_ice: "🍧",
      sheep: "🐑",
      shell: "🐚",
      shield: "🛡",
      shinto_shrine: "⛩",
      ship: "🚢",
      shirt: "👕",
      shopping: "🛍",
      shopping_cart: "🛒",
      shower: "🚿",
      shrimp: "🦐",
      signal_strength: "📶",
      six_pointed_star: "🔯",
      ski: "🎿",
      skier: "⛷",
      skull: "💀",
      skull_and_crossbones: "☠️",
      sleeping: "😴",
      sleeping_bed: "🛌",
      sleepy: "😪",
      slightly_frowning_face: "🙁",
      slightly_smiling_face: "🙂",
      slot_machine: "🎰",
      small_airplane: "🛩",
      small_blue_diamond: "🔹",
      small_orange_diamond: "🔸",
      small_red_triangle: "🔺",
      small_red_triangle_down: "🔻",
      smile: "😄",
      smile_cat: "😸",
      smiley: "😃",
      smiley_cat: "😺",
      smiling_imp: "😈",
      smirk: "😏",
      smirk_cat: "😼",
      smoking: "🚬",
      snail: "🐌",
      snake: "🐍",
      sneezing_face: "🤧",
      snowboarder: "🏂",
      snowflake: "❄️",
      snowman: "⛄️",
      snowman_with_snow: "☃️",
      sob: "😭",
      soccer: "⚽️",
      soon: "🔜",
      sos: "🆘",
      sound: "🔉",
      space_invader: "👾",
      spades: "♠️",
      spaghetti: "🍝",
      sparkle: "❇️",
      sparkler: "🎇",
      sparkles: "✨",
      sparkling_heart: "💖",
      speak_no_evil: "🙊",
      speaker: "🔈",
      speaking_head: "🗣",
      speech_balloon: "💬",
      speedboat: "🚤",
      spider: "🕷",
      spider_web: "🕸",
      spiral_calendar: "🗓",
      spiral_notepad: "🗒",
      spoon: "🥄",
      squid: "🦑",
      stadium: "🏟",
      star: "⭐️",
      star2: "🌟",
      star_and_crescent: "☪️",
      star_of_david: "✡️",
      stars: "🌠",
      station: "🚉",
      statue_of_liberty: "🗽",
      steam_locomotive: "🚂",
      stew: "🍲",
      stop_button: "⏹",
      stop_sign: "🛑",
      stopwatch: "⏱",
      straight_ruler: "📏",
      strawberry: "🍓",
      stuck_out_tongue: "😛",
      stuck_out_tongue_closed_eyes: "😝",
      stuck_out_tongue_winking_eye: "😜",
      studio_microphone: "🎙",
      stuffed_flatbread: "🥙",
      sun_behind_large_cloud: "🌥",
      sun_behind_rain_cloud: "🌦",
      sun_behind_small_cloud: "🌤",
      sun_with_face: "🌞",
      sunflower: "🌻",
      sunglasses: "😎",
      sunny: "☀️",
      sunrise: "🌅",
      sunrise_over_mountains: "🌄",
      surfing_man: "🏄",
      surfing_woman: "🏄&zwj;♀️",
      sushi: "🍣",
      suspension_railway: "🚟",
      sweat: "😓",
      sweat_drops: "💦",
      sweat_smile: "😅",
      sweet_potato: "🍠",
      swimming_man: "🏊",
      swimming_woman: "🏊&zwj;♀️",
      symbols: "🔣",
      synagogue: "🕍",
      syringe: "💉",
      taco: "🌮",
      tada: "🎉",
      tanabata_tree: "🎋",
      taurus: "♉️",
      taxi: "🚕",
      tea: "🍵",
      telephone_receiver: "📞",
      telescope: "🔭",
      tennis: "🎾",
      tent: "⛺️",
      thermometer: "🌡",
      thinking: "🤔",
      thought_balloon: "💭",
      ticket: "🎫",
      tickets: "🎟",
      tiger: "🐯",
      tiger2: "🐅",
      timer_clock: "⏲",
      tipping_hand_man: "💁&zwj;♂️",
      tired_face: "😫",
      tm: "™️",
      toilet: "🚽",
      tokyo_tower: "🗼",
      tomato: "🍅",
      tongue: "👅",
      top: "🔝",
      tophat: "🎩",
      tornado: "🌪",
      trackball: "🖲",
      tractor: "🚜",
      traffic_light: "🚥",
      train: "🚋",
      train2: "🚆",
      tram: "🚊",
      triangular_flag_on_post: "🚩",
      triangular_ruler: "📐",
      trident: "🔱",
      triumph: "😤",
      trolleybus: "🚎",
      trophy: "🏆",
      tropical_drink: "🍹",
      tropical_fish: "🐠",
      truck: "🚚",
      trumpet: "🎺",
      tulip: "🌷",
      tumbler_glass: "🥃",
      turkey: "🦃",
      turtle: "🐢",
      tv: "📺",
      twisted_rightwards_arrows: "🔀",
      two_hearts: "💕",
      two_men_holding_hands: "👬",
      two_women_holding_hands: "👭",
      u5272: "🈹",
      u5408: "🈴",
      u55b6: "🈺",
      u6307: "🈯️",
      u6708: "🈷️",
      u6709: "🈶",
      u6e80: "🈵",
      u7121: "🈚️",
      u7533: "🈸",
      u7981: "🈲",
      u7a7a: "🈳",
      umbrella: "☔️",
      unamused: "😒",
      underage: "🔞",
      unicorn: "🦄",
      unlock: "🔓",
      up: "🆙",
      upside_down_face: "🙃",
      v: "✌️",
      vertical_traffic_light: "🚦",
      vhs: "📼",
      vibration_mode: "📳",
      video_camera: "📹",
      video_game: "🎮",
      violin: "🎻",
      virgo: "♍️",
      volcano: "🌋",
      volleyball: "🏐",
      vs: "🆚",
      vulcan_salute: "🖖",
      walking_man: "🚶",
      walking_woman: "🚶&zwj;♀️",
      waning_crescent_moon: "🌘",
      waning_gibbous_moon: "🌖",
      warning: "⚠️",
      wastebasket: "🗑",
      watch: "⌚️",
      water_buffalo: "🐃",
      watermelon: "🍉",
      wave: "👋",
      wavy_dash: "〰️",
      waxing_crescent_moon: "🌒",
      wc: "🚾",
      weary: "😩",
      wedding: "💒",
      weight_lifting_man: "🏋️",
      weight_lifting_woman: "🏋️&zwj;♀️",
      whale: "🐳",
      whale2: "🐋",
      wheel_of_dharma: "☸️",
      wheelchair: "♿️",
      white_check_mark: "✅",
      white_circle: "⚪️",
      white_flag: "🏳️",
      white_flower: "💮",
      white_large_square: "⬜️",
      white_medium_small_square: "◽️",
      white_medium_square: "◻️",
      white_small_square: "▫️",
      white_square_button: "🔳",
      wilted_flower: "🥀",
      wind_chime: "🎐",
      wind_face: "🌬",
      wine_glass: "🍷",
      wink: "😉",
      wolf: "🐺",
      woman: "👩",
      woman_artist: "👩&zwj;🎨",
      woman_astronaut: "👩&zwj;🚀",
      woman_cartwheeling: "🤸&zwj;♀️",
      woman_cook: "👩&zwj;🍳",
      woman_facepalming: "🤦&zwj;♀️",
      woman_factory_worker: "👩&zwj;🏭",
      woman_farmer: "👩&zwj;🌾",
      woman_firefighter: "👩&zwj;🚒",
      woman_health_worker: "👩&zwj;⚕️",
      woman_judge: "👩&zwj;⚖️",
      woman_juggling: "🤹&zwj;♀️",
      woman_mechanic: "👩&zwj;🔧",
      woman_office_worker: "👩&zwj;💼",
      woman_pilot: "👩&zwj;✈️",
      woman_playing_handball: "🤾&zwj;♀️",
      woman_playing_water_polo: "🤽&zwj;♀️",
      woman_scientist: "👩&zwj;🔬",
      woman_shrugging: "🤷&zwj;♀️",
      woman_singer: "👩&zwj;🎤",
      woman_student: "👩&zwj;🎓",
      woman_teacher: "👩&zwj;🏫",
      woman_technologist: "👩&zwj;💻",
      woman_with_turban: "👳&zwj;♀️",
      womans_clothes: "👚",
      womans_hat: "👒",
      women_wrestling: "🤼&zwj;♀️",
      womens: "🚺",
      world_map: "🗺",
      worried: "😟",
      wrench: "🔧",
      writing_hand: "✍️",
      x: "❌",
      yellow_heart: "💛",
      yen: "💴",
      yin_yang: "☯️",
      yum: "😋",
      zap: "⚡️",
      zipper_mouth_face: "🤐",
      zzz: "💤",
      octocat: '<img alt=":octocat:" height="20" width="20" align="absmiddle" src="https://assets-cdn.github.com/images/icons/emoji/octocat.png">',
      showdown: `<span style="font-family: 'Anonymous Pro', monospace; text-decoration: underline; text-decoration-style: dashed; text-decoration-color: #3e8b8a;text-underline-position: under;">S</span>`
    }, n.Converter = function(e) {
      "use strict";
      var a = {}, r = [], t = [], o = {}, c = C, s = {
        parsed: {},
        raw: "",
        format: ""
      };
      l();
      function l() {
        e = e || {};
        for (var i in v) v.hasOwnProperty(i) && (a[i] = v[i]);
        if (typeof e == "object")
          for (var p in e) e.hasOwnProperty(p) && (a[p] = e[p]);
        else throw Error("Converter expects the passed parameter to be an object, but " + typeof e + " was passed instead.");
        a.extensions && n.helper.forEach(a.extensions, k);
      }
      function k(i, p) {
        if (p = p || null, n.helper.isString(i))
          if (i = n.helper.stdExtName(i), p = i, n.extensions[i]) {
            console.warn("DEPRECATION WARNING: " + i + " is an old extension that uses a deprecated loading method.Please inform the developer that the extension should be updated!"), b(n.extensions[i], i);
            return;
          } else if (!n.helper.isUndefined(_[i])) i = _[i];
          else throw Error('Extension "' + i + '" could not be loaded. It was either not found or is not a valid extension.');
        typeof i == "function" && (i = i()), n.helper.isArray(i) || (i = [i]);
        var y = j(i, p);
        if (!y.valid) throw Error(y.error);
        for (var S = 0; S < i.length; ++S) {
          switch (i[S].type) {
            case "lang":
              r.push(i[S]);
              break;
            case "output":
              t.push(i[S]);
              break;
          }
          if (i[S].hasOwnProperty("listeners"))
            for (var E in i[S].listeners) i[S].listeners.hasOwnProperty(E) && g(E, i[S].listeners[E]);
        }
      }
      function b(i, p) {
        typeof i == "function" && (i = i(new n.Converter())), n.helper.isArray(i) || (i = [i]);
        var y = j(i, p);
        if (!y.valid) throw Error(y.error);
        for (var S = 0; S < i.length; ++S) switch (i[S].type) {
          case "lang":
            r.push(i[S]);
            break;
          case "output":
            t.push(i[S]);
            break;
          default:
            throw Error("Extension loader error: Type unrecognized!!!");
        }
      }
      function g(i, p) {
        if (!n.helper.isString(i)) throw Error("Invalid argument in converter.listen() method: name must be a string, but " + typeof i + " given");
        if (typeof p != "function") throw Error("Invalid argument in converter.listen() method: callback must be a function, but " + typeof p + " given");
        o.hasOwnProperty(i) || (o[i] = []), o[i].push(p);
      }
      function w(i) {
        var p = i.match(/^\s*/)[0].length, y = new RegExp("^\\s{0," + p + "}", "gm");
        return i.replace(y, "");
      }
      this._dispatch = function(p, y, S, E) {
        if (o.hasOwnProperty(p)) for (var P = 0; P < o[p].length; ++P) {
          var $ = o[p][P](p, y, this, S, E);
          $ && typeof $ < "u" && (y = $);
        }
        return y;
      }, this.listen = function(i, p) {
        return g(i, p), this;
      }, this.makeHtml = function(i) {
        if (!i) return i;
        var p = {
          gHtmlBlocks: [],
          gHtmlMdBlocks: [],
          gHtmlSpans: [],
          gUrls: {},
          gTitles: {},
          gDimensions: {},
          gListLevel: 0,
          hashLinkCounts: {},
          langExtensions: r,
          outputModifiers: t,
          converter: this,
          ghCodeBlocks: [],
          metadata: {
            parsed: {},
            raw: "",
            format: ""
          }
        };
        return i = i.replace(/¨/g, "¨T"), i = i.replace(/\$/g, "¨D"), i = i.replace(/\r\n/g, `
`), i = i.replace(/\r/g, `
`), i = i.replace(/\u00A0/g, "&nbsp;"), a.smartIndentationFix && (i = w(i)), i = `

` + i + `

`, i = n.subParser("detab")(i, a, p), i = i.replace(/^[ \t]+$/gm, ""), n.helper.forEach(r, function(y) {
          i = n.subParser("runExtension")(y, i, a, p);
        }), i = n.subParser("metadata")(i, a, p), i = n.subParser("hashPreCodeTags")(i, a, p), i = n.subParser("githubCodeBlocks")(i, a, p), i = n.subParser("hashHTMLBlocks")(i, a, p), i = n.subParser("hashCodeTags")(i, a, p), i = n.subParser("stripLinkDefinitions")(i, a, p), i = n.subParser("blockGamut")(i, a, p), i = n.subParser("unhashHTMLSpans")(i, a, p), i = n.subParser("unescapeSpecialChars")(i, a, p), i = i.replace(/¨D/g, "$$"), i = i.replace(/¨T/g, "¨"), i = n.subParser("completeHTMLDocument")(i, a, p), n.helper.forEach(t, function(y) {
          i = n.subParser("runExtension")(y, i, a, p);
        }), s = p.metadata, i;
      }, this.makeMarkdown = this.makeMd = function(i, p) {
        if (i = i.replace(/\r\n/g, `
`), i = i.replace(/\r/g, `
`), i = i.replace(/>[ \t]+</, ">¨NBSP;<"), !p) if (window && window.document) p = window.document;
        else throw new Error("HTMLParser is undefined. If in a webworker or nodejs environment, you need to provide a WHATWG DOM and HTML such as JSDOM");
        var y = p.createElement("div");
        y.innerHTML = i;
        var S = { preList: F(y) };
        O(y);
        for (var E = y.childNodes, P = "", $ = 0; $ < E.length; $++) P += n.subParser("makeMarkdown.node")(E[$], S);
        function O(B) {
          for (var R = 0; R < B.childNodes.length; ++R) {
            var D = B.childNodes[R];
            D.nodeType === 3 ? !/\S/.test(D.nodeValue) && !/^[ ]+$/.test(D.nodeValue) ? (B.removeChild(D), --R) : (D.nodeValue = D.nodeValue.split(`
`).join(" "), D.nodeValue = D.nodeValue.replace(/(\s)+/g, "$1")) : D.nodeType === 1 && O(D);
          }
        }
        function F(B) {
          for (var R = B.querySelectorAll("pre"), D = [], N = 0; N < R.length; ++N) if (R[N].childElementCount === 1 && R[N].firstChild.tagName.toLowerCase() === "code") {
            var K = R[N].firstChild.innerHTML.trim(), Z = R[N].firstChild.getAttribute("data-language") || "";
            if (Z === "")
              for (var ee = R[N].firstChild.className.split(" "), X = 0; X < ee.length; ++X) {
                var re = ee[X].match(/^language-(.+)$/);
                if (re !== null) {
                  Z = re[1];
                  break;
                }
              }
            K = n.helper.unescapeHTMLEntities(K), D.push(K), R[N].outerHTML = '<precode language="' + Z + '" precodenum="' + N.toString() + '"></precode>';
          } else
            D.push(R[N].innerHTML), R[N].innerHTML = "", R[N].setAttribute("prenum", N.toString());
          return D;
        }
        return P;
      }, this.setOption = function(i, p) {
        a[i] = p;
      }, this.getOption = function(i) {
        return a[i];
      }, this.getOptions = function() {
        return a;
      }, this.addExtension = function(i, p) {
        p = p || null, k(i, p);
      }, this.useExtension = function(i) {
        k(i);
      }, this.setFlavor = function(i) {
        if (!L.hasOwnProperty(i)) throw Error(i + " flavor was not found");
        var p = L[i];
        c = i;
        for (var y in p) p.hasOwnProperty(y) && (a[y] = p[y]);
      }, this.getFlavor = function() {
        return c;
      }, this.removeExtension = function(i) {
        n.helper.isArray(i) || (i = [i]);
        for (var p = 0; p < i.length; ++p) {
          for (var y = i[p], S = 0; S < r.length; ++S) r[S] === y && r.splice(S, 1);
          for (var E = 0; E < t.length; ++E) t[E] === y && t.splice(E, 1);
        }
      }, this.getAllExtensions = function() {
        return {
          language: r,
          output: t
        };
      }, this.getMetadata = function(i) {
        return i ? s.raw : s.parsed;
      }, this.getMetadataFormat = function() {
        return s.format;
      }, this._setMetadataPair = function(i, p) {
        s.parsed[i] = p;
      }, this._setMetadataFormat = function(i) {
        s.format = i;
      }, this._setMetadataRaw = function(i) {
        s.raw = i;
      };
    }, n.subParser("anchors", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("anchors.before", e, a, r);
      var t = function(o, c, s, l, k, b, g) {
        if (n.helper.isUndefined(g) && (g = ""), s = s.toLowerCase(), o.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) l = "";
        else if (!l)
          if (s || (s = c.toLowerCase().replace(/ ?\n/g, " ")), l = "#" + s, !n.helper.isUndefined(r.gUrls[s]))
            l = r.gUrls[s], n.helper.isUndefined(r.gTitles[s]) || (g = r.gTitles[s]);
          else return o;
        l = l.replace(n.helper.regexes.asteriskDashAndColon, n.helper.escapeCharactersCallback);
        var w = '<a href="' + l + '"';
        return g !== "" && g !== null && (g = g.replace(/"/g, "&quot;"), g = g.replace(n.helper.regexes.asteriskDashAndColon, n.helper.escapeCharactersCallback), w += ' title="' + g + '"'), a.openLinksInNewWindow && !/^#/.test(l) && (w += ' rel="noopener noreferrer" target="¨E95Eblank"'), w += ">" + c + "</a>", w;
      };
      return e = e.replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g, t), e = e.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g, t), e = e.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g, t), e = e.replace(/\[([^\[\]]+)]()()()()()/g, t), a.ghMentions && (e = e.replace(/(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d.-]+?[a-z\d]+)*))/gim, function(o, c, s, l, k) {
        if (s === "\\") return c + l;
        if (!n.helper.isString(a.ghMentionsLink)) throw new Error("ghMentionsLink option must be a string");
        var b = a.ghMentionsLink.replace(/\{u}/g, k), g = "";
        return a.openLinksInNewWindow && (g = ' rel="noopener noreferrer" target="¨E95Eblank"'), c + '<a href="' + b + '"' + g + ">" + l + "</a>";
      })), e = r.converter._dispatch("anchors.after", e, a, r), e;
    });
    var z = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+?\.[^'">\s]+?)()(\1)?(?=\s|$)(?!["<>])/gi, H = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]])?(\1)?(?=\s|$)(?!["<>])/gi, I = /()<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>()/gi, T = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gim, U = /<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, G = function(e) {
      "use strict";
      return function(a, r, t, o, c, s, l) {
        t = t.replace(n.helper.regexes.asteriskDashAndColon, n.helper.escapeCharactersCallback);
        var k = t, b = "", g = "", w = r || "", i = l || "";
        return /^www\./i.test(t) && (t = t.replace(/^www\./i, "http://www.")), e.excludeTrailingPunctuationFromURLs && s && (b = s), e.openLinksInNewWindow && (g = ' rel="noopener noreferrer" target="¨E95Eblank"'), w + '<a href="' + t + '"' + g + ">" + k + "</a>" + b + i;
      };
    }, x = function(e, a) {
      "use strict";
      return function(r, t, o) {
        var c = "mailto:";
        return t = t || "", o = n.subParser("unescapeSpecialChars")(o, e, a), e.encodeEmails ? (c = n.helper.encodeEmailAddress(c + o), o = n.helper.encodeEmailAddress(o)) : c = c + o, t + '<a href="' + c + '">' + o + "</a>";
      };
    };
    n.subParser("autoLinks", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("autoLinks.before", e, a, r), e = e.replace(I, G(a)), e = e.replace(U, x(a, r)), e = r.converter._dispatch("autoLinks.after", e, a, r), e;
    }), n.subParser("simplifiedAutoLinks", function(e, a, r) {
      "use strict";
      return a.simplifiedAutoLink && (e = r.converter._dispatch("simplifiedAutoLinks.before", e, a, r), a.excludeTrailingPunctuationFromURLs ? e = e.replace(H, G(a)) : e = e.replace(z, G(a)), e = e.replace(T, x(a, r)), e = r.converter._dispatch("simplifiedAutoLinks.after", e, a, r)), e;
    }), n.subParser("blockGamut", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("blockGamut.before", e, a, r), e = n.subParser("blockQuotes")(e, a, r), e = n.subParser("headers")(e, a, r), e = n.subParser("horizontalRule")(e, a, r), e = n.subParser("lists")(e, a, r), e = n.subParser("codeBlocks")(e, a, r), e = n.subParser("tables")(e, a, r), e = n.subParser("hashHTMLBlocks")(e, a, r), e = n.subParser("paragraphs")(e, a, r), e = r.converter._dispatch("blockGamut.after", e, a, r), e;
    }), n.subParser("blockQuotes", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("blockQuotes.before", e, a, r), e = e + `

`;
      var t = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;
      return a.splitAdjacentBlockquotes && (t = /^ {0,3}>[\s\S]*?(?:\n\n)/gm), e = e.replace(t, function(o) {
        return o = o.replace(/^[ \t]*>[ \t]?/gm, ""), o = o.replace(/¨0/g, ""), o = o.replace(/^[ \t]+$/gm, ""), o = n.subParser("githubCodeBlocks")(o, a, r), o = n.subParser("blockGamut")(o, a, r), o = o.replace(/(^|\n)/g, "$1  "), o = o.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function(c, s) {
          var l = s;
          return l = l.replace(/^  /gm, "¨0"), l = l.replace(/¨0/g, ""), l;
        }), n.subParser("hashBlock")(`<blockquote>
` + o + `
</blockquote>`, a, r);
      }), e = r.converter._dispatch("blockQuotes.after", e, a, r), e;
    }), n.subParser("codeBlocks", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("codeBlocks.before", e, a, r), e += "¨0", e = e.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g, function(t, o, c) {
        var s = o, l = c, k = `
`;
        return s = n.subParser("outdent")(s, a, r), s = n.subParser("encodeCode")(s, a, r), s = n.subParser("detab")(s, a, r), s = s.replace(/^\n+/g, ""), s = s.replace(/\n+$/g, ""), a.omitExtraWLInCodeBlocks && (k = ""), s = "<pre><code>" + s + k + "</code></pre>", n.subParser("hashBlock")(s, a, r) + l;
      }), e = e.replace(/¨0/, ""), e = r.converter._dispatch("codeBlocks.after", e, a, r), e;
    }), n.subParser("codeSpans", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("codeSpans.before", e, a, r), typeof e > "u" && (e = ""), e = e.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, function(t, o, c, s) {
        var l = s;
        return l = l.replace(/^([ \t]*)/g, ""), l = l.replace(/[ \t]*$/g, ""), l = n.subParser("encodeCode")(l, a, r), l = o + "<code>" + l + "</code>", l = n.subParser("hashHTMLSpans")(l, a, r), l;
      }), e = r.converter._dispatch("codeSpans.after", e, a, r), e;
    }), n.subParser("completeHTMLDocument", function(e, a, r) {
      "use strict";
      if (!a.completeHTMLDocument) return e;
      e = r.converter._dispatch("completeHTMLDocument.before", e, a, r);
      var t = "html", o = `<!DOCTYPE HTML>
`, c = "", s = `<meta charset="utf-8">
`, l = "", k = "";
      typeof r.metadata.parsed.doctype < "u" && (o = "<!DOCTYPE " + r.metadata.parsed.doctype + `>
`, t = r.metadata.parsed.doctype.toString().toLowerCase(), (t === "html" || t === "html5") && (s = '<meta charset="utf-8">'));
      for (var b in r.metadata.parsed) if (r.metadata.parsed.hasOwnProperty(b)) switch (b.toLowerCase()) {
        case "doctype":
          break;
        case "title":
          c = "<title>" + r.metadata.parsed.title + `</title>
`;
          break;
        case "charset":
          t === "html" || t === "html5" ? s = '<meta charset="' + r.metadata.parsed.charset + `">
` : s = '<meta name="charset" content="' + r.metadata.parsed.charset + `">
`;
          break;
        case "language":
        case "lang":
          l = ' lang="' + r.metadata.parsed[b] + '"', k += '<meta name="' + b + '" content="' + r.metadata.parsed[b] + `">
`;
          break;
        default:
          k += '<meta name="' + b + '" content="' + r.metadata.parsed[b] + `">
`;
      }
      return e = o + "<html" + l + `>
<head>
` + c + s + k + `</head>
<body>
` + e.trim() + `
</body>
</html>`, e = r.converter._dispatch("completeHTMLDocument.after", e, a, r), e;
    }), n.subParser("detab", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("detab.before", e, a, r), e = e.replace(/\t(?=\t)/g, "    "), e = e.replace(/\t/g, "¨A¨B"), e = e.replace(/¨B(.+?)¨A/g, function(t, o) {
        for (var c = o, s = 4 - c.length % 4, l = 0; l < s; l++) c += " ";
        return c;
      }), e = e.replace(/¨A/g, "    "), e = e.replace(/¨B/g, ""), e = r.converter._dispatch("detab.after", e, a, r), e;
    }), n.subParser("ellipsis", function(e, a, r) {
      "use strict";
      return a.ellipsis && (e = r.converter._dispatch("ellipsis.before", e, a, r), e = e.replace(/\.\.\./g, "…"), e = r.converter._dispatch("ellipsis.after", e, a, r)), e;
    }), n.subParser("emoji", function(e, a, r) {
      "use strict";
      return a.emoji && (e = r.converter._dispatch("emoji.before", e, a, r), e = e.replace(/:([\S]+?):/g, function(t, o) {
        return n.helper.emojis.hasOwnProperty(o) ? n.helper.emojis[o] : t;
      }), e = r.converter._dispatch("emoji.after", e, a, r)), e;
    }), n.subParser("encodeAmpsAndAngles", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("encodeAmpsAndAngles.before", e, a, r), e = e.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;"), e = e.replace(/<(?![a-z\/?$!])/gi, "&lt;"), e = e.replace(/</g, "&lt;"), e = e.replace(/>/g, "&gt;"), e = r.converter._dispatch("encodeAmpsAndAngles.after", e, a, r), e;
    }), n.subParser("encodeBackslashEscapes", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("encodeBackslashEscapes.before", e, a, r), e = e.replace(/\\(\\)/g, n.helper.escapeCharactersCallback), e = e.replace(/\\([`*_{}\[\]()>#+.!~=|:-])/g, n.helper.escapeCharactersCallback), e = r.converter._dispatch("encodeBackslashEscapes.after", e, a, r), e;
    }), n.subParser("encodeCode", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("encodeCode.before", e, a, r), e = e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/([*_{}\[\]\\=~-])/g, n.helper.escapeCharactersCallback), e = r.converter._dispatch("encodeCode.after", e, a, r), e;
    }), n.subParser("escapeSpecialCharsWithinTagAttributes", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("escapeSpecialCharsWithinTagAttributes.before", e, a, r);
      var t = /<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi, o = /<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi;
      return e = e.replace(t, function(c) {
        return c.replace(/(.)<\/?code>(?=.)/g, "$1`").replace(/([\\`*_~=|])/g, n.helper.escapeCharactersCallback);
      }), e = e.replace(o, function(c) {
        return c.replace(/([\\`*_~=|])/g, n.helper.escapeCharactersCallback);
      }), e = r.converter._dispatch("escapeSpecialCharsWithinTagAttributes.after", e, a, r), e;
    }), n.subParser("githubCodeBlocks", function(e, a, r) {
      "use strict";
      return a.ghCodeBlocks ? (e = r.converter._dispatch("githubCodeBlocks.before", e, a, r), e += "¨0", e = e.replace(/(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*)\n([\s\S]*?)\n(?: {0,3})\1/g, function(t, o, c, s) {
        var l = a.omitExtraWLInCodeBlocks ? "" : `
`;
        return s = n.subParser("encodeCode")(s, a, r), s = n.subParser("detab")(s, a, r), s = s.replace(/^\n+/g, ""), s = s.replace(/\n+$/g, ""), s = "<pre><code" + (c ? ' class="' + c + " language-" + c + '"' : "") + ">" + s + l + "</code></pre>", s = n.subParser("hashBlock")(s, a, r), `

¨G` + (r.ghCodeBlocks.push({
          text: t,
          codeblock: s
        }) - 1) + `G

`;
      }), e = e.replace(/¨0/, ""), r.converter._dispatch("githubCodeBlocks.after", e, a, r)) : e;
    }), n.subParser("hashBlock", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("hashBlock.before", e, a, r), e = e.replace(/(^\n+|\n+$)/g, ""), e = `

¨K` + (r.gHtmlBlocks.push(e) - 1) + `K

`, e = r.converter._dispatch("hashBlock.after", e, a, r), e;
    }), n.subParser("hashCodeTags", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("hashCodeTags.before", e, a, r);
      var t = function(o, c, s, l) {
        var k = s + n.subParser("encodeCode")(c, a, r) + l;
        return "¨C" + (r.gHtmlSpans.push(k) - 1) + "C";
      };
      return e = n.helper.replaceRecursiveRegExp(e, t, "<code\\b[^>]*>", "</code>", "gim"), e = r.converter._dispatch("hashCodeTags.after", e, a, r), e;
    }), n.subParser("hashElement", function(e, a, r) {
      "use strict";
      return function(t, o) {
        var c = o;
        return c = c.replace(/\n\n/g, `
`), c = c.replace(/^\n/, ""), c = c.replace(/\n+$/g, ""), c = `

¨K` + (r.gHtmlBlocks.push(c) - 1) + `K

`, c;
      };
    }), n.subParser("hashHTMLBlocks", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("hashHTMLBlocks.before", e, a, r);
      var t = [
        "pre",
        "div",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "table",
        "dl",
        "ol",
        "ul",
        "script",
        "noscript",
        "form",
        "fieldset",
        "iframe",
        "math",
        "style",
        "section",
        "header",
        "footer",
        "nav",
        "article",
        "aside",
        "address",
        "audio",
        "canvas",
        "figure",
        "hgroup",
        "output",
        "video",
        "p"
      ], o = function(i, p, y, S) {
        var E = i;
        return y.search(/\bmarkdown\b/) !== -1 && (E = y + r.converter.makeHtml(p) + S), `

¨K` + (r.gHtmlBlocks.push(E) - 1) + `K

`;
      };
      a.backslashEscapesHTMLTags && (e = e.replace(/\\<(\/?[^>]+?)>/g, function(i, p) {
        return "&lt;" + p + "&gt;";
      }));
      for (var c = 0; c < t.length; ++c)
        for (var s, l = new RegExp("^ {0,3}(<" + t[c] + "\\b[^>]*>)", "im"), k = "<" + t[c] + "\\b[^>]*>", b = "</" + t[c] + ">"; (s = n.helper.regexIndexOf(e, l)) !== -1; ) {
          var g = n.helper.splitAtIndex(e, s), w = n.helper.replaceRecursiveRegExp(g[1], o, k, b, "im");
          if (w === g[1]) break;
          e = g[0].concat(w);
        }
      return e = e.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, n.subParser("hashElement")(e, a, r)), e = n.helper.replaceRecursiveRegExp(e, function(i) {
        return `

¨K` + (r.gHtmlBlocks.push(i) - 1) + `K

`;
      }, "^ {0,3}<!--", "-->", "gm"), e = e.replace(/(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, n.subParser("hashElement")(e, a, r)), e = r.converter._dispatch("hashHTMLBlocks.after", e, a, r), e;
    }), n.subParser("hashHTMLSpans", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("hashHTMLSpans.before", e, a, r);
      function t(o) {
        return "¨C" + (r.gHtmlSpans.push(o) - 1) + "C";
      }
      return e = e.replace(/<[^>]+?\/>/gi, function(o) {
        return t(o);
      }), e = e.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function(o) {
        return t(o);
      }), e = e.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function(o) {
        return t(o);
      }), e = e.replace(/<[^>]+?>/gi, function(o) {
        return t(o);
      }), e = r.converter._dispatch("hashHTMLSpans.after", e, a, r), e;
    }), n.subParser("unhashHTMLSpans", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("unhashHTMLSpans.before", e, a, r);
      for (var t = 0; t < r.gHtmlSpans.length; ++t) {
        for (var o = r.gHtmlSpans[t], c = 0; /¨C(\d+)C/.test(o); ) {
          var s = RegExp.$1;
          if (o = o.replace("¨C" + s + "C", r.gHtmlSpans[s]), c === 10) {
            console.error("maximum nesting of 10 spans reached!!!");
            break;
          }
          ++c;
        }
        e = e.replace("¨C" + t + "C", o);
      }
      return e = r.converter._dispatch("unhashHTMLSpans.after", e, a, r), e;
    }), n.subParser("hashPreCodeTags", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("hashPreCodeTags.before", e, a, r);
      var t = function(o, c, s, l) {
        var k = s + n.subParser("encodeCode")(c, a, r) + l;
        return `

¨G` + (r.ghCodeBlocks.push({
          text: o,
          codeblock: k
        }) - 1) + `G

`;
      };
      return e = n.helper.replaceRecursiveRegExp(e, t, "^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>", "^ {0,3}</code>\\s*</pre>", "gim"), e = r.converter._dispatch("hashPreCodeTags.after", e, a, r), e;
    }), n.subParser("headers", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("headers.before", e, a, r);
      var t = isNaN(parseInt(a.headerLevelStart)) ? 1 : parseInt(a.headerLevelStart), o = a.smoothLivePreview ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm, c = a.smoothLivePreview ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm;
      e = e.replace(o, function(k, b) {
        var g = n.subParser("spanGamut")(b, a, r), w = a.noHeaderId ? "" : ' id="' + l(b) + '"', i = t, p = "<h" + i + w + ">" + g + "</h" + i + ">";
        return n.subParser("hashBlock")(p, a, r);
      }), e = e.replace(c, function(k, b) {
        var g = n.subParser("spanGamut")(b, a, r), w = a.noHeaderId ? "" : ' id="' + l(b) + '"', i = t + 1, p = "<h" + i + w + ">" + g + "</h" + i + ">";
        return n.subParser("hashBlock")(p, a, r);
      });
      var s = a.requireSpaceBeforeHeadingText ? /^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm : /^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;
      e = e.replace(s, function(k, b, g) {
        var w = g;
        a.customizedHeaderId && (w = g.replace(/\s?\{([^{]+?)}\s*$/, ""));
        var i = n.subParser("spanGamut")(w, a, r), p = a.noHeaderId ? "" : ' id="' + l(g) + '"', y = t - 1 + b.length, S = "<h" + y + p + ">" + i + "</h" + y + ">";
        return n.subParser("hashBlock")(S, a, r);
      });
      function l(k) {
        var b, g;
        if (a.customizedHeaderId) {
          var w = k.match(/\{([^{]+?)}\s*$/);
          w && w[1] && (k = w[1]);
        }
        return b = k, n.helper.isString(a.prefixHeaderId) ? g = a.prefixHeaderId : a.prefixHeaderId === !0 ? g = "section-" : g = "", a.rawPrefixHeaderId || (b = g + b), a.ghCompatibleHeaderId ? b = b.replace(/ /g, "-").replace(/&amp;/g, "").replace(/¨T/g, "").replace(/¨D/g, "").replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g, "").toLowerCase() : a.rawHeaderId ? b = b.replace(/ /g, "-").replace(/&amp;/g, "&").replace(/¨T/g, "¨").replace(/¨D/g, "$").replace(/["']/g, "-").toLowerCase() : b = b.replace(/[^\w]/g, "").toLowerCase(), a.rawPrefixHeaderId && (b = g + b), r.hashLinkCounts[b] ? b = b + "-" + r.hashLinkCounts[b]++ : r.hashLinkCounts[b] = 1, b;
      }
      return e = r.converter._dispatch("headers.after", e, a, r), e;
    }), n.subParser("horizontalRule", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("horizontalRule.before", e, a, r);
      var t = n.subParser("hashBlock")("<hr />", a, r);
      return e = e.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, t), e = e.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, t), e = e.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, t), e = r.converter._dispatch("horizontalRule.after", e, a, r), e;
    }), n.subParser("images", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("images.before", e, a, r);
      var t = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g, o = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g, c = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g, s = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g, l = /!\[([^\[\]]+)]()()()()()/g;
      function k(g, w, i, p, y, S, E, P) {
        return p = p.replace(/\s/g, ""), b(g, w, i, p, y, S, E, P);
      }
      function b(g, w, i, p, y, S, E, P) {
        var $ = r.gUrls, O = r.gTitles, F = r.gDimensions;
        if (i = i.toLowerCase(), P || (P = ""), g.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) p = "";
        else if (p === "" || p === null)
          if ((i === "" || i === null) && (i = w.toLowerCase().replace(/ ?\n/g, " ")), p = "#" + i, !n.helper.isUndefined($[i]))
            p = $[i], n.helper.isUndefined(O[i]) || (P = O[i]), n.helper.isUndefined(F[i]) || (y = F[i].width, S = F[i].height);
          else return g;
        w = w.replace(/"/g, "&quot;").replace(n.helper.regexes.asteriskDashAndColon, n.helper.escapeCharactersCallback), p = p.replace(n.helper.regexes.asteriskDashAndColon, n.helper.escapeCharactersCallback);
        var B = '<img src="' + p + '" alt="' + w + '"';
        return P && n.helper.isString(P) && (P = P.replace(/"/g, "&quot;").replace(n.helper.regexes.asteriskDashAndColon, n.helper.escapeCharactersCallback), B += ' title="' + P + '"'), y && S && (y = y === "*" ? "auto" : y, S = S === "*" ? "auto" : S, B += ' width="' + y + '"', B += ' height="' + S + '"'), B += " />", B;
      }
      return e = e.replace(s, b), e = e.replace(c, k), e = e.replace(o, b), e = e.replace(t, b), e = e.replace(l, b), e = r.converter._dispatch("images.after", e, a, r), e;
    }), n.subParser("italicsAndBold", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("italicsAndBold.before", e, a, r);
      function t(o, c, s) {
        return c + o + s;
      }
      return a.literalMidWordUnderscores ? (e = e.replace(/\b___(\S[\s\S]*?)___\b/g, function(o, c) {
        return t(c, "<strong><em>", "</em></strong>");
      }), e = e.replace(/\b__(\S[\s\S]*?)__\b/g, function(o, c) {
        return t(c, "<strong>", "</strong>");
      }), e = e.replace(/\b_(\S[\s\S]*?)_\b/g, function(o, c) {
        return t(c, "<em>", "</em>");
      })) : (e = e.replace(/___(\S[\s\S]*?)___/g, function(o, c) {
        return /\S$/.test(c) ? t(c, "<strong><em>", "</em></strong>") : o;
      }), e = e.replace(/__(\S[\s\S]*?)__/g, function(o, c) {
        return /\S$/.test(c) ? t(c, "<strong>", "</strong>") : o;
      }), e = e.replace(/_([^\s_][\s\S]*?)_/g, function(o, c) {
        return /\S$/.test(c) ? t(c, "<em>", "</em>") : o;
      })), a.literalMidWordAsterisks ? (e = e.replace(/([^*]|^)\B\*\*\*(\S[\s\S]*?)\*\*\*\B(?!\*)/g, function(o, c, s) {
        return t(s, c + "<strong><em>", "</em></strong>");
      }), e = e.replace(/([^*]|^)\B\*\*(\S[\s\S]*?)\*\*\B(?!\*)/g, function(o, c, s) {
        return t(s, c + "<strong>", "</strong>");
      }), e = e.replace(/([^*]|^)\B\*(\S[\s\S]*?)\*\B(?!\*)/g, function(o, c, s) {
        return t(s, c + "<em>", "</em>");
      })) : (e = e.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g, function(o, c) {
        return /\S$/.test(c) ? t(c, "<strong><em>", "</em></strong>") : o;
      }), e = e.replace(/\*\*(\S[\s\S]*?)\*\*/g, function(o, c) {
        return /\S$/.test(c) ? t(c, "<strong>", "</strong>") : o;
      }), e = e.replace(/\*([^\s*][\s\S]*?)\*/g, function(o, c) {
        return /\S$/.test(c) ? t(c, "<em>", "</em>") : o;
      })), e = r.converter._dispatch("italicsAndBold.after", e, a, r), e;
    }), n.subParser("lists", function(e, a, r) {
      "use strict";
      function t(s, l) {
        r.gListLevel++, s = s.replace(/\n{2,}$/, `
`), s += "¨0";
        var k = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm, b = /\n[ \t]*\n(?!¨0)/.test(s);
        return a.disableForced4SpacesIndentedSublists && (k = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm), s = s.replace(k, function(g, w, i, p, y, S, E) {
          E = E && E.trim() !== "";
          var P = n.subParser("outdent")(y, a, r), $ = "";
          return S && a.tasklists && ($ = ' class="task-list-item" style="list-style-type: none;"', P = P.replace(/^[ \t]*\[(x|X| )?]/m, function() {
            var O = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
            return E && (O += " checked"), O += ">", O;
          })), P = P.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g, function(O) {
            return "¨A" + O;
          }), w || P.search(/\n{2,}/) > -1 ? (P = n.subParser("githubCodeBlocks")(P, a, r), P = n.subParser("blockGamut")(P, a, r)) : (P = n.subParser("lists")(P, a, r), P = P.replace(/\n$/, ""), P = n.subParser("hashHTMLBlocks")(P, a, r), P = P.replace(/\n\n+/g, `

`), b ? P = n.subParser("paragraphs")(P, a, r) : P = n.subParser("spanGamut")(P, a, r)), P = P.replace("¨A", ""), P = "<li" + $ + ">" + P + `</li>
`, P;
        }), s = s.replace(/¨0/g, ""), r.gListLevel--, l && (s = s.replace(/\s+$/, "")), s;
      }
      function o(s, l) {
        if (l === "ol") {
          var k = s.match(/^ *(\d+)\./);
          if (k && k[1] !== "1") return ' start="' + k[1] + '"';
        }
        return "";
      }
      function c(s, l, k) {
        var b = a.disableForced4SpacesIndentedSublists ? /^ ?\d+\.[ \t]/gm : /^ {0,3}\d+\.[ \t]/gm, g = a.disableForced4SpacesIndentedSublists ? /^ ?[*+-][ \t]/gm : /^ {0,3}[*+-][ \t]/gm, w = l === "ul" ? b : g, i = "";
        if (s.search(w) !== -1) (function y(S) {
          var E = S.search(w), P = o(s, l);
          E !== -1 ? (i += `

<` + l + P + `>
` + t(S.slice(0, E), !!k) + "</" + l + `>
`, l = l === "ul" ? "ol" : "ul", w = l === "ul" ? b : g, y(S.slice(E))) : i += `

<` + l + P + `>
` + t(S, !!k) + "</" + l + `>
`;
        })(s);
        else {
          var p = o(s, l);
          i = `

<` + l + p + `>
` + t(s, !!k) + "</" + l + `>
`;
        }
        return i;
      }
      return e = r.converter._dispatch("lists.before", e, a, r), e += "¨0", r.gListLevel ? e = e.replace(/^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm, function(s, l, k) {
        return c(l, k.search(/[*+-]/g) > -1 ? "ul" : "ol", !0);
      }) : e = e.replace(/(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm, function(s, l, k, b) {
        return c(k, b.search(/[*+-]/g) > -1 ? "ul" : "ol", !1);
      }), e = e.replace(/¨0/, ""), e = r.converter._dispatch("lists.after", e, a, r), e;
    }), n.subParser("metadata", function(e, a, r) {
      "use strict";
      if (!a.metadata) return e;
      e = r.converter._dispatch("metadata.before", e, a, r);
      function t(o) {
        r.metadata.raw = o, o = o.replace(/&/g, "&amp;").replace(/"/g, "&quot;"), o = o.replace(/\n {4}/g, " "), o.replace(/^([\S ]+): +([\s\S]+?)$/gm, function(c, s, l) {
          return r.metadata.parsed[s] = l, "";
        });
      }
      return e = e.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/, function(o, c, s) {
        return t(s), "¨M";
      }), e = e.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/, function(o, c, s) {
        return c && (r.metadata.format = c), t(s), "¨M";
      }), e = e.replace(/¨M/g, ""), e = r.converter._dispatch("metadata.after", e, a, r), e;
    }), n.subParser("outdent", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("outdent.before", e, a, r), e = e.replace(/^(\t|[ ]{1,4})/gm, "¨0"), e = e.replace(/¨0/g, ""), e = r.converter._dispatch("outdent.after", e, a, r), e;
    }), n.subParser("paragraphs", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("paragraphs.before", e, a, r), e = e.replace(/^\n+/g, ""), e = e.replace(/\n+$/g, "");
      for (var t = e.split(/\n{2,}/g), o = [], c = t.length, s = 0; s < c; s++) {
        var l = t[s];
        l.search(/¨(K|G)(\d+)\1/g) >= 0 ? o.push(l) : l.search(/\S/) >= 0 && (l = n.subParser("spanGamut")(l, a, r), l = l.replace(/^([ \t]*)/g, "<p>"), l += "</p>", o.push(l));
      }
      for (c = o.length, s = 0; s < c; s++) {
        for (var k = "", b = o[s], g = !1; /¨(K|G)(\d+)\1/.test(b); ) {
          var w = RegExp.$1, i = RegExp.$2;
          w === "K" ? k = r.gHtmlBlocks[i] : g ? k = n.subParser("encodeCode")(r.ghCodeBlocks[i].text, a, r) : k = r.ghCodeBlocks[i].codeblock, k = k.replace(/\$/g, "$$$$"), b = b.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/, k), /^<pre\b[^>]*>\s*<code\b[^>]*>/.test(b) && (g = !0);
        }
        o[s] = b;
      }
      return e = o.join(`
`), e = e.replace(/^\n+/g, ""), e = e.replace(/\n+$/g, ""), r.converter._dispatch("paragraphs.after", e, a, r);
    }), n.subParser("runExtension", function(e, a, r, t) {
      "use strict";
      if (e.filter) a = e.filter(a, t.converter, r);
      else if (e.regex) {
        var o = e.regex;
        o instanceof RegExp || (o = new RegExp(o, "g")), a = a.replace(o, e.replace);
      }
      return a;
    }), n.subParser("spanGamut", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("spanGamut.before", e, a, r), e = n.subParser("codeSpans")(e, a, r), e = n.subParser("escapeSpecialCharsWithinTagAttributes")(e, a, r), e = n.subParser("encodeBackslashEscapes")(e, a, r), e = n.subParser("images")(e, a, r), e = n.subParser("anchors")(e, a, r), e = n.subParser("autoLinks")(e, a, r), e = n.subParser("simplifiedAutoLinks")(e, a, r), e = n.subParser("emoji")(e, a, r), e = n.subParser("underline")(e, a, r), e = n.subParser("italicsAndBold")(e, a, r), e = n.subParser("strikethrough")(e, a, r), e = n.subParser("ellipsis")(e, a, r), e = n.subParser("hashHTMLSpans")(e, a, r), e = n.subParser("encodeAmpsAndAngles")(e, a, r), a.simpleLineBreaks ? /\n\n¨K/.test(e) || (e = e.replace(/\n+/g, `<br />
`)) : e = e.replace(/  +\n/g, `<br />
`), e = r.converter._dispatch("spanGamut.after", e, a, r), e;
    }), n.subParser("strikethrough", function(e, a, r) {
      "use strict";
      function t(o) {
        return a.simplifiedAutoLink && (o = n.subParser("simplifiedAutoLinks")(o, a, r)), "<del>" + o + "</del>";
      }
      return a.strikethrough && (e = r.converter._dispatch("strikethrough.before", e, a, r), e = e.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, function(o, c) {
        return t(c);
      }), e = r.converter._dispatch("strikethrough.after", e, a, r)), e;
    }), n.subParser("stripLinkDefinitions", function(e, a, r) {
      "use strict";
      var t = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm, o = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;
      e += "¨0";
      var c = function(s, l, k, b, g, w, i) {
        return l = l.toLowerCase(), e.toLowerCase().split(l).length - 1 < 2 ? s : (k.match(/^data:.+?\/.+?;base64,/) ? r.gUrls[l] = k.replace(/\s/g, "") : r.gUrls[l] = n.subParser("encodeAmpsAndAngles")(k, a, r), w ? w + i : (i && (r.gTitles[l] = i.replace(/"|'/g, "&quot;")), a.parseImgDimensions && b && g && (r.gDimensions[l] = {
          width: b,
          height: g
        }), ""));
      };
      return e = e.replace(o, c), e = e.replace(t, c), e = e.replace(/¨0/, ""), e;
    }), n.subParser("tables", function(e, a, r) {
      "use strict";
      if (!a.tables) return e;
      var t = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm, o = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;
      function c(g) {
        return /^:[ \t]*--*$/.test(g) ? ' style="text-align:left;"' : /^--*[ \t]*:[ \t]*$/.test(g) ? ' style="text-align:right;"' : /^:[ \t]*--*[ \t]*:$/.test(g) ? ' style="text-align:center;"' : "";
      }
      function s(g, w) {
        var i = "";
        return g = g.trim(), (a.tablesHeaderId || a.tableHeaderId) && (i = ' id="' + g.replace(/ /g, "_").toLowerCase() + '"'), g = n.subParser("spanGamut")(g, a, r), "<th" + i + w + ">" + g + `</th>
`;
      }
      function l(g, w) {
        var i = n.subParser("spanGamut")(g, a, r);
        return "<td" + w + ">" + i + `</td>
`;
      }
      function k(g, w) {
        for (var i = `<table>
<thead>
<tr>
`, p = g.length, y = 0; y < p; ++y) i += g[y];
        for (i += `</tr>
</thead>
<tbody>
`, y = 0; y < w.length; ++y) {
          i += `<tr>
`;
          for (var S = 0; S < p; ++S) i += w[y][S];
          i += `</tr>
`;
        }
        return i += `</tbody>
</table>
`, i;
      }
      function b(g) {
        var w, i = g.split(`
`);
        for (w = 0; w < i.length; ++w)
          /^ {0,3}\|/.test(i[w]) && (i[w] = i[w].replace(/^ {0,3}\|/, "")), /\|[ \t]*$/.test(i[w]) && (i[w] = i[w].replace(/\|[ \t]*$/, "")), i[w] = n.subParser("codeSpans")(i[w], a, r);
        var p = i[0].split("|").map(function(B) {
          return B.trim();
        }), y = i[1].split("|").map(function(B) {
          return B.trim();
        }), S = [], E = [], P = [], $ = [];
        for (i.shift(), i.shift(), w = 0; w < i.length; ++w)
          i[w].trim() !== "" && S.push(i[w].split("|").map(function(B) {
            return B.trim();
          }));
        if (p.length < y.length) return g;
        for (w = 0; w < y.length; ++w) P.push(c(y[w]));
        for (w = 0; w < p.length; ++w)
          n.helper.isUndefined(P[w]) && (P[w] = ""), E.push(s(p[w], P[w]));
        for (w = 0; w < S.length; ++w) {
          for (var O = [], F = 0; F < E.length; ++F)
            n.helper.isUndefined(S[w][F]), O.push(l(S[w][F], P[F]));
          $.push(O);
        }
        return k(E, $);
      }
      return e = r.converter._dispatch("tables.before", e, a, r), e = e.replace(/\\(\|)/g, n.helper.escapeCharactersCallback), e = e.replace(t, b), e = e.replace(o, b), e = r.converter._dispatch("tables.after", e, a, r), e;
    }), n.subParser("underline", function(e, a, r) {
      "use strict";
      return a.underline && (e = r.converter._dispatch("underline.before", e, a, r), a.literalMidWordUnderscores ? (e = e.replace(/\b___(\S[\s\S]*?)___\b/g, function(t, o) {
        return "<u>" + o + "</u>";
      }), e = e.replace(/\b__(\S[\s\S]*?)__\b/g, function(t, o) {
        return "<u>" + o + "</u>";
      })) : (e = e.replace(/___(\S[\s\S]*?)___/g, function(t, o) {
        return /\S$/.test(o) ? "<u>" + o + "</u>" : t;
      }), e = e.replace(/__(\S[\s\S]*?)__/g, function(t, o) {
        return /\S$/.test(o) ? "<u>" + o + "</u>" : t;
      })), e = e.replace(/(_)/g, n.helper.escapeCharactersCallback), e = r.converter._dispatch("underline.after", e, a, r)), e;
    }), n.subParser("unescapeSpecialChars", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("unescapeSpecialChars.before", e, a, r), e = e.replace(/¨E(\d+)E/g, function(t, o) {
        var c = parseInt(o);
        return String.fromCharCode(c);
      }), e = r.converter._dispatch("unescapeSpecialChars.after", e, a, r), e;
    }), n.subParser("makeMarkdown.blockquote", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes())
        for (var t = e.childNodes, o = t.length, c = 0; c < o; ++c) {
          var s = n.subParser("makeMarkdown.node")(t[c], a);
          s !== "" && (r += s);
        }
      return r = r.trim(), r = "> " + r.split(`
`).join(`
> `), r;
    }), n.subParser("makeMarkdown.codeBlock", function(e, a) {
      "use strict";
      var r = e.getAttribute("language"), t = e.getAttribute("precodenum");
      return "```" + r + `
` + a.preList[t] + "\n```";
    }), n.subParser("makeMarkdown.codeSpan", function(e) {
      "use strict";
      return "`" + e.innerHTML + "`";
    }), n.subParser("makeMarkdown.emphasis", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes()) {
        r += "*";
        for (var t = e.childNodes, o = t.length, c = 0; c < o; ++c) r += n.subParser("makeMarkdown.node")(t[c], a);
        r += "*";
      }
      return r;
    }), n.subParser("makeMarkdown.header", function(e, a, r) {
      "use strict";
      var t = new Array(r + 1).join("#"), o = "";
      if (e.hasChildNodes()) {
        o = t + " ";
        for (var c = e.childNodes, s = c.length, l = 0; l < s; ++l) o += n.subParser("makeMarkdown.node")(c[l], a);
      }
      return o;
    }), n.subParser("makeMarkdown.hr", function() {
      "use strict";
      return "---";
    }), n.subParser("makeMarkdown.image", function(e) {
      "use strict";
      var a = "";
      return e.hasAttribute("src") && (a += "![" + e.getAttribute("alt") + "](", a += "<" + e.getAttribute("src") + ">", e.hasAttribute("width") && e.hasAttribute("height") && (a += " =" + e.getAttribute("width") + "x" + e.getAttribute("height")), e.hasAttribute("title") && (a += ' "' + e.getAttribute("title") + '"'), a += ")"), a;
    }), n.subParser("makeMarkdown.links", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes() && e.hasAttribute("href")) {
        var t = e.childNodes, o = t.length;
        r = "[";
        for (var c = 0; c < o; ++c) r += n.subParser("makeMarkdown.node")(t[c], a);
        r += "](", r += "<" + e.getAttribute("href") + ">", e.hasAttribute("title") && (r += ' "' + e.getAttribute("title") + '"'), r += ")";
      }
      return r;
    }), n.subParser("makeMarkdown.list", function(e, a, r) {
      "use strict";
      var t = "";
      if (!e.hasChildNodes()) return "";
      for (var o = e.childNodes, c = o.length, s = e.getAttribute("start") || 1, l = 0; l < c; ++l)
        if (!(typeof o[l].tagName > "u" || o[l].tagName.toLowerCase() !== "li")) {
          var k = "";
          r === "ol" ? k = s.toString() + ". " : k = "- ", t += k + n.subParser("makeMarkdown.listItem")(o[l], a), ++s;
        }
      return t += `
<!-- -->
`, t.trim();
    }), n.subParser("makeMarkdown.listItem", function(e, a) {
      "use strict";
      for (var r = "", t = e.childNodes, o = t.length, c = 0; c < o; ++c) r += n.subParser("makeMarkdown.node")(t[c], a);
      return /\n$/.test(r) ? r = r.split(`
`).join(`
    `).replace(/^ {4}$/gm, "").replace(/\n\n+/g, `

`) : r += `
`, r;
    }), n.subParser("makeMarkdown.node", function(e, a, r) {
      "use strict";
      r = r || !1;
      var t = "";
      if (e.nodeType === 3) return n.subParser("makeMarkdown.txt")(e, a);
      if (e.nodeType === 8) return "<!--" + e.data + `-->

`;
      if (e.nodeType !== 1) return "";
      switch (e.tagName.toLowerCase()) {
        case "h1":
          r || (t = n.subParser("makeMarkdown.header")(e, a, 1) + `

`);
          break;
        case "h2":
          r || (t = n.subParser("makeMarkdown.header")(e, a, 2) + `

`);
          break;
        case "h3":
          r || (t = n.subParser("makeMarkdown.header")(e, a, 3) + `

`);
          break;
        case "h4":
          r || (t = n.subParser("makeMarkdown.header")(e, a, 4) + `

`);
          break;
        case "h5":
          r || (t = n.subParser("makeMarkdown.header")(e, a, 5) + `

`);
          break;
        case "h6":
          r || (t = n.subParser("makeMarkdown.header")(e, a, 6) + `

`);
          break;
        case "p":
          r || (t = n.subParser("makeMarkdown.paragraph")(e, a) + `

`);
          break;
        case "blockquote":
          r || (t = n.subParser("makeMarkdown.blockquote")(e, a) + `

`);
          break;
        case "hr":
          r || (t = n.subParser("makeMarkdown.hr")(e, a) + `

`);
          break;
        case "ol":
          r || (t = n.subParser("makeMarkdown.list")(e, a, "ol") + `

`);
          break;
        case "ul":
          r || (t = n.subParser("makeMarkdown.list")(e, a, "ul") + `

`);
          break;
        case "precode":
          r || (t = n.subParser("makeMarkdown.codeBlock")(e, a) + `

`);
          break;
        case "pre":
          r || (t = n.subParser("makeMarkdown.pre")(e, a) + `

`);
          break;
        case "table":
          r || (t = n.subParser("makeMarkdown.table")(e, a) + `

`);
          break;
        case "code":
          t = n.subParser("makeMarkdown.codeSpan")(e, a);
          break;
        case "em":
        case "i":
          t = n.subParser("makeMarkdown.emphasis")(e, a);
          break;
        case "strong":
        case "b":
          t = n.subParser("makeMarkdown.strong")(e, a);
          break;
        case "del":
          t = n.subParser("makeMarkdown.strikethrough")(e, a);
          break;
        case "a":
          t = n.subParser("makeMarkdown.links")(e, a);
          break;
        case "img":
          t = n.subParser("makeMarkdown.image")(e, a);
          break;
        default:
          t = e.outerHTML + `

`;
      }
      return t;
    }), n.subParser("makeMarkdown.paragraph", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes())
        for (var t = e.childNodes, o = t.length, c = 0; c < o; ++c) r += n.subParser("makeMarkdown.node")(t[c], a);
      return r = r.trim(), r;
    }), n.subParser("makeMarkdown.pre", function(e, a) {
      "use strict";
      var r = e.getAttribute("prenum");
      return "<pre>" + a.preList[r] + "</pre>";
    }), n.subParser("makeMarkdown.strikethrough", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes()) {
        r += "~~";
        for (var t = e.childNodes, o = t.length, c = 0; c < o; ++c) r += n.subParser("makeMarkdown.node")(t[c], a);
        r += "~~";
      }
      return r;
    }), n.subParser("makeMarkdown.strong", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes()) {
        r += "**";
        for (var t = e.childNodes, o = t.length, c = 0; c < o; ++c) r += n.subParser("makeMarkdown.node")(t[c], a);
        r += "**";
      }
      return r;
    }), n.subParser("makeMarkdown.table", function(e, a) {
      "use strict";
      var r = "", t = [[], []], o = e.querySelectorAll("thead>tr>th"), c = e.querySelectorAll("tbody>tr"), s, l;
      for (s = 0; s < o.length; ++s) {
        var k = n.subParser("makeMarkdown.tableCell")(o[s], a), b = "---";
        if (o[s].hasAttribute("style")) switch (o[s].getAttribute("style").toLowerCase().replace(/\s/g, "")) {
          case "text-align:left;":
            b = ":---";
            break;
          case "text-align:right;":
            b = "---:";
            break;
          case "text-align:center;":
            b = ":---:";
            break;
        }
        t[0][s] = k.trim(), t[1][s] = b;
      }
      for (s = 0; s < c.length; ++s) {
        var g = t.push([]) - 1, w = c[s].getElementsByTagName("td");
        for (l = 0; l < o.length; ++l) {
          var i = " ";
          typeof w[l] < "u" && (i = n.subParser("makeMarkdown.tableCell")(w[l], a)), t[g].push(i);
        }
      }
      var p = 3;
      for (s = 0; s < t.length; ++s) for (l = 0; l < t[s].length; ++l) {
        var y = t[s][l].length;
        y > p && (p = y);
      }
      for (s = 0; s < t.length; ++s) {
        for (l = 0; l < t[s].length; ++l) s === 1 ? t[s][l].slice(-1) === ":" ? t[s][l] = n.helper.padEnd(t[s][l].slice(-1), p - 1, "-") + ":" : t[s][l] = n.helper.padEnd(t[s][l], p, "-") : t[s][l] = n.helper.padEnd(t[s][l], p);
        r += "| " + t[s].join(" | ") + ` |
`;
      }
      return r.trim();
    }), n.subParser("makeMarkdown.tableCell", function(e, a) {
      "use strict";
      var r = "";
      if (!e.hasChildNodes()) return "";
      for (var t = e.childNodes, o = t.length, c = 0; c < o; ++c) r += n.subParser("makeMarkdown.node")(t[c], a, !0);
      return r.trim();
    }), n.subParser("makeMarkdown.txt", function(e) {
      "use strict";
      var a = e.nodeValue;
      return a = a.replace(/ +/g, " "), a = a.replace(/¨NBSP;/g, " "), a = n.helper.unescapeHTMLEntities(a), a = a.replace(/([*_~|`])/g, "\\$1"), a = a.replace(/^(\s*)>/g, "\\$1>"), a = a.replace(/^#/gm, "\\#"), a = a.replace(/^(\s*)([-=]{3,})(\s*)$/, "$1\\$2$3"), a = a.replace(/^( {0,3}\d+)\./gm, "$1\\."), a = a.replace(/^( {0,3})([+-])/gm, "$1\\$2"), a = a.replace(/]([\s]*)\(/g, "\\]$1\\("), a = a.replace(/^ {0,3}\[([\S \t]*?)]:/gm, "\\[$1]:"), a;
    });
    var me = this;
    typeof define == "function" && define.amd ? define(function() {
      "use strict";
      return n;
    }) : typeof u < "u" && u.exports ? u.exports = n : me.showdown = n;
  }).call(f);
})), de = /* @__PURE__ */ Se(Pe(), 1), Y = /* @__PURE__ */ new Set([
  "script",
  "style",
  "textarea",
  "title"
]), Ce = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]), ze = /* @__PURE__ */ new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "cite",
  "code",
  "data",
  "del",
  "dfn",
  "em",
  "i",
  "ins",
  "kbd",
  "label",
  "mark",
  "q",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var"
]);
function he(f = "", u = 0) {
  const d = String(f || "");
  if (d[u] !== "<") return null;
  let h = u + 1;
  for (; /\s/.test(d[h] || ""); ) h += 1;
  const n = d[h] === "/";
  if (n)
    for (h += 1; /\s/.test(d[h] || ""); ) h += 1;
  if (!/[a-z]/i.test(d[h] || "")) return null;
  const m = h;
  for (; /[\w:.-]/.test(d[h] || ""); ) h += 1;
  const _ = d.slice(m, h).toLowerCase();
  let v = "";
  for (; h < d.length; h += 1) {
    const C = d[h];
    if (v) {
      C === v && (v = "");
      continue;
    }
    if (C === '"' || C === "'") {
      v = C;
      continue;
    }
    if (C !== ">") continue;
    const L = d.slice(u, h + 1);
    return {
      start: u,
      end: h + 1,
      name: _,
      closing: n,
      selfClosing: !n && (Ce.has(_) || /\/\s*>$/.test(L))
    };
  }
  return null;
}
function je(f = "", u = "", d = 0) {
  const h = String(f || ""), n = h.toLowerCase(), m = `</${String(u || "").toLowerCase()}`;
  let _ = d;
  for (; (_ = n.indexOf(m, _)) >= 0; ) {
    const v = he(h, _);
    if (v?.closing && v.name === u) return v;
    _ += m.length;
  }
  return null;
}
function W(f = "") {
  const u = String(f || ""), d = [];
  let h = 0, n = "";
  for (; h < u.length; ) {
    if (n) {
      const v = je(u, n, h);
      if (!v) break;
      d.push(v), h = v.end, n = "";
      continue;
    }
    const m = u.indexOf("<", h);
    if (m < 0) break;
    if (u.startsWith("<!--", m)) {
      const v = u.indexOf("-->", m + 4);
      h = v < 0 ? u.length : v + 3;
      continue;
    }
    if (u.startsWith("<![CDATA[", m)) {
      const v = u.indexOf("]]>", m + 9);
      h = v < 0 ? u.length : v + 3;
      continue;
    }
    if (/^<\s*[!?]/.test(u.slice(m))) {
      const v = u.indexOf(">", m + 2);
      h = v < 0 ? u.length : v + 1;
      continue;
    }
    const _ = he(u, m);
    if (!_) {
      h = m + 1;
      continue;
    }
    d.push(_), h = _.end, !_.closing && !_.selfClosing && Y.has(_.name) && (n = _.name);
  }
  return d;
}
function Me(f = "", u = W(f)) {
  const d = String(f || "");
  let h = "", n = 0;
  return u.forEach((m) => {
    h += d.slice(n, m.start), n = m.end;
  }), h + d.slice(n);
}
function V(f = "") {
  const u = String(f || "").trim();
  if (!u || !u.startsWith("<") || !u.endsWith(">") || /^<!--[\s\S]*-->$/.test(u) || /^<!doctype\b/i.test(u) || /^<\?xml\b/i.test(u)) return !1;
  const d = W(u);
  if (!d.length || d.some((n) => Y.has(n.name))) return !1;
  const h = Me(u, d).trim();
  return !h || !/(^|\s)(?:#{1,6}\s|[-+*]\s|\d+\.\s|```|~~~|>\s)/.test(h);
}
function fe(f = []) {
  const u = [], d = [];
  let h = 0;
  return f.forEach((n) => {
    if (n.selfClosing) return;
    if (!n.closing) {
      h += 1, u.push({
        id: h,
        tag: n,
        depth: u.length
      });
      return;
    }
    const m = u[u.length - 1];
    if (!m || m.tag.name !== n.name) {
      u.length = 0;
      return;
    }
    u.pop(), d.push({
      id: m.id,
      start: m.tag.end,
      end: n.start,
      depth: m.depth,
      rawText: Y.has(n.name),
      blockContainer: !ze.has(n.name),
      openingTag: m.tag,
      closingTag: n
    });
  }), d;
}
function pe(f = []) {
  const u = [];
  let d = 0;
  return f.forEach((h) => {
    u.push(d), d += String(h || "").length + 1;
  }), u;
}
function Ee(f = [], u = 0) {
  return f.filter((d) => d.start <= u && u < d.end);
}
function Le(f = "", u = 0, d = [], h = []) {
  const n = String(f || ""), m = u + n.length, _ = d.filter((M) => M.start < m && M.end > u), v = [];
  let C = u;
  _.forEach((M) => {
    M.start > C && v.push([C, Math.min(M.start, m)]), C = Math.max(C, M.end);
  }), C < m && v.push([C, m]);
  let L = null, j = !1;
  for (const [M, A] of v) {
    const z = n.slice(Math.max(0, M - u), Math.max(0, A - u)).search(/\S/);
    if (z < 0) continue;
    j = !0;
    const H = Ee(h, M + z);
    if (H.some((T) => T.rawText)) return null;
    const I = new Set(H.filter((T) => T.blockContainer && !T.rawText).map((T) => T.id));
    if (!I.size || (L = L === null ? I : new Set([...L].filter((T) => I.has(T))), !L.size)) return null;
  }
  return !j || !L?.size ? null : h.filter((M) => L.has(M.id)).sort((M, A) => A.depth - M.depth)[0] || null;
}
function Ae(f = []) {
  const u = f.filter((h) => String(h || "").trim()).map((h) => (String(h || "").match(/^[ \t]*/) || [""])[0]);
  if (!u.length) return "";
  let d = u[0];
  for (const h of u.slice(1)) {
    let n = 0;
    for (; n < d.length && n < h.length && d[n] === h[n]; ) n += 1;
    if (d = d.slice(0, n), !d) break;
  }
  return d;
}
function Te(f = []) {
  const u = [...f], d = W(u.join(`
`)), h = fe(d);
  if (!h.length) return u;
  const n = pe(u), m = u.map((_, v) => V(_) ? null : Le(_, n[v], d, h));
  for (let _ = 0; _ < u.length; ) {
    const v = m[_];
    if (!v) {
      _ += 1;
      continue;
    }
    const C = _;
    for (_ += 1; _ < u.length; ) {
      if (m[_]?.id === v.id) {
        _ += 1;
        continue;
      }
      if (!u[_].trim() && !V(u[_])) {
        _ += 1;
        continue;
      }
      break;
    }
    const L = Ae(u.slice(C, _));
    if (L)
      for (let j = C; j < _; j += 1) u[j].trim() && (u[j] = u[j].slice(L.length));
  }
  return u;
}
function ae(f = [], u = 0) {
  let d = 0, h = f.length - 1;
  for (; d <= h; ) {
    const n = Math.floor((d + h) / 2);
    if (f[n] <= u) {
      if (n === f.length - 1 || f[n + 1] > u) return n;
      d = n + 1;
    } else h = n - 1;
  }
  return 0;
}
function He(f = []) {
  const u = W(f.join(`
`)), d = fe(u);
  if (!d.length) return f;
  const h = pe(f), n = /* @__PURE__ */ new Set();
  d.forEach((_) => {
    const v = ae(h, _.openingTag.start), C = ae(h, _.closingTag.start);
    !_.blockContainer || v === C || (n.add(_.openingTag.start), n.add(_.closingTag.start));
  });
  const m = [];
  return f.forEach((_, v) => {
    if (V(_)) {
      m.push(_);
      return;
    }
    const C = h[v], L = C + _.length, j = u.filter((T) => T.start >= C && T.end <= L && n.has(T.start));
    let M = 0, A = (_.match(/^[ \t]*/) || [""])[0].length;
    for (const T of j.filter((U) => !U.closing).sort((U, G) => U.start - G.start)) {
      if (T.start - C !== A) break;
      for (M = T.end - C, A = M; /[ \t]/.test(_[A] || ""); ) A += 1;
    }
    let z = _.length;
    A = _.length - (_.match(/[ \t]*$/) || [""])[0].length;
    for (const T of j.filter((U) => U.closing).sort((U, G) => G.end - U.end)) {
      if (T.end - C !== A) break;
      for (z = T.start - C, A = z; A > 0 && /[ \t]/.test(_[A - 1]); ) A -= 1;
    }
    if (!M && z === _.length) {
      m.push(_);
      return;
    }
    M && m.push(_.slice(0, M));
    const H = z === _.length ? _.length : z, I = _.slice(M, H);
    I.trim() && m.push(I), z < _.length && m.push(_.slice(z));
  }), m;
}
function Be(f = []) {
  return He(Te(f));
}
var Q = null, ne = !1, te = 0, $e = /* @__PURE__ */ new Map(), se = 0, J = /* @__PURE__ */ new Map(), Re = /* @__PURE__ */ new Set([
  "html",
  "htm",
  "xhtml",
  "xml",
  "svg",
  "vue",
  "svelte"
]), q = [".xb-tavern-markdown", ".xb-assistant-markdown"];
function Ie(f) {
  return String(f || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Oe() {
  return te += 1, `html-${Date.now().toString(36)}-${te.toString(36)}`;
}
function De() {
  return se += 1, `raw-${Date.now().toString(36)}-${se.toString(36)}`;
}
function Ne(f = "") {
  return Re.has(String(f || "").trim().toLowerCase());
}
function Fe() {
  ne || (ne = !0, de.default.subParser("unhashHTMLSpans", function(u, d, h) {
    let n = h.converter._dispatch("unhashHTMLSpans.before", u, d, h);
    for (let m = 0; m < h.gHtmlSpans.length; m += 1) {
      let _ = h.gHtmlSpans[m], v = 0;
      for (; /¨C(\d+)C/.test(_); ) {
        const C = RegExp.$1;
        if (_ = _.replace(`¨C${C}C`, h.gHtmlSpans[C]), v === 1e4) break;
        v += 1;
      }
      n = n.replace(`¨C${m}C`, _);
    }
    return h.converter._dispatch("unhashHTMLSpans.after", n, d, h);
  }));
}
function Ue(f = "") {
  const u = String(f || "").trim();
  return u ? /^<!doctype\s+html/i.test(u) || /^<html[\s>]/i.test(u) ? !0 : (u.match(/<\/?[a-z][\w:-]*(?:\s[^<>]*)?>/gi) || []).length >= 3 && /<\/[a-z][\w:-]*>/i.test(u) : !1;
}
function Ge(f = "", u = "html") {
  const d = Oe();
  return $e.set(d, {
    code: String(f || ""),
    language: String(u || "html").trim() || "html"
  }), `@@XBHTMLBLOCK:${d}@@`;
}
function Ve(f = "") {
  const u = De();
  return J.set(u, String(f || "")), `@@XBHTMLRAW:${u}@@`;
}
function qe(f = "") {
  const u = String(f || "");
  return u && (u.replace(/&nbsp;|&#160;|&#xa0;/gi, "").replace(/[\s\u00A0\u200B-\u200D\u2060\uFEFF]+/g, "") ? u : "");
}
function ie(f = "") {
  const u = String(f || "");
  if (!u.trim()) return u;
  const d = Be(u.split(/\r?\n/).map((n) => qe(n))), h = [];
  for (let n = 0; n < d.length; n += 1) {
    const m = d[n];
    if (!V(m)) {
      h.push(m);
      continue;
    }
    const _ = [m];
    for (; n + 1 < d.length && V(d[n + 1]); )
      n += 1, _.push(d[n]);
    (h[h.length - 1] ?? "").trim() && h.push(""), h.push(Ve(_.join(`
`)));
    const v = d[n + 1] ?? "";
    v.trim() && !V(v) && h.push("");
  }
  return h.join(`
`);
}
function We(f = "", u = {}) {
  const d = String(f || ""), h = u.htmlFenceMode === "code" ? "code" : "placeholder", n = u.protectRawHtmlBoundaries !== !1, m = /(^|\n)(`{3,}|~{3,})[ \t]*([^\n]*)\n([\s\S]*?)\n\2[ \t]*(?=\n|$)/g;
  let _ = "", v = 0, C = null;
  for (; (C = m.exec(d)) !== null; ) {
    const L = C[1] || "", j = C.index + L.length, M = m.lastIndex, A = String(C[3] || "").trim().split(/\s+/)[0] || "", z = String(C[4] || ""), H = Ne(A) || !A && Ue(z);
    _ += n ? ie(d.slice(v, j)) : d.slice(v, j), H && h !== "code" ? _ += Ge(z, A || "html") : _ += d.slice(j, M), v = M;
  }
  return _ += n ? ie(d.slice(v)) : d.slice(v), _;
}
function oe(f = "") {
  return String(f || "").replace(/@@XBHTMLBLOCK:([a-z0-9-]+)@@|@@XB_HTML_BLOCK_([a-z0-9-]+)@@/g, (u, d, h) => `<span class="xb-markdown-html-placeholder" data-xb-html-block-id="${d || h}"></span>`);
}
function Ke(f = "") {
  const u = (d, h) => {
    const n = J.get(h) || "";
    return J.delete(h), n;
  };
  return String(f || "").replace(/<p>\s*@@XBHTMLRAW:([a-z0-9-]+)@@\s*<\/p>/g, u).replace(/(^|[\r\n])@@XBHTMLRAW:([a-z0-9-]+)@@(?=[\r\n]|$)/g, (d, h, n) => `${h}${u(d, n)}`);
}
function Ze(f = "") {
  return String(f || "").replace(/&#x([0-9a-f]+);?/gi, (u, d) => String.fromCodePoint(Number.parseInt(d, 16) || 0)).replace(/&#([0-9]+);?/g, (u, d) => String.fromCodePoint(Number.parseInt(d, 10) || 0)).replace(/&colon;?/gi, ":").replace(/&tab;?/gi, "	").replace(/&newline;?/gi, `
`).replace(/&amp;?/gi, "&");
}
function Xe(f = "") {
  const u = Ze(f).trim().replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
  return /^(?:javascript|vbscript|data):/.test(u);
}
function Qe(f = "") {
  return String(f || "").replace(/<style>([\s\S]+?)<\/style>/gim, (u, d) => `<custom-style>${encodeURIComponent(d)}</custom-style>`);
}
function Je(f = "") {
  const u = [];
  let d = "", h = 0;
  for (const n of String(f || "")) {
    if ((n === "(" || n === "[") && (h += 1), (n === ")" || n === "]") && h > 0 && (h -= 1), n === "," && h === 0) {
      u.push(d), d = "";
      continue;
    }
    d += n;
  }
  return d && u.push(d), u;
}
function Ye(f = "") {
  const u = new RegExp(`:(${[
    "has",
    "not",
    "where",
    "is",
    "matches",
    "any"
  ].join("|")})\\(([^)]+)\\)`, "g"), d = (h = "") => String(h || "").split(/\s+/).map((n) => n.replace(/\.([\w-]+)/g, (m, _) => String(_ || "").startsWith("custom-") ? m : `.custom-${_}`)).join(" ");
  return d(String(f || "").replace(u, (h, n, m) => `:${n}(${d(m)})`));
}
function xe(f = q) {
  const u = (Array.isArray(f) ? f : [f]).map((d) => String(d || "").trim()).filter(Boolean).map((d) => `${d} `);
  return u.length ? u : q.map((d) => `${d} `);
}
function er(f = "", u = q) {
  const d = xe(u);
  return String(f || "").replace(/@import[^;]+;?/gi, "").replace(/(^|[{}])\s*([^@{}][^{}]*)\{/g, (h, n, m) => {
    const _ = Je(m).map((v) => v.trim()).filter(Boolean);
    return !_.length || _.every((v) => /^(?:from|to|\d+(?:\.\d+)?%)$/i.test(v)) ? h : `${n}${_.flatMap((v) => {
      const C = Ye(v);
      return d.map((L) => `${L}${C}`);
    }).join(", ")}{`;
  }).replace(/[^{};]+:\s*[^{};]*:\/\/[^{};]*(?:;|(?=}))/g, "");
}
function ce(f = "", u = {}) {
  const d = Array.isArray(u.prefixes) ? u.prefixes : u.prefix ? [u.prefix] : q;
  return String(f || "").replace(/<custom-style>([\s\S]+?)<\/custom-style>/gim, (h, n) => {
    try {
      return `<style>${er(decodeURIComponent(String(n || "")).replaceAll(/<br\/>/g, ""), d)}</style>`;
    } catch (m) {
      return `CSS ERROR: ${m instanceof Error ? m.message : String(m || "decode_failed")}`;
    }
  });
}
function rr(f = "") {
  return String(f || "").split(/\s+/).filter(Boolean).map((u) => u.startsWith("fa-") || u.startsWith("note-") || u === "monospace" || u.startsWith("custom-") ? u : `custom-${u}`).join(" ");
}
function ar(f = "") {
  return String(f || "").replace(/<\/?(?:script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)[^>]*>/gi, "").replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi, "").replace(/\s+class\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi, (u, d) => {
    const h = String(d || "")[0], n = h === '"' || h === "'", m = rr(n ? String(d).slice(1, -1) : String(d || ""));
    return n ? ` class=${h}${m}${h}` : ` class=${m}`;
  }).replace(/\s+(href|src|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi, (u, d, h) => Xe(String(h || "").replace(/^["']|["']$/g, "")) ? "" : ` ${d}=${h}`);
}
function ue(f) {
  return typeof f?.sanitize == "function" ? f : null;
}
function nr() {
  try {
    const f = globalThis.parent && globalThis.parent !== globalThis ? ue(globalThis.parent.DOMPurify) : null;
    if (f) return f;
  } catch {
  }
  return ue(globalThis.DOMPurify);
}
function tr(f = "") {
  const u = Qe(f), d = nr(), h = {
    RETURN_DOM: !1,
    RETURN_DOM_FRAGMENT: !1,
    RETURN_TRUSTED_TYPE: !1,
    MESSAGE_SANITIZE: !0,
    ADD_TAGS: ["custom-style"]
  };
  if (d) try {
    return ce(String(d.sanitize(u, h) || ""));
  } catch {
  }
  return ce(ar(u));
}
function ir(f, u = {}) {
  const d = String(f || "").trim();
  if (!d) return "";
  const h = We(d, u);
  try {
    return Q || (Fe(), Q = new de.default.Converter({
      emoji: !0,
      literalMidWordUnderscores: !0,
      parseImgDimensions: !0,
      simpleLineBreaks: !0,
      strikethrough: !0,
      tables: !0,
      underline: !0,
      disableForced4SpacesIndentedSublists: !0
    })), oe(tr(Ke(Q.makeHtml(h))));
  } catch {
  }
  return oe(Ie(h).replace(/\n/g, "<br>"));
}
async function sr(f = "", u = null) {
  const d = String(f || "");
  if (!d) return !1;
  const h = u?.createElement ? u : globalThis.document, n = h?.defaultView || globalThis;
  try {
    if (h?.createElement && h.body?.appendChild) {
      const m = h.createElement("textarea");
      try {
        m.value = d, m.setAttribute("readonly", "readonly"), m.style.position = "fixed", m.style.left = "0", m.style.top = "0", m.style.width = "2em", m.style.height = "2em", m.style.padding = "0", m.style.border = "0", m.style.outline = "0", m.style.boxShadow = "none", m.style.background = "transparent", m.style.opacity = "0", m.style.pointerEvents = "none", m.style.fontSize = "16px", h.body.appendChild(m);
        try {
          m.focus({ preventScroll: !0 });
        } catch {
          m.focus();
        }
        if (m.select(), m.setSelectionRange(0, m.value.length), h.execCommand?.("copy")) return !0;
      } finally {
        m.remove();
      }
    }
  } catch {
  }
  try {
    if (n.navigator?.clipboard?.writeText)
      return await n.navigator.clipboard.writeText(d), !0;
  } catch {
  }
  return !1;
}
function or(f, u = {}) {
  if (!f?.querySelectorAll) return;
  const d = f.ownerDocument || globalThis.document;
  if (!d?.createElement) return;
  const h = String(u.codeBlockClassName || "xb-markdown-codeblock"), n = String(u.codeCopyClassName || "xb-markdown-code-copy"), m = String(u.copyButtonTitle || "复制代码"), _ = String(u.copySuccessTitle || "已复制"), v = String(u.copyFailureTitle || "复制失败"), C = u.flattenPreCode === !0, L = String(u.skipPreSelector || "").trim();
  Array.from(f.querySelectorAll("pre")).forEach((j) => {
    if (L && j.matches?.(L) || j.closest(`.${h}`)) return;
    const M = j.children.length === 1 && j.firstElementChild?.tagName === "CODE" ? j.firstElementChild : null;
    if (C && M) {
      for (; M.firstChild; ) j.insertBefore(M.firstChild, M);
      M.remove();
    }
    const A = d.createElement("div");
    A.className = h;
    const z = d.createElement("button");
    z.type = "button", z.className = n, z.textContent = "⧉", z.title = m, z.setAttribute("aria-label", m), z.addEventListener("pointerdown", (H) => {
      H.stopPropagation();
    }), z.addEventListener("pointerup", (H) => {
      H.stopPropagation();
    }), z.addEventListener("touchstart", (H) => {
      H.stopPropagation();
    }, { passive: !0 }), z.addEventListener("touchend", (H) => {
      H.stopPropagation();
    }, { passive: !0 }), z.addEventListener("click", async (H) => {
      H.preventDefault(), H.stopPropagation();
      const I = await sr(j.querySelector("code")?.textContent || j.textContent || "", d);
      z.textContent = I ? "✓" : "!", z.title = I ? _ : v, z.setAttribute("aria-label", I ? _ : v), z.classList.toggle("is-copied", I), z.classList.toggle("is-failed", !I), setTimeout(() => {
        z.textContent = "⧉", z.title = m, z.setAttribute("aria-label", m), z.classList.remove("is-copied", "is-failed");
      }, 1200);
    }), j.parentNode?.insertBefore(A, j), A.append(z, j);
  });
}
export {
  ir as n,
  or as t
};
