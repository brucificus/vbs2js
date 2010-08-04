

function init(){
	var	arrInputCtlIDs = ['txtDate1', 'txtDate2', 'selInterval', 'txtNumber', 'selNamedFormat', 'txtFormat', 'selFirstDayOfWeek', 'chkAbbreviate'];
	colInputs = $(arrInputCtlIDs);
	colTestBtns = $("functions").getElementsByTagName("BUTTON");
	oCode = $("code");
	
	oDate1 = $("txtDate1");
	oDate2 = $("txtDate2");
	oInterval = $("selInterval");
	oNumber = $("txtNumber");
	oResult = $("result");
	oNamedFormat = $("selNamedFormat");
	oFormat = $("txtFormat");
	oFirstDayOfWeek = $("selFirstDayOfWeek");
	oAbbreviate = $("chkAbbreviate");
	

	// hookup testing logic
	$("btnTestIsDate").onclick=function(e){
		oResult.innerHTML = Date.IsDate(oDate1.value);
	}
	$("btnTestCDate").onclick=function(e){
		oResult.innerHTML = Date.CDate(oDate1.value);
	}
	$("btnTestDateAdd").onclick=function(e){
		oResult.innerHTML = Date.DateAdd(oInterval.value, oNumber.value, oDate1.value);
	}
	$("btnTestDateDiff").onclick=function(e){
		oResult.innerHTML = Date.DateDiff(oInterval.value, oDate1.value, oDate2.value, oFirstDayOfWeek.value);
	}
	$("btnTestDatePart").onclick=function(e){
		oResult.innerHTML = Date.DatePart(oInterval.value, oDate1.value, oFirstDayOfWeek.value);
	}
	$("btnTestMonthName").onclick=function(e){
		oResult.innerHTML = Date.MonthName(oNumber.value, oAbbreviate.checked);
	}
	$("btnTestWeekdayName").onclick=function(e){
		oResult.innerHTML = Date.WeekdayName(oNumber.value, oAbbreviate.checked, oFirstDayOfWeek.value);
	}
	$("btnTestWeekday").onclick=function(e){
		oResult.innerHTML = Date.Weekday(oNumber.value, oFirstDayOfWeek.value);
	}
	$("btnTestFormatDateTime").onclick=function(e){
		oResult.innerHTML = Date.FormatDateTime(oDate1.value, oNamedFormat.value);
	}
	$("btnTestFormat").onclick=function(e){
		oResult.innerHTML = Date.Format(oDate1.value, oFormat.value);
	}


	// special effects
	$("functions").onclick=function(e){		// focus-highlight related inputs
		evalOnColl(colTestBtns, "style.backgroundColor=''");
		evalOnColl(colInputs, "parentNode.style.backgroundColor=''");
		assocCtls(e, "style.backgroundColor='#ff9'");
	}
	$("functions").onmouseover=function(e){		// hover-highlight related inputs
		evalOnColl(colTestBtns, "style.color=''");
		evalOnColl(colInputs, "parentNode.style.color=''");
		assocCtls(e, "style.color='blue'");
	}
	$("functions").onmouseout=function(e){	// lights out when you leave
		evalOnColl(colTestBtns, "style.color=''");
		evalOnColl(colInputs, "parentNode.style.color=''");
	}
	
}



function assocCtls(e, p_strExprToEval){
	var srcElem = e ? e.target : window.event.srcElement;
	var oBtn = findElement(srcElem, "BUTTON")
	if(!oBtn.tagName){return}
	eval("oBtn." + p_strExprToEval);	//CSS2's :focus & :hover for IE
	
	var ctls = $(oBtn.getAttribute("assocCtlIDs").toString().split(','));
	if(!ctls.push){ctls = new Array(ctls)};
	evalOnColl(ctls, 'parentNode.' + p_strExprToEval);
}






// ====================================================


// desc: evaluates expression on each member of a collection
// params: collection, expression
// returns: nothing
function evalOnColl(p_Coll, p_strExprToEval){
	for(var e=0; e<p_Coll.length; e++){
		var ctl = $(p_Coll[e]);
		if(ctl){eval("ctl." + p_strExprToEval)};
	}
}


// desc: from prototype.js, basically a "getElementSByIdS"
// params: element IDs as strings, OR element IDs as single string array
// returns: array of element objects
function $(){
	// this added by RE
	if(arguments.length==1 && arguments[0].push){
		arguments = arguments[0];
	}

	var elements = new Array();
	for (var i = 0; i < arguments.length; i++) {
		var element = arguments[i];
		if (typeof element == 'string'){
			element = document.getElementById(element);
		}
		if (arguments.length == 1){
			return element;
		}
		elements.push(element);
	}
	return elements;
}


// desc: climb DOM til we find right tagName
// params: element as object, tagName as string
// returns: element as object
function findElement(elem, tagName) {
	while (elem.parentNode && (!elem.tagName || (elem.tagName.toUpperCase() != tagName.toUpperCase()))){
		elem = elem.parentNode;
	}
	return elem;
}



function printfire() {
    if (document.createEvent) {
        printfire.args = arguments;
        var ev = document.createEvent("Events");
        ev.initEvent("printfire", false, true);
        dispatchEvent(ev);
    }
}


// ====================================================




window.onload=init;