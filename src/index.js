import requestAnimationFrame from './helpers/request-animation-frame';
import debounce from 'lodash.debounce';

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

const getRootElement = (rootElement) => {
    if (rootElement) {
        return rootElement;
    }

    return document.documentElement;
};

const isElementVisible = (rootElement, elementToObserve) => {
    const rect = elementToObserve.getBoundingClientRect();

    return (
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.left < getRootElement(rootElement).clientWidth &&
        rect.top < getRootElement(rootElement).clientHeight
    );
};

const legacyIntersectAPI = (config) => {
    const intersectionConfig = getIntersectionObserverConfig(
        config.intersectionObserverConfig
    );
    const elementToObserve = config.toObserve;
    const rootElement = intersectionConfig.root;

    const eventHandler = debounce((triggerOnce) => {
        requestAnimationFrame(() => {
            if (isElementVisible(rootElement, elementToObserve)) {
                config.onEntry();
                if (triggerOnce) {
                    window.removeEventListener('scroll', eventHandler);
                    window.removeEventListener('resize', eventHandler);
                }
            } else {
                config.onExit();
                if (triggerOnce) {
                    window.removeEventListener('scroll', eventHandler);
                    window.removeEventListener('resize', eventHandler);
                }
            }
        });
    }, 16);

    eventHandler(true);

    window.addEventListener('scroll', () => {
        eventHandler(config.triggerOnce);
    });

    window.addEventListener('resize', () => {
        eventHandler(config.triggerOnce);
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
