import requestAnimationFrame from './helpers/request-animation-frame';
import throttle from 'lodash.throttle';

const getIntersectionObserverConfig = (customConfig = {}) => {
    return {
        root: null,
        rootMargin: '35%',
        threshold: 0,
        ...customConfig
    };
};

const intersectionObserverExists = () => {
    return (
        'IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window &&
        'intersectionRatio' in window.IntersectionObserverEntry.prototype
    );
};

const elementFromPoint = (x, y) => {
    return document.elementFromPoint(x, y);
};

const getRootElement = (rootElement) => {
    if (rootElement) {
        return rootElement;
    }

    return document.documentElement;
};

const isElementVisible = (rootElement, elementToObserve) => {
    const rect = elementToObserve.getBoundingClientRect();

    const viewportWidth = getRootElement(rootElement).clientWidth;
    const viewportHeight = getRootElement(rootElement).clientHeight;

    // Return false if it's not in the viewport
    if (
        rect.right < 0 ||
        rect.bottom < 0 ||
        rect.left > viewportWidth ||
        rect.top > viewportHeight
    ) {
        return false;
    }

    // Return true if any of its four corners are visible
    return (
        elementToObserve.contains(elementFromPoint(rect.left, rect.top)) ||
        elementToObserve.contains(elementFromPoint(rect.right, rect.top)) ||
        elementToObserve.contains(elementFromPoint(rect.right, rect.bottom)) ||
        elementToObserve.contains(elementFromPoint(rect.left, rect.bottom))
    );
};

const legacyIntersectAPI = (config) => {
    const intersectionConfig = getIntersectionObserverConfig(
        config.intersectionObserverConfig
    );
    const elementToObserve = config.toObserve;
    const rootElement = intersectionConfig.root;

    const eventHandler = throttle(
        (onLoad) => {
            requestAnimationFrame(() => {
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
        },
        16,
        {
            leading: true
        }
    );

    eventHandler(true);

    window.addEventListener('scroll', () => {
        eventHandler(false);
    });
    window.addEventListener('resize', () => {
        eventHandler(false);
    });
};

export default (config) => {
    const intersectionObserverConfig = {
        ...getIntersectionObserverConfig(config.intersectionObserverConfig)
    };

    if (intersectionObserverExists()) {
        const observer = new IntersectionObserver(
            (elements, observerInstance) => {
                elements.forEach((entry) => {
                    if (entry.isIntersecting) {
                        config.onEntry(entry);

                        if (config.triggerOnce) {
                            observerInstance.unobserve(config.toObserve);
                        }
                    } else {
                        config.onExit(entry);
                    }
                });
            },
            intersectionObserverConfig
        );

        observer.observe(config.toObserve);

        return;
    }

    legacyIntersectAPI(config);
};
