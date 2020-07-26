import { EOL } from 'os';

//<script>

// create 1 array per conversion type, filled with arrays of pattern/replacetext pairs


//===========================================================================
// VBS to JS
//===========================================================================
/* good pattern parts

capture optional 2nd param & preceding comma -->	, blah
(,?\\s*[^,\\)' + EOL + ']*)

whatever after last pattern and before close of parens or end of line -->	blah..)
[^\\)' + EOL + ']*[\\)' + EOL + ']?


TODO:
	-finish/fix select case
	-exit function -> ...?
	/-lcase/ucase -> toLowerCase()/toUpperCase()
	/-sub/function object_OnEvent --> object.onevent=function

*/

type ConversionReplacementFunction = (matched: string) => string;
type ConversionReplacement = string | ConversionReplacementFunction;

class ConversionStep {
    constructor(public matcher: string, public replacement: ConversionReplacement) {}
}

var arrVBStoJS: ConversionStep[] = [];

// single-line comment
arrVBStoJS.push(new ConversionStep('(^[^"]*?)\'', '$1//'));	//TODO: smarter checking for ' nested in "
// multi-line comment
	//arrVBStoJS.push(new ConversionStep('()', '/*$1*/'));

// line continuation _
arrVBStoJS.push(new ConversionStep('_\\s*[' + EOL + ']\\s*', ' '));


//-- proprietary
// confirm
arrVBStoJS.push(new ConversionStep('msgbox\\s*[\(]?\\s*([^\)' + EOL + ']*),\\s*(?:vbYesNo|vbOKCancel)[^\)' + EOL + ']*[\)' + EOL + ']?', 'confirm($1)'));
arrVBStoJS.push(new ConversionStep('confirm\\(([^\)]*)\\)([ \t]*=[ \t]*)(vbOK|vbYes)', 'confirm($1)'));	// strip extra msgbox params
// msgbox
arrVBStoJS.push(new ConversionStep('msgbox\\s*\\(([^\)' + EOL + ']*)\\)', 'alert($1)'));	// with parens
arrVBStoJS.push(new ConversionStep('msgbox\\s*([^\)' + EOL + ']*)', 'alert($1)'));	// w/no parens
// inputbox
arrVBStoJS.push(new ConversionStep('inputbox\\s*[\(]?\\s*([^,\)' + EOL + ']*)(,?\\s*[^,\)' + EOL + ']*)(,?\\s*[^,\)' + EOL + ']*)[^\)' + EOL + ']*[\)' + EOL + ']?', 'prompt($1$3)'));


// declare var/const
arrVBStoJS.push(new ConversionStep('DIM |CONST ', 'var '));

// concat str (skips ISO char entities like &nbsp;)
arrVBStoJS.push(new ConversionStep('(?=\\s*)&(?!#|[a-z]+;)', '+'));


//-- functions
// function return (must be converted 1st, depends on vbs function syntax)
arrVBStoJS.push(new ConversionStep('^FUNCTION[ \t]*([^\(]*)(?:.*' + EOL + ')*?END FUNCTION', vb2js_functionreturn));	//<-- note: replacement is actually function pointer
// declare function/sub
arrVBStoJS.push(new ConversionStep('^([ \t/]*)(?:FUNCTION|SUB)[ \t]+(.+)' + EOL + '', '$1function $2{' + EOL));	//TODO: correct paren-less procs
// sub/function object_OnEvent (must run after declare function/sub above)
arrVBStoJS.push(new ConversionStep('^([ \t/]*)(?:function)[ \t]+([a-z][a-z0-9]*\)_(on[a-z0-9]+)', '$1$2.$3 = function'));
// end function/sub/if/select
//	arrVBStoJS.push(new Array('END (FUNCTION|SUB|IF|SELECT)', '}'));
	arrVBStoJS.push(new ConversionStep('END (FUNCTION|SUB|IF)', '}'));
// call function/sub
arrVBStoJS.push(new ConversionStep('call ', ''));



