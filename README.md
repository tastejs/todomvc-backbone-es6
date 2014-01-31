# Backbone TodoMVC + ECMAScript 6

This repo contains an implementation of the Backbone TodoMVC app rewritten to use ES6 modules, classes and other features. Using the [Traceur compiler](https://github.com/google/traceur-compiler), we're able to use these features in today's browsers with it being dynamically interpreted at runtime.

* [Demo](http://addyosmani.github.io/todomvc-backbone-es6/)
* Documentation: [app.js](http://addyosmani.github.io/todomvc-backbone-es6/docs/app.html) and [todo-app.js](http://addyosmani.github.io/todomvc-backbone-es6/docs/todo-app.html).

Run `index.html` on a server to try out the app, or read `docs/app.html` for the literate Docco version.


## Bower

This repository uses [Bower](http://bower.io) and a checked in version of `bower_components` for dependencies. To update dependencies to the latest version run `bower update`.

## Docco compilation

* `npm install -g docco`
* `docco js/app.js`
* Update the `docs` directory


## License

MIT
