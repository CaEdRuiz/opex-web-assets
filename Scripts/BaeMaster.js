//marcar menu
////var url = 'http://apps.bae.gym/BaseDatos/PlanProduccion/';
//var url = window.location.pathname;
//url = url.replace("/BaseDatos/", "");
//url='https://localhost:44356/Home/Deparment?dep='+url;
////$("li .kt-menu__item  i:contains('" + url + "')").parents("li").addClass('kt-menu__item--here');
////$("i:contains('" + url + "')").parents("li").addClass('kt-menu__item--here');
//$('li .kt-menu__item  a[href="' + url + '"]').parents("li").addClass('kt-menu__item--here');
//var first = $(location).attr('pathname');
//first.toLowerCase();
//first = first.split("/")[2];
//$("#MenuNavBarHere li:contains('" + first + "')").addClass('kt-menu__item--here');


//cambiar lenguaje
function SetLanguage(l) {
    var first = $(location).attr('pathname');
    var url = "";
    var farray = first.split("/");
    if (first.includes("BaseDatos")) {
        if (first.split("/")[2] != "OpEx") {
            url += "/" + first.split("/")[1] + "/" + first.split("/")[2] + "/" + first.split("/")[3];
        }
        else {
            url += "/" + first.split("/")[1] + "/" + first.split("/")[2];
        }
    }
    $.ajax({
        type: "POST",
        cache: false,
        data: { len: l },
        url: url + '/BAE/SetLenguage', beforeSend: function () {
        }
    }).done(function (data) {
        location.reload();
    }).fail(function (data) {
        location.reload();
    });
}; 
//Mostrar respuestas
function GetAnswerNShowIT(a) {
    if (a != undefined) {
        for (i = 0; i < a.Messages.length; i++) {
            CreateAnswerNShowIt(a.Messages[i], a.Type[i]);
        }
    }
}
//Mostrar respuesta
function CreateAnswerNShowIt(message, type) {
    switch (type) {
        case 1:
            ShowNotification(message, 'success');
            break;
        case 2:
            ShowNotification(message, 'warning');
            break;
        case 3:
            ShowNotification(message, 'danger');
            break;
        case 4:
            ShowNotification(message, 'info');
            break;
        case 5:
            ShowNotification(message, 'brand');
            break;
        default:
            break;
    }
    setTimeout(() => {
        NotificationSearchStart();
    }, 2000);
}
//Agregar notificacion post a api
function ShowNotification(content, type) {
    var notify = $.notify(content, {
        type: type,
        allow_dismiss: 'false',
        newest_on_top: 'true',
        mouse_over: 'true',
        spacing: 10,
        timer: 2000,
        placement: {
            from: 'bottom',
            align: 'right'
        },
        offset: {
            x: 30,
            y: 30
        },
        delay: 1000,
        z_index: 20000,
        animate: {
            enter: 'animated slideInRight',
            exit: 'animated slideOutRight'
        }
    });
}
//traer partialview y convertirla a texto

function ShowTabDetail(id, controller, idName) {
    $('[href="#DetailTab"]').click();
    var dataItem = $("#grid").data("kendoGrid").dataItem($(id.currentTarget).closest("tr"));
    if (dataItem != undefined) {
        id = dataItem[idName];
    }
    // else{
    //     id=null;
    // }
    GetPartialView(controller + '/Detail?id=' + id, 'DetailTab');
}
/**
 * 
 * @param {string} rute controller route
 * @param {string} target Id of target div for insert
 * @param {string=} type undefinder or 'html' for insert, 'append' for append or 'text for raw html'
 */
function GetPartialView(rute, target, type) {
    $.ajax({
        type: "GET",
        cache: false,
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        url: rute, beforeSend: function () {
        }
    }).done(function (data) {
        if (type == undefined || type == 'html') {
            $('#' + target).html(data);
        }
        else if (type == 'append') {
            $('#' + target).append(data);
        }
        else if (type == 'html') {
            return JSON.stringify(data);
        }

    }).fail(function (data) {
        CreateAnswerNShowIt("Falló en partialview", 3);
    });
}
function GetPartialViewHTML(rute) {
    $.ajax({
        type: "GET",
        cache: false,
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        url: rute, beforeSend: function () {
        }
    }).done(function (data) {
        return JSON.stringify(data);
    }).fail(function (data) {
        return 'Fail Get PartialView';
    });
}
function CleanForm(e, action) {
    e.attr('action', action);
    e.find(':input').each(function () {
        switch (this.type) {
            case 'password':
            case 'select-multiple':
            case 'select-one':
            case 'text':
            case 'textarea':
            case 'file':
                $(this).val('');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;
        }
    });
    e.find('[data-role="dropdownlist"]').each(function () {
        $("#" + this.id).data("kendoDropDownList").value(0);
    });
    // e.find('.custom-file-input').each(function () {
    //     $(this).next('.custom-file-label').addClass("selected").html('');
    // });
}
//Event Handlers
function ShowError(e) {
    CreateAnswerNShowIt("Error", 3);
}
function WindowToCenter(e) {
    try {
        e.sender.center();
    }
    catch{
        e.center();
    }

}
function GoBack() {
    $('[href="#ListTab"]').click();
}
function CloseWindow(w) {
    $("#" + w).data("kendoWindow").close();
}
function ShowWindow(name, url, data, title = "") {
    var dialog = $("#" + name).data("kendoWindow");

    dialog.setOptions({
        title: title
    });
    dialog.refresh({
        url: url,
        type: "POST",
        data: data
    });
    dialog.open();
}

function GridRead(grid) {
    $("#" + grid).data("kendoGrid").dataSource.read();
}
////kt_aside_toggler
// $(window).resize(function () {
//     console.log('window');
//     setTimeout(() => {
//         $('.k-chart').each(function () {
//             $("#" + this.id).data("kendoChart").refresh();
//         });
//     }, 500);
// }); 
