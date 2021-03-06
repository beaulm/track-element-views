# Track Element Views v0.0.2

If you want to know every time something is viewed on your website, and maybe track it in analytics, Track Element Views is right for you. Perhaps you've got an infinite scroll page/blog and you want to know when, how many times, and for how long each element is in view. Or maybe you've got a long art gallery and you want to know which pictures people are _actually_ looking at (not just which ones are on the page they're viewing).

Track Element Views is a simple function to track when the user views an element. What percentage of the element has to be in view and for how long to be considered a "view" is configurable. If you've already got Google Analytics universal setup on your site, this function will automatically integrate with it.

## Use

After including the function in your site and the element(s) you want to track have been loaded, simply call `trackViews` with the arguments: `milliseconds`, `percent visible`, and `selector`.

*  `milliseconds:` How long the element has to be in view. This is to prevent the user scrolling past the element counting as a view.
*  `percent visible:` If you want to count less than the full element being in view as a "view".
*  `selector:` Anything that works with `document.querySelectorAll` (the kinda thing you'd use with jQuery inside the quotes of `$('')`).

This is telling the tracker to wait 1 second (1000 milliseconds) after scrolling before recording the event, and to record any image that's at least 90% visible.
```javascript
trackViews(1000, 90, 'img');
```

`percent visible` is a percentage of the element _area_.

Data will automatically be sent to Google Analytics if possible. In addition, the function will emit custom events for each tracking call. Each time an element that was in view goes out of view an `individualView` event is dispatched on the window. _Just before_ the page exits, `totalViews` and `viewedFor` events are dispatched.

## Tracking info

Events will be tracked with:
*  **Category:** Element
*  **Action:** Individual View
*  **Label:** {element}
*  **Value:** Visible For (in milliseconds)

{element} is a unique identifier for the particular element being reported on. The function will look for one of the following attributes to use, in order, until it finds one:
*  `data-trackname`
*  `id`
*  `src`
*  `name`
*  The first 64 characters of the inner text
*  `atr`

For best results add a `data-trackname` attribute with a useful value to your elements being tracked.

You're welcome to go modify `getNameForElement` if you'd like to change how the label is chosen.

Tracking calls are made as soon as the element goes _out of view_. Before the page exits it also reports how many times each element was viewed, and how long total those views lasted.
