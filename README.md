
Watch This, Do That
===================

(1) Watch this  
(2) Do that

run:

```
node wtdt.js [--config path/to/config.json] [--verbose]
```

wtdt.config.json:

```JSON
[
  {
    "watch": "some-directory/**/*",
    "do": [
      "yarn run rebuild",
      "some-other-shell-command-executed-in-order"
    ],
    "log": "something changed, rebuilding"
  },
  {
    "watch": [
      "test-watch-2/*",
      "test-watch-3/specific-file"
    ],
    "options": {
      "path": "./node_modules/.bin"
    },
    "log": "just a notification, not doing anything"
  }
]

```

`options.path` will be *appended* to existing PATH env var.

License
=======

[MIT-0](https://github.com/aws/mit-0)
