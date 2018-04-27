jest.mock('lodash.debounce');

jest.mock('./helpers/request-animation-frame', () => {
    return jest.fn().mockImplementation((callback) => {
        callback();
    });
});

import debounce from 'lodash.debounce';
import Horizon from './';
import requestAnimationFrame from './helpers/request-animation-frame';

describe('Horizon', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="fake-body">
                <div class="fake-element">This is a fake DOM</div>
            </div>
        `;
    });

    describe('IntersectionObserver exists on DOM', () => {
        let elements;
        let unobserve;
        let observe;

        beforeEach(() => {
            elements = [];
            unobserve = jest.fn();
            observe = jest.fn();

            window.IntersectionObserver = jest.fn((callback) => {
                callback(elements, {
                    unobserve
                });

                return {
                    observe
                };
            });

            window.IntersectionObserverEntry = jest.fn();
            window.IntersectionObserverEntry.prototype.intersectionRatio = jest.fn();
        });

        afterEach(() => {
            elements = [];

            delete window.IntersectionObserver;
            delete window.IntersectionObserverEntry.prototype.intersectionRatio;
            delete window.IntersectionObserverEntry;

            observe.mockClear();
            unobserve.mockClear();
        });

        test('IntersectionObserver is called', () => {
            Horizon({
                onEntry: jest.fn(),
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: null,
                intersectionObserverConfig: {
                    rootMargin: '100%',
                    threshold: 1
                }
            });

            expect(IntersectionObserver.mock.calls.length).toEqual(1);
            expect(IntersectionObserver.mock.calls[0][1]).toEqual({
                root: null,
                rootMargin: '100%',
                threshold: 1
            });
        });

        test('Sensible defaults for intersection observer', () => {
            Horizon({
                onEntry: jest.fn(),
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: null
            });

            expect(IntersectionObserver.mock.calls.length).toEqual(1);
            expect(IntersectionObserver.mock.calls[0][1]).toEqual({
                root: null,
                rootMargin: '35%',
                threshold: 0
            });
        });

        test('callback is called and when triggerOnce is false unobserve is not called', () => {
            elements = [
                {
                    isIntersecting: true
                }
            ];

            const onEntry = jest.fn();

            Horizon({
                onEntry,
                onExit: jest.fn(),
                triggerOnce: false,
                toObserve: null,
                intersectionObserverConfig: {
                    root: null,
                    rootMargin: '35%',
                    threshold: 0
                }
            });

            expect(onEntry.mock.calls.length).toEqual(1);
            expect(unobserve.mock.calls.length).toEqual(0);
        });

        test('callback is called and when triggerOnce is true unobserve is called', () => {
            elements = [
                {
                    isIntersecting: true
                }
            ];

            const onEntry = jest.fn();

            Horizon({
                onEntry,
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: null,
                intersectionObserverConfig: {
                    root: null,
                    rootMargin: '35%',
                    threshold: 0
                }
            });

            expect(onEntry.mock.calls.length).toEqual(1);
            expect(unobserve.mock.calls.length).toEqual(1);
        });

        test('callback is not called when not intersecting', () => {
            elements = [
                {
                    isIntersecting: false
                }
            ];

            const onEntry = jest.fn();

            Horizon({
                onEntry,
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: null,
                intersectionObserverConfig: {
                    root: null,
                    rootMargin: '35%',
                    threshold: 0
                }
            });

            expect(onEntry.mock.calls.length).toEqual(0);
        });

        test('observe is called with the toOpserve option.', () => {
            elements = [
                {
                    isIntersecting: false
                }
            ];

            const onEntry = jest.fn();

            Horizon({
                onEntry,
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: 'toObserveValue',
                intersectionObserverConfig: {
                    root: null,
                    rootMargin: '35%',
                    threshold: 0
                }
            });

            expect(observe.mock.calls[0][0]).toEqual('toObserveValue');
        });
    });

    describe('Fallback', () => {
        const eventListners = {};

        document.elementFromPoint = jest.fn();

        window.addEventListener = jest.fn((eventName, cb) => {
            eventListners[eventName] = cb;
        });

        window.removeEventListener = jest.fn((eventName) => {
            delete eventListners[eventName];
        });

        beforeEach(() => {
            window.addEventListener.mockClear();
            window.removeEventListener.mockClear();
            debounce.mockClear();
            requestAnimationFrame.mockClear();
        });

        test('event handler is debounced', () => {
            Horizon({
                onEntry: jest.fn(),
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: document.querySelector('.fake-element'),
                intersectionObserverConfig: {
                    root: null,
                    rootMargin: '35%',
                    threshold: 0
                }
            });

            expect(debounce.mock.calls.length).toEqual(1);
        });

        test('requestAnimationFrame is called on load', () => {
            Horizon({
                onEntry: jest.fn(),
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: document.querySelector('.fake-element'),
                intersectionObserverConfig: {
                    root: null,
                    rootMargin: '35%',
                    threshold: 0
                }
            });

            expect(requestAnimationFrame.mock.calls.length).toEqual(1);
        });

        test('requestAnimationFrame is called on scroll', () => {
            Horizon({
                onEntry: jest.fn(),
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: document.querySelector('.fake-element'),
                intersectionObserverConfig: {
                    root: null,
                    rootMargin: '35%',
                    threshold: 0
                }
            });

            eventListners.scroll();

            expect(requestAnimationFrame.mock.calls.length).toEqual(2);
        });

        test('requestAnimationFrame is called on resize', () => {
            Horizon({
                onEntry: jest.fn(),
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: document.querySelector('.fake-element'),
                intersectionObserverConfig: {
                    root: null,
                    rootMargin: '35%',
                    threshold: 0
                }
            });

            eventListners.resize();

            expect(requestAnimationFrame.mock.calls.length).toEqual(2);
        });

        test('callback is not called when element is not visible', () => {
            const onEntry = jest.fn();

            Element.prototype.getBoundingClientRect = jest.fn(() => {
                return {
                    width: 100,
                    height: 100,
                    top: 50,
                    left: 50,
                    bottom: -50,
                    right: -50
                };
            });

            Horizon({
                onEntry,
                onExit: jest.fn(),
                triggerOnce: true,
                toObserve: document.querySelector('.fake-element'),
                intersectionObserverConfig: {
                    root: null,
                    rootMargin: '35%',
                    threshold: 0
                }
            });

            expect(onEntry.mock.calls.length).toEqual(0);
        });

        describe('Document root element', () => {
            test('callback not called if its not intersecting', () => {
                const onEntry = jest.fn();

                Element.prototype.getBoundingClientRect = jest.fn(() => {
                    return {
                        width: 100,
                        height: 100,
                        top: 50,
                        left: 50,
                        bottom: -50,
                        right: -50
                    };
                });

                Horizon({
                    onEntry,
                    onExit: jest.fn(),
                    triggerOnce: true,
                    toObserve: document.querySelector('.fake-element'),
                    intersectionObserverConfig: {
                        root: null,
                        rootMargin: '35%',
                        threshold: 0
                    }
                });

                expect(onEntry.mock.calls.length).toEqual(0);
            });

            test('callback is called if its intersecting', () => {
                Element.prototype.getBoundingClientRect = jest.fn(() => {
                    return {
                        width: 120,
                        height: 120,
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0
                    };
                });

                Element.prototype.contains = jest.fn(() => {
                    return true;
                });

                const onEntry = jest.fn();

                Horizon({
                    onEntry,
                    onExit: jest.fn(),
                    triggerOnce: true,
                    toObserve: document.querySelector('.fake-element'),
                    intersectionObserverConfig: {
                        root: null,
                        rootMargin: '35%',
                        threshold: 0
                    }
                });

                expect(onEntry.mock.calls.length).toEqual(1);
            });

            test('event handlers are not removed if triggerOnce is false', () => {
                Element.prototype.getBoundingClientRect = jest.fn(() => {
                    return {
                        width: 120,
                        height: 120,
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0
                    };
                });

                Element.prototype.contains = jest.fn(() => {
                    return true;
                });

                Horizon({
                    onEntry: jest.fn(),
                    onExit: jest.fn(),
                    triggerOnce: false,
                    toObserve: document.querySelector('.fake-element'),
                    intersectionObserverConfig: {
                        root: null,
                        rootMargin: '35%',
                        threshold: 0
                    }
                });

                expect(window.removeEventListener.mock.calls.length).toEqual(0);
            });

            test('event handlers are removed if triggerOnce is true', () => {
                Element.prototype.getBoundingClientRect = jest.fn(() => {
                    return {
                        width: 120,
                        height: 120,
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0
                    };
                });

                Element.prototype.contains = jest.fn(() => {
                    return true;
                });

                Horizon({
                    onEntry: jest.fn(),
                    onExit: jest.fn(),
                    triggerOnce: true,
                    toObserve: document.querySelector('.fake-element'),
                    intersectionObserverConfig: {
                        root: null,
                        rootMargin: '35%',
                        threshold: 0
                    }
                });

                eventListners.scroll();

                expect(window.removeEventListener.mock.calls.length).toEqual(2);
                expect(window.removeEventListener.mock.calls[0][0]).toEqual(
                    'scroll'
                );
                expect(window.removeEventListener.mock.calls[1][0]).toEqual(
                    'resize'
                );
            });
        });

        describe('Defined root element', () => {
            test('callback not called if its not intersecting', () => {
                const onEntry = jest.fn();

                Element.prototype.getBoundingClientRect = jest.fn(() => {
                    return {
                        width: 100,
                        height: 100,
                        top: 50,
                        left: 50,
                        bottom: -50,
                        right: -50
                    };
                });

                Horizon({
                    onEntry,
                    onExit: jest.fn(),
                    triggerOnce: true,
                    toObserve: document.querySelector('.fake-element'),
                    intersectionObserverConfig: {
                        root: document.querySelector('.fake-body'),
                        rootMargin: '35%',
                        threshold: 0
                    }
                });

                expect(onEntry.mock.calls.length).toEqual(0);
            });

            test('callback is called if its intersecting', () => {
                Element.prototype.getBoundingClientRect = jest.fn(() => {
                    return {
                        width: 120,
                        height: 120,
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0
                    };
                });

                Element.prototype.contains = jest.fn(() => {
                    return true;
                });

                const onEntry = jest.fn();

                Horizon({
                    onEntry,
                    onExit: jest.fn(),
                    triggerOnce: true,
                    toObserve: document.querySelector('.fake-element'),
                    intersectionObserverConfig: {
                        root: document.querySelector('.fake-body'),
                        rootMargin: '35%',
                        threshold: 0
                    }
                });

                expect(onEntry.mock.calls.length).toEqual(1);
            });

            test('event handlers are not removed if triggerOnce is false', () => {
                Element.prototype.getBoundingClientRect = jest.fn(() => {
                    return {
                        width: 120,
                        height: 120,
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0
                    };
                });

                Element.prototype.contains = jest.fn(() => {
                    return true;
                });

                Horizon({
                    onEntry: jest.fn(),
                    onExit: jest.fn(),
                    triggerOnce: false,
                    toObserve: document.querySelector('.fake-element'),
                    intersectionObserverConfig: {
                        root: document.querySelector('.fake-body'),
                        rootMargin: '35%',
                        threshold: 0
                    }
                });

                expect(window.removeEventListener.mock.calls.length).toEqual(0);
            });

            test('event handlers are removed if triggerOnce is true', () => {
                Element.prototype.getBoundingClientRect = jest.fn(() => {
                    return {
                        width: 120,
                        height: 120,
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0
                    };
                });

                Element.prototype.contains = jest.fn(() => {
                    return true;
                });

                Horizon({
                    onEntry: jest.fn(),
                    onExit: jest.fn(),
                    triggerOnce: true,
                    toObserve: document.querySelector('.fake-element'),
                    intersectionObserverConfig: {
                        root: document.querySelector('.fake-body'),
                        rootMargin: '35%',
                        threshold: 0
                    }
                });

                eventListners.scroll();

                expect(window.removeEventListener.mock.calls.length).toEqual(2);
                expect(window.removeEventListener.mock.calls[0][0]).toEqual(
                    'scroll'
                );
                expect(window.removeEventListener.mock.calls[1][0]).toEqual(
                    'resize'
                );
            });
        });
    });
});
