
function fnConvert(p_arrConversionSet, p_strScriptToConvert){
	var strRet = p_strScriptToConvert;
	var arrConversionSet = p_arrConversionSet;

	// perform conversion
	var re = new RegExp();
	for(var c=0; c<arrConversionSet.length; c++){
		if(arrConversionSet[c]){
			var pattern = arrConversionSet[c][0];
			var replaceText = arrConversionSet[c][1];
			if(pattern){
				re.compile(pattern, "igm");
				if(typeof(replaceText)=='function'){	// if function pointer passed, loop & use function to manually replace each match
					if(re.test(strRet)){
						var arrMatches = strRet.match(re);
						for(var m=0; m<arrMatches.length; m++){
							strRet = strRet.replace(arrMatches[m], replaceText(arrMatches[m]));
						}
					}
				}else{
					strRet = strRet.replace(re, replaceText);
				}
			}
		}
	}
	return strRet;
}




// hook up object event procs

btnConvert.onclick=function(){
	var arrVBStoJSoptions = getVBStoJSOptionsArr();
	var strRet = input.value;

	// choose right conversion type
	if(conversionType.value==1){	// vbs to js
		strRet = fnConvert(arrVBStoJS, strRet);	// do basic conversions
		strRet = fnConvert(arrVBStoJSoptions, strRet);	// optional conversions
		var strConvertTypeText = 'VBScript to Javascript';
		var strCommentText = "// ";
	}else if(conversionType.value==2){	//js to vbs
		strRet = fnConvert(arrJStoVBS, strRet);	// do basic conversions
		//strRet = fnConvert(arrJStoVBSoptions, strRet);	// optional conversions
		var strConvertTypeText = 'Javascript to VBScript';
		var strCommentText = "' ";
	}

	strRet += '\r\n\r\n' +
		strCommentText + '============================================================================\r\n' +
		strCommentText + 'This code converted from ' + strConvertTypeText + ' by the ScriptConverter tool.\r\n' +
		strCommentText + 'Use freely.  Please do not redistribute without permission.\r\n' +
		strCommentText + 'Copyright 2003 Rob Eberhardt - scriptConverter'+'@'+'slingfive'+'.'+'com.\r\n' +
		strCommentText + '============================================================================\r\n';


	hidOutput.value = strRet;
	output.innerText = strRet;
	output.parse();	// refresh js-highlight.htc
}

btnDecreaseSize.onclick=function(){
	input.style.fontSize = parseInt(input.currentStyle.fontSize) * 0.9;
	output.style.fontSize = parseInt(output.currentStyle.fontSize) * 0.9;
}
btnIncreaseSize.onclick=function(){
	input.style.fontSize = parseInt(input.currentStyle.fontSize) * 1.2;
	output.style.fontSize = parseInt(output.currentStyle.fontSize) * 1.2;
}
btnResetSize.onclick=function(){
	input.style.fontSize = '';
	output.style.fontSize = '';
}


// enable tabs
input.onkeydown=function(){
	if(event.keyCode==9){
		document.selection.createRange().text = '	';
		return false;
	}
}
