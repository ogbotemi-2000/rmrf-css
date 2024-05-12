let fs         = require('fs'),
    {execFile} = require('child_process'),
    attrs      = new Set(/**you may leave an array classes or ids used in scripts here - [<class>, <id>]*/),
    index      = 0,
    trimCSS    = require('./trim-css'),
    argv       = require('./argv'),
    fxn        = (nxt, files, outDir)=>fs.readFile(files.html[nxt], function(err, buf, buffer) {
      (buffer = buf.toString())
      .replace(/(id|class)="[^"]+"/g, e=>{
        (e.replace(/(id|class)=|"/g, '').split(' ')).forEach((m, el)=>{
          /** escape unusual strings or starting numbers in css selectors */
          m=m.replace('&amp;', '&').replace(/^[0-9]+|\.|\/|\[|\]|\&|\*|\:|\>/g, e=>'\\'+e);
            m.trim()&&attrs.add(m)
        })
      }),
      /** using setImmediate to call this function in itself to avoid
     * the maximum call stack size exceeded error which may occur for directories
     * containing a lot of HTML or CSS files
     */
      index<files.html.length?setImmediate(_=>fxn(index++, files, outDir)):(/* trimCSS(attrs, files.css, outDir), */ console.log('::SELECTORS::', attrs.size))
  });

let fromCmdLine = process.argv.slice(2).length,
/* argv('array of custom command-line arguments', 'the defaults to apply for each unprovided argument') */
cmd_args = argv(['-h', '-c', '-o'], ['./', 'css', 'dist']), props = ['html', 'css', 'out'], args={};

/* create property names supported for the object passed to `init` from the object built from the command-line arguments */
Object.keys(cmd_args).map((key, i)=>args[props[i]] = cmd_args[key]),

/*properly store comma separated values as arrays*/
Object.keys(args).forEach((key, arr)=>args[key]=(arr=args[key].split(',')).length>1?arr:arr[0])

/* detect and run init if this file's contents is invoked by node on the command-line with characters like arguments supplied after it */
fromCmdLine&&init(args)

module.exports = init;

function init(obj, index, bool, values, files, rgxes, exists) {
  /* values below represent the fallbacks to be used for non-existent files or folders*/
  values=['./', 'css', 'dist'], files={}, rgxes=[], exists=[],

  /* for when obj is null */ obj||={},
  /* heads up, typeof null equals 'object' hence why the above logical assignment is there*/
  typeof obj!=='object'&&(obj={}),

  index=0, bool = props.map((key, i, prop, exsts=[], nenoent)=>(Array.isArray(prop=obj[key])&&(exsts=prop.filter(e=>fs.existsSync(e))), nenoent=fs.existsSync(prop), exists.push(exsts.length?exsts:nenoent), exsts+='', obj[key]=exsts?(values[i]=exsts=exsts.split(',')):nenoent&&(values[i]=prop)||values[i], exsts.length||fs.existsSync(prop))).filter(e=>e).length,
  values.slice(0, 2).forEach((value, i)=>{files[value=props[i]] = [], rgxes.push(new RegExp(`\.${value}$`))});

  if(!bool) console.warn(`Non-existent files detected in the object argument provided to the \`remcss\` module, using ${JSON.stringify(obj)} as a fallback`);
  /** the promise below is used to have a callback for continuation whether the shell - 'ls <directory> -a' is spawned or not. 
    * This is usually when a string or an array of filenames to consider is provided as the values of the 'html' and 'css' propeties of obj
    */
  let getFiles =value=>new Promise((resolve, reject, exit)=>{
      exit=_=>`::ENOENT:: for the fallback \`${value}\` - cannot continue, exiting the remcss module`;
     /* (value=exists[index]).length below has the ubiquity of being a truthy or falsy for both arrays and strings - convenient */
      if((value=exists[index]).length) resolve([].concat(value));

       /*  the first logical operation below is to only warn about using fallbacks when necessary
       */
      else {
	!value&&console.warn('::ENOENT:: For the value of the property',`\`${props[index]}\``,'of the expected object argument - reading', props[index].toUpperCase(), 'files from directory',`\`${value=values[index]}\``,'as a fallback');
	value=values[index];

	/*reject and exit obtaining the necessary files if the fallbacks do not exist*/
	if(!fs.existsSync(value)) {reject(exit()); return}

	execFile('ls', [value], (error, stdout, stderr) => {
          if (error) console.warn(error)/* warning instead of 'throw'ing this error.
	   this error occurs when the control statements get here from running the code via a Windows terminal
	  */;

	  /*split and filter strings that match this regex /\.css$/ or /\.html$/ */
          
	  (stdout=stdout.split('\n').filter(e=>rgxes[index].test(e))).length ? resolve(stdout) : reject(exited=exit());
        })
      }
    }).then(provided=>{
      files[props[index]] = provided, index++,
      /** +1 below makes it stop at the element just before the last element, which is the output directory, in the values array */
      index+1<values.length?getFiles(index):/*Done, continue, start from 0*/fxn(0, files, values.pop())

   }).catch(msg=>{console.log(msg), exited=true}), exited;

  !exited&&getFiles(index);
}

// Invoked in-file during development
// init({html:'index.html', css:'css'})