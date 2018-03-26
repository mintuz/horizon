const getRequestAnimationFrameFallback = (callback) => {
    window.setTimeout(callback, 1000 / 60);
};

export default (callback) => {
    const requestAnimationFrameInstance =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame;

    if (requestAnimationFrameInstance) {
        requestAnimationFrameInstance(() => {
            requestAnimationFrameInstance(callback);
        });
    }

    getRequestAnimationFrameFallback(callback);
};
