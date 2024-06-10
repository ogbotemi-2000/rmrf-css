/*
simple utility that includes reading command-line arguments using lean code with zero dependencies
*/
let argv   = process.argv.slice(2),
    values = {};


module.exports = {
  argv: function(options, defs, isA, rgxes) {

    isA = arg=>Array.isArray(arg);
    if(!(isA(options)&&isA(defs))) return values;
    /** create a regex for each command line variable option provided */
    rgxes = options.map(e=>new RegExp(`^-+${e.split(/-+/).pop().charAt(0)}`)),

    /* filter commands passed to script to even ones only - they represent where the values of the cmdline variables will be
    */
    argv = argv.filter((_,i)=>i%2),
    /** if every element in filtered argv is neither undefined nor a variable use it and use the default if otherwise */
    defs.forEach((e, i, v)=>values[options[i]] = rgxes.filter(rgx=>rgx.test(v=argv[i])).length?e:v||e);
    return values
  },
  loop
}

/** The most important function in this codebase.
 * Used to use a for loop imperatively to loop over strings either forwards or backwards
 * 
 * @param {*} str  The string, array (need to refactor using .charAt to [] for arrays) or an object based on index-based lookup via the square bracked notation
 * @param {*} props an object with this schema {from:number, to:number, cb: function, back}
 * @param {*} from overloading argument to store the starting index for the looping
 * @param {*} to    `             `       `  `     `  index to loop, it is added with 'from' automatically
 * @param {*} cb    `             `       `  `     `  callback that returns true to terminate the loop, this termination is disregarded if to is provided and this callback is then called only once thereof,
 * cb is passed these arguments: str, from, to, result; the returned array to where loop is invoked,
 * back makes the loop work backwards until terminated by 'to' or (has=str.charAt(from))===undefined or the returned value of cb
 * 
 * @returns an array as follows [added strings, incremented index]
 */
function loop(str, props, from, to, cb) {
  len=str.length,
  from = Math.abs(props['from'])||0, to = Math.abs(props['to'])||0, cb = props['cb'];
  if(typeof cb !== 'function') cb =_=>!!0;
  let result = [''], has=!0, reach, down = props['back'];
  if(down) { if(from>len) from=len-1; to=from-to;}
  reach=from+to;

  for(; !cb(str, from, to, result)&&(to?from < reach:has);) {
    result[0] += (has=str.charAt(result[1] = down?from--:from++))||'';
    if(down&&to===from) break;
  }
  if(down) result[0] = result[0].split('').reverse().join(''), result[1] &&= ++result[1];
  return result
}