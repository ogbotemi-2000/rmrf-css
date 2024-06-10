## rmrf-css	

A much leaner and quicker npm package for trimming unused CSS from CSS files based on the selectors matched in provided HTML files


### Getting Started


#### Browser-based
Head over to [https://rmrf-css.vercel.app](https://rmrf-css.vercel.app) for a more comprehensive, simple, UI-based trimming and downloading of used styles for your provided website URL.

___

#### Via the command line
+ Clone the repository
```
git clone https://github.com/ogbotemi-2000/rmrf-css.git
```

+ Or install the package locally via npm

```
npm install rmrf-css
```

_Both options above are quick and direct - the package has zero dependencies, no `npm install` required_


### Usage

The browser-based version is direct and progressive with short texts when necessary to guide its usage.


The section below comprises guides for using the package programatically

#### As a module

```js
const rem_css = require('rmrf-css');

rem_css({
  html: /* array of html filenames or a filename */,
  css:  /* array of css filenames or a filename */
  out: /* output directory for the trimmed css files */

})

/* defaults to {html:'./', css:'css', out:'dist'}.
 * the output directory is created if it does not exist
 */
rem_css()

```
___

#### Via invocation from the command-line

+ ##### Via `npm run <script> <arguments>`

Include the code block below in your `package.json` file for it to work
```js
...
  "scripts": {
    ...
    "rmrf-css": "node ./node_modules/rmrf-css/index"
    ...
  }
...
```

It is invoked as 
```js
npm run rmrf-css -- -html <html file names or folder path> -css <similar but for css> -out <output folder>
```
An example - `npm run rmrf-css -- -h 'index.html, sitemap.html' -c public/css -o dist`, the double dashes are required for proper behaviour


+ ##### Via `node path/to/rmrf-css/index`
```js
node path/to/rmrf-css/index -h index.html -c 'tailwind.css, all.css' -o output-folder
```


The arguments can also be provided in the long version
```js
node path/to/rmrf-css/index.js --html 'index.html, 404.html' --css 'tailwind.css, all.css' -output output-folder
```

> The arguments above can be anything, what matters is that their initial letters - 'h', 'c', 'o' as speciified in the `index.js` file remain in the same position:
```js

... argv(['-h', '-c', '-o'], ['./', 'css', 'dist']) ...
```

### Awareness


1. The code warns with a message when it takes over 6000ms when boosting the trimming operation.
This happens when the number of unique selectors to be audited is great and it is done to avoid long-running behaviour that produces unwanted results.
If such edge case happens and it seems to be inconvenient to you, please discuss the workarounds it suggests [here](https://github.com/ogbotemi-2000/rmrf-css/discussions/)

2. Such a workaround for the edge case mentioned above will involve breaking the detected unique selectors into smaller chunks and invoking the scripts directly thereof with the last provided arguments used.

3. Modifying the performance threshold time of 6000ms or the "boost" mentioned above may follow this proprotion: 
```
[Defaults] 500,000 bytes per cycle as boost  ≡  (Should take at most 6000ms)
<New bytes per run via for loop> 	           ≡  <New threshold time>

Assume any value you want for either unknown above and cross-multiply, solve to obtain other unknown

````


### License

Distributed under the EPUL License. See 'LICENSE.txt' for more information

Copyright © 2024 [Ogbotemi Akin Ogungbamila](https://github.com/ogbotemi-2000)


### Discuss

[Discussions are welcome!](https://github.com/ogbotemi-2000/rmrf-css/discussions/)

### Contact

Ogbotemi Akin Ogungbamila

+ Twitter: [@ogbotemi_o](https://twitter.com/ogbotemi_o)

### Acknowledgements

+ [W3C CSS Specification for selectors](https://www.w3.org/TR/selectors-3/#sequence): For the documents from which the algorithm used in validating used CSS selectors was created