//-- comparison operators
// equal  (must be run before IF statement conversion)
arrVBStoJS.push(new ConversionStep('(IF\\s+\\S+\\s*)=(\\s*\\S+\\s+THEN)', "$1==$2"));
//arrVBStoJS.push(new ConversionStep('(\\sif.+)=(.+then)', '$1==$2');	//<-- example for JS if statement
// not
arrVBStoJS.push(new ConversionStep('(\\s+)NOT(\\s+)', "$1!$2"));
// not equal
arrVBStoJS.push(new ConversionStep('(\\s*)<>(\\s*)', "$1!=$2"));
// and
arrVBStoJS.push(new ConversionStep('(\\s+)AND(\\s+)', "$1&&$2"));
// or
arrVBStoJS.push(new ConversionStep('(\\s+)OR(\\s+)', "$1||$2"));


//-- IF statement
// if
arrVBStoJS.push(new ConversionStep('(\\b)IF(\\s+)','$1if('));
// then
arrVBStoJS.push(new ConversionStep('(\\s+)THEN(\\b)', '){$2'));
// else
arrVBStoJS.push(new ConversionStep('(\\b)ELSE(\\b)', '$1}else{$2'));
// else if
arrVBStoJS.push(new ConversionStep('(\\b)ELSEIF(\\s+)', '$1}else if('));
// end if
arrVBStoJS.push(new ConversionStep('(\\b)ENDIF|END IF(\\b)', "$1}$2"));


//-- SELECT CASE statement
// case
//arrVBStoJS.push(new ConversionStep('^([ \t]*)CASE[ \t]+([^' + EOL + '\:]+)(?:[\:' + EOL + ']*)','$1case $2:' + EOL));
//arrVBStoJS.push(new ConversionStep('^([ \t]*)CASE[ \t]+([^' + EOL + '\:]+)(?:[\:' + EOL + ']*)(?!CASE|END SELECT)','$1case $2: {' + EOL + '$2' + EOL + '$1}' + EOL));
// arrVBStoJS.push(new ConversionStep('^([ \t]*)CASE[ \t]+([^' + EOL + '\:]+)(?:[\:' + EOL + ']*)([.' + EOL + ']*?)([ \t]*CASE|[ \t]*END SELECT)','$1case $2: {' + EOL + '$3' + EOL + '$1}' + EOL + '$4'));
// arrVBStoJS.push(new ConversionStep('^([ \t]*)CASE[ \t]+([^' + EOL + '\:]+)(?:[\:' + EOL + ']*)([.\n]*)(?=[ \t]*CASE)','$1case $2: {' + EOL + '$3' + EOL + '$1}' + EOL));
//arrVBStoJS.push(new ConversionStep('^([ \t]*)CASE[ \t]+([^' + EOL + '\:]+)([\:' + EOL + ']*)(.*)(?=([ \t]*CASE|[ \t]*END SELECT))','$1case $2: {' + EOL + '$4$1$1break' + EOL + '$1}' + EOL));
//arrVBStoJS.push(new ConversionStep('^([ \t]*)CASE[ \t]+([^' + EOL + '\:]+)([\:' + EOL + ']*)(.*)','$1case $2: {' + EOL + '$4$1$1break' + EOL + '$1}'));
//arrVBStoJS.push(new ConversionStep('^([ \t]*)CASE[ \t]+([^' + EOL + '\:]+)([\:' + EOL + ']*)(.*)','$1case $2: {' + EOL + '$4$1$1break' + EOL + '$1}'));
//arrVBStoJS.push(new ConversionStep('^([ \t]*)(CASE)(.*?)(\:|' + EOL + ')([.' + EOL + ' \ta-z0-9\(\)\"\']*?)^([ \t]*CASE|[ \t]*END SELECT)','$1case$3 {' + EOL + '$5$1}' + EOL + '$6'));
arrVBStoJS.push(new ConversionStep('^([ \t]*)(CASE)(.*?)(\:|' + EOL + ')([.' + EOL + ' \ta-z0-9\(\)\"\']*?)^(?=[ \t]*CASE|[ \t]*END SELECT)','$1case$3: {' + EOL + '$5$1$1break' + EOL + '$1}' + EOL));

// select case
arrVBStoJS.push(new ConversionStep('^([ \t]*)SELECT CASE ([^\\r\\n]+)' + EOL + '','$1switch($2){' + EOL));
// end select
arrVBStoJS.push(new ConversionStep('^([ \t]*)END SELECT','$1}'));


