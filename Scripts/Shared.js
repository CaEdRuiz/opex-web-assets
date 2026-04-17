$(document).ready(function () {
    /*Selecciona el primer tab por defecto */
    if ($(".k-tabstrip").length) {
            $('.k-tabstrip').each(function () {
            var tabStrip = $("#"+ this.id).kendoTabStrip().data("kendoTabStrip");
            tabStrip.select(0);           
        });
    }
});
// $(function () {
//     $("form").submit(function (e) {
//         e.preventDefault();
//         $.ajax({
//             data: $(this).serialize(),
//             type: this.method,
//             url: this.action,
//             async: false,
//             dataType: "json"
//         }).done(function (data) {
//             GetAnswerNShowIT(data);
//         })
//         .fail(function (data) {
//             console.error(data);
//         });
//     });
// });


function gridError_handler(e) {   
    if (e.errors) {    
        var message = "Errors:\n";
        $.each(e.errors, function (key, value) {
            
            if ('errors' in value) {
                try {
                    $('.k-grid').each(function () {
                        kendoRefresh(this.id,'Grid');
                    });
                    ShowNotification(value.errors[0], 'warning');
                  }
                  catch(error) {
                    console.error(error);
                    console.error(value.errors);
                  }
                  
                    $.each(value.errors, function () {
                    message += this + "\n";
                    });
            }
        });
        
    }
}
/**
 * Refresca el elemento desde el datasource del mismo
 * @param {any} identifier ID de elemento
 * @param {any} elementType Tipo de elemento(grid,chart,ListView)
 */
function kendoDatasourceRefresh(identifier, elementType) {

    identifier = identifier || "listView";
    elementType = elementType || "ListView";

    var element = $("#"+identifier).data("kendo"+elementType);
    element.dataSource.read();
}


/**
 * 
 * @param {any} respuesta objeto de respuesta devuelto por el servidor
 */
//ToastrResponses
function showToastrResponse(respuesta) {
    switch (respuesta.success) {
        case 1:
            audioNotification(respuesta.success);
            toastr.success(respuesta.message, "Correcto");
            break;
        case 2:
            audioNotification(respuesta.success);
            toastr.success(respuesta.message, "Error");
            break;
        default:
            /*default*/
            break;
    }
}
function audioNotification(type) {
    const sound = new Audio();
    var typesound = "";

    switch (type) {
        case 1:
            typesound = "success";
            break;
        case 2:
            typesound = "error";
            break;
        default:
            typesound = "alert";
            break;

    }
    sound.src = getUrl() + '/Content/Audio/Notifications/' + typesound + '.mp3';
    sound.play();
}
/**
 * send __id__ as parameter value
 * @param {any} url url
 * @param {any} id id value to replace in string
 */
function idUrl(url,id) {
    return url.replace('__id__', id);
}

/**
 * Kendo window
 */
function kendoWindow(url, Title, width, height) {
    width = width || 450;
    height = height || 360;
    Title = Title || "";

    var kendoWindow = $("#window").data("kendoWindow");

    kendoWindow.setOptions({
        title: Title
    });
    kendoWindow.wrapper.css({
        width: width,
        height: height
    });
    kendoWindow.center().open();

    GetPartialView(url, 'window');
}

function kendoWindow_Content(content, Title, width, height) {

    width = width || 450;
    height = height || 360;

    Title = Title || "";

    var kendoWindow = $("#window").data("kendoWindow");

    kendoWindow.setOptions({
        title: Title
    });
    kendoWindow.wrapper.css({
        width: width,
        height: height
    });

    $('#window').html(content);
    kendoWindow.center().open();    
}


function closeWindow() {
    var dialog = $("#window").data("kendoWindow");
    dialog.close();
}
function WindowToCenter(e) {
    e.sender.center();
}

function onKendoWindowClose(e){
    $('#' + e.sender.element[0].id).html('');    
}

//GetJson object and get their data to send it as input values to controller
function getFormData($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}