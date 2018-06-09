let intersectionObserverPolyfill = false;

const getIntersectionObserverConfig = (customConfig = {}) => {
    return {
        root: null,
        rootMargin: '35%',
        threshold: 0,
        ...customConfig
    };
};

const onClient = () => {
    return typeof window !== 'undefined';
};

export default (config) => {
    /* istanbul ignore if */
    if (!onClient()) {
        return false;
    }

    if (!intersectionObserverPolyfill) {
        intersectionObserverPolyfill = require('intersection-observer');
    }

    const intersectionObserverConfig = {
        ...getIntersectionObserverConfig(config.intersectionObserverConfig)
    };

    let hiddenState = false;
    let visibleState = false;

    const observer = new IntersectionObserver((elements, observerInstance) => {
        elements.forEach((entry) => {
            if (entry.isIntersecting) {
                if (!visibleState) {
                    hiddenState = false;
                    visibleState = true;

                    if (config.onEntry) {
                        config.onEntry();
                    }

                    if (config.triggerOnce) {
                        observerInstance.unobserve(config.toObserve);
                    }
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

    return true;
};
