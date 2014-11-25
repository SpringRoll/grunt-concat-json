# grunt-concat-json [![Build Status](https://travis-ci.org/SpringRoll/grunt-concat-json.svg)](https://travis-ci.org/SpringRoll/grunt-concat-json) [![Dependency Status](https://david-dm.org/SpringRoll/grunt-concat-json.svg)](https://david-dm.org/SpringRoll/grunt-concat-json)

Grunt Task for Merging Multiple JSON Files

## Getting Started

This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/)
before, be sure to check out the [Getting
Started](http://gruntjs.com/getting-started) guide, as it explains how
to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as
install and use Grunt plugins. Once you're familiar with that process,
you may install this plugin with this command:

```shell
npm install grunt-concat-json --save
```

Once the plugin has been installed, it may be enabled inside your
Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-concat-json');
```

## Task Options

- `replacer`: (default `null`) the replacer argument for `JSON.stringify()` (second argument).
- `space`: (default `\t`) the space argument for `JSON.stringify()` (third argument).

## Merge JSON Task

_Run this task with the `grunt concat-json` command._

Task targets, files and options may be specified according to the Grunt
[Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

## Usage Example

Assuming we have the following types of source JSON files:

- `src/foo/foo-en.json`:

```json
{
    "foo": {
        "title": "The Foo",
        "name":  "A wonderful component"
    }
}
```

- `src/bar/bar-en.json`:

```json
{
    "bar": {
        "title": "The Bar",
        "name":  "An even more wonderful component"
    }
}
```

Assuming we want to generate the following destination JSON file:

```json
{
    "foo": {
        "title": "The Foo",
        "name":  "A wonderful component"
    },
    "bar": {
        "title": "The Bar",
        "name":  "An even more wonderful component"
    }
}
```

### Single file per target variant

```js
grunt.initConfig({
    "concat-json": {
        "en": {
            src: [ "src/**/*-en.json" ],
            dest: "www/en.json"
        },
        "de": {
            src: [ "src/**/*-de.json" ],
            dest: "www/de.json"
        }
    }
});
```

### Multiple files per target variant

```js
grunt.initConfig({
    "concat-json": {
        "i18n": {
            files: {
                "www/en.json": [ "src/**/*-en.json" ],
                "www/de.json": [ "src/**/*-de.json" ]
            }
        }
    }
});
```

