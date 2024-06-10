let fs         = require('fs'),
    path       = require('path'),
    meta       = 'meta.txt', //file for serializing the provided arguments to the disk for future use in a will-be-provided workaround
    /** uuid for spliting the content of meta when deserializing the stored data in asScript */
    uid        = '^_^$rmrf-css$^_^',
    loop       = require('./argv').loop;

function asScript() {

  /* Will be used as an alternative when discussions about performance drops alerted by this program are made not to be invoked directly until then
   */
  fs.readFile(meta, (err, buffer)=>{  
    buffer = (buffer=buffer.toString()).split(uid)
    
    trimCSS(new Set(buffer.shift().split(',').filter(e=>e)), buffer.shift().split(','), buffer.shift(), +buffer.shift())
  })
}

module.exports = trimCSS, require.main===module&&asScript();

function trimCSS(attrs, files, outDir, i, end, rerun, matches=new Set, comments=[], css='', ruleEnd, used='', generic='', warned, rkeys, file, vw_breaks, styles, fn, endDump={}, dump={}) {

     i||=0 /*only make i zero if it is a falsy, this is usually for when asScript above calls this script*/
    /** vw_breaks will be refactored to be be provided by the user when the normal media query matching preset below fails to put utility media query selectors in their media query breakpoints */
    rkeys = new RegExp('('+Object.keys(vw_breaks = {base:500,sm:640,md:768,lg:1024,xl:1280, '32xl':1536}).join('|')+')\\\\:'),

    end=_=>{
      matches.forEach(match=>{
        /* Prevent the behaviour of removing used selectors and thereby reducing the number of detected selectors
          attrs.delete(match)
         */
      }), fs.writeFileSync(path.join(outDir, 'matched.txt'), [...matches].join('\n')),
      fs.writeFileSync(path.join(outDir, 'unmatched.txt'), [...attrs].join('\n'));

      for(let i in dump) {
        let value;
        if((value=dump[i]).replace(/@[^{]+\{/, '')) used+=value+(endDump[i]||'')
      }

      file = file.split(/(\/|\\)+/).pop(),
      fs.writeFileSync(path.join(outDir, file), `${used}\n\n/*${':'.repeat(20)} GENERIC STYLES IN TRIMMED STYLESHEET ${':'.repeat(20)}*/\n${generic}\n
/*${':'.repeat(20)} END OF GENERIC STYLES ${':'.repeat(20)}*/`),

      fs.writeFileSync(path.join(outDir,'/_'+file), css),
      console.log('::DONE WRITING::', path.join(outDir, file), '\n')
      /** clear dumps of media queries, may put this behind a flag as a feature for grouping media queries across files */
      dump = {}, endDump = {}
    },

    fn=()=>{

      /** added a newline to the end of the stylesheet to accommodate adding closing braces for @-rules whose closing braces ends the string of styles */
      generic='', used='', css='', styles = fs.readFileSync(file=files[i++]).toString()+'\n', warned=false,
      console.log('::TRIMMING::', file, 'against', attrs.size, 'detected unique selectors');

      let _canAdd=!0, canAdd=!0, at_rule, media_rule, index=0, keepIndex=0, len=styles.length; each = styles.charAt(index); index<len,
      /** the callback: _cb is used by back and forward to loop over the stylesheet at the current index until
      * its start or until either an opening or closing curly brace is encountered
      */
      _cb=(s,f,bool)=>(!s.charAt(f)||(bool?/\}/:/\}|\{/).test(s.charAt(bool?f-1:f))),
      _back=num=>loop(styles, {from:num||index, back:true, cb:(s,f)=>_cb(s,f)})[0],
      _forward=(attr, num)=>loop(styles, {from:(num||index)+attr.length+1, cb:(s,f)=>_cb(s,f, !0)});

      rerun=(each, _log=20000)=>{
        slowT = new Date;
      /** the for loop below is used to boost the speed of the trimming algorithm.
       * It is in bytes per run and defaults to 500000. It may be left as is below as a default or exposed as `--boost <N>`
       */
        for(let t, jump=0, boost=500000; jump<boost&&(each = styles.charAt(index)); jump++) {
	  // Psst: the condition below is not normally expected to be true... 
          /* After over 5s slowdown of runtime when boosting, end the loop and advise the user to manually run the algorithm to implement a workaround that will
          be added to the body of the asScript function
          */
         
          
          if(!warned&&(t=new Date-slowT)>6000) {
            warned = true;
            /** serialize the provided arguments in to a temporary file in the root directory of this package */
            let metadata = `${[...attrs].join(',')}${uid}${files}${uid}${outDir}${uid}${i-1}`;

            fs.writeFileSync(meta, metadata),
            console.warn('\n'+'-'.repeat(30)+`\n::[SLOWDOWN]:: Algorithm taking over <6 seconds> between boosts of 500,000 bytes per loop. You may choose to end this program if it takes up to a minute.
If this slowdown is inconvenient please head over to https://github.com/ogbotemi-2000/rmrf-css/discussions/ to discuss either
1. A workaround for this edge case involving breaking the ${attrs.size} unique selectors into smaller chunks and invoking the ${path.join(__dirname, 'trim-css.js')} module directly thereof.

2. Exposing the default values of 500,000 bytes per loop as well as its threshold delay of 6000ms for modifications via proportion as explained in the third item on the list here https://github.com/ogbotemi-2000/rmrf-css?tab=readme-ov-file#awareness

It is not an issue, the workarounds above have been tried and tested during the development of this package and the purpose of the discussion is to table which will suffice.
Not to worry the arguments you provided are temporarily serialized into ${path.join(__dirname, 'meta.txt')} and will be used when either workaround is implemented.\n`+'-'.repeat(30)+'\n');
      /* uncommenting the code below ends the loop and exits the code immediately. It is now an undesired behaviour
      jump=boost, index=len, i = files.length;
      return;
      */
          }

          /**change _log above to any number to limit console logging in the code below to its multiples  */
          // index&&index/_log === Math.round(index/_log)&&console.log('::MATCHING.INDEX::', index, jump, t, 'milliseconds')

          /** overlook comments for now even ones that have CSS rules being matched in the code */
          _canAdd = notComment(styles, index);

          keepIndex = index;
          /** avoid wrongly parsing stylesheet by avoiding '@' in at_rules that may have them like media queries  */
          if(_canAdd&&each==='@'&&!at_rule) {
            let temp='', res='', add=0, kFrame, added='';

            temp=loop(styles, {from:index, cb:(s,f,t,r)=>{
              /**check whether the string is a media query up until the first encountered opening curly brace */
              if(/@media[^{]+\{/.test(res+=s[add=f])) {media_rule=res.replace(/\{/, ''), (res=res.match(/[0-9]+/g))&&(at_rule=res.join('_')); return true;}

              /** it is very important that kFrame, when true, remains true by virtue of ||=, this is to make the control statement below always true when 'keyframe'
               *  is encountered once, this loop then continues looping over the keyframe styles until its end as checked by atRuleEnd
               */
              else if(kFrame||=res.match('keyframes')) {
                /** atRuleEnd in the if-statement below uses the loop utility to loop from the current index to the keyframe rule end i.e when it encounters
                 * another closing curly brace after this truthy - s[f]==='}'
                 */
                if(s[f]==='}'&&(ruleEnd=atRuleEnd(styles, f))[0]) { add=ruleEnd[1], canAdd=(s[ruleEnd[1]]!=='}'), added=ruleEnd[2]; return ruleEnd[0]; }
              }
              /** The control statement below is to make this loop return strings added from
               *  @-rules that are on one line or are one style block deep like @charsest,  @import, @font-face up until where a semicolon ends in them.
               */
              else if(s[f]===';') {add=f; return true}
              /** returning true for the conditions above stops looping the string of styles when true. The looped over strings until that time
               * are added together in the first element of the array returned to temp by the loop function, the second element of the said array represents the
               * current index at which 'loop' exits
               */
            }}),
            /**proceed to store the @-rules mentioned in the previous comment, which are gotten from the last else if statement above,
             * till their closing curly brace if they have one
             * temp[0].match('@font-face') below maybe replaced with /@(font-face|property)/.test(temp[0]) to match other one block level @-rules
            */
            res=temp[0].match(/@(property|font-face)/)?temp[0]+loop(styles, {from:temp[1]+1, cb:(s,f,t,r)=>(add=f, s[f-1]==='}')})[0]:temp[0];

            /** loop backwards from the index before the current one to get all prefixes to an @-rule until a whitespace*/
            if(res.charAt(0)) kFrame=loop(styles, {from:index-1, back:!0, cb:(s,f,t,r)=>!s[f-1]||!s[f].match(/\s/)})[0], res='\n'.repeat(!kFrame.match('\n'))+kFrame+res
            , !res.match('@media')
            /** add the terminating semi-colon to one-liner @-rules like import.
             * "dump" uniquely stores media at rules based on their breakpoints, these are all added together to the end of the algorithm
            */
              ? /* add matched @import rules to the start of the used stylesheet */(used+=res+added+added+(res.match('@import')?(canAdd=0, ';'):''), index=add)
              : /* at_rule stores the joined breakpoint(s) current media query rule which is dumped for now  */(dump[at_rule]||=res+'{', index=add, keepIndex=index+1/**point to the character after the open brace in media queries */, css+=res);
          }

          //update 'each' for when index gets increased to 'jump' over the @-rules matched above
          canAdd&&(css+=each=styles.charAt(index)), canAdd=!0;
          
          /** Added the code below to consider generic style blocks
           */
          if(styles.charAt(keepIndex)==='{') {
            /* only add styles that do not contain selector delimeters - ., # to the generic styles
            */
            let res, back = _back(keepIndex-1), forward = (res = _forward('', keepIndex-1))[0], rule=[media_rule+'{', media_rule?'}':''];

            !/\.|#/.test(back)&&(/*index=res[1],*/ generic +=(media_rule?rule[0]:'')+back+forward+rule[1])
          }

          /** The first regex considers only class or id selectors. The second regex test is to prevent matches like .5px in 0.5px.
           *  No worries, selectors that start with a number have to be escaped to be valid i.e .\32xl so the backslash ensures their avoidance
           */
          if(_canAdd&&/\.|#/g.test(each)&&!/[0-9]/.test(styles.charAt(index+1))) attrs.forEach((attr, to='')=>{
            to=loop(styles, {from:index+1, to:attr.length});

            /** Logical statement:
             * 1st part: check for equal CSS selectors in stylesheet. This is safer than using a regex as it considers escaped strings
             * 
             * 2nd part: checks whether the selector in question is standalone; it does not exist as a string in another selector
            */
            if(attr===to[0]&&!/[\\0-9A-Za-z_-]/.test(styles.charAt(to[1]+1))) {
              matches.add(attr);
              /** the use of .repeat below is for formatting purposes only */
              let back=_back(), forward=_forward(attr), res='\n'.repeat(!back.match('\n'))+back+attr+forward[0], rclass=res.match(rkeys), brkpt;

              /** add to the dump for media  @-rules if the current matched selector is in one, this is usually a media rule */
              at_rule?dump[at_rule]&&(dump[at_rule]+=res):(

              /** the logical statement and the if clause below is to consider utility classes for media query breakpoints and dump them together in the dump object */
              rclass&&(dump[brkpt=vw_breaks[rclass=rclass[0].replace('\\:', '')]])
              ? dump[brkpt]+=res
              : used+=res),

              /* jump ahead of the closing curly brace pointed to by forward[1] */
              index=forward[1],
              /** to remove repetitive selector delimeters - # or ., at the end of the strings */
              (back=back.trim()).length>1&&(css=css.replace(back, '')),
              css=css.replace(/(\s+|)(#|\.)$/g, '')
            }
          });
          /** for every closing curly brace, check if it is the end of a nested @-rule and dump the strings that end it in endDump only to
           * build them by adding the contents of dump and endDump together as media query block of used styles by calling end() at the end of the loop.
           * Consider empty media queries by testing for an opening curly brace if a closing one fails
           */
          if(at_rule&&/\}|\{/.test(styles.charAt(index))) (ruleEnd=atRuleEnd(styles, index))[0]&&(endDump[at_rule]=ruleEnd[2], media_rule=at_rule=0);

          /** increment index at the end of it all, this is particularly important because the algorithm above requires that
           * styles.indexOf(styles.charAt(index)) equals index. Moving it to the start of the loop may cause bugs
           */
          index++;
        }
      if(index>len-1) console.timeEnd('::TRIMMED:: '+file+' in:'), end(), /* called fn again to concurrently trim each .css file */ i<files.length?fn():console.log(`\n::TRIMMED:: ${i} CSS files(s)\n`);

      /** call this entire code again using a Nodejs lifecycle method among which setImmediate performed fastest in benchmarks and thus is used */
      else setImmediate(_=>rerun())
    },
    /** called once to run */
    console.time('::TRIMMED:: '+file+' in:'), rerun()
    },
    // init
    fn()
  }

/*sends a flag to know whether the current index of styles is in a comment or not */
const notComment=(styles, index)=>{
  notComment._canAdd===void 0 &&(notComment._canAdd=true);
  switch(loop(styles, {from:index, to:2})[0]) {
    case '/*': notComment._canAdd=0; break;
    case '*/': notComment._canAdd=!0; break;
  }
  return notComment._canAdd
}, 
  /** looks ahead about twice or thrice to know when a closing curly brace has another after it.
   * The condition for the loop terminates when a non-whitespace character like '}' is encountered after the first closing brace
   */
atRuleEnd=(styles, index, exit_rule, res='', arr)=>(arr = loop(styles, { from:index, cb:(s,f, t, bool)=>(bool=!(t=s[++index]||s[--index]).match(/\s/), res+=s[f], exit_rule=t==='}', bool)}), [exit_rule, index, res]);
