'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _requestAnimationFrame = require('./helpers/request-animation-frame');

var _requestAnimationFrame2 = _interopRequireDefault(_requestAnimationFrame);

var _lodash = require('lodash.debounce');

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

var getRootElement = function getRootElement(rootElement) {
    if (rootElement) {
        return rootElement;
    }

    return document.documentElement;
};

var isElementVisible = function isElementVisible(rootElement, elementToObserve) {
    var rect = elementToObserve.getBoundingClientRect();

    return rect.bottom > 0 && rect.right > 0 && rect.left < getRootElement(rootElement).clientWidth && rect.top < getRootElement(rootElement).clientHeight;
};

var legacyIntersectAPI = function legacyIntersectAPI(config) {
    var intersectionConfig = getIntersectionObserverConfig(config.intersectionObserverConfig);
    var elementToObserve = config.toObserve;
    var rootElement = intersectionConfig.root;

    var eventHandler = function eventHandler() {
        /* eslint-disable-next-line no-use-before-define */
        debouncedIsVisibleHandler();
    };

    var debouncedIsVisibleHandler = (0, _lodash2.default)(function () {
        (0, _requestAnimationFrame2.default)(function () {
            if (isElementVisible(rootElement, elementToObserve)) {
                config.onEntry();
                if (config.triggerOnce) {
                    window.removeEventListener('scroll', eventHandler);
                    window.removeEventListener('resize', eventHandler);
                }
            } else {
                config.onExit();
                if (config.triggerOnce) {
                    window.removeEventListener('scroll', eventHandler);
                    window.removeEventListener('resize', eventHandler);
                }
            }
        });
    }, 16);

    window.addEventListener('scroll', eventHandler);
    window.addEventListener('resize', eventHandler);

    eventHandler();
};

exports.default = function (config) {
    var intersectionObserverConfig = _extends({}, getIntersectionObserverConfig(config.intersectionObserverConfig));

    var hidden = false;
    var visible = false;

    if (intersectionObserverExists()) {
        var observer = new IntersectionObserver(function (elements, observerInstance) {
            elements.forEach(function (entry) {
                if (entry.isIntersecting && !visible) {
                    hidden = false;
                    visible = true;

                    config.onEntry();

                    if (config.triggerOnce) {
                        observerInstance.unobserve(config.toObserve);
                    }
                } else {
                    if (!hidden) {
                        hidden = true;
                        visible = false;

                        config.onExit();
                    }
                }
            });
        }, intersectionObserverConfig);

        observer.observe(config.toObserve);

        return;
    }

    legacyIntersectAPI(config);
};

module.exports = exports['default'];