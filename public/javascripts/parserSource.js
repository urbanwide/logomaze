/*
 * Martin Korbel, 2010
 * last change: 28-04-2011 
 * version: 1.0.1 
 */

/**
 * Add brackets to source
 */
function AddBracket(text) {
  function AddBracketStep(text,reg, bracket) {
      var rr;
      // Odstraneni samostatne subst. v  zavorkach
      text = text.replace(/\( (\$?\d+) \)/,"$1");
      while ((rr = text.match(reg)) != null) {
	var ins = (bracket?rr[1]:'( '+rr[1]+' )');
	var inx = BracketList.push(ins) - 1;
 	// alert((!bracket?rr[1]:"\\( "+rr[1]+" \\)"));
  	text = text.replace(rr[1],"$"+inx+"");
      }    
      return text;               
   }

   function BackBracketStep(text) {
      while ((rr = text.match(" \\$(\\d+)\\s?")) != null) {
 	text = text.replace(" $"+rr[1]+" ", " "+BracketList[rr[1]]+" ");
      }
      return text;
    }

    var BracketList = new Array();
    var opList = [[2,"\\^"],[1,'sqrt'],[2,"\\*"],[2,"\\/"],[2,"\\+"],[2,"\\-"], [1,"(arctan|arcsin|arccos|sin|cos|tan)"]];
    var cc = "([\\d\\.\\-]+|[\\:\\$][\\d\\w]+)";
    var oldtext;

    //text = AddBracketStep(text,"[^\\d\\$]\\s*(\\-\\s*"+cc+")",false);

    while(oldtext!=text) {
        oldtext = text
        for (var opIndex in opList) {
            var reg;
            if(opList[opIndex][0] == 2) {
                reg = "(\\( "+cc+" "+opList[opIndex][1]+" "+cc+" \\))";
            } else {
                reg = "(\\( "+opList[opIndex][1]+" "+cc+" \\))";
            }
            text = AddBracketStep(text,reg,true);
        }
    }
    oldtext = null;
    while(oldtext!=text) {
        oldtext = text
        for (var opIndex in opList) {
            var reg;
            if(opList[opIndex][0] == 2) {
                reg = "("+cc+" "+opList[opIndex][1]+" "+cc+")";
            } else {
                reg = "("+opList[opIndex][1]+" "+cc+")";
            }
            text = AddBracketStep(text,reg,false);
        }
     }

    return BackBracketStep(text + " ");
}

/*
* Class to parse source code
*
*/


function ParserSource(turtle, source) {

   // Stream of command;   
   this.turtle = null;   

   // All Sates
   var states = {
       EMPTY:0, FORWARD:1, BACK:2, LEFT: 3, RIGHT:4, MUST_OPERATOR:5, OPLUS:6, OMINUS:7,
       OMULTI:8, ODIVI:9, OPOWER:10, SIN:11, COS:12, TAN:13, ATAN:14, SQRT:15,
       REPEAT:16, REPEAT_START:17, IF:18, OSMALL:19, OBIG:20, OESMALL:21, OEBIG: 22,
       OEQUAL: 23, IFFIRST:24, IFSEC:25, IFSECN:26, REPEAT_CONTENT:27, IFELSE:28,
       FUNCTION_HEAD: 29, FUNCTION_PARAM:30, FUNCTION_CONNTEN:31, FUNCTION_GO:32,
       FUNCTION_SLEEP:33, ASIN: 34, ACOS: 35
   }

   /*
    * States
    * @property Array
    */
   this.state =  [states.EMPTY];
   /*
    * space of variables
    *  @property Array
    */
   this.heap = [[],[]];

    /*
    * stack of variables
    *  @property Array
    */
   this.stack = new Array();

   /**
    * Functions
    */
   this.functions = new Array();

   this.source = [];

   this.oldSource = [[]];

   this.newKay = null;

   // enable skip command
   this.norun = false;
   this.nosave = false;

   this.line = 0;

   this.onChangeRow = null;

   // steping code
   this.steping = false;

   //
   this.stepingInFunction = false;

   // Stop debugging
   this.stop = false;

   // vrati promennou
   // @private
   this.getVar = function(name, recurse){
       var len = this.state.length;
       if(len >= this.heap.length) {
           len = len - 1;
       }
       var res;
       if (recurse == true) {
           for(iLoop=len; iLoop>=0 && res == null; iLoop--){
               res = this.heap[iLoop][name];
           }
       } else {
           res = this.heap[len][name];
       }
       return res;
   }

   // vrati vsechny promenne
   this.getAllVar = function() {
       var res = [];
       var len = this.heap.length;
       for(iLoop=0; iLoop < len; iLoop++){
           for(var name in this.heap[iLoop]) {
             res[name] = this.heap[iLoop][name];
           }
       }
       return res;
   }

   // nastavi promenou
   this.setVar = function(name, val){
       var len = this.state.length;
       if(len >= this.heap.length) {
           len = len - 1;
       }
       this.heap[len][name] = val;
   }

   // Zanori prostor
   this.createSpace = function() {
       this.state.unshift(states.EMPTY);
       this.heap[this.state.length] = [];
       this.heap[this.state.length]['_norun'] = false;
   }
  
   // vynori prostor
   this.deleteSpace = function() {
       this.heap[this.state.length] = null;
       return this.state.shift();
   }

   // get lireal
   this.getWord = function() {
       var key;
       do {
           if(this.getSourceLength() == 0) return null;
           key = this.source.shift().toLowerCase();
       } while (key=='' || key==' '); 
       if(!this.nosave) {
        this.oldSource[0].push(key);
       }
       return key;
   }

   // vraci prikazy do vstupniho seznamu
   this.backWord = function(num, toList, noline) {
        if(toList == null) {
            toList = this.source;
        }
        var key;
        for(iLoop=0; iLoop<num; iLoop++) {
            key = this.oldSource[0].pop();
            toList.unshift(key);
            if(key=='##' && noline!=true) {
               this.line = this.line - 1;
           }
        }        
   }

   this.testWord = function(req) {
       var iLoop=0;
       for(iLoop=0; iLoop<this.getSourceLength() && this.source[iLoop]=='##'; iLoop++ ) {}
       return (this.source[iLoop].toLowerCase().match(req) != null);
   }

   this.getSourceLength = function() {
       var res = 0;
       if(this.source != null) {
           res = this.source.length;
       }
       return res;
   }


   // Zpracovavej cisla
   this.number = function(key) {
       switch (this.state[0]) {
           case states.BACK:
                key = -1*key;
           case states.FORWARD:
                //alert(key);
                this.turtle.forward(key);
                this.state[0]  = states.EMPTY;
               break;
           case states.RIGHT:
                key = -1*key;
           case states.LEFT:
                this.turtle.left(key);
                this.state[0] = states.EMPTY;
               break;
           case states.EMPTY:
                this.stack.unshift(key);                                                                
                this.state[0] = states.MUST_OPERATOR;
               break;
           case states.OPLUS:
                  var op1 = this.stack.shift();
                  op1 = op1 + key;
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
            case states.OMINUS:
                  var op1 = 0;
                  if(isFinite(this.stack[0])) {
                    op1 = this.stack.shift();
                  }
                  op1 = op1 - key;
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
            case states.OMULTI:
                  var op1 = this.stack.shift();
                  op1 = op1 * key;
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
             case states.ODIVI:
                  if(key == 0) {
                      throw new Error(ErrorMessages(100,this.line));
                  }
                  var op1 = this.stack.shift();
                  op1 = round(op1 / key);
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
             case states.OPOWER:
                  var op1 = this.stack.shift();
                  op1 = Math.pow(op1,  key);
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
              case states.OSMALL:
                  var op1 = this.stack.shift();
                  op1 = (op1 - key) < 0;
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
              case states.OESMALL:
                  var op1 = this.stack.shift();
                  op1 = (op1 - key) <= 0;
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
              case states.OBIG:
                  var op1 = this.stack.shift();
                  op1 = (op1 - key) > 0;
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
              case states.OEBIG:
                  var op1 = this.stack.shift();
                  op1 = (op1 - key) >= 0;
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
              case states.OEQUAL:
                  var op1 = this.stack.shift();
                  op1 = (op1 - key) == 0;
                  this.stack.unshift(op1);
                  this.state[0]  = states.EMPTY;
                break;
              case states.SIN:
                  this.stack.unshift(round(Math.sin(deg2rad(key))));
                  this.state[0]  = states.EMPTY;
                break;
              case states.COS:
                  this.stack.unshift(round(Math.cos(deg2rad(key))));
                  this.state[0]  = states.EMPTY;
                break;
              case states.TAN:
		  var tt = key - (Math.round(key / 90) * 90)
		  if (tt == 0) {
			throw new Error(ErrorMessages(180,this.line, key));
		  }
                  this.stack.unshift(round(Math.tan(deg2rad(key))));
                  this.state[0]  = states.EMPTY;
                break;
              case states.ASIN:
                  this.stack.unshift(round(rad2deg(Math.asin(key))));
                  this.state[0]  = states.EMPTY;
                break;
              case states.ACOS:
                  this.stack.unshift(round(rad2deg(Math.acos(key))));
                  this.state[0]  = states.EMPTY;
                break; 	
              case states.ATAN:
                  this.stack.unshift(round(rad2deg(Math.atan(key))));
                  this.state[0]  = states.EMPTY;
                break; 		
              case states.SQRT:
		  if(key < 0) {
                      throw new Error(ErrorMessages(170,this.line, key));
                  }		 
                  this.stack.unshift(round(Math.sqrt(key)));
                  this.state[0]  = states.EMPTY;
                break;
               case states.REPEAT:
                  this.stack.unshift(key);
                  this.state[0]  = states.REPEAT_START;
                  break;
               case states.IFELSE:
               case states.IF:
                  //this.state.unshift(states.MUST_OPERATOR);
                  this.createSpace();
                  this.stack.unshift(key);                  
                  break;
               case states.FUNCTION_GO:
                    var len = this.stack.shift() - 1;
                    this.stack.unshift(key);
                    this.stack.unshift(len);
                    if(len == 0) {
                        this.goFunction();
                    }
                  break;
               default:
                  throw new Error(ErrorMessages(110,this.line, key));
       }
       return false;
   }

   // Spust funkci
   this.goFunction = function() {
        if(!this.stepingInFunction && this.debugBreak()){
            if(this.onChangeRow!=null) {
                 this.onChangeRow(this.line+1);
            }
            this.stepingInFunction = true;
            this.stop = true;
            return true;
        }
        this.stepingInFunction = false;
        this.stack.shift();
        var fun = this.functions[this.getVar('_afunction')];
        this.setVar('_afunction', null);
        this.setVar('_line', this.line);
        this.createSpace();
        var num_param = fun.params.length;
        for(iLoop=num_param; iLoop>0; iLoop--) {
            this.setVar(fun.params[iLoop-1], this.stack.shift());
        }
        //this.nosave = true;
        var com = fun.source.length;
        for(iLoop=com-1; iLoop>=0; iLoop--) {
            this.source.unshift(fun.source[iLoop]);
        }
        this.oldSource.unshift([]);
        this.line = fun.line+1;
   }

   // Zpracovavej text
   this.command = function(key) {
       if(this.state[0] == states.FUNCTION_PARAM) {
           var index = this.getVar('_goBackTo');
           this.setVar('_goBackTo',null);
           this.createSpace();
           this.setVar('_norun',true);
           this.setVar('_goBackTo',index);
           this.state[0] = states.FUNCTION_CONNTEN;
           return 0;
       }
       switch (key) {
               case 'fd':
               case 'forward':
                    this.state[0] = states.FORWARD;
                   break;
               case 'lt':
               case 'left':
                    this.state[0] = states.LEFT;
                   break;
               case 'rt':
               case 'right':
                    this.state[0] = states.RIGHT;
                   break;
               case 'bk':
               case 'back':
                    this.state[0] = states.BACK;
                   break;
               case 'pu':
               case 'penup':
                    this.turtle.penup();
                    this.state[0]  = states.EMPTY;
                    break;
               case 'pd':
               case 'pendown':
                    this.turtle.pendown();
                    this.state[0]  = states.EMPTY;
                    break;
               case 'home':
                    this.turtle.home();
                    this.state[0]  = states.EMPTY;
                    break;
               case 'clearscreen':
               case 'cs':
                    this.turtle.home();
               case 'clean':
                    this.turtle.clean();
                    this.state[0]  = states.EMPTY;
                    break;
               case 'showturtle':
               case 'st':
                    this.turtle.show();
                    this.state[0]  = states.EMPTY;
                    break;
               case 'hideturtle':
               case 'ht':
                    this.turtle.hide();
                    this.state[0]  = states.EMPTY;
                    break;
               case 'sin':
                    this.state[0]  = states.SIN;
                    break;
               case 'arcsin':
                    this.state[0]  = states.ASIN;
                    break;
               case 'cos':
                    this.state[0]  = states.COS;
                    break;
               case 'arccos':
                    this.state[0]  = states.ACOS;
                    break;
               case 'tan':
                    this.state[0]  = states.TAN;
                    break;
               case 'arctan':
                    this.state[0]  = states.ATAN;
                    break;
               case 'sqrt':
                    this.state[0]  = states.SQRT;
                    break;
               case 'repeat':
                    this.state[0]  = states.REPEAT;
                    break; 
               case 'if':
                   this.state[0]  = states.IF;
                    break;
               case 'ifelse':
                   this.state[0]  = states.IFELSE;
                    break;
               case 'to':
                   this.state[0]  = states.FUNCTION_HEAD;
                   this.functions.unshift({name:'', params:[], source:[], line:this.line+0});
                    break;
	       case 'true':
		    this.createSpace();	
		    this.stack.unshift(1);
                    break;
               case 'false':  		
		    this.createSpace();
		    this.stack.unshift(0);	
                    break;
               default:
                   if(this.state[0]  == states.FUNCTION_HEAD) {
                       this.functions[0].name = key;
                       this.state[0]  = states.FUNCTION_PARAM;
                       this.setVar('_goBackTo',this.oldSource[0].length);
                   } else {
                       var len =  this.functions.length;
                       var numParam = 0;
                       for(iLoop=0;iLoop<len;iLoop++) {
                           if(this.functions[iLoop].name == key) {
                               this.setVar('_afunction',iLoop);
                               numParam = this.functions[iLoop].params.length
                               this.stack.unshift(numParam);
                               this.state[0] = states.FUNCTION_GO;
                               break;
                           }
                       }
                       if (numParam == 0 && this.state[0] == states.FUNCTION_GO) {
                               //this.stack.unshift(key);
                               this.stack.unshift(0);
                               this.goFunction();
                       }else if(this.state[0] != states.FUNCTION_GO) {
                           throw new Error(ErrorMessages(120,this.line, key) );
                       }
                   }
                   
           }
           return false;
   }

   // Zpracovavej zavorky
   this.bracket = function(key) {
       var norun = this.getVar('_norun');
       switch(key) {
               case '(':
                    if(!norun) {
                        //this.state.unshift(states.EMPTY);
                        this.createSpace();
                        this.stack.unshift(key);
                    }
                    break;

               case ')':
                    if(!norun) {
                        // vezmeme ze zasobniku vyslednou hodnotu a odzavorkujeme ji a pak ji dame zpet
                        this.newKay = this.stack.shift();
                        if((this.state[0] != states.EMPTY && this.state[0] != states.MUST_OPERATOR)
                           || this.stack[0] != '(' ) {
                            throw new Error(ErrorMessages(130,this.line));
                        } else {
                            //this.state.shift();
                            this.deleteSpace();
                            this.stack.shift();
                        }
                        //this.stack.unshift(key);
                    }
                    break;
                case '[':
		     if( this.state[0] == states.EMPTY && norun) {
			 this.stack.unshift('[');			 
		     } else if(this.state[0] == states.REPEAT_START) {
                        this.state[0]  = states.REPEAT_CONTENT;                        
                        this.createSpace();
                        var count = this.stack.shift();
                        if(count<1) {
                            this.setVar('_norun',true);
                        } 
                        this.setVar('_counter',count);
                        this.setVar('_goBackTo',this.oldSource[0].length + (this.source[0]=='##'?1:0));
                        //this.setVar('_line', this.line);
                        
                        //this.stack.unshift(key);
                     } else if (this.state[0] == states.IFSEC ||
                                this.state[0] == states.IFSECN) {
                        this.createSpace();
                        if(this.state[1] == states.IFSECN) {
                            this.setVar('_norun',true);
                        }
                     } else  if(this.state[1] == states.IF ||
                                this.state[1] == states.IFELSE) {
                        var con = this.stack.shift();
                        this.deleteSpace();
                        if (this.state[0] == states.IFELSE) {
                            this.state[0] = states.IFFIRST;
                        }
                        this.createSpace();
                        if(!con) {
                            this.setVar('_norun',true);
                        }
                     } else if(norun) {
                         this.createSpace();
                         this.state[0] = states.FUNCTION_SLEEP;
                         this.setVar('_norun',true);
                         //this.setVar('_bracket',0);
                     }
                    break;
                case ']':
	            if( this.state[0] == states.EMPTY && norun && this.stack[0] == '[') {
			 this.stack.shift();			 
		    } else if(this.state[1] == states.REPEAT_CONTENT) {                        
                        var counter = this.getVar('_counter');
                        if(counter>1) {
                            this.setVar('_counter',counter-1);                            
                            var n = this.oldSource[0].length - this.getVar('_goBackTo');
                            this.backWord(n);
                            //this.line = this.getVar('_line');
                        }else{                 
                            this.deleteSpace();                            
                            this.state[0]  = states.EMPTY;                            
                        }
                    } else if (this.state[1] == states.IFFIRST ||
                               this.state[1] == states.IF ) {
                        this.deleteSpace();
                        if (this.state[0] == states.IFFIRST) {
                            if(norun == false) {
                                 this.state[0]  = states.IFSECN;
                            } else {
                                this.state[0]  = states.IFSEC;
                            }
                        } else {
                            this.state[0]  = states.EMPTY;
                        }
                    } else if (this.state[1] == states.IFSEC ||
                                this.state[1] == states.IFSECN) {
                        this.deleteSpace();
                        this.state[0]  = states.EMPTY;
                    } else if(norun) {
                        if(this.state[0] != states.FUNCTION_SLEEP) {
                            throw new Error(ErrorMessages(140,this.line));
                        }                        
                        this.deleteSpace();
//                         this.setVar('_norun',true);
                     }

                    break;

       }
   }

   // Zpracovavej operatory
   this.operator = function(key) {
       switch(key) {
           case '+':
                 this.state[0] = states.OPLUS;
                break;
           case '-':
                 this.state[0] = states.OMINUS;
                break;
           case '*':
                 this.state[0] = states.OMULTI;
                break;
           case '/':
                 this.state[0] = states.ODIVI;
                break;
           case '^':
                 this.state[0] = states.OPOWER;
                break;
           case '<':
                 this.state[0] = states.OSMALL;
                break;
           case '>':
                 this.state[0] = states.OBIG;
                break;
           case '=':
                 switch(this.state[0]) {
                    case states.OSMALL:
                         this.state[0] = states.OESMALL;
                        break;
                    case states.OBIG:
                         this.state[0] = states.OEBIG;
                        break;
                    default:
                         this.state[0] = states.OEQUAL;
                 }
                break;
       }
   }

   // Zpracovavej promenne
   this.variable = function(key) {
       switch(this.state[0]) {
           case  states.FUNCTION_PARAM:
                this.functions[0].params.push(key);
                this.setVar('_goBackTo',this.oldSource[0].length);
               break;
           default:
               var res = this.getVar(key, true);               
               if(res === undefined) {
                  throw new Error(ErrorMessages(150,this.line, key));
               }
               this.newKay = res;
       }
   }

   // Konec funkce
   this.endFunction = function() {
      if(this.state[0] == states.FUNCTION_CONNTEN) {
        var num = this.getVar('_goBackTo');
        this.backWord(this.oldSource[0].length-num-1,this.functions[0].source,true);                
        this.deleteSpace();
        this.state[0] = states.EMPTY;
      }else if(this.state[1] == states.FUNCTION_GO) {
        this.nosave = false;
        this.oldSource.shift();
        this.deleteSpace();
        this.state[0] = states.EMPTY;
        this.line = this.getVar('_line');
        this.setVar('_line',null);
        if(this.onChangeRow!=null) {
           this.onChangeRow(this.line);
        }
      } else {          
          throw new Error(ErrorMessages(160,this.line));
      }
   }

    /**
    *  Parse code
    *  @param steping enable debugging
    *  @return boolean (false - script finish, true - script continue, only with steping)
    */
   this.parse = function(nofirst) {


       var notend = true;
       if(nofirst != true) {
        this.createSpace();
        this.setVar('_line', 1);
       }
       if(this.stepingInFunction) {
           this.goFunction();
       }
       var key = this.getWord();

       while(notend && key != null) {
           var norun = (this.getVar('_norun') == true);
           if( //(this.state[0] == states.FUNCTION_CONNTEN || this.state[1] == states.FUNCTION_GO) &&
                key.match(/^end$/)!=null){
               this.endFunction();
           }else if(key.match(/^\-?[\d\.]+$/)!=null && !norun) {
               this.number(parseFloat(key));
           } else if(key.match(/^:[A-z0-9]+$/)!=null && !norun) {
               this.variable(key);
           } else if(key.match(/^\w[A-z0-9]+$/)!=null && !norun) {
               this.command(key);
           } else if(key.match(/[\+\-\*\/\^><=]/)!=null && !norun) {
               this.operator(key);
           } else if(key.match(/[\(\)\[\]]+/)!=null) {
               this.bracket(key);
           } else if(key=='##') {               
               this.line = this.line + 1;
//               if(!this.nosave) {
//                    this.oldSource[0].push(key);
//               }
               if(!norun && this.debugBreak()){
                   if(this.onChangeRow!=null) {
                        this.onChangeRow(this.line);
                   }
                   this.stop = true;
               }               
           }

           if(this.stop) {
               this.stop = false;
               return true;
           }
           
           if(this.newKay!=null) {
               key = this.newKay+'';
               this.newKay = null;
           } else {
               key = this.getWord();
           }           
       }
       return false;
   }

   this.debugBreak = function() {       
       // var ii = this.oldSource[0].length - 2;
       if(this.steping == true){ // || (ii>0 && this.oldSource[0][ii]!='##'))) {
          return true;
       }
       return false;
   }

   // Osetreni vstupu pres interpretaci
   this.preprocessing = function(source) {
       this.source = source
                  .replace(/(\W)/g,' $1 ')
                  .replace(/\n/mg, ' ## ')
                  .replace(/\s+/g, ' ')
                  .replace(/: /g, ':')
                  .replace(/ \. /g, '.')
                  .replace(/^/g, ' ')
		  .replace(/( [^\d\:\)][A-z0-9]*) - ([\d\.]+|\:\w+)/g, '$1 -$2');
       this.source = AddBracket(this.source);
       this.source = this.source.split(' ');
   }

   // spusti interpretaci
   this.run = function(source) {
        if(source!=null) {
            this.preprocessing(source);
        }
        var res = this.parse();
        this.turtle.draw();
        return res;
   }

   // spusti krokovani
   this.step = function(source) {
        var nofirst = true;
        if(source!=null && this.source == null) {
            this.preprocessing(source);
            nofirst = false;
        }
        this.steping = true;
        var res = this.parse(nofirst);
        this.turtle.draw();
        return res;
   }

   this.turtle = turtle;
   if(source!=null) {
        this.preprocessing(source);
//       this.run(source);
   }
}
