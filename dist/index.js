'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var intersectionObserverPolyfill = false;

var getIntersectionObserverConfig = function getIntersectionObserverConfig() {
    var customConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _extends({
        root: null,
        rootMargin: '35%',
        threshold: 0
    }, customConfig);
};

var onClient = function onClient() {
    return typeof window !== 'undefined';
};

exports.default = function (config) {
    if (onClient() && !intersectionObserverPolyfill) {
        intersectionObserverPolyfill = require('intersection-observer');
    }

    if (onClient()) {
        var intersectionObserverConfig = _extends({}, getIntersectionObserverConfig(config.intersectionObserverConfig));

        var hiddenState = false;
        var visibleState = false;

        var observer = new IntersectionObserver(function (elements, observerInstance) {
            elements.forEach(function (entry) {
                if (entry.isIntersecting && !visibleState) {
                    hiddenState = false;
                    visibleState = true;

                    if (config.onEntry) {
                        config.onEntry();
                    }

                    if (config.triggerOnce) {
                        observerInstance.unobserve(config.toObserve);
                    }
                } else {
                    if (!hiddenState) {
                        hiddenState = true;
                        visibleState = false;

                        if (config.onExit) {
                            config.onExit();
                        }
                    }
                }
            });
        }, intersectionObserverConfig);

        observer.observe(config.toObserve);
    }
};

module.exports = exports['default'];