import Horizon from './';

let elements;
let callbacks;
let unobserve;
let observe;

describe('Horizon', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="fake-body">
                <div class="fake-element">This is a fake DOM</div>
            </div>
        `;

        elements = [];
        callbacks = [];
        unobserve = jest.fn();
        observe = jest.fn();

        window.IntersectionObserver = jest.fn((callback) => {
            callbacks.push(() => {
                callback(elements, {
                    unobserve
                });
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

    test('onEntry callback is not called again if its been called once and is visible', () => {
        elements = [
            {
                isIntersecting: true
            }
        ];

        const onEntry = jest.fn();
        const onExit = jest.fn();

        Horizon({
            onEntry,
            onExit,
            triggerOnce: false,
            toObserve: null,
            intersectionObserverConfig: {
                root: null,
                rootMargin: '35%',
                threshold: 0
            }
        });

        callbacks[0]();
        callbacks[0]();

        expect(onEntry.mock.calls.length).toEqual(1);
        expect(onExit.mock.calls.length).toEqual(0);

        expect(unobserve.mock.calls.length).toEqual(0);
    });

    test('onExit callback is not called again if its been called once and is hidden', () => {
        elements = [
            {
                isIntersecting: false
            }
        ];

        const onEntry = jest.fn();
        const onExit = jest.fn();

        Horizon({
            onEntry,
            onExit,
            triggerOnce: false,
            toObserve: null,
            intersectionObserverConfig: {
                root: null,
                rootMargin: '35%',
                threshold: 0
            }
        });

        callbacks[0]();
        callbacks[0]();

        expect(onEntry.mock.calls.length).toEqual(0);
        expect(onExit.mock.calls.length).toEqual(1);

        expect(unobserve.mock.calls.length).toEqual(0);
    });

    test('onEntry callback is called and when triggerOnce is false unobserve is not called', () => {
        elements = [
            {
                isIntersecting: true
            }
        ];

        const onExit = jest.fn();
        const onEntry = jest.fn();

        Horizon({
            onEntry,
            onExit,
            triggerOnce: false,
            toObserve: null,
            intersectionObserverConfig: {
                root: null,
                rootMargin: '35%',
                threshold: 0
            }
        });

        callbacks[0]();

        expect(onEntry.mock.calls.length).toEqual(1);
        expect(onExit.mock.calls.length).toEqual(0);

        expect(unobserve.mock.calls.length).toEqual(0);
    });

    test('when intersecting and triggerOnce is true unobserve is called', () => {
        elements = [
            {
                isIntersecting: true
            }
        ];

        Horizon({
            triggerOnce: true,
            toObserve: null,
            intersectionObserverConfig: {
                root: null,
                rootMargin: '35%',
                threshold: 0
            }
        });

        callbacks[0]();

        expect(unobserve.mock.calls.length).toEqual(1);
    });

    test('onEntry callback is not called when not intersecting', () => {
        elements = [
            {
                isIntersecting: false
            }
        ];

        const onEntry = jest.fn();

        Horizon({
            onEntry,
            triggerOnce: true,
            toObserve: null,
            intersectionObserverConfig: {
                root: null,
                rootMargin: '35%',
                threshold: 0
            }
        });

        callbacks[0]();

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
