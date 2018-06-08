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

    const eventHandler = () => {
        /* eslint-disable-next-line no-use-before-define */
        debouncedIsVisibleHandler();
    };

    const debouncedIsVisibleHandler = debounce(() => {
        requestAnimationFrame(() => {
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

export default (config) => {
    const intersectionObserverConfig = {
        ...getIntersectionObserverConfig(config.intersectionObserverConfig)
    };

    let hidden = false;
    let visible = false;

    if (intersectionObserverExists()) {
        const observer = new IntersectionObserver(
            (elements, observerInstance) => {
                elements.forEach((entry) => {
                    if (entry.isIntersecting && !visible) {
                        
                        hidden = false;
                        visible = true;

                        config.onEntry(entry);
                        
                        if (config.triggerOnce) {
                            observerInstance.unobserve(config.toObserve);
                        }
                    } else {
                        if (!hidden) {
                            
                            hidden = true;
                            visible = false;

                            config.onExit(entry);
                        }
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
