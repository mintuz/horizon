import requestAnimationFrame from './request-animation-frame';

describe('Request Animation Frame Helper', () => {
    afterEach(() => {
        delete window.requestAnimationFrame;
    });

    test('Should call the callback passed to the requestAnimationFrameHelper once if request animation exists', () => {
        const callbackSpy = jest.fn();

        window.requestAnimationFrame = jest.fn((cb) => {
            cb();
        });

        requestAnimationFrame(callbackSpy);

        expect(callbackSpy.mock.calls.length).toEqual(1);
    });

    test('Should call the requestAnimationFrame callback twice if request animation exists', () => {
        const callbackSpy = jest.fn();

        window.requestAnimationFrame = jest.fn((cb) => {
            cb();
        });

        requestAnimationFrame(callbackSpy);

        expect(window.requestAnimationFrame.mock.calls.length).toEqual(2);
    });

    test('Should call setTimeout if request animation frame does not exist', () => {
        window.setTimeout = jest.fn((cb) => {
            cb();
        });

        const callbackSpy = jest.fn();
        requestAnimationFrame(callbackSpy);

        expect(window.setTimeout.mock.calls.length).toEqual(1);
        expect(callbackSpy.mock.calls.length).toEqual(1);
    });
});
