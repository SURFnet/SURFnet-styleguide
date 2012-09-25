# SURFnet-styleguide

This is the home for the SURFnet Styleguide

## Building the style

For building the minified css, [recess] is used. First you need to install [nodejs], if you are on a mac you could use `brew install nodejs`.
After nodejs you need to install [npm] by `curl http://npmjs.org/install.sh | sh` and finally you can install `recess` by `npm install recess -g`.

To build the style type `make`.

[nodejs]: http://nodejs.org
[npm]: http://npmjs.org
[recess]: http://twitter.github.com/recess


## Upgrading from old styleguide to the redesign

* Every use of the class `row` is now changed to `row-fluid`
* The `header` element, now requires a `.header` class. (As `header` elements might be used on more places than the document head only.) It also is not in the `.wrapper` class, but directly in the `body` element.
* Use logical order of headers: `h1` for the document header, for example in `content-holder`. And `h2` for the second most important headers et cetera.
* Convention is to use a navigation bar on the left, and content on the right by using the `row-3` and `row-9` classes.
* Be sure to include all additional / new stylesheets, scripts and images.