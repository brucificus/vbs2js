//<script>

// create 1 array per conversion type, filled with arrays of pattern/replacetext pairs


//===========================================================================
// VBS to JS
//===========================================================================
/* good pattern parts

capture optional 2nd param & preceding comma -->	, blah 
(,?\\s*[^,\\)\r\n]*)

whatever after last pattern and before close of parens or end of line -->	blah..)
[^\\)\r\n]*[\\)\r\n]?


TODO: 
	-finish/fix select case
	-exit function -> ...? 
	/-lcase/ucase -> toLowerCase()/toUpperCase()
	/-sub/function object_OnEvent --> object.onevent=function

*/


var arrVBStoJS = new Array();

// single-line comment
arrVBStoJS.push(new Array('(^[^"]*?)\'', '$1//'));	//TODO: smarter checking for ' nested in "
// multi-line comment
	//arrVBStoJS.push(new Array('()', '/*$1*/'));

// line continuation _
arrVBStoJS.push(new Array('_\\s*[\r\n]\\s*', ' '));


//-- proprietary
// confirm
arrVBStoJS.push(new Array('msgbox\\s*[\(]?\\s*([^\)\r\n]*),\\s*(?:vbYesNo|vbOKCancel)[^\)\r\n]*[\)\r\n]?', 'confirm($1)'));
arrVBStoJS.push(new Array('confirm\\(([^\)]*)\\)([ \t]*=[ \t]*)(vbOK|vbYes)', 'confirm($1)'));	// strip extra msgbox params
// msgbox
arrVBStoJS.push(new Array('msgbox\\s*\\(([^\)\r\n]*)\\)', 'alert($1)'));	// with parens
arrVBStoJS.push(new Array('msgbox\\s*([^\)\r\n]*)', 'alert($1)'));	// w/no parens
// inputbox
arrVBStoJS.push(new Array('inputbox\\s*[\(]?\\s*([^,\)\r\n]*)(,?\\s*[^,\)\r\n]*)(,?\\s*[^,\)\r\n]*)[^\)\r\n]*[\)\r\n]?', 'prompt($1$3)'));


// declare var/const
arrVBStoJS.push(new Array('DIM |CONST ', 'var '));

// concat str (skips ISO char entities like &nbsp;)
arrVBStoJS.push(new Array('(?=\\s*)&(?!#|[a-z]+;)', '+'));


//-- functions
// function return (must be converted 1st, depends on vbs function syntax)
arrVBStoJS.push(new Array('^FUNCTION[ \t]*([^\(]*)(?:.*\r\n)*?END FUNCTION', vb2js_functionreturn));	//<-- note: replacement is actually function pointer
// declare function/sub
arrVBStoJS.push(new Array('^([ \t/]*)(?:FUNCTION|SUB)[ \t]+(.+)\r\n', '$1function $2{\r\n'));	//TODO: correct paren-less procs
// sub/function object_OnEvent (must run after declare function/sub above)
arrVBStoJS.push(new Array('^([ \t/]*)(?:function)[ \t]+([a-z][a-z0-9]*\)_(on[a-z0-9]+)', '$1$2.$3 = function'));
// end function/sub/if/select
//	arrVBStoJS.push(new Array('END (FUNCTION|SUB|IF|SELECT)', '}'));
	arrVBStoJS.push(new Array('END (FUNCTION|SUB|IF)', '}'));
// call function/sub
arrVBStoJS.push(new Array('call ', ''));



//-- comparison operators 
// equal  (must be run before IF statement conversion)
arrVBStoJS.push(new Array('(IF\\s+\\S+\\s*)=(\\s*\\S+\\s+THEN)', "$1==$2"));
//arrVBStoJS.push(new Array('(\\sif.+)=(.+then)', '$1==$2');	//<-- example for JS if statement
// not
arrVBStoJS.push(new Array('(\\s+)NOT(\\s+)', "$1!$2"));
// not equal
arrVBStoJS.push(new Array('(\\s*)<>(\\s*)', "$1!=$2"));
// and
arrVBStoJS.push(new Array('(\\s+)AND(\\s+)', "$1&&$2"));
// or
arrVBStoJS.push(new Array('(\\s+)OR(\\s+)', "$1||$2"));


