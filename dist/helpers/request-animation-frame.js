"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var getRequestAnimationFrameFallback = function getRequestAnimationFrameFallback(callback) {
    window.setTimeout(callback, 1000 / 60);
};

exports.default = function (callback) {
    var requestAnimationFrameInstance = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;

    if (requestAnimationFrameInstance) {
        requestAnimationFrameInstance(function () {
            requestAnimationFrameInstance(callback);
        });
    }

    getRequestAnimationFrameFallback(callback);
};

module.exports = exports["default"];