let {exec, execFile, spawn} = require('child_process');

exec('dir dist', (err, stdout, stderr, arr=[])=>{ 
  if(err||stderr) console.error('An error occured', err, stderr);

  stdout.replace(/\s[^]+\.(html|css)/g, str=>{
    arr = [...str.split(/\s+/).filter(e=>e&&/\.(html|css)/.test(e))]
  }), console.log('::OUTPUT::', arr)
})