//-- IF statement
// if
arrVBStoJS.push(new Array('(\\b)IF(\\s+)','$1if('));
// then
arrVBStoJS.push(new Array('(\\s+)THEN(\\b)', '){$2'));
// else
arrVBStoJS.push(new Array('(\\b)ELSE(\\b)', '$1}else{$2'));
// else if
arrVBStoJS.push(new Array('(\\b)ELSEIF(\\s+)', '$1}else if('));
// end if
arrVBStoJS.push(new Array('(\\b)ENDIF|END IF(\\b)', "$1}$2"));


//-- SELECT CASE statement
// case
//arrVBStoJS.push(new Array('^([ \t]*)CASE[ \t]+([^\r\n\:]+)(?:[\:\r\n]*)','$1case $2:\r\n'));
//arrVBStoJS.push(new Array('^([ \t]*)CASE[ \t]+([^\r\n\:]+)(?:[\:\r\n]*)(?!CASE|END SELECT)','$1case $2: {\r\n$2\r\n$1}\r\n'));
// arrVBStoJS.push(new Array('^([ \t]*)CASE[ \t]+([^\r\n\:]+)(?:[\:\r\n]*)([.\r\n]*?)([ \t]*CASE|[ \t]*END SELECT)','$1case $2: {\r\n$3\r\n$1}\r\n$4'));
// arrVBStoJS.push(new Array('^([ \t]*)CASE[ \t]+([^\r\n\:]+)(?:[\:\r\n]*)([.\n]*)(?=[ \t]*CASE)','$1case $2: {\r\n$3\r\n$1}\r\n'));
//arrVBStoJS.push(new Array('^([ \t]*)CASE[ \t]+([^\r\n\:]+)([\:\r\n]*)(.*)(?=([ \t]*CASE|[ \t]*END SELECT))','$1case $2: {\r\n$4$1$1break\r\n$1}\r\n'));
//arrVBStoJS.push(new Array('^([ \t]*)CASE[ \t]+([^\r\n\:]+)([\:\r\n]*)(.*)','$1case $2: {\r\n$4$1$1break\r\n$1}'));
//arrVBStoJS.push(new Array('^([ \t]*)CASE[ \t]+([^\r\n\:]+)([\:\r\n]*)(.*)','$1case $2: {\r\n$4$1$1break\r\n$1}'));
//arrVBStoJS.push(new Array('^([ \t]*)(CASE)(.*?)(\:|\r\n)([.\r\n \ta-z0-9\(\)\"\']*?)^([ \t]*CASE|[ \t]*END SELECT)','$1case$3 {\r\n$5$1}\r\n$6'));
arrVBStoJS.push(new Array('^([ \t]*)(CASE)(.*?)(\:|\r\n)([.\r\n \ta-z0-9\(\)\"\']*?)^(?=[ \t]*CASE|[ \t]*END SELECT)','$1case$3: {\r\n$5$1$1break\r\n$1}\r\n'));

// select case
arrVBStoJS.push(new Array('^([ \t]*)SELECT CASE ([^\\r\\n]+)\r\n','$1switch($2){\r\n'));
// end select
arrVBStoJS.push(new Array('^([ \t]*)END SELECT','$1}'));


//-- LOOPs
// do until/while
// while/wend
// for x = ... next
// for each ... next


//-- OBJECT stuff
// instantiate object 
arrVBStoJS.push(new Array('[\\s]*(Server.)*CreateObject\\("', ' new ActiveXObject("'));
// SET 
arrVBStoJS.push(new Array('\\sSET\\s+', ''));
// nothing 
arrVBStoJS.push(new Array('nothing', 'null'));



