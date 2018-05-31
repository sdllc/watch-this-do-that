
Watch This, Do That
===================

(1) Watch this  
(2) Do that

`wtdt.config.js`

```json
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
    "log": "just a notification, not doing anything"
  }
]

```

License
=======

[MIT-0](https://github.com/aws/mit-0)
