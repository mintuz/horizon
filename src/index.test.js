import Horizon from './';

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
});
