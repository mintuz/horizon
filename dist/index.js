'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _requestAnimationFrame = require('./helpers/request-animation-frame');

var _requestAnimationFrame2 = _interopRequireDefault(_requestAnimationFrame);

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getIntersectionObserverConfig = function getIntersectionObserverConfig() {
    var customConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _extends({
        root: null,
        rootMargin: '35%',
        threshold: 0
    }, customConfig);
};

var intersectionObserverExists = function intersectionObserverExists() {
    return 'IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype;
};

var elementFromPoint = function elementFromPoint(x, y) {
    return document.elementFromPoint(x, y);
};

var getRootElement = function getRootElement(rootElement) {
    if (rootElement) {
        return rootElement;
    }

    return document.documentElement;
};

var isElementVisible = function isElementVisible(rootElement, elementToObserve) {
    var rect = elementToObserve.getBoundingClientRect();

    var viewportWidth = getRootElement(rootElement).clientWidth;
    var viewportHeight = getRootElement(rootElement).clientHeight;

    // Return false if it's not in the viewport
    if (rect.right < 0 || rect.bottom < 0 || rect.left > viewportWidth || rect.top > viewportHeight) {
        return false;
    }

    // Return true if any of its four corners are visible
    return elementToObserve.contains(elementFromPoint(rect.left, rect.top)) || elementToObserve.contains(elementFromPoint(rect.right, rect.top)) || elementToObserve.contains(elementFromPoint(rect.right, rect.bottom)) || elementToObserve.contains(elementFromPoint(rect.left, rect.bottom));
};

var legacyIntersectAPI = function legacyIntersectAPI(config) {
    var intersectionConfig = getIntersectionObserverConfig(config.intersectionObserverConfig);
    var elementToObserve = config.toObserve;
    var rootElement = intersectionConfig.root;

    var eventHandler = (0, _lodash2.default)(function (onLoad) {
        (0, _requestAnimationFrame2.default)(function () {
            if (isElementVisible(rootElement, elementToObserve)) {
                config.onEntry();
                if (!onLoad && config.triggerOnce) {
                    window.removeEventListener('scroll', eventHandler);
                    window.removeEventListener('resize', eventHandler);
                }
            } else {
                config.onExit();
                if (!onLoad && config.triggerOnce) {
                    window.removeEventListener('scroll', eventHandler);
                    window.removeEventListener('resize', eventHandler);
                }
            }
        });
    }, 16, {
        leading: true
    });

    eventHandler(true);

    window.addEventListener('scroll', function () {
        eventHandler(false);
    });
    window.addEventListener('resize', function () {
        eventHandler(false);
    });
};

exports.default = function (config) {
    var intersectionObserverConfig = _extends({}, getIntersectionObserverConfig(config.intersectionObserverConfig));

    if (intersectionObserverExists()) {
        var observer = new IntersectionObserver(function (elements, observerInstance) {
            elements.forEach(function (entry) {
                if (entry.isIntersecting) {
                    config.onEntry(entry);

                    if (config.triggerOnce) {
                        observerInstance.unobserve(config.toObserve);
                    }
                } else {
                    config.onExit(entry);
                }
            });
        }, intersectionObserverConfig);

        observer.observe(config.toObserve);

        return;
    }

    legacyIntersectAPI(config);
};

module.exports = exports['default'];