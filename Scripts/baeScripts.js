var runApis=false;
///Extensiones para usar el kendo window con acciones comunes como propiedades de la funcion
OpEx = {
    Modal: {
        open: function (options) {
            
            var kendoWindow = $("#window").data("kendoWindow");
            $('#window').html("");
                       
            if (options === undefined) {
                options = {};
            }

            options.url = options.hasOwnProperty('url') ? options.url : 'www.google.com';
            options.width = options.hasOwnProperty('width') ? options.width : 450;
            options.height = options.hasOwnProperty('height') ? options.height : 360;
            options.title = options.hasOwnProperty('title') ? options.title : "";
            options.maximize = options.hasOwnProperty('maximize') ? options.maximize : false;
            options.hidebar = options.hasOwnProperty('hidebar') ? options.hidebar : false;
            options.modal = options.hasOwnProperty('modal') ? options.modal : true;
            options.closable = options.hasOwnProperty('closable') ? options.closable : false;
            options.iframe = options.hasOwnProperty('iframe') ? options.iframe : false;
            

            if (options.closable) {
                $(document).on("click", ".k-overlay", function () {
                    kendoWindow.close();
                });
            }
            /*Asignar al window imagen de cargando contenido*/
            kendo.ui.progress(kendoWindow.element, true);
            kendoWindow.setOptions({
                title: (options.title || options.title === "") ? decodeHtmlEntities(options.title) : false,
                modal: options.modal,
                iframe: options.iframe,
                resizable: options.resizable
            });
            if (options.maximize) {
                kendoWindow.maximize();
            } else {
                kendoWindow.wrapper.css({
                    width: options.width,
                    height: options.height
                });
            }

            GetPartialView(options.url, 'window', options.data);
            kendoWindow.center().open();

            if (typeof options.callback === 'function') {
                options.callback();
            }
        },
        close: function (callback) {
            if ($(".k-window").length) {
                $('.k-window').each(function () {
                    var dialog = $("#window").data("kendoWindow");
                    dialog.close();
                    $('#window').html('');
                });
            }
            if (typeof callback === 'function') {
                callback();
            }
        },
        center: function (callback) {
            if ($(".k-window").length) {
                var current_window = $("#window").data("kendoWindow");
                if (!current_window.element.is(":hidden")) {
                    current_window.close();
                    current_window.center().open();
                }
            }
        }
    },
    /*
    * Agrega el icono de progress a cualquier elemento visible del dom 
    */
    Progress: function (options) {
        if (options === undefined) {
            options = {};
        }
        var element = $(options.target);
        options.blur= options.hasOwnProperty('blur') ? options.blur : false;
        // options.blur = typeof options.blur !== "undefined" ? options.blur : false;

        /*
             options.target= options.hasOwnProperty('target') ? options.target : "#grid";
             options.enabled= options.hasOwnProperty('enabled') ? options.enabled: true;
         */        

        if (element.css("position") !== "relative" && element.css("position") !== "absolute" && element.css("position") !== "fixed") {
            element.css("position", "relative");
        }

        kendo.ui.progress(element, options.enabled);
        
        if(options.blur && options.enabled){
            var originalFilter = $(options.target).css("filter");
            $(options.target).data("original-filter", originalFilter);

            $(options.target).css({
                "filter": "blur(8px)",
                "pointer-events": "none"
            });
        }  

        var currentFilter = $(options.target).css("filter");

        if (!options.enabled && typeof currentFilter === "string" && currentFilter.includes("blur")) {
            var original = $(options.target).data("original-filter") || "none";

            $(options.target).css({
                "filter": original,
                "pointer-events": "auto"
            });
        }
    },
    /*
    * Refresca el elemento desde el datasource del mismo
    * @param {any} identifier ID de elemento
    * @param {any} elementType Tipo de elemento(grid,chart,ListView)
    * @param {any} server Determina si hace read en el servidor
    */
    Chart: {
        redraw: function (options) {
            if (options === undefined) {
                options = {};
            }

            $('.k-chart').each(function () {
                kendoRefresh(this.id, "Chart", false);
            });
            $('.k-gauge').each(function () {
                var gauge = $('#' + this.id).data("kendoRadialGauge");
                gauge.redraw();
            });
        },
        export: function (options) {
            if (options === undefined) {
                options = {};
            }
            /*
                options.target= options.hasOwnProperty('target') ? options.target : "#grid";
                options.data = options.hasOwnProperty('data') ? options.data : "#grid";
                options.FileName = options.hasOwnProperty('FileName') ? options.FileName : "Grid";
                options.FileType = options.hasOwnProperty('FileType') ? options.FileType : true;
            */

            var chart = $(options.target).getKendoChart();
            switch (options.FileType) {
                case 'pdf':
                    chart.exportPDF({ paperSize: "auto", margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" } }).done(function (data) {
                        kendo.saveAs({
                            dataURI: options.data,
                            fileName: options.FileName + "." + options.FileType,
                            proxyURL: "/Chart_Api/Export_Save"
                        });
                    });
                    break;
                case 'png':
                    chart.exportImage({ paperSize: "auto", margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" } }).done(function (data) {
                        kendo.saveAs({
                            dataURI: options.data,
                            fileName: options.FileName + "." + options.FileType,
                            proxyURL: "/Chart_Api/Export_Save"
                        });
                    });
                    break;
            }
        }
    },
    Grid: {
        push: function (options) {
            var grid = $(options.target).data("kendoGrid");
            grid.dataSource.add(options.data);
            if (options.sync) {
                grid.dataSource.sync();
            }
        },
        update: function (options) {
            var grid = $(options.target).data("kendoGrid");
            var item = grid.dataSource.get(options.id);

            if (!item) {
                return;
            }

            // Recorre cada campo a actualizar
            for (var key in options.fields) {
                if (options.fields.hasOwnProperty(key)) {
                    item.set(key, options.fields[key]);
                }
            }

            // if (options.sync) {
            //     grid.dataSource.sync();
            // }
        },
        updateLocal: function (options) {
        var grid = $(options.target).data("kendoGrid");
        var ds   = grid.dataSource;

        var item = ds.get(options.id);
        if (!item) {
            return;
        }

        var payload = $.extend({}, item.toJSON(), options.fields);

        ds.pushUpdate(payload);

        // Si tenés plantillas complejas y alguna celda no se re-renderiza, refrescá la fila:
        // var row = grid.tbody.find("tr[data-uid='" + ds.get(options.id).uid + "']");
        // grid.refresh(); // o grid._refresh() según versión
        }
    },
    Refresh: function (options) {
        if (!options) {
            options = {};
        }

        if (!options.hasOwnProperty('target')) options.target = "#grid";
        if (!options.hasOwnProperty('type'))options.type = "Grid";
        if (!options.hasOwnProperty('server'))options.server = true;
        
        var element = $(options.target).data("kendo" + options.type);

        // if (element != undefined) {
        //     if (options.server) {
        //         element.dataSource.read();
        //     } else {
        //         element.refresh();
        //     }
        // }
        
        if (element) {
            if (options.server && element.dataSource) {
                element.dataSource.read();
            } else if (typeof element.refresh === "function") {
                element.refresh();
            } else {
                console.warn("El elemento no tiene dataSource ni refresh: ", options.target);
            }
        } else {
            console.warn("No se encontró un Kendo " + options.type + " en el target: " + options.target);
        }
    },

    CopyToClipboard: function(text, element) {

        navigator.clipboard.writeText(text).then(() => {
            // Si el mensaje no existe, lo creamos
            if (!$('#copyMessage').length) {
                const copyMessage = $('<span>', {
                    id: 'copyMessage',
                    html: '<i class="far fa-copy"></i> Copiado',
                    css: {
                        opacity: 0,
                        // backgroundColor: '#66bb6a',  // Verde vibrante pero no muy fuerte
                        // backgroundColor: '#f96302',  // naranja parecido a la pagina
                        backgroundColor: 'rgba(249, 99, 2, 0.8)',  // Naranja con transparencia
                        color: 'white',
                        textAlign: 'center',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        position: 'absolute',
                        transform: 'translateX(-50%)',
                        transition: 'opacity 0.3s ease-in-out',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                        zIndex: 9999
                    }
                });

                $('body').append(copyMessage);
            }

            const copyMessage = $('#copyMessage');

            // Calcula la posición del elemento copiado
            var rect = $(element)[0].getBoundingClientRect();
            var scrollTop = $(window).scrollTop();  // Ajuste para el desplazamiento vertical
            var scrollLeft = $(window).scrollLeft(); // Ajuste para el desplazamiento horizontal

            // Ajusta la posición del mensaje
            copyMessage.css({
                left: rect.left + rect.width / 2 + scrollLeft,
                top: rect.top + scrollTop - 40, // 40px arriba del elemento
                opacity: 1
            });

            // Oculta el mensaje después de 1.5 segundos
            setTimeout(() => {
                copyMessage.css('opacity', '0');
            }, 1000);
        }).catch(err => {
        });
    },
    customAjaxSubmit: function (options) {
        /*
        options.url;
        options.data;
        options.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        options.type = "POST";
        options.dataType = 'json'

        $(".disableonsubmit").attr("disabled", true);
        var promise = $.ajax({
            url: url,
            type: type,
            data: data,
            contentType: contentType,
            dataType: dataType,
            processData: false,
            //async:false,
            success: function (obj) {
                $(".disableonsubmit").attr("disabled", false);
                GetAnswerNShowIT(obj);
            },
            error: function (requestObject, error, errorThrown) {
                $(".disableonsubmit").attr("disabled", false);
                var message = '';
                if (requestObject.status === 0) {
                    message = ('Not connected. Please verify your network connection.');
                } else if (requestObject.status == 404) {
                    message = ('The requested page not found. [404]');
                } else if (requestObject.status == 500) {
                    message = ('Internal Server Error [500].');
                } else if (error === 'parsererror') {
                    message = ('Requested JSON parse failed.');
                } else if (error === 'timeout') {
                    message = ('Time out error.');
                } else if (error === 'abort') {
                    message = ('Ajax request aborted.');
                } else {
                    message = ('Uncaught Error.' + requestObject.responseText);
                }
                CreateAnswerNShowIt(message, 3);
                CreateAnswerNShowIt('', 100);
            }
        });
        return promise;
        */
    }
}

