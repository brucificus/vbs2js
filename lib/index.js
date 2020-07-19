var arrVBStoJS = require('./vbs2js_conversions');

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

module.exports = function(input) {
    return fnConvert(arrVBStoJS, input);
}
