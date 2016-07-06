var apishore = angular.module('apishore', ['ngSanitize', 'ui.bootstrap', 'ui.mask',
    'timer', 'ui.router', 'ngTable', 'angularSpinner', 'textAngular']);

apishore.run(['$window', '$rootScope', '$timeout', 'apishoreNumbers', function($window, $rootScope, $timeout, apishoreNumbers)
{
    var wnd = $($window);
    var di = $rootScope.asDevice = {};
    $rootScope.apishoreNumbers = apishoreNumbers;
    function setMode()
    {
        var md = new MobileDetect(window.navigator.userAgent);
        var w = wnd.width(), h = wnd.height();

        function variants()
        {
            di.isWide = di.isTablet || di.isDesktop;
            di.isMobile = di.isPhone || di.isTablet;
        }

        $('body').removeClass('as-device-phone as-device-tablet as-device-desktop as-device-wide-desktop as-device-phone-portrait as-device-phone-landscape');
        di.isPhone = false;
        di.isTablet = false;
        di.isDesktop = false;
        di.isPhoneLandscape = false;
        di.isPhonePortrait = false;
        if(w < 600 || md.phone())
        {
            $('body').addClass('as-device-phone');
            di.mode = "phone";
            di.isPhone = true;
            di.isPhoneLandscape = w > h;
            di.isPhonePortrait = !di.isLandscape;
            if(di.isPhoneLandscape) $('body').addClass('as-device-phone-landscape');
            if(di.isPhonePortrait) $('body').addClass('as-device-phone-portrait');
        }
        else if(w < 960 || md.tablet())
        {
            $('body').addClass('as-device-tablet');
            di.mode = "tablet";
            di.isTablet = true;
        }
        else if(w < 1900 || md.tablet())
        {
            $('body').addClass('as-device-desktop');
            di.mode = "desktop";
            di.isDesktop = true;
        }
        else
        {
            $('body').addClass('as-device-wide-desktop');
            di.mode = "desktop";
            di.isDesktop = true;
        }
        variants();
    }

    setMode();
    wnd.on('resize', function()
    {
        $rootScope.$apply(setMode)
    });

    window.apishoreQA = {
        appReady: false,
        apiRequesting: false,
        stateChanging: false,
        submitting: false,
        state: '',
        isReady: function apishoreQAisReady()
        {
            return window.apishoreQA.appReady
                && !window.apishoreQA.apiRequesting
                && !window.apishoreQA.stateChanging
                && !window.apishoreQA.submitting;
        },
        waitReady: function apishoreQAwaitReady(callback)
        {
            var el = document.querySelector('body');
            var browser = angular.element(el).injector().get('$browser');
            if(browser && browser.notifyWhenNoOutstandingRequests)
            {
                browser.notifyWhenNoOutstandingRequests(function()
                {
                    var res = window.apishoreQA.appReady
                        && !window.apishoreQA.apiRequesting
                        && !window.apishoreQA.stateChanging;
                    console.log('QA notify no outstanding requests');
                    callback(''+res)
                });
            } else {
                var res = window.apishoreQA.appReady
                    && !window.apishoreQA.apiRequesting
                    && !window.apishoreQA.stateChanging;
                callback(''+res)
            }
        }
    };

    $timeout(function appLoaded()
    {
        window.apishoreQA.appReady = true;
        console.log('QA app ready');
    }, 100);

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams)
    {
        window.apishoreQA.stateChanging = true;
        window.apishoreQA.state = toState.name;
    });

    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams)
    {

        $timeout(function appLoaded()
        {
            window.apishoreQA.stateChanging = false;
            console.log('QA state change ready');
        }, 200);
    });
}]);


//! moment.js
//! version : 2.8.3
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {
    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = '2.8.3',
        // the global-scope this is NOT the global object in Node.js
        globalScope = typeof global !== 'undefined' ? global : this,
        oldGlobalMoment,
        round = Math.round,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for locale config files
        locales = {},

        // extra moment internal properties (plugins register props here)
        momentProperties = [],

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
        parseTokenOrdinal = /\d{1,2}/,

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-15', '30']
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // default relative time thresholds
        relativeTimeThresholds = {
            s: 45,  // seconds to minute
            m: 45,  // minutes to hour
            h: 22,  // hours to day
            d: 26,  // days to month
            M: 11   // months to year
        },

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.localeData().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.localeData().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.localeData().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.localeData().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.localeData().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        deprecations = {},

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error('Implement me');
        }
    }

    function hasOwnProp(a, b) {
        return hasOwnProperty.call(a, b);
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function printMsg(msg) {
        if (moment.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                printMsg(msg);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            printMsg(msg);
            deprecations[name] = true;
        }
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.localeData().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Locale() {
    }

    // Moment prototype object
    function Moment(config, skipOverflow) {
        if (skipOverflow !== false) {
            checkOverflow(config);
        }
        copyConfig(this, config);
        this._d = new Date(+config._d);
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = moment.localeData();

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = from._pf;
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = makeAs(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = moment.duration(val, period);
            addOrSubtractDurationFromMoment(this, dur, direction);
            return this;
        };
    }

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment._locale[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment._locale, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0;
            }
        }
        return m._isValid;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && hasModule) {
            try {
                oldLocale = moment.locale();
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) :
            moment(input).local();
    }

    /************************************
        Locale
    ************************************/


    extend(Locale.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment.utc([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LT : 'h:mm A',
            L : 'MM/DD/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM D, YYYY LT'
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },

        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },

        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace('%d', number);
        },
        _ordinal : '%d',

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'Q':
            return parseTokenOneDigit;
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) {
                return parseTokenOneDigit;
            }
            /* falls through */
        case 'SS':
            if (strict) {
                return parseTokenTwoDigits;
            }
            /* falls through */
        case 'SSS':
            if (strict) {
                return parseTokenThreeDigits;
            }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return config._locale._meridiemParse;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        case 'Do':
            return parseTokenOrdinal;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
            return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || '';
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // QUARTER
        case 'Q':
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = config._locale.monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        case 'Do' :
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(input, 10));
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = config._locale.isPM(input);
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        // WEEKDAY - human
        case 'dd':
        case 'ddd':
        case 'dddd':
            a = config._locale.weekdaysParse(input);
            // if we didn't get a weekday name, mark the date as invalid
            if (a != null) {
                config._w = config._w || {};
                config._w['d'] = a;
            } else {
                config._pf.invalidWeekday = input;
            }
            break;
        // WEEK, WEEK DAY - numeric
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gggg':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = toInt(input);
            }
            break;
        case 'gg':
        case 'GG':
            config._w = config._w || {};
            config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual zone can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }

        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be 'T' or undefined
                    config._f = isoDates[i][0] + (match[6] || ' ');
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += 'Z';
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function makeDateFromInput(config) {
        var input = config._i, matched;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            dateFromConfig(config);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, locale) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = locale.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = moment.duration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            years = round(duration.as('y')),

            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days < relativeTimeThresholds.d && ['dd', days] ||
                months === 1 && ['M'] ||
                months < relativeTimeThresholds.M && ['MM', months] ||
                years === 1 && ['y'] || ['yy', years];

        args[2] = withoutSuffix;
        args[3] = +posNegDuration > 0;
        args[4] = locale;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || moment.localeData(config._l);

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (moment.isMoment(input)) {
            return new Moment(input, true);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = locale;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i);
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso,
            diffRes;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        } else if (typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function (threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return relativeTimeThresholds[threshold];
        }
        relativeTimeThresholds[threshold] = limit;
        return true;
    };

    moment.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        function (key, value) {
            return moment.locale(key, value);
        }
    );

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    moment.locale = function (key, values) {
        var data;
        if (key) {
            if (typeof(values) !== 'undefined') {
                data = moment.defineLocale(key, values);
            }
            else {
                data = moment.localeData(key);
            }

            if (data) {
                moment.duration._locale = moment._locale = data;
            }
        }

        return moment._locale._abbr;
    };

    moment.defineLocale = function (name, values) {
        if (values !== null) {
            values.abbr = name;
            if (!locales[name]) {
                locales[name] = new Locale();
            }
            locales[name].set(values);

            // backwards compat for now: also set the locale
            moment.locale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    };

    moment.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        function (key) {
            return moment.localeData(key);
        }
    );

    // returns locale data
    moment.localeData = function (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return moment._locale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function (keepLocalTime) {
            return this.zone(0, keepLocalTime);
        },

        local : function (keepLocalTime) {
            if (this._isUTC) {
                this.zone(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.add(this._dateTzOffset(), 'm');
                }
            }
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.localeData().postformat(output);
        },

        add : createAdder(1, 'add'),

        subtract : createAdder(-1, 'subtract'),

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output, daysAdjust;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                daysAdjust = (this - moment(this).startOf('month')) -
                    (that - moment(that).startOf('month'));
                // same as above but with zones, to negate all dst
                daysAdjust -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4;
                output += daysAdjust / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.localeData().calendar(format, this));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf : function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        },

        isAfter: function (input, units) {
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this > +input;
            } else {
                return +this.clone().startOf(units) > +moment(input).startOf(units);
            }
        },

        isBefore: function (input, units) {
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this < +input;
            } else {
                return +this.clone().startOf(units) < +moment(input).startOf(units);
            }
        },

        isSame: function (input, units) {
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this === +input;
            } else {
                return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
            }
        },

        min: deprecate(
                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
                 function (other) {
                     other = moment.apply(null, arguments);
                     return other < this ? this : other;
                 }
         ),

        max: deprecate(
                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
                function (other) {
                    other = moment.apply(null, arguments);
                    return other > this ? this : other;
                }
        ),

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[zone(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist int zone
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        zone : function (input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (input != null) {
                if (typeof input === 'string') {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = this._dateTzOffset();
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.subtract(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                                moment.duration(offset - input, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
            } else {
                return this._isUTC ? offset : this._dateTzOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? 'UTC' : '';
        },

        zoneName : function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        },

        parseZone : function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        week : function (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        locale : function (key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = moment.localeData(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        },

        lang : deprecate(
            'moment().lang() is deprecated. Use moment().localeData() instead.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        ),

        localeData : function () {
            return this._locale;
        },

        _dateTzOffset : function () {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return Math.round(this._d.getTimezoneOffset() / 15) * 15;
        }
    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
                daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    function daysToYears (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        return days * 400 / 146097;
    }

    function yearsToDays (years) {
        // years * 365 + absRound(years / 4) -
        //     absRound(years / 100) + absRound(years / 400);
        return years * 146097 / 400;
    }

    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years = 0;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);

            // Accurately convert days to years, assume start from year 0.
            years = absRound(daysToYears(days));
            days -= absRound(yearsToDays(years));

            // 30 days to a month
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
            months += absRound(days / 30);
            days %= 30;

            // 12 months -> 1 year
            years += absRound(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;
        },

        abs : function () {
            this._milliseconds = Math.abs(this._milliseconds);
            this._days = Math.abs(this._days);
            this._months = Math.abs(this._months);

            this._data.milliseconds = Math.abs(this._data.milliseconds);
            this._data.seconds = Math.abs(this._data.seconds);
            this._data.minutes = Math.abs(this._data.minutes);
            this._data.hours = Math.abs(this._data.hours);
            this._data.months = Math.abs(this._data.months);
            this._data.years = Math.abs(this._data.years);

            return this;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var output = relativeTime(this, !withSuffix, this.localeData());

            if (withSuffix) {
                output = this.localeData().pastFuture(+this, output);
            }

            return this.localeData().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            var days, months;
            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + this._milliseconds / 864e5;
                months = this._months + daysToYears(days) * 12;
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + yearsToDays(this._months / 12);
                switch (units) {
                    case 'week': return days / 7 + this._milliseconds / 6048e5;
                    case 'day': return days + this._milliseconds / 864e5;
                    case 'hour': return days * 24 + this._milliseconds / 36e5;
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        },

        lang : moment.fn.lang,
        locale : moment.fn.locale,

        toIsoString : deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead ' +
            '(notice the capitals)',
            function () {
                return this.toISOString();
            }
        ),

        toISOString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        },

        localeData : function () {
            return this._locale;
        }
    });

    moment.duration.fn.toString = moment.duration.fn.toISOString;

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    for (i in unitMillisecondFactors) {
        if (hasOwnProp(unitMillisecondFactors, i)) {
            makeDurationGetter(i.toLowerCase());
        }
    }

    moment.duration.fn.asMilliseconds = function () {
        return this.as('ms');
    };
    moment.duration.fn.asSeconds = function () {
        return this.as('s');
    };
    moment.duration.fn.asMinutes = function () {
        return this.as('m');
    };
    moment.duration.fn.asHours = function () {
        return this.as('h');
    };
    moment.duration.fn.asDays = function () {
        return this.as('d');
    };
    moment.duration.fn.asWeeks = function () {
        return this.as('weeks');
    };
    moment.duration.fn.asMonths = function () {
        return this.as('M');
    };
    moment.duration.fn.asYears = function () {
        return this.as('y');
    };

    /************************************
        Default Locale
    ************************************/


    // Set default locale, other locale will inherit from English.
    moment.locale('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // moment.js locale configuration
// locale : afrikaans (af)
// author : Werner Mollentze : https://github.com/wernerm

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('af', {
        months : 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
        weekdays : 'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split('_'),
        weekdaysShort : 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
        weekdaysMin : 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
        meridiem : function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower ? 'vm' : 'VM';
            } else {
                return isLower ? 'nm' : 'NM';
            }
        },
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Vandag om] LT',
            nextDay : '[Môre om] LT',
            nextWeek : 'dddd [om] LT',
            lastDay : '[Gister om] LT',
            lastWeek : '[Laas] dddd [om] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'oor %s',
            past : '%s gelede',
            s : '\'n paar sekondes',
            m : '\'n minuut',
            mm : '%d minute',
            h : '\'n uur',
            hh : '%d ure',
            d : '\'n dag',
            dd : '%d dae',
            M : '\'n maand',
            MM : '%d maande',
            y : '\'n jaar',
            yy : '%d jaar'
        },
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de'); // Thanks to Joris Röling : https://github.com/jjupiter
        },
        week : {
            dow : 1, // Maandag is die eerste dag van die week.
            doy : 4  // Die week wat die 4de Januarie bevat is die eerste week van die jaar.
        }
    });
}));
// moment.js locale configuration
// locale : Moroccan Arabic (ar-ma)
// author : ElFadili Yassine : https://github.com/ElFadiliY
// author : Abdel Said : https://github.com/abdelsaid

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ar-ma', {
        months : 'يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر'.split('_'),
        monthsShort : 'يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر'.split('_'),
        weekdays : 'الأحد_الإتنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
        weekdaysShort : 'احد_اتنين_ثلاثاء_اربعاء_خميس_جمعة_سبت'.split('_'),
        weekdaysMin : 'ح_ن_ث_ر_خ_ج_س'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[اليوم على الساعة] LT',
            nextDay: '[غدا على الساعة] LT',
            nextWeek: 'dddd [على الساعة] LT',
            lastDay: '[أمس على الساعة] LT',
            lastWeek: 'dddd [على الساعة] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'في %s',
            past : 'منذ %s',
            s : 'ثوان',
            m : 'دقيقة',
            mm : '%d دقائق',
            h : 'ساعة',
            hh : '%d ساعات',
            d : 'يوم',
            dd : '%d أيام',
            M : 'شهر',
            MM : '%d أشهر',
            y : 'سنة',
            yy : '%d سنوات'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Arabic Saudi Arabia (ar-sa)
// author : Suhail Alkowaileet : https://github.com/xsoh

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '١',
        '2': '٢',
        '3': '٣',
        '4': '٤',
        '5': '٥',
        '6': '٦',
        '7': '٧',
        '8': '٨',
        '9': '٩',
        '0': '٠'
    }, numberMap = {
        '١': '1',
        '٢': '2',
        '٣': '3',
        '٤': '4',
        '٥': '5',
        '٦': '6',
        '٧': '7',
        '٨': '8',
        '٩': '9',
        '٠': '0'
    };

    return moment.defineLocale('ar-sa', {
        months : 'يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
        monthsShort : 'يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
        weekdays : 'الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
        weekdaysShort : 'أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت'.split('_'),
        weekdaysMin : 'ح_ن_ث_ر_خ_ج_س'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'ص';
            } else {
                return 'م';
            }
        },
        calendar : {
            sameDay: '[اليوم على الساعة] LT',
            nextDay: '[غدا على الساعة] LT',
            nextWeek: 'dddd [على الساعة] LT',
            lastDay: '[أمس على الساعة] LT',
            lastWeek: 'dddd [على الساعة] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'في %s',
            past : 'منذ %s',
            s : 'ثوان',
            m : 'دقيقة',
            mm : '%d دقائق',
            h : 'ساعة',
            hh : '%d ساعات',
            d : 'يوم',
            dd : '%d أيام',
            M : 'شهر',
            MM : '%d أشهر',
            y : 'سنة',
            yy : '%d سنوات'
        },
        preparse: function (string) {
            return string.replace(/[۰-۹]/g, function (match) {
                return numberMap[match];
            }).replace(/،/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '،');
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// Locale: Arabic (ar)
// Author: Abdel Said: https://github.com/abdelsaid
// Changes in months, weekdays: Ahmed Elkhatib
// Native plural forms: forabi https://github.com/forabi

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '١',
        '2': '٢',
        '3': '٣',
        '4': '٤',
        '5': '٥',
        '6': '٦',
        '7': '٧',
        '8': '٨',
        '9': '٩',
        '0': '٠'
    }, numberMap = {
        '١': '1',
        '٢': '2',
        '٣': '3',
        '٤': '4',
        '٥': '5',
        '٦': '6',
        '٧': '7',
        '٨': '8',
        '٩': '9',
        '٠': '0'
    }, pluralForm = function (n) {
        return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
    }, plurals = {
        s : ['أقل من ثانية', 'ثانية واحدة', ['ثانيتان', 'ثانيتين'], '%d ثوان', '%d ثانية', '%d ثانية'],
        m : ['أقل من دقيقة', 'دقيقة واحدة', ['دقيقتان', 'دقيقتين'], '%d دقائق', '%d دقيقة', '%d دقيقة'],
        h : ['أقل من ساعة', 'ساعة واحدة', ['ساعتان', 'ساعتين'], '%d ساعات', '%d ساعة', '%d ساعة'],
        d : ['أقل من يوم', 'يوم واحد', ['يومان', 'يومين'], '%d أيام', '%d يومًا', '%d يوم'],
        M : ['أقل من شهر', 'شهر واحد', ['شهران', 'شهرين'], '%d أشهر', '%d شهرا', '%d شهر'],
        y : ['أقل من عام', 'عام واحد', ['عامان', 'عامين'], '%d أعوام', '%d عامًا', '%d عام']
    }, pluralize = function (u) {
        return function (number, withoutSuffix, string, isFuture) {
            var f = pluralForm(number),
                str = plurals[u][pluralForm(number)];
            if (f === 2) {
                str = str[withoutSuffix ? 0 : 1];
            }
            return str.replace(/%d/i, number);
        };
    }, months = [
        'كانون الثاني يناير',
        'شباط فبراير',
        'آذار مارس',
        'نيسان أبريل',
        'أيار مايو',
        'حزيران يونيو',
        'تموز يوليو',
        'آب أغسطس',
        'أيلول سبتمبر',
        'تشرين الأول أكتوبر',
        'تشرين الثاني نوفمبر',
        'كانون الأول ديسمبر'
    ];

    return moment.defineLocale('ar', {
        months : months,
        monthsShort : months,
        weekdays : 'الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
        weekdaysShort : 'أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت'.split('_'),
        weekdaysMin : 'ح_ن_ث_ر_خ_ج_س'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'ص';
            } else {
                return 'م';
            }
        },
        calendar : {
            sameDay: '[اليوم عند الساعة] LT',
            nextDay: '[غدًا عند الساعة] LT',
            nextWeek: 'dddd [عند الساعة] LT',
            lastDay: '[أمس عند الساعة] LT',
            lastWeek: 'dddd [عند الساعة] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'بعد %s',
            past : 'منذ %s',
            s : pluralize('s'),
            m : pluralize('m'),
            mm : pluralize('m'),
            h : pluralize('h'),
            hh : pluralize('h'),
            d : pluralize('d'),
            dd : pluralize('d'),
            M : pluralize('M'),
            MM : pluralize('M'),
            y : pluralize('y'),
            yy : pluralize('y')
        },
        preparse: function (string) {
            return string.replace(/[۰-۹]/g, function (match) {
                return numberMap[match];
            }).replace(/،/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '،');
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : azerbaijani (az)
// author : topchiyev : https://github.com/topchiyev

(function (factory) {
    factory(moment);
}(function (moment) {
    var suffixes = {
        1: '-inci',
        5: '-inci',
        8: '-inci',
        70: '-inci',
        80: '-inci',

        2: '-nci',
        7: '-nci',
        20: '-nci',
        50: '-nci',

        3: '-üncü',
        4: '-üncü',
        100: '-üncü',

        6: '-ncı',

        9: '-uncu',
        10: '-uncu',
        30: '-uncu',

        60: '-ıncı',
        90: '-ıncı'
    };
    return moment.defineLocale('az', {
        months : 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
        monthsShort : 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
        weekdays : 'Bazar_Bazar ertəsi_Çərşənbə axşamı_Çərşənbə_Cümə axşamı_Cümə_Şənbə'.split('_'),
        weekdaysShort : 'Baz_BzE_ÇAx_Çər_CAx_Cüm_Şən'.split('_'),
        weekdaysMin : 'Bz_BE_ÇA_Çə_CA_Cü_Şə'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[bugün saat] LT',
            nextDay : '[sabah saat] LT',
            nextWeek : '[gələn həftə] dddd [saat] LT',
            lastDay : '[dünən] LT',
            lastWeek : '[keçən həftə] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s sonra',
            past : '%s əvvəl',
            s : 'birneçə saniyyə',
            m : 'bir dəqiqə',
            mm : '%d dəqiqə',
            h : 'bir saat',
            hh : '%d saat',
            d : 'bir gün',
            dd : '%d gün',
            M : 'bir ay',
            MM : '%d ay',
            y : 'bir il',
            yy : '%d il'
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'gecə';
            } else if (hour < 12) {
                return 'səhər';
            } else if (hour < 17) {
                return 'gündüz';
            } else {
                return 'axşam';
            }
        },
        ordinal : function (number) {
            if (number === 0) {  // special case for zero
                return number + '-ıncı';
            }
            var a = number % 10,
                b = number % 100 - a,
                c = number >= 100 ? 100 : null;

            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : belarusian (be)
// author : Dmitry Demidov : https://github.com/demidov91
// author: Praleska: http://praleska.pro/
// Author : Menelion Elensúle : https://github.com/Oire

(function (factory) {
    factory(moment);
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }

    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? 'хвіліна_хвіліны_хвілін' : 'хвіліну_хвіліны_хвілін',
            'hh': withoutSuffix ? 'гадзіна_гадзіны_гадзін' : 'гадзіну_гадзіны_гадзін',
            'dd': 'дзень_дні_дзён',
            'MM': 'месяц_месяцы_месяцаў',
            'yy': 'год_гады_гадоў'
        };
        if (key === 'm') {
            return withoutSuffix ? 'хвіліна' : 'хвіліну';
        }
        else if (key === 'h') {
            return withoutSuffix ? 'гадзіна' : 'гадзіну';
        }
        else {
            return number + ' ' + plural(format[key], +number);
        }
    }

    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'студзень_люты_сакавік_красавік_травень_чэрвень_ліпень_жнівень_верасень_кастрычнік_лістапад_снежань'.split('_'),
            'accusative': 'студзеня_лютага_сакавіка_красавіка_траўня_чэрвеня_ліпеня_жніўня_верасня_кастрычніка_лістапада_снежня'.split('_')
        },

        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': 'нядзеля_панядзелак_аўторак_серада_чацвер_пятніца_субота'.split('_'),
            'accusative': 'нядзелю_панядзелак_аўторак_сераду_чацвер_пятніцу_суботу'.split('_')
        },

        nounCase = (/\[ ?[Вв] ?(?:мінулую|наступную)? ?\] ?dddd/).test(format) ?
            'accusative' :
            'nominative';

        return weekdays[nounCase][m.day()];
    }

    return moment.defineLocale('be', {
        months : monthsCaseReplace,
        monthsShort : 'студ_лют_сак_крас_трав_чэрв_ліп_жнів_вер_каст_ліст_снеж'.split('_'),
        weekdays : weekdaysCaseReplace,
        weekdaysShort : 'нд_пн_ат_ср_чц_пт_сб'.split('_'),
        weekdaysMin : 'нд_пн_ат_ср_чц_пт_сб'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY г.',
            LLL : 'D MMMM YYYY г., LT',
            LLLL : 'dddd, D MMMM YYYY г., LT'
        },
        calendar : {
            sameDay: '[Сёння ў] LT',
            nextDay: '[Заўтра ў] LT',
            lastDay: '[Учора ў] LT',
            nextWeek: function () {
                return '[У] dddd [ў] LT';
            },
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return '[У мінулую] dddd [ў] LT';
                case 1:
                case 2:
                case 4:
                    return '[У мінулы] dddd [ў] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'праз %s',
            past : '%s таму',
            s : 'некалькі секунд',
            m : relativeTimeWithPlural,
            mm : relativeTimeWithPlural,
            h : relativeTimeWithPlural,
            hh : relativeTimeWithPlural,
            d : 'дзень',
            dd : relativeTimeWithPlural,
            M : 'месяц',
            MM : relativeTimeWithPlural,
            y : 'год',
            yy : relativeTimeWithPlural
        },


        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ночы';
            } else if (hour < 12) {
                return 'раніцы';
            } else if (hour < 17) {
                return 'дня';
            } else {
                return 'вечара';
            }
        },

        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return (number % 10 === 2 || number % 10 === 3) && (number % 100 !== 12 && number % 100 !== 13) ? number + '-і' : number + '-ы';
            case 'D':
                return number + '-га';
            default:
                return number;
            }
        },

        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : bulgarian (bg)
// author : Krasen Borisov : https://github.com/kraz

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('bg', {
        months : 'януари_февруари_март_април_май_юни_юли_август_септември_октомври_ноември_декември'.split('_'),
        monthsShort : 'янр_фев_мар_апр_май_юни_юли_авг_сеп_окт_ное_дек'.split('_'),
        weekdays : 'неделя_понеделник_вторник_сряда_четвъртък_петък_събота'.split('_'),
        weekdaysShort : 'нед_пон_вто_сря_чет_пет_съб'.split('_'),
        weekdaysMin : 'нд_пн_вт_ср_чт_пт_сб'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'D.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Днес в] LT',
            nextDay : '[Утре в] LT',
            nextWeek : 'dddd [в] LT',
            lastDay : '[Вчера в] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[В изминалата] dddd [в] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[В изминалия] dddd [в] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'след %s',
            past : 'преди %s',
            s : 'няколко секунди',
            m : 'минута',
            mm : '%d минути',
            h : 'час',
            hh : '%d часа',
            d : 'ден',
            dd : '%d дни',
            M : 'месец',
            MM : '%d месеца',
            y : 'година',
            yy : '%d години'
        },
        ordinal : function (number) {
            var lastDigit = number % 10,
                last2Digits = number % 100;
            if (number === 0) {
                return number + '-ев';
            } else if (last2Digits === 0) {
                return number + '-ен';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-ти';
            } else if (lastDigit === 1) {
                return number + '-ви';
            } else if (lastDigit === 2) {
                return number + '-ри';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-ми';
            } else {
                return number + '-ти';
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Bengali (bn)
// author : Kaushik Gandhi : https://github.com/kaushikgandhi

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '১',
        '2': '২',
        '3': '৩',
        '4': '৪',
        '5': '৫',
        '6': '৬',
        '7': '৭',
        '8': '৮',
        '9': '৯',
        '0': '০'
    },
    numberMap = {
        '১': '1',
        '২': '2',
        '৩': '3',
        '৪': '4',
        '৫': '5',
        '৬': '6',
        '৭': '7',
        '৮': '8',
        '৯': '9',
        '০': '0'
    };

    return moment.defineLocale('bn', {
        months : 'জানুয়ারী_ফেবুয়ারী_মার্চ_এপ্রিল_মে_জুন_জুলাই_অগাস্ট_সেপ্টেম্বর_অক্টোবর_নভেম্বর_ডিসেম্বর'.split('_'),
        monthsShort : 'জানু_ফেব_মার্চ_এপর_মে_জুন_জুল_অগ_সেপ্ট_অক্টো_নভ_ডিসেম্'.split('_'),
        weekdays : 'রবিবার_সোমবার_মঙ্গলবার_বুধবার_বৃহস্পত্তিবার_শুক্রুবার_শনিবার'.split('_'),
        weekdaysShort : 'রবি_সোম_মঙ্গল_বুধ_বৃহস্পত্তি_শুক্রু_শনি'.split('_'),
        weekdaysMin : 'রব_সম_মঙ্গ_বু_ব্রিহ_শু_শনি'.split('_'),
        longDateFormat : {
            LT : 'A h:mm সময়',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[আজ] LT',
            nextDay : '[আগামীকাল] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[গতকাল] LT',
            lastWeek : '[গত] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s পরে',
            past : '%s আগে',
            s : 'কএক সেকেন্ড',
            m : 'এক মিনিট',
            mm : '%d মিনিট',
            h : 'এক ঘন্টা',
            hh : '%d ঘন্টা',
            d : 'এক দিন',
            dd : '%d দিন',
            M : 'এক মাস',
            MM : '%d মাস',
            y : 'এক বছর',
            yy : '%d বছর'
        },
        preparse: function (string) {
            return string.replace(/[১২৩৪৫৬৭৮৯০]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        //Bengali is a vast language its spoken
        //in different forms in various parts of the world.
        //I have just generalized with most common one used
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'রাত';
            } else if (hour < 10) {
                return 'শকাল';
            } else if (hour < 17) {
                return 'দুপুর';
            } else if (hour < 20) {
                return 'বিকেল';
            } else {
                return 'রাত';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : tibetan (bo)
// author : Thupten N. Chakrishar : https://github.com/vajradog

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '༡',
        '2': '༢',
        '3': '༣',
        '4': '༤',
        '5': '༥',
        '6': '༦',
        '7': '༧',
        '8': '༨',
        '9': '༩',
        '0': '༠'
    },
    numberMap = {
        '༡': '1',
        '༢': '2',
        '༣': '3',
        '༤': '4',
        '༥': '5',
        '༦': '6',
        '༧': '7',
        '༨': '8',
        '༩': '9',
        '༠': '0'
    };

    return moment.defineLocale('bo', {
        months : 'ཟླ་བ་དང་པོ_ཟླ་བ་གཉིས་པ_ཟླ་བ་གསུམ་པ_ཟླ་བ་བཞི་པ_ཟླ་བ་ལྔ་པ_ཟླ་བ་དྲུག་པ_ཟླ་བ་བདུན་པ_ཟླ་བ་བརྒྱད་པ_ཟླ་བ་དགུ་པ_ཟླ་བ་བཅུ་པ_ཟླ་བ་བཅུ་གཅིག་པ_ཟླ་བ་བཅུ་གཉིས་པ'.split('_'),
        monthsShort : 'ཟླ་བ་དང་པོ_ཟླ་བ་གཉིས་པ_ཟླ་བ་གསུམ་པ_ཟླ་བ་བཞི་པ_ཟླ་བ་ལྔ་པ_ཟླ་བ་དྲུག་པ_ཟླ་བ་བདུན་པ_ཟླ་བ་བརྒྱད་པ_ཟླ་བ་དགུ་པ_ཟླ་བ་བཅུ་པ_ཟླ་བ་བཅུ་གཅིག་པ_ཟླ་བ་བཅུ་གཉིས་པ'.split('_'),
        weekdays : 'གཟའ་ཉི་མ་_གཟའ་ཟླ་བ་_གཟའ་མིག་དམར་_གཟའ་ལྷག་པ་_གཟའ་ཕུར་བུ_གཟའ་པ་སངས་_གཟའ་སྤེན་པ་'.split('_'),
        weekdaysShort : 'ཉི་མ་_ཟླ་བ་_མིག་དམར་_ལྷག་པ་_ཕུར་བུ_པ་སངས་_སྤེན་པ་'.split('_'),
        weekdaysMin : 'ཉི་མ་_ཟླ་བ་_མིག་དམར་_ལྷག་པ་_ཕུར་བུ_པ་སངས་_སྤེན་པ་'.split('_'),
        longDateFormat : {
            LT : 'A h:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[དི་རིང] LT',
            nextDay : '[སང་ཉིན] LT',
            nextWeek : '[བདུན་ཕྲག་རྗེས་མ], LT',
            lastDay : '[ཁ་སང] LT',
            lastWeek : '[བདུན་ཕྲག་མཐའ་མ] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s ལ་',
            past : '%s སྔན་ལ',
            s : 'ལམ་སང',
            m : 'སྐར་མ་གཅིག',
            mm : '%d སྐར་མ',
            h : 'ཆུ་ཚོད་གཅིག',
            hh : '%d ཆུ་ཚོད',
            d : 'ཉིན་གཅིག',
            dd : '%d ཉིན་',
            M : 'ཟླ་བ་གཅིག',
            MM : '%d ཟླ་བ',
            y : 'ལོ་གཅིག',
            yy : '%d ལོ'
        },
        preparse: function (string) {
            return string.replace(/[༡༢༣༤༥༦༧༨༩༠]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'མཚན་མོ';
            } else if (hour < 10) {
                return 'ཞོགས་ཀས';
            } else if (hour < 17) {
                return 'ཉིན་གུང';
            } else if (hour < 20) {
                return 'དགོང་དག';
            } else {
                return 'མཚན་མོ';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : breton (br)
// author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou

(function (factory) {
    factory(moment);
}(function (moment) {
    function relativeTimeWithMutation(number, withoutSuffix, key) {
        var format = {
            'mm': 'munutenn',
            'MM': 'miz',
            'dd': 'devezh'
        };
        return number + ' ' + mutation(format[key], number);
    }

    function specialMutationForYears(number) {
        switch (lastNumber(number)) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 9:
            return number + ' bloaz';
        default:
            return number + ' vloaz';
        }
    }

    function lastNumber(number) {
        if (number > 9) {
            return lastNumber(number % 10);
        }
        return number;
    }

    function mutation(text, number) {
        if (number === 2) {
            return softMutation(text);
        }
        return text;
    }

    function softMutation(text) {
        var mutationTable = {
            'm': 'v',
            'b': 'v',
            'd': 'z'
        };
        if (mutationTable[text.charAt(0)] === undefined) {
            return text;
        }
        return mutationTable[text.charAt(0)] + text.substring(1);
    }

    return moment.defineLocale('br', {
        months : 'Genver_C\'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu'.split('_'),
        monthsShort : 'Gen_C\'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker'.split('_'),
        weekdays : 'Sul_Lun_Meurzh_Merc\'her_Yaou_Gwener_Sadorn'.split('_'),
        weekdaysShort : 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
        weekdaysMin : 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
        longDateFormat : {
            LT : 'h[e]mm A',
            L : 'DD/MM/YYYY',
            LL : 'D [a viz] MMMM YYYY',
            LLL : 'D [a viz] MMMM YYYY LT',
            LLLL : 'dddd, D [a viz] MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Hiziv da] LT',
            nextDay : '[Warc\'hoazh da] LT',
            nextWeek : 'dddd [da] LT',
            lastDay : '[Dec\'h da] LT',
            lastWeek : 'dddd [paset da] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'a-benn %s',
            past : '%s \'zo',
            s : 'un nebeud segondennoù',
            m : 'ur vunutenn',
            mm : relativeTimeWithMutation,
            h : 'un eur',
            hh : '%d eur',
            d : 'un devezh',
            dd : relativeTimeWithMutation,
            M : 'ur miz',
            MM : relativeTimeWithMutation,
            y : 'ur bloaz',
            yy : specialMutationForYears
        },
        ordinal : function (number) {
            var output = (number === 1) ? 'añ' : 'vet';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : bosnian (bs)
// author : Nedim Cholich : https://github.com/frontyard
// based on (hr) translation by Bojan Marković

(function (factory) {
    factory(moment);
}(function (moment) {
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }

    return moment.defineLocale('bs', {
        months : 'januar_februar_mart_april_maj_juni_juli_avgust_septembar_oktobar_novembar_decembar'.split('_'),
        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota'.split('_'),
        weekdaysShort : 'ned._pon._uto._sri._čet._pet._sub.'.split('_'),
        weekdaysMin : 'ne_po_ut_sr_če_pe_su'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay  : '[danas u] LT',
            nextDay  : '[sutra u] LT',

            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[jučer u] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[prošlu] dddd [u] LT';
                case 6:
                    return '[prošle] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[prošli] dddd [u] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'par sekundi',
            m      : translate,
            mm     : translate,
            h      : translate,
            hh     : translate,
            d      : 'dan',
            dd     : translate,
            M      : 'mjesec',
            MM     : translate,
            y      : 'godinu',
            yy     : translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : catalan (ca)
// author : Juan G. Hurtado : https://github.com/juanghurtado

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ca', {
        months : 'gener_febrer_març_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
        monthsShort : 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
        weekdays : 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
        weekdaysShort : 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
        weekdaysMin : 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay : function () {
                return '[avui a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            nextDay : function () {
                return '[demà a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            lastDay : function () {
                return '[ahir a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [passat a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'en %s',
            past : 'fa %s',
            s : 'uns segons',
            m : 'un minut',
            mm : '%d minuts',
            h : 'una hora',
            hh : '%d hores',
            d : 'un dia',
            dd : '%d dies',
            M : 'un mes',
            MM : '%d mesos',
            y : 'un any',
            yy : '%d anys'
        },
        ordinal : '%dº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : czech (cs)
// author : petrbela : https://github.com/petrbela

(function (factory) {
    factory(moment);
}(function (moment) {
    var months = 'leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec'.split('_'),
        monthsShort = 'led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro'.split('_');

    function plural(n) {
        return (n > 1) && (n < 5) && (~~(n / 10) !== 1);
    }

    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':  // a few seconds / in a few seconds / a few seconds ago
            return (withoutSuffix || isFuture) ? 'pár sekund' : 'pár sekundami';
        case 'm':  // a minute / in a minute / a minute ago
            return withoutSuffix ? 'minuta' : (isFuture ? 'minutu' : 'minutou');
        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'minuty' : 'minut');
            } else {
                return result + 'minutami';
            }
            break;
        case 'h':  // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
        case 'hh': // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'hodiny' : 'hodin');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':  // a day / in a day / a day ago
            return (withoutSuffix || isFuture) ? 'den' : 'dnem';
        case 'dd': // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'dny' : 'dní');
            } else {
                return result + 'dny';
            }
            break;
        case 'M':  // a month / in a month / a month ago
            return (withoutSuffix || isFuture) ? 'měsíc' : 'měsícem';
        case 'MM': // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'měsíce' : 'měsíců');
            } else {
                return result + 'měsíci';
            }
            break;
        case 'y':  // a year / in a year / a year ago
            return (withoutSuffix || isFuture) ? 'rok' : 'rokem';
        case 'yy': // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'roky' : 'let');
            } else {
                return result + 'lety';
            }
            break;
        }
    }

    return moment.defineLocale('cs', {
        months : months,
        monthsShort : monthsShort,
        monthsParse : (function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                // use custom parser to solve problem with July (červenec)
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(months, monthsShort)),
        weekdays : 'neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota'.split('_'),
        weekdaysShort : 'ne_po_út_st_čt_pá_so'.split('_'),
        weekdaysMin : 'ne_po_út_st_čt_pá_so'.split('_'),
        longDateFormat : {
            LT: 'H:mm',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd D. MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[dnes v] LT',
            nextDay: '[zítra v] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v neděli v] LT';
                case 1:
                case 2:
                    return '[v] dddd [v] LT';
                case 3:
                    return '[ve středu v] LT';
                case 4:
                    return '[ve čtvrtek v] LT';
                case 5:
                    return '[v pátek v] LT';
                case 6:
                    return '[v sobotu v] LT';
                }
            },
            lastDay: '[včera v] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minulou neděli v] LT';
                case 1:
                case 2:
                    return '[minulé] dddd [v] LT';
                case 3:
                    return '[minulou středu v] LT';
                case 4:
                case 5:
                    return '[minulý] dddd [v] LT';
                case 6:
                    return '[minulou sobotu v] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : 'před %s',
            s : translate,
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : chuvash (cv)
// author : Anatoly Mironov : https://github.com/mirontoli

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('cv', {
        months : 'кăрлач_нарăс_пуш_ака_май_çĕртме_утă_çурла_авăн_юпа_чӳк_раштав'.split('_'),
        monthsShort : 'кăр_нар_пуш_ака_май_çĕр_утă_çур_ав_юпа_чӳк_раш'.split('_'),
        weekdays : 'вырсарникун_тунтикун_ытларикун_юнкун_кĕçнерникун_эрнекун_шăматкун'.split('_'),
        weekdaysShort : 'выр_тун_ытл_юн_кĕç_эрн_шăм'.split('_'),
        weekdaysMin : 'вр_тн_ыт_юн_кç_эр_шм'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD-MM-YYYY',
            LL : 'YYYY [çулхи] MMMM [уйăхĕн] D[-мĕшĕ]',
            LLL : 'YYYY [çулхи] MMMM [уйăхĕн] D[-мĕшĕ], LT',
            LLLL : 'dddd, YYYY [çулхи] MMMM [уйăхĕн] D[-мĕшĕ], LT'
        },
        calendar : {
            sameDay: '[Паян] LT [сехетре]',
            nextDay: '[Ыран] LT [сехетре]',
            lastDay: '[Ĕнер] LT [сехетре]',
            nextWeek: '[Çитес] dddd LT [сехетре]',
            lastWeek: '[Иртнĕ] dddd LT [сехетре]',
            sameElse: 'L'
        },
        relativeTime : {
            future : function (output) {
                var affix = /сехет$/i.exec(output) ? 'рен' : /çул$/i.exec(output) ? 'тан' : 'ран';
                return output + affix;
            },
            past : '%s каялла',
            s : 'пĕр-ик çеккунт',
            m : 'пĕр минут',
            mm : '%d минут',
            h : 'пĕр сехет',
            hh : '%d сехет',
            d : 'пĕр кун',
            dd : '%d кун',
            M : 'пĕр уйăх',
            MM : '%d уйăх',
            y : 'пĕр çул',
            yy : '%d çул'
        },
        ordinal : '%d-мĕш',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Welsh (cy)
// author : Robert Allen

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('cy', {
        months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
        monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
        weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
        weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
        weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
        // time formats are the same as en-gb
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Heddiw am] LT',
            nextDay: '[Yfory am] LT',
            nextWeek: 'dddd [am] LT',
            lastDay: '[Ddoe am] LT',
            lastWeek: 'dddd [diwethaf am] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'mewn %s',
            past: '%s yn ôl',
            s: 'ychydig eiliadau',
            m: 'munud',
            mm: '%d munud',
            h: 'awr',
            hh: '%d awr',
            d: 'diwrnod',
            dd: '%d diwrnod',
            M: 'mis',
            MM: '%d mis',
            y: 'blwyddyn',
            yy: '%d flynedd'
        },
        // traditional ordinal numbers above 31 are not commonly used in colloquial Welsh
        ordinal: function (number) {
            var b = number,
                output = '',
                lookup = [
                    '', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
                    'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
                ];

            if (b > 20) {
                if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
                    output = 'fed'; // not 30ain, 70ain or 90ain
                } else {
                    output = 'ain';
                }
            } else if (b > 0) {
                output = lookup[b];
            }

            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : danish (da)
// author : Ulrik Nielsen : https://github.com/mrbase

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('da', {
        months : 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag'.split('_'),
        weekdaysShort : 'søn_man_tir_ons_tor_fre_lør'.split('_'),
        weekdaysMin : 'sø_ma_ti_on_to_fr_lø'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd [d.] D. MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[I dag kl.] LT',
            nextDay : '[I morgen kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[I går kl.] LT',
            lastWeek : '[sidste] dddd [kl] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : '%s siden',
            s : 'få sekunder',
            m : 'et minut',
            mm : '%d minutter',
            h : 'en time',
            hh : '%d timer',
            d : 'en dag',
            dd : '%d dage',
            M : 'en måned',
            MM : '%d måneder',
            y : 'et år',
            yy : '%d år'
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : austrian german (de-at)
// author : lluchs : https://github.com/lluchs
// author: Menelion Elensúle: https://github.com/Oire
// author : Martin Groller : https://github.com/MadMG

(function (factory) {
    factory(moment);
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    return moment.defineLocale('de-at', {
        months : 'Jänner_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort : 'Jän._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat : {
            LT: 'HH:mm [Uhr]',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Heute um] LT',
            sameElse: 'L',
            nextDay: '[Morgen um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[Gestern um] LT',
            lastWeek: '[letzten] dddd [um] LT'
        },
        relativeTime : {
            future : 'in %s',
            past : 'vor %s',
            s : 'ein paar Sekunden',
            m : processRelativeTime,
            mm : '%d Minuten',
            h : processRelativeTime,
            hh : '%d Stunden',
            d : processRelativeTime,
            dd : processRelativeTime,
            M : processRelativeTime,
            MM : processRelativeTime,
            y : processRelativeTime,
            yy : processRelativeTime
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : german (de)
// author : lluchs : https://github.com/lluchs
// author: Menelion Elensúle: https://github.com/Oire

(function (factory) {
    factory(moment);
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    return moment.defineLocale('de', {
        months : 'Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat : {
            LT: 'HH:mm [Uhr]',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Heute um] LT',
            sameElse: 'L',
            nextDay: '[Morgen um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[Gestern um] LT',
            lastWeek: '[letzten] dddd [um] LT'
        },
        relativeTime : {
            future : 'in %s',
            past : 'vor %s',
            s : 'ein paar Sekunden',
            m : processRelativeTime,
            mm : '%d Minuten',
            h : processRelativeTime,
            hh : '%d Stunden',
            d : processRelativeTime,
            dd : processRelativeTime,
            M : processRelativeTime,
            MM : processRelativeTime,
            y : processRelativeTime,
            yy : processRelativeTime
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : modern greek (el)
// author : Aggelos Karalias : https://github.com/mehiel

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('el', {
        monthsNominativeEl : 'Ιανουάριος_Φεβρουάριος_Μάρτιος_Απρίλιος_Μάιος_Ιούνιος_Ιούλιος_Αύγουστος_Σεπτέμβριος_Οκτώβριος_Νοέμβριος_Δεκέμβριος'.split('_'),
        monthsGenitiveEl : 'Ιανουαρίου_Φεβρουαρίου_Μαρτίου_Απριλίου_Μαΐου_Ιουνίου_Ιουλίου_Αυγούστου_Σεπτεμβρίου_Οκτωβρίου_Νοεμβρίου_Δεκεμβρίου'.split('_'),
        months : function (momentToFormat, format) {
            if (/D/.test(format.substring(0, format.indexOf('MMMM')))) { // if there is a day number before 'MMMM'
                return this._monthsGenitiveEl[momentToFormat.month()];
            } else {
                return this._monthsNominativeEl[momentToFormat.month()];
            }
        },
        monthsShort : 'Ιαν_Φεβ_Μαρ_Απρ_Μαϊ_Ιουν_Ιουλ_Αυγ_Σεπ_Οκτ_Νοε_Δεκ'.split('_'),
        weekdays : 'Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο'.split('_'),
        weekdaysShort : 'Κυρ_Δευ_Τρι_Τετ_Πεμ_Παρ_Σαβ'.split('_'),
        weekdaysMin : 'Κυ_Δε_Τρ_Τε_Πε_Πα_Σα'.split('_'),
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'μμ' : 'ΜΜ';
            } else {
                return isLower ? 'πμ' : 'ΠΜ';
            }
        },
        isPM : function (input) {
            return ((input + '').toLowerCase()[0] === 'μ');
        },
        meridiemParse : /[ΠΜ]\.?Μ?\.?/i,
        longDateFormat : {
            LT : 'h:mm A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendarEl : {
            sameDay : '[Σήμερα {}] LT',
            nextDay : '[Αύριο {}] LT',
            nextWeek : 'dddd [{}] LT',
            lastDay : '[Χθες {}] LT',
            lastWeek : function () {
                switch (this.day()) {
                    case 6:
                        return '[το προηγούμενο] dddd [{}] LT';
                    default:
                        return '[την προηγούμενη] dddd [{}] LT';
                }
            },
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendarEl[key],
                hours = mom && mom.hours();

            if (typeof output === 'function') {
                output = output.apply(mom);
            }

            return output.replace('{}', (hours % 12 === 1 ? 'στη' : 'στις'));
        },
        relativeTime : {
            future : 'σε %s',
            past : '%s πριν',
            s : 'δευτερόλεπτα',
            m : 'ένα λεπτό',
            mm : '%d λεπτά',
            h : 'μία ώρα',
            hh : '%d ώρες',
            d : 'μία μέρα',
            dd : '%d μέρες',
            M : 'ένας μήνας',
            MM : '%d μήνες',
            y : 'ένας χρόνος',
            yy : '%d χρόνια'
        },
        ordinal : function (number) {
            return number + 'η';
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : australian english (en-au)

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('en-au', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : canadian english (en-ca)
// author : Jonathan Abourbih : https://github.com/jonbca

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('en-ca', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM, YYYY',
            LLL : 'D MMMM, YYYY LT',
            LLLL : 'dddd, D MMMM, YYYY LT'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });
}));
// moment.js locale configuration
// locale : great britain english (en-gb)
// author : Chris Gedrim : https://github.com/chrisgedrim

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('en-gb', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : esperanto (eo)
// author : Colin Dean : https://github.com/colindean
// komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
//          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('eo', {
        months : 'januaro_februaro_marto_aprilo_majo_junio_julio_aŭgusto_septembro_oktobro_novembro_decembro'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aŭg_sep_okt_nov_dec'.split('_'),
        weekdays : 'Dimanĉo_Lundo_Mardo_Merkredo_Ĵaŭdo_Vendredo_Sabato'.split('_'),
        weekdaysShort : 'Dim_Lun_Mard_Merk_Ĵaŭ_Ven_Sab'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Ĵa_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'YYYY-MM-DD',
            LL : 'D[-an de] MMMM, YYYY',
            LLL : 'D[-an de] MMMM, YYYY LT',
            LLLL : 'dddd, [la] D[-an de] MMMM, YYYY LT'
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'p.t.m.' : 'P.T.M.';
            } else {
                return isLower ? 'a.t.m.' : 'A.T.M.';
            }
        },
        calendar : {
            sameDay : '[Hodiaŭ je] LT',
            nextDay : '[Morgaŭ je] LT',
            nextWeek : 'dddd [je] LT',
            lastDay : '[Hieraŭ je] LT',
            lastWeek : '[pasinta] dddd [je] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'je %s',
            past : 'antaŭ %s',
            s : 'sekundoj',
            m : 'minuto',
            mm : '%d minutoj',
            h : 'horo',
            hh : '%d horoj',
            d : 'tago',//ne 'diurno', ĉar estas uzita por proksimumo
            dd : '%d tagoj',
            M : 'monato',
            MM : '%d monatoj',
            y : 'jaro',
            yy : '%d jaroj'
        },
        ordinal : '%da',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : spanish (es)
// author : Julio Napurí : https://github.com/julionc

(function (factory) {
    factory(moment);
}(function (moment) {
    var monthsShortDot = 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'),
        monthsShort = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_');

    return moment.defineLocale('es', {
        months : 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShort[m.month()];
            } else {
                return monthsShortDot[m.month()];
            }
        },
        weekdays : 'domingo_lunes_martes_miércoles_jueves_viernes_sábado'.split('_'),
        weekdaysShort : 'dom._lun._mar._mié._jue._vie._sáb.'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY LT',
            LLLL : 'dddd, D [de] MMMM [de] YYYY LT'
        },
        calendar : {
            sameDay : function () {
                return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextDay : function () {
                return '[mañana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastDay : function () {
                return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'en %s',
            past : 'hace %s',
            s : 'unos segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'una hora',
            hh : '%d horas',
            d : 'un día',
            dd : '%d días',
            M : 'un mes',
            MM : '%d meses',
            y : 'un año',
            yy : '%d años'
        },
        ordinal : '%dº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : estonian (et)
// author : Henry Kehlmann : https://github.com/madhenry
// improvements : Illimar Tambek : https://github.com/ragulka

(function (factory) {
    factory(moment);
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            's' : ['mõne sekundi', 'mõni sekund', 'paar sekundit'],
            'm' : ['ühe minuti', 'üks minut'],
            'mm': [number + ' minuti', number + ' minutit'],
            'h' : ['ühe tunni', 'tund aega', 'üks tund'],
            'hh': [number + ' tunni', number + ' tundi'],
            'd' : ['ühe päeva', 'üks päev'],
            'M' : ['kuu aja', 'kuu aega', 'üks kuu'],
            'MM': [number + ' kuu', number + ' kuud'],
            'y' : ['ühe aasta', 'aasta', 'üks aasta'],
            'yy': [number + ' aasta', number + ' aastat']
        };
        if (withoutSuffix) {
            return format[key][2] ? format[key][2] : format[key][1];
        }
        return isFuture ? format[key][0] : format[key][1];
    }

    return moment.defineLocale('et', {
        months        : 'jaanuar_veebruar_märts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
        monthsShort   : 'jaan_veebr_märts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
        weekdays      : 'pühapäev_esmaspäev_teisipäev_kolmapäev_neljapäev_reede_laupäev'.split('_'),
        weekdaysShort : 'P_E_T_K_N_R_L'.split('_'),
        weekdaysMin   : 'P_E_T_K_N_R_L'.split('_'),
        longDateFormat : {
            LT   : 'H:mm',
            L    : 'DD.MM.YYYY',
            LL   : 'D. MMMM YYYY',
            LLL  : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay  : '[Täna,] LT',
            nextDay  : '[Homme,] LT',
            nextWeek : '[Järgmine] dddd LT',
            lastDay  : '[Eile,] LT',
            lastWeek : '[Eelmine] dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s pärast',
            past   : '%s tagasi',
            s      : processRelativeTime,
            m      : processRelativeTime,
            mm     : processRelativeTime,
            h      : processRelativeTime,
            hh     : processRelativeTime,
            d      : processRelativeTime,
            dd     : '%d päeva',
            M      : processRelativeTime,
            MM     : processRelativeTime,
            y      : processRelativeTime,
            yy     : processRelativeTime
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : euskara (eu)
// author : Eneko Illarramendi : https://github.com/eillarra

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('eu', {
        months : 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
        monthsShort : 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
        weekdays : 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
        weekdaysShort : 'ig._al._ar._az._og._ol._lr.'.split('_'),
        weekdaysMin : 'ig_al_ar_az_og_ol_lr'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'YYYY-MM-DD',
            LL : 'YYYY[ko] MMMM[ren] D[a]',
            LLL : 'YYYY[ko] MMMM[ren] D[a] LT',
            LLLL : 'dddd, YYYY[ko] MMMM[ren] D[a] LT',
            l : 'YYYY-M-D',
            ll : 'YYYY[ko] MMM D[a]',
            lll : 'YYYY[ko] MMM D[a] LT',
            llll : 'ddd, YYYY[ko] MMM D[a] LT'
        },
        calendar : {
            sameDay : '[gaur] LT[etan]',
            nextDay : '[bihar] LT[etan]',
            nextWeek : 'dddd LT[etan]',
            lastDay : '[atzo] LT[etan]',
            lastWeek : '[aurreko] dddd LT[etan]',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s barru',
            past : 'duela %s',
            s : 'segundo batzuk',
            m : 'minutu bat',
            mm : '%d minutu',
            h : 'ordu bat',
            hh : '%d ordu',
            d : 'egun bat',
            dd : '%d egun',
            M : 'hilabete bat',
            MM : '%d hilabete',
            y : 'urte bat',
            yy : '%d urte'
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Persian (fa)
// author : Ebrahim Byagowi : https://github.com/ebraminio

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '۱',
        '2': '۲',
        '3': '۳',
        '4': '۴',
        '5': '۵',
        '6': '۶',
        '7': '۷',
        '8': '۸',
        '9': '۹',
        '0': '۰'
    }, numberMap = {
        '۱': '1',
        '۲': '2',
        '۳': '3',
        '۴': '4',
        '۵': '5',
        '۶': '6',
        '۷': '7',
        '۸': '8',
        '۹': '9',
        '۰': '0'
    };

    return moment.defineLocale('fa', {
        months : 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
        monthsShort : 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
        weekdays : 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
        weekdaysShort : 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
        weekdaysMin : 'ی_د_س_چ_پ_ج_ش'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'قبل از ظهر';
            } else {
                return 'بعد از ظهر';
            }
        },
        calendar : {
            sameDay : '[امروز ساعت] LT',
            nextDay : '[فردا ساعت] LT',
            nextWeek : 'dddd [ساعت] LT',
            lastDay : '[دیروز ساعت] LT',
            lastWeek : 'dddd [پیش] [ساعت] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'در %s',
            past : '%s پیش',
            s : 'چندین ثانیه',
            m : 'یک دقیقه',
            mm : '%d دقیقه',
            h : 'یک ساعت',
            hh : '%d ساعت',
            d : 'یک روز',
            dd : '%d روز',
            M : 'یک ماه',
            MM : '%d ماه',
            y : 'یک سال',
            yy : '%d سال'
        },
        preparse: function (string) {
            return string.replace(/[۰-۹]/g, function (match) {
                return numberMap[match];
            }).replace(/،/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '،');
        },
        ordinal : '%dم',
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12 // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : finnish (fi)
// author : Tarmo Aidantausta : https://github.com/bleadof

(function (factory) {
    factory(moment);
}(function (moment) {
    var numbersPast = 'nolla yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän'.split(' '),
        numbersFuture = [
            'nolla', 'yhden', 'kahden', 'kolmen', 'neljän', 'viiden', 'kuuden',
            numbersPast[7], numbersPast[8], numbersPast[9]
        ];

    function translate(number, withoutSuffix, key, isFuture) {
        var result = '';
        switch (key) {
        case 's':
            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
        case 'm':
            return isFuture ? 'minuutin' : 'minuutti';
        case 'mm':
            result = isFuture ? 'minuutin' : 'minuuttia';
            break;
        case 'h':
            return isFuture ? 'tunnin' : 'tunti';
        case 'hh':
            result = isFuture ? 'tunnin' : 'tuntia';
            break;
        case 'd':
            return isFuture ? 'päivän' : 'päivä';
        case 'dd':
            result = isFuture ? 'päivän' : 'päivää';
            break;
        case 'M':
            return isFuture ? 'kuukauden' : 'kuukausi';
        case 'MM':
            result = isFuture ? 'kuukauden' : 'kuukautta';
            break;
        case 'y':
            return isFuture ? 'vuoden' : 'vuosi';
        case 'yy':
            result = isFuture ? 'vuoden' : 'vuotta';
            break;
        }
        result = verbalNumber(number, isFuture) + ' ' + result;
        return result;
    }

    function verbalNumber(number, isFuture) {
        return number < 10 ? (isFuture ? numbersFuture[number] : numbersPast[number]) : number;
    }

    return moment.defineLocale('fi', {
        months : 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
        monthsShort : 'tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu'.split('_'),
        weekdays : 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
        weekdaysShort : 'su_ma_ti_ke_to_pe_la'.split('_'),
        weekdaysMin : 'su_ma_ti_ke_to_pe_la'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            L : 'DD.MM.YYYY',
            LL : 'Do MMMM[ta] YYYY',
            LLL : 'Do MMMM[ta] YYYY, [klo] LT',
            LLLL : 'dddd, Do MMMM[ta] YYYY, [klo] LT',
            l : 'D.M.YYYY',
            ll : 'Do MMM YYYY',
            lll : 'Do MMM YYYY, [klo] LT',
            llll : 'ddd, Do MMM YYYY, [klo] LT'
        },
        calendar : {
            sameDay : '[tänään] [klo] LT',
            nextDay : '[huomenna] [klo] LT',
            nextWeek : 'dddd [klo] LT',
            lastDay : '[eilen] [klo] LT',
            lastWeek : '[viime] dddd[na] [klo] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s päästä',
            past : '%s sitten',
            s : translate,
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : faroese (fo)
// author : Ragnar Johannesen : https://github.com/ragnar123

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('fo', {
        months : 'januar_februar_mars_apríl_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'sunnudagur_mánadagur_týsdagur_mikudagur_hósdagur_fríggjadagur_leygardagur'.split('_'),
        weekdaysShort : 'sun_mán_týs_mik_hós_frí_ley'.split('_'),
        weekdaysMin : 'su_má_tý_mi_hó_fr_le'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D. MMMM, YYYY LT'
        },
        calendar : {
            sameDay : '[Í dag kl.] LT',
            nextDay : '[Í morgin kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[Í gjár kl.] LT',
            lastWeek : '[síðstu] dddd [kl] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'um %s',
            past : '%s síðani',
            s : 'fá sekund',
            m : 'ein minutt',
            mm : '%d minuttir',
            h : 'ein tími',
            hh : '%d tímar',
            d : 'ein dagur',
            dd : '%d dagar',
            M : 'ein mánaði',
            MM : '%d mánaðir',
            y : 'eitt ár',
            yy : '%d ár'
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : canadian french (fr-ca)
// author : Jonathan Abourbih : https://github.com/jonbca

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('fr-ca', {
        months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
        monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Aujourd\'hui à] LT',
            nextDay: '[Demain à] LT',
            nextWeek: 'dddd [à] LT',
            lastDay: '[Hier à] LT',
            lastWeek: 'dddd [dernier à] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : '');
        }
    });
}));
// moment.js locale configuration
// locale : french (fr)
// author : John Fischer : https://github.com/jfroffice

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('fr', {
        months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
        monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Aujourd\'hui à] LT',
            nextDay: '[Demain à] LT',
            nextWeek: 'dddd [à] LT',
            lastDay: '[Hier à] LT',
            lastWeek: 'dddd [dernier à] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : '');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : galician (gl)
// author : Juan G. Hurtado : https://github.com/juanghurtado

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('gl', {
        months : 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xuño_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
        monthsShort : 'Xan._Feb._Mar._Abr._Mai._Xuñ._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
        weekdays : 'Domingo_Luns_Martes_Mércores_Xoves_Venres_Sábado'.split('_'),
        weekdaysShort : 'Dom._Lun._Mar._Mér._Xov._Ven._Sáb.'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_Mé_Xo_Ve_Sá'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay : function () {
                return '[hoxe ' + ((this.hours() !== 1) ? 'ás' : 'á') + '] LT';
            },
            nextDay : function () {
                return '[mañá ' + ((this.hours() !== 1) ? 'ás' : 'á') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [' + ((this.hours() !== 1) ? 'ás' : 'a') + '] LT';
            },
            lastDay : function () {
                return '[onte ' + ((this.hours() !== 1) ? 'á' : 'a') + '] LT';
            },
            lastWeek : function () {
                return '[o] dddd [pasado ' + ((this.hours() !== 1) ? 'ás' : 'a') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : function (str) {
                if (str === 'uns segundos') {
                    return 'nuns segundos';
                }
                return 'en ' + str;
            },
            past : 'hai %s',
            s : 'uns segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'unha hora',
            hh : '%d horas',
            d : 'un día',
            dd : '%d días',
            M : 'un mes',
            MM : '%d meses',
            y : 'un ano',
            yy : '%d anos'
        },
        ordinal : '%dº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Hebrew (he)
// author : Tomer Cohen : https://github.com/tomer
// author : Moshe Simantov : https://github.com/DevelopmentIL
// author : Tal Ater : https://github.com/TalAter

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('he', {
        months : 'ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר'.split('_'),
        monthsShort : 'ינו׳_פבר׳_מרץ_אפר׳_מאי_יוני_יולי_אוג׳_ספט׳_אוק׳_נוב׳_דצמ׳'.split('_'),
        weekdays : 'ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת'.split('_'),
        weekdaysShort : 'א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳'.split('_'),
        weekdaysMin : 'א_ב_ג_ד_ה_ו_ש'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D [ב]MMMM YYYY',
            LLL : 'D [ב]MMMM YYYY LT',
            LLLL : 'dddd, D [ב]MMMM YYYY LT',
            l : 'D/M/YYYY',
            ll : 'D MMM YYYY',
            lll : 'D MMM YYYY LT',
            llll : 'ddd, D MMM YYYY LT'
        },
        calendar : {
            sameDay : '[היום ב־]LT',
            nextDay : '[מחר ב־]LT',
            nextWeek : 'dddd [בשעה] LT',
            lastDay : '[אתמול ב־]LT',
            lastWeek : '[ביום] dddd [האחרון בשעה] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'בעוד %s',
            past : 'לפני %s',
            s : 'מספר שניות',
            m : 'דקה',
            mm : '%d דקות',
            h : 'שעה',
            hh : function (number) {
                if (number === 2) {
                    return 'שעתיים';
                }
                return number + ' שעות';
            },
            d : 'יום',
            dd : function (number) {
                if (number === 2) {
                    return 'יומיים';
                }
                return number + ' ימים';
            },
            M : 'חודש',
            MM : function (number) {
                if (number === 2) {
                    return 'חודשיים';
                }
                return number + ' חודשים';
            },
            y : 'שנה',
            yy : function (number) {
                if (number === 2) {
                    return 'שנתיים';
                }
                return number + ' שנים';
            }
        }
    });
}));
// moment.js locale configuration
// locale : hindi (hi)
// author : Mayank Singhal : https://github.com/mayanksinghal

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '१',
        '2': '२',
        '3': '३',
        '4': '४',
        '5': '५',
        '6': '६',
        '7': '७',
        '8': '८',
        '9': '९',
        '0': '०'
    },
    numberMap = {
        '१': '1',
        '२': '2',
        '३': '3',
        '४': '4',
        '५': '5',
        '६': '6',
        '७': '7',
        '८': '8',
        '९': '9',
        '०': '0'
    };

    return moment.defineLocale('hi', {
        months : 'जनवरी_फ़रवरी_मार्च_अप्रैल_मई_जून_जुलाई_अगस्त_सितम्बर_अक्टूबर_नवम्बर_दिसम्बर'.split('_'),
        monthsShort : 'जन._फ़र._मार्च_अप्रै._मई_जून_जुल._अग._सित._अक्टू._नव._दिस.'.split('_'),
        weekdays : 'रविवार_सोमवार_मंगलवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split('_'),
        weekdaysShort : 'रवि_सोम_मंगल_बुध_गुरू_शुक्र_शनि'.split('_'),
        weekdaysMin : 'र_सो_मं_बु_गु_शु_श'.split('_'),
        longDateFormat : {
            LT : 'A h:mm बजे',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[आज] LT',
            nextDay : '[कल] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[कल] LT',
            lastWeek : '[पिछले] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s में',
            past : '%s पहले',
            s : 'कुछ ही क्षण',
            m : 'एक मिनट',
            mm : '%d मिनट',
            h : 'एक घंटा',
            hh : '%d घंटे',
            d : 'एक दिन',
            dd : '%d दिन',
            M : 'एक महीने',
            MM : '%d महीने',
            y : 'एक वर्ष',
            yy : '%d वर्ष'
        },
        preparse: function (string) {
            return string.replace(/[१२३४५६७८९०]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        // Hindi notation for meridiems are quite fuzzy in practice. While there exists
        // a rigid notion of a 'Pahar' it is not used as rigidly in modern Hindi.
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'रात';
            } else if (hour < 10) {
                return 'सुबह';
            } else if (hour < 17) {
                return 'दोपहर';
            } else if (hour < 20) {
                return 'शाम';
            } else {
                return 'रात';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : hrvatski (hr)
// author : Bojan Marković : https://github.com/bmarkovic

// based on (sl) translation by Robert Sedovšek

(function (factory) {
    factory(moment);
}(function (moment) {
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }

    return moment.defineLocale('hr', {
        months : 'sječanj_veljača_ožujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_'),
        monthsShort : 'sje._vel._ožu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota'.split('_'),
        weekdaysShort : 'ned._pon._uto._sri._čet._pet._sub.'.split('_'),
        weekdaysMin : 'ne_po_ut_sr_če_pe_su'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay  : '[danas u] LT',
            nextDay  : '[sutra u] LT',

            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[jučer u] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[prošlu] dddd [u] LT';
                case 6:
                    return '[prošle] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[prošli] dddd [u] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'par sekundi',
            m      : translate,
            mm     : translate,
            h      : translate,
            hh     : translate,
            d      : 'dan',
            dd     : translate,
            M      : 'mjesec',
            MM     : translate,
            y      : 'godinu',
            yy     : translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : hungarian (hu)
// author : Adam Brunner : https://github.com/adambrunner

(function (factory) {
    factory(moment);
}(function (moment) {
    var weekEndings = 'vasárnap hétfőn kedden szerdán csütörtökön pénteken szombaton'.split(' ');

    function translate(number, withoutSuffix, key, isFuture) {
        var num = number,
            suffix;

        switch (key) {
        case 's':
            return (isFuture || withoutSuffix) ? 'néhány másodperc' : 'néhány másodperce';
        case 'm':
            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'mm':
            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'h':
            return 'egy' + (isFuture || withoutSuffix ? ' óra' : ' órája');
        case 'hh':
            return num + (isFuture || withoutSuffix ? ' óra' : ' órája');
        case 'd':
            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'dd':
            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'M':
            return 'egy' + (isFuture || withoutSuffix ? ' hónap' : ' hónapja');
        case 'MM':
            return num + (isFuture || withoutSuffix ? ' hónap' : ' hónapja');
        case 'y':
            return 'egy' + (isFuture || withoutSuffix ? ' év' : ' éve');
        case 'yy':
            return num + (isFuture || withoutSuffix ? ' év' : ' éve');
        }

        return '';
    }

    function week(isFuture) {
        return (isFuture ? '' : '[múlt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
    }

    return moment.defineLocale('hu', {
        months : 'január_február_március_április_május_június_július_augusztus_szeptember_október_november_december'.split('_'),
        monthsShort : 'jan_feb_márc_ápr_máj_jún_júl_aug_szept_okt_nov_dec'.split('_'),
        weekdays : 'vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat'.split('_'),
        weekdaysShort : 'vas_hét_kedd_sze_csüt_pén_szo'.split('_'),
        weekdaysMin : 'v_h_k_sze_cs_p_szo'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'YYYY.MM.DD.',
            LL : 'YYYY. MMMM D.',
            LLL : 'YYYY. MMMM D., LT',
            LLLL : 'YYYY. MMMM D., dddd LT'
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower === true ? 'de' : 'DE';
            } else {
                return isLower === true ? 'du' : 'DU';
            }
        },
        calendar : {
            sameDay : '[ma] LT[-kor]',
            nextDay : '[holnap] LT[-kor]',
            nextWeek : function () {
                return week.call(this, true);
            },
            lastDay : '[tegnap] LT[-kor]',
            lastWeek : function () {
                return week.call(this, false);
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s múlva',
            past : '%s',
            s : translate,
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Armenian (hy-am)
// author : Armendarabyan : https://github.com/armendarabyan

(function (factory) {
    factory(moment);
}(function (moment) {
    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'հունվար_փետրվար_մարտ_ապրիլ_մայիս_հունիս_հուլիս_օգոստոս_սեպտեմբեր_հոկտեմբեր_նոյեմբեր_դեկտեմբեր'.split('_'),
            'accusative': 'հունվարի_փետրվարի_մարտի_ապրիլի_մայիսի_հունիսի_հուլիսի_օգոստոսի_սեպտեմբերի_հոկտեմբերի_նոյեմբերի_դեկտեմբերի'.split('_')
        },

        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function monthsShortCaseReplace(m, format) {
        var monthsShort = 'հնվ_փտր_մրտ_ապր_մյս_հնս_հլս_օգս_սպտ_հկտ_նմբ_դկտ'.split('_');

        return monthsShort[m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = 'կիրակի_երկուշաբթի_երեքշաբթի_չորեքշաբթի_հինգշաբթի_ուրբաթ_շաբաթ'.split('_');

        return weekdays[m.day()];
    }

    return moment.defineLocale('hy-am', {
        months : monthsCaseReplace,
        monthsShort : monthsShortCaseReplace,
        weekdays : weekdaysCaseReplace,
        weekdaysShort : 'կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ'.split('_'),
        weekdaysMin : 'կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY թ.',
            LLL : 'D MMMM YYYY թ., LT',
            LLLL : 'dddd, D MMMM YYYY թ., LT'
        },
        calendar : {
            sameDay: '[այսօր] LT',
            nextDay: '[վաղը] LT',
            lastDay: '[երեկ] LT',
            nextWeek: function () {
                return 'dddd [օրը ժամը] LT';
            },
            lastWeek: function () {
                return '[անցած] dddd [օրը ժամը] LT';
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : '%s հետո',
            past : '%s առաջ',
            s : 'մի քանի վայրկյան',
            m : 'րոպե',
            mm : '%d րոպե',
            h : 'ժամ',
            hh : '%d ժամ',
            d : 'օր',
            dd : '%d օր',
            M : 'ամիս',
            MM : '%d ամիս',
            y : 'տարի',
            yy : '%d տարի'
        },

        meridiem : function (hour) {
            if (hour < 4) {
                return 'գիշերվա';
            } else if (hour < 12) {
                return 'առավոտվա';
            } else if (hour < 17) {
                return 'ցերեկվա';
            } else {
                return 'երեկոյան';
            }
        },

        ordinal: function (number, period) {
            switch (period) {
            case 'DDD':
            case 'w':
            case 'W':
            case 'DDDo':
                if (number === 1) {
                    return number + '-ին';
                }
                return number + '-րդ';
            default:
                return number;
            }
        },

        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Bahasa Indonesia (id)
// author : Mohammad Satrio Utomo : https://github.com/tyok
// reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('id', {
        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
        weekdays : 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
        weekdaysShort : 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] LT',
            LLLL : 'dddd, D MMMM YYYY [pukul] LT'
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'siang';
            } else if (hours < 19) {
                return 'sore';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Besok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kemarin pukul] LT',
            lastWeek : 'dddd [lalu pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lalu',
            s : 'beberapa detik',
            m : 'semenit',
            mm : '%d menit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : icelandic (is)
// author : Hinrik Örn Sigurðsson : https://github.com/hinrik

(function (factory) {
    factory(moment);
}(function (moment) {
    function plural(n) {
        if (n % 100 === 11) {
            return true;
        } else if (n % 10 === 1) {
            return false;
        }
        return true;
    }

    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'nokkrar sekúndur' : 'nokkrum sekúndum';
        case 'm':
            return withoutSuffix ? 'mínúta' : 'mínútu';
        case 'mm':
            if (plural(number)) {
                return result + (withoutSuffix || isFuture ? 'mínútur' : 'mínútum');
            } else if (withoutSuffix) {
                return result + 'mínúta';
            }
            return result + 'mínútu';
        case 'hh':
            if (plural(number)) {
                return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
            }
            return result + 'klukkustund';
        case 'd':
            if (withoutSuffix) {
                return 'dagur';
            }
            return isFuture ? 'dag' : 'degi';
        case 'dd':
            if (plural(number)) {
                if (withoutSuffix) {
                    return result + 'dagar';
                }
                return result + (isFuture ? 'daga' : 'dögum');
            } else if (withoutSuffix) {
                return result + 'dagur';
            }
            return result + (isFuture ? 'dag' : 'degi');
        case 'M':
            if (withoutSuffix) {
                return 'mánuður';
            }
            return isFuture ? 'mánuð' : 'mánuði';
        case 'MM':
            if (plural(number)) {
                if (withoutSuffix) {
                    return result + 'mánuðir';
                }
                return result + (isFuture ? 'mánuði' : 'mánuðum');
            } else if (withoutSuffix) {
                return result + 'mánuður';
            }
            return result + (isFuture ? 'mánuð' : 'mánuði');
        case 'y':
            return withoutSuffix || isFuture ? 'ár' : 'ári';
        case 'yy':
            if (plural(number)) {
                return result + (withoutSuffix || isFuture ? 'ár' : 'árum');
            }
            return result + (withoutSuffix || isFuture ? 'ár' : 'ári');
        }
    }

    return moment.defineLocale('is', {
        months : 'janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des'.split('_'),
        weekdays : 'sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur'.split('_'),
        weekdaysShort : 'sun_mán_þri_mið_fim_fös_lau'.split('_'),
        weekdaysMin : 'Su_Má_Þr_Mi_Fi_Fö_La'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'DD/MM/YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY [kl.] LT',
            LLLL : 'dddd, D. MMMM YYYY [kl.] LT'
        },
        calendar : {
            sameDay : '[í dag kl.] LT',
            nextDay : '[á morgun kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[í gær kl.] LT',
            lastWeek : '[síðasta] dddd [kl.] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'eftir %s',
            past : 'fyrir %s síðan',
            s : translate,
            m : translate,
            mm : translate,
            h : 'klukkustund',
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : italian (it)
// author : Lorenzo : https://github.com/aliem
// author: Mattia Larentis: https://github.com/nostalgiaz

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('it', {
        months : 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
        monthsShort : 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
        weekdays : 'Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato'.split('_'),
        weekdaysShort : 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
        weekdaysMin : 'D_L_Ma_Me_G_V_S'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Oggi alle] LT',
            nextDay: '[Domani alle] LT',
            nextWeek: 'dddd [alle] LT',
            lastDay: '[Ieri alle] LT',
            lastWeek: '[lo scorso] dddd [alle] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : function (s) {
                return ((/^[0-9].+$/).test(s) ? 'tra' : 'in') + ' ' + s;
            },
            past : '%s fa',
            s : 'alcuni secondi',
            m : 'un minuto',
            mm : '%d minuti',
            h : 'un\'ora',
            hh : '%d ore',
            d : 'un giorno',
            dd : '%d giorni',
            M : 'un mese',
            MM : '%d mesi',
            y : 'un anno',
            yy : '%d anni'
        },
        ordinal: '%dº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : japanese (ja)
// author : LI Long : https://github.com/baryon

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ja', {
        months : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
        monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
        weekdays : '日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日'.split('_'),
        weekdaysShort : '日_月_火_水_木_金_土'.split('_'),
        weekdaysMin : '日_月_火_水_木_金_土'.split('_'),
        longDateFormat : {
            LT : 'Ah時m分',
            L : 'YYYY/MM/DD',
            LL : 'YYYY年M月D日',
            LLL : 'YYYY年M月D日LT',
            LLLL : 'YYYY年M月D日LT dddd'
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return '午前';
            } else {
                return '午後';
            }
        },
        calendar : {
            sameDay : '[今日] LT',
            nextDay : '[明日] LT',
            nextWeek : '[来週]dddd LT',
            lastDay : '[昨日] LT',
            lastWeek : '[前週]dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s後',
            past : '%s前',
            s : '数秒',
            m : '1分',
            mm : '%d分',
            h : '1時間',
            hh : '%d時間',
            d : '1日',
            dd : '%d日',
            M : '1ヶ月',
            MM : '%dヶ月',
            y : '1年',
            yy : '%d年'
        }
    });
}));
// moment.js locale configuration
// locale : Georgian (ka)
// author : Irakli Janiashvili : https://github.com/irakli-janiashvili

(function (factory) {
    factory(moment);
}(function (moment) {
    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'იანვარი_თებერვალი_მარტი_აპრილი_მაისი_ივნისი_ივლისი_აგვისტო_სექტემბერი_ოქტომბერი_ნოემბერი_დეკემბერი'.split('_'),
            'accusative': 'იანვარს_თებერვალს_მარტს_აპრილის_მაისს_ივნისს_ივლისს_აგვისტს_სექტემბერს_ოქტომბერს_ნოემბერს_დეკემბერს'.split('_')
        },

        nounCase = (/D[oD] *MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': 'კვირა_ორშაბათი_სამშაბათი_ოთხშაბათი_ხუთშაბათი_პარასკევი_შაბათი'.split('_'),
            'accusative': 'კვირას_ორშაბათს_სამშაბათს_ოთხშაბათს_ხუთშაბათს_პარასკევს_შაბათს'.split('_')
        },

        nounCase = (/(წინა|შემდეგ)/).test(format) ?
            'accusative' :
            'nominative';

        return weekdays[nounCase][m.day()];
    }

    return moment.defineLocale('ka', {
        months : monthsCaseReplace,
        monthsShort : 'იან_თებ_მარ_აპრ_მაი_ივნ_ივლ_აგვ_სექ_ოქტ_ნოე_დეკ'.split('_'),
        weekdays : weekdaysCaseReplace,
        weekdaysShort : 'კვი_ორშ_სამ_ოთხ_ხუთ_პარ_შაბ'.split('_'),
        weekdaysMin : 'კვ_ორ_სა_ოთ_ხუ_პა_შა'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[დღეს] LT[-ზე]',
            nextDay : '[ხვალ] LT[-ზე]',
            lastDay : '[გუშინ] LT[-ზე]',
            nextWeek : '[შემდეგ] dddd LT[-ზე]',
            lastWeek : '[წინა] dddd LT-ზე',
            sameElse : 'L'
        },
        relativeTime : {
            future : function (s) {
                return (/(წამი|წუთი|საათი|წელი)/).test(s) ?
                    s.replace(/ი$/, 'ში') :
                    s + 'ში';
            },
            past : function (s) {
                if ((/(წამი|წუთი|საათი|დღე|თვე)/).test(s)) {
                    return s.replace(/(ი|ე)$/, 'ის წინ');
                }
                if ((/წელი/).test(s)) {
                    return s.replace(/წელი$/, 'წლის წინ');
                }
            },
            s : 'რამდენიმე წამი',
            m : 'წუთი',
            mm : '%d წუთი',
            h : 'საათი',
            hh : '%d საათი',
            d : 'დღე',
            dd : '%d დღე',
            M : 'თვე',
            MM : '%d თვე',
            y : 'წელი',
            yy : '%d წელი'
        },
        ordinal : function (number) {
            if (number === 0) {
                return number;
            }

            if (number === 1) {
                return number + '-ლი';
            }

            if ((number < 20) || (number <= 100 && (number % 20 === 0)) || (number % 100 === 0)) {
                return 'მე-' + number;
            }

            return number + '-ე';
        },
        week : {
            dow : 1,
            doy : 7
        }
    });
}));
// moment.js locale configuration
// locale : khmer (km)
// author : Kruy Vanna : https://github.com/kruyvanna

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('km', {
        months: 'មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ'.split('_'),
        monthsShort: 'មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ'.split('_'),
        weekdays: 'អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍'.split('_'),
        weekdaysShort: 'អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍'.split('_'),
        weekdaysMin: 'អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[ថ្ងៃនៈ ម៉ោង] LT',
            nextDay: '[ស្អែក ម៉ោង] LT',
            nextWeek: 'dddd [ម៉ោង] LT',
            lastDay: '[ម្សិលមិញ ម៉ោង] LT',
            lastWeek: 'dddd [សប្តាហ៍មុន] [ម៉ោង] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%sទៀត',
            past: '%sមុន',
            s: 'ប៉ុន្មានវិនាទី',
            m: 'មួយនាទី',
            mm: '%d នាទី',
            h: 'មួយម៉ោង',
            hh: '%d ម៉ោង',
            d: 'មួយថ្ងៃ',
            dd: '%d ថ្ងៃ',
            M: 'មួយខែ',
            MM: '%d ខែ',
            y: 'មួយឆ្នាំ',
            yy: '%d ឆ្នាំ'
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : korean (ko)
//
// authors
//
// - Kyungwook, Park : https://github.com/kyungw00k
// - Jeeeyul Lee <jeeeyul@gmail.com>
(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ko', {
        months : '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
        monthsShort : '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
        weekdays : '일요일_월요일_화요일_수요일_목요일_금요일_토요일'.split('_'),
        weekdaysShort : '일_월_화_수_목_금_토'.split('_'),
        weekdaysMin : '일_월_화_수_목_금_토'.split('_'),
        longDateFormat : {
            LT : 'A h시 m분',
            L : 'YYYY.MM.DD',
            LL : 'YYYY년 MMMM D일',
            LLL : 'YYYY년 MMMM D일 LT',
            LLLL : 'YYYY년 MMMM D일 dddd LT'
        },
        meridiem : function (hour, minute, isUpper) {
            return hour < 12 ? '오전' : '오후';
        },
        calendar : {
            sameDay : '오늘 LT',
            nextDay : '내일 LT',
            nextWeek : 'dddd LT',
            lastDay : '어제 LT',
            lastWeek : '지난주 dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s 후',
            past : '%s 전',
            s : '몇초',
            ss : '%d초',
            m : '일분',
            mm : '%d분',
            h : '한시간',
            hh : '%d시간',
            d : '하루',
            dd : '%d일',
            M : '한달',
            MM : '%d달',
            y : '일년',
            yy : '%d년'
        },
        ordinal : '%d일',
        meridiemParse : /(오전|오후)/,
        isPM : function (token) {
            return token === '오후';
        }
    });
}));
// moment.js locale configuration
// locale : Luxembourgish (lb)
// author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz

// Note: Luxembourgish has a very particular phonological rule ('Eifeler Regel') that causes the
// deletion of the final 'n' in certain contexts. That's what the 'eifelerRegelAppliesToWeekday'
// and 'eifelerRegelAppliesToNumber' methods are meant for

(function (factory) {
    factory(moment);
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eng Minutt', 'enger Minutt'],
            'h': ['eng Stonn', 'enger Stonn'],
            'd': ['een Dag', 'engem Dag'],
            'M': ['ee Mount', 'engem Mount'],
            'y': ['ee Joer', 'engem Joer']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    function processFutureTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'a ' + string;
        }
        return 'an ' + string;
    }

    function processPastTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'viru ' + string;
        }
        return 'virun ' + string;
    }

    /**
     * Returns true if the word before the given number loses the '-n' ending.
     * e.g. 'an 10 Deeg' but 'a 5 Deeg'
     *
     * @param number {integer}
     * @returns {boolean}
     */
    function eifelerRegelAppliesToNumber(number) {
        number = parseInt(number, 10);
        if (isNaN(number)) {
            return false;
        }
        if (number < 0) {
            // Negative Number --> always true
            return true;
        } else if (number < 10) {
            // Only 1 digit
            if (4 <= number && number <= 7) {
                return true;
            }
            return false;
        } else if (number < 100) {
            // 2 digits
            var lastDigit = number % 10, firstDigit = number / 10;
            if (lastDigit === 0) {
                return eifelerRegelAppliesToNumber(firstDigit);
            }
            return eifelerRegelAppliesToNumber(lastDigit);
        } else if (number < 10000) {
            // 3 or 4 digits --> recursively check first digit
            while (number >= 10) {
                number = number / 10;
            }
            return eifelerRegelAppliesToNumber(number);
        } else {
            // Anything larger than 4 digits: recursively check first n-3 digits
            number = number / 1000;
            return eifelerRegelAppliesToNumber(number);
        }
    }

    return moment.defineLocale('lb', {
        months: 'Januar_Februar_Mäerz_Abrëll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays: 'Sonndeg_Méindeg_Dënschdeg_Mëttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
        weekdaysShort: 'So._Mé._Dë._Më._Do._Fr._Sa.'.split('_'),
        weekdaysMin: 'So_Mé_Dë_Më_Do_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'H:mm [Auer]',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Haut um] LT',
            sameElse: 'L',
            nextDay: '[Muer um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[Gëschter um] LT',
            lastWeek: function () {
                // Different date string for 'Dënschdeg' (Tuesday) and 'Donneschdeg' (Thursday) due to phonological rule
                switch (this.day()) {
                    case 2:
                    case 4:
                        return '[Leschten] dddd [um] LT';
                    default:
                        return '[Leschte] dddd [um] LT';
                }
            }
        },
        relativeTime : {
            future : processFutureTime,
            past : processPastTime,
            s : 'e puer Sekonnen',
            m : processRelativeTime,
            mm : '%d Minutten',
            h : processRelativeTime,
            hh : '%d Stonnen',
            d : processRelativeTime,
            dd : '%d Deeg',
            M : processRelativeTime,
            MM : '%d Méint',
            y : processRelativeTime,
            yy : '%d Joer'
        },
        ordinal: '%d.',
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Lithuanian (lt)
// author : Mindaugas Mozūras : https://github.com/mmozuras

(function (factory) {
    factory(moment);
}(function (moment) {
    var units = {
        'm' : 'minutė_minutės_minutę',
        'mm': 'minutės_minučių_minutes',
        'h' : 'valanda_valandos_valandą',
        'hh': 'valandos_valandų_valandas',
        'd' : 'diena_dienos_dieną',
        'dd': 'dienos_dienų_dienas',
        'M' : 'mėnuo_mėnesio_mėnesį',
        'MM': 'mėnesiai_mėnesių_mėnesius',
        'y' : 'metai_metų_metus',
        'yy': 'metai_metų_metus'
    },
    weekDays = 'sekmadienis_pirmadienis_antradienis_trečiadienis_ketvirtadienis_penktadienis_šeštadienis'.split('_');

    function translateSeconds(number, withoutSuffix, key, isFuture) {
        if (withoutSuffix) {
            return 'kelios sekundės';
        } else {
            return isFuture ? 'kelių sekundžių' : 'kelias sekundes';
        }
    }

    function translateSingular(number, withoutSuffix, key, isFuture) {
        return withoutSuffix ? forms(key)[0] : (isFuture ? forms(key)[1] : forms(key)[2]);
    }

    function special(number) {
        return number % 10 === 0 || (number > 10 && number < 20);
    }

    function forms(key) {
        return units[key].split('_');
    }

    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        if (number === 1) {
            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
        } else if (withoutSuffix) {
            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
        } else {
            if (isFuture) {
                return result + forms(key)[1];
            } else {
                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
            }
        }
    }

    function relativeWeekDay(moment, format) {
        var nominative = format.indexOf('dddd HH:mm') === -1,
            weekDay = weekDays[moment.day()];

        return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + 'į';
    }

    return moment.defineLocale('lt', {
        months : 'sausio_vasario_kovo_balandžio_gegužės_birželio_liepos_rugpjūčio_rugsėjo_spalio_lapkričio_gruodžio'.split('_'),
        monthsShort : 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
        weekdays : relativeWeekDay,
        weekdaysShort : 'Sek_Pir_Ant_Tre_Ket_Pen_Šeš'.split('_'),
        weekdaysMin : 'S_P_A_T_K_Pn_Š'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'YYYY-MM-DD',
            LL : 'YYYY [m.] MMMM D [d.]',
            LLL : 'YYYY [m.] MMMM D [d.], LT [val.]',
            LLLL : 'YYYY [m.] MMMM D [d.], dddd, LT [val.]',
            l : 'YYYY-MM-DD',
            ll : 'YYYY [m.] MMMM D [d.]',
            lll : 'YYYY [m.] MMMM D [d.], LT [val.]',
            llll : 'YYYY [m.] MMMM D [d.], ddd, LT [val.]'
        },
        calendar : {
            sameDay : '[Šiandien] LT',
            nextDay : '[Rytoj] LT',
            nextWeek : 'dddd LT',
            lastDay : '[Vakar] LT',
            lastWeek : '[Praėjusį] dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'po %s',
            past : 'prieš %s',
            s : translateSeconds,
            m : translateSingular,
            mm : translate,
            h : translateSingular,
            hh : translate,
            d : translateSingular,
            dd : translate,
            M : translateSingular,
            MM : translate,
            y : translateSingular,
            yy : translate
        },
        ordinal : function (number) {
            return number + '-oji';
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : latvian (lv)
// author : Kristaps Karlsons : https://github.com/skakri

(function (factory) {
    factory(moment);
}(function (moment) {
    var units = {
        'mm': 'minūti_minūtes_minūte_minūtes',
        'hh': 'stundu_stundas_stunda_stundas',
        'dd': 'dienu_dienas_diena_dienas',
        'MM': 'mēnesi_mēnešus_mēnesis_mēneši',
        'yy': 'gadu_gadus_gads_gadi'
    };

    function format(word, number, withoutSuffix) {
        var forms = word.split('_');
        if (withoutSuffix) {
            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
        } else {
            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
        }
    }

    function relativeTimeWithPlural(number, withoutSuffix, key) {
        return number + ' ' + format(units[key], number, withoutSuffix);
    }

    return moment.defineLocale('lv', {
        months : 'janvāris_februāris_marts_aprīlis_maijs_jūnijs_jūlijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jūn_jūl_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'svētdiena_pirmdiena_otrdiena_trešdiena_ceturtdiena_piektdiena_sestdiena'.split('_'),
        weekdaysShort : 'Sv_P_O_T_C_Pk_S'.split('_'),
        weekdaysMin : 'Sv_P_O_T_C_Pk_S'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD.MM.YYYY',
            LL : 'YYYY. [gada] D. MMMM',
            LLL : 'YYYY. [gada] D. MMMM, LT',
            LLLL : 'YYYY. [gada] D. MMMM, dddd, LT'
        },
        calendar : {
            sameDay : '[Šodien pulksten] LT',
            nextDay : '[Rīt pulksten] LT',
            nextWeek : 'dddd [pulksten] LT',
            lastDay : '[Vakar pulksten] LT',
            lastWeek : '[Pagājušā] dddd [pulksten] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s vēlāk',
            past : '%s agrāk',
            s : 'dažas sekundes',
            m : 'minūti',
            mm : relativeTimeWithPlural,
            h : 'stundu',
            hh : relativeTimeWithPlural,
            d : 'dienu',
            dd : relativeTimeWithPlural,
            M : 'mēnesi',
            MM : relativeTimeWithPlural,
            y : 'gadu',
            yy : relativeTimeWithPlural
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : macedonian (mk)
// author : Borislav Mickov : https://github.com/B0k0

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('mk', {
        months : 'јануари_февруари_март_април_мај_јуни_јули_август_септември_октомври_ноември_декември'.split('_'),
        monthsShort : 'јан_фев_мар_апр_мај_јун_јул_авг_сеп_окт_ное_дек'.split('_'),
        weekdays : 'недела_понеделник_вторник_среда_четврток_петок_сабота'.split('_'),
        weekdaysShort : 'нед_пон_вто_сре_чет_пет_саб'.split('_'),
        weekdaysMin : 'нe_пo_вт_ср_че_пе_сa'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'D.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Денес во] LT',
            nextDay : '[Утре во] LT',
            nextWeek : 'dddd [во] LT',
            lastDay : '[Вчера во] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[Во изминатата] dddd [во] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[Во изминатиот] dddd [во] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'после %s',
            past : 'пред %s',
            s : 'неколку секунди',
            m : 'минута',
            mm : '%d минути',
            h : 'час',
            hh : '%d часа',
            d : 'ден',
            dd : '%d дена',
            M : 'месец',
            MM : '%d месеци',
            y : 'година',
            yy : '%d години'
        },
        ordinal : function (number) {
            var lastDigit = number % 10,
                last2Digits = number % 100;
            if (number === 0) {
                return number + '-ев';
            } else if (last2Digits === 0) {
                return number + '-ен';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-ти';
            } else if (lastDigit === 1) {
                return number + '-ви';
            } else if (lastDigit === 2) {
                return number + '-ри';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-ми';
            } else {
                return number + '-ти';
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : malayalam (ml)
// author : Floyd Pink : https://github.com/floydpink

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ml', {
        months : 'ജനുവരി_ഫെബ്രുവരി_മാർച്ച്_ഏപ്രിൽ_മേയ്_ജൂൺ_ജൂലൈ_ഓഗസ്റ്റ്_സെപ്റ്റംബർ_ഒക്ടോബർ_നവംബർ_ഡിസംബർ'.split('_'),
        monthsShort : 'ജനു._ഫെബ്രു._മാർ._ഏപ്രി._മേയ്_ജൂൺ_ജൂലൈ._ഓഗ._സെപ്റ്റ._ഒക്ടോ._നവം._ഡിസം.'.split('_'),
        weekdays : 'ഞായറാഴ്ച_തിങ്കളാഴ്ച_ചൊവ്വാഴ്ച_ബുധനാഴ്ച_വ്യാഴാഴ്ച_വെള്ളിയാഴ്ച_ശനിയാഴ്ച'.split('_'),
        weekdaysShort : 'ഞായർ_തിങ്കൾ_ചൊവ്വ_ബുധൻ_വ്യാഴം_വെള്ളി_ശനി'.split('_'),
        weekdaysMin : 'ഞാ_തി_ചൊ_ബു_വ്യാ_വെ_ശ'.split('_'),
        longDateFormat : {
            LT : 'A h:mm -നു',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[ഇന്ന്] LT',
            nextDay : '[നാളെ] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[ഇന്നലെ] LT',
            lastWeek : '[കഴിഞ്ഞ] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s കഴിഞ്ഞ്',
            past : '%s മുൻപ്',
            s : 'അൽപ നിമിഷങ്ങൾ',
            m : 'ഒരു മിനിറ്റ്',
            mm : '%d മിനിറ്റ്',
            h : 'ഒരു മണിക്കൂർ',
            hh : '%d മണിക്കൂർ',
            d : 'ഒരു ദിവസം',
            dd : '%d ദിവസം',
            M : 'ഒരു മാസം',
            MM : '%d മാസം',
            y : 'ഒരു വർഷം',
            yy : '%d വർഷം'
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'രാത്രി';
            } else if (hour < 12) {
                return 'രാവിലെ';
            } else if (hour < 17) {
                return 'ഉച്ച കഴിഞ്ഞ്';
            } else if (hour < 20) {
                return 'വൈകുന്നേരം';
            } else {
                return 'രാത്രി';
            }
        }
    });
}));
// moment.js locale configuration
// locale : Marathi (mr)
// author : Harshad Kale : https://github.com/kalehv

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '१',
        '2': '२',
        '3': '३',
        '4': '४',
        '5': '५',
        '6': '६',
        '7': '७',
        '8': '८',
        '9': '९',
        '0': '०'
    },
    numberMap = {
        '१': '1',
        '२': '2',
        '३': '3',
        '४': '4',
        '५': '5',
        '६': '6',
        '७': '7',
        '८': '8',
        '९': '9',
        '०': '0'
    };

    return moment.defineLocale('mr', {
        months : 'जानेवारी_फेब्रुवारी_मार्च_एप्रिल_मे_जून_जुलै_ऑगस्ट_सप्टेंबर_ऑक्टोबर_नोव्हेंबर_डिसेंबर'.split('_'),
        monthsShort: 'जाने._फेब्रु._मार्च._एप्रि._मे._जून._जुलै._ऑग._सप्टें._ऑक्टो._नोव्हें._डिसें.'.split('_'),
        weekdays : 'रविवार_सोमवार_मंगळवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split('_'),
        weekdaysShort : 'रवि_सोम_मंगळ_बुध_गुरू_शुक्र_शनि'.split('_'),
        weekdaysMin : 'र_सो_मं_बु_गु_शु_श'.split('_'),
        longDateFormat : {
            LT : 'A h:mm वाजता',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[आज] LT',
            nextDay : '[उद्या] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[काल] LT',
            lastWeek: '[मागील] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s नंतर',
            past : '%s पूर्वी',
            s : 'सेकंद',
            m: 'एक मिनिट',
            mm: '%d मिनिटे',
            h : 'एक तास',
            hh : '%d तास',
            d : 'एक दिवस',
            dd : '%d दिवस',
            M : 'एक महिना',
            MM : '%d महिने',
            y : 'एक वर्ष',
            yy : '%d वर्षे'
        },
        preparse: function (string) {
            return string.replace(/[१२३४५६७८९०]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiem: function (hour, minute, isLower)
        {
            if (hour < 4) {
                return 'रात्री';
            } else if (hour < 10) {
                return 'सकाळी';
            } else if (hour < 17) {
                return 'दुपारी';
            } else if (hour < 20) {
                return 'सायंकाळी';
            } else {
                return 'रात्री';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Bahasa Malaysia (ms-MY)
// author : Weldan Jamili : https://github.com/weldan

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ms-my', {
        months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
        weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
        weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
        weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] LT',
            LLLL : 'dddd, D MMMM YYYY [pukul] LT'
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'tengahari';
            } else if (hours < 19) {
                return 'petang';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Esok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kelmarin pukul] LT',
            lastWeek : 'dddd [lepas pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lepas',
            s : 'beberapa saat',
            m : 'seminit',
            mm : '%d minit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Burmese (my)
// author : Squar team, mysquar.com

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '၁',
        '2': '၂',
        '3': '၃',
        '4': '၄',
        '5': '၅',
        '6': '၆',
        '7': '၇',
        '8': '၈',
        '9': '၉',
        '0': '၀'
    }, numberMap = {
        '၁': '1',
        '၂': '2',
        '၃': '3',
        '၄': '4',
        '၅': '5',
        '၆': '6',
        '၇': '7',
        '၈': '8',
        '၉': '9',
        '၀': '0'
    };
    return moment.defineLocale('my', {
        months: 'ဇန်နဝါရီ_ဖေဖော်ဝါရီ_မတ်_ဧပြီ_မေ_ဇွန်_ဇူလိုင်_သြဂုတ်_စက်တင်ဘာ_အောက်တိုဘာ_နိုဝင်ဘာ_ဒီဇင်ဘာ'.split('_'),
        monthsShort: 'ဇန်_ဖေ_မတ်_ပြီ_မေ_ဇွန်_လိုင်_သြ_စက်_အောက်_နို_ဒီ'.split('_'),
        weekdays: 'တနင်္ဂနွေ_တနင်္လာ_အင်္ဂါ_ဗုဒ္ဓဟူး_ကြာသပတေး_သောကြာ_စနေ'.split('_'),
        weekdaysShort: 'နွေ_လာ_င်္ဂါ_ဟူး_ကြာ_သော_နေ'.split('_'),
        weekdaysMin: 'နွေ_လာ_င်္ဂါ_ဟူး_ကြာ_သော_နေ'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[ယနေ.] LT [မှာ]',
            nextDay: '[မနက်ဖြန်] LT [မှာ]',
            nextWeek: 'dddd LT [မှာ]',
            lastDay: '[မနေ.က] LT [မှာ]',
            lastWeek: '[ပြီးခဲ့သော] dddd LT [မှာ]',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'လာမည့် %s မှာ',
            past: 'လွန်ခဲ့သော %s က',
            s: 'စက္ကန်.အနည်းငယ်',
            m: 'တစ်မိနစ်',
            mm: '%d မိနစ်',
            h: 'တစ်နာရီ',
            hh: '%d နာရီ',
            d: 'တစ်ရက်',
            dd: '%d ရက်',
            M: 'တစ်လ',
            MM: '%d လ',
            y: 'တစ်နှစ်',
            yy: '%d နှစ်'
        },
        preparse: function (string) {
            return string.replace(/[၁၂၃၄၅၆၇၈၉၀]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : norwegian bokmål (nb)
// authors : Espen Hovlandsdal : https://github.com/rexxars
//           Sigurd Gartmann : https://github.com/sigurdga

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('nb', {
        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag'.split('_'),
        weekdaysShort : 'søn_man_tirs_ons_tors_fre_lør'.split('_'),
        weekdaysMin : 'sø_ma_ti_on_to_fr_lø'.split('_'),
        longDateFormat : {
            LT : 'H.mm',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY [kl.] LT',
            LLLL : 'dddd D. MMMM YYYY [kl.] LT'
        },
        calendar : {
            sameDay: '[i dag kl.] LT',
            nextDay: '[i morgen kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[i går kl.] LT',
            lastWeek: '[forrige] dddd [kl.] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'for %s siden',
            s : 'noen sekunder',
            m : 'ett minutt',
            mm : '%d minutter',
            h : 'en time',
            hh : '%d timer',
            d : 'en dag',
            dd : '%d dager',
            M : 'en måned',
            MM : '%d måneder',
            y : 'ett år',
            yy : '%d år'
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : nepali/nepalese
// author : suvash : https://github.com/suvash

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '१',
        '2': '२',
        '3': '३',
        '4': '४',
        '5': '५',
        '6': '६',
        '7': '७',
        '8': '८',
        '9': '९',
        '0': '०'
    },
    numberMap = {
        '१': '1',
        '२': '2',
        '३': '3',
        '४': '4',
        '५': '5',
        '६': '6',
        '७': '7',
        '८': '8',
        '९': '9',
        '०': '0'
    };

    return moment.defineLocale('ne', {
        months : 'जनवरी_फेब्रुवरी_मार्च_अप्रिल_मई_जुन_जुलाई_अगष्ट_सेप्टेम्बर_अक्टोबर_नोभेम्बर_डिसेम्बर'.split('_'),
        monthsShort : 'जन._फेब्रु._मार्च_अप्रि._मई_जुन_जुलाई._अग._सेप्ट._अक्टो._नोभे._डिसे.'.split('_'),
        weekdays : 'आइतबार_सोमबार_मङ्गलबार_बुधबार_बिहिबार_शुक्रबार_शनिबार'.split('_'),
        weekdaysShort : 'आइत._सोम._मङ्गल._बुध._बिहि._शुक्र._शनि.'.split('_'),
        weekdaysMin : 'आइ._सो._मङ्_बु._बि._शु._श.'.split('_'),
        longDateFormat : {
            LT : 'Aको h:mm बजे',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        preparse: function (string) {
            return string.replace(/[१२३४५६७८९०]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 3) {
                return 'राती';
            } else if (hour < 10) {
                return 'बिहान';
            } else if (hour < 15) {
                return 'दिउँसो';
            } else if (hour < 18) {
                return 'बेलुका';
            } else if (hour < 20) {
                return 'साँझ';
            } else {
                return 'राती';
            }
        },
        calendar : {
            sameDay : '[आज] LT',
            nextDay : '[भोली] LT',
            nextWeek : '[आउँदो] dddd[,] LT',
            lastDay : '[हिजो] LT',
            lastWeek : '[गएको] dddd[,] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%sमा',
            past : '%s अगाडी',
            s : 'केही समय',
            m : 'एक मिनेट',
            mm : '%d मिनेट',
            h : 'एक घण्टा',
            hh : '%d घण्टा',
            d : 'एक दिन',
            dd : '%d दिन',
            M : 'एक महिना',
            MM : '%d महिना',
            y : 'एक बर्ष',
            yy : '%d बर्ष'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : dutch (nl)
// author : Joris Röling : https://github.com/jjupiter

(function (factory) {
    factory(moment);
}(function (moment) {
    var monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'),
        monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');

    return moment.defineLocale('nl', {
        months : 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShortWithoutDots[m.month()];
            } else {
                return monthsShortWithDots[m.month()];
            }
        },
        weekdays : 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
        weekdaysShort : 'zo._ma._di._wo._do._vr._za.'.split('_'),
        weekdaysMin : 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD-MM-YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[vandaag om] LT',
            nextDay: '[morgen om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[gisteren om] LT',
            lastWeek: '[afgelopen] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'over %s',
            past : '%s geleden',
            s : 'een paar seconden',
            m : 'één minuut',
            mm : '%d minuten',
            h : 'één uur',
            hh : '%d uur',
            d : 'één dag',
            dd : '%d dagen',
            M : 'één maand',
            MM : '%d maanden',
            y : 'één jaar',
            yy : '%d jaar'
        },
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : norwegian nynorsk (nn)
// author : https://github.com/mechuwind

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('nn', {
        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'sundag_måndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
        weekdaysShort : 'sun_mån_tys_ons_tor_fre_lau'.split('_'),
        weekdaysMin : 'su_må_ty_on_to_fr_lø'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[I dag klokka] LT',
            nextDay: '[I morgon klokka] LT',
            nextWeek: 'dddd [klokka] LT',
            lastDay: '[I går klokka] LT',
            lastWeek: '[Føregåande] dddd [klokka] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'for %s sidan',
            s : 'nokre sekund',
            m : 'eit minutt',
            mm : '%d minutt',
            h : 'ein time',
            hh : '%d timar',
            d : 'ein dag',
            dd : '%d dagar',
            M : 'ein månad',
            MM : '%d månader',
            y : 'eit år',
            yy : '%d år'
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : polish (pl)
// author : Rafal Hirsz : https://github.com/evoL

(function (factory) {
    factory(moment);
}(function (moment) {
    var monthsNominative = 'styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień'.split('_'),
        monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_września_października_listopada_grudnia'.split('_');

    function plural(n) {
        return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
    }

    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'minuta' : 'minutę';
        case 'mm':
            return result + (plural(number) ? 'minuty' : 'minut');
        case 'h':
            return withoutSuffix  ? 'godzina'  : 'godzinę';
        case 'hh':
            return result + (plural(number) ? 'godziny' : 'godzin');
        case 'MM':
            return result + (plural(number) ? 'miesiące' : 'miesięcy');
        case 'yy':
            return result + (plural(number) ? 'lata' : 'lat');
        }
    }

    return moment.defineLocale('pl', {
        months : function (momentToFormat, format) {
            if (/D MMMM/.test(format)) {
                return monthsSubjective[momentToFormat.month()];
            } else {
                return monthsNominative[momentToFormat.month()];
            }
        },
        monthsShort : 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru'.split('_'),
        weekdays : 'niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota'.split('_'),
        weekdaysShort : 'nie_pon_wt_śr_czw_pt_sb'.split('_'),
        weekdaysMin : 'N_Pn_Wt_Śr_Cz_Pt_So'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Dziś o] LT',
            nextDay: '[Jutro o] LT',
            nextWeek: '[W] dddd [o] LT',
            lastDay: '[Wczoraj o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[W zeszłą niedzielę o] LT';
                case 3:
                    return '[W zeszłą środę o] LT';
                case 6:
                    return '[W zeszłą sobotę o] LT';
                default:
                    return '[W zeszły] dddd [o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : '%s temu',
            s : 'kilka sekund',
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : '1 dzień',
            dd : '%d dni',
            M : 'miesiąc',
            MM : translate,
            y : 'rok',
            yy : translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : brazilian portuguese (pt-br)
// author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('pt-br', {
        months : 'janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
        monthsShort : 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
        weekdays : 'domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado'.split('_'),
        weekdaysShort : 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
        weekdaysMin : 'dom_2ª_3ª_4ª_5ª_6ª_sáb'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY [às] LT',
            LLLL : 'dddd, D [de] MMMM [de] YYYY [às] LT'
        },
        calendar : {
            sameDay: '[Hoje às] LT',
            nextDay: '[Amanhã às] LT',
            nextWeek: 'dddd [às] LT',
            lastDay: '[Ontem às] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Último] dddd [às] LT' : // Saturday + Sunday
                    '[Última] dddd [às] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : '%s atrás',
            s : 'segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um mês',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinal : '%dº'
    });
}));
// moment.js locale configuration
// locale : portuguese (pt)
// author : Jefferson : https://github.com/jalex79

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('pt', {
        months : 'janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
        monthsShort : 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
        weekdays : 'domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado'.split('_'),
        weekdaysShort : 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
        weekdaysMin : 'dom_2ª_3ª_4ª_5ª_6ª_sáb'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY LT',
            LLLL : 'dddd, D [de] MMMM [de] YYYY LT'
        },
        calendar : {
            sameDay: '[Hoje às] LT',
            nextDay: '[Amanhã às] LT',
            nextWeek: 'dddd [às] LT',
            lastDay: '[Ontem às] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Último] dddd [às] LT' : // Saturday + Sunday
                    '[Última] dddd [às] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : 'há %s',
            s : 'segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um mês',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinal : '%dº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : romanian (ro)
// author : Vlad Gurdiga : https://github.com/gurdiga
// author : Valentin Agachi : https://github.com/avaly

(function (factory) {
    factory(moment);
}(function (moment) {
    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': 'minute',
                'hh': 'ore',
                'dd': 'zile',
                'MM': 'luni',
                'yy': 'ani'
            },
            separator = ' ';
        if (number % 100 >= 20 || (number >= 100 && number % 100 === 0)) {
            separator = ' de ';
        }

        return number + separator + format[key];
    }

    return moment.defineLocale('ro', {
        months : 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
        monthsShort : 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
        weekdays : 'duminică_luni_marți_miercuri_joi_vineri_sâmbătă'.split('_'),
        weekdaysShort : 'Dum_Lun_Mar_Mie_Joi_Vin_Sâm'.split('_'),
        weekdaysMin : 'Du_Lu_Ma_Mi_Jo_Vi_Sâ'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd, D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay: '[azi la] LT',
            nextDay: '[mâine la] LT',
            nextWeek: 'dddd [la] LT',
            lastDay: '[ieri la] LT',
            lastWeek: '[fosta] dddd [la] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'peste %s',
            past : '%s în urmă',
            s : 'câteva secunde',
            m : 'un minut',
            mm : relativeTimeWithPlural,
            h : 'o oră',
            hh : relativeTimeWithPlural,
            d : 'o zi',
            dd : relativeTimeWithPlural,
            M : 'o lună',
            MM : relativeTimeWithPlural,
            y : 'un an',
            yy : relativeTimeWithPlural
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : russian (ru)
// author : Viktorminator : https://github.com/Viktorminator
// Author : Menelion Elensúle : https://github.com/Oire

(function (factory) {
    factory(moment);
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }

    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? 'минута_минуты_минут' : 'минуту_минуты_минут',
            'hh': 'час_часа_часов',
            'dd': 'день_дня_дней',
            'MM': 'месяц_месяца_месяцев',
            'yy': 'год_года_лет'
        };
        if (key === 'm') {
            return withoutSuffix ? 'минута' : 'минуту';
        }
        else {
            return number + ' ' + plural(format[key], +number);
        }
    }

    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
            'accusative': 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split('_')
        },

        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function monthsShortCaseReplace(m, format) {
        var monthsShort = {
            'nominative': 'янв_фев_мар_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split('_'),
            'accusative': 'янв_фев_мар_апр_мая_июня_июля_авг_сен_окт_ноя_дек'.split('_')
        },

        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return monthsShort[nounCase][m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
            'accusative': 'воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу'.split('_')
        },

        nounCase = (/\[ ?[Вв] ?(?:прошлую|следующую)? ?\] ?dddd/).test(format) ?
            'accusative' :
            'nominative';

        return weekdays[nounCase][m.day()];
    }

    return moment.defineLocale('ru', {
        months : monthsCaseReplace,
        monthsShort : monthsShortCaseReplace,
        weekdays : weekdaysCaseReplace,
        weekdaysShort : 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
        weekdaysMin : 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
        monthsParse : [/^янв/i, /^фев/i, /^мар/i, /^апр/i, /^ма[й|я]/i, /^июн/i, /^июл/i, /^авг/i, /^сен/i, /^окт/i, /^ноя/i, /^дек/i],
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY г.',
            LLL : 'D MMMM YYYY г., LT',
            LLLL : 'dddd, D MMMM YYYY г., LT'
        },
        calendar : {
            sameDay: '[Сегодня в] LT',
            nextDay: '[Завтра в] LT',
            lastDay: '[Вчера в] LT',
            nextWeek: function () {
                return this.day() === 2 ? '[Во] dddd [в] LT' : '[В] dddd [в] LT';
            },
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[В прошлое] dddd [в] LT';
                case 1:
                case 2:
                case 4:
                    return '[В прошлый] dddd [в] LT';
                case 3:
                case 5:
                case 6:
                    return '[В прошлую] dddd [в] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'через %s',
            past : '%s назад',
            s : 'несколько секунд',
            m : relativeTimeWithPlural,
            mm : relativeTimeWithPlural,
            h : 'час',
            hh : relativeTimeWithPlural,
            d : 'день',
            dd : relativeTimeWithPlural,
            M : 'месяц',
            MM : relativeTimeWithPlural,
            y : 'год',
            yy : relativeTimeWithPlural
        },

        meridiemParse: /ночи|утра|дня|вечера/i,
        isPM : function (input) {
            return /^(дня|вечера)$/.test(input);
        },

        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ночи';
            } else if (hour < 12) {
                return 'утра';
            } else if (hour < 17) {
                return 'дня';
            } else {
                return 'вечера';
            }
        },

        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
                return number + '-й';
            case 'D':
                return number + '-го';
            case 'w':
            case 'W':
                return number + '-я';
            default:
                return number;
            }
        },

        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : slovak (sk)
// author : Martin Minka : https://github.com/k2s
// based on work of petrbela : https://github.com/petrbela

(function (factory) {
    factory(moment);
}(function (moment) {
    var months = 'január_február_marec_apríl_máj_jún_júl_august_september_október_november_december'.split('_'),
        monthsShort = 'jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec'.split('_');

    function plural(n) {
        return (n > 1) && (n < 5);
    }

    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':  // a few seconds / in a few seconds / a few seconds ago
            return (withoutSuffix || isFuture) ? 'pár sekúnd' : 'pár sekundami';
        case 'm':  // a minute / in a minute / a minute ago
            return withoutSuffix ? 'minúta' : (isFuture ? 'minútu' : 'minútou');
        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'minúty' : 'minút');
            } else {
                return result + 'minútami';
            }
            break;
        case 'h':  // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
        case 'hh': // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'hodiny' : 'hodín');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':  // a day / in a day / a day ago
            return (withoutSuffix || isFuture) ? 'deň' : 'dňom';
        case 'dd': // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'dni' : 'dní');
            } else {
                return result + 'dňami';
            }
            break;
        case 'M':  // a month / in a month / a month ago
            return (withoutSuffix || isFuture) ? 'mesiac' : 'mesiacom';
        case 'MM': // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'mesiace' : 'mesiacov');
            } else {
                return result + 'mesiacmi';
            }
            break;
        case 'y':  // a year / in a year / a year ago
            return (withoutSuffix || isFuture) ? 'rok' : 'rokom';
        case 'yy': // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'roky' : 'rokov');
            } else {
                return result + 'rokmi';
            }
            break;
        }
    }

    return moment.defineLocale('sk', {
        months : months,
        monthsShort : monthsShort,
        monthsParse : (function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                // use custom parser to solve problem with July (červenec)
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(months, monthsShort)),
        weekdays : 'nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota'.split('_'),
        weekdaysShort : 'ne_po_ut_st_št_pi_so'.split('_'),
        weekdaysMin : 'ne_po_ut_st_št_pi_so'.split('_'),
        longDateFormat : {
            LT: 'H:mm',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd D. MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[dnes o] LT',
            nextDay: '[zajtra o] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v nedeľu o] LT';
                case 1:
                case 2:
                    return '[v] dddd [o] LT';
                case 3:
                    return '[v stredu o] LT';
                case 4:
                    return '[vo štvrtok o] LT';
                case 5:
                    return '[v piatok o] LT';
                case 6:
                    return '[v sobotu o] LT';
                }
            },
            lastDay: '[včera o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minulú nedeľu o] LT';
                case 1:
                case 2:
                    return '[minulý] dddd [o] LT';
                case 3:
                    return '[minulú stredu o] LT';
                case 4:
                case 5:
                    return '[minulý] dddd [o] LT';
                case 6:
                    return '[minulú sobotu o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : 'pred %s',
            s : translate,
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : slovenian (sl)
// author : Robert Sedovšek : https://github.com/sedovsek

(function (factory) {
    factory(moment);
}(function (moment) {
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'ena minuta' : 'eno minuto';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2) {
                result += 'minuti';
            } else if (number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minut';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'ena ura' : 'eno uro';
        case 'hh':
            if (number === 1) {
                result += 'ura';
            } else if (number === 2) {
                result += 'uri';
            } else if (number === 3 || number === 4) {
                result += 'ure';
            } else {
                result += 'ur';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dni';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mesec';
            } else if (number === 2) {
                result += 'meseca';
            } else if (number === 3 || number === 4) {
                result += 'mesece';
            } else {
                result += 'mesecev';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'leto';
            } else if (number === 2) {
                result += 'leti';
            } else if (number === 3 || number === 4) {
                result += 'leta';
            } else {
                result += 'let';
            }
            return result;
        }
    }

    return moment.defineLocale('sl', {
        months : 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
        weekdays : 'nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota'.split('_'),
        weekdaysShort : 'ned._pon._tor._sre._čet._pet._sob.'.split('_'),
        weekdaysMin : 'ne_po_to_sr_če_pe_so'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay  : '[danes ob] LT',
            nextDay  : '[jutri ob] LT',

            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[v] [nedeljo] [ob] LT';
                case 3:
                    return '[v] [sredo] [ob] LT';
                case 6:
                    return '[v] [soboto] [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[v] dddd [ob] LT';
                }
            },
            lastDay  : '[včeraj ob] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[prejšnja] dddd [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[prejšnji] dddd [ob] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'čez %s',
            past   : '%s nazaj',
            s      : 'nekaj sekund',
            m      : translate,
            mm     : translate,
            h      : translate,
            hh     : translate,
            d      : 'en dan',
            dd     : translate,
            M      : 'en mesec',
            MM     : translate,
            y      : 'eno leto',
            yy     : translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Albanian (sq)
// author : Flakërim Ismani : https://github.com/flakerimi
// author: Menelion Elensúle: https://github.com/Oire (tests)
// author : Oerd Cukalla : https://github.com/oerd (fixes)

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('sq', {
        months : 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_Nëntor_Dhjetor'.split('_'),
        monthsShort : 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_Nën_Dhj'.split('_'),
        weekdays : 'E Diel_E Hënë_E Martë_E Mërkurë_E Enjte_E Premte_E Shtunë'.split('_'),
        weekdaysShort : 'Die_Hën_Mar_Mër_Enj_Pre_Sht'.split('_'),
        weekdaysMin : 'D_H_Ma_Më_E_P_Sh'.split('_'),
        meridiem : function (hours, minutes, isLower) {
            return hours < 12 ? 'PD' : 'MD';
        },
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Sot në] LT',
            nextDay : '[Nesër në] LT',
            nextWeek : 'dddd [në] LT',
            lastDay : '[Dje në] LT',
            lastWeek : 'dddd [e kaluar në] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'në %s',
            past : '%s më parë',
            s : 'disa sekonda',
            m : 'një minutë',
            mm : '%d minuta',
            h : 'një orë',
            hh : '%d orë',
            d : 'një ditë',
            dd : '%d ditë',
            M : 'një muaj',
            MM : '%d muaj',
            y : 'një vit',
            yy : '%d vite'
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Serbian-cyrillic (sr-cyrl)
// author : Milan Janačković<milanjanackovic@gmail.com> : https://github.com/milan-j

(function (factory) {
    factory(moment);
}(function (moment) {
    var translator = {
        words: { //Different grammatical cases
            m: ['један минут', 'једне минуте'],
            mm: ['минут', 'минуте', 'минута'],
            h: ['један сат', 'једног сата'],
            hh: ['сат', 'сата', 'сати'],
            dd: ['дан', 'дана', 'дана'],
            MM: ['месец', 'месеца', 'месеци'],
            yy: ['година', 'године', 'година']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    return moment.defineLocale('sr-cyrl', {
        months: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
        monthsShort: ['јан.', 'феб.', 'мар.', 'апр.', 'мај', 'јун', 'јул', 'авг.', 'сеп.', 'окт.', 'нов.', 'дец.'],
        weekdays: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'],
        weekdaysShort: ['нед.', 'пон.', 'уто.', 'сре.', 'чет.', 'пет.', 'суб.'],
        weekdaysMin: ['не', 'по', 'ут', 'ср', 'че', 'пе', 'су'],
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[данас у] LT',
            nextDay: '[сутра у] LT',

            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[у] [недељу] [у] LT';
                case 3:
                    return '[у] [среду] [у] LT';
                case 6:
                    return '[у] [суботу] [у] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[у] dddd [у] LT';
                }
            },
            lastDay  : '[јуче у] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[прошле] [недеље] [у] LT',
                    '[прошлог] [понедељка] [у] LT',
                    '[прошлог] [уторка] [у] LT',
                    '[прошле] [среде] [у] LT',
                    '[прошлог] [четвртка] [у] LT',
                    '[прошлог] [петка] [у] LT',
                    '[прошле] [суботе] [у] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'за %s',
            past   : 'пре %s',
            s      : 'неколико секунди',
            m      : translator.translate,
            mm     : translator.translate,
            h      : translator.translate,
            hh     : translator.translate,
            d      : 'дан',
            dd     : translator.translate,
            M      : 'месец',
            MM     : translator.translate,
            y      : 'годину',
            yy     : translator.translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Serbian-latin (sr)
// author : Milan Janačković<milanjanackovic@gmail.com> : https://github.com/milan-j

(function (factory) {
    factory(moment);
}(function (moment) {
    var translator = {
        words: { //Different grammatical cases
            m: ['jedan minut', 'jedne minute'],
            mm: ['minut', 'minute', 'minuta'],
            h: ['jedan sat', 'jednog sata'],
            hh: ['sat', 'sata', 'sati'],
            dd: ['dan', 'dana', 'dana'],
            MM: ['mesec', 'meseca', 'meseci'],
            yy: ['godina', 'godine', 'godina']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    return moment.defineLocale('sr', {
        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
        weekdays: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'],
        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sre.', 'čet.', 'pet.', 'sub.'],
        weekdaysMin: ['ne', 'po', 'ut', 'sr', 'če', 'pe', 'su'],
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sutra u] LT',

            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedelju] [u] LT';
                case 3:
                    return '[u] [sredu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[juče u] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[prošle] [nedelje] [u] LT',
                    '[prošlog] [ponedeljka] [u] LT',
                    '[prošlog] [utorka] [u] LT',
                    '[prošle] [srede] [u] LT',
                    '[prošlog] [četvrtka] [u] LT',
                    '[prošlog] [petka] [u] LT',
                    '[prošle] [subote] [u] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'pre %s',
            s      : 'nekoliko sekundi',
            m      : translator.translate,
            mm     : translator.translate,
            h      : translator.translate,
            hh     : translator.translate,
            d      : 'dan',
            dd     : translator.translate,
            M      : 'mesec',
            MM     : translator.translate,
            y      : 'godinu',
            yy     : translator.translate
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : swedish (sv)
// author : Jens Alm : https://github.com/ulmus

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('sv', {
        months : 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag'.split('_'),
        weekdaysShort : 'sön_mån_tis_ons_tor_fre_lör'.split('_'),
        weekdaysMin : 'sö_må_ti_on_to_fr_lö'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Idag] LT',
            nextDay: '[Imorgon] LT',
            lastDay: '[Igår] LT',
            nextWeek: 'dddd LT',
            lastWeek: '[Förra] dddd[en] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'för %s sedan',
            s : 'några sekunder',
            m : 'en minut',
            mm : '%d minuter',
            h : 'en timme',
            hh : '%d timmar',
            d : 'en dag',
            dd : '%d dagar',
            M : 'en månad',
            MM : '%d månader',
            y : 'ett år',
            yy : '%d år'
        },
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'e' :
                (b === 1) ? 'a' :
                (b === 2) ? 'a' :
                (b === 3) ? 'e' : 'e';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : tamil (ta)
// author : Arjunkumar Krishnamoorthy : https://github.com/tk120404

(function (factory) {
    factory(moment);
}(function (moment) {
    /*var symbolMap = {
            '1': '௧',
            '2': '௨',
            '3': '௩',
            '4': '௪',
            '5': '௫',
            '6': '௬',
            '7': '௭',
            '8': '௮',
            '9': '௯',
            '0': '௦'
        },
        numberMap = {
            '௧': '1',
            '௨': '2',
            '௩': '3',
            '௪': '4',
            '௫': '5',
            '௬': '6',
            '௭': '7',
            '௮': '8',
            '௯': '9',
            '௦': '0'
        }; */

    return moment.defineLocale('ta', {
        months : 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split('_'),
        monthsShort : 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split('_'),
        weekdays : 'ஞாயிற்றுக்கிழமை_திங்கட்கிழமை_செவ்வாய்கிழமை_புதன்கிழமை_வியாழக்கிழமை_வெள்ளிக்கிழமை_சனிக்கிழமை'.split('_'),
        weekdaysShort : 'ஞாயிறு_திங்கள்_செவ்வாய்_புதன்_வியாழன்_வெள்ளி_சனி'.split('_'),
        weekdaysMin : 'ஞா_தி_செ_பு_வி_வெ_ச'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[இன்று] LT',
            nextDay : '[நாளை] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[நேற்று] LT',
            lastWeek : '[கடந்த வாரம்] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s இல்',
            past : '%s முன்',
            s : 'ஒரு சில விநாடிகள்',
            m : 'ஒரு நிமிடம்',
            mm : '%d நிமிடங்கள்',
            h : 'ஒரு மணி நேரம்',
            hh : '%d மணி நேரம்',
            d : 'ஒரு நாள்',
            dd : '%d நாட்கள்',
            M : 'ஒரு மாதம்',
            MM : '%d மாதங்கள்',
            y : 'ஒரு வருடம்',
            yy : '%d ஆண்டுகள்'
        },
/*        preparse: function (string) {
            return string.replace(/[௧௨௩௪௫௬௭௮௯௦]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },*/
        ordinal : function (number) {
            return number + 'வது';
        },


        // refer http://ta.wikipedia.org/s/1er1

        meridiem : function (hour, minute, isLower) {
            if (hour >= 6 && hour <= 10) {
                return ' காலை';
            } else if (hour >= 10 && hour <= 14) {
                return ' நண்பகல்';
            } else if (hour >= 14 && hour <= 18) {
                return ' எற்பாடு';
            } else if (hour >= 18 && hour <= 20) {
                return ' மாலை';
            } else if (hour >= 20 && hour <= 24) {
                return ' இரவு';
            } else if (hour >= 0 && hour <= 6) {
                return ' வைகறை';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : thai (th)
// author : Kridsada Thanabulpong : https://github.com/sirn

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('th', {
        months : 'มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม'.split('_'),
        monthsShort : 'มกรา_กุมภา_มีนา_เมษา_พฤษภา_มิถุนา_กรกฎา_สิงหา_กันยา_ตุลา_พฤศจิกา_ธันวา'.split('_'),
        weekdays : 'อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์'.split('_'),
        weekdaysShort : 'อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์'.split('_'), // yes, three characters difference
        weekdaysMin : 'อา._จ._อ._พ._พฤ._ศ._ส.'.split('_'),
        longDateFormat : {
            LT : 'H นาฬิกา m นาที',
            L : 'YYYY/MM/DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY เวลา LT',
            LLLL : 'วันddddที่ D MMMM YYYY เวลา LT'
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'ก่อนเที่ยง';
            } else {
                return 'หลังเที่ยง';
            }
        },
        calendar : {
            sameDay : '[วันนี้ เวลา] LT',
            nextDay : '[พรุ่งนี้ เวลา] LT',
            nextWeek : 'dddd[หน้า เวลา] LT',
            lastDay : '[เมื่อวานนี้ เวลา] LT',
            lastWeek : '[วัน]dddd[ที่แล้ว เวลา] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'อีก %s',
            past : '%sที่แล้ว',
            s : 'ไม่กี่วินาที',
            m : '1 นาที',
            mm : '%d นาที',
            h : '1 ชั่วโมง',
            hh : '%d ชั่วโมง',
            d : '1 วัน',
            dd : '%d วัน',
            M : '1 เดือน',
            MM : '%d เดือน',
            y : '1 ปี',
            yy : '%d ปี'
        }
    });
}));
// moment.js locale configuration
// locale : Tagalog/Filipino (tl-ph)
// author : Dan Hagman

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('tl-ph', {
        months : 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
        monthsShort : 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
        weekdays : 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
        weekdaysShort : 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
        weekdaysMin : 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'MM/D/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM DD, YYYY LT'
        },
        calendar : {
            sameDay: '[Ngayon sa] LT',
            nextDay: '[Bukas sa] LT',
            nextWeek: 'dddd [sa] LT',
            lastDay: '[Kahapon sa] LT',
            lastWeek: 'dddd [huling linggo] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'sa loob ng %s',
            past : '%s ang nakalipas',
            s : 'ilang segundo',
            m : 'isang minuto',
            mm : '%d minuto',
            h : 'isang oras',
            hh : '%d oras',
            d : 'isang araw',
            dd : '%d araw',
            M : 'isang buwan',
            MM : '%d buwan',
            y : 'isang taon',
            yy : '%d taon'
        },
        ordinal : function (number) {
            return number;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : turkish (tr)
// authors : Erhan Gundogan : https://github.com/erhangundogan,
//           Burak Yiğit Kaya: https://github.com/BYK

(function (factory) {
    factory(moment);
}(function (moment) {
    var suffixes = {
        1: '\'inci',
        5: '\'inci',
        8: '\'inci',
        70: '\'inci',
        80: '\'inci',

        2: '\'nci',
        7: '\'nci',
        20: '\'nci',
        50: '\'nci',

        3: '\'üncü',
        4: '\'üncü',
        100: '\'üncü',

        6: '\'ncı',

        9: '\'uncu',
        10: '\'uncu',
        30: '\'uncu',

        60: '\'ıncı',
        90: '\'ıncı'
    };

    return moment.defineLocale('tr', {
        months : 'Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık'.split('_'),
        monthsShort : 'Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara'.split('_'),
        weekdays : 'Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi'.split('_'),
        weekdaysShort : 'Paz_Pts_Sal_Çar_Per_Cum_Cts'.split('_'),
        weekdaysMin : 'Pz_Pt_Sa_Ça_Pe_Cu_Ct'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[bugün saat] LT',
            nextDay : '[yarın saat] LT',
            nextWeek : '[haftaya] dddd [saat] LT',
            lastDay : '[dün] LT',
            lastWeek : '[geçen hafta] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s sonra',
            past : '%s önce',
            s : 'birkaç saniye',
            m : 'bir dakika',
            mm : '%d dakika',
            h : 'bir saat',
            hh : '%d saat',
            d : 'bir gün',
            dd : '%d gün',
            M : 'bir ay',
            MM : '%d ay',
            y : 'bir yıl',
            yy : '%d yıl'
        },
        ordinal : function (number) {
            if (number === 0) {  // special case for zero
                return number + '\'ıncı';
            }
            var a = number % 10,
                b = number % 100 - a,
                c = number >= 100 ? 100 : null;

            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Morocco Central Atlas Tamaziɣt in Latin (tzm-latn)
// author : Abdel Said : https://github.com/abdelsaid

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('tzm-latn', {
        months : 'innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir'.split('_'),
        monthsShort : 'innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir'.split('_'),
        weekdays : 'asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas'.split('_'),
        weekdaysShort : 'asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas'.split('_'),
        weekdaysMin : 'asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[asdkh g] LT',
            nextDay: '[aska g] LT',
            nextWeek: 'dddd [g] LT',
            lastDay: '[assant g] LT',
            lastWeek: 'dddd [g] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dadkh s yan %s',
            past : 'yan %s',
            s : 'imik',
            m : 'minuḍ',
            mm : '%d minuḍ',
            h : 'saɛa',
            hh : '%d tassaɛin',
            d : 'ass',
            dd : '%d ossan',
            M : 'ayowr',
            MM : '%d iyyirn',
            y : 'asgas',
            yy : '%d isgasn'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Morocco Central Atlas Tamaziɣt (tzm)
// author : Abdel Said : https://github.com/abdelsaid

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('tzm', {
        months : 'ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ'.split('_'),
        monthsShort : 'ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ'.split('_'),
        weekdays : 'ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ'.split('_'),
        weekdaysShort : 'ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ'.split('_'),
        weekdaysMin : 'ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[ⴰⵙⴷⵅ ⴴ] LT',
            nextDay: '[ⴰⵙⴽⴰ ⴴ] LT',
            nextWeek: 'dddd [ⴴ] LT',
            lastDay: '[ⴰⵚⴰⵏⵜ ⴴ] LT',
            lastWeek: 'dddd [ⴴ] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'ⴷⴰⴷⵅ ⵙ ⵢⴰⵏ %s',
            past : 'ⵢⴰⵏ %s',
            s : 'ⵉⵎⵉⴽ',
            m : 'ⵎⵉⵏⵓⴺ',
            mm : '%d ⵎⵉⵏⵓⴺ',
            h : 'ⵙⴰⵄⴰ',
            hh : '%d ⵜⴰⵙⵙⴰⵄⵉⵏ',
            d : 'ⴰⵙⵙ',
            dd : '%d oⵙⵙⴰⵏ',
            M : 'ⴰⵢoⵓⵔ',
            MM : '%d ⵉⵢⵢⵉⵔⵏ',
            y : 'ⴰⵙⴳⴰⵙ',
            yy : '%d ⵉⵙⴳⴰⵙⵏ'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : ukrainian (uk)
// author : zemlanin : https://github.com/zemlanin
// Author : Menelion Elensúle : https://github.com/Oire

(function (factory) {
    factory(moment);
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }

    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': 'хвилина_хвилини_хвилин',
            'hh': 'година_години_годин',
            'dd': 'день_дні_днів',
            'MM': 'місяць_місяці_місяців',
            'yy': 'рік_роки_років'
        };
        if (key === 'm') {
            return withoutSuffix ? 'хвилина' : 'хвилину';
        }
        else if (key === 'h') {
            return withoutSuffix ? 'година' : 'годину';
        }
        else {
            return number + ' ' + plural(format[key], +number);
        }
    }

    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень'.split('_'),
            'accusative': 'січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня'.split('_')
        },

        nounCase = (/D[oD]? *MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': 'неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота'.split('_'),
            'accusative': 'неділю_понеділок_вівторок_середу_четвер_п’ятницю_суботу'.split('_'),
            'genitive': 'неділі_понеділка_вівторка_середи_четверга_п’ятниці_суботи'.split('_')
        },

        nounCase = (/(\[[ВвУу]\]) ?dddd/).test(format) ?
            'accusative' :
            ((/\[?(?:минулої|наступної)? ?\] ?dddd/).test(format) ?
                'genitive' :
                'nominative');

        return weekdays[nounCase][m.day()];
    }

    function processHoursFunction(str) {
        return function () {
            return str + 'о' + (this.hours() === 11 ? 'б' : '') + '] LT';
        };
    }

    return moment.defineLocale('uk', {
        months : monthsCaseReplace,
        monthsShort : 'січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд'.split('_'),
        weekdays : weekdaysCaseReplace,
        weekdaysShort : 'нд_пн_вт_ср_чт_пт_сб'.split('_'),
        weekdaysMin : 'нд_пн_вт_ср_чт_пт_сб'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY р.',
            LLL : 'D MMMM YYYY р., LT',
            LLLL : 'dddd, D MMMM YYYY р., LT'
        },
        calendar : {
            sameDay: processHoursFunction('[Сьогодні '),
            nextDay: processHoursFunction('[Завтра '),
            lastDay: processHoursFunction('[Вчора '),
            nextWeek: processHoursFunction('[У] dddd ['),
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return processHoursFunction('[Минулої] dddd [').call(this);
                case 1:
                case 2:
                case 4:
                    return processHoursFunction('[Минулого] dddd [').call(this);
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'за %s',
            past : '%s тому',
            s : 'декілька секунд',
            m : relativeTimeWithPlural,
            mm : relativeTimeWithPlural,
            h : 'годину',
            hh : relativeTimeWithPlural,
            d : 'день',
            dd : relativeTimeWithPlural,
            M : 'місяць',
            MM : relativeTimeWithPlural,
            y : 'рік',
            yy : relativeTimeWithPlural
        },

        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason

        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ночі';
            } else if (hour < 12) {
                return 'ранку';
            } else if (hour < 17) {
                return 'дня';
            } else {
                return 'вечора';
            }
        },

        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return number + '-й';
            case 'D':
                return number + '-го';
            default:
                return number;
            }
        },

        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : uzbek (uz)
// author : Sardor Muminov : https://github.com/muminoff

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('uz', {
        months : 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
        monthsShort : 'янв_фев_мар_апр_май_июн_июл_авг_сен_окт_ноя_дек'.split('_'),
        weekdays : 'Якшанба_Душанба_Сешанба_Чоршанба_Пайшанба_Жума_Шанба'.split('_'),
        weekdaysShort : 'Якш_Душ_Сеш_Чор_Пай_Жум_Шан'.split('_'),
        weekdaysMin : 'Як_Ду_Се_Чо_Па_Жу_Ша'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'D MMMM YYYY, dddd LT'
        },
        calendar : {
            sameDay : '[Бугун соат] LT [да]',
            nextDay : '[Эртага] LT [да]',
            nextWeek : 'dddd [куни соат] LT [да]',
            lastDay : '[Кеча соат] LT [да]',
            lastWeek : '[Утган] dddd [куни соат] LT [да]',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'Якин %s ичида',
            past : 'Бир неча %s олдин',
            s : 'фурсат',
            m : 'бир дакика',
            mm : '%d дакика',
            h : 'бир соат',
            hh : '%d соат',
            d : 'бир кун',
            dd : '%d кун',
            M : 'бир ой',
            MM : '%d ой',
            y : 'бир йил',
            yy : '%d йил'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : vietnamese (vi)
// author : Bang Nguyen : https://github.com/bangnk

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('vi', {
        months : 'tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12'.split('_'),
        monthsShort : 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
        weekdays : 'chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy'.split('_'),
        weekdaysShort : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        weekdaysMin : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM [năm] YYYY',
            LLL : 'D MMMM [năm] YYYY LT',
            LLLL : 'dddd, D MMMM [năm] YYYY LT',
            l : 'DD/M/YYYY',
            ll : 'D MMM YYYY',
            lll : 'D MMM YYYY LT',
            llll : 'ddd, D MMM YYYY LT'
        },
        calendar : {
            sameDay: '[Hôm nay lúc] LT',
            nextDay: '[Ngày mai lúc] LT',
            nextWeek: 'dddd [tuần tới lúc] LT',
            lastDay: '[Hôm qua lúc] LT',
            lastWeek: 'dddd [tuần rồi lúc] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : '%s tới',
            past : '%s trước',
            s : 'vài giây',
            m : 'một phút',
            mm : '%d phút',
            h : 'một giờ',
            hh : '%d giờ',
            d : 'một ngày',
            dd : '%d ngày',
            M : 'một tháng',
            MM : '%d tháng',
            y : 'một năm',
            yy : '%d năm'
        },
        ordinal : function (number) {
            return number;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : chinese (zh-cn)
// author : suupic : https://github.com/suupic
// author : Zeno Zeng : https://github.com/zenozeng

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('zh-cn', {
        months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
        monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
        weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
        weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),
        weekdaysMin : '日_一_二_三_四_五_六'.split('_'),
        longDateFormat : {
            LT : 'Ah点mm',
            L : 'YYYY-MM-DD',
            LL : 'YYYY年MMMD日',
            LLL : 'YYYY年MMMD日LT',
            LLLL : 'YYYY年MMMD日ddddLT',
            l : 'YYYY-MM-DD',
            ll : 'YYYY年MMMD日',
            lll : 'YYYY年MMMD日LT',
            llll : 'YYYY年MMMD日ddddLT'
        },
        meridiem : function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 600) {
                return '凌晨';
            } else if (hm < 900) {
                return '早上';
            } else if (hm < 1130) {
                return '上午';
            } else if (hm < 1230) {
                return '中午';
            } else if (hm < 1800) {
                return '下午';
            } else {
                return '晚上';
            }
        },
        calendar : {
            sameDay : function () {
                return this.minutes() === 0 ? '[今天]Ah[点整]' : '[今天]LT';
            },
            nextDay : function () {
                return this.minutes() === 0 ? '[明天]Ah[点整]' : '[明天]LT';
            },
            lastDay : function () {
                return this.minutes() === 0 ? '[昨天]Ah[点整]' : '[昨天]LT';
            },
            nextWeek : function () {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf('week');
                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]';
                return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
            },
            lastWeek : function () {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf('week');
                prefix = this.unix() < startOfWeek.unix()  ? '[上]' : '[本]';
                return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
            },
            sameElse : 'LL'
        },
        ordinal : function (number, period) {
            switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
                return number + '日';
            case 'M':
                return number + '月';
            case 'w':
            case 'W':
                return number + '周';
            default:
                return number;
            }
        },
        relativeTime : {
            future : '%s内',
            past : '%s前',
            s : '几秒',
            m : '1分钟',
            mm : '%d分钟',
            h : '1小时',
            hh : '%d小时',
            d : '1天',
            dd : '%d天',
            M : '1个月',
            MM : '%d个月',
            y : '1年',
            yy : '%d年'
        },
        week : {
            // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : traditional chinese (zh-tw)
// author : Ben : https://github.com/ben-lin

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('zh-tw', {
        months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
        monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
        weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
        weekdaysShort : '週日_週一_週二_週三_週四_週五_週六'.split('_'),
        weekdaysMin : '日_一_二_三_四_五_六'.split('_'),
        longDateFormat : {
            LT : 'Ah點mm',
            L : 'YYYY年MMMD日',
            LL : 'YYYY年MMMD日',
            LLL : 'YYYY年MMMD日LT',
            LLLL : 'YYYY年MMMD日ddddLT',
            l : 'YYYY年MMMD日',
            ll : 'YYYY年MMMD日',
            lll : 'YYYY年MMMD日LT',
            llll : 'YYYY年MMMD日ddddLT'
        },
        meridiem : function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 900) {
                return '早上';
            } else if (hm < 1130) {
                return '上午';
            } else if (hm < 1230) {
                return '中午';
            } else if (hm < 1800) {
                return '下午';
            } else {
                return '晚上';
            }
        },
        calendar : {
            sameDay : '[今天]LT',
            nextDay : '[明天]LT',
            nextWeek : '[下]ddddLT',
            lastDay : '[昨天]LT',
            lastWeek : '[上]ddddLT',
            sameElse : 'L'
        },
        ordinal : function (number, period) {
            switch (period) {
            case 'd' :
            case 'D' :
            case 'DDD' :
                return number + '日';
            case 'M' :
                return number + '月';
            case 'w' :
            case 'W' :
                return number + '週';
            default :
                return number;
            }
        },
        relativeTime : {
            future : '%s內',
            past : '%s前',
            s : '幾秒',
            m : '一分鐘',
            mm : '%d分鐘',
            h : '一小時',
            hh : '%d小時',
            d : '一天',
            dd : '%d天',
            M : '一個月',
            MM : '%d個月',
            y : '一年',
            yy : '%d年'
        }
    });
}));

    moment.locale('en');


    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                    'Accessing Moment through the global scope is ' +
                    'deprecated, and will be removed in an upcoming ' +
                    'release.',
                    moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === 'function' && define.amd) {
        define('moment', function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);

apishore.service("asAnimation", function($timeout) {
	var i={};
	i.whichTransitionEvent = function()
	{
	    var t;
	    var el = document.createElement('fakeelement');
	    var transitions = {
	      'transition':'transitionend',
	      'OTransition':'oTransitionEnd',
	      'MozTransition':'transitionend',
	      'WebkitTransition':'webkitTransitionEnd'
	    }

	    for(t in transitions){
	        if( el.style[t] !== undefined ){
	            return transitions[t];
	        }
	    }
	}
	i.onEnd = function(elem, delay, callback)
	{
		if(i.whichTransitionEvent())
		{
			elem.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", callback);
		}
		else
		{
			$timeout(callback, delay | 300);
		}
	}
	return i;
});
apishore.service("asInlineDialog", function($timeout, $animate, asAnimation) {
	var i={};
	i.init = function($scope, elem, attrs)
	{
		var dialog = {};
		dialog.callback = {};
		dialog.isOpened = false;
		
		dialog.open = function($event)
		{
			elem.addClass("asa-show");
			elem.find(".as-dialog").addClass("as-transition-out")
			$timeout(function(){				
				elem.addClass("asa-transition-in");
				elem.find(".as-dialog").addClass("asa-transition-in");
			});
		}
		dialog.action = function(actionId, $event)
		{
			dialog.close($event);
			var fn = dialog.callback[actionId];
			if(fn) $timeout(fn);
		}
		dialog.close = function($event)
		{
			elem.find(".as-dialog").removeClass("as-transition-in").addClass("as-transition-out");
			elem.removeClass("asa-transition-in");
			elem.removeClass("asa-show");
		}
		elem.find(".as-dialog-holder-inner-closer").on("click", dialog.close);
		return dialog;
	}
	return i;
});

apishore.config(function($provide){
    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions){
        // $delegate is the taOptions we are decorating
        // register the tool with textAngular
        taRegisterTool('variables', {
            iconclass: "fa fa-tag",
            display: "<apishore-add-variable-menu></apishore-add-variable-menu>",
            action: function(){
            }
        });
        // add the button to the default toolbar definition
        taOptions.toolbar[3].push('variables');
        return taOptions;
    }]);
});

apishore.directive('apishoreAddVariableMenu', function(taSelection, $timeout) {
	return {
		restrict : 'E',
		scope: {
			
		},
		template: "<div dropdown is-open='isopen'><a class='btn-link dropdown-toggle' dropdown-toggle>Variables</a>"+
		"<ul class='dropdown-menu' role='menu'><li><a ng-repeat='v in variables' ng-click='action2(v, $event)'>{{v.l}}</a></li></ul></div>",
		//<div><a ng-repeat='v in variables' ng-click='action2(v, $event)'>{{v.l}}</a></div>",
		link : function($scope, element, attrs) {
			console.info("apishoreAddVariableMenu");
			$timeout(function(){
				var e = element.parents('apishore-add-variable-menu');
				e.removeClass("btn");
				var t = element.parents('text-angular');
				$scope.variables = $scope.$eval(t.attr('apishore-text-angular-variables'));
			});
			$scope.action2= function(v, $event){
				$scope.isopen = false;
            	var editor = $scope.$parent.$editor();
                editor.wrapSelection('inserthtml', v.v);
                if($event) $event.stopPropagation();
                if($event) $event.preventDefault();
            };
			
		}
	};
});


apishore.directive("apishoreBind", function($injector, apishoreUtils) {
	return {
		restrict : 'A',
		transclude: false,
		scope: false,
		link: function($scope, element, attrs)
		{
			apishoreUtils.compileApishoreBind($scope, attrs.apishoreBind, $scope.$eval(attrs.apishoreBindQuery), $scope.$eval(attrs.apishoreBindParams));
		}
	};
});

apishore.directive("apishoreConfirmationOf", function()
{
    return {
        restrict: 'A',
        require: '^ngModel',
        link: function($scope, $elem, $attrs, $ctrl)
        {
            var validate = function(value)
            {
                var valid = angular.equals(value, $scope.itemData.data[$attrs.apishoreConfirmationOf]);
                $scope.formField.$setValidity('confirmation', valid);
            };
            $scope.$watch('itemData.data.' + $attrs.apishoreConfirmationOf, function(newValue)
            {
                if(angular.isDefined(newValue))
                {
                    validate($scope.model); // XXX: model is hardcoded here
                }
            });
            $ctrl.$parsers.push(function(value)
            {
                validate(value);
                return value;
            });
        }
    };
});

apishore.directive("apishoreImageId", function(apishoreImageUrl) {
	return {
		restrict : 'A',
		scope : {
			apishoreImageId:'='
		},
		
		link: function($scope, element, attrs)
		{
			$scope.$watch('apishoreImageId', function(newValue){
				//console.info("apishoreImageId="+newValue);
				if(newValue)
					attrs.$set('src', apishoreImageUrl(newValue));
				else
					attrs.$set('src', attrs.apishoreImageDefault);
			})
		}
	};
});
apishore.directive("apishoreDownloadId", function(apishoreImageUrl) {
	return {
		restrict : 'A',
		scope : {
			apishoreDownloadId:'='
		},
		link: function($scope, element, attrs)
		{
			attrs.$set("target", "_self");
			$scope.$watch('apishoreDownloadId', function(newValue){
				//console.info("apishoreImageId="+newValue);
				if(newValue)
					attrs.$set('href', apishoreImageUrl(newValue,undefined,true));
				else
					attrs.$set('href', attrs.apishoreImageDefault);
			})
		}
	};
});
apishore.directive("apishoreBackgroundImageId", function(apishoreImageUrl) {
	return {
		restrict : 'A',
		scope : {
			apishoreBackgroundImageId:'='
		},
		
		link: function($scope, element, attrs)
		{
			$scope.$watch('apishoreBackgroundImageId', function(newValue){
				//console.info("apishoreImageId="+newValue);
				if(newValue)
					element.css('background-image', "url('"+apishoreImageUrl(newValue)+"')"); 
				else
					element.css('background-image', attrs.apishoreImageDefault); 
			})
		}
	};
});
apishore.constant("apishoreImageUrl", function(id, post, forceDownload) {
	if (id && id.indexOf('http') === 0)
	{
		return id;
	}
	var url = '/api/images/'+id;
	var p = false;
	if(post)
	{
		url+=p ? "&" : '?';
		url+="ts="+post;
		p = true;
	}
	if(forceDownload)
	{
		url+=p ? "&" : '?';
		url+="download=true";
		p = true;
	}
	return url; 
});

apishore.constant("apishoreImageToData", function(id, func) {
	var img = new Image();
	img.onload = function()
	{
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
		var dataUrl = canvas.toDataURL('image/png');
		func(dataUrl);//.replace(/^data:image\/(png|jpg);base64,/, ""));
	};
	img.src = '/api/images/'+id;
});
// old deprecate validation for directive per type 
apishore.directive("apishoreServerError", function() {
    return {
        restrict : 'A',

        link: function($scope)
        {
            $scope.$watch('model', function() {
                if($scope.formField && $scope.formField.$error && $scope.formField.$error.server)
                {
                    delete $scope.formField.$error.server;
                    $scope.formField.$setValidity('server', true);
                }
            });
        }
    };
});

// new validation for inline 
apishore.directive("apishoreInputServerError", function() {
    return {
        restrict : 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ctrl)
        {
        	function fn()
        	{
        		ctrl.$setValidity('server', true);
        		ctrl.$setValidity('unique', true);//TODO:remove after refactoring of server validators
        	}
        	element.bind('change', fn);
        }
    };
});

apishore.directive("asAvatarImg", function(apishoreAuth, $rootScope, $http, $state) {

	return {
		restrict : 'C',
		scope: false,
        link : function($scope, elem) {
        	elem.css({opacity: 0});
        	elem.bind('load', function() {
        		elem.css({opacity: 1});
            });
        	elem.bind('error', function(){
            });
        }
	};
});

apishore.directive('pwCheck', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                });
            });
        }
    }
}]);
apishore.controller('asDatePickerController', ['$scope', '$timeout', '$window', function($scope, $timeout, $window)
    {
        var self = this,
            activeLocale,
            $datePicker,
            $datePickerFilter,
            $datePickerContainer,
            $computedWindow;

        $scope.ctrlData = {
            isOpen: false
        };

        this.init = function(element, locale)
        {
            $datePicker = element.find('.as-date-picker');
            $datePickerContainer = element;
            $computedWindow = angular.element($window);

            self.build(locale, false);
        };

        this.build = function(locale, isNewModel)
        {
            if (locale === activeLocale && !isNewModel)
            {
                return;
            }

            activeLocale = locale;

            moment.locale(activeLocale);

            if (angular.isDefined($scope.model))
            {
                $scope.selected = {
                    model: moment($scope.model).format('LL'),
                    date: $scope.model
                };

                $scope.activeDate = moment($scope.model);
            }
            else
            {
                $scope.selected = {
                    model: undefined,
                    date: new Date()
                };

                $scope.activeDate = moment();
            }

            $scope.moment = moment;

            $scope.days = [];
            $scope.daysOfWeek = [moment.weekdaysMin(1), moment.weekdaysMin(2), moment.weekdaysMin(3), moment.weekdaysMin(4), moment.weekdaysMin(5), moment.weekdaysMin(6), moment.weekdaysMin(0)];

            $scope.years = [];

            for (var y = moment().year() - 100; y <= moment().year() + 100; y++)
            {
                $scope.years.push(y);
            }

            generateCalendar();
        };

        $scope.previousMonth = function()
        {
            $scope.activeDate = $scope.activeDate.subtract(1, 'month');
            generateCalendar();
        };

        $scope.nextMonth = function()
        {
            $scope.activeDate = $scope.activeDate.add(1, 'month');
            generateCalendar();
        };

        $scope.select = function(day)
        {
            $scope.selected = {
                model: day.format('LL'),
                date: day.toDate()
            };

            $scope.model = day.format('L');

            generateCalendar();
        };

        $scope.selectYear = function(year)
        {
            $scope.yearSelection = false;

            $scope.selected.model = moment($scope.selected.date).year(year).format('LL');
            $scope.selected.date = moment($scope.selected.date).year(year).toDate();
            $scope.model = moment($scope.selected.date).format('L');
            $scope.activeDate = $scope.activeDate.add(year - $scope.activeDate.year(), 'year');

            generateCalendar();
        };

        $scope.openPicker = function()
        {
            if ($scope.ctrlData.isOpen || $scope.asDisabled)
            {
                return;
            }
            if($scope.selected.date && !moment($scope.selected.date).isValid())
            {
                $scope.selected = {
                    model: undefined,
                    date: new Date()
                };

                $scope.activeDate = moment();
                generateCalendar();
            }
            $scope.ctrlData.isOpen = true;

            $timeout(function()
            {
                $scope.yearSelection = false;

                $datePickerFilter = angular.element('<div/>', {
                    class: 'as-date-filter'
                });

                $datePickerFilter
                    .appendTo('body')
                    .on('click', function()
                    {
                        $scope.closePicker();
                    });

                $datePicker
                    .appendTo('body')
                    .show();

//                $timeout(function()
//                {
                    $datePickerFilter.addClass('as-date-filter--is-shown');
                    $datePicker.addClass('as-date-picker--is-shown');
//                }, 100);
            });
        };

        $scope.closePicker = function()
        {
            if (!$scope.ctrlData.isOpen)
            {
                return;
            }

            $datePickerFilter.removeClass('as-date-filter--is-shown');
            $datePicker.removeClass('as-date-picker--is-shown');

            $computedWindow.off('resize');

//            $timeout(function()
//            {
                $datePickerFilter.remove();

                $datePicker
                    .hide()
                    .appendTo($datePickerContainer);

                $scope.ctrlData.isOpen = false;
//            }, 600);
        };

        $scope.displayYearSelection = function()
        {
            $scope.yearSelection = true;

            $timeout(function()
            {
                var $yearSelector = $datePicker.find('.as-date-picker__year-selector');
                var $activeYear = $yearSelector.find('.as-date-picker__year--is-active');
                $yearSelector.scrollTop($yearSelector.scrollTop() + $activeYear.position().top - $yearSelector.height()/2 + $activeYear.height()/2);
            });
        };

        $scope.clearDate = function()
        {
            $scope.model = undefined;
        };

        function generateCalendar()
        {
            var days = [],
                previousDay = angular.copy($scope.activeDate).date(0),
                firstDayOfMonth = angular.copy($scope.activeDate).date(1),
                lastDayOfMonth = angular.copy(firstDayOfMonth).endOf('month'),
                maxDays = angular.copy(lastDayOfMonth).date();

            $scope.emptyFirstDays = [];

            for (var i = firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1; i > 0; i--)
            {
                $scope.emptyFirstDays.push({});
            }

            for (var j = 0; j < maxDays; j++)
            {
                var date = angular.copy(previousDay.add(1, 'days'));

                date.selected = angular.isDefined($scope.selected.model) && date.isSame($scope.selected.date, 'day');
                date.today = date.isSame(moment(), 'day');

                days.push(date);
            }

            $scope.emptyLastDays = [];

            for (var k = 7 - (lastDayOfMonth.day() === 0 ? 7 : lastDayOfMonth.day()); k > 0; k--)
            {
                $scope.emptyLastDays.push({});
            }

            $scope.days = days;
        }
    }]);

apishore.directive('asDatePicker', function()
    {
        return {
            restrict: 'E',
            controller: 'asDatePickerController',
            scope: {
                model: '=',
                label: '@',
                fixedLabel: '&',
                allowClear: '@',
                icon: '@',
                asDisabled: '='
            },
            templateUrl: window.apishoreConfig.webappRoot+'/js/apishore/directives/date-picker.html',
            link: function(scope, element, attrs, ctrl)
            {
                ctrl.init(element, checkLocale(attrs.locale));

                attrs.$observe('locale', function()
                {
                    ctrl.build(checkLocale(attrs.locale), false);
                });

                scope.$watch('model', function()
                {
                    ctrl.build(checkLocale(attrs.locale), true);
                });

                attrs.$observe('allowClear', function(newValue)
                {
                    scope.allowClear = !!(angular.isDefined(newValue) && newValue === 'true');
                });

                function checkLocale(locale)
                {
                    if (!locale)
                    {
                    	return 'en';
                        //return (navigator.language !== null ? navigator.language : navigator.browserLanguage).split("_")[0].split("-")[0] || 'en';
                    }

                    return locale;
                }
            }
        };
    });
apishore.filter('asAmPm', function() {
    return function(input) {
        return input ? 'am' : 'pm';
    }
});

apishore.directive('asDateTimePickerHelper', function($timeout, $window)
{
	return {
         restrict: 'E',
         link: function(scope, $elem, $attrs)
         {
        	var fieldName = $attrs.field;
        	function f2(d)
        	{
        		return d < 10 ? "0"+d : ""+d;
        	}
        	function value()
        	{
        		var v = scope.itemData.data[fieldName];
        		return v ? moment(v) : moment();
        	}
        	if(scope.itemDataHelper == undefined)
        	{
        		scope.itemDataHelper = {};
        	}
        	scope["asDateTimePickerHelper_"+fieldName+"_am"] = function()
        	{
        		var m = value();
	        	m.hours(m.hours() + (m.hours() < 12 ? 12 : -12));
	        	scope.itemData.data[fieldName] = m.format("MM/DD/YYYY HH:mm");
	        }
        	function setEditors(m)
        	{
        		scope.itemDataHelper[fieldName+"_date"] = m.format("MM/DD/YYYY");
        		scope.itemDataHelper[fieldName+"_hours"] = f2(m.hours() % 12);
        		scope.itemDataHelper[fieldName+"_minutes"] = f2(m.minutes());
        		scope.itemDataHelper[fieldName+"_am"] = m.hours() < 12;
        	}
        	scope.$watch("itemData.data."+fieldName, function(nv, ov)
        	{
        		if (nv !== ov && nv != undefined)
        		{
	        		var m =  moment(nv);
	        		setEditors(m);
        		}
        	});
        	scope.$watch("itemDataHelper."+fieldName+"_date", function(nv, ov)
        	{
        		if (nv !== ov && nv != undefined)
        		{
	        		var n = moment(nv, "MM/DD/YYYY");
	        		var m = value();
	        		m.year(n.year());
	        		m.month(n.month());
	        		m.date(n.date());
	        		console.info(nv +" - n="+ n +" m="+m);
	        		scope.itemData.data[fieldName] = m.format("MM/DD/YYYY HH:mm");
        		}
        	});
        	scope.$watch("itemDataHelper."+fieldName+"_hours", function(nv, ov)
        	{
        		if (nv !== ov && nv != undefined)
        		{
        			var am = scope.itemDataHelper[fieldName+"_am"];
	        		var n = parseFloat(nv);
	        		var m = value();
	        		m.hours(n  + (am ? 0 : 12));
	        		scope.itemData.data[fieldName] = m.format("MM/DD/YYYY HH:mm");
        		}
        	});
        	scope.$watch("itemDataHelper."+fieldName+"_minutes", function(nv, ov)
        	{
        		if (nv !== ov && nv != undefined)
        		{
	        		var n = parseFloat(nv);
	        		var m = value();
	        		m.minutes(n);
	        		scope.itemData.data[fieldName] = m.format("MM/DD/YYYY HH:mm");
        		}
        	});
         }
	};
});


apishore.directive('asDefaultImage', function ($q) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            attrs.$observe('ngSrc', function (ngSrc) {
                var deferred = $q.defer();
                var image = new Image();
                image.onerror = function () {
                	deferred.resolve(false);
                	switch(attrs.asDefaultImage)
                	{
                		case "$hide":
                		{
                			element.hide();
                			break;
                		}
                		default:
                		{
                			element.attr('src', attrs.asDefaultImage); // set default image
                		}
                	}
                };
                image.onload = function () {
                    deferred.resolve(true);
                };
                image.src = ngSrc;
                return deferred.promise;
            });
        }
    };
});
apishore.directive("devPanel", function (ApishoreTicketApi, apishoreAuth, LoginAsPersonalApi, $http, $state, $location) {

	return {
		restrict : 'E',
		replace : true,
		templateUrl : window.apishoreConfig.webappRoot+"/js/apishore/directives/dev-panel.html",
        link : function($scope) {
        	$scope.devStatus = function()
        	{
        		return $state.current.data ? $state.current.data.devStatus : {};
        	}
        	$scope.userData = function()
        	{
        		return apishoreAuth.user;
        	}
        	$scope.pageId = function()
        	{
        		return $state.current.name;
        	}
        	$scope.pageI18N = function()
        	{
        		return $state.current.name.replace(/\./g,'_');
        	}
        	$scope.state = $state;
        	$scope.sending = false;
        	var factory = ApishoreTicketApi;
			
        	$scope.itemData = {};
			$scope.submitForm = function(form)
			{
				form.$setSubmitted();
				if(!form.$valid) return false;
				
				$scope.sending = true;
				var item = {};
				$scope.itemData.data.pageState = $scope.pageId();
				$scope.itemData.data.url = $location.$$absUrl;
				
				factory.transform($scope.itemData, item);
				factory.insert(item).then(function(data){
					$scope.itemData.data.summary = "";
					$scope.itemData.data.details = "";
					form.$setPristine(true);
					$scope.sending = false;
				}, function()
				{
					$scope.sending = false;
				});
			};
			$scope.cancel = function(item)
			{
				this.showDevPanel = false;
			};
			$scope.loginItems = [];
			function updateLoginItems() {
				LoginAsPersonalApi.select().then(function (resp) {
					$scope.loginItems = resp.data.data;
				});
			}
			updateLoginItems();
			$scope.selectLoginItem = function (item) {
				LoginAsPersonalApi.custom.select(item, function(data){
					apishoreAuth.getUserInfo();
					$state.go(".", {}, {reload: true});
				});
			}
        }
	};
});


// this directive is applied to input by apishoreUtils.adjustFormGroupTemplateInput from disabled-value attribute
apishore.directive('apishoreDisabledValue', function()
{
    return {
        restrict: 'A',
        require: ['^ngModel'],
        compile: function($elem, $attrs)
        {
            return {
                post: function($scope)
                {
                    if(!angular.isDefined($attrs.ngDisabled))
                    {
                        return;
                    }
                    // watch disable expression
                    $scope.$watch($attrs.ngDisabled, function(newValue, oldValue)
                    {
                        if(!!newValue)
                        {
                            $scope.apishoreDisabledValue = $scope.model;
                            $scope.model = $scope.$eval($attrs.apishoreDisabledValue);
                        }
                        else if(angular.isDefined($scope.apishoreDisabledValue))
                        {
                            $scope.model = $scope.apishoreDisabledValue;
                        }
                    });
                    $scope.$watch('model', function(newValue, oldValue)
                    {
                        var disabled = $scope.$eval($attrs.ngDisabled);
                        var value = $scope.$eval($attrs.apishoreDisabledValue);
                        if (!!disabled && value != newValue)
                        {
                            $scope.apishoreDisabledValue = $scope.model;
                            $scope.model = value;
                        }
                    });
                }
            }
        }
    }
});
apishore.directive('apishoreDisableHide', function(apishoreUtils)
{
    return {
        restrict: 'A',
        compile: function($element, $attrs)
        {
            var disabled = apishoreUtils.disabledExpression($attrs);
            return {
                post: function($scope, $element)
                {
                    $scope.$watch(disabled, function(newValue)
                    {
                        if(!newValue)
                        {
                            $element.removeClass('ng-hide');
                        }
                        else
                        {
                            $element.addClass('ng-hide');
                        }
                    });
                }
            }
        }
    }
});
apishore.directive('eatClickIf', ['$parse', '$rootScope',
  function($parse, $rootScope) {
    return {
      // this ensure eatClickIf be compiled before ngClick
      priority: 100,
      restrict: 'A',
      compile: function($element, attr) {
        var fn = $parse(attr.eatClickIf);
        return {
          pre: function link(scope, element) {
            var eventName = 'click';
            element.on(eventName, function(event) {
              var callback = function() {
                if (fn(scope, {$event: event})) {
                  // prevents ng-click to be executed
                  event.stopImmediatePropagation();
                  // prevents href 
                  event.preventDefault();
                  return false;
                }
              };
              if ($rootScope.$$phase) {
                scope.$evalAsync(callback);
              } else {
                scope.$apply(callback);
              }
            });
          },
          post: function() {}
        }
      }
    }
  }
]);
apishore.directive("apishoreExpandableText", function($injector, $modal, userRoles, apishoreUtils, apishoreAuth)
{
    return {
        restrict: 'E',
        templateUrl : window.apishoreConfig.webappRoot+"/js/apishore/directives/expandable-text.html",
        scope: {
            model: '=',
        },
        link: function ($scope, element, $attrs)
        {
        	function fn(n,o)
        	{
        		n = n || $scope.model;
        		$scope.expandable = (n && n.length > 500);
        		$scope.expanded = false;
        	}
        	fn();
        	$scope.$watch('model', fn);
        	$scope.toggle = function()
        	{
        		$scope.expanded = !$scope.expanded;
        	}
        }
    };
});

apishore.directive('googleplace', function() {
    return {
        require: 'ngModel',
        scope: {
            ngModel: '=',
            details: '=?'
        },
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
 
            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    scope.details = scope.gPlace.getPlace();
                    model.$setViewValue(element.val());          
                });
            });
        }
    };
});
apishore.directive("apishoreHideInputHelper", function() {
	return {
		restrict : 'A',
		scope: {
			apishoreHideInputHelper: '&'
        },
		link: function($scope, element, attrs)
		{
			element.keydown(function(event) {
				$scope.$apply(function () {
					if(event.keyCode == 27)
					{
						$scope.apishoreHideInputHelper();
					}
					else if(element.val() == "" && (event.keyCode == 8 || event.keyCode == 13))
					{
						$scope.apishoreHideInputHelper();
					}
				});
			});
		}
	};
});
apishore.directive('asDigitsRestriction', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
        	var len = attr.asDigitsRestriction;
            function fromUser(text) {
                if (!text)
                    return text;
                
                var c = text.replace(/\D*/g, "");
                if(c.length > len)
                {
                	c = c.substring(0, len);
               	}
                if (c != text)
                {
                    ngModel.$setViewValue(c);
                    ngModel.$commitViewValue();
                    ngModel.$render();
                }
                return text;
            }
            ngModel.$parsers.push(fromUser);
        }
    };
}]);

apishore.directive('isolatedForm', [function () {
    return {
        restrict: 'A',
        require: '?form',
        link: function (scope, elm, attrs, ctrl) {
            if (!ctrl) {
                return;
            }
            // Do a copy of the controller
            var ctrlCopy = {};
            angular.copy(ctrl, ctrlCopy);

            // Get the parent of the form
            var parent = elm.parent().controller('form');
            if(parent)
            {
	            // Remove parent link to the controller
	            parent.$removeControl(ctrl);
	
	            // Replace form controller with a "isolated form"
	            var isolatedFormCtrl = {
	                $setValidity: function (validationToken, isValid, control) {
	                    ctrlCopy.$setValidity(validationToken, isValid, control);
	                    parent.$setValidity(validationToken, true, ctrl);
	                },
	                $setDirty: function () {
	                    elm.removeClass('ng-pristine').addClass('ng-dirty');
	                    ctrl.$dirty = true;
	                    ctrl.$pristine = false;
	                },
	            };
	            angular.extend(ctrl, isolatedFormCtrl);
            }
        }
    };
}]);
//console.info("Declare categoryPublicListDirective");
apishore.directive("apishoreListAll", function($injector, apishoreUtils, $location, $state)
{
    return {
        restrict: 'E',
        scope: {
            useState: '=',
            viewName: '@view',
            parentId: '=',
            query: '='
        },
        replace: true,
        transclude: true,

        templateUrl: '$ng/apishore/directives/ListAllDirective.html',
        compile: function()
        {

            return {
                post: function($scope, $element, attrs)
                {
                    console.info("Link apishore-list-all");
                    var factory = $injector.get(apishoreUtils.apiName($scope.viewName));
                    //init
                    $scope.options = {
                        createEnabled: angular.isDefined(attrs.onCreate) || angular.isDefined($scope.createState),
                        enableSorting: true
                    };
                    $scope.permissions = {};
                    $scope.accessViolation = false;

                    $scope.items = [];
                    if(!$scope.query) $scope.query = { limit: 0 };

                    $scope.go = function(state, item)
                    {
                        if(angular.isDefined(state))
                        {
                            var p = {};
                            //define parameter only if item is exist
                            if(item)
                            {
                                p.category_id = item.id;
                            }
                            $state.go(state, p);
                        }
                    };
                    $scope.viewItem = function(item)
                    {
                        $scope.go($scope.viewState, item);
                    };
                    $scope.editItem = function(item)
                    {
                        $scope.go($scope.editState, item);
                    };
                    $scope.createItem = function()
                    {
                        if(angular.isDefined($scope.createState))
                        {
                            $scope.go($scope.createState);
                        }
                        else
                        {
                            $scope.onCreate();
                        }
                    };

                    var promise;
                    if($scope.useState)
                    {
                        promise = factory.selectByState($scope.query);
                    }
                    else if(angular.isDefined(factory.selectByParent) && angular.isDefined($scope.parentId))
                    {
                        promise = factory.selectByParent($scope.query, $scope.parentId);
                    }
                    else
                    {
                        promise = factory.select($scope.query, "view");
                    }
                    promise.then(function(res)
                    {
                        $scope.items = res.data.data;
                        $scope.roles = res.data.roles;
                        $scope.permissions = res.data.permissions;
                    }, function(res)
                    {
                        $scope.items = [];
                        $scope.query.offset = 0;
                        $scope.pagination = {};
                        $scope.pages = [];
                        $scope.accessViolation = true;
                        $scope.permissions = {};
                    });
                }
            }
        }
    };
});

apishore.config(['$provide', function($provide) {
    $provide.decorator('ngTranscludeDirective', ['$delegate', function($delegate) {
        // Remove the original directive
        $delegate.shift();
        return $delegate;
    }]);
}])

.directive( 'ngTransclude', function() {
    return {
        restrict: 'EAC',
        link: function( $scope, $element, $attrs, controller, $transclude ) {
            if (!$transclude) {
                throw minErr('ngTransclude')('orphan',
                'Illegal use of ngTransclude directive in the template! ' +
                'No parent directive that requires a transclusion found. ' +
                'Element: {0}',
                startingTag($element) );
            }

            var iScopeType = $attrs['ngTransclude'] || 'sibling';

            switch ( iScopeType ) {
                case 'sibling':
                    $transclude( function( clone ) {
                        $element.empty();
                        $element.append( clone );
                    });
                    break;
                case 'parent':
                    $transclude( $scope, function( clone ) {
                        $element.empty();
                        $element.append( clone );
                    });
                    break;
                case 'child':
                    var iChildScope = $scope.$new();
                    $transclude( iChildScope, function( clone ) {
                        $element.empty();
                        $element.append( clone );
                        $element.on( '$destroy', function() {
                            iChildScope.$destroy();
                        });
                    });
                    break;
            }
        }
    }
});
apishore.directive('scrollPosition', function($window) {
  return {
    scope: {
      scroll: '=scrollPosition'
    },
    link: function(scope, element, attrs) {
      var windowEl = angular.element($window);
      var handler = function() {
        scope.scroll = windowEl[0].pageYOffset;
      }
      windowEl.on('scroll', scope.$apply.bind(scope, handler));
      handler();
    }
  };
});

apishore.directive('asSplitter', function()
{
	return {
		restrict : 'E',
		replace : true,
		transclude : true,
		scope :
		{
			orientation : '@'
		},
		template : '<div class="as-splitter-container asa-{{orientation}}" ng-transclude></div>',
		controller : [ '$scope', function($scope)
		{
			$scope.panes = [];
	
			this.addPane = function(pane)
			{
				$scope.panes.push(pane);
				return $scope.panes.length;
			};
		} ],
		link : function(scope, element, attrs)
		{
			var handler = angular.element('<div class="as-splitter-handler"></div>');
			var pane1 = scope.panes[0];
			var pane2 = scope.panes[1];
			var vertical = scope.orientation == 'vertical';
			var pane1Min = pane1.minSize || 0;
			var pane2Min = pane2.minSize || 0;
			var drag = false;
	
			pane1.elem.after(handler);
	
			element.bind('mousemove', function(ev)
			{
				if (!drag) return;
	
				var bounds = element[0].getBoundingClientRect();
				var pos = 0;
	
				if (vertical)
				{
					
					var width = bounds.right - bounds.left;
					pos = ev.clientX - bounds.left;
	
					if (pos < pane1Min) return;
					if (width - pos < pane2Min) return;
	
					handler.css('left', pos + 'px');
					pane1.elem.css('width', pos + 'px');
					pane2.elem.css('left', pos + 'px');
				}
				else
				{
					var height = bounds.bottom - bounds.top;
					pos = ev.clientY - bounds.top;
					
					if (pos < pane1Min) return;
					if (height - pos < pane2Min) return;
					
					handler.css('top', pos + 'px');
					pane1.elem.css('height', pos + 'px');
					pane2.elem.css('top', pos + 'px');
					
				}
			});
	
			handler.bind('mousedown', function(ev)
			{
				ev.preventDefault();
				drag = true;
			});
	
			angular.element(document).bind('mouseup', function(ev)
			{
				drag = false;
			});
		}
	};
});

apishore.directive('asSplitterPanel', function()
{
	return {
		restrict : 'E',
		require : '^asSplitter',
		replace : true,
		transclude : true,
		scope :
		{
			minSize : '='
		},
		template : '<div class="as-splitter-panel asa-splitter-panel-index-{{index}}" ng-transclude></div>',
		link : function(scope, element, attrs, bgSplitterCtrl)
		{
			scope.elem = element;
			scope.index = bgSplitterCtrl.addPane(scope);
		}
	};
});
apishore.directive("apishoreView", function($injector, apishoreUtils, $location, $state, $stateParams)
{
    return {
        restrict: 'E',
        scope: {
            view: '@',

            //useState : '=',
            data: '=',
            itemId: '=',

            headerText: '=',
            deleteState: '@',
            editState: '@',
            cancelState: '@'
        },
        replace: true,
        transclude: true,

        template: '<div ng-transclude="child"></div>',
        //templateUrl: '$ng/apishore/directives/ViewDirective.html',
        compile: function($element, attrs)
        {

            return {
                post: function($scope, $element, attrs, ctrl, $transclude)
                {
                    var factory = $injector.get(apishoreUtils.apiName($scope.view));
                    $scope.options = {
                        showHeader: angular.isDefined(attrs.headerText),
                        showDelete: angular.isDefined(attrs.deleteState),
                        showEdit: angular.isDefined(attrs.editState),
                        showCancel: angular.isDefined(attrs.cancelState),
                        headerText: attrs.headerText
                    };
                    $scope.permissions = {};
                    $scope.accessViolation = false;

                    if(angular.isDefined(attrs.data))
                    {
                        //use data attribute as source
                        $scope.itemData = $scope.data ? $scope.data : {};
                    }
                    else
                    {
                        $scope.itemData = {};
                        //if(angular.isDefined(attrs.useState))
                        //$scope.itemData.data.id = $stateParams.{{stateParamItemId}};
                        // use item-id as source
                        $scope.itemData.data.id = $scope.itemId || attrs.itemId;
                        apishoreUtils.applyFactory(factory, $scope);
                    }

                    $scope.deleteItem = function()
                    {
                        if(angular.isDefined($scope.deleteState))
                        {
                            $state.go($scope.deleteState);
                        }
                    };

                    $scope.editItem = function()
                    {
                        if(angular.isDefined($scope.editState))
                        {
                            $state.go($scope.editState);
                        }
                    };
                    $scope.cancelItem = function()
                    {
                        if(angular.isDefined($scope.cancelState))
                        {
                            $state.go($scope.cancelState);
                        }
                    };
                }
            }
        }
    };
});

apishore.directive("workflowAction", function($injector, $modal, userRoles, apishoreUtils, apishoreAuth)
{
    console.log("workflowAction directive load");
    return {
        restrict: 'E',
        templateUrl : window.apishoreConfig.webappRoot+"/js/apishore/directives/workflow-action.html",
        scope: {
            model: '=',
            roles: '=',
            show: '=',
            workflow: '='
        },

        link: function ($scope, element, $attrs)
        {
            //console.log("workflowAction directive link");
            var api = $injector.get($attrs.api);
            var workflowField = 'workflow'+apishoreUtils.toClassName($attrs.workflow)+'State';
            
            function apply()
            {
            	$scope.stateApi = api[$attrs.workflow][$scope.model.data[workflowField]];
            	$scope.state = api[$attrs.workflow+'States'][$scope.model.data[workflowField]];
            }
            apply();
            
            $scope.$watch("model.data."+workflowField, apply);
            
            $scope.hidden = function (to){
            	var mode = $scope.stateApi[to + 'DisableMode'];
                if(mode == "hidden")
                {
                    return $scope.disabled(to);
                }
                return false;
            };
            $scope.allowed = function allowed(to)
            {
                var config = $scope.stateApi[to + 'Config'];

                var fn = $scope.stateApi[to + 'Access'];
                if(fn)
                {
                    return fn($scope.roles);
                }
                else
                {
                    //console.error("Unknown transition:"+to);
                    //TODO: rebuild list before check disable
                    return false;
                }
            };
            $scope.disabled = function disabled(to)
            {
                var enableExpr = $scope.stateApi[to + 'Enabled'];
                if(enableExpr)
                {
                	if(!enableExpr($scope.model.data, $scope.roles)) return true;
               	};
                var config = $scope.stateApi[to + 'Config'];
                var disabled = !$scope.allowed(to);
                if(disabled)
                {
                    if(config && config.roles)
                    {
                        for(var i in config.roles)
                        {
                            var role = config.roles[i];
                            if(userRoles._getRoleGrant(role))
                            {
                                return false; // user can get role by some action
                            }
                        }
                    }
                }
                return disabled;
            };
            $scope.doTransition = function (to)
            {
                var transition = $scope.stateApi[to];
                var config = $scope.stateApi[to+'Config'];

                if(config && config.roles)
                {
                    var hasAnyRole = false;
                    for(var i in config.roles)
                    {
                        var role = config.roles[i];
                        var hasRole = apishoreAuth.hasRole(role, $scope.roles);
                        hasAnyRole |= hasRole;
                        if(!hasRole && userRoles._getRoleGrant(role))
                        {
                            userRoles._getRoleGrant(role).go();
                            return;
                        }
                    }
                }
                if(!hasAnyRole)
                {
                    return;
                }
                if(!angular.isDefined(transition))
                {
                    console.log("Unknown transition:" + to);
                    return;
                }
                var submit = function(item, callback)
                {
                    item.id = $scope.model.data.id;
                    transition(item, function(res)
                    {
                        $scope.model = res;
                        $scope.roles = res.roles;
                        if(modalInstance)
                        {
                            modalInstance.close();
                        }
                        $scope.$emit('changed$' + api.name,
							{
								type: 'update',
								item: res.data.data,
								permissions: res.data.permissions,
								roles: res.data.roles
							});
                        if(res.data.changes)
						{
							$scope.$emit('DataChanges', res.data.changes, {
								view: api.name,
								item: res.data.data,
								roles: res.data.roles
							});
						}
						var postScript = $scope.stateApi[to + 'Script'];
						if(postScript)
						{
							postScript($scope.model, res.workflowResponse);
						}
                    }, callback);
                };
                var templateUrl = config && config.templateUrl;
                if(angular.isDefined(templateUrl))
                {
                    var modalInstance = $modal.open({
                        templateUrl: templateUrl,
                        controller: 'apishoreWorkflowModalController',
                        resolve: {
                            submit: function()
                            {
                                return submit;
                            }
                        }
                    });
                }
                else
                {
                    submit($scope.model.data);
                }
            };
        }
    };
});

apishore.controller('apishoreWorkflowModalController', function($scope, $modalInstance, submit)
{
    $scope.itemData = {};

    $scope.submitForm = function(form)
    {
        submit($scope.itemData, function(data)
        {
            var error = data.error;
            if (error)
            {
                $scope.serverError = true;
            }
            for(var f in data)
            {
                if(form[f])
                {
                    form[f].$setValidity('server', false);
                    form[f].$error.server = data[f];
                }
            }
        });
    };

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    };

});
apishore.directive("workflowStart", function($injector, $modal, apishoreUtils)
{
    console.log("workflowAction directive load");
    return {
        restrict: 'E',
        templateUrl : window.apishoreConfig.webappRoot+"/js/apishore/directives/workflow-start.html",
        scope: {
            model: '=',
            roles: '='
        },

        link: function ($scope, element, $attrs)
        {
            var api = $injector.get(apishoreUtils.apiName($attrs.api));
            var start = $scope.state = api[$attrs.workflow+'Start'];

            $scope.disabled = function (to)
            {
            	return !(to && to.access($scope.roles));
            };
            $scope.doTransition = function (to)
            {
                if(!angular.isDefined(to))
                {
                    console.log("Unknown transition:" + to);
                    return;
                }
                var submit = function(item, callback)
                {
                    item.id = $scope.model && $scope.model.id;
                    to.go(item, function(res)
                    {
                        $scope.model = res.data;
                        $scope.roles = res.roles;
                        if(modalInstance)
                        {
                            modalInstance.close();
                        }
                        $scope.$emit('changed$' + api.name,
							{
								type: 'update',
								item: res.data.data,
								permissions: res.data.permissions,
								roles: res.data.roles
							});
                        if(res.data.changes)
						{
							$scope.$emit('DataChanges', res.data.changes, {
								view: api.name,
								item: res.data.data,
								roles: res.data.roles
							});
						}
                    }, callback);
                };
                var templateUrl = to.templateUrl;
                if(angular.isDefined(templateUrl))
                {
                    var modalInstance = $modal.open({
                        templateUrl: templateUrl,
                        controller: 'apishoreWorkflowModalController',
                        resolve: {
                            submit: function()
                            {
                                return submit;
                            }
                        }
                    });
                }
                else
                {
                    submit($scope.model);
                }
            };
        }
    };
});

apishore.directive("asChipsTypeahead", function(apishoreAuth, $rootScope, $http, $state, $window, $injector, $timeout) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{
			name: '=',
			model: '=',
			modelEmbedded: '=',
			options : '=',
			// filters : '=',
			asChips : '=',
			// asRequired
			asDisabled: '=',
			// disabled,
			asFocus: '&',
			asBlur: '&',
			asChange: '&',
			asOptions: '=',
			asOptionsApi: '@',
			asSearchAfter: '@',
			asTitleField: '@',
			undefinedMenuLabel: '@',
			filters: '@',
			filtersOptions: '=',
			defaultFilter:'@'
		},
		templateUrl : "$ng/apishore/directives/chips/as-chips-typeahead.html",
        link : function($scope, $elem, $attrs) {
        	//
        	var api = $injector.get($scope.asOptionsApi);
        	$scope.items = [];
        	$scope.serverSearchIsRequired = true;//initial value
			$scope.currentFilter = $scope.defaultFilter;
        	$scope.keydown = function($event)
        	{
        		console.info("keyCode = " + $event.keyCode);
        		$scope.localPristine = false;
        		switch($event.keyCode)
        		{
        			case 40:
        			{
        				if($scope.selectedIndex+1 < $scope.items.length)
        				{
        					$scope.selectedIndex++;
        					var item = $scope.items[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+item.data.id+"']");
        					var contentDom = $elem.find(".as-dropdown-select-popup-content");
        					var itemPos = itemDom.position().top + itemDom.height();
        					if(itemPos > contentDom.height())
        					{
        						itemDom[0].scrollIntoView();
        					}
        				}
        				if($event) $event.stopPropagation();
        				return false;
        			}
        			case 38:
        			{
        				if($scope.selectedIndex > 0)
        				{
        					$scope.selectedIndex--;
        					var item = $scope.items[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+item.data.id+"']");
        					var contentDom = $elem.find(".as-dropdown-select-popup-content");
        					var itemPos = itemDom.position().top;
        					if(itemPos < 0)
        					{
        						itemDom[0].scrollIntoView();
        					}
        				}
        				if($event) $event.stopPropagation();
        				return false;
        			}
        			case 27:
        			{
        				$scope.cancel();
        			}
        		}
        	};
        	$scope.keypress = function($event)
        	{
        		console.info("charCode = " + $event.charCode);
        		switch($event.keyCode)
        		{
	        		case 13:
	        		{
	        			if($scope.isOpened)
	        			{
		        			$scope.selectedIndex = $scope.selectedIndex < 0 ? 0 : $scope.selectedIndex;
		        			$scope.selectItem($scope.items[$scope.selectedIndex]);
	        			} else {
	        				$scope.openPopup();
	        			}
	        			
	        			if($event) $event.stopPropagation();
	        			if($event) $event.preventDefault();
	        			return false;
	        		}
	        		default:
	        		{
	        			$scope.openPopup();
	        		}
        		}
        	};
			$scope.openPopupByClick = function()
			{
				$scope.initialLabel = $scope.label;
				$scope.initialValue = $scope.value;
				$scope.label = "";
				$scope.openPopup();
			};
        	$scope.openPopup = function()
        	{
        		if($scope.isOpened) return;
        		$scope.updateRect();

				$scope.isOpened = true;
        		$scope.localPristine = true;
        		$scope.selectedIndex = -1;
        	};
        	$scope.updateRect = function()
        	{
        		var popup = $elem.find(".as-dropdown-select-popup");
        		$scope.popupRect = popup.offset();
        		$scope.popupRect.width = popup.width();
				var wh = $($window).height();
				$scope.popupRect.height = Math.min(popup.height(), wh * 2 / 3);
				if(($scope.popupRect.top + $scope.popupRect.height) > wh)
				{
					$scope.popupRect.top = wh - $scope.popupRect.height - 16;
				}
        	};
        	$(window).resize(function() {
        		$timeout.cancel(window.resizedFinished);
        	    $scope.closePopup();
        	    window.resizedFinished = $timeout(function(){
            	    $scope.openPopup();
            	    delete window.resizedFinished;
        	    }, 250);
        	});
        	$scope.cancel = function()
        	{
        		$scope.label = $scope.initialLabel;
        		$scope.initialValue = $scope.value;
        		$scope.closePopup();
        	};
        	$scope.closePopup = function()
        	{
        		$timeout(function(){$scope.popupRect = undefined;});
        		$scope.isOpened = false;
        		if(angular.isUndefined($scope.model)) $scope.label = undefined;
        	};
        	$scope.$watch("label", function()
        	{
        		$scope.search();
        	});
        	$scope.$watch("model", function(nv, ov)
        	{
        		if(!angular.isDefined(nv))
        		{
        			$scope.label = undefined;
        		}
        		else if(!$scope.dirty)
        		{
        			$scope.initialValue = nv;
        			api.getByIdAndState(nv).then(function(resp){
        				var item = resp.data.data || {};
        				$scope.label = item[$scope.asTitleField];
        				$scope.initialLabel = $scope.label;
        			});
        		}
        	});
        	$scope.removeItem = function(itemData, $index, $event)
        	{
        		$scope.model.splice($index, 1);
				$scope.modelEmbedded.data.splice($index, 1);
        	}
        	$scope.selectItem = function(item)
        	{
				if(item) {
					$scope.model.push(item.data.id);
					$scope.modelEmbedded.data.push(item);
					$scope.dirty = true;
				}
        		$scope.closePopup();
        	};
			$scope.setFilter = function(filterId)
			{
				$scope.currentFilter = filterId;
				$scope.serverSearchIsRequired = true;
				$scope.search();
			};
        	$scope.search = function()
        	{
				var query = {
					query: $scope.label || "",
					filters: $scope.currentFilter,
					excludedIds: $scope.model
				};
				if($scope.serverSearchIsRequired && $scope.timer == undefined)
				{
					$scope.timer = $timeout(function(){$scope.searchInProgress = true;}, 300);
					api.listByState(query, "list").then(
						function(resp)
						{
							var items = $scope.items = resp.data.data || [];
							if(query.query.length == 0)
							{
								$scope.serverSearchIsRequired = resp.data.pagination.totalPages;
							}
							for(var i=0; i < items.length; i++)
							{
								// underscore name is safe to use among server response
								items[i].as_typeahead_item_title = items[i].data[$scope.asTitleField];
							}
							$timeout.cancel($scope.timer);
							$scope.timer = undefined;
							$scope.searchInProgress = false;
							$scope.selectedIndex = -1;
						},
						function()
						{
							$scope.items = [];
							$scope.serverSearchIsRequired = true;
							$timeout.cancel($scope.timer);
							$scope.timer = undefined;
							$scope.searchInProgress = false;
							$scope.selectedIndex = -1;
						}
					);
				}
			};
			$scope.search();
		// end link
        }
	};
});
function apishoreCollectionSize(obj)
{
	if(obj)
		return obj instanceof Array ? obj.length : _.values(obj).filter(function(a){return a}).length;
	else
		return 0;
}
apishore.directive('asMinSize', function() {
	return {
		require : 'ngModel',
		link : function(scope, elem, attr, ngModel) {
			ngModel.$validators.minSize = function(modelValue,
					viewValue) {
				var size = apishoreCollectionSize(viewValue);
				var v = !ngModel.$isEmpty(viewValue)
						&& size >= scope.$eval(attr.asMinSize);
				return v;
			};
		}
	};
});
apishore.directive('asMaxSize', function() {
	return {
		require : 'ngModel',
		link : function(scope, elem, attr, ngModel) {
			ngModel.$validators.maxSize = function(modelValue,
					viewValue) {
				var size = apishoreCollectionSize(viewValue);
				var v = !ngModel.$isEmpty(viewValue)
						&& size <= scope.$eval(attr.asMaxSize);
				return v;
			};
		}
	};
});

apishore.directive('asEnableValidation', ['$parse', '$q', function($parse, $q) { return {
		
		restrict: 'A',

		require: 'ngModel',

		link: function(scope, element, attributes, modelController) {

			var enableValidation = $parse(attributes.asEnableValidation)(scope);

			var validatorSets = [
				{
					validators: modelController.$validators,
					wrapper: createValidatorWrapper(true),
					isWrapped: {},
				}, {
					validators: modelController.$asyncValidators,
					wrapper: createValidatorWrapper($q.resolve(true)),
					isWrapped: {},
				}
			];

			// Monitor result of expression in 'enableValidation' attribute for changes. When this happens then the value `enableValidation`
			// should be updated and a validation check should be triggered.
			scope.$watch(attributes.asEnableValidation, function(value) {
				enableValidation = value;
				modelController.$validate();
			}, true);

			// Monitor validator sets for changes so new validators can be wrapped in order to override their validation behavior.
			scope.$watch(function validatorSetWatch() {
				var validatorsChanged = validatorSets.reduce(function(otherSetsWereChanged, validatorSet) {
					return updateValidatorWrappers(validatorSet) || otherSetsWereChanged;
				}, false);

				if (validatorsChanged) {
					modelController.$validate();
				}
			});

			function updateValidatorWrappers(validatorSet) {

				// Check for added validators.
				var hasNewValidators = Object.keys(validatorSet.validators).reduce(function(validatorAdded, validatorKey) {

					if (validatorSet.isWrapped[validatorKey]) {
						return validatorAdded;
					}

					var wrapValidator = validatorSet.wrapper;
					var validationEnabledChecker = createValidationEnabledChecker(validatorKey);
					var originalValidator = validatorSet.validators[validatorKey];
					validatorSet.validators[validatorKey] = wrapValidator(originalValidator, validationEnabledChecker);
					validatorSet.isWrapped[validatorKey] = true;

					return true;

				}, false);

				// Check for removed validators.
				var hasRemovedValidators = Object.keys(validatorSet.isWrapped).reduce(function(validatorRemoved, validatorKey) {

					if (!validatorSet.isWrapped[validatorKey] || validatorSet.validators[validatorKey]) {
						return validatorRemoved;
					}

					validatorSet.isWrapped[validatorKey] = false;

					return true;

				}, false);

				// Let caller know whether changes were detected.
				return hasNewValidators || hasRemovedValidators;
			}

			function createValidationEnabledChecker(validatorKey) {
				return function isValidationEnabled() {

					var validationEnabled = evaluate(enableValidation);

					if (angular.isObject(validationEnabled)) {
						if (validationEnabled.hasOwnProperty(validatorKey)) {
							return !!evaluate(validationEnabled[validatorKey])
						} else if (validationEnabled.hasOwnProperty('*')) {
							return !!evaluate(validationEnabled['*'])
						} else {
							return true;
						}
					} else {
						return !!validationEnabled;
					}
				};
			}

			function evaluate(expression) {
				if (angular.isFunction(expression)) {
					return expression();
				} else {
					return expression;
				}
			}

			function createValidatorWrapper(validationSuccessValue) {
				return function wrapValidator(validator, isValidationEnabled) {
					return function wrappedValidator(modelValue, viewValue) {
						if (isValidationEnabled()) {
							return validator(modelValue, viewValue);
						} else {
							return validationSuccessValue;
						}
					};
				};
			}

		}

	}}]);
apishore.directive('apishoreFormValidatorEquals', function (){ 
   return {
      require: 'ngForm',
      link: function(scope, elem, attr, ngForm) {
    	  
          function validate(value)
          {
              var v = scope.$eval(attr.fields) == value;
        	  return v;
          }
          //For DOM -> model validation
          ngForm.$parsers.unshift(function(value) {
             var valid = validate(value);
             ngModel.$setValidity('fixedValue', valid);
             return valid ? value : undefined;
          });

          //For model -> DOM validation
          ngModel.$formatters.unshift(function(value) {
             ngModel.$setValidity('fixedValue', validate(value));
             return value;
          });
      }
   };
});

apishore.directive('apishoreValidatorFixedValue', function (){ 
   return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
    	  
          function validate(value)
          {
              var v = scope.$eval(attr.apishoreValidatorFixedValue) == value;
        	  return v;
          }
          //For DOM -> model validation
          ngModel.$parsers.unshift(function(value) {
             var valid = validate(value);
             ngModel.$setValidity('fixedValue', valid);
             return valid ? value : undefined;
          });

          //For model -> DOM validation
          ngModel.$formatters.unshift(function(value) {
             ngModel.$setValidity('fixedValue', validate(value));
             return value;
          });
      }
   };
});

apishore.directive('apishoreFormValidatorEqualFields', function (){ 
   return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
    	  var cfg = scope.$eval(attr.apishoreFormValidatorEqualFields);
    	  
          function cl()
          {
        	  var test = undefined;
        	  var result = true;
        	  for(var p in cfg)
              {
            	  var n = scope.$eval(cfg[p]);
            	  if(test != undefined)
            	  {
            		  result = result && (n == test);
            	  }
            	  else
            	  {
            		  test = n;
            	  }
              }
        	  ngModel.$setViewValue(""+result);
        	  ngModel.$commitViewValue();
          }
          cl();
          for(var p in cfg)
          {
        	  scope.$watch(cfg[p], cl);
          }
          //For DOM -> model validation
          ngModel.$parsers.unshift(function(value) {
             var valid = value == "true";
             ngModel.$setValidity('equalFields', valid);
             return valid ? value : undefined;
          });

          //For model -> DOM validation
          ngModel.$formatters.unshift(function(value) {
             ngModel.$setValidity('equalFields', value == "true");
             return value;
          });
      }
   };
});

apishore.directive('uniqueField', function()
{
   return {
      require: 'ngModel',
      scope: {
         uniqueField: '&'
      },
      link: function($scope, elem, attr, ngModel)
      {
         console.log('link uniqueField', $scope.uniqueField, ngModel);
         ngModel.$parsers.unshift(function(value)
         {
            console.log('uniqueField validate ', value);
            if($scope.uniqueField)
            {
               $scope.uniqueField({value: value})(value).then(function(res)
               {
                  console.log(res);
                  var items = res && res.data && res.data.data;
               });
            }
            return value;
         });
      }
   };
});

apishore.directive("apishoreAttachmentThumbnail", function($http, apishoreUtils, apishoreImageUrl, apishoreImageToData) {
	return {
        restrict: 'E',
        replace : true,
		scope : {
			fileId : '='
		},
        templateUrl: '$ng/apishore/directives/media/attachment-thumbnail.html',

        link : function ($scope, elem, attrs)
        {
			$scope.imageSource='';
			$scope.$watch('fileId', function(newValue)
			{
				var id = newValue;
				if(!!id)
				{
					$http.get("/api/images/"+id+"?info=true").then(function(data){
		                $scope.filename = data.data.filename;
		                $scope.isImage = data.data.isImage;
		                $scope.size = data.data.size;
		                $scope.loaded = true;
		                if($scope.isImage)
		                {
		                	$scope.imageSource=apishoreImageUrl(id, $scope.modelVersion);
		                }
					});
				}
			})
        }
    };
});



apishore.directive("apishoreFileUpload", function($http, apishoreUtils, apishoreImageUrl) {
	return {
        restrict: 'E',
        //require : "^form",
        replace : true,
		scope : {
			model : '=',
            api : '=',
            field : '@'
		},
        templateUrl: '$ng/apishore/directives/media/file-upload.html',

        link : function ($scope, elem, attrs)
        {
			$scope.imageSource='';
			$scope.modelVersion = new Date().getTime();
			
			//$scope.$watchGroup(['model', 'modelVersion'], function(newValue)
			//{
			//	var id = newValue[0];
			//	if(!!id)
			//	{
			//		$scope.imageSource=apishoreImageUrl(id, $scope.modelVersion);
			//		$http.get("/api/image/"+id+"?info=true").then(function(data){
		     //           $scope.model = data.id;
		     //           $scope.filename = data.filename;
		     //           $scope.isImage = data.isImage;
			//		});
			//	}
			//});
		    
            $scope.uploaded = function ($file, $message) {
                $scope.model = $message;
                $scope.filename = $file.name;
                $scope.isImage = false; //data.isImage;
            };
            $scope.remove = function()
            {
            	$scope.model = "";
            };
            var url = $scope.api.buildUrl($scope.api.stateParams(), true) + '?field=' + $scope.field;
            $scope.fileUploadSubmit =  function fileUploadSubmit($files, $event, $flow) {
                console.log('File upload url: ' + url);
                $flow.opts.target = url;
                $flow.upload();
            };
        }
    };
});



apishore.directive("apishoreImageUpload", function($http, apishoreUtils, apishoreImageUrl, apishoreImageToData) {
	return {
        restrict: 'E',
        //require : "^form",
        replace : true,
		scope : {
			model : '=',
            api : '=',
            field : '@'
		},
        templateUrl: '$ng/apishore/directives/media/image-upload.html',

        link : function ($scope, elem, attrs)
        {
			$scope.cropMode = false;
			$scope.imageSource='';
			$scope.modelVersion = new Date().getTime();
			$scope.croppedImage='';
			
			var handleFileSelect=function()
			{
				var url = $scope.api.buildUrl($scope.api.stateParams(), true) + '?field=' + $scope.field;
				$scope.imageSource= url + '&ts=' + $scope.modelVersion;
			};
			$scope.$watchGroup(['model', 'modelVersion'], function(newValue)
			{
				if(angular.isDefined(newValue[0]) && newValue[0])
				{
					handleFileSelect();
				}
			});
		    
            $scope.uploaded = function ($file, $message) {
                $scope.model = $message;
            };
            $scope.remove = function()
            {
            	$scope.model = "";
            };
            $scope.exitCropMode = function()
            {
            	$scope.cropMode=false;
            };
            $scope.toCropMode = function()
            {
            	$scope.cropMode=true;
            };
            $scope.crop = function()
            {
            	var req = {
            		method: 'PUT',
            		url: '/api/images/',
            		data: {
            			id: $scope.model,
            			data: $scope.croppedImage.replace(/^data:image\/(png|jpg);base64,/, "")
            		}
            	};
            	$http(req).success(function(data)
            	{
            		$scope.model = data;
            		$scope.modelVersion = new Date().getTime();
            		$scope.exitCropMode();
            	});
            };
			$scope.fileUploadSubmit =  function fileUploadSubmit($files, $event, $flow) {
				var url = $scope.api.buildUrl($scope.api.stateParams(), true) + '?field=' + $scope.field;
				console.log('File upload url: ' + url);
				$flow.opts.target = url;
				$flow.upload();
			};
        }
    };
});



apishore.directive("asSelectSimple", function(apishoreAuth, $rootScope, $http, $state, $window, $injector, $timeout) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{
			name: '=',
			model: '=',
			asOptions: '=',
			// asRequired
			asDisabled: '=',
			// disabled,
			asFocus: '&',
			asBlur: '&',
			asChange: '&',
			undefinedMenuLabel: '@',
		},
		templateUrl : "$ng/apishore/directives/select/as-select-simple.html",
        link : function($scope, $elem, $attrs) {
        	//
        	$scope.keydown = function($event)
        	{
        		console.info("keyCode = " + $event.keyCode);
        		$scope.localPristine = false;
        		switch($event.keyCode)
        		{
        			case 40:
        			{
        				if($scope.selectedIndex+1 < $scope.asOptions.length)
        				{
        					$scope.selectedIndex++;
        					var option = $scope.asOptions[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+option.id+"']");
        					var contentDom = $elem.find(".as-dropdown-select-popup-content");
        					var itemPos = itemDom.position().top + itemDom.height();
        					if(itemPos > contentDom.height())
        					{
        						itemDom[0].scrollIntoView();
        					}
        				}
        				if($event) $event.stopPropagation();
        				return false;
        			}
        			case 38:
        			{
        				if($scope.selectedIndex > 0)
        				{
        					$scope.selectedIndex--;
        					var option = $scope.asOptions[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+option.id+"']");
        					var contentDom = $elem.find(".as-dropdown-select-popup-content");
        					var itemPos = itemDom.position().top;
        					if(itemPos < 0)
        					{
        						itemDom[0].scrollIntoView();
        					}
        				}
        				if($event) $event.stopPropagation();
        				return false;
        			}
	        		case 13:
	        		{
	        			if($scope.isOpened)
	        			{
		        			$scope.selectedIndex = $scope.selectedIndex < 0 ? 0 : $scope.selectedIndex;
		        			$scope.selectItem($scope.asOptions[$scope.selectedIndex]);
	        			} else {
	        				$scope.openPopup();
	        			}

	        			if($event) $event.stopPropagation();
	        			if($event) $event.preventDefault();
	        			return false;
	        		}
        			case 27:
        			{
        				$scope.cancel();
        			}
        		}
        	};
        	$scope.keypress = function($event)
        	{
        		console.info("charCode = " + $event.charCode)
        	};
        	$scope.openPopup = function()
        	{
        		if($scope.isOpened || $scope.asDisabled) return false;
        		var popup = $elem.find(".as-dropdown-select-popup");
        		$scope.popupRect = popup.offset();
        		$scope.popupRect.width = popup.width();
        		$scope.popupRect.height = popup.height();
        		$scope.isOpened = true;
        		$scope.localPristine = true;
        		$scope.selectedIndex = -1;
        	};
        	$scope.cancel = function()
        	{
        		$scope.label = $scope.initialLabel;
        		$scope.model = $scope.initialValue;
        		$scope.closePopup();
        	};
        	$scope.closePopup = function()
        	{
        		$timeout(function(){$scope.popupRect = undefined;});
        		$scope.isOpened = false;
        		if(angular.isUndefined($scope.model)) $scope.label = undefined;
        	};
        	$scope.getLabel = function(id)
        	{
        		var label = _.find($scope.asOptions, function(opt){ return opt.id == id;}).text;
        		return label;
        	};
        	$scope.$watch("model", function(nv, ov)
        	{
        		if(!angular.isDefined(nv))
        		{
        			$scope.label = undefined;
        		}
        		else if(!$scope.dirty)
        		{
        			$scope.initialValue = nv;
        			$scope.initialLabel = $scope.label = $scope.getLabel(nv);
        		}
        	});
        	$scope.selectItem = function(item)
        	{
        		if(item) {
        			$scope.initialValue = $scope.model = item.id;
        			$scope.initialLabel = $scope.label = item.text;
        			$scope.dirty = true;
				}
				else {
					$scope.initialValue = $scope.model = undefined;
					$scope.initialLabel = $scope.label = undefined;
					$scope.dirty = true;
				}
        		$scope.closePopup();
				$timeout(function(){
					if($scope.asChange) $scope.asChange();
				});
			};
		// end link
        }
	};
});
apishore.directive("asSelect", function(apishoreAuth, $rootScope, $http, $state, $window, $injector) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{
			name: '=',
			model: '=',
			options : '=',
			asChips : '=',
			// asRequired
			asDisabled: '=',
			// disabled,
			asFocus: '&',
			asBlur: '&',
			asChange: '&',
			asOptions: '=',
			asOptionsApi: '@',
			asSearchAfter: '@',
			asTitleField: '@'
		},
		templateUrl : "$ng/apishore/directives/select/as-select.html",
        link : function($scope, $elem, $attrs) {
        	
        	function init()
        	{
	        	var select = $elem.find("select");
	        	select.attr("name", $scope.name);
	        	
	        	if(angular.isDefined($scope.asOptionsApi))
	        	{
	        		select = select.select2({
	        			tags : !!$scope.asChips,
	        			ajax:
	        			{
		        			transport: function (params, success, failure) {
		        				var api = $injector.get($scope.asOptionsApi);
		        				var query = {
		        					query: params.data.q
		        				};
		        				api.listByState(query, "list").then(function(hresponse)
		        				{
		        					var res = hresponse.data.data;
		        					success(res);
		        				},
		        				function()
		        				{
		        					failure();
		        				}
		        				);
		        			},
		        			processResults: function (data)
		        			{
		        				if(angular.isDefined(data))
		        				{
			        				var res = [];
			        				for(var i=0; i < data.length; i++)
			        				{
			        					var src = data[i].data;
			        					res[i] = {
			        							id: src.id,
			        							text: src[$scope.asTitleField]
			        					};
			        				}
			        			    return { results: res };
		        				}
		        				else
		        				{
		        					return { result: []};
		        				}
		        		    }
	        			},
		        		minimumResultsForSearch: $scope.asSearchAfter
		        	});
	        	}
	        	else if($scope.asChips)
	        	{
	        		select.attr('multiple', 'true');
	            	$scope.model = [];
	        		select = select.select2({
	        			tags : $scope.asOptions,
		        		minimumResultsForSearch: $scope.asSearchAfter
		        	});
	        	}
	        	else
	        	{
	        		select = select.select2({
		        		data : $scope.asOptions,
		        		minimumResultsForSearch: $scope.asSearchAfter
		        	});
	        	}
	        	
	        	var selectionTag = select.next(".select2").find(".select2-selection");
	        	selectionTag.focus(function() {
	        		$scope.$apply(function () {
	        			$scope.asFocus();
	                });
	        	});
	        	selectionTag.blur(function() {
	        		$scope.$apply(function () {
	        			$scope.asBlur();
	                });
	        	});
	        	
	        	select.on('change', function(e){
	        		$scope.$apply(function () {
	        			var nv = select.val();
	        			if(angular.isDefined(nv))
	        			{
	        				$scope.model = select.val();
	        				$scope.asChange();
	        			}
	                });
	        	});
        	};
        	
        	init();
        	
        	$scope.$watch('model', function(nv,ov)
        	{
        		if(angular.isDefined(nv) && !angular.equals(nv, ov))
        		{
        			$window.setTimeout(function(){ $elem.find("select").val(nv).trigger("change");});
        		}
        	});
        	
        	$scope.$watch('asDisabled', function(nv,ov)
        	{
        		if(angular.isDefined(nv))
        		{
        			$window.setTimeout(function(){ $elem.find("select").val(nv).prop("disabled", nv);});
        		}
        	});
        	
        }
	};
});
apishore.directive("asTypeahead", function(apishoreAuth, $rootScope, $http, $state, $window, $injector, $timeout) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{
			name: '=',
			model: '=',
			modelEmbedded: '=',
			options : '=',
			// filters : '=',
			asChips : '=',
			// asRequired
			asDisabled: '=',
			// disabled,
			asFocus: '&',
			asBlur: '&',
			asChange: '&',
			asOptions: '=',
			asOptionsApi: '@',
			asSearchAfter: '@',
			asInplaceCreate: '@',
			asTitleField: '@',
			undefinedMenuLabel: '@',
			filters: '@',
			filtersOptions: '=',
			defaultFilter:'@',
			onSelect: '&'
		},
		templateUrl : "$ng/apishore/directives/select/as-typeahead.html",
        link : function($scope, $elem, $attrs) {
        	//
        	var api = $injector.get($scope.asOptionsApi);
        	$scope.items = [];
        	$scope.serverSearchIsRequired = true;//initial value
			$scope.currentFilter = $scope.defaultFilter;
        	$scope.keydown = function($event)
        	{
        		console.info("keyCode = " + $event.keyCode);
        		$scope.localPristine = false;
        		switch($event.keyCode)
        		{
        			case 40:
        			{
        				if($scope.selectedIndex+1 < $scope.items.length)
        				{
        					$scope.selectedIndex++;
        					var item = $scope.items[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+item.data.id+"']");
        					var contentDom = $elem.find(".as-dropdown-select-popup-content");
        					var itemPos = itemDom.position().top + itemDom.height();
        					if(itemPos > contentDom.height())
        					{
        						itemDom[0].scrollIntoView();
        					}
        				}
        				if($event) $event.stopPropagation();
        				return false;
        			}
        			case 38:
        			{
        				if($scope.selectedIndex > 0)
        				{
        					$scope.selectedIndex--;
        					var item = $scope.items[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+item.data.id+"']");
        					var contentDom = $elem.find(".as-dropdown-select-popup-content");
        					var itemPos = itemDom.position().top;
        					if(itemPos < 0)
        					{
        						itemDom[0].scrollIntoView();
        					}
        				}
        				if($event) $event.stopPropagation();
        				return false;
        			}
        			case 27:
        			{
        				$scope.cancel();
        			}
        		}
        	};
        	$scope.keypress = function($event)
        	{
        		console.info("charCode = " + $event.charCode);
        		switch($event.keyCode)
        		{
	        		case 13:
	        		{
	        			if($scope.filteredItems.length == 0)
	        			{
	        				$scope.create();
	        			}
	        			else if($scope.isOpened)
	        			{
		        			$scope.selectedIndex = $scope.selectedIndex < 0 ? 0 : $scope.selectedIndex;
		        			$scope.selectItem($scope.items[$scope.selectedIndex]);
	        			}
	        			else
	        			{
	        				$scope.openPopup();
	        			}
	        			
	        			if($event) $event.stopPropagation();
	        			if($event) $event.preventDefault();
	        			return false;
	        		}
	        		default:
	        		{
	        			$scope.openPopup();
	        		}
        		}
        	};
			$scope.openPopupByClick = function()
			{
				$scope.initialLabel = $scope.label;
				$scope.initialValue = $scope.value;
				$scope.label = "";
				$scope.openPopup();
			};
        	$scope.openPopup = function()
        	{
        		if($scope.isOpened) return;
        		$scope.updateRect();

				$scope.isOpened = true;
        		$scope.localPristine = true;
        		$scope.selectedIndex = -1;
        	};
        	$scope.updateRect = function()
        	{
        		var popup = $elem.find(".as-dropdown-select-popup");
        		$scope.popupRect = popup.offset();
        		$scope.popupRect.width = popup.width();
				var wh = $($window).height();
				$scope.popupRect.height = Math.min(popup.height(), wh * 2 / 3);
				if(($scope.popupRect.top + $scope.popupRect.height) > wh)
				{
					$scope.popupRect.top = wh - $scope.popupRect.height - 16;
				}
        	};
        	$(window).resize(function() {
        		$timeout.cancel(window.resizedFinished);
        	    $scope.closePopup();
        	    window.resizedFinished = $timeout(function(){
        	    	if($scope.isOpened)
        	    	{
        	    		$scope.openPopup();
        	    	}
            	    delete window.resizedFinished;
        	    }, 250);
        	});
        	$scope.cancel = function()
        	{
        		$scope.label = $scope.initialLabel;
        		$scope.initialValue = $scope.value;
        		$scope.closePopup();
        	};
        	$scope.closePopup = function()
        	{
        		$timeout(function(){$scope.popupRect = undefined;});
        		$scope.isOpened = false;
        		if(angular.isUndefined($scope.model)) $scope.label = undefined;
        	};
        	$scope.$watch("label", function()
        	{
        		$scope.search();
        	});
        	$scope.$watch("model", function(nv, ov)
        	{
        		if(!angular.isDefined(nv))
        		{
        			$scope.label = undefined;
        		}
        		else if(!$scope.dirty)
        		{
        			$scope.initialValue = nv;
        			api.getByIdAndState(nv).then(function(resp){
        				var item = resp.data.data || {};
        				$scope.label = item[$scope.asTitleField];
        				$scope.initialLabel = $scope.label;
        			});
        		}
        	});
        	$scope.selectItem = function(item)
        	{
				if(item) {
					$scope.initialValue = $scope.model = item.data.id;
					$scope.initialLabel = $scope.label = item.data[$scope.asTitleField];
					$scope.dirty = true;
				}
				else {
					$scope.initialValue = $scope.model = undefined;
					$scope.initialLabel = $scope.label = undefined;
					$scope.dirty = true;
				}
				$scope.invokeOnSelect();
        		$scope.closePopup();
        	};
        	$scope.invokeOnSelect = function()
        	{
        		$timeout(function(){
        			if($scope.onSelect) $scope.onSelect();
        		});
        	}
			$scope.setFilter = function(filterId)
			{
				$scope.currentFilter = filterId;
				$scope.serverSearchIsRequired = true;
				$scope.search();
			};
			$scope.create = function()
			{
				var itemData = { };
				
				itemData[$scope.asTitleField] = $scope.label;
				api.createByState(itemData).then(function(resp){
					$scope.model = resp.data.data.id;
					$scope.initialValue = $scope.model;
					$scope.initialLabel = $scope.label;
					$scope.dirty = true;
					$scope.invokeOnSelect();
					$scope.closePopup();
				}, function(resp){
					console.error(resp);
				});
			}
        	$scope.search = function()
        	{
				var query = {
					query: $scope.label || "",
					filters: $scope.currentFilter
				};
				if($scope.filteredItems && $scope.filteredItems.length < 10 && $scope.timer == undefined)
				{
					$scope.timer = $timeout(function(){$scope.searchInProgress = true;}, 300);
					api.listByState(query, "list").then(
						function(resp)
						{
							var items = $scope.items = resp.data.data || [];
							if(query.query.length == 0)
							{
								$scope.serverSearchIsRequired = true;//resp.data.pagination.totalPages;
							}
							for(var i=0; i < items.length; i++)
							{
								// underscore name is safe to use among server response
								items[i].as_typeahead_item_title = items[i].data[$scope.asTitleField];
							}
							$timeout.cancel($scope.timer);
							$scope.timer = undefined;
							$scope.searchInProgress = false;
							$scope.selectedIndex = -1;
						},
						function()
						{
							$scope.items = [];
							$scope.serverSearchIsRequired = true;
							$timeout.cancel($scope.timer);
							$scope.timer = undefined;
							$scope.searchInProgress = false;
							$scope.selectedIndex = -1;
						}
					);
				}
			};
			$scope.search();
		// end link
        }
	};
});
apishore.directive("apishoreShiftContainer", function($state) {
	return {
		restrict : 'E',
		transclude : true,
		replace: true,
		templateUrl : window.apishoreConfig.webappRoot+"/js/apishore/directives/shiftLayout/shiftLayout.html",
		scope:{
			collapseState:'@'
		},
		controller: function($scope){ this.collapseState = $scope.collapseState;},
		link : function($scope, element, attrs) {
			$scope.disabled = function()
			{
				return false;
			}
		}
	}
});
apishore.directive("apishoreShiftMenu", function($state, $rootScope) {
	return {
		restrict : 'E',
		transclude : true,
		replace: true,
		templateUrl : window.apishoreConfig.webappRoot+"/js/apishore/directives/shiftLayout/shiftLayoutMenu.html",
		scope:{
		},
		link : function($scope, element, attrs, apishoreShiftContainer) {
			$scope.disabled = function()
			{
				var container = element.next();
				var innerMenu = container.find(".apishore-shift-menu");
				return innerMenu.length != 0;
			}
			$scope.isExpanded = function()
			{
				return $scope.expanded || $rootScope.sidebar.show;
			}
			$scope.toogle = function()
			{
				$scope.expanded = !$scope.expanded; 
			}
			$scope.hideSidebar = function()
			{
				$rootScope.sidebar.show = false;
				$rootScope.sidebar.topMenu = false;
			}
            $rootScope.$on('$stateChangeStart', function() {
            	$scope.expanded = false;
            });

		}
	}
});

apishore.directive("apishoreShiftContent", function($state) {
	return {
		restrict : 'E',
		replace: true,
		transclude: true,
		require: "^apishoreShiftContainer",
		templateUrl : window.apishoreConfig.webappRoot+"/js/apishore/directives/shiftLayout/shiftLayoutContent.html",
		scope:{
			collapseState:'@'
		},
		link : function($scope, element, attrs, apishoreShiftContainer) {
			$scope.disabled = function()
			{
				return false;
			}
		}
	}
});
apishore.directive("asHorizontalSlider", function($state, $rootScope) {
	return {
		restrict : 'E',
		replace: true,
		templateUrl : window.apishoreConfig.webappRoot+"/js/apishore/directives/sliders/as-hslider.html",
		scope:{
			value: '=',
			minValue: '=',
			maxValue: '=',
		},
		link : function($scope, elem, attrs, apishoreShiftContainer) {
			
			$scope.clickHolder = function($event)
			{
				$scope.value = $scope.setSlider($event);
			}
			$scope.onMouseMove = function($event)
			{
				if($event.buttons == 1)
				{
					$scope.value = $scope.setSlider($event);
				}
			}
			$scope.sliderPosition = function()
			{
				var norm =  Math.min($scope.maxValue, Math.max($scope.minValue, $scope.value));
				var width = elem.find(".as-input-slider").width();
				var px = ((norm - $scope.minValue) * width) / ($scope.maxValue-$scope.minValue);
				return px;
			}
			$scope.setSlider = function($event)
			{
				var slider = elem.find(".as-input-slider");
				var offsetX = $event.pageX - slider.offset().left;
				var width = slider.width();
				console.info();
				var offsetX = Math.min(width, Math.max(0, offsetX)); 
				var val = (offsetX * ($scope.maxValue-$scope.minValue)) / width + $scope.minValue;
				return Math.round(val);
			}
		}
	}
});
apishore.directive('apishoreDateTypeHelper', function() {
	return {
		restrict : 'A',
		link: function($scope, element, attrs)
		{
			$scope.openApishoreFormPopup = function(name, $event)
			{
				if($event) $event.stopPropagation();
				if($event) $event.preventDefault();
				$scope.apishoreFormPopups = {};//close othe popups in form
				$scope.apishoreFormPopups[name] = true;
			}
		}
	};
});
(function () {
    apishore.directive("apishoreAclClass", function ($animate, $interpolate, apishoreAuth) {
        return {
            restrict: 'A',
            transclude: false,
            scope: false,
            controller: function ($scope, $element, $attrs) {

                var oldVal;

                $attrs.$observe('apishoreAclClass', update);
                $scope.$watch($attrs.apishoreAclClass, update);
                $scope.$on("permissionsUpdated", update);

                function update() {
                    console.log("roles: ", apishoreAuth.getRoles());
                    var params = $scope.$eval($attrs.apishoreAclClass, apishoreAuth.getRoles());
                    console.log("update: ", params);
                    var classes = arrayClasses(params);
                    console.log("classes: ", classes);
                    ngClassWatchAction(classes);
                }

                // following is from ng-class sources
                // https://github.com/angular/angular.js/blob/master/src/ng/directive/ngClass.js
                function ngClassWatchAction(newVal) {
                    var newClasses = arrayClasses(newVal || []);
                    if (!oldVal) {
                        addClasses(newClasses);
                    } else if (!angular.equals(newVal, oldVal)) {
                        var oldClasses = arrayClasses(oldVal);
                        updateClasses(oldClasses, newClasses);
                    }
                    oldVal = newVal;
                }

                function addClasses(classes) {
                    var newClasses = digestClassCounts(classes, 1);
                    $attrs.$addClass(newClasses);
                }

                function removeClasses(classes) {
                    var newClasses = digestClassCounts(classes, -1);
                    $attrs.$removeClass(newClasses);
                }

                function digestClassCounts(classes, count) {
                    var classCounts = $element.data('$classCounts') || {};
                    var classesToUpdate = [];
                    angular.forEach(classes, function (className) {
                        if (count > 0 || classCounts[className]) {
                            classCounts[className] = (classCounts[className] || 0) + count;
                            if (classCounts[className] === +(count > 0)) {
                                classesToUpdate.push(className);
                            }
                        }
                    });
                    $element.data('$classCounts', classCounts);
                    return classesToUpdate.join(' ');
                }

                function updateClasses(oldClasses, newClasses) {
                    var toAdd = arrayDifference(newClasses, oldClasses);
                    var toRemove = arrayDifference(oldClasses, newClasses);
                    toAdd = digestClassCounts(toAdd, 1);
                    toRemove = digestClassCounts(toRemove, -1);
                    if (toAdd && toAdd.length) {
                        $animate.addClass($element, toAdd);
                    }
                    if (toRemove && toRemove.length) {
                        $animate.removeClass($element, toRemove);
                    }
                }

                function arrayDifference(tokens1, tokens2) {
                    var values = [];

                    outer:
                        for (var i = 0; i < tokens1.length; i++) {
                            var token = tokens1[i];
                            for (var j = 0; j < tokens2.length; j++) {
                                if (token == tokens2[j]) continue outer;
                            }
                            values.push(token);
                        }
                    return values;
                }

                function arrayClasses(classVal) {
                    if (angular.isArray(classVal)) {
                        return classVal;
                    } else if (angular.isString(classVal)) {
                        return classVal.split(' ');
                    } else if (angular.isObject(classVal)) {
                        var classes = [];
                        angular.forEach(classVal, function (v, k) {
                            if (v) {
                                classes = classes.concat(k.split(' '));
                            }
                        });
                        return classes;
                    }
                    return classVal;
                }
            }
        };
    });
})();
(function() {
	function parseStateRef(ref, current) {
		var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
		if (preparsed)
			ref = current + '(' + preparsed[1] + ')';
		parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
		if (!parsed || parsed.length !== 4)
			throw new Error("Invalid state ref '" + ref + "'");
		return {
			state : parsed[1],
			paramExpr : parsed[3] || null
		};
	}
	function stateContext(el) {
		var stateData = el.parent().inheritedData('$uiView');

		if (stateData && stateData.state && stateData.state.name) {
			return stateData.state;
		}
	}
	apishore.directive("uiSref", function($injector, $state, apishoreAuth) {
		return {
			restrict : 'A',
			transclude : false,
			require : [ '?^uiSrefAcl', '?^uiSrefAclEq' ],
			scope : false,
			link : function($scope, $element, $attrs, uiSrefAcl) {
				var ref = parseStateRef($attrs.uiSref, $state.current.name);
				var params = null, url = null, base = stateContext($element)
						|| $state.$current;

				var activeDirective = uiSrefAcl[1] || uiSrefAcl[0];
				if (activeDirective) {
					activeDirective.$$setStateInfo(ref.state, params);
				}
			}
		};
	});
	apishore.directive("uiSrefAcl", function($injector, $state, apishoreAuth) {
		return {
			restrict : 'A',
			transclude : false,
			scope : false,
			controller : function($scope, $element, $attrs) {
				var state, params, activeClass;

				// There probably isn't much point in $observing this
				// uiSrefActive and uiSrefActiveEq share the same directive
				// object
				// with some
				// slight difference in logic routing
				var disableClass = 'disable-by-user-roles';

				// Allow uiSref to communicate with uiSrefActive[Equals]
				this.$$setStateInfo = function(newState, newParams) {
					state = $state.get(newState, stateContext($element));
					params = newParams;
					update();
				};

				$scope.$on('permissionsUpdated', update);

				// Update route state
				function update() {
					if (apishoreAuth.isAllowedState(state, params)) {
						$element.removeClass(disableClass);
					} else {
						$element.addClass(disableClass);
					}
				}
			}
		};
	});
})();
apishore.filter('asIncludesOptions', function() {
	return function(value, options, defValue, defLabel)
	{
		var res = [];
		var set = {};
		res.push({id:defValue, text:defLabel});
		if(angular.isDefined())
		{
			if(options instanceof Array)
			{
				res = _.filter(value, function(opt){
					return opt.id != defValue && _contains(options, opt.id);
				});
			}
		}
		return res;
	};
});
apishore.filter('filesize', function() {
	var units = [ 'bytes', 'KB', 'MB', 'GB', 'TB', 'PB' ];

	return function(bytes, precision) {
		bytes = parseFloat(bytes);
		if (isNaN(bytes) || !isFinite(bytes)) {
			return 'Unknown';
		}
		var unit = 0;
		while (bytes >= 1024) {
			bytes /= 1024;
			unit++;
		}
		return unit == 0 ? bytes + ' bytes' : bytes.toFixed(+precision) + ' ' + units[unit];
	};
});
apishore.filter('percent', function() {
	return function(value)
	{
		return value ? value+"%" : "0%";
	};
});
/**
 * UI Create Form Helper provides common code for generated js
 */
apishore.factory("uiCreateFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    var helper = {
    	init : function(api, $scope, elem, attrs)
    	{
    		uiEntityHelper.init(api, $scope, elem, attrs);
    		
            $scope.itemData = {
                data: {}
            };
            $scope.serverError = false;
            $scope.submitting = false;
            $scope.topFormIsSubmitted = false;

            api.setDefaults($scope.itemData.data);
            $scope.options = {
                    showHeader: angular.isDefined(attrs.headerText),
                    saveStateDefined: angular.isDefined(attrs.saveState),
                    saveStateParameterDefined: angular.isDefined(attrs.saveStateParameter),
                    cancelStateDefined: angular.isDefined(attrs.cancelState)
                };
            $scope.onFieldChange = function(fieldId)
            {
            	if($scope.onFormFieldChange) $scope.onFormFieldChange(fieldId);
            };
			$scope.onDropDownSelect = function(){};
            
			$scope.submitFromEmbeddedForm = function()
			{
				this.submitForm(this.itemForm);
			};
            $scope.submitForm = function(form)
            {
            	form = form || $scope.itemForm;
            	if($scope.onBeforeSubmit)
            	{
            		$scope.onBeforeSubmit({itemData:$scope.itemData});
            	}
            	window.apishoreQA.submitting = true;
                $scope.serverError = false;
                $scope.topFormIsSubmitted = true;
                for(var f in form)
                {
                    if(form[f] && form[f].$error && form[f].$error.server)
                    {
                        delete form[f].$error.server;
                    }
                }
                form.$setSubmitted(true);
                if(!form.$valid)
                {
                	$scope.scrollToFirstError();
                    window.apishoreQA.submitting = false;
                	return false;
               	}

                var item = {};
                api.transform($scope.itemData.data, item);
                $scope.submitting = true;
                var promise = $scope.createCopy ? api.createCopy(item, $scope.saveState) : api.createByState(item, $scope.saveState);
                promise.then(function(res)
                {
                	api.setDefaults($scope.itemData.data);
                    $scope.submitting = false;
                    form.$setSubmitted(false);
                    $scope.topFormIsSubmitted = false;
                    $scope.afterSave(res.data.data, form);
                    window.apishoreQA.submitting = false;
                	form.$setPristine();
                    $scope.$emit('changed$' + api.name,
                        {
                            type: 'update',
                            item: res.data.data,
                            permissions: res.data.permissions,
                            roles: res.data.roles
                        });
                    if(res.data.changes)
                    {
                        $scope.$emit('DataChanges', res.data.changes, {
                            view: api.name,
                            item: res.data.data,
                            roles: res.data.roles
                        });
                    }
                }, function(data)
                {
                    $scope.submitting = false;
                    window.apishoreQA.submitting = false;
                    form.$setSubmitted(false);
                    $scope.topFormIsSubmitted = true;
                    var error = data.data.error;
                    if(error)
                    {
                        $scope.serverError = true;
                    }
                    for(var f in data.data)
                    {
                        if(form[f])
                        {
                            form[f].$setValidity('server', false);
                            form[f].$error.server = data.data[f];
                        }
                    }
                });
            };
            $scope.afterSave = function(item, form)
            {
                if($scope.options.saveStateDefined)
                {
                    // TODO: #187 clear sensitive data on submit
                    //$scope.clearItemForm();
                    var p = {};
                    if($scope.options.saveStateParameterDefined)
                    {
                        p[$scope.saveStateParameter] = item.id;
                    }
                    $state.go($scope.saveState, p);
                }
                if($scope.onSave)
                {
                	$scope.onSave({id: item.id, item: item});
                }
            };
            $scope.cancel = function(item)
            {
                if($scope.options.cancelStateDefined)
                {
                    //$scope.clearItemForm();
                    $state.go($scope.cancelState);
                }
                $scope.onSave({id: item.id, item: item});
            };
            $scope.clearItemForm = function()
            {
                $scope.itemData = {
                    data: {}
                };
            };
    	},
        initNamedFilter : function(api, $scope, elem, attrs)
        {
            helper.init(api, $scope, elem, attrs);
            $scope.submitForm = function(form)
            {
                var item = {};
                api.transform($scope.itemData.data, item);
                $scope.query.filter_parameter = JSON.stringify(item);
                $scope.onSave(item);
            };
        }
    };
    return helper;
});
/**
 * UI Edit Form Helper provides common code for generated js
 */
apishore.factory("uiEditFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs, itemId)
        {
    			uiEntityHelper.init(api,$scope, elem, attrs);

            $scope.options ={
                showHeader : angular.isDefined(attrs.headerText),
                saveStateDefined : angular.isDefined(attrs.saveState),
                cancelStateDefined : angular.isDefined(attrs.cancelState)
            };
            $scope.serverError = false;
            $scope.permissions = {};
            $scope.accessViolation = false;
            $scope.submitting = false;
            $scope.topFormIsSubmitted = false;

            if(angular.isDefined(attrs.data))
            {
                //use data attribute as source
                $scope.itemData = $scope.data ? $scope.data : { data: {}};
            }
            else
            {
	            	api.getByState("edit").then(function(data)
	    			{
	            		$scope.itemData = data.data;
	            		$scope.permissions = data.data.permissions;
	    			});
            }
			$scope.onDropDownSelect = function(){};

            $scope.onFieldChange = function(fieldId)
            {
            	if($scope.onFormFieldChange) $scope.onFormFieldChange(fieldId);
            };
			$scope.submitFromEmbeddedForm = function()
			{
				this.submitForm(this.itemForm);
			};
            $scope.submitForm = function(form)
            {
                window.apishoreQA.submitting = true;
                $scope.serverError = false;
                $scope.topFormIsSubmitted = true;
                for(var f in form)
                {
                    if(form[f] && form[f].$error && form[f].$error.server)
                    {
                        delete form[f].$error.server;
                    }
                }
                form.$setSubmitted(true);
                if(!form.$valid)
                {
                	$scope.scrollToFirstError();
                    window.apishoreQA.submitting = false;
                	return false;
               	}

                var item = {};
                item.id = $scope.itemData.data.id;
                api.transform($scope.itemData.data, item);
                $scope.submitting = true;
                api.updateByStateAndId(item).then(function(res){
                    $scope.submitting = false;
                    $scope.afterSave(res.data);
                    window.apishoreQA.submitting = false;
                    $scope.topFormIsSubmitted = false;
                    $scope.$emit('changed$' + api.view,
                        {
                            type: 'update',
                            item: res.data.data,
                            permissions: res.data.permissions,
                            roles: res.data.roles
                        });
                    if(res.data.changes)
                    {
                        $scope.$emit('DataChanges', res.data.changes, {
                            view: api.name,
                            item: res.data.data,
                            roles: res.data.roles
                        });
                    }
                }, function(data)
                {
                    $scope.submitting = false;
                    window.apishoreQA.submitting = false;
                    $scope.topFormIsSubmitted = true;
                    form.$setSubmitted(false);
                    var error = data.data.error;
                    if (error)
                    {
                        $scope.serverError = true;
                    }
                    for(var f in data.data)
                    {
                        if(form[f])
                        {
                            form[f].$setValidity('server', false);
                            form[f].$error.server = data.data[f];
                        }
                    }
                });
            };
            $scope.afterSave = function(item)
            {
            	$scope.navigateBack();
//                if($scope.options.saveStateDefined)
//                {
//                    //$scope.clearItemForm();
//                    $state.go($scope.saveState);
//                }
//                $scope.onSave({id: item.id, item: item});
            };
            $scope.cancel = function(item)
            {
                if($scope.options.cancelStateDefined)
                {
                    //$scope.clearItemForm();
                    $state.go($scope.cancelState);
                }
                $scope.onSave({id: item.id, item: item});
            };
            $scope.clearItemForm = function()
            {
                $scope.itemData = { data: {} };
            };
        }
	};
});
/**
 * UI Create Form Helper provides common code for generated js
 */
apishore.factory("uiEmbeddedCreateFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs, itemId)
        {
    		uiEntityHelper.init(api,$scope, elem, attrs);

            $scope.serverError = false;
            $scope.permissions = {};
            $scope.accessViolation = false;
            $scope.submitting = false;

            $scope.onFieldChange = function(fieldId)
            {
            	if($scope.onFormFieldChange) $scope.onFormFieldChange(fieldId);
            }
            $scope.submitForm = function(form)
            {
                return false;
            };
			$scope.submitFromEmbeddedForm = function()
			{
				this.$parent.submitFromEmbeddedForm();
			}            
            $scope.afterSave = function(item)
            {
            };
            $scope.cancel = function(item)
            {
             
            };
            $scope.clearItemForm = function()
            {
                $scope.itemData = { data: {} };
            };
        }
	};
});
/**
 * UI Edit Form Helper provides common code for generated js
 */
apishore.factory("uiEmbeddedEditFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs, itemId)
        {
    		uiEntityHelper.init(api,$scope, elem, attrs);

            $scope.serverError = false;
            $scope.permissions = {};
            $scope.accessViolation = false;
            $scope.submitting = false;

            $scope.onFieldChange = function(fieldId)
            {
            	if($scope.onFormFieldChange) $scope.onFormFieldChange(fieldId);
            }
            $scope.submitForm = function(form)
            {
                return false;
            };
			$scope.submitFromEmbeddedForm = function()
			{
				this.$parent.submitFromEmbeddedForm();
			}            
            $scope.afterSave = function(item)
            {
            };
            $scope.cancel = function()
            {
            	if($scope.onCancel) $scope.onCancel({itemData:itemData});
            };
            $scope.clearItemForm = function()
            {
                $scope.itemData = { data: {} };
            };
        }
	};
});
/**
 * UI List Helper provides common code for generated js
 */
apishore.factory("uiEmbeddedListHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope, uiGridHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.deleteItem = function(itemData, $index, $event)
    		{
    			$scope.itemsData.data.splice($index, 1);
    			if($event) event.preventDefault();
    		};
    		
			$scope.newItem = function($index, $event)
			{
	    		var newItem = {data:{}};
	    		api.setDefaults(newItem.data);
				if(!angular.isDefined($scope.itemsData.data))
				{
					$scope.itemsData.data = [];
				}
	    		$scope.itemsData.data.splice($index, 0, newItem);
    			if($event) event.preventDefault();
			};
			$scope.duplicateItem = function(itemData, $index, $event)
			{
	    		var newItem = angular.copy(itemData);
	    		$scope.itemsData.data.splice($index, 0, newItem);
    			if($event) event.preventDefault();
			};
		}
    };
});
/**
 * UI View Form Helper provides common code for generated js
 */
apishore.factory("uiEmbeddedViewFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		uiEntityHelper.init(api,$scope, elem, attrs);
			
			$scope.deleteItem = function(){
			};
			$scope.editItem = function(){
			};
			$scope.cancelItem = function(){
			};
			$scope.goToState = function(state, stateParams, options){
			};
    	}
    };
});
/**
 * UI Edit Form Helper provides common code for generated js
 */
apishore.factory("uiEntityHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope, apishoreNumbers, asInlineDialog) {
    return {
    	init : function(api, $scope, elem, attrs)
        {
    		//helper allows to store temporary values for editors without creation of additional angular scopes
    		if($scope.itemDataHelper == undefined)
    		{
    			$scope.itemDataHelper = {};
    		}
			if(!$scope.itemData || !$scope.itemData.data)
			{
				$scope.itemData = {data:{}};
			}
    		$scope.apishoreNumbers = apishoreNumbers;
            // stick current top fieldset, todo combine create, edit, table with sections.
            var scrollable = $(elem).find('.as-vscroll');
            if(scrollable.length == 0)
            {
            	//find top scrollable
            	scrollable = $(elem).parents('.as-vscroll');
           	}
            var tops = $($(elem).find(".as-fieldset-top").get());
            
			$scope.deleteDialog = asInlineDialog.init($scope, elem.find(".id-delete-dialog"), attrs);
			$scope.sliderPosition = function(value, min, max)
			{
				var norm =  Math.min(max, Math.max(min, value));
				var width = elem.find(".as-input-slider").width();
				var px = ((norm - min) * width) / (max-min);
				return px;
			};
			$scope.moveSlider = function($event, val, min, max)
			{
				if($event.buttons == 1)
				{
					var gap = 24;//TODO: 
					var width = elem.find(".as-input-slider").width();
					var offsetX = Math.min(width, Math.max(0, $event.offsetX - gap)); 
					val = (offsetX * (max-min)) / width + min;
				}
				return val;
			};		
			$scope.setSlider = function($event, min, max)
			{
				var gap = 24;
				var width = elem.find(".as-input-slider").width();
				var offsetX = Math.min(width, Math.max(0, $event.offsetX - gap)); 
				var val = (offsetX * (max-min)) / width + min;
				return val;
			};
			$scope.dialogs = {};
			$scope.dialogHelper = function(id)
			{
				var d = $scope.dialogs[id];
				if(!angular.isDefined(d))
				{
					d = asInlineDialog.init($scope, $(id), attrs);
					$scope.dialogs[id] = d;
				}
				return d;
			};
			$scope.deleteDialog.callback.delete = function()
			{
				api.removeByState();
				$state.go($scope.listState);
			};
			$scope.toggleInteractiveHelp = function()
			{
				$rootScope.interactiveHelp.toggle();
			};
            $scope.navigateBack = function($event)
            {
            	if(!$window.history.back())
            	{
            		if(angular.isDefined($scope.cancelState))
    				{
    					$state.go($scope.cancelState);
    				}
            		if(angular.isDefined($scope.backState))
    				{
    					$state.go($scope.backState);
    				}
            	}
            };
            $scope.getScrollableInfo = function()
            {
            	$timeout(function(){
            		$scope.scrollableHeight = scrollable.height();
            		if(tops.length>0)
                    {
                     	$(tops[tops.length-1]).css("minHeight", $scope.scrollableHeight+"px"); 
                    }
            	});
            };
            $scope.getScrollableInfo();
            
            $scope.scrollToFirstError = function()
            {
            	var errors = elem.find(".has-error, .asa-has-error");//TODO: remove .has-error after killing bootstrap 
            	if(errors.length>0)
            	{
            		var error = $(errors[0]);
            		error[0].scrollIntoView();
	            	error.find("input").focus();
            	}
            };

            if(tops.length>0)
            {
	            $scope.scrollToFieldset = function(id)
	            {
	            	document.getElementById(id).scrollIntoView({behavior:"smooth"});
	            	$scope.findTopFieldset();
	            };
	            $scope.findTopFieldset = function() {
	            	delete $scope.topFieldset;
	            	tops.each(function(idx, el)
	            	{
	            		var fs = $(el);
	            		var bottom = (fs.offset().top - scrollable.offset().top)+fs.height();
	            		if(bottom > 1 && !$scope.topFieldset)
	            		{
	            			$scope.topFieldset = el.id;
	            			console.log("active="+el.id)
	            		}
	            	});
	            };
				$scope.findTopFieldset();
	            scrollable.on('scroll', function(e) {
	                if ($scope.scrollTimer) return;
	                $scope.scrollTimer = $timeout(function() {
	                	$scope.findTopFieldset();
	                	$timeout.cancel($scope.scrollTimer);
	                	delete $scope.scrollTimer;
	                }, 200);
	            });
            }
			if($scope.realtimeCustomEval)
			{
				$rootScope.realtimeCustomEvalForbidden = false;
				var realtimeEvalRequest = null;
				function getRealtimeEval()
				{
					if(realtimeEvalRequest || $rootScope.realtimeCustomEvalForbidden)
					{
						return;
					}
					var item = {};
					api.transform($scope.itemData.data, item);
					realtimeEvalRequest = api.customCreateOperation("realtime_custom", item, $scope.saveState);
					realtimeEvalRequest.then(function realtimeCustomResponse(res){
						console.log(res);
						if(res.data.data)
						{
							$scope.realtimeCustomEval(res.data.data);
						}
						realtimeEvalRequest = undefined;
					}, function realtimeCustomError(res){
						console.log(res);
						realtimeEvalRequest = undefined;
					});
				}
				$scope.$watch("itemData.data", function(nv, ov)
				{
					if(!nv || !ov || angular.equals(ov, {}))
					{
						return;
					}
					getRealtimeEval();
				}, true);
			}
		}
	};
});
/**
 * UI List Helper provides common code for generated js
 */
function GridFilterString() {}

// mandatory methods
GridFilterString.prototype.init = function (params)
{
	this.colDef = params.colDef;
	this.filterChangedCallback = params.filterChangedCallback;
    this.filterModifiedCallback = params.filterModifiedCallback;
    var $scope= this.$scope = params.$scope;

	$scope.search = function()
	{
		params.filterChangedCallback();
	};
	$scope.search = function()
	{
		params.filterChangedCallback();
	};
	$scope.hide = function()
	{
		$scope.gridOptions.columnApi.hideColumn(params.colDef.field, true);
		params.filterChangedCallback();
	};
	$scope.sort = function(dir)
	{
		var sort = [ {colId: params.colDef.field, sort: dir} ];
		$scope.gridOptions.api.setSortModel(sort);
		params.filterChangedCallback();
	};
}
GridFilterString.prototype.getGui = function ()
{
	return $("#gridColumnMenu_"+this.colDef.field).text();
}
GridFilterString.prototype.isFilterActive = function()
{
	return false;
}
GridFilterString.prototype.doesFilterPass = function (params)
{
	return true;
}
GridFilterString.prototype.getApi = function ()
{
	return {};
}

// optional methods
GridFilterString.prototype.afterGuiAttached = function(params) {}
GridFilterString.prototype.onNewRowsLoaded = function () {}
GridFilterString.prototype.onAnyFilterChanged = function () {}
    
apishore.factory("uiGridHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $window, $rootScope) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.gridOptions = elem.data("grid");
    		if($scope.gridOptions)
    		{
	    		_($scope.gridOptions.columnDefs).each(function(col){
	    			col.filter = GridFilterString;
	    		});
    		}
    	},
    	onResultOk : function(api, $scope, elem, attrs, data)
    	{
    		if($scope.gridOptions)
    		{
	    		var rowData = _.map($scope.items, function(data){return data.data;});
	    		$scope.gridOptions.rowData = rowData;
	    		$scope.gridOptions.columnDefs = data.settings.gridColumns;
	    		$scope.gridOptions.allPinnedColumnCount = data.settings.gridPin;
				if($scope.gridOptions.api)
				{
					$scope.gridOptions.api.setRowData(rowData);

					var count=0;
	        		for(var i=0; i< $scope.gridOptions.allPinnedColumnCount;i++)
	        		{
	        			if(!$scope.gridOptions.columnDefs[i].hide) count++;
	        		}
	        		$scope.gridOptions.pinnedColumnCount = count;
	        		$scope.gridOptions.columnApi.setPinnedColumnCount(count);
	        		$scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
	        		$scope.gridOptions.api.refreshView();
	        		// get the grid to space out it's columns
	        		$scope.gridOptions.columnApi.sizeColumnsToFit();
				}
    		}
    	},
    	onResultFail : function($scope)
    	{
    		if($scope.gridOptions)
    		{
				$scope.gridOptions.rowData = [];
				if($scope.gridOptions.api)
				{
					$scope.gridOptions.api.refreshView();
					// get the grid to space out it's columns
					$scope.gridOptions.columnApi.sizeColumnsToFit();
				}
    		}
		}
    };
});
/**
 * UI Edit Form Helper provides common code for generated js
 */
apishore.factory("uiInlineEditFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
        {
    			uiEntityHelper.init(api,$scope, elem, attrs);

            $scope.serverError = false;
            $scope.permissions = {};
            $scope.accessViolation = false;
            $scope.submitting = false;
            $scope.itemDataCopy = angular.copy($scope.itemData.data);
            $scope.onFieldChange = function(fieldId)
            {
            		if($scope.onFormFieldChange) $scope.onFormFieldChange(fieldId);
            };
			$scope.onDropDownSelect = function(){};
			$scope.deleteItem = function()
			{
				api.removeByState($scope.itemData.data.id).then(
				function(){
					if($scope.onDelete) $scope.onDelete({id:$scope.itemData.data.id});
				},
				function(){
					if($scope.onDelete) $scope.onDelete({id:$scope.itemData.data.id});
				});
			};
            $scope.submitForm = function(form)
            {
                form = form || $scope.itemForm;
                window.apishoreQA.submitting = true;
                $scope.serverError = false;
                $scope.topFormIsSubmitted = true;
                for(var f in form)
                {
                    if(form[f] && form[f].$error && form[f].$error.server)
                    {
                        delete form[f].$error.server;
                    }
                }
                form.$setSubmitted(true);
                if(!form.$valid)
                {
                		$scope.scrollToFirstError();
                    window.apishoreQA.submitting = false;
                    return false;
               	}

                var item = {};
                item.id = $scope.itemData.data.id;
                api.transform($scope.itemData.data, item);
                $scope.submitting = true;
                if($scope.onBeforeSave) $scope.onBeforeSave({itemData:$scope.itemData});
                api.updateByStateAndId(item).then(function(res){
                    $scope.submitting = false;
                    $scope.afterSave(res.data);
                    window.apishoreQA.submitting = false;
                    $scope.topFormIsSubmitted = false;
                    $scope.$emit('changed$' + api.view,
                        {
                            type: 'update',
                            item: res.data.data,
                            permissions: res.data.permissions,
                            roles: res.data.roles
                        });
                    if(res.data.changes)
                    {
                        $scope.$emit('DataChanges', res.data.changes, {
                            view: api.name,
                            item: res.data.data,
                            roles: res.data.roles
                        });
                    }
                }, function(data)
                {
                    $scope.submitting = false;
                    window.apishoreQA.submitting = false;
                    $scope.topFormIsSubmitted = true;
                    form.$setSubmitted(false);
                    var error = data.data.error;
                    if (error)
                    {
                        $scope.serverError = true;
                    }
                    for(var f in data.data)
                    {
                        if(form[f])
                        {
                            form[f].$setValidity('server', false);
                            form[f].$error.server = data.data[f];
                        }
                    }
                });
            };
			$scope.submitFromEmbeddedForm = function()
			{
				this.$parent.submitFromEmbeddedForm();
			};
            $scope.afterSave = function(item)
            {
            		if($scope.onSave) $scope.onSave({itemData:item});
            };
            $scope.cancel = function()
            {
            		$scope.itemData.data = $scope.itemDataCopy;
            		if($scope.onCancel) $scope.onCancel({itemData:$scope.itemData});
            };
            $scope.clearItemForm = function()
            {
                $scope.itemData = { data: {} };
            };
        }
	};
});
/**
 * UI List Helper provides common code for generated js
 */
apishore.factory("uiListHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope, uiGridHelper, asInlineDialog, apishoreDataUtils) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		uiGridHelper.init(api, $scope, elem, attrs);
    		$scope.settings = {data:{}};
    		//set default scope variables
    		$scope.items = [];
    		$scope.restApi = api;
    		$scope.api = api;
    		$scope.listStateName = $state.current.name;
    		$scope.query = {
    				offset: 0,
    				sortDir : "asc"
    		};
			$scope.permissions = {};
			$scope.pagination = {};
			$scope.accessViolation = false;
			$scope.showSettings = false;
			
			$scope.selectViewModeLayout = function(layout, $event)
			{
				$scope.layout = layout;
				$scope.showViewModeMenu = false;
				if($event) $event.stopPropagation();
			};
			$scope.showDashboard = function()
			{
				return $scope.layout != 'grid' && !$scope.progress;
			};
			$scope.hideSettings = function($event)
			{
				if($scope.showSettings) $scope.toggleSettings();
			};
			$scope.toggleSettings = function($event)
			{
				$scope.showSettings = !$scope.showSettings;
				switch($scope.layout)
				{
					case 'list' : break;
					case 'grid' : 
					{
						$scope.showGridSettings = $scope.showSettings;
						break;
					}
					case 'card' : break;
				}
				if($event) $event.stopPropagation();
			};
			$scope.toggleLayout = function($event)
			{
				switch($scope.layout)
				{
					case 'list' : $scope.layout = 'grid';break;
					case 'grid' : $scope.layout = 'card';break;
					case 'card' : $scope.layout = 'list';break;
				}
			};
			$scope.selectViewModeLayout("list");
			//$scope.toggleSettings();
						
			$scope.navigateBack = function($event)
			{
				if(angular.isDefined($scope.cancelState))
				{
					$state.go($scope.cancelState);
				}
				else if(angular.isDefined($scope.backState))
				{
					$state.go($scope.backState);
				}
				else if(!$window.history.back())
				{
		    	}
			};
			$scope.toggleInteractiveHelp = function()
			{
				$rootScope.interactiveHelp.toggle();
			};
			//sort
			var defaultSort = elem.data("as-default-sort");
			if(defaultSort != null)
			{
				$scope.query.sortField = defaultSort.field;
				$scope.query.sortDir = defaultSort.dir;
			}
			$scope.sortBy = function(fieldId, $event)
			{
				$scope.showSortMenu = false;
				if($scope.query.sortField == fieldId)
				{
					$scope.query.sortDir = $scope.query.sortDir == "asc" ? "desc" : "asc";
				}
				else
				{
					$scope.query.sortDir = $scope.query.sortDir = "asc";
					$scope.query.sortField = fieldId;
				}
				$scope.selectAll();
			};
    		// watch filters
			if (angular.isDefined(attrs.filters)) {
				$scope.query.filters = $scope.filters;
				$scope.$watch("filters", function(newValue) {
					if ($scope.query.filters !== newValue) {
						$scope.query.filters = newValue;
						delete $scope.query.filter_parameter;
						$scope.selectAll();
					}
				});
			}
			{
				var defs = elem.data("navigation");
				if(defs)
				{
					$scope.filterParameterItemData = {};
					$scope.currentFilter = defs.filters[defs.default];
					$scope.query.filters = defs.default;
					$scope.applyNavigation = function(filterId)
					{
						var def = defs.filters[filterId];
						var newFilter = $scope.currentFilter != def;
						$scope.currentFilter = def;
						if(def.all)
						{
							delete $scope.query.filters;
							delete $scope.query.filter_parameter;
							delete $scope.filterParameterDialog;
						}
						else if(newFilter)
						{
							$scope.query.filters = filterId;
							delete $scope.query.filter_parameter;
							delete $scope.filterParameterDialog;
							var modalElem = elem.find("#named_filter_modal_"+filterId);
							if(modalElem && modalElem.length > 0)
							{
								$scope.filterParameterDialog = asInlineDialog.init($scope, modalElem, attrs);
								$scope.filterParameterDialog.callback.applyFilter = function applyFilterParameterDialog(arg)
								{
									console.log('apply');
									if($scope.filterParameterItemData && $scope.filterParameterItemData.data)
									{
										$scope.query.filter_parameter = JSON.stringify($scope.filterParameterItemData.data);
									}
									else
									{
										delete $scope.query.filter_parameter;
									}
									$scope.selectAll();
								};
							}
						}
						if($scope.filterParameterDialog)
						{
							$scope.filterParameterDialog.open();
						}
						else
						{
							$scope.selectAll();
						}
					};
				}
			}
			$scope.toggleInfoPanel = function($event)
			{
				if($rootScope.infoPanel.show)
				{
					$rootScope.infoPanel.show = false;
					$scope.go($scope.listStateName);
				}
				else
				{
					$rootScope.infoPanel.show = true;
					if($scope.items && $scope.items.length>0)
					{
						var item = ($scope.selectedItem) ? $scope.selectedItem : $scope.items[0];
						$scope.selectedItem = item;
						$scope.selectedItemId = item.data.id;
						$rootScope.infoPanel.show = true;
						$scope.go($scope.infoState, item);
					}
					else
					{
						$scope.selectedItem = undefined;
						$scope.selectedItemId = undefined;
					}
				}
				if($event) $event.stopPropagation();
			};
			$scope.clickItem = function(item, force, $event)
			{
				$scope.selectItem(item, $event);
				if(!$rootScope.asDevice.isDesktop || force)
				{
					$scope.viewItem(item, $event);
				}
			};
			$scope.selectItem = function(item, $event)
			{
				$scope.selectedItem = item;
				$scope.selectedItemId = item.data.id;
				$scope.infoItem(item, $event);
				if($scope.onSelectItem)
				{
					$scope.onSelectItem({id: item.data.id, item: item});
				}
			};
			$scope.infoItem = function(item, $event)
			{
				if(angular.isDefined($scope.infoState))
				{
					$rootScope.infoPanel.show = true;
					$scope.go($scope.infoState, item);
				}
				if($event) $event.stopPropagation();
			};
			// ui handlers
			$scope.viewItem = function(item, $event){
				if(!item.permissions.update) {
					$scope.go($scope.viewState, item);
				}
				else {
					$scope.go($scope.defaultState, item);
				}
				if($event) $event.stopPropagation();
			};
			
			$scope.editItem = function(item, $event){
				$scope.go($scope.editState, item);
				if($event) $event.stopPropagation();
			};
			
			$scope.deleteItem = function(item, $event){
				factory.removeByState(item.id).then(function(){
					$scope.selectAll();
				});
				if($event) $event.stopPropagation();
			};
			$scope.createItem = function()
			{
				if(angular.isDefined($scope.createState))
				{
					$scope.go($scope.createState);
				} else
				{
					$scope.onCreate();
				}
			};
			$scope.afterCreate = function(id, item, scrollDown)
			{
				$scope.selectAll().then(function(){
					if(scrollDown)
					{
						$timeout(function()
						{
							var s = elem.find('.as-vscroll');
							s[0].scrollTop = s[0].scrollHeight;
				        });
					}
				});
				if($scope.onAfterCreate)
				{
					$scope.onAfterCreate({id:id, item:item});
				}
			};

			$scope.isComplexQuery = function()
			{
				if($scope.query.query) return true;
				var defs = elem.data("navigation");
				if(defs)
				{
					return !$scope.currentFilter || ($scope.currentFilter.id != defs.default);
				}
				return false;
			};
			// api call
			$scope.reload = function(automatic)
			{
				$scope.selectAll(automatic);
			};
			$scope.selectAll = function(automatic)
			{
				if(!automatic)
				{
					$scope.progress = true;
					$scope.error = false;
					delete $scope.alertId;
				}
				$scope.listStateName = $state.current.name;
				if($scope.onBeforeLoad) $scope.onBeforeLoad();
				var promise = api.listByState($scope.query).then(function(res){
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.itemsData = apishoreDataUtils.merge($scope.itemsData, res.data);
					$scope.items = apishoreDataUtils.merge($scope.items,res.data.data);
					$scope.roles = apishoreDataUtils.merge($scope.roles,res.data.roles);
					$scope.permissions = apishoreDataUtils.merge($scope.permissions,res.data.permissions);
					$scope.dashboard = apishoreDataUtils.merge($scope.dashboard,res.data.dashboard);
					$scope.settings.data = apishoreDataUtils.merge($scope.settings.data,res.data.settings || $scope.settings);
					{
						var p = $scope.pagination = apishoreDataUtils.merge($scope.pagination,res.data.pagination);
						p.currentPage = p.offset / p.pageSize;
						var tmp = p.pages = [];
						if(p.totalPages == 1)
						{
							p.info = p.totalItems +" items";
						}
						else
						{
							var last = (p.offset+p.pageSize) < p.totalItems ? (p.offset+p.pageSize) : p.totalItems;
							p.info = (p.offset+1) +" - " + last + " of " + p.totalItems +" items";
						}
						var start = p.currentPage < 5 ? 0 : p.currentPage - 5;
						for(var i = start, j=0; i < p.totalPages && j < 10; i++, j++)
						{
							tmp.push({ page: i+1, offset: i*p.pageSize, active : i==p.currentPage});
						}
						p.noLeft = p.currentPage == 0;
						p.noRight = p.currentPage + 1 == p.totalPages;
					}
					$scope.progress = false;
					$scope.alertId = !$scope.items || $scope.items.length == 0 ? ($scope.isComplexQuery() ? "noMatch" : "empty") : undefined;

					uiGridHelper.onResultOk(api, $scope, elem, attrs, res.data);
					
					if(!automatic)
					{
						if($rootScope.infoPanel.show && $scope.items && $scope.items.length>0)
						{
							var item = $scope.items[0];
							$scope.selectedItem = item;
							$scope.selectedItemId = item.id;
							$scope.infoItem(item);
						}
						else
						{
							$scope.selectedItem = undefined;
							$scope.selectedItemId = undefined;
						}
						if($scope.onSelect) $scope.onSelect();
					}
					if($scope.onLoad) $scope.onLoad();
					$scope.scheduleDataReload();
				}, function(res) {
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					if(automatic) return; // fail of auto reload should change nothings
					$scope.itemsData = {data:[]};
					$scope.items = [];
					uiGridHelper.onResultFail($scope);
					$scope.dashboard = {error:true};
					$scope.query.offset = 0;
					$scope.pagination = {};
					$scope.pages = [];
					$scope.accessViolation = true;
					$scope.permissions = {};
					$scope.progress = false;
					$scope.error = true;
					$scope.alertId = "apiError";
					$scope.scheduleDataReload();
				});
				return promise;
			};
			$scope.scheduleDataReload = function()
			{
				if($scope.reloadDataInterval > 0)
				{
					if($scope.reloadState && $scope.reloadState != $state.current)
					{
						return;
					}
					if(!$scope.reloadState)
					{
						 $scope.reloadState = $state.current;
					}
					//console.info("schedule reload in " + $scope.reloadDataInterval + " seconds");
					function onTimeout()
					{
						$scope.reload(true);
					};
					$scope.reloadDataTimeout = $timeout(onTimeout, $scope.reloadDataInterval*1000);
				};
			}
			// search
			$scope.onSearchModify = function(delay, minLength)
			{
				if($scope.query && $scope.query.query && $scope.query.query.length < minLength) return;
				if($scope.timer) $timeout.cancel($scope.timer);
				$scope.timer = $timeout(function(){
					delete $scope.timer;
					$scope.selectAll();
				}, delay);
			};
			//expandable search
			$scope.showSearch = function()
			{
				$scope.showSearchBar = true;
				$timeout(function(){
					elem.find(".as-appbar-search-area-input").focus();
				})
			};
			$scope.clearSearch = function()
			{
				if($scope.query.query)
				{
					$scope.query.query = '';
					$scope.search();
				}
				$scope.showSearchBar = false;
			};
			$scope.search = function()
			{
				$scope.query.offset = 0;
				$scope.selectAll();
			};
			//page functions
            $scope.setPage = function(p)
            {
                var q = $scope.query;
                q.offset = p.offset;
                $scope.selectAll();
            };
            $scope.prevPage = function()
            {
                var q = $scope.query;
                if(q.offset < $scope.pagination.pageSize)
                {
                    return;
                }
                q.offset = q.offset-$scope.pagination.pageSize;
                $scope.selectAll();
            };
            $scope.nextPage = function()
            {
                var q = $scope.query;
                if(q.offset + $scope.pagination.pageSize > $scope.pagination.totalItems)
                {
                    return;
                }
                q.offset = q.offset+$scope.pagination.pageSize;
                $scope.selectAll();
            };			
			//fix header for scrollable body
			$scope.fixTable = function()
			{
				$timeout($scope.fixTableNow);
			};
			$scope.fixTableNow = function()
			{
				var headers = $(elem).find(".as-data-table-header-to-fix th");
				$(elem).find(".as-data-table-header-correct th").each(function(idx, el)
				{
					$(headers[idx]).width($(el).width());
				});
			};
		    $($window).on("resize", function()
		    {
//				if($scope.fixTableTimer) $timeout.cancel($scope.fixTableTimer);
//				$scope.fixTableTimer = $timeout(function(){
//					delete $scope.timer;
//		    		$scope.fixTable();
//				}, 300);
		    });
			$rootScope.$on('DataChanges', function(event, changes, data)
			{
				if(data.view === api.name && data.item)
				{
					$scope.selectAll();
				}
			});
			$scope.goToState = function(state, stateParams, options) {
				$state.go(state, stateParams, options);
			}; 
		}
    };
});
/**
 * UI List Helper provides common code for generated js
 */
apishore.factory("uiTwoListEmbeddedHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.availableItems = { data: [] };

    		$scope.restApi = api;

    		$scope.availableQuery = {
				offset: 0,
				sortDir : "asc"
    		};

			$scope.navigateBack = function($event)
			{
				if(!$window.history.back())
				{
		    		if(angular.isDefined($scope.cancelState))
					{
						$state.go($scope.cancelState);
					}
			    	if(angular.isDefined($scope.backState))
			    	{
						$state.go($scope.backState);
					}
		    	}
			};
			$scope.toggleInteractiveHelp = function()
			{
				$rootScope.interactiveHelp.toggle();
			};

			$scope.addItem = function(item, $index, $event)
			{
				if(!$scope.itemsIdData)
				{
					$scope.itemsIdData = [];
				}
				$scope.itemsData.data.splice(0, 0, item);
				$scope.itemsIdData.splice(0, 0, item.data.id);
				$scope.availableItems.data.splice($index, 1);
			};
			$scope.removeItem = function(item, $index, $event)
			{
				if(!angular.isDefined($scope.availableItems.data))
				{
					$scope.availableItems.data = [];
				}
				$scope.availableItems.data.splice(0, 0, item);
				$scope.itemsData.data.splice($index, 1);
				$scope.itemsIdData.splice($index, 1);
				item.$progress = false;
			};

			// api call
			$scope.reload = function()
			{
				$scope.selectAll();
			};
			$scope.isComplexQuery = function(q)
			{
				if(q.query) return true;
				return false;
			};
			$scope.addAll = function()
			{
				Array.prototype.push.apply($scope.itemsData.data, $scope.availableItems.data);
				$scope.availableItems.data = [];
				$scope.itemsIdData = [];
				for(var i=0;i<$scope.itemsData.data.length;i++)
				{
					$scope.itemsIdData.push($scope.itemsData.data[i].data.id);
				}
			};
			$scope.removeAll = function()
			{
				Array.prototype.push.apply($scope.availableItems.data, $scope.itemsData.data);
				$scope.itemsData.data = [];
				$scope.itemsIdData = [];
			};
			$scope.selectAll = function()
			{
				$scope.listStateName = $state.current.name;
				$scope.availableProgress = true;
				$scope.availableError = false;
				delete $scope.availableAlertId;
				api.listByState($scope.availableQuery).then(function(res)
				{
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.availableItems = res.data;
					var ids = {};
					if($scope.itemsIdData)
					{
						for(var i = 0; i < $scope.itemsIdData.length; i++)
						{
							ids[$scope.itemsIdData[i]] = true;
						}
					}
					for(var i=0;i<$scope.availableItems.data.length;i++)
					{
						if(ids[$scope.availableItems.data[i].data.id])
						{
							$scope.availableItems.data.splice(i, 1);
							i--;
						}
					}
					$scope.availableProgress = false;
					$scope.availableError = false;
					$scope.availableAlertId = !$scope.items || $scope.items.length == 0 ? ($scope.isComplexQuery($scope.availableQuery) ? "noMatch" : "empty") : undefined;
				}, function(res) {
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.availableItems = {data:[]};
					$scope.availableProgress = false;
					$scope.availableError = true;
					$scope.availableAlertId = "apiError";
				});
			};
			// search
			$scope.onSearchModify = function(delay, minLength)
			{
				if($scope.query && $scope.query.query && $scope.query.query.length < minLength) return;
				if($scope.timer) $timeout.cancel($scope.timer);
				$scope.timer = $timeout(function(){
					delete $scope.timer;
					$scope.selectAll();
				}, delay);
			};
					
			$rootScope.$on('DataChanges', function(event, changes, data)
			{
				if(data.view === api.name && data.item)
				{
					$scope.selectAll();
				}
			});
			$scope.goToState = function(state, stateParams, options) {
				$state.go(state, stateParams, options);
			}; 
		}
    };
});
/**
 * UI List Helper provides common code for generated js
 */
apishore.factory("uiTwoListHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.currentItems = { data: [] };
    		$scope.availableItems = { data: [] };
    		$scope.restApi = api;

    		$scope.currentQuery = {
				offset: 0,
				sortDir : "asc"
    		};
    		$scope.availableQuery = {
				offset: 0,
				insertOptions: true,
				sortDir : "asc"
    		};

			$scope.navigateBack = function($event)
			{
				if(!$window.history.back())
				{
		    		if(angular.isDefined($scope.cancelState))
					{
						$state.go($scope.cancelState);
					}
			    	if(angular.isDefined($scope.backState))
			    	{
						$state.go($scope.backState);
					}
		    	}
			};
			$scope.toggleInteractiveHelp = function()
			{
				$rootScope.interactiveHelp.toggle();
			};

			$scope.addItem = function(item, $index, $event)
			{
				$scope.currentItems.data.splice(0, 0, item);
				$scope.availableItems.data.splice($index, 1);
				item.$progress = true;
				api.createByState(item.data, $state.current.name).then(function(res){
					item.$progress = false;
					item.data.id = res.data.data.id;
				}, function(res)
				{
					item.$progress = false;
				});
			};
			$scope.removeItem = function(item, $index, $event)
			{
				if(!angular.isDefined($scope.availableItems.data))
				{
					$scope.availableItems.data = [];
				}
				$scope.availableItems.data.splice(0, 0, item);
				$scope.currentItems.data.splice($index, 1);
				item.$progress = true;
				api.removeByState(item.data.id, $state.current.name).then(function(res){
					item.$progress = false;
				}, function(res)
				{
					item.$progress = false;
				});
			};

			// api call
			$scope.reload = function()
			{
				$scope.selectAll();
			};
			$scope.isComplexQuery = function(q)
			{
				if(q.query) return true;
				return false;
			};
			$scope.addAll = function()
			{
				var query = {
					query: $scope.searchAvailable,
					filters: $scope.availableQuery.filters
				};
				$scope.currentProgress = true;
				api.addAllByState(query).then(function(){
					$scope.searchCurrent = undefined;
					$scope.searchAvailable = undefined;
					$scope.searchCurrent = undefined;
					$scope.selectAll();
				}, function()
				{
					$scope.currentProgress = false;
				});
			};
			$scope.removeAll = function()
			{
				var query = {
					query: $scope.searchCurrent,
					filters: $scope.currentQuery.filters
				};
				$scope.currentProgress = true;
				api.removeAllByState(query).then(function(){
					$scope.searchCurrent = undefined;
					$scope.searchAvailable = undefined;
					$scope.currentProgress = false;
					$scope.selectAll();
				}, function()
				{
					$scope.currentProgress = false;
				});
			};
			$scope.selectAll = function()
			{
				$scope.listStateName = $state.current.name;
				$scope.currentProgress = true;
				$scope.currentError = false;
				delete $scope.currentAlertId;
				api.listByState($scope.currentQuery).then(function(res)
				{
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.currentItems = res.data;
					if(!$scope.currentItems.data)
					{
						$scope.currentItems.data = [];
					}
					$scope.currentProgress = false;
					$scope.currentError = false;
					$scope.currentAlertId = !$scope.items || $scope.items.length == 0 ? ($scope.isComplexQuery($scope.currentQuery) ? "noMatch" : "empty") : undefined;
				}, function(res) {
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.currentItems = {data:[]};
					$scope.currentProgress = false;
					$scope.currentError = true;
					$scope.currentAlertId = "apiError";
				});
				$scope.availableProgress = true;
				$scope.availableError = false;
				delete $scope.availableAlertId;
				api.listByState($scope.availableQuery).then(function(res)
				{
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.availableItems = res.data;
					$scope.availableProgress = false;
					$scope.availableError = false;
					$scope.availableAlertId = !$scope.items || $scope.items.length == 0 ? ($scope.isComplexQuery($scope.availableQuery) ? "noMatch" : "empty") : undefined;
				}, function(res) {
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.availableItems = {data:[]};
					$scope.availableProgress = false;
					$scope.availableError = true;
					$scope.availableAlertId = "apiError";
				});
			};
			// search
			$scope.onSearchModify = function(delay, minLength)
			{
				if($scope.query && $scope.query.query && $scope.query.query.length < minLength) return;
				if($scope.timer) $timeout.cancel($scope.timer);
				$scope.timer = $timeout(function(){
					delete $scope.timer;
					$scope.selectAll();
				}, delay);
			};
					
			$rootScope.$on('DataChanges', function(event, changes, data)
			{
				if(data.view === api.name && data.item)
				{
					$scope.selectAll();
				}
			});
			$scope.goToState = function(state, stateParams, options) {
				$state.go(state, stateParams, options);
			}; 
		}
    };
});
/**
 * Helper for embedded singleton view panels
 */
apishore.factory("uiViewEmbeddedSingletonHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    	}
    };
});
/**
 * UI View Form Helper provides common code for generated js
 */
apishore.factory("uiViewEmbedPanelHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
			$scope.itemData = {};
			if(angular.isDefined(attrs.itemId))
			{
				$scope.$watch("itemId", function(newValue, oldvalue){
					api.get(newValue).then(function(data){
						$scope.itemData = data;
					});
				});
			}
			if(angular.isDefined(attrs.data))
			{
				$scope.$watch("data", function(newValue, oldvalue){
					$scope.itemData.data = newValue;
				});
			}
    	}
    };
});
/**
 * UI View Form Helper provides common code for generated js
 */
apishore.factory("uiViewFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper, apishoreDataUtils) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		uiEntityHelper.init(api,$scope, elem, attrs);
    		$scope.settings = {data:{}};
			$scope.options = {
				showHeader : angular.isDefined(attrs.headerText),
				showDelete : angular.isDefined(attrs.deleteState),
				showEdit : angular.isDefined(attrs.editState),
				showCancel : angular.isDefined(attrs.cancelState),
				headerText : attrs.headerText
			};
			$scope.permissions = {};
			$scope.itemUI = {};
			$scope.accessViolation = false;
			
			$scope.toggleSettings = function($event)
			{
				$scope.showSettings = !$scope.showSettings;
				if($event) $event.stopPropagation();
			};
			
			$scope.reload = function(automatic)
			{
				if(angular.isDefined(attrs.data))
				{
					//use data attribute as source
					$scope.itemData = $scope.data ? $scope.data : { data: {}};
				}
				else
				{
					if(!automatic)
					{
						$scope.itemData = {data: {}};
						$scope.progress = true;
					}
					api.getByState("view").then(function(res){
						$scope.itemData = apishoreDataUtils.merge($scope.itemData,res.data);
						$scope.permissions = apishoreDataUtils.merge($scope.permissions,res.data.permissions);
						$scope.dataRoles = apishoreDataUtils.merge($scope.dataRoles,res.data.roles);
						$scope.dashboard = apishoreDataUtils.merge($scope.dashboard,res.data.dashboard);
						$scope.settings.data = apishoreDataUtils.merge($scope.settings.data,res.data.settings || $scope.settings);
						
						$scope.progress = false;
						$scope.scheduleDataReload();
					}, function(res) {
						if(!automatic)
						{
							$scope.itemData = { data:{}};
							$scope.accessViolation = true;
							$scope.permissions = {};
							$scope.dataRoles = [];
						}
						$scope.progress = false;
						$scope.scheduleDataReload();
					});
				}
			};
			$scope.scheduleDataReload = function()
			{
				if($scope.reloadDataInterval > 0)
				{
					if($scope.reloadState && $scope.reloadState != $state.current)
					{
						return;
					}
					if(!$scope.reloadState)
					{
						 $scope.reloadState = $state.current;
					}
					//console.info("schedule reload in " + $scope.reloadDataInterval + " seconds");
					function onTimeout()
					{
						$scope.reload(true);
					};
					$scope.reloadDataTimeout = $timeout(onTimeout, $scope.reloadDataInterval*1000);
				};
			}
			$scope.$on("$destroy", function() {
		        if ($scope.reloadDataTimeout) {
		            $timeout.cancel($scope.reloadDataTimeout);
		        }
		    });
			$scope.deleteItem = function(){
				api.remove();
			};
			$scope.editItem = function(){
				if(angular.isDefined($scope.editState))
				{
					$state.go($scope.editState);
				}
			};
			$scope.cancelItem = function(){
				if(angular.isDefined($scope.cancelState))
				{
					$state.go($scope.cancelState);
				}
			};
			$scope.goToState = function(state, stateParams, options) {
				$state.go(state, stateParams, options);
			}; 
    	}
    };
});
apishore.factory("uiWorkflowHelper", function($injector, $modal, userRoles, apishoreUtils, apishoreAuth)
{
    console.log("uiWorkflowHelper directive load");
    return {
        //restrict: 'E',
        //templateUrl : window.apishoreConfig.webappRoot+"/js/apishore/directives/workflow-action.html",
        //scope: {
        //    model: '=',
        //    roles: '=',
        //    show: '=',
        //    workflow: '='
        //},

        init: function(api, workflowName, $scope, element, $attrs)
        {
            //console.log("workflowAction directive link");
            function apply()
            {
            	// workflow directive can be initialized before server response
            	if($scope.workflow)
            	{
	                var state = $scope.workflow.state;
	                $scope.state = state && api[workflowName + 'States'][state];
	                $scope.stateApi = state && api[workflowName][state];
            	}
            }
            
            apply();

            $scope.$watch("workflow", apply);
            $scope.$watch("workflow.state", apply);

            $scope.hidden = function(to)
            {
                var transition = $scope.workflow.transitions[to];
                return !! (transition && transition.hidden);
            };
            $scope.allowed = function allowed(to)
            {
                var transition = $scope.workflow.transitions[to];
                return !(transition && transition.enabled);
            };
            $scope.disabled = function disabled(to)
            {
                var transition = $scope.workflow.transitions[to];
                return !(transition && transition.enabled);
            };
            $scope.doTransition = function(to)
            {
                var transition = $scope.stateApi[to];
                var config = $scope.stateApi[to + 'Config'];

                if(config && config.roles)
                {
                    var hasAnyRole = false;
                    for(var i in config.roles)
                    {
                        var role = config.roles[i];
                        var hasRole = apishoreAuth.hasRole(role, $scope.roles);
                        hasAnyRole |= hasRole;
                        if(!hasRole && userRoles._getRoleGrant(role))
                        {
                            userRoles._getRoleGrant(role).go();
                            return;
                        }
                    }
                }
                if(!hasAnyRole)
                {
                    // TODO: uncomment when we have roles
                    //return;
                }
                if(!angular.isDefined(transition))
                {
                    console.log("Unknown transition:" + to);
                    return;
                }
                var submit = function(item, callback)
                {
                    item.id = $scope.model.id;
                    transition(item, function(res)
                    {
                        $scope.model = res.data;
                        $scope.roles = res.roles;
                        $scope.workflow = res.workflow[workflowName];
                        apply();
                        if(modalInstance)
                        {
                            modalInstance.close();
                        }
                        $scope.$emit('changed$' + api.name,
                            {
                                type: 'update',
								item: res.data.data,
								permissions: res.data.permissions,
								roles: res.data.roles
                            });
                        if(res.data.changes)
                        {
							$scope.$emit('DataChanges', res.data.changes, {
                                view: api.name,
								item: res.data.data,
								roles: res.data.roles
                            });
                        }
                        var postScript = $scope.stateApi[to + 'Script'];
                        if(postScript)
                        {
                            postScript($scope.model, res.workflowResponse);
                        }
                    }, callback);
                };
                var templateUrl = config && config.templateUrl;
                if(angular.isDefined(templateUrl))
                {
                    var modalInstance = $modal.open({
                        templateUrl: templateUrl,
                        controller: 'apishoreWorkflowModalController',
                        resolve: {
                            submit: function()
                            {
                                return submit;
                            }
                        }
                    });
                }
                else
                {
                    submit($scope.model);
                }
            };
        }
    };
});

/**
 * Provides common code for generated js
 */
apishore.factory("universalSearchHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.query = {
    			query : ""
    		};
    		$scope.close = function()
    		{
    			$scope.itemsData = {data:[]};
				$scope.progress = false;
				$scope.error = false;
				$scope.results = false;
				$scope.query.query ="";
    		}
    		$scope.clickItem = function(itemData, $event)
    		{
    			$state.go(itemData.data.uiState, itemData.data.uiStateParams);
    		}
			$scope.search = function()
			{
				if($scope.query.query && $scope.query.query.length>0)
				{
					$scope.progress = true;
					$scope.error = false;
					$scope.results = true;
					api.listByState($scope.query).then(function(res)
							{
								if($scope.progress)
								{
									$scope.itemsData = res.data;
									if(!$scope.itemsData.data)
									{
										$scope.itemsData.data = [];
									}	
									$scope.progress = false;
								}
							}, function(res) {
								if($scope.progress)
								{
									$scope.itemsData = {data:[]};
									$scope.progress = false;
									$scope.error = true;
								}
							});
				}
				else
				{
					$scope.progress = false;
					$scope.error = false;
					$scope.results = false;
					$scope.itemsData = {data:[]};
				}
			};
			
			$scope.goToState = function(state, stateParams, options) {
				$state.go(state, stateParams, options);
			}; 
		}
    };
});
'use strict';
angular.module('apishore').factory('apishoreQAinterceptor', ['$q', '$injector'
    , function($q, $injector)
    {
        function checkPendingRequests()
        {
            var $http = $injector.get('$http');
            if($http && window.apishoreQA)
            {
                window.apishoreQA.apiRequesting = $http && $http.pendingRequests.length > 1;
                console.log('QA requesting: ' + window.apishoreQA.apiRequesting);
            }
        }

        return {
            'response': function(response)
            {
                checkPendingRequests();
                return response || $q.when(response);
            },
            'responseError': function(rejection)
            {
                checkPendingRequests();
                return $q.reject(rejection);
            }
        };
    }
]).config(['$httpProvider',
    function($httpProvider)
    {
        $httpProvider.interceptors.push('apishoreQAinterceptor');
    }
]);

apishore.factory("apishoreAuth", function($timeout, $rootScope, $state, $http, $injector, $location, $cookies) {
	console.info("apishoreAuth init");
    $rootScope.userAuthorized = false;
    $rootScope.user = { roles: {} };
	var service = {
		logout : function(callback)
		{
			var thus = this;
            var config = window.apishoreConfig;
            var cfg = {
            	withCredentials: true
            };
            
			$http.post(config.localUrl + "/api/account/logout", {}, cfg).success(function() {
				$location.url("/");
				$window.location.reload();
			});
		},
        login : function(returnUrl)
        {
            var loc = returnUrl || window.location.href;
            //TODO: config service
            var config = window.apishoreConfig;
            if (!config.oauth)
            {
                console.log("not configured: " + JSON.stringify(config));
                return;
            }
            var redirect = config.callback + "?return=" + encodeURIComponent(loc);
            var url = config.oauth + "/login?redirect_uri=" + encodeURIComponent(redirect)
                + "&client_id=" + config.clientId
                + "&local_uri=" + config.localUrl
                + "&response_type=code";
            window.location.href = url;
        },
		getUserInfo: function(callback)
        {
        	var thus = this;
            return $injector.get('UserProfileApi').get("").success(function (data) {
				thus.user = data.data;
				if (thus.user && thus.user.login || !!thus.user.authorized) {
                    $rootScope.user = data.data;
					$rootScope.userAuthorized = thus.authorized = true;
				} else {
                    $rootScope.user = { roles: {} };
					$rootScope.userAuthorized = thus.authorized = false;
					console.log(data);
				}
				if (thus.user.roles) {
					thus.user.roles.$all = function () {
						for (var i = 0; i < arguments.length; i++) {
							var v = arguments[i];
							if (angular.isString(v)) {
								if (!thus.user.roles[v]) {
									return false;
								}
							} else if (!v) {
								return false;
							}
						}
						return true;
					};
					thus.user.roles.$any = function () {
						if (arguments.length === 0)
						{
							return true;
						}
						for (var i = 0; i < arguments.length; i++) {
							var v = arguments[i];
							if (angular.isString(v)) {
								if (thus.user.roles[v]) {
									return true;
								}
							} else if (v) {
								return true;
							}
						}
						return false;
					}
				}
				if (!angular.equals(thus.oldUser, thus.user)) {
					console.log("permissions updated", thus.user);
					service.user = thus.oldUser = thus.user;
					$rootScope.$broadcast("permissionsUpdated", thus.user);
					if(angular.isFunction(callback))
					{
						callback(service.user);
					}
					else if(angular.isString(callback))
					{
						$state.go(callback);
					}
					else if(angular.isDefined($state.current) && !angular.isDefined($state.current.abstract))
					{
						$timeout(function ()
						{
							$state.reload();
						});
					}
					else
					{
						var deregister = $rootScope.$on('$stateChangeSuccess', function ()
						{
							deregister();
							$state.reload();
						});
					}
				}
				else if(angular.isFunction(callback))
				{
					callback(service.user);
				}
				else if(angular.isString(callback))
				{
					$state.go(callback);
				}
            }).error(function (data) {
                $rootScope.userAuthorized = thus.authorized = false;
                $rootScope.user = thus.user = { roles: {} };
                console.log(data);
            });
        },
		getRoles: function () {
			return service.user && service.user.roles;
		},
		hasRole : function(required, dataRoles)
		{
			if (!service.user || !service.user.roles)
			{
				// FIXME: this is workaround for missing authorization
				return true;
			}
			if (angular.isString(required))
			{
				required = [required];
			}
			if (required.length === 0)
			{
				return true;
			}
			for(var i = 0; i<required.length; i++)
			{
				var roleToCheck = required[i];
				if(service.user.roles[roleToCheck])
				{
					return true;
				}
				if (dataRoles && dataRoles[roleToCheck])
				{
					return true;
				}
			}
			//roles specified in state MUST fit
			return false;
		},
        isAllowedState : function(state, params)
        {
			if(angular.isDefined(state) && state != null)// in docs state can be null
        	{
				if(state.name == 'account.register')
				{
					// FIXME: this is workaround for register form available to logged user
					return !this.hasRole(['logged']);
				}
	        	if(state.data && state.data.roles)
	        	{
					var dataRoles = this.collectStateDataRoles(state);
					return this.hasRole(state.data.roles, dataRoles);
	        	}
	        	var ld = state.name.lastIndexOf('.');
	        	if(ld >= 0)
	        	{
	        		var parentName = state.name.substring(0, ld);
	        		return this.isAllowedState($state.get(parentName));
	        	}
        	}
        	//visible by default
        	return true;
        },
		collectStateDataRoles: function(start, previous)
		{
			var state = start;
			var roles = previous || {};
			if(state.data && state.data.dataRoles)
			{
				angular.extend(roles, state.data.dataRoles);
			}
			var ld = state.name.lastIndexOf('.');
			if(ld >= 0)
			{
				var parentName = state.name.substring(0, ld);
				return this.collectStateDataRoles($state.get(parentName), roles);
			}
			return roles;
		}
	};

	$timeout(service.getUserInfo);
	
	return service;
});

'use strict';
apishore.factory('errorInterceptor', ['$injector', '$q', '$rootScope',
    function($injector, $q, $rootScope)
    {
        return {
            'request': function(config)
            {
                return config || $q.when(config);
            },
            'response': function(response)
            {
                return response || $q.when(response);
            },
            'responseError': function(rejection)
            {
            	if(!$rootScope.publicSite)
            	{
	                switch(rejection.status)
	                {
	                    case 401:
	                    case 403:
	                        var apishoreAuth = $injector.get('apishoreAuth');
	                        apishoreAuth.login();
	                        break;
	                }
            	}
                return $q.reject(rejection);
            }
        };
    }
]).config(['$httpProvider',
    function($httpProvider)
    {
        $httpProvider.interceptors.push('errorInterceptor');
    }
]);

apishore.factory("apishoreConfig", function($injector) {
	return {
		
	};
});


apishore.factory("apishoreCssUtils", function($injector, $http, $stateParams, $state, $window, $timeout, $location) {
	var styleSheetElement = document.createElement('style');
	styleSheetElement.type = 'text/css';
	styleSheetElement.id = "apishoreCssUtils";
	document.getElementsByTagName('head')[0].appendChild(styleSheetElement);
	var styleSheet = styleSheetElement.sheet;
	
	//
	var utils;
	return utils = {
		update: function(selector, style)
		{
			for (i = 0; i < styleSheet.rules.length; i++)
			{
				if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase()==selector.toLowerCase())
				{
					styleSheet.rules[i].style.cssText = style;
					return;
				}
			}
			styleSheet.insertRule(selector + '{' + style + '}', styleSheet.cssRules.length);
		}
	};
});


apishore.factory("apishoreDataUtils", function($injector, $http, $stateParams, $state, $window, $timeout, $location) {
    var utils;
	return utils = {
		merge : function(ov, nv)
		{
			if(!ov) return nv;
			if(nv instanceof Array)
			{
				var oi = 0, ni = 0;
				//merge array elements
				for(oi = 0; oi < ov.length;)
				{
					if(ni == nv.length)
					{
						//remove tail of old data
						ov.splice(oi, ov.length-oi);
						break;
					}
					var ovv = ov[oi];
					var nvv = nv[ni];
					if(this.equalIds(ovv, nvv))
					{
						this.merge(ovv, nvv);
						oi++;
						ni++;
					}
					else
					{
						var old = this.findAndRemoveById(ov, oi, this.getId(nvv));
						if(old)
						{
							ov.splice(oi, 0, old);
							ovv = old;
							this.merge(ovv, nvv);
							oi++;
							ni++;
						}
						else
						{
							ov.splice(oi, 1, nvv);
							oi++;
							ni++;
						}
					}
				}
				//add tail of new elements
				for(; ni < nv.length; ni++)
				{
					ov.push(nv[ni]);
				}
				return ov;
			}
			else if(nv instanceof Object)
			{
				//remove deletions
				for (var key in ov)
				{
					if (ov.hasOwnProperty(key) && !nv[key]) delete ov[key];
				}
				for (var key in nv)
				{
					var ovv = ov[key];
					var nvv = nv[key];
					if(ovv == undefined)
					{
						//new properties
						ov[key] = nvv;
					}
					else if(ovv != nvv)
					{
						//change & merge
						ov[key] = this.merge(ovv, nvv);
					}
				}
				return ov;
			}
			return nv;
		},
		equalIds : function(a, b)
		{
			if(a == undefined || b == undefined) return false;
			if(a.hasOwnProperty("id") && b.hasOwnProperty("id"))
			{
				return a.id == b.id;
			}
			else if(a.hasOwnProperty("data") && b.hasOwnProperty("data"))
			{
				return this.equalIds(a.data, b.data);
			}
		},
		findAndRemoveById : function(a, idx, id)
		{
			if(a == undefined) return undefined;
			for(; idx < a.length; idx++)
			{
				var item = a[idx];
				if(id == this.getId(item))
				{
					a.splice(idx, 1);
					return item;
				}
			}
			return undefined;
		},
		getId : function(a)
		{
			if(a == undefined) return undefined;
			if(a.hasOwnProperty("id"))
			{
				return a.id;
			}
			else if(a.hasOwnProperty("data") && a.data.hasOwnProperty("id"))
			{
				return a.data.id;
			}
		}
	};
});

apishore.factory("apishoreFormUtils", function($state, apishoreUtils, asInlineDialog)
{
    return {
        findParentStateData: function(state, parent)
        {
            if(state.data && angular.isDefined(state.data[parent]))
            {
                return state.data[parent];
            }
            var ld = state.name.lastIndexOf('.');
            if(ld >= 0)
            {
                var parentName = state.name.substring(0, ld);
                return this.findParentStateData($state.get(parentName), parent);
            }
            return undefined;
        },
        setCreateDefaults: function($scope, resetModel, factory, parent)
        {
            $scope.itemData = { data: {}};
            $scope.serverError = false;
            $scope.submitting = false;

            if(angular.isDefined(parent))
            {
                // state can contain old data, we might want to get fresh data from server
                var thus = this;
                angular.forEach(parent, function(value)
                {
                    var parentName = apishoreUtils.toFieldName(value);
                    $scope.itemData.data[parentName] = thus.findParentStateData($state.current, parentName);
                    if ($scope.itemData.data[parentName])
                    {
                        $scope.itemData.data[parentName+'Id'] = $scope.itemData.data[parentName].id;
                    }
                });
            }
            factory.setDefaults($scope.itemData.data);
            resetModel();
        },
//        createCreateScope: function($scope, elem, attrs, resetModel, factory, useState)
//        {
//        	
//        },
//        createCreateStateScope: function($scope, elem, attrs, resetModel, factory)
//        {
//            return this.createCreateScope($scope, elem, attrs, resetModel, factory, true)
//        },

        createEditStateScope: function($scope, elem, attrs, factory, itemId){
            return this.createEditScope($scope, elem, attrs, factory, itemId, true);
        },
        createFieldRefSelectDirective: function(elem, attrs, factory, label)
        {
            if(attrs.required == "true")
            {
                elem.find("option")[0].remove();
            }

            var id = attrs.controlId;
            apishoreUtils.adjustFormGroupTemplate(elem, attrs, label);
            return {
                post: function($scope, elem, attrs, formCtrl)
                {
                    // console.log(name + ': post link'+formCtrl);
                    $scope.formField = formCtrl[id];
                    $scope.form = formCtrl;
                    $scope.itemLoaded = false;
                    if(angular.isDefined(attrs.restrictedByParent))
                    {
                        $scope.$watch('restrictedByParent', function(newValue, oldValue)
                        {
                            $scope.selectAll();
                            if(formCtrl.$dirty && $scope.parentModel !== newValue)
                            {
                                $scope.item = {name: ""};
                                $scope.model = undefined;
                            }
                        });
                    }
                    if(angular.isDefined(attrs.eraseByParent))
                    {
                        $scope.$watch('eraseByParent', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && $scope.parentModel !== newValue)
                            {
                                $scope.item = {name: ""};
                                $scope.model = undefined;
                            }
                        });
                    }
                    if(angular.isDefined(attrs.setByChild))
                    {
                        $scope.$watch('setByChild', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && angular.isDefined(newValue) && newValue !== '')
                            {
                                factory.get(newValue, "view").then(function(res)
                                {
                                    if(res.data.data)
                                    {
                                        $scope.item = res.data.data;
                                        $scope.model = res.data.data.id;
                                    }
                                });
                            }
                        });
                    }
                    $scope.selectAll = function()
                    {
                        if(angular.isDefined($scope.restrictedByParent))
                        {
                            factory.list({}, $scope.restrictedByParent).then(function(items)
                            {
                                $scope.items = items.data.data;
                            });
                            return;
                        }
                        factory.listByState().then(function(items)
                        {
                            $scope.items = items.data.data;
                        });
                    };
                    $scope.onselected = function()
                    {
                        $scope.items.forEach(function(item)
                        {
                            if(item.data.id === $scope.model)
                            {
                                $scope.itemData.data[$scope.controlPreview] = item.data;
                            }
                        });
                    };
                    //init
                    $scope.selectAll();
                }
            };
        },
        createFieldRefSelectTypeaheadDirective: function(elem, attrs, factory, label, typeahead)
        {
            var id = attrs.controlId;
            apishoreUtils.adjustFormGroupTemplate(elem, attrs, label);
            return {
                post: function($scope, elem, attrs, formCtrl)
                {
                    // console.log(name + ': post link'+formCtrl);
                    $scope.formField = formCtrl[id];
                    $scope.form = formCtrl;
                    $scope.item = {};
                    $scope.item[typeahead] = '';
                    $scope.itemLoaded = false;
                    if(angular.isDefined(attrs.restrictedByParent))
                    {
                        $scope.$watch('restrictedByParent', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && $scope.parentModel !== newValue)
                            {
                                $scope.item = {name: ""};
                                $scope.model = undefined;
                            }
                        });
                    }
                    if(angular.isDefined(attrs.eraseByParent))
                    {
                        $scope.$watch('eraseByParent', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && $scope.parentModel !== newValue)
                            {
                                $scope.item = {name: ""};
                                $scope.model = undefined;
                            }
                        });
                    }
                    if(angular.isDefined(attrs.setByChild))
                    {
                        $scope.$watch('setByChild', function(newValue, oldValue)
                        {
                            if(formCtrl.$dirty && angular.isDefined(newValue) && newValue !== '' && newValue !== oldValue)
                            {
                                factory.get(newValue, "view").then(function(res)
                                {
                                    if(res.data.data)
                                    {
                                        $scope.item = $scope.itemData.data[$scope.controlPreview] = res.data;
                                        $scope.model = res.data.data.id;
                                    }
                                });
                            }
                        });
                    }

                    $scope.$watch('itemData.data', function(newValue, oldValue)
                    {
                        if(angular.isDefined(newValue) && angular.isDefined(newValue[$scope.controlPreview]) && !$scope.itemLoaded)
                        {
                            $scope.item = newValue[$scope.controlPreview];
                            $scope.itemLoaded = true;
                        }
                    });
                    $scope.$watch('item', function(newValue, oldValue)
                    {
                        if(formCtrl.$dirty && (newValue == '' || !angular.isDefined(newValue)))
                        {
                            $scope.model = '';
                            $scope.itemData.data[$scope.controlPreview] = undefined;
                        }
                    });
                    $scope.typeahead = function(value)
                    {
                        if(angular.isDefined($scope.restrictedByParent))
                        {
                            return factory.selectByParent({
                                sortField: typeahead,
                                typeahead: value
                            }, $scope.restrictedByParent).then(function(items)
                            {
                                return items.data.data;
                            });
                        }
                        return factory.listByState({
                            sortField: typeahead,
                            typeahead: value
                        }).then(function(items)
                        {
                            return items.data.data;
                        });
                    };
                    $scope.onselected = function(value)
                    {
                        console.info("onselected" + value);
                        $scope.model = value.id;
                        $scope.itemData.data[$scope.controlPreview] = value;
                    };
                }
            }
        },
        createStateController: function createStateController($scope, $rootScope, $state, $stateParams, stateName, struct, view, entityName, entityStateParamName)
        {
            var state = $state.get(stateName);
            $rootScope.$on('DataChanges', function(event, changes, data)
            {
                if(data.view == view && data.item && data.item.id == $stateParams[entityStateParamName])
                {
                    state.data.dataRoles = data.roles;
                    $scope[entityName] = state.data[entityName] = data.item;
                    $rootScope.$broadcast('$stateDataUpdate');
                }
                else
                {
                    var id = changes.items && changes.items[struct];
                    if(id == $stateParams[entityStateParamName])
                    {
                        state.resolve[entityName].then(function(res)
                        {
                            state.data.dataRoles = res.data.roles;
                            state.data[entityName] = res.data.data;
                            $rootScope.$broadcast('$stateDataUpdate');
                        });
                    }
                }
            });
        },
        createStateSingletonController: function createStateSingletonController($scope, $rootScope, $state, $stateParams, stateName, struct, view, entityName)
        {
            var state = $state.get(stateName);
            $rootScope.$on('DataChanges', function(event, changes, data)
            {
                if(data.view == view && data.item)
                {
                    state.data.dataRoles = data.roles;
                    $scope[entityName] = state.data[entityName] = data.item;
                    $rootScope.$broadcast('$stateDataUpdate');
                }
                else
                {
                    if(changes.items && changes.items[struct])
                    {
                        state.resolve[entityName].then(function(res)
                        {
                            state.data.dataRoles = res.data.roles;
                            state.data[entityName] = res.data.data;
                            $rootScope.$broadcast('$stateDataUpdate');
                        });
                    }
                }
            });
        },
        addTrigger: function addTrigger($scope, elem, name, api, field, value, operation)
        {
        	console.trace('addTrigger ', field, value);
			var dialog = $scope['valueTrigger'+name+'Dialog'] = asInlineDialog.init($scope, elem.find(".id-value-trigger-dialog-"+name), {});
            $scope.$watch('itemData.data.' + field, function triggerWatch(nv, ov)
            {
                if(!nv || nv != value || ov == value || ov == undefined)
                {
                    return;
                }
                // we have new value and new value changed to expected value
                console.log('trigger', value, ov, nv);
                dialog.callback.rollback = function()
                {
                	$scope.itemData.data[field] = ov;
                }
                dialog.callback.trigger = function()
                {
                	$scope.triggerProgress = true;
                	api.customOperation(operation, $scope.itemData.data).then(function(data){
                		$scope.itemData = data.data;
                		$scope.permission = data.data.permissions;
                		$scope.triggerProgress = false;
                	}, function(){
                		$scope.triggerProgress = false;
                	});
                }
                dialog.open();
            });
        }
    };
});

apishore.factory("apishoreNumbers", function($state, apishoreUtils)
{
    return {
		round: function(v)
		{
			// see http://0.30000000000000004.com/
			var t = 1000000000;
			return Math.round(v * t) / t;
		},
    	increment: function(value, limits, values, max)
    	{
    		for(var i=0; i< limits.length; i++)
    		{
    			var limit = limits[i];
    			if(limit == undefined || Math.abs(value) < limit)
    			{
					return this.round(Math.min(value + values[i], max));
    			}
    		}
			var number2 = Math.min(value, max);
            return number2;
    	},
    	decrement: function(value, limits, values, min)
    	{
    		for(var i=0; i< limits.length; i++)
    		{
    			var limit = limits[i];
    			if(limit == undefined || Math.abs(value) < limit)
    			{
					return this.round(Math.max(value - values[i], min));
    			}
    		}
			return this.round(Math.max(value, min));
    	}
    }
});
apishore.filter('telLink', function () {
    return function (tel) {
        if (!tel) { return ''; }
        tel = tel.replace(/\s+/g, ' ');
        return "tel:"+tel;
    }
});
apishore.filter('tel', function () {
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country == 1) {
            country = "";
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + " (" + city + ") " + number).trim();
    };
});
apishore.factory("apishoreStateTemplateUrl", function($state, $stateParams, apishoreAuth) {
	return function(stateName, url) {
		var config = window.apishoreConfig;
		if(!apishoreAuth.isAllowedState($state.get(stateName), $stateParams))
	    {
	    	// TODO: Change to $stateChangeStart
	    	// SEE: https://github.com/angular-ui/ui-router/issues/178
	    	console.info("access.error:"+stateName);
	    	return config.appPath+"/error/access.html";
	    }
	    else
	    {
	    	console.info("access.ok:"+stateName);
	    	return url;
	    }
	};
});


apishore.factory("apishoreUtils", function($injector, $http, $stateParams, $state, $window, $timeout, $location) {
    var utils;
	return utils = {
		escapeRegExp: function (string) {
		    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		},
		replaceAll: function(string, find, replace) {
			  return string.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
		},
		redirectToUrl: function(urlTemplate, params)
		{
			var url = urlTemplate;
			for(var name in params)
			{
				url = this.replaceAll(url, "{"+name+"}", params[name]);
				url = this.replaceAll(url, ":"+name, params[name]);
			}
			angular.element($window.document.body).addClass("apishore-redirect-in-process");
			$timeout(function(){
				//give browser chance to show redirect notice
				window.location = url;//$location.path(url).replace();
			});
		},
		redirectToState: function(state, params)
		{
			$state.go(state, params);
		},
		apiName: function(str)
		{
			return this.toClassName(str)+"Api";
		},
		compileApishoreBind : function($scope, src, query, params, loadListener)
		{
			var i=src.indexOf("as");
			var viewName =  this.apiName(src.substring(0,i).trim());
			var localName = src.substring(i+2).trim();
			var obj = $scope[localName] = {
				state: "loading",
				items:[]
			};
			var func = $injector.get(viewName).listByState || $injector.get(viewName).list;
			func(query, params).then(function(data){
				obj.state = "loaded";
				obj.items = data.data.data;
				for(var i=0; i< obj.items.length; i++)
				{
					obj.items[i].$index = i;
				}
				if(loadListener) loadListener(obj);
			}, function(data){
				obj.state = "failed";
				obj.items = [];
			});

			return obj;
		},
		toClassName: function(str)
		{
			str = str.replace(/_([a-z])/g, function (m, w) {
			    return w.toUpperCase();
			});
			return str.substring(0,1).toUpperCase()+str.substring(1);
		},
		toFieldName: function(str)
		{
			return angular.isString(str) ? str.replace(/_([a-z])/g, function (m, w) {
			    return w.toUpperCase();
			}) : str;
		},
		getDefaultDateTime : function(strategy)
		{
			switch (strategy) {
			case 'now':
				return this.getNow().toDate();
			case 'tomorrow':
				return this.getNextDayStart().toDate();
			case 'next_week':
				return this.getNextWeekStart().toDate();
			case 'next_month':
				return this.getNextMonthsStart().toDate();
			case 'next_2months':
				return this.getNextMonthsStart(2).toDate();
			case 'next_3months':
				return this.getNextMonthsStart(3).toDate();
			case 'next_6months':
				return this.getNextMonthsStart(6).toDate();
			default:
				return undefined;
			}
		},
		getNow : function () {
			var today = moment();
			today.millisecond(0);
			today.second(0);
			return today;
		},
		getToday : function () {
			var today = this.getNow();
			today.minute(0);
			today.hour(9);
			return today;
		},
		getNextDayStart : function () {
            var today = this.getToday();
            var nextDay = today.add('days', 1);

            return nextDay;
        },
		getNextWeekStart : function () {
			var today = this.getToday();
            var daystoMonday = 0 - (1 - today.isoWeekday()) + 7;

            var nextMonday = today.subtract('days', daystoMonday);

            return nextMonday;
        },

		getNextWeekEnd: function() {
            var nextMonday = GetNextWeekStart();
            var nextSunday = nextMonday.add('days',6);

            return nextSunday;
        },

        getLastWeekStart: function () {
			var today = this.getToday();
            var daystoLastMonday = 0 - (1 - today.isoWeekday()) + 7;

            var lastMonday = today.subtract('days', daystoLastMonday);

            return lastMonday;
        },

        getLastWeekEnd : function () {
            var lastMonday = GetLastWeekStart();
            var lastSunday = lastMonday.add('days', 6);

            return lastSunday;
        },
		getNextMonthsStart : function (number) {
			var today = this.getToday();
			today.date(1);
			return today.add('month', number || 1);
		},
        adjustFormGroupCheckTemplate : function(html, attrs)
        {
        	var id = attrs.controlId,
        		input = html.find("input");

        	//checkbox is inside label
        	// adjust input tag
	    	if(input.length)
	    	{
				this.adjustFormGroupTemplateInput(input, attrs);
	    	}
        },
		adjustFormGroupTemplate: function(html, attrs, labelValue)
        {
        	var id = attrs.controlId,
        		label = html.find("label"),
        		input = html.find("input"),
        		select = html.find("select"),
        		textarea = html.find("textarea"),
        		rich = html.find("text-angular"),
        		btn = html.find("button");

        	// add for & content to label
        	label.attr("for", id);
			if(angular.isDefined(labelValue))
			{
				label.text(attrs.label || labelValue);
			}
			// adjust input tag
        	if(input.length)
        	{
				this.adjustFormGroupTemplateInput(input, attrs);
				input.attr('placeholder', attrs.placeholder);
        	}
        	if(textarea.length)
        	{
				this.adjustFormGroupTemplateInput(textarea, attrs);
				input.attr('placeholder', attrs.placeholder);
        	}
        	if(rich.length)
        	{
				this.adjustFormGroupTemplateInput(rich, attrs);
				input.attr('placeholder', attrs.placeholder);
			}
        	if(select.length)
        	{
				this.adjustFormGroupTemplateInput(select, attrs);
        	}
        	if(btn.length)
        	{
				this.adjustFormGroupTemplateInput(btn, attrs);
        		btn.attr("id", id+"-btn");
        	}
        },
		disabledExpression: function(attrs)
		{
			var disabled;
			if(angular.isDefined(attrs.readonly))
			{
				disabled = attrs.readonly;
			}
			if(angular.isDefined(attrs.disableExpression))
			{
				if(disabled)
				{
					disabled += ' || (' + attrs.disableExpression + ')';
				}
				else
				{
					disabled = attrs.disableExpression;
				}
			}
            if(angular.isDefined(attrs.enableExpression))
            {
                if(disabled)
                {
                    disabled += ' || !(' + attrs.enableExpression + ')';
                }
                else
                {
                    disabled = '!(' + attrs.enableExpression + ')';
                }
            }
            if(angular.isDefined(attrs.apishoreEnableExpression))
            {
                disabled = disabled ? disabled + ' || ' : '';
                disabled += '!(' + attrs.apishoreEnableExpression + ')';
            }
			return disabled;
		},
		adjustFormGroupTemplateInput: function(input, attrs)
		{
			input.attr("id", attrs.controlId);
			input.attr("name", attrs.controlId);
			input.attr('ng-readonly', attrs.readonly);
			var disabled = this.disabledExpression(attrs);
			if(disabled)
			{
				input.attr("ng-disabled", disabled);
				if(angular.isDefined(attrs.disabledValue))
				{
					input.attr("apishore-disabled-value", attrs.disabledValue);
				}
				if(angular.isDefined(attrs.required))
				{
					input.attr('ng-required', attrs.required + ' && !(' + disabled + ')');
				}
			}
			else if(angular.isDefined(attrs.required))
			{
				input.attr('ng-required', attrs.required);
			}
			if(angular.isDefined(attrs.confirmationOf))
			{
				input.attr('apishore-confirmation-of', attrs.confirmationOf);
			}
		},

		applyUniqueFunction: function($scope, attrs)
		{
			var f = attrs.uniqueFunction && $scope.$parent[attrs.uniqueFunction];
			if (f)
			{
				$scope.formField.$parsers.push(function (value) {
					var result = value && f(value);
					if (result && result.then) {
						result.then(function (data) { //For promise type result object
							$scope.formField.$setValidity('unique', data.data);
						}, function (error) {
							$scope.formField.$setValidity('unique', false);
						});
					}
					return value;
				});
			}

		},
		workflowRead: function (url, item, callback, errors)
		{
			if (item && item.id)
			{
				url += item.id;
			}
			var promise = $http.get(url).success(function (res)
			{
				if(angular.isDefined(callback))
				{
					callback(res);
				}
			});
			if (errors) promise.error(errors);
		},
		workflowCreate: function (url, item, callback, errors)
		{
			if (item && item.id)
			{
				url += item.id;
			}
			var promise = $http.post(url, item).success(function (res)
			{
				if(angular.isDefined(callback))
				{
					callback(res);
				}
			});
			if (errors) promise.error(errors);
		},
		workflowUpdate: function (url, item, callback, errors)
		{
			if (item && item.id)
			{
				url += item.id;
			}
			var promise = $http.put(url, item).success(function (res)
			{
				if(angular.isDefined(callback))
				{
					callback(res);
				}
			});
			if (errors) promise.error(errors);
		},
		workflowDelete: function (url, item, callback, errors)
		{
			if (item && item.id)
			{
				url += item.id;
			}
			var promise = $http.delete(url).success(function (res)
			{
				if(angular.isDefined(callback))
				{
					callback(res);
				}
			});
			if (errors) promise.error(errors);
        },
        firstInOthers: function()
        {
            if(arguments.length < 2)
            {
                return false;
            }
            var first = arguments[0];
            for(var i = 1; i < arguments.length; i++)
            {
                if(first == arguments[i])
                {
                    return true;
                }
            }
            return false;
        },
        createInputScope: function(elem, attrs, label, defaultValue)
        {
            this.adjustFormGroupTemplate(elem, attrs, label);
            return {
                post: function($scope, elem, attrs, formCtrl)
                {
                    // console.log(name + ': post link'+formCtrl);
                    $scope.formField = formCtrl[attrs.controlId];
                    $scope.form = formCtrl;
                    if(angular.isDefined(defaultValue) && angular.isDefined(attrs.creationTime))
                    {
                        $scope.model = defaultValue;
                    }
                    $scope.onSuggestion = function(value, label)
                    {
                        $scope.model = value;
                        if(angular.isDefined(attrs.pullSuggestionLabelTo))
                        {
                            $scope.itemData.data[attrs.pullSuggestionLabelTo] = label;
                        }
                    };
                    utils.applyUniqueFunction($scope, attrs);
                }
            };
        },
        createInputRangeScope: function(elem, attrs, label, defaultMin, defaultMax)
        {
            this.adjustFormGroupTemplate(elem, attrs, label);
            return {
                post: function($scope, elem, attrs, formCtrl)
                {
                    // console.log(name + ': post link'+formCtrl);
                    $scope.formField = formCtrl[attrs.controlId];
                    $scope.form = formCtrl;
                    if(angular.isDefined(attrs.creationTime))
                    {
                        $scope.model = {};
                        if(angular.isDefined(defaultMin) || angular.isDefined(defaultMax))
                        {
                            $scope.model.min = defaultMin;
                            $scope.model.max = defaultMax;
                        }
                    }
                    $scope.onSuggestion = function(value, label)
                    {
                        $scope.model = value;
                        if(angular.isDefined(attrs.pullSuggestionLabelTo))
                        {
                            $scope.itemData.data[attrs.pullSuggestionLabelTo] = label;
                        }
                    };
                    utils.applyUniqueFunction($scope, attrs);
                }
            };
        },
//        pageFunctions: function($scope)
//        {
//            $scope.setPage = function(p)
//            {
//                var q = $scope.query;
//                q.offset = p.offset;
//                $scope.selectAll();
//            };
//            $scope.prevPage = function()
//            {
//                var q = $scope.query;
//                if(q.offset < $scope.pagination.pageSize)
//                {
//                    return;
//                }
//                q.offset = q.offset-$scope.pagination.pageSize;
//                $scope.selectAll();
//            };
//            $scope.nextPage = function()
//            {
//                var q = $scope.query;
//                if(q.offset + $scope.pagination.pageSize > $scope.pagination.totalItems)
//                {
//                    return;
//                }
//                q.offset = q.offset+$scope.pagination.pageSize;
//                $scope.selectAll();
//            };
//        },
        selectByParent: function selectByParent(query, structure, subParentName, subParent, parentName, parent)
        {
            var url = '/api/';
            if (parent)
            {
                url += parentName+'/'+parent+'/';
            }
            if (subParent)
            {
                url += subParentName+'/'+subParent+'/';
            }
            url += structure+'/';
            return select(query, url)
        },
        select: function select(query, url)
        {
            query = query || {};

            var config = {};
            config.method = 'GET';
            config.url = url;
            config.url += '/{{xml.name}}';
            config.params = {};
            if(query.query)
            {
                config.params.query = query.query;
            }
            if(query.limit)
            {
                config.params.limit = query.limit;
            }
            if(query.offset)
            {
                config.params.offset = query.offset;
            }
            if(query.sortField)
            {
                config.params.sort = query.sortField;
            }
            if(query.sortDirection)
            {
                config.params.dir = query.sortDirection;
            }
            if(query.typeahead)
            {
                config.params.typeahead = query.typeahead;
            }
            if(query.unique)
            {
                config.params.unique = query.unique;
            }
            if(query.filters)
            {
                config.params.filters = query.filters;
            }
            return $http(config);
        }
	};
});

String.prototype.countCharacters=function(c) {
    var result = 0, i = 0;
    for(i;i<this.length;i++)if(this[i]==c)result++;
    return result;
};

var docs = angular.module('docs', [
    //core
    'ngAnimate',
    'ngSanitize',
    'ui.router',
    'ct.ui.router.extras.sticky',
    'ct.ui.router.extras.dsr',
    'ct.ui.router.extras.statevis',
    'ui.bootstrap',
    'textAngular',
    'ngCookies',
    //opt
    'ui.mask',
    'textAngular',
    'timer',
    'ngTable',
    'ngTouch',
    'angularSpinner',
    'ui.codemirror',
//    'agGrid',
    //ga
    //'angulartics',
    //'angulartics.google.analytics',
    //highlight
    //'hljs',
    //app
    //'angular-inview',
    'chart.js',
//    'demo-generic-api',
//    'demo-generic-ui',
    'apishore'
]);
docs.config([ 'ChartJsProvider', function(ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
        colours : [ '#FF5252', '#FF8A80' ],
        responsive : false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
        datasetFill : false
    });
} ]);
docs.run([ '$rootScope', '$state', '$stateParams','$location','$anchorScroll','apishoreAuth','$timeout',
    function($rootScope, $state, $stateParams, $location, $anchorScroll, apishoreAuth, $timeout) {

        // It's very handy to add references to $state and $stateParams to
        // the $rootScope
        // so that you can access them from any scope within your
        // applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will
        // set the <li>
        // to active whenever 'contacts.list' or one of its decendents is
        // active.
        window.scrollTo(0,1);
        var defaultSidebarShow = false;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.stateParams = $stateParams;
        //sidebar
        $rootScope.sidebar = {show:defaultSidebarShow, topMenu:false};
        $rootScope.sidebar.toggle = function()
        {
            $rootScope.sidebar.show = !$rootScope.sidebar.show;
        };
        $rootScope.sidebar.on = function()
        {
            $rootScope.sidebar.show = true;
            console.log("sidebar.on");
        };
        //sidebar
        $rootScope.interactiveHelp = {show:false};
        $rootScope.interactiveHelp.toggle = function()
        {
            $rootScope.interactiveHelp.show = !$rootScope.interactiveHelp.show;
        };
        $rootScope.codemirror = {
    			xml: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'xml',
    		    },
    		    javascript: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'javascript',
    		    },
    		    java: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: {
    		        	name: 'clike',
    		        	keywords : {
    		        		'class' : '',
    		        		'enum' : '',
    		        		'public' : '',
    		        		'protected' : '',
    		        		'private' : '',
    		        		'final' : '',
    		        		'static' : '',
    		        		'extends' : '',
    		        		'boolean' : '',
    		        		'byte' : '',
    		        		'short' : '',
    		        		'char' : '',
    		        		'int' : '',
    		        		'float' : '',
    		        		'long' : '',
    		        		'double' : '',
    		        		'if' : '',
    		        		'else' : '',
    		        		'do' : '',
    		        		'while' : '',
    		        		'for' : '',
    		        		'return' : '',
    		        		'new' : '',
    		        		'null' : '',
    		        		'super' : '',
    		        		'switch' : '',
    		        		'case' : '',
    		        		'default' : '',
    		        		'try' : '',
    		        		'catch' : '',
    		        		'finally' : '',
    		        		'this' : '',
    		        	}
    		        }
    		    },
    		    css: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'text/x-scss',
    		    },
    		    scss: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'text/x-scss',
    		    },
    		    html: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'htmlmixed',
    		    },
    		
    		}
        window.apishoreQA.angularIsloaded = true;
        $(".as-app-loader").remove();

        function clearSelection() {
            console.info("clear selection")
            if(document.selection && document.selection.empty) {
                document.selection.empty();
            } else if(window.getSelection) {
                var sel = window.getSelection();
                sel.removeAllRanges();
            }
        }

        $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
            $rootScope.interactiveHelp.show = false;
            $(".as-app-loader").remove();
            if(toState.defaultChild)
            {
                $state.go(toState.name+'.'+toState.defaultChild);
            }
            else
            {
                $anchorScroll(0);
                $rootScope.sidebar.show = defaultSidebarShow;
                $rootScope.sidebar.topMenu = false;
                clearSelection();
                $timeout(function(){window.apishoreQA.stateIsLoaded = true;});
                //TODO: Hack
                if(toState.name.indexOf("wild.info") > 0 )
                {
                    $rootScope.infoPanel.on();
                }
            }
        });
        $rootScope.$on("$stateNotFound", function(event, unfoundState, fromState, fromParams) {
            event.preventDefault();
            $rootScope.sidebar.show = false;
            $location.path('/root');
            $state.go('error.unknown');
        });
        $rootScope.$on("$stateChangeError", console.error.bind(console));
    } ]);


docs.directive("sample", function(apishoreAuth, $rootScope, $http, $state) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{},
		templateUrl : window.apishoreConfig.webappRoot + "/js/app/sample.html",
        link : function($scope, $element)
        {
        	$scope.codemirror = $rootScope.codemirror;
        	var html = $element.find(".sample").html();
        	$scope.code = html;
        }
	};
});

docs.directive("apishoreShiftMenuTop", function(apishoreAuth, $rootScope, $http, $state) {

	return {
		restrict : 'E',
		replace : true,
		scope:{},
		templateUrl : window.apishoreConfig.webappRoot + "/js/app/sidebar-top-menu.html",
        link : function($scope) {
        }
	};
});


docs.config([
		"$stateProvider",
		"$stickyStateProvider",
		"$urlRouterProvider",
		"$locationProvider",
		"apishoreStateTemplateUrlProvider",
		function($stateProvider, $stickyStateProvider, $urlRouterProvider, $locationProvider, apishoreStateTemplateUrlProvider) {
			console.info('configure ui-routing');
			//$stickyStateProvider.enableDebug(true);
			//$locationProvider.html5Mode(true);
			function apishoreStateTemplateUrl(name, url)
			{
				return function()
				{
					return apishoreStateTemplateUrlProvider.$get()(name, url);
				}
			}

			$urlRouterProvider.when('', '/docs');
			$urlRouterProvider.when('/', '/docs');

			//
			$stateProvider.state('root', {
				url : "/docs",
				templateUrl : window.apishoreConfig.webappRoot+'/root.html',
				defaultChild: "introduction",
				data: {breadcrumbTitle : 'ACSS'}
			});
			$stateProvider.state('root.introduction', {
				url : "/introduction",
				templateUrl : window.apishoreConfig.webappRoot+'/introduction.html',
				data: {breadcrumbTitle : 'Introduction'}
			});
			$stateProvider.state('root.structure', {
				url : "/structure",
				templateUrl : window.apishoreConfig.webappRoot+'/structure.html',
				data: {breadcrumbTitle : 'Framework structure'}
			});
			$stateProvider.state('root.core', {
				url : "/core-modules",
				defaultChild: "normalize",
				template : '<div ui-view></div>',
				data: {breadcrumbTitle : 'Core modules'}
			});
			$stateProvider.state('root.core.normalize', {
				url : "/normalize",
				templateUrl : window.apishoreConfig.webappRoot+'/core-modules/normalize.html',
				data: {breadcrumbTitle : 'Normalize'}
			});
			$stateProvider.state('root.core.palette', {
				url : "/palette",
				templateUrl : window.apishoreConfig.webappRoot+'/core-modules/palette.html',
				data: {breadcrumbTitle : 'Material palettes'}
			});
			$stateProvider.state('root.modules', {
				url : "/modules",
				defaultChild: "box",
				template : '<div ui-view></div>',
				data: {breadcrumbTitle : 'Modules'}
			});
			$stateProvider.state('root.modules.box', {
				url : "/box",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/box.html',
				data: {breadcrumbTitle : 'Box'}
			});
			$stateProvider.state('root.modules.floating', {
				url : "/floating",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/floating.html',
				data: {breadcrumbTitle : 'floating'}
			});
			$stateProvider.state('root.modules.gridsystem', {
				url : "/grid-system",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/grid-system.html',
				data: {breadcrumbTitle : 'grid-system'}
			});
			$stateProvider.state('root.modules.gutter', {
				url : "/gutter",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/gutter.html',
				data: {breadcrumbTitle : 'gutter'}
			});
			$stateProvider.state('root.modules.responsive', {
				url : "/responsive",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/responsive.html',
				data: {breadcrumbTitle : 'responsive'}
			});
			$stateProvider.state('root.modules.scrollable', {
				url : "/scrollable",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/scrollable.html',
				data: {breadcrumbTitle : 'scrollable'}
			});
			//TYPOGRAPHY
			$stateProvider.state('root.modules.text_panel', {
				url : "/text-panel",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/text-panel.html',
				data: {breadcrumbTitle : 'Text panel'}
			});
			$stateProvider.state('root.modules.text_align', {
				url : "/text-align",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/text-align.html',
				data: {breadcrumbTitle : 'Text alignment'}
			});
			$stateProvider.state('root.modules.typography', {
				url : "/typography",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/typography.html',
				data: {breadcrumbTitle : 'Typography'}
			});

			$stateProvider.state('root.modules.panel', {
				url : "/panel",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/panel.html',
				data: {breadcrumbTitle : 'scrollable'}
			});
			$stateProvider.state('root.modules.table_basic', {
				url : "/table-basic",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/table/table-basic.html',
				data: {breadcrumbTitle : 'Table: Basic'}
			});
			$stateProvider.state('root.modules.table_data', {
				url : "/table-data",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/table/table-data.html',
				data: {breadcrumbTitle : 'Table: Data'}
			});

//
//			//redirects
			$urlRouterProvider.otherwise('/docs');
		} ]);