$(document).ready(function () {
    /*Al tener un kendoTabstrip elecciona el primer tab por defecto */

    // if ($(".k-tabstrip").length) {
    //     $('.k-tabstrip').each(function () {
    //         var tabStrip = $("#" + this.id).kendoTabStrip().data("kendoTabStrip");
    //         tabStrip.select(0);
    //     });
    // }
   
    $(window).resize(function () {
        redrawKendoCharts();
        kendoWindowCenter();
    });

    if (isDecemberSeason()) {

        // ❄️ Nieve en el header
        iniciarNieveEnElemento(".kt-header", "snow-canvas-header");

        // ❄️ Nieve en el menú lateral
        iniciarNieveEnElemento(".kt-aside", "snow-canvas-menu");
        
        // 🎅 Poner gorrito
        ponerGorritoUsuarioNavidad();

        // 🎄 Cambiar texto según fecha
        cambiarTextoBienvenida();
    }

    standardize_opex_html_elements();

    // Obtener el valor después del símbolo '#' en la URL
    /*
    var hash = window.location.hash;
    if (hash) {
        // Remover el símbolo '#' del valor del hash
        var seccion = hash.substring(1);
        $('html, body').animate({
            scrollTop: $("#" + seccion).offset().top-100
        }, 600);
    }
    */
    var hash = window.location.hash;
    if (hash) {
        var seccion = hash.substring(1);
        var $target = $("#" + seccion);

        if ($target.length) {
            // Solo animar si el elemento existe
            $('html, body').animate({
                scrollTop: $target.offset().top - 100
            }, 600);
        } else {
            console.warn("No se encontró un elemento con id =", seccion);
        }
    }
    
});

/**
 * Refresca y ajusta todos los grids Kendo UI visibles cuando se activa un tab de Bootstrap.
 *
 * Este evento se dispara cada vez que se muestra un tab con clase `.nav-link` y `data-toggle="tab"`.
 * Es especialmente útil para corregir problemas de renderizado y dimensionamiento en grids
 * contenidos dentro de pestañas que no están visibles al cargarse inicialmente.
 *
 * Uso:
 * - Se aplica automáticamente a todos los grids Kendo en la página (`.k-grid`).
 * - Llama a `resize()` para reajustar el layout del grid.
 * - Llama a `refresh()` para forzar una nueva renderización si fuese necesario.
 */
$(document).on('shown.bs.tab', '.nav-link[data-toggle="tab"]', function () {
    $(".k-grid").each(function () {
        var grid = $(this).data("kendoGrid");
        if (grid) {
            grid.resize();
        }
    });
});

$(document).on('click', '.kt-notification__custom.kt-space-between a.btn', function (e) {
    e.preventDefault();

    $.post("https://apps.bae.gym/BaseDatos/OpEx/Login/Logout", function () {
        window.location.href = window.location.href;
    });
});

/*Agrega elementos al dom para que no haya diferencias entre el layout de las diferentes aplicaciones*/
function standardize_opex_html_elements() {
    ///Agrega el boton click al boton verde del panel de notificaciones para redireccionar a la tabla de notificaciones opex
    $('#NotificationNumber').attr('onClick', "window.open('https://apps.bae.gym/BaseDatos/OpEx/notification/Index','_blank')");


    ///Agrega la imagen de empty cuando el div de notificaciones no  tiene contenido
    var topbar_notifications_notificationsList = $('#topbar_notifications_notificationsList').text().trim();
    if (topbar_notifications_notificationsList == '') {
        $("#topbar_notifications_notificationsList").html("<img class='show-empty' />");
    }
    var topbar_notifications_eventsList = $('#topbar_notifications_eventsList').text().trim();
    if (topbar_notifications_eventsList== '') {
        $("#topbar_notifications_eventsList").html("<img class='show-empty' />");
    }
    var topbar_notifications_logsList = $('#topbar_notifications_logsList').text().trim();
    if (topbar_notifications_logsList == '') {
        $("#topbar_notifications_logsList").html("<img class='show-empty' />");
    }

    //Reemplaza el año del footer si es distinto al año actual
    var currentYear = new Date().getFullYear(); // Obtener el año actual
    var footerYear = $(".kt-footer__copyright.kt-footer__menu").text().match(/\d{4}/)[0]; // Obtener el año del div

    if (currentYear != footerYear) { // Si los años son diferentes
        var newFooterText = $(".kt-footer__copyright.kt-footer__menu").html().replace(footerYear, currentYear); // Reemplazar el año en el HTML
        $(".kt-footer__copyright.kt-footer__menu").html(newFooterText); // Actualizar el contenido del div
    }


    ///Agrega la hora de salida al menu
    // Crear el elemento si no existe
    const notificationContainer = document.querySelector('.kt-header__topbar-item.kt-header__topbar-item--user .dropdown-menu .kt-notification');
    
    while (notificationContainer.firstChild) {
        notificationContainer.removeChild(notificationContainer.firstChild);
    }

    if (runApis && !document.getElementById('dynamic_entry_exit_time')) {
        try {
            fetch("https://apps.bae.gym/BaseDatos/OpEx/api/TodayEmployeeSchedule", {
                method: 'GET',
                credentials: 'include' // <- clave
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
                .then(data => {
                    
                    //Si no existe el elemento en el menu, agregarlo
                    if (data.entryTime && data.exitTime){
                        const newElement = document.createElement('a');
                        newElement.href = 'https://apps.bae.gym/BaseDatos/OpEx/EmployeeAttendanceLog/Index#DetailTab';
                        newElement.className = 'kt-notification__item';
                        newElement.id = 'dynamic_entry_exit_time';

                        newElement.innerHTML = `
                                <div class="kt-notification__item-icon">
                                    <i class="flaticon-time kt-font-success"></i>
                                </div>
                                <div class="kt-notification__item-details">
                                    <div class="kt-notification__item-title kt-font-bold">
                                        Asistencia
                                    </div>
                                    <div class="kt-notification__item-time">
                                        <div>
                                            <span class="kt-font-bold">Entrada:</span> ${data.entryTime}
                                        </div>
                                        <div>
                                            <span class="kt-font-bold">Salida prevista:</span> ${data.exitTime}
                                        </div>
                                    </div>
                                </div>
                            `;

                            notificationContainer.appendChild(newElement);
                        
                    }
            })
            .catch(error => {                
            });
        } catch (e) {
            
        }
    }

    
    //Agrega la seccion de ranitas
    if (runApis && !document.getElementById('dynamic_team_presence')) {

        try {
            fetch("https://apps.bae.gym/BaseDatos/OpEx/api/atendance/get-team-status", {
                method: 'GET',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(res => {

                //No autorizado → NO agregar sección, NO modificar layout
                if (!res.allowed) return;

                const data = res.data;

                // 🔥 VOLVER A OBTENER EL CONTENEDOR AQUÍ
                const containerNotification = document.querySelector(
                    '.kt-header__topbar-item.kt-header__topbar-item--user .dropdown-menu .kt-notification'
                );

                if (!containerNotification) {
                    console.warn("No se encontró .kt-notification (dropdown no abierto?)");
                    return;
                }
                // Crear contenedor
                const container = document.createElement('div');
                container.id = "dynamic_team_presence";
                container.style.padding = "10px 15px";
                container.style.borderBottom = "1px solid #f0f0f0";
                container.style.background = "#fff";

                // Construir HTML dinámico con namespace
                let html = `
                    <div class="opex-team-status">
                        <div class="team-badges-wrapper">
                            <div class="team-badges-container">
                `;

                data.forEach(p => {
                    const f = new Date(p.DateTime),
                        hoy = new Date(),
                        meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
                        fecha = `${f.getDate().toString().padStart(2,'0')} ${
                            meses[f.getMonth()]
                        }${
                            f.getFullYear() === hoy.getFullYear() ? '' : ' ' + f.getFullYear()
                        } ${
                            f.getHours().toString().padStart(2,'0')
                        }:${
                            f.getMinutes().toString().padStart(2,'0')
                        }`,
                        cls = p.Status === "IN" ? "green" : "red";

                    html += `<div class="team-badge ${cls}" title="${fecha}">${p.DisplayName}</div>`;
                });

                html += `
                            </div>
                        </div>
                    </div>
                `;

                container.innerHTML = html;

                /// Insertar justo arriba del elemento de asistencia
                const firstItem = containerNotification.querySelector('.kt-notification__item');

                if (firstItem) {
                    containerNotification.insertBefore(container, firstItem);
                } else {
                    containerNotification.appendChild(container);
                }

            })
            .catch(e => console.error("Error en fetch team status", e));
        }
        catch (e) { console.error("Error general", e); }
    }


    ///Agrega el jobtitle al card del usuario en la barra del layout
    // Selecciona el elemento padre donde se agregará el nuevo div
    var userCardName = document.querySelector('.kt-user-card__name');
    if(userCardName) {
        // Verifica si ya existe el div con id "jobTitleContainer"
        if (runApis && !document.getElementById('kt-user-card__name__jobTitle')) {
            try {
                    fetch("https://apps.bae.gym/BaseDatos/OpEx/api/CurrentUserContext", 
                        {
                            method: 'GET',
                            credentials: 'include' // <- clave
                        }
                    )
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok ' + response.statusText);
                        }
                        return response.json();
                    })
                    .then(data => {
                        
                        /*Si no existe el elemento en el menu, agregarlo*/
                        if (data) {

                            // Crea el div contenedor y asigna un id
                            var containerDiv = document.createElement('div');
                            containerDiv.id = 'kt-user-card__name__jobTitle';

                            // Crea el elemento <small> y asigna el contenido del Job Title
                            var small = document.createElement('small');
                            small.textContent = data.JobTitle;

                            containerDiv.appendChild(small);

                            // Agrega el contenedor al elemento padre
                            userCardName.appendChild(containerDiv);
                        
                            if(data.PetAvailable){                                
                                loadScriptOnce("https://apps.bae.gym/BaseDatos/OpEx/api/virtualpet/js?employeeID=0");
                            }
                        }
                    })
                    .catch(error => {
                    });
            } catch (e) {
                
            }
        }
    }

}

function loadScriptOnce(src) {
    // Verifica si ya existe un script con ese src
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes(src)) {
            return;
        }
    }

    // Si no se ha cargado, lo crea y lo agrega
    var script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.defer = true;
    script.onload = function () {
    };
    document.head.appendChild(script);
}


/*Al tener un kendoTabstrip elecciona el primer tab por defecto */
function selectFirstTab() {
    if ($(".k-tabstrip").length) {
         $('.k-tabstrip').each(function () {
             var tabStrip = $("#" + this.id).kendoTabStrip().data("kendoTabStrip");
             tabStrip.select(0);
         });
     }
}
function redrawKendoCharts() {
    $('.k-chart').each(function () {
        kendoRefresh(this.id, "Chart", false);
    });
    $('.k-gauge').each(function () {
        var gauge = $('#' + this.id).data("kendoRadialGauge");
        gauge.redraw();
    });
}
/*----------------------------------------KENDO-------------------------*/
/**
 * Refresca el elemento desde el datasource del mismo
 * @param {any} identifier ID de elemento
 * @param {any} elementType Tipo de elemento(grid,chart,ListView)
 * @param {any} server Determina si hace read en el servidor
 */
function kendoRefresh(identifier = "grid", elementType = "Grid", server = true) {
    var element = $("#" + identifier).data("kendo" + elementType);
    if (element != undefined) {
        element.refresh();
        if (server) {
            element.dataSource.read();
        } else {
            element.refresh();
        }
    }
}

function decodeHtmlEntities(text) {
    var element = document.createElement("textarea");
    element.innerHTML = text;
    return element.value;
}

