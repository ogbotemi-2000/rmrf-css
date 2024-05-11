# RemCSS

A much leaner and quicker npm package for trimming unused CSS from CSS files based on the selectors matched in provided HTML files
___


# Getting Started
___

## Browser-based
Head over to [site_url] for a more comprehensive, simple, UI-based trimming and downloading of used styles for your provided website URL.


## Via the command line
+ Clone the repository
```
git clone https://github.com/ogbotemi-2000/RemCSS.git
```

+ Or install the package locally directly via npm

```
npm install remcss
```

Both options are quick and direct - the package has zero dependencies, no `npm install` required.

___

# Usage

The browser-based version is direct and progressive with short texts when necessary to guide its usage.
___

This section comprises guides for using the package programatically

## As a module

```js
const rem_css = require('remcss');

rem_css({
  html: /* array of html filenames or a filename */,
  css:  /* array of css filenames or a filename */
  out: /* output directory for the trimmed css files */

})

/* defaults to {html:'./', css:'css', out:'dist'}.
 * 'dist' is created if it does not exist
 */
rem_css()

```

## Via invocation from the command-line

```
node path/to/remcss/index.js -h 'index.html, 404.html' -c 'tailwind.css, all.css' -o output-folder
```

> The arguments provided above are not hardcoded - you may change them to what you wish in the index.js file

___

The arguments can also be provided in the long version
```
node path/to/remcss/index.js --html 'index.html, 404.html' --css 'tailwind.css, all.css' -output output-folder
```
> What matters is that the initial letters - 'h', 'c', 'o' in the arguments above remain the same, it can be anything

You may add the following in the `package.json` file to run the `remcss` package via the command-line
```js
...
  "scripts": {
    "remcss": "node ./node_modules/remcss/index"
  }

...
```
Execute the script as `npm remcss <arguments here>`


#License
___

Distributed under the EPUL License. See 'LICENSE.txt' for more information


#Contact

Ogbotemi Ogungbamila 


#Acknowledgements

+ [W3C CSS Specification](https://w3c.org)
