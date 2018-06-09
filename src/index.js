import requestAnimationFrame from "./helpers/request-animation-frame";
import debounce from "lodash.debounce";

const getIntersectionObserverConfig = (customConfig = {}) => {
  return {
    root: null,
    rootMargin: "35%",
    threshold: 0,
    ...customConfig
  };
};

const intersectionObserverExists = () => {
  return (
    "IntersectionObserver" in window &&
    "IntersectionObserverEntry" in window &&
    "intersectionRatio" in window.IntersectionObserverEntry.prototype
  );
};

const getRootElement = rootElement => {
  if (rootElement) {
    return rootElement;
  }

  return document.documentElement;
};

const isElementVisible = (rootElement, elementToObserve) => {
  const rootElementRect = rootElement.getBoundingClientRect();
  const elementRect = elementToObserve.getBoundingClientRect();

  const { top, right, bottom, left, width, height } = elementRect;

  const intersection = {
    top: bottom,
    right: rootElementRect.width - left,
    bottom: rootElementRect.height - top,
    left: right
  };

  const offset = 0;
  const threshold = 0;

  const elementThreshold = {
    x: threshold * width,
    y: threshold * height
  };

  return (
    intersection.top >= (offset.top || offset + elementThreshold.y) &&
    intersection.right >= (offset.right || offset + elementThreshold.x) &&
    intersection.bottom >= (offset.bottom || offset + elementThreshold.y) &&
    intersection.left >= (offset.left || offset + elementThreshold.x)
  );
};

const legacyIntersectAPI = config => {
  const intersectionConfig = getIntersectionObserverConfig(
    config.intersectionObserverConfig
  );
  const elementToObserve = config.toObserve;
  const rootElement = getRootElement(intersectionConfig.root);

  let hiddenState = false;
  let visibleState = false;

  const debouncedIsVisibleHandler = debounce(() => {
    requestAnimationFrame(() => {
      if (isElementVisible(rootElement, elementToObserve) && !visibleState) {
        hiddenState = false;
        visibleState = true;

        if (config.onEntry) {
          config.onEntry();
        }

        if (config.triggerOnce) {
          rootElement.removeEventListener("scroll", eventHandler);
          rootElement.removeEventListener("resize", eventHandler);
        }
      } else {
        if (!hiddenState && config.onExit) {
          config.onExit();
        }
      }
    });
  }, 16);

  const eventHandler = () => {
    /* eslint-disable-next-line no-use-before-define */
    debouncedIsVisibleHandler();
  };

  rootElement.addEventListener("scroll", eventHandler);
  rootElement.addEventListener("resize", eventHandler);

  debouncedIsVisibleHandler();
};

export default config => {
  const intersectionObserverConfig = {
    ...getIntersectionObserverConfig(config.intersectionObserverConfig)
  };

  let hiddenState = false;
  let visibleState = false;

  if (intersectionObserverExists()) {
    const observer = new IntersectionObserver((elements, observerInstance) => {
      elements.forEach(entry => {
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

    return;
  }

  legacyIntersectAPI(config);
};
