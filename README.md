# Track Element Views v0.0.1

Track Element Views is a simple function to track in Google Anlaytics when the user views an element. What percentage of the element has to be in view and for how long to be considered a "view" is configurable.

## Use

After including the function in your site and the element(s) you want to track have been loaded, simply call `trackViews` with the arguments: `milliseconds`, `percent visible`, and `selector`.

*  `milliseconds:` How long the element has to be in view. This is to prevent the user scrolling past the element counting as a view.
*  `percent visible:` If you want to count less than the full element being in view as a view.
*  `selector:` Anything that works with `document.querySelectorAll`.

This is telling the tracker to wait 1 second (1000 milliseconds) after scrolling before recording the event, and to record any image that's at least 90% visible.
```javascript
trackViews(1000, 90, 'img');
```

`percent visible` is a percentage of the element _area_. If the element is taking up the whole window for the allocated amount of time it will still count as a view, even if the percent visible isn't _all_ visible.

For best results add a `data-trackname` attribute with a useful value to your elements being tracked.

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

You're welcome to go modify `getNameForElement` if you'd like to change how the label is chosen.

Tracking calls are made as soon as the element goes _out of view_. Before the page exits it also reports how many times each element was viewed, and how long total those views lasted.
