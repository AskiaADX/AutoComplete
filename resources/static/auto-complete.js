/*
    JavaScript autoComplete v1.0.4
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/JavaScript-autoComplete
    License: http://www.opensource.org/licenses/mit-license.php
*/

var autoComplete = (function () {
    // "use strict";
    function autoComplete(options) {
        if (!document.querySelector) return;

        // helpers
        function hasClass(el, className) { return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className); }

        function addEvent(elem, event, fn) {
            // allow the passing of an element id string instead of the DOM elem
            if (typeof elem === "string") {
                elem = document.getElementById(elem);
            }

            function listenHandler(e) {
                var ret = fn.apply(this, arguments);
                if (ret === false) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                return (ret);
            }

            function attachHandler() {
                // normalize the target of the event
                window.event.target = window.event.srcElement;
                // make sure the event is passed to the fn also so that works the same too
                // set the this pointer same as addEventListener when fn is called
                var ret = fn.call(elem, window.event);
                // support an optional return false to be cancel propagation and prevent default handling
                // like jQuery does
                if (ret === false) {
                    window.event.returnValue = false;
                    window.event.cancelBubble = true;
                }
                return (ret);
            }

            if (elem.addEventListener) {
                elem.addEventListener(event, listenHandler, false);
            } else {
                elem.attachEvent("on" + event, attachHandler);
            }
        }
        function removeEvent(el, type, handler) {
            // if (el.removeEventListener) not working in IE11
            if (el.detachEvent) el.detachEvent('on' + type, handler); else el.removeEventListener(type, handler);
        }

        function live(elClass, event, cb, context) {
            addEvent(context || document, event, function (e) {
                var found, el = e.target || e.srcElement;
                while (el && !(found = hasClass(el, elClass))) el = el.parentElement;
                if (found) cb.call(el, e);
            });
        }

        function updateValue() {
            if (o.questionType === 'single') {
                if (o.responseInList != 1) {
                    document.getElementById(o.inputIds[0].toString()).value = that.value;
                } else {
                    document.getElementById(o.inputIds[0].toString()).value = '';
                }
            } else {
                for (i = 0; n = o.inputIds.length, i < n; i++) {
                    if (o.dataFields()[i] == o.searchField && o.responseInList != 1) {
                        document.getElementById(o.inputIds[i].toString()).value = that.value;
                    } else {
                        document.getElementById(o.inputIds[i].toString()).value = '';
                    }
                }
            }
        }

        var o = {
            selector: 0,
            source: 0,
            minChars: 2,
            delay: 300,
            offsetLeft: 0,
            offsetTop: 1,
            cache: 1,
            menuClass: '',
            dataFields: [],
            searchField: '',
            useDatabase: '',
            databaseName: '',
            responseInList: 1,
            searchSeparator: '+',
            currentQuestion: '',
            noMatchFound: '',
            inputIds: [],
            renderItem: function (item, search, fullItem) {
                // escape special characters
                search = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$]/g, '\\$&');
                var excapedSearchSeparator = o.searchSeparator.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$]/g, "\\$&");
                var splitRegExp = new RegExp(" |" + excapedSearchSeparator, "gi");
                var re = new RegExp(search.split(splitRegExp).join('|').replace(/\\\|/gi, "|"), "gi");
                return '<div class="autocomplete-suggestion" data-val="' + item + '" data-fullval="' + fullItem + '">' + item.toString().replace(re, function (x) { return "<b>" + x + "</b>"; }) + '</div>';
            },
            onSelect: function (e, term, item) {
                var obj = JSON.parse(item.getAttribute('data-fullval').replace(/%/g, "\""));

                if (o.questionType === 'single') {
                    document.getElementById(obj.inputName).value = obj.inputValue;
                    var event = document.createEvent('HTMLEvents');
                    event.initEvent('autocomplete', true, false);
                    document.getElementById(obj.inputName).dispatchEvent(event);
                } else {
                    var i = 0;
                    for (var key in obj) {
                        var attrValue = obj[key];
                        document.getElementById(o.inputIds[i].toString()).value = attrValue.toString();
                        var event = document.createEvent('HTMLEvents');
                        event.initEvent('autocomplete', true, false);
                        document.getElementById(o.inputIds[i].toString()).dispatchEvent(event);
                        i++;
                    }
                }

                if (window.askia
                    && window.arrLiveRoutingShortcut
                    && window.arrLiveRoutingShortcut.length > 0
                    && window.arrLiveRoutingShortcut.indexOf(o.currentQuestion) >= 0) {
                    askia.triggerAnswer();
                }
            }
        };
        for (var k in options) { if (options.hasOwnProperty(k)) o[k] = options[k]; }

        // init
        var elems = typeof o.selector == 'object' ? [o.selector] : document.querySelectorAll(o.selector);
        for (var i = 0; n = elems.length, i < n; i++) {
            var that = elems[i];

            // create suggestions container "sc"
            that.sc = document.createElement('div');
            that.sc.className = 'autocomplete-suggestions ' + o.menuClass;

            that.autocompleteAttr = that.getAttribute('autocomplete');
            that.setAttribute('autocomplete', 'off');
            that.cache = {};
            that.fullCache = {};
            that.last_val = that.value || '';
            that.nchild = 0;

            that.updateSC = function (resize, next) {
                var rect = that.getBoundingClientRect();
                that.sc.style.left = Math.round(rect.left + (window.pageXOffset || document.documentElement.scrollLeft) + o.offsetLeft) + 'px';
                that.sc.style.top = Math.round(rect.bottom + (window.pageYOffset || document.documentElement.scrollTop) + o.offsetTop) + 'px';
                that.sc.style.width = Math.round(rect.right - rect.left) + 'px'; // outerWidth
                if (!resize) {
                    that.sc.style.display = 'block';
                    if (!that.sc.maxHeight) { that.sc.maxHeight = parseInt((window.getComputedStyle ? getComputedStyle(that.sc, null) : that.sc.currentStyle).maxHeight); }
                    if (!that.sc.suggestionHeight) that.sc.suggestionHeight = that.sc.querySelector('.autocomplete-suggestion').offsetHeight;
                    if (that.sc.suggestionHeight)
                        if (!next) that.sc.scrollTop = 0;
                        else {
                            var scrTop = that.sc.scrollTop, selTop = next.getBoundingClientRect().top - that.sc.getBoundingClientRect().top;
                            if (selTop + that.sc.suggestionHeight - that.sc.maxHeight > 0)
                                that.sc.scrollTop = selTop + that.sc.suggestionHeight + scrTop - that.sc.maxHeight;
                            else if (selTop < 0)
                                that.sc.scrollTop = selTop + scrTop;
                        }
                }
            };
            addEvent(window, 'resize', that.updateSC);
            document.body.appendChild(that.sc);

            live('autocomplete-suggestion', 'mouseleave', function (e) {
                var sel = that.sc.querySelector('.autocomplete-suggestion.selected');
                if (sel) setTimeout(function () { sel.className = sel.className.replace('selected', ''); }, 20);
                that.value = that.last_val;
            }, that.sc);

            live('autocomplete-suggestion', 'mouseover', function (e) {
                var sel = that.sc.querySelector('.autocomplete-suggestion.selected');
                if (sel) sel.className = sel.className.replace('selected', '');
                this.className += ' selected';

                var selectOnHover = window.value;
                if (selectOnHover == "yes") {
                    that.value = this.getAttribute('data-val');
                }
            }, that.sc);

            live('autocomplete-suggestion', 'mousedown', function (e) {
                if (hasClass(this, 'autocomplete-suggestion')) { // else outside click
                    var v = this.getAttribute('data-val');
                    that.value = v;
                    that.last_val = v;
                    that.nchild = 1;
                    o.onSelect(e, v, this);
                    that.sc.style.display = 'none';
                }
            }, that.sc);

            that.blurHandler = function () {
                var over_sb = (document.querySelector('.autocomplete-suggestions:hover')) ? document.querySelector('.autocomplete-suggestions:hover') : 0;
                if (!over_sb) {
                    that.value = that.last_val;
                    that.sc.style.display = 'none';
                    setTimeout(function () { that.sc.style.display = 'none'; }, 350); // hide suggestions on fast input
                } else if (that !== document.activeElement) setTimeout(function () { that.focus(); }, 20);
            };
            addEvent(that, 'blur', that.blurHandler);

            var suggest = function (data, fullData) {
                var val = that.value;
                var nItem = 0;
                that.cache[val] = data;
                that.fullCache[val] = fullData;
                if (data.length && val.length >= o.minChars) {
                    var s = '';
                    for (var i = 0; n = data.length, i < n; i++) {
                        s += o.renderItem(data[i], val, fullData[i]);
                        nItem++;
                    }
                    that.sc.innerHTML = s;
                    that.updateSC(0);
                    that.nchild = nItem;
                    document.querySelector('#adc_' + that.id.replace("adc_", "").replace("_input", "") + ' .nomatch').innerHTML = '';
                } else {
                    that.sc.style.display = 'none';
                    document.querySelector('#adc_' + that.id.replace("adc_", "").replace("_input", "") + ' .nomatch').innerHTML = o.noMatchFound;
                }
            };

            that.keydownHandler = function (e) {
                var key = window.event ? e.keyCode : e.which;
                var sel = that.sc.querySelector('.autocomplete-suggestion.selected');
                // down (40), up (38)
                if ((key == 40 || key == 38) && that.sc.innerHTML) {
                    var next;
                    if (!sel) {
                        next = (key == 40) ? that.sc.querySelector('.autocomplete-suggestion') : that.sc.childNodes[that.sc.childNodes.length - 1]; // first : last
                        next.className += ' selected';
                        that.value = next.getAttribute('data-val');
                    } else {
                        next = (key == 40) ? sel.nextSibling : sel.previousSibling;
                        if (next) {
                            sel.className = sel.className.replace(' selected', '');
                            next.className += ' selected';
                            that.value = next.getAttribute('data-val');
                        }
                        else { sel.className = sel.className.replace(' selected', ''); that.value = that.last_val; next = 0; }
                    }
                    that.updateSC(0, next);
                    return false;
                }
                // esc
                else if (key == 27) { that.value = that.last_val; that.sc.style.display = 'none'; }
                // enter
                else if (key == 13) {
                    if (sel && that.sc.style.display != 'none') { o.onSelect(e, sel.getAttribute('data-val'), sel); that.last_val = sel.getAttribute('data-val'); that.nchild = 1; setTimeout(function () { that.sc.style.display = 'none'; }, 20); }
                    return false;
                }
            };
            addEvent(that, 'keydown', that.keydownHandler);

            that.keyupHandler = function (e) {
                var key = window.event ? e.keyCode : e.which;
                if (that.value != that.last_val && key != 13 && (key > 40 || key < 37)) {
                    updateValue();
                }
                if (!key || (key < 35 || key > 40) && key != 13 && key != 27) {
                    var val = that.value;
                    if (val.length >= o.minChars) {
                        //if (val != that.last_val) {
                        that.last_val = val;
                        clearTimeout(that.timer);
                        if (o.cache) {
                            if (val in that.cache) { suggest(that.cache[val], that.fullCache[val]); return; }
                            // no requests if previous suggestions were empty
                            for (var i = 1; n = val.length - o.minChars, i < n; i++) {
                                var part = val.slice(0, val.length - i);
                                if (part in that.cache && !that.cache[part].length) { suggest([], []); return; }
                            }
                        }
                        that.timer = setTimeout(function () { o.source(val, suggest); }, o.delay);
                        //}
                    } else {
                        if (key != 13) that.last_val = val;
                        that.sc.style.display = 'none';
                        document.querySelector('#adc_' + that.id.replace("adc_", "").replace("_input", "") + ' .nomatch').innerHTML = '';
                    }
                }
            };
            addEvent(that, 'keyup', that.keyupHandler);

            that.focusHandler = function (e) {
                if (that.nchild > 1) that.keyupHandler(e);
            };
            //if (!o.minChars)
            addEvent(that, 'focus', that.focusHandler);
        }

        // public destroy method
        this.destroy = function () {
            for (var i = 0; n = elems.length, i < n; i++) {
                var that = elems[i];
                removeEvent(window, 'resize', that.updateSC);
                removeEvent(that, 'blur', that.blurHandler);
                removeEvent(that, 'focus', that.focusHandler);
                removeEvent(that, 'keydown', that.keydownHandler);
                removeEvent(that, 'keyup', that.keyupHandler);
                if (that.autocompleteAttr)
                    that.setAttribute('autocomplete', that.autocompleteAttr);
                else
                    that.removeAttribute('autocomplete');
                document.body.removeChild(that.sc);
                that = null;
            }
        };
    }
    return autoComplete;
})();

(function () {
    if (typeof define === 'function' && define.amd)
        define('autoComplete', function () { return autoComplete; });
    else if (typeof module !== 'undefined' && module.exports)
        module.exports = autoComplete;
    else
        autoComplete.databases = {};
    window.autoComplete = autoComplete;
})();
