//<script type="text/javascript" src="https://localhost:44317/Scripts/jquery.signalR-2.4.1.js"></script>
//<script type="text/javascript" src="https://localhost:44317/signalr/hubs"></script>
var userInteractingWithPage = false;

const soundd = new Audio();
soundd.src = 'https://apps.bae.gym:84/Resources/assets/audio/notifications/' + "4" + '.mp3';
soundd.volume = 0.5;
//soundd.muted = true;
//soundd.preload = false;

var myHub = $.connection.notificationHub;

$(document).ready(function () {
    $.connection.hub.url = 'https://apps.bae.gym:84/BAEAPI/signalr';
    $.connection.hub.start().done(function () {
        myHub.server.getNotifications($('.NotEmplpyeeID').attr("id"), $.connection.hub.id);
    });

    // setInterval(function () {
    //     NotificationSearchStart();
    // }, 10000);


    //Configura un observador del elemento notificationsList para mutear las notificaciones cuando la lista esta desplegada
    var notificationsListDiv = document.querySelector('.kt-header__topbar-wrapper');
    var observer = new MutationObserver(function (mutationsList) {
        mutationsList.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
                var nuevoValor = notificationsListDiv.getAttribute('aria-expanded');
                soundd.muted = (nuevoValor === 'true');//Silencia o no el sonido de la notificacion dependiendo si está o no abierta la lista
            }
        });
    });
    var opciones = { attributes: true };
    observer.observe(notificationsListDiv, opciones);
});


document.addEventListener('click', function () {// Agregar un evento que detecte la interacción del usuario
    userInteractingWithPage = true;
});

window.addEventListener('focus', function () {// Agregar un escuchador de eventos al obtener el enfoque
    soundd.muted = false;
    NotificationSearchStart();
});

window.addEventListener('blur', function () {// Agregar un escuchador de eventos al perder el enfoque
    soundd.muted = true;
});

function NotificationSearchStart() {
    myHub.server.searchStartSimple();
}

myHub.client.searchNotifications = function () {
    myHub.server.getNotifications($('.NotEmplpyeeID').attr("id"), $.connection.hub.id);
}

myHub.client.showNotification = function (notificationList) {
    var unseen = 0;
    var htmlconNot = '';
    var htmlconEvent = '';
    var htmlconLog = '';
    var countNot = 0;
    var countEvent = 0;
    var countLog = 0;
    var d = new Date();
    for (var i = 0; i < notificationList.length; i++) {
        var not = notificationList[i];
        var s = 'unseen';
        if (not.Seen == false) {
            unseen++;
        }
        else {
            s = 'seen';
        }
        var hours = Math.round(Math.abs(d - new Date(not.CreationDate)) / 3600000);
        var iterator = ' hrs';
        if (hours > 24) {
            hours = Math.round(hours / 24);
            iterator = ' días';
        }
        var type = 'info';
        switch (not.AlertType) {
            case 1:
                type = 'success';
                break;
            case 2:
                type = 'warning';
                break;
            case 3:
                type = 'danger';
                break;
            case 4:
                type = 'info';
                break;
            case 5:
                type = 'brand';
                break;
            default:
                break;
        }
        switch (not.NotificationType) {
            case 1:
                htmlconNot += addHtml(not, type, hours, iterator, s);
                if (not.Seen == false) { countNot++ };
                break;
            case 2:
                htmlconEvent += addHtml(not, type, hours, iterator, s);
                if (not.Seen == false) { countEvent++ };
                break;
            case 3:
                htmlconLog += addHtml(not, type, hours, iterator, s);
                if (not.Seen == false) { countLog++ };
                break;
        }
    }

    $('#topbar_notifications_notificationsList').html(countNot > 0 ? htmlconNot: "<img class='show-empty' />");    
    $('#topbar_notifications_eventsList').html(countEvent > 0 ? htmlconEvent : "<img class='show-empty' />");
    $('#topbar_notifications_logsList').html(countLog != 0 ? htmlconLog: "<img class='show-empty' />");
    
    if (unseen > 0) {
        
        if (userInteractingWithPage) {
            soundd.play();
        }
        

        $('#NotificationNumber').html(unseen + " Nueva" + (unseen > 0 ? "s" : ""));
        if ($('#notifications-bellNumber').length) {
            $('#notifications-bellNumber').text(unseen);
        }
        $('#NotificationBell').addClass("kt-pulse__ring");

        if (countNot > 0) {
            $('a[href="#topbar_notifications_notifications"]').text($('a[href="#topbar_notifications_notifications"]').text().split(' ')[0] + ' ' + countNot);
            //$('a[href="#topbar_notifications_notifications"]').text($('a[href="#topbar_notifications_notifications"]').text() + ' ' + countNot);
        }
        if (countEvent > 0) {
            $('a[href="#topbar_notifications_events"]').text($('a[href="#topbar_notifications_events"]').text().split(' ')[0] + ' ' + countEvent);
            //$('a[href="#topbar_notifications_events"]').text($('a[href="#topbar_notifications_events"]').text() + ' ' + countEvent);
        }
        if (countLog > 0) {
            $('a[href="#topbar_notifications_logs"]').text($('a[href="#topbar_notifications_logs"]').text().split(' ')[0] + ' ' + countLog);
            //$('a[href="#topbar_notifications_logs"]').text($('a[href="#topbar_notifications_logs"]').text() + ' ' + countLog);
        }

    }
    else {
        $('#NotificationNumber').html('0 Nuevas');
        if ($('#notifications-bellNumber').length) {
            $('#notifications-bellNumber').text('');
        }
        $('#NotificationBell').removeClass("kt-pulse__ring");
    }
}

function addHtml(not, type, hours, iterator, s) {

    var conca = '';
    conca += '<a href="' + not.Link + '" class="kt-notification__item ' + s + '"' + (not.Link != '#' & not.Link != '' ? 'target="_blank"' : '') + ' id="' + not.NotificationID + '" onclick=unseen_only_one_notification(' + not.NotificationID + ')>';
    conca += '<div class="kt-notification__item-icon">';
    conca += '<i class="' + not.Icon + ' kt-font-' + type + '"></i>';
    conca += '</div>';
    conca += '<div class="kt-notification__item-details">';
    conca += '<div class="kt-notification__item-title">';
    conca += not.Subject + ': ' + not.Message;
    conca += '</div>';
    conca += '<div class="kt-notification__item-time">';
    conca += 'Hace ' + hours + iterator;
    conca += '</div>';
    conca += '</div>';
    conca += '</a>';
    return conca;
}

$('#NotificationDropdown').on('click', function () {
    var not = '';
    $('.unseen').each(function () {
        not += this.id + ',';
        //Marca como vista la notificación cuando no hay un link al cual acceder
        if (this.getAttribute('href') == '#' || this.getAttribute('href')== '') {
            unseen_only_one_notification(this.id);
        }
    });
    if (not.length > 0) {
                
    } else {
        $('#NotificationBell').removeClass("kt-pulse__ring");
        $('#NotificationNumber').html('0 Nuevas');
    }
});

$("#NotificationDropdown").focusout(function () {
    setTimeout(() => {

        $('#NotificationBell').removeClass("kt-pulse__ring");
        //$('#NotificationNumber').html('0 Nuevas');
        //$('.kt-notification__item').removeClass("unseen");

        if ($('#notifications-bellNumber').length) {
            $('#notifications-bellNumber').text('');
        }
        if ($('a[href="#topbar_notifications_notifications"]').text().split(' ').length > 0) {
            $('a[href="#topbar_notifications_notifications"]').text($('a[href="#topbar_notifications_notifications"]').text().split(' ')[0]);
        }
        if ($('a[href="#topbar_notifications_events"]').text().split(' ').length > 0) {
            $('a[href="#topbar_notifications_events"]').text($('a[href="#topbar_notifications_events"]').text().split(' ')[0]);
        }
        if ($('a[href="#topbar_notifications_logs"]').text().split(' ').length > 0) {
            $('a[href="#topbar_notifications_logs"]').text($('a[href="#topbar_notifications_logs"]').text().split(' ')[0]);
        }
    }, 2000);
});

function unseen_only_one_notification(notificationID) {
    myHub.server.seenNotification(notificationID + ',');
    setTimeout(() => {
        $('#' + notificationID).removeClass("unseen");
    }, 2000);
}