/**
 * Funcion que abre un modal de kendo y admite url para funcionar como un iframe, 
 * modificada para recibir los options como un solo parametro, haciendo la función escalable
 * para que no importe el orden de los parametros que se envían a la función
 * @param {any} url url del contenido que va a mostrar en la ventana
 * @param {any} data objeto de json que contiene los parametros que recibe el controlador
 * @param {any} options opciones para modificar el aspecto y comportamiento del kendo window como el tamaño y titulo 
 */
function kendoModal(url, data, options) {
    var kendoWindow = $("#window").data("kendoWindow");
    $('#window').html("");

    if (options === undefined) {
        options = {};
    }
    options.width = options.hasOwnProperty('width') ? options.width : 450;
    options.height = options.hasOwnProperty('height') ? options.height : 360;
    options.title = options.hasOwnProperty('title') ? options.title : "";
    options.maximize = options.hasOwnProperty('maximize') ? options.maximize : false;
    options.hidebar = options.hasOwnProperty('hidebar') ? options.hidebar : false;
    options.modal = options.hasOwnProperty('modal') ? options.modal : true;
    options.closable = options.hasOwnProperty('closable') ? options.closable : false;

    if (options.closable) {
        $(document).on("click", ".k-overlay", function () {
            kendoWindow.close();
        });
    }
    /*Asignar al window imagen de cargando contenido*/
    kendo.ui.progress(kendoWindow.element, true);
    kendoWindow.setOptions({
        title: (options.title || options.title === "") ? decodeHtmlEntities(options.title) : false,
        modal: options.modal
    });
    if (options.maximize) {
        kendoWindow.maximize();
    } else {
        kendoWindow.wrapper.css({
            width: options.width,
            height: options.height
        });
    }

    GetPartialView(url, 'window', data);
    kendoWindow.center().open();
}

/**
 * Funcion vieja de kendo window que abre un modal de kendo y admite url para funcionar como un iframe
 * @param {any} url url del contenido que va a mostrar en la ventana
 * @param {any} title Titulo de la ventana 
 * @param {any} data objeto de json que contiene los parametros que recibe el controlador
 * @param {any} width ancho de la ventana
 * @param {any} height alto de la ventana
 * @param {any} Maximize define si la ventana aparece a pantalla completa por defecto 
 */
function kendoWindowOpen(url, Title, data, width, height, Maximize) {
    width = width || 450;
    height = height || 360;
    Title = Title || "";
    Maximize= Maximize||false;
    var kendoWindow = $("#window").data("kendoWindow");
    $('#window').html("");
    /*Asignar al window imagen de cargando contenido*/
    kendo.ui.progress(kendoWindow.element, true);

    kendoWindow.setOptions({
        title: decodeHtmlEntities(Title)
    });

    if (Maximize) {
        kendoWindow.maximize();
    } else {
        kendoWindow.wrapper.css({
            width: width,
            height: height
        });
    }
    
    GetPartialView(url, 'window', data);
    kendoWindow.center().open();
}

function kendoWindowCenter() {
    if ($(".k-window").length) {
        var current_window = $("#window").data("kendoWindow");
        if (!current_window.element.is(":hidden")) {
            current_window.close();
            current_window.center().open();
        }
    }
}

function kendoWindowClose() {
    if ($(".k-window").length) {
        $('.k-window').each(function () {
            //var dialog = $("#" + this.id).data("kendoWindow");
            var dialog = $("#window").data("kendoWindow");
            dialog.close();
            //$('#' + this.id).html('');
            $('#window').html('');
        });
    }
}

function kendoWindow_Local(Content, Title, width, height) {
    width = width || 450;
    height = height || 360;
    Title = Title || "";

    var kendoWindow = $("#window").data("kendoWindow");

    /*Asignar al window imagen de cargando contenido*/
    //kendo.ui.progress(kendoWindow.element, true);

    kendoWindow.setOptions({
        title: Title
    });
    kendoWindow.wrapper.css({
        width: width,
        height: height
    });

    $('#window').html(Content);
    kendoWindow.center().open();
}




/*-------------------------Custom functions------------------------------ */

function GetAnswerNShowIT(a) {
    if (a != undefined) {
        for (i = 0; i < a.Messages.length; i++) {
            CreateAnswerNShowIt(a.Messages[i], a.Type[i], a.ID);
        }
    }
}
//Mostrar respuesta
/**
 * 
 * @param {string} message mensaje a desplegar
 * @param {string} type tipo de respuesta 1=verde,2=amarillo,3=rojo,4=azul,5=naranja
 */