//-- LOOPs
// do until/while
// while/wend
// for x = ... next
// for each ... next


//-- OBJECT stuff
// instantiate object
arrVBStoJS.push(new ConversionStep('[\\s]*(Server.)*CreateObject\\("', ' new ActiveXObject("'));
// SET
arrVBStoJS.push(new ConversionStep('\\sSET\\s+', ''));
// nothing
arrVBStoJS.push(new ConversionStep('nothing', 'null'));



//-- built-in functions
// isNumeric
arrVBStoJS.push(new ConversionStep('NOT isNumeric\\(([^\)]*)\\)', 'isNaN($1)'));
arrVBStoJS.push(new ConversionStep('isNumeric\\(([^\)]*)\\)[ \t]*=[ \t]*false', 'isNaN($1)'));
arrVBStoJS.push(new ConversionStep('isNumeric\\(([^\)]*)\\)', '!isNaN($1)'));
// uCase
arrVBStoJS.push(new ConversionStep('uCase\\(([^\)]*)\\)', '$1.toUpperCase()'));
// lCase
arrVBStoJS.push(new ConversionStep('lCase\\(([^\)]*)\\)', '$1.toLowerCase()'));




//-- misc


// Option Explicit
arrVBStoJS.push(new ConversionStep('^Option\\s+Explicit.*[' + EOL + ']', ''));
// On Error Resume Next
arrVBStoJS.push(new ConversionStep('^On\\s+Error\\s+Resume\\s+Next.*[' + EOL + ']', 'window.onerror=null' + EOL));
	//arrVBStoJS.push(new ConversionStep('^On\\s+Error\\s+Resume\\s+Next.*[' + EOL + ']', '// window.onerror=null' + EOL));
// On Error Goto 0
arrVBStoJS.push(new ConversionStep('^On\\s+Error\\s+.+.*[' + EOL + ']', 'window.detachEvent("onerror")' + EOL));
	//arrVBStoJS.push(new ConversionStep('^On\\s+Error\\s+.+.*[' + EOL + ']', '// window.detachEvent("onerror")' + EOL));



// terminate statement
arrVBStoJS.push(new ConversionStep('^([ \t]*)(?!//|function|sub|end sub|end function|if|elseif|else|end if|select|case)(.*)([^\{\}])' + EOL + '', '$1$2$3;' + EOL));
	//arrVBStoJS.push(new ConversionStep('^([ \t]*)(?!\/\/|function|sub|end sub|end function|if|elseif|else|end if|select|case)([^\{\}]*)' + EOL + '', '$1$2;' + EOL));


// cleanup extra semicolons
arrVBStoJS.push(new ConversionStep('(^[ \t]*)\;' + EOL + '',  EOL));	// blank lines
//arrVBStoJS.push(new ConversionStep('(CASE)(\\s+[^' + EOL + ']+);', '$1$2'));	// (switch) case statements
	//arrVBStoJS.push(new ConversionStep('([\{\} \t]);' + EOL + '', '$1' + EOL));


// line combination :		// <-- needs more
//arrVBStoJS.push(new ConversionStep('(?=.+):', ';'));
//arrVBStoJS.push(new ConversionStep('^([ \t]*)(?!case)([ \t]+[^' + EOL + ']+)' + EOL + '', '$1$2;' + EOL));

//arrVBStoJS.push(new ConversionStep('', ''));





//-- vbs constants
// String
arrVBStoJS.push(new ConversionStep('vbCRLF', "'\\r\\n'"));
arrVBStoJS.push(new ConversionStep('vbCR', "'\\r'"));
arrVBStoJS.push(new ConversionStep('vbLF', "'\\n'"));
arrVBStoJS.push(new ConversionStep('vbTab', "'\\t'"));
// MsgBox
arrVBStoJS.push(new ConversionStep('vbOK', '1'));
arrVBStoJS.push(new ConversionStep('vbCancel', '2'));
arrVBStoJS.push(new ConversionStep('vbAbort', '3'));
arrVBStoJS.push(new ConversionStep('vbRetry', '4'));
arrVBStoJS.push(new ConversionStep('vbIgnore', '5'));
arrVBStoJS.push(new ConversionStep('vbYes', '6'));
arrVBStoJS.push(new ConversionStep('vbNo', '7'));
// Comparison
arrVBStoJS.push(new ConversionStep('vbBinaryCompare', '0'));
arrVBStoJS.push(new ConversionStep('vbTextCompare', '1'));
// Tristate
arrVBStoJS.push(new ConversionStep('vbUseDefault', '-2'));
arrVBStoJS.push(new ConversionStep('vbTrue', '-1'));
arrVBStoJS.push(new ConversionStep('vbFalse', '0'));
// VarType
arrVBStoJS.push(new ConversionStep('vbEmpty', '0'));
arrVBStoJS.push(new ConversionStep('vbNull', '1'));
arrVBStoJS.push(new ConversionStep('vbInteger', '2'));
arrVBStoJS.push(new ConversionStep('vbLong', '3'));
arrVBStoJS.push(new ConversionStep('vbSingle', '4'));
arrVBStoJS.push(new ConversionStep('vbDouble', '5'));
arrVBStoJS.push(new ConversionStep('vbCurrency', '6'));
arrVBStoJS.push(new ConversionStep('vbDate', '7'));
arrVBStoJS.push(new ConversionStep('vbString', '8'));
arrVBStoJS.push(new ConversionStep('vbObject', '9'));
arrVBStoJS.push(new ConversionStep('vbError', '10'));
arrVBStoJS.push(new ConversionStep('vbBoolean', '11'));
arrVBStoJS.push(new ConversionStep('vbVariant', '12'));
arrVBStoJS.push(new ConversionStep('vbDataObject', '13'));
arrVBStoJS.push(new ConversionStep('vbDecimal', '14'));
arrVBStoJS.push(new ConversionStep('vbByte', '17'));
arrVBStoJS.push(new ConversionStep('vbArray', '8192'));






//==== extended, procedural conversions ====

// convert 'functionname=returnval' to 'return returnval'
function vb2js_functionreturn(p_strFunction: string): string {
	var re = new RegExp('^FUNCTION[ \t]*([^\(]*)(?:.*' + EOL + ')*?END FUNCTION', 'igm');
	re.exec(p_strFunction);
	var strFunctionName = RegExp.$1;


	var reReturn = new RegExp('(' + strFunctionName + '\\s*\=\\s*)(.*)(?=\\s*^END[ \t]*FUNCTION)', 'igm')
	var strRet = p_strFunction.toString().replace(reReturn, 'return $2');
	return strRet;
}



//--------------------------------------------------------------------------------
/*


//Select Case regexp - needs work

var selectRegExp = new Array(/(\s+)select
case\s*(\w*)\s+\n/gi,"$1switch($2){\n");
var breakRegExp = new
Array(/(\s+case\s*)([\S*|\s*]*)(\s+case)/gi,"$1$2\nbreak;$3");
var caseElseRegExp = new Array(/(\s+)case else\s/gi,"$1default: ");
var caseRegExp = new Array(/(\s+)case\s*(\S*)\s/gi,"$1case $2: ");
var	endSelectRegExp = new Array(/(\s+)end select\s+/gi,"$1}\n");


//if statement parser
var parseArray = new Array();
var startPos = 0;
var charCount = 0;
var endPos = 0;
var inString = "";

function parse()
{
	inString = new String(document.getElementById("txtVBS").value);
	parseIf();
	var outString = ""
	for (var i = 0; i < parseArray.length; ++i)
	{
		outString += parseArray[i];
	}
	document.getElementById("txtJS").value=outString;
}

function parseIf()
{
	var thenPos = -1;
	var c = inString.charCodeAt(25);
	while( endPos < inString.length)
	{
		var ch = inString.charCodeAt(endPos);
		if(ch <= 32)
		{
			var token = inString.substring(startPos, endPos);
			switch(token)
			{
				case "if":
					parseArray.push("if(");
					thenPos = inString.indexOf("then", startPos);
					if (thenPos > -1)
					{
						startPos = ++endPos;
						parseCondition(inString, thenPos);
					}
					--endPos;
					break;
				case "then":
					parseArray.push("){");
					break;
				case "else":
					parseArray.push("}else{");
					break;
				case "elseif":
					parseArray.push("}else{");
					startPos = endPos - 2;
					parseIf();
					break;
				case "end":
					++endPos;
					break;
				case "endif":
				case "end if":
					parseArray.push("}");
					return;
					break;
				default:
					parseArray.push(inString.substring(startPos, endPos));
					if(ch==13)
						parseArray.push(";");
					else
						parseArray.push(String.fromCharCode(ch));
			}
			if(ch==13)
				parseArray.push("\n");
			if(token != "end")
			{
				startPos = ++endPos;
			}
		}
		else
			++endPos;
	}
}


function parseCondition(inString, thenStart)
{
	while(startPos < thenStart && endPos < thenStart)
	{
		var ch = inString.charAt(endPos);
		switch(ch)
		{
			case "=":
				if(startPos != endPos)
				{
					parseArray.push(inString.substring(startPos,endPos));
					startPos = ++endPos;
				}
				parseArray.push("==");
				break;
			default:
				if(ch.charCodeAt(0) <= 32)
				{
					var token = inString.substring(startPos, endPos);
					switch(token)
					{
						case "and":
							parseArray.push("&& ");
							break;
						case "or":
							parseArray.push("|| ");
							break;
						case "<>":
							parseArray.push("!= ");
							break;
						case "not":
							parseArray.push("! ");
							break;
						case "_":
							break;
						default:
							parseArray.push(inString.substring(startPos, endPos));
							parseArray.push(ch);
					}
					if(ch==13)
					{
						parseArray.push("\n");
					}
					startPos = ++endPos;
				}
				else
					++endPos;

		}

	}
}







//================================


var ifRegExp = new ConversionStep(/\s+if\s+/gi,"if(");
var thenRegExp = new ConversionStep(/\s+then\s+/gi,"){\n");
var elseRegExp = new ConversionStep(/\s+else\s+/gi,"\n}else{\n");
var elseifRegExp = new ConversionStep(/\s+elseif\s+/gi,"\n}else \nif(");
var endifRegExp = new ConversionStep(/\s+endif|end if\s+/gi,"\n}");
var equalsRegExp = new ConversionStep(/(\s+if\s+[\s*|\S*]+\s+)=(\s+[\s*|\S*]+\s+then\s+)/gi,"$1==$2");
var notRegExp = new ConversionStep(/(\s+if\s+[\s*|\S*]+)not([\s*|\S*]+\s+then\s+)/gi,"$1 ! $2");
var notEqualRegExp = new ConversionStep(/(\s+if\s+[\s*|\S*]+)<>([\s*|\S*]+\s+then\s+)/gi,"$1 != $2");
var andRegExp = new ConversionStep(/(\s+if\s+[\s*|\S*]+)and([\s*|\S*]+\s+then\s+)/gi,"$1 && $2");
var orRegExp = new ConversionStep(/(\s+if\s+[\s*|\S*]+) or ([\s*|\S*]+\s+then\s+)/gi,"$1 || $2");

function parse()
{
	var inString = new String(document.getElementById("txtVBS").value);
	var outString = inString.replace(elseifRegExp.matcher,"\n}else \nif(");
	outString = inString.replace(equalsRegExp.matcher,equalsRegExp.replacement);
	outString = outString.replace(andRegExp.matcher,andRegExp.replacement);
	outString = outString.replace(orRegExp.matcher,orRegExp.replacement);
	outString = outString.replace(notRegExp.matcher,notRegExp.replacement);
	outString = outString.replace(notEqualRegExp.matcher,notEqualRegExp.replacement);
	outString = outString.replace(endifRegExp.matcher,endifRegExp.replacement);
	outString= outString.replace(ifRegExp.matcher,ifRegExp.replacement);
	outString= outString.replace(thenRegExp.matcher,thenRegExp.replacement);
	outString = outString.replace(elseRegExp.matcher,elseRegExp.replacement);
	outString = outString.replace(elseifRegExp.matcher,elseifRegExp.replacement);

	document.getElementById("txtJS").value=outString;
}


*/

export { ConversionStep, arrVBStoJS as conversionSteps, ConversionReplacement, ConversionReplacementFunction };
