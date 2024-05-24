/*
simple utility to define and read command-line arguments using lean code with zero dependencies
*/
let argv   = process.argv.slice(2),
    values = {};


module.exports = function(options, defs, isA, rgxes) {

  isA = arg=>Array.isArray(arg);
  if(!(isA(options)&&isA(defs))) return values;
  /** create a regex for each command line variable option provided */
  rgxes = options.map(e=>new RegExp(`^-+${e.split(/-+/).pop().charAt(0)}`)),

  /* filter commands passed to script to even ones only - they represent where the values of the cmdline variables will be
   */
  argv = argv.filter((_,i)=>i%2),
  /** if every element in filtered argv is neither undefined nor a variable use it and use the default if otherwise */
  defs.forEach((e, i, v)=>values[options[i]] = rgxes.filter(rgx=>rgx.test(v=argv[i])).length?e:v||e)

  return values
}