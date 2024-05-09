/*
simple utility to set and read command-line arguments using lean code with zero dependencies
*/

const fs      = require('fs'),
      path    = require('path'),
      argv    = process.argv.slice(2),
      check   = (a, o, i)=>a[i]?.match(o[i/2]),
      values  = {},
      msgs    =[];

module.exports = function(options, defs, isA) {
  isA = arg=>Array.isArray(arg);

  if(!(isA(options)&&isA(defs))) return values;
  defs.map((e, i)=>values[options[i]]=e);

  for(let i = 0, arr=[], value, len=argv.length, match=str=>(str&&=str.match(rgx))[0], rgx=new RegExp('^('+options.map(opt=>'-+'+opt.split('-').pop()).join('|')+')'); i < len;) {
    if(value=match(argv[i])) values[value]=path.normalize('./'+argv[i+1]);
    i+=2
  };

  /* slot in placeholder values here, refactor to suit your needs
  values['-a']==='_'&&(msgs.push(`-a :: replacing placeholder '_' with the value - '${values['-d']}' passed to -d`), values['-a'] = values['-d']),

  * log messages of alterations if you are so inclined
  msgs.forEach(e=>console.log(e));
  */

  return values
}

