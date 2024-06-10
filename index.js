let fs           = require('fs'),
    path         = require('path'),
    isWindows    = /^win[0-9]*/i.test(require('os').platform()),
    {exec,
    execFile}    = require('child_process'),
    /** the empty whitespace element in the array below is the culprit for the performance drop in earlier versions.
     * The long comment in the trim-css.js file is not removed
     */
    selectors    = new Set([]/**you may fill this array with strings of classes and ids */),
    index        = 0,
    trimCSS      = require('./trim-css'),
    {argv, loop} = require('./argv'),
    fxn          = (nxt, files, outDir)=>fs.readFile(files.html[nxt], function(err, buf, html, attrs, attr_vals=[]) {
      attrs = ['class', 'id'];/* add the name of attributes you believe to store used selectors here */

      for(let i=0, j=(html = buf.toString()).length, res; i<j; i++) {
        /** Node.js sucks at the precision and accuracy of the regular expressions used to get the values of attributes such as
         * `class` or `id`, hence why a loop is used imperatively to their values as their patterns are sometimes close  to
         * being non-regular expressions.
         * See the previous versions of this package for context
         */
        attrs.forEach(attr=>{
          /* store strings for the length of the current attr and see whether they are the same */
          if(new RegExp(`${attr}=('|")`).test((res = loop(html, {from:i, to:attr.length+2}))[0])) {
            /* the current index points to an opening quote, incrementing it points to the characters after it which are then
               added together till the character just before the closing quote
            */
            // attr_vals = attr_vals.concat
            (loop(html, {from:res[1]+1, cb:(s,f)=>/'|"/.test(s[f])})[0].split(/\s/)).forEach(val=>(val = val.trim())&&selectors.add(val.replace(/^[0-9]+|\.|\/|\[|\]|\&|\*|\:|\>/g, e=>'\\'+e)))
            
          }
        })
      };
      /** using setImmediate to call this function in itself to avoid
     * the maximum call stack size exceeded error which may occur for directories
     * containing a lot of HTML or CSS files
     */
      files.html[++index] ? setImmediate(_=>fxn(index, files, outDir)) : trimCSS(selectors, files.css, outDir)
  });

/*
The codes below up to module.exports = init is for receiving user input.
You may comment it up to that point and either require this script as a module or
call init({html:<string>, css:<string>, out:<string>}) if command-line use is not an option
*/

let fromCmdLine = process.argv.slice(2).length, values,
/* argv('array of custom command-line arguments', 'the defaults to apply for each unprovided argument')
  * Change the index of the variables and their defaults to change their order on the command line without issues
  * values below represent the fallbacks to be used for non-existent files or folders
  */
cmd_args = argv(['-h', '-c', '-o'], values=['./', 'css', 'dist']), props = ['html', 'css', 'out'], args={};

Object.keys(cmd_args).forEach((_key, key)=>{
  key = _key.replace(/^-+/, '').charAt(0),
  
  (key = props.find(prop=>prop.charAt(0)===key))
  &&(args[key] = cmd_args[_key])
}),

/* detect and run init if this file's contents is invoked by node on the command-line with characters like arguments supplied after it */
fromCmdLine&&init(args)


module.exports = init;

function init(obj, outDir, index, bool, files, rgxes, exists, fileNames=[]) {
  files={}, rgxes=[], exists=[],

  /* for when obj is null */ obj||={},
  /* heads up, typeof null equals 'object' hence why the above logical assignment is there*/
  typeof obj!=='object'&&(obj={}), outDir = (obj[props[2]]||'dist').split(/(\/|\\)+/).slice(0, -1),
  /** write to dist in the root of the  path provided if its specified folder is non-existent */
  (!fs.existsSync(obj[props[2]])&&!fs.existsSync(obj[props[2]] = path.join(...outDir, 'dist')))&&fs.mkdirSync(obj[props[2]]),

  index=0, bool = props.map((key, i, prop, exsts=[], nenoent)=>(Array.isArray(prop=obj[key])&&(exsts=prop.filter(e=>fs.existsSync(e))), nenoent=fs.existsSync(prop), exists.push(exsts.length?exsts:nenoent), exsts+='', obj[key]=exsts?(values[i]=exsts=exsts.split(',')):nenoent&&(values[i]=prop)||values[i], exsts.length||fs.existsSync(prop))).filter(e=>e).length,
  values.slice(0, 2).forEach((value, i)=>{files[value=props[i]] = [], rgxes.push(new RegExp(`\\.${value}$`))});

  if(!bool) console.warn(`Non-existent files detected in the object argument provided to the \`rmrf-css\` module, using ${JSON.stringify(obj)} as a fallback`);
  /** the promise below is used to have a callback for continuation whether the shell - 'ls <directory> -a' is spawned or not. 
    * This is usually when a string or an array of filenames to consider is provided as the values of the 'html' and 'css' propeties of obj
    */
  let getFiles =value=>new Promise((resolve, reject, exit)=>{
    exit=_=>`::ENOENT:: for the fallback \`${value}\` - cannot continue, exiting the rmrf-css module`;

    /* (value=values[index]).length below has the ubiquity of being a truthy or falsy for both arrays and strings - convenient */
    if(exists[index]&&(value=values[index]).length&&rgxes[index].test(value)/*is a file*/) resolve([].concat(value));

       /*  the first logical operation below is to only warn about using fallbacks when necessary*/
    else {
      !value&&console.warn('::ENOENT:: For the value of the property',`\`${props[index]}\``,'of the expected object argument - reading', props[index].toUpperCase(), 'files from directory',`\`${value=values[index]}\``,'as a fallback');
      value=values[index];

      /*reject and exit obtaining the necessary files if the fallbacks do not exist*/
      if(!fs.existsSync(value)) {reject(exit()); return}
      /* using dir in place of ls, changing the forward slashes in file paths to reverse slashes and using exec in lieu of execFile all to
        overcome"Command failed: ls ...", "Parameter format not correct" and "spawn ... ENOENT" issues respectively with the Windows terminal 
       */
      value = isWindows?value.replace(/\//g, '\\'):value,
      exec((isWindows?'dir ':'ls ')+value, (error, stdout, stderr, dir) => {
        if (error) console.warn(/*throw */error) /* a warning instead of 'throw'ing this error */;

	/* split and filter strings that match this regex /\.css$/ or /\.html$/.
	 * The verbosity of using replace below is to properly retrieve the file names from the output of the program
	 */
	stdout.replace(/\s[^]+\.(html|css)/g, str=>{
	  fileNames = [...str.split(/\s+/).filter(e=>e&&/\.(html|css)/.test(e))]
	}),
        (stdout=fileNames.filter(e=>rgxes[index].test(e))).length
        /** add full path present in folders provided to their contents */
        ? resolve(stdout.map(e=>path.join(!rgxes[index].test(value)?value:'', e)))
        : reject(exited=exit());
      })
    }
  }).then(provided=>{
    files[props[index]] = provided, index++,
    /** +1 below makes it stop at the element just before the last element, which is the output directory, in the values array */
    index+1<values.length?getFiles(index):/*Done, continue, start from 0*/fxn(0, files, values.pop())

   }).catch(msg=>{console.log(msg), exited=true}), exited;

  !exited&&getFiles(index);
}
