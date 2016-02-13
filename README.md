# babel-plugin-readable-require

## Installation

```sh
npm install --save-dev babel-plugin-readable-require
```

Configuration of babel (`.babelrc`):
```json
{
  "plugins": [
    ["babel-plugin-readable-require", {
      "folder": "src",
      "package": "../package.json"
    }]
  ]
}
```

- `"folder"` defines the root folder for `require()`
- `"package"` defines the path to the projects `package.json`, either absolute
or relative to the root folder

## Example

### Projectstructure

```
src (root)
  controller
    App.js
  model
    Job.js
    User.js
  view
    LoginScreen.js
```

### App.js

```js
import Job from "model/Job";
import User from "model/User";
import LoginScreen from "view/LoginScreen";

// (...)
```