function CreateAnswerNShowIt(message, type, ID) {
    var sound = new Audio();
    sound.volume = 0.5;

    if (type <= 5) {
        //const sound = new Audio();
        // sound.src = 'https://apps.bae.gym:84/Resources/assets/audio/notifications/' + type + '.mp3';
        
        sound.pause();
        sound.currentTime = 0; // Reinicia
        sound.src = 'https://apps.bae.gym:84/Resources/assets/audio/notifications/' + type + '.mp3';

        sound.oncanplaythrough = function () {
            sound.play().catch(function (err) {
                console.warn("Error al reproducir:", err);
            });
        };
    }
    
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
        case 100:
            kendoWindowClose();//cerrar todas las ventanas
            break;
        case 200:
            var spl = message.split(',');
            kendoRefresh(spl[0], spl[1]);//refrescar el elmeento en base al id y el tipo
            break;
        case 400://Just Reload the current document
            setTimeout(() => {
                window.location.href = window.location.href
            }, 1000);
            break;
        case 401://Reload the current document with an ID Parameter
            //Add an ? or & deppending if exists parameters yet or not
            window.location.href = window.location.href += ((window.location.href.indexOf('?') > -1) ? '&' : '?') + message + '=' + ID;;
            break;
        case 402://Reload the current document with parameters in case it contains 
            //the string parameters should be in the message 
            window.location.href = window.location.href += ((window.location.href.indexOf('?') > -1) ? '&' : '?') + message;
            break;
        case 800: //Especial de alejandro para obener TabDetail
            GetTabDetail(ID);//cerrar todas las ventanas
            break;
        default:
            break;
    }
    // setTimeout(() => {
    //     NotificationSearchStart();//notificaciones 
    // }, 2000);
}
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
/**
 * 
 * @param {string} rute controller route
 * @param {string} target Id of target div for insert
 * @param {object} data Objeto para enviar al servidor
 * @param {string} type undefinder or 'html' for insert, 'append' for append or 'text for raw html'
 */
function GetPartialView(rute, target, data, type) {
    //if ($(".bae-container-loading-content").length) {
        //kendo.ui.progress($(".bae-container-loading-content"), true);
    //}
    
    var promise=$.ajax({
        type: "GET",
        data: data,
        cache: false,
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        url: rute,
        beforeSend: function () { }
    })
    .done(function (d) {
        if (type == undefined || type == 'html') {
            $('#' + target).html(d);
        }
        else if (type == 'append') {
            $('#' + target).append(d);
        }
        else if (type == 'html') {
            return JSON.stringify(d);
            //if ($(".bae-container-loading-content").length) {
                //kendo.ui.progress($(".bae-container-loading-content"), false);
            //}
        }
    })
    .fail(function (d) {
        CreateAnswerNShowIt("Falló en partialview", 3);
        //if ($(".bae-container-loading-content").length) {
            //kendo.ui.progress($(".bae-container-loading-content"), false);
        //}
    });

    return promise;
}
//Cambiar el idioma de la pagina
/**
 * @param {string} l lenguaje
 */
function SetLanguage(l) {//cambiar a carpeta nueva de opex
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
    } else {
        url = "/BaseDatos/OpEx";
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
//retorna los valores para las fechas por defecto cuando se usan los filtros de fecha en un grid
function tableDateParameters() {
    return {
        startDate: $("#startDate").val(),
        endDate: $("#endDate").val()
    }
}

function DateParameters() {
    return {
        startDate: $("#startDate").val(),
        endDate: $("#endDate").val()
    }
}

function chart_exportTo(Element = 'chart', FileType = 'pdf', FileName = 'Exported') {
    var chart = $("#" + Element).getKendoChart();
    switch (FileType) {
        case 'pdf':
            chart.exportPDF({ paperSize: "auto", margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" } }).done(function (data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: FileName + "." + FileType,
                    proxyURL: "/Chart_Api/Export_Save"
                });
            });
            break;
        case 'png':
            chart.exportImage({ paperSize: "auto", margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" } }).done(function (data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: FileName + "." + FileType,
                    proxyURL: "/Chart_Api/Export_Save"
                });
            });
            break;
    }
}

function gridAnswerMessages(messages) {
    if (messages.errors) {
        $.each(messages.errors, function (key, value) {
            $.each(value.errors, function () {
                CreateAnswerNShowIt(" " + this, parseInt(key));
            });
        });
    }
}

/**
 * @param {objet} e Objeto de errores del grid
 */
function gridErrorsHandler(e) {
    if (e.errors) {
        var message = "Errors:\n";
        $.each(e.errors, function (key, value) {
            // if ('gridError' in value) {
            $.each(value.errors, function () {
                CreateAnswerNShowIt("Error: " + this, 3);
            });
            //}
        });
    }
}
//GetJson object and get their data to send it as input values to controller
function formInputToJson($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {
        // Verificar si el nombre ya existe en indexed_array
        if (n['name'] in indexed_array) {
            // Si ya existe, comprobar si el valor es el mismo para evitar la duplicación
            if (indexed_array[n['name']] !== n['value']) {
                indexed_array[n['name']] = indexed_array[n['name']] + ',' + n['value'];
            }
        } else {
            indexed_array[n['name']] = n['value'];
        }
    });

    return indexed_array;
}

//GetJson object and get their data to send it as input values to controller
function formInputToJsonString($form) {
    var unindexed_array = $form.serializeArray();
    var stringObject = '{';
    $.map(unindexed_array, function (n, i) {
        stringObject += ('"' + n['name'] + '"') + ':' + ((Number.isInteger(n['value'])) ? n['value'] : ('"' + n['value'] + '"')) + ((i != unindexed_array.length - 1) ? ',' : '');
    });
    stringObject += '}';
    return stringObject;
}

