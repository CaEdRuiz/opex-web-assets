//marcar menu
//var url = 'http://apps.bae.gym/BaseDatos/PlanProduccion/';
var first = $(location).attr('pathname');
var sec = "";
if(~window.location.href.indexOf('Department?dep=')){
    sec = getParameterByName('dep');
}
else{
    sec.toLowerCase();
    sec = first.split("/")[2];
}

var url='https://apps.bae.gym/BaseDatos/OpEx/Home/Department?dep='+sec;
//$("li .kt-menu__item  i:contains('" + url + "')").parents("li").addClass('kt-menu__item--here');
//$("i:contains('" + url + "')").parents("li").addClass('kt-menu__item--here');
$('#AsideMenuHere a[href="' + url + '"]').parents("li").addClass('kt-menu__item--here');

var url = "";
    if(first.split("/")[2]=="OpEx"){
        url = first.split("/")[2];
    }
    else   {
        url =  first.split("/")[3] ;
    }
$("#MenuNavBarHere").find('.'+url).addClass('kt-menu__item--here');
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}