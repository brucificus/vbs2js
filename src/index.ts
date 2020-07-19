import * as arrVBStoJS from './vbs2js_conversions';

function fnConvert(p_arrConversionSet: Array<Array<unknown>>, p_strScriptToConvert: string){
	var strRet = p_strScriptToConvert;
	var arrConversionSet = p_arrConversionSet;

	// perform conversion
	for(var c=0; c<arrConversionSet.length; c++){
		if(arrConversionSet[c]){
			var pattern = arrConversionSet[c][0] as string;
			var replaceText = arrConversionSet[c][1];
			if(pattern){
				const re = new RegExp(pattern, "igm");
				if(typeof(replaceText)=='function'){	// if function pointer passed, loop & use function to manually replace each match
					if(re.test(strRet)){
						var arrMatches = strRet.match(re)!;
						for(var m=0; m<arrMatches.length; m++){
							strRet = strRet.replace(arrMatches[m], replaceText(arrMatches[m]));
						}
					}
				}else{
					strRet = strRet.replace(re, replaceText as string);
				}
			}
		}
	}
	return strRet;
}

export = function(input: string): string {
    return fnConvert(arrVBStoJS, input);
}
