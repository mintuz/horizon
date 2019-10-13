# Horizon

A light wrapper round the Intersection Observer API. Please note this is not a polyfill for Intersection Observer.

## Install

`yarn add @mintuz/horizon --save`

## Usage

### Config

| Key                        | Value                                                | Description                                                                                                              | Default                                          |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| onEntry                    | `(entry) => {}`                                      | Callback which is called when the element to observe is in view, triggers once if triggerOnce is set to true             | N/A                                              |
| onExit                     | `(entry) => {}`                                      | Callback which is called when the element is out of view                                                                 | N/A                                              |
| triggerOnce                | `true`                                               | Will trigger onEntry callback once, useful for lazyLoading                                                               | false                                            |
| toObserve                  | `document.querySelector('.element-to-come-in-view')` | The element to observe which may or may not come into view                                                               | Required                                         |
| intersectionObserverConfig | `{ root: null, rootMargin: '35%', threshold: 0 }`    | Options passed to [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) | `{ root: null rootMargin: '35%', threshold: 0 }` |

### Example

```
import Horizon from '@mintuz/horizon';

const observed = Horizon({
    onEntry(entry) {
        console.log('element in view', entry);
    },
    onExit(entry) {
        console.log('element out of view', entry);
    },
    triggerOnce: true,
    toObserve: document.querySelector('.element-to-come-in-view'),
    intersectionObserverConfig: {
        root: document.querySelector('body'),
        rootMargin: '0px',
        threshold: 1.0
    }
});

observed.unobserve();
```