////Put this shit into your page for regular post
// $("form").submit(function (e) {
//     e.preventDefault();
//     customAjaxSubmit(this.action,  $(this).serialize())          //<----------------------DIFFERENCE
//         .done(function (answerResult) {
//             CreateAnswerNShowIt('asdfasdf', 4);
//         })
//         .fail(function (xhr, status, err) {
//             CreateAnswerNShowIt('asdfasdf', 5);
//         });
// });

////Put this shit into your page for post with file(s)
// $("form").submit(function (e) {
//     e.preventDefault();
//     var formData = new FormData(this);
//     formData.append("File", document.getElementById("File").files[0]);
//     customAjaxSubmit(this.action, formData,false)           //<---------------DIFFERENCE
//         .done(function (answerResult) {
//             CreateAnswerNShowIt('asdfasdf', 4);
//         })
//         .fail(function (xhr, status, err) {
//             CreateAnswerNShowIt('asdfasdf', 5);
//         });
// });

// When one sets the contentType option to false, it forces jQuery not to add a Content-Type header, otherwise, 
// the boundary string will be missing from it. Also, when submitting files via multipart/form-data, one must 
// leave the processData flag set to false, otherwise, jQuery will try to convert your FormData into a string, which will fail.
function customAjaxSubmit(url, data, contentType = 'application/x-www-form-urlencoded; charset=UTF-8', type = "POST", dataType = 'json') {
    
    $(".disableonsubmit").attr("disabled", true);
    var promise = $.ajax({
        url: url,
        type: type,
        data: data,
        contentType: contentType,
        dataType: dataType,
        processData: false,
        //async:false,
        success: function (obj) {
            $(".disableonsubmit").attr("disabled", false);
            GetAnswerNShowIT(obj);
        },
        error: function (requestObject, error, errorThrown) {
            $(".disableonsubmit").attr("disabled", false);
            var message = '';
            if (requestObject.status === 0) {
                message = ('Not connected. Please verify your network connection.');
            } else if (requestObject.status == 404) {
                message = ('The requested page not found. [404]');
            } else if (requestObject.status == 500) {
                message = ('Internal Server Error [500].');
            } else if (error === 'parsererror') {
                message = ('Requested JSON parse failed.');
            } else if (error === 'timeout') {
                message = ('Time out error.');
            } else if (error === 'abort') {
                message = ('Ajax request aborted.');
            } else {
                message = ('Uncaught Error.' + requestObject.responseText);
            }
            CreateAnswerNShowIt(message, 3);
            CreateAnswerNShowIt('', 100);
        }
    });
    return promise;
}

function gridSync(e) {
    this.read();
}


/////Alejandro

function GoBack() {
    $('[href="#ListTab"]').click();
}
function initDoubleClickGrid(grid, id, url) {
    var grid = $("#" + grid).data("kendoGrid");
    grid.element.on('dblclick', 'tbody tr[data-uid]', function (e) {
        ShowTabDetail(grid.dataItem($(e.target).closest('tr'))[id], url, id);
    })
}
function ShowTabDetail(id, controller, idName) {
    $('[href="#DetailTab"]').click();
    var dataItem = $("#grid").data("kendoGrid").dataItem($(id.currentTarget).closest("tr"));
    if (dataItem != undefined) {
        id = dataItem[idName];
    }
    GetPartialView(controller + '/Detail', 'DetailTab', { id: id });
}
function GetDetailTab(controller) {
    GetPartialView(controller + '/Detail', 'DetailTab', 0);
}

function AfterAdd(e) {
    if (e.type == "create" || e.type == "update" || e.type == "destroy") {
        if (e.response == null || e.response.Errors == null) {
            CreateAnswerNShowIt(' ', 1);
            kendoRefresh();

        }
        else {
            CreateAnswerNShowIt(' ', 3);
            kendoRefresh();

        }
    }
}
// //GetJson object and get their data to send it as input values to controller
// function getFormData($form) {
//     var unindexed_array = $form.serializeArray();
//     var indexed_array = {};

//     $.map(unindexed_array, function (n, i) {
//         indexed_array[n['name']] = n['value'];
//     });

//     return indexed_array;
// }


/////Ronaldo
//Esta funcion muestra mensaje cuando el listview no tiene contendio y se agrega al evento datasource
function NoRecordsListview(NameListview = 'listView') {
    const IDListview = document.getElementById(NameListview);
    const listViewContent = IDListview.querySelector('.k-listview-content');
    // Comprobar si el contenido está vacío y si la imagen ya está agregada
    if (listViewContent.innerHTML === "" && !document.getElementById('NotrecordsID')) {
        // Agregar la imagen
        listViewContent.innerHTML += "<img  id='NotrecordsID' class='show-empty' />";
    } else {
        // Si la imagen existe ocultarla
        const notRecordsImage = document.getElementById('NotrecordsID');
        if (notRecordsImage) notRecordsImage.style.display = notRecordsImage.style.display === "block" ? "none" : "block";
    }

}
//Eliminar elemento del grid o listview, si el server es true elimina el campo directo en el servidor 
function RemoveElementKendo(ID, NameGrid = 'grid', Componente = "kendoGrid", Server = false) {
    const grid = $("#" + NameGrid).data(Componente);
    const dataSource = grid.dataSource;
    const elementToDelete = dataSource.get(ID);
    dataSource.remove(elementToDelete);
    if (Server) {
        dataSource.sync();
    }
}
//Actualizar elemento del grid o el listview, si el server es true actualiza el campo directo en el servidor 
function UpdateElementKendo(ID, NameGrid = 'grid', Componente = "kendoGrid", ColumnaName, valor, Server = false) {
    const grid = $("#" + NameGrid).data(Componente);
    const dataSource = grid.dataSource;
    const Elementupdate = dataSource.get(ID);
    Elementupdate.set(ColumnaName, valor);
    if (Server) {
        dataSource.sync();
    }
}

//Carlos

///Funcion generica para obtener el id del answerresult
function get_id_from_custom_answer_result(answer,id) {
    if (!id) {
        id= 101207;
    }
    return answer.Messages[answer.Type.indexOf(id)];
}

///Funcion generica para ver si la respuesta de customAjaxSubmit tiene un mensaje satisfactorio
function answer_result_contains_succees(answerResult) {
    return answerResult.Type.includes(1)
}

function kendoProgress(target, enabled) {
    var element = $(target);
    if (element.css("position") !== "relative" && element.css("position") !== "absolute" && element.css("position") !== "fixed") {
        element.css("position", "relative");
    }

    kendo.ui.progress(element, enabled);
}

///Retorna si es diciembre ya
function isDecemberSeason() {
    const today = new Date();
    const month = today.getMonth() + 1; // Enero = 0, por eso +1
    const day = today.getDate();

    return month === 12 && day >= 1 && day <= 31;
}


function iniciarNieveEnElemento(selector, canvasId) {

    const target = document.querySelector(selector);
    if (!target) return;

    // Evitar duplicados
    if (document.getElementById(canvasId)) return;

    // Crear canvas global
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;

    Object.assign(canvas.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "9999"
    });

    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const snowflakes = [];
    const maxFlakes = 60;

    function createSnowflakes() {
        snowflakes.length = 0;
        for (let i = 0; i < maxFlakes; i++) {
            snowflakes.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * -window.innerHeight,
                r: Math.random() * 2 + 1,
                speed: Math.random() * 1.2 + 0.4,
                drift: Math.random() * 1.5 - 0.75
            });
        }
    }

    function drawSnowflakes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rect = target.getBoundingClientRect();

        // ✅ Recorte SOLO en el área del elemento
        ctx.save();
        ctx.beginPath();
        ctx.rect(rect.left, rect.top, rect.width, rect.height);
        ctx.clip();

        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();

        for (let f of snowflakes) {
            ctx.moveTo(f.x, f.y);
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        }

        ctx.fill();
        ctx.restore();

        for (let f of snowflakes) {
            f.y += f.speed;
            f.x += f.drift;

            if (f.y > rect.bottom) {
                f.y = rect.top - 10;
                f.x = Math.random() * window.innerWidth;
            }

            if (f.x < 0 || f.x > window.innerWidth) {
                f.x = Math.random() * window.innerWidth;
            }
        }

        requestAnimationFrame(drawSnowflakes);
    }

    createSnowflakes();
    drawSnowflakes();
}

function ponerGorritoUsuarioNavidad() {

    const userImg = document.querySelector('.kt-header__topbar-user img');
    if (!userImg) return;

    // Evitar duplicado
    if (document.getElementById("santa-hat-fixed")) return;

    // Crear gorrito
    const hat = document.createElement("img");
    hat.id = "santa-hat-fixed";
    hat.src = "https://pngimg.com/uploads/santa_hat/santa_hat_PNG66.png";

    Object.assign(hat.style, {
        position: "fixed",     // ✅ CLAVE: ya no depende del layout
        pointerEvents: "none",
        zIndex: "10000",
        transition: "all 0.2s ease"
    });

    document.body.appendChild(hat);

    function posicionarGorrito() {
        const rect = userImg.getBoundingClientRect();
        const size = rect.width;

        // hat.style.width = (size * 0.85) + "px";
        // hat.style.left = (rect.left - size * 0.15) + "px";
        // hat.style.top  = (rect.top  - size * 0.45) + "px";
        // hat.style.transform = "rotate(-15deg)";
        hat.style.width = (size * 0.9) + "px";      // un poco más grande
        hat.style.left = (rect.left - size * 0.05) + "px"; // más centrado
        hat.style.top  = (rect.top  - size * 0.28) + "px"; // mucho más abajo (más pegado)
        hat.style.transform = "rotate(-12deg)";    // un poco menos inclinado

    }

    posicionarGorrito();
    window.addEventListener("resize", posicionarGorrito);
    window.addEventListener("scroll", posicionarGorrito);

    // Si el dropdown se abre/cierra y mueve el layout
    setInterval(posicionarGorrito, 500);
}

function cambiarTextoBienvenida() {
     var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1; // Enero = 1, Diciembre = 12

    var text = "Hola";

    // 🎄 Navidad: 24 y 25 de diciembre
    if (month === 12 && (day === 24 || day === 25) ) {
        text = "Feliz Navidad!";
    }
    // 🎆 Año Nuevo: 31 de diciembre
    else if ((month === 12 && day === 31 ) || (month === 1 && day === 1)) {
        text = "Feliz Año Nuevo!";
    }

    var el = document.querySelector(".kt-header__topbar-welcome.kt-hidden-mobile");

    if (el) {
        el.textContent = text;
    }
}