//-- built-in functions
// isNumeric
arrVBStoJS.push(new Array('NOT isNumeric\\(([^\)]*)\\)', 'isNaN($1)'));
arrVBStoJS.push(new Array('isNumeric\\(([^\)]*)\\)[ \t]*=[ \t]*false', 'isNaN($1)'));
arrVBStoJS.push(new Array('isNumeric\\(([^\)]*)\\)', '!isNaN($1)'));
// uCase
arrVBStoJS.push(new Array('uCase\\(([^\)]*)\\)', '$1.toUpperCase()'));
// lCase
arrVBStoJS.push(new Array('lCase\\(([^\)]*)\\)', '$1.toLowerCase()'));




//-- misc


// Option Explicit
arrVBStoJS.push(new Array('^Option\\s+Explicit.*[\r\n]', ''));
// On Error Resume Next
arrVBStoJS.push(new Array('^On\\s+Error\\s+Resume\\s+Next.*[\r\n]', 'window.onerror=null\r\n'));
	//arrVBStoJS.push(new Array('^On\\s+Error\\s+Resume\\s+Next.*[\r\n]', '// window.onerror=null\r\n'));
// On Error Goto 0
arrVBStoJS.push(new Array('^On\\s+Error\\s+.+.*[\r\n]', 'window.detachEvent("onerror")\r\n'));
	//arrVBStoJS.push(new Array('^On\\s+Error\\s+.+.*[\r\n]', '// window.detachEvent("onerror")\r\n'));



// terminate statement
arrVBStoJS.push(new Array('^([ \t]*)(?!//|function|sub|end sub|end function|if|elseif|else|end if|select|case)(.*)([^\{\}])\r\n', '$1$2$3;\r\n'));
	//arrVBStoJS.push(new Array('^([ \t]*)(?!\/\/|function|sub|end sub|end function|if|elseif|else|end if|select|case)([^\{\}]*)\r\n', '$1$2;\r\n'));


// cleanup extra semicolons
arrVBStoJS.push(new Array('(^[ \t]*)\;\r\n', '\r\n'));	// blank lines
//arrVBStoJS.push(new Array('(CASE)(\\s+[^\r\n]+);', '$1$2'));	// (switch) case statements
	//arrVBStoJS.push(new Array('([\{\} \t]);\r\n', '$1\r\n'));


// line combination :		// <-- needs more
//arrVBStoJS.push(new Array('(?=.+):', ';'));
//arrVBStoJS.push(new Array('^([ \t]*)(?!case)([ \t]+[^\r\n]+)\r\n', '$1$2;\r\n'));

//arrVBStoJS.push(new Array('', ''));





//-- vbs constants
// String 
arrVBStoJS.push(new Array('vbCRLF', "'\\r\\n'"));
arrVBStoJS.push(new Array('vbCR', "'\\r'"));
arrVBStoJS.push(new Array('vbLF', "'\\n'"));
arrVBStoJS.push(new Array('vbTab', "'\\t'"));
// MsgBox 
arrVBStoJS.push(new Array('vbOK', '1'));
arrVBStoJS.push(new Array('vbCancel', '2'));
arrVBStoJS.push(new Array('vbAbort', '3'));
arrVBStoJS.push(new Array('vbRetry', '4'));
arrVBStoJS.push(new Array('vbIgnore', '5'));
arrVBStoJS.push(new Array('vbYes', '6'));
arrVBStoJS.push(new Array('vbNo', '7'));	
// Comparison 
arrVBStoJS.push(new Array('vbBinaryCompare', '0'));
arrVBStoJS.push(new Array('vbTextCompare', '1'));
// Tristate 
arrVBStoJS.push(new Array('vbUseDefault', '-2'));
arrVBStoJS.push(new Array('vbTrue', '-1'));
arrVBStoJS.push(new Array('vbFalse', '0'));
// VarType 
arrVBStoJS.push(new Array('vbEmpty', '0'));
arrVBStoJS.push(new Array('vbNull', '1'));
arrVBStoJS.push(new Array('vbInteger', '2'));
arrVBStoJS.push(new Array('vbLong', '3'));
arrVBStoJS.push(new Array('vbSingle', '4'));
arrVBStoJS.push(new Array('vbDouble', '5'));
arrVBStoJS.push(new Array('vbCurrency', '6'));
arrVBStoJS.push(new Array('vbDate', '7'));
arrVBStoJS.push(new Array('vbString', '8'));
arrVBStoJS.push(new Array('vbObject', '9'));
arrVBStoJS.push(new Array('vbError', '10'));
arrVBStoJS.push(new Array('vbBoolean', '11'));
arrVBStoJS.push(new Array('vbVariant', '12'));
arrVBStoJS.push(new Array('vbDataObject', '13'));
arrVBStoJS.push(new Array('vbDecimal', '14'));
arrVBStoJS.push(new Array('vbByte', '17'));
arrVBStoJS.push(new Array('vbArray', '8192'));






//==== extended, procedural conversions ====

// convert 'functionname=returnval' to 'return returnval'
function vb2js_functionreturn(p_strFunction){
	var re = new RegExp('^FUNCTION[ \t]*([^\(]*)(?:.*\r\n)*?END FUNCTION', 'igm');
	re.exec(p_strFunction);
	var strFunctionName = RegExp.$1;


	var reReturn = new RegExp('(' + strFunctionName + '\\s*\=\\s*)(.*)(?=\\s*^END[ \t]*FUNCTION)', 'igm')
	var strRet = p_strFunction.toString().replace(reReturn, 'return $2');
	return strRet;
}







// optional conversion patterns to decide at runtime based on user selections
function getVBStoJSOptionsArr(){
	var l_arrOptions = new Array();

	// collapse string concatenations
	if(collapseConcat && collapseConcat.checked){
		l_arrOptions.push(new Array("' \\+ '", ''));
		l_arrOptions.push(new Array('" \\+ "', ''));
	}


	return l_arrOptions;
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


var ifRegExp = new Array(/\s+if\s+/gi,"if(");
var thenRegExp = new Array(/\s+then\s+/gi,"){\n");
var elseRegExp = new Array(/\s+else\s+/gi,"\n}else{\n");
var elseifRegExp = new Array(/\s+elseif\s+/gi,"\n}else \nif(");
var endifRegExp = new Array(/\s+endif|end if\s+/gi,"\n}");
var equalsRegExp = new Array(/(\s+if\s+[\s*|\S*]+\s+)=(\s+[\s*|\S*]+\s+then\s+)/gi,"$1==$2");
var notRegExp = new Array(/(\s+if\s+[\s*|\S*]+)not([\s*|\S*]+\s+then\s+)/gi,"$1 ! $2");
var notEqualRegExp = new Array(/(\s+if\s+[\s*|\S*]+)<>([\s*|\S*]+\s+then\s+)/gi,"$1 != $2");
var andRegExp = new Array(/(\s+if\s+[\s*|\S*]+)and([\s*|\S*]+\s+then\s+)/gi,"$1 && $2");
var orRegExp = new Array(/(\s+if\s+[\s*|\S*]+) or ([\s*|\S*]+\s+then\s+)/gi,"$1 || $2");

function parse()
{
	var inString = new String(document.getElementById("txtVBS").value);
	var outString = inString.replace(elseifRegExp,"\n}else \nif(");
	outString = inString.replace(equalsRegExp[0],equalsRegExp[1]);
	outString = outString.replace(andRegExp[0],andRegExp[1]);
	outString = outString.replace(orRegExp[0],orRegExp[1]);
	outString = outString.replace(notRegExp[0],notRegExp[1]);
	outString = outString.replace(notEqualRegExp[0],notEqualRegExp[1]);
	outString = outString.replace(endifRegExp[0],endifRegExp[1]);
	outString= outString.replace(ifRegExp[0],ifRegExp[1]);
	outString= outString.replace(thenRegExp[0],thenRegExp[1]);
	outString = outString.replace(elseRegExp[0],elseRegExp[1]);
	outString = outString.replace(elseifRegExp[0],elseifRegExp[1]);

	document.getElementById("txtJS").value=outString;
}


*/