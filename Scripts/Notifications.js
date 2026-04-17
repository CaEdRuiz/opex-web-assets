//<script type="text/javascript" src="https://localhost:44317/Scripts/jquery.signalR-2.4.1.js"></script>
//<script type="text/javascript" src="https://localhost:44317/signalr/hubs"></script>

var myHub = $.connection.notificationHub;
$(document).ready(function () {
    $.connection.hub.url = 'https://apps.bae.gym:84/BAEAPI/signalr';
    $.connection.hub.start().done(function () {
        myHub.server.getNotifications($('.NotEmplpyeeID').attr("id"), $.connection.hub.id);
    });
});

function NotificationSearchStart() {
    myHub.server.searchStartSimple();
}

myHub.client.searchNotifications = function () {
    myHub.server.getNotifications($('.NotEmplpyeeID').attr("id"), $.connection.hub.id);
}

myHub.client.showNotification = function (notificationList) {
    var unseen = 0;
    var htmlcon = '';
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
        htmlcon += '<div class="notification ' + s + '" id="' + not.NotificationID + '">';
        htmlcon += '<div class="notification-title text-info">' + not.Subject + '</div>';
        htmlcon += '<div class="notification-description">' + not.Message + '</div>';
        htmlcon += '<div class="notification-ago">Hace ' + hours + iterator + '<a style="color: #bbb"  href="' + not.Link +'" '+(not.Link != '#' & not.Link != '' ? 'target="_blank"' : '') +'> Ver más <i class="fa fa-arrow-right"></i></a></div>';
        htmlcon += '<div class="notification-icon ' + not.Icon + ' bg-info"></div>';
        htmlcon += '</div>';
    }
    $('#NotificationList').html(htmlcon);
    if (unseen > 0) {
        $('#NotificationNumber').html(unseen);
        $('#NotificationNumber').addClass("label");
    }
    else {
        $('#NotificationNumber').html('');
        $('#NotificationNumber').removeClass("label");
    }
}
$('#NotificationDropdown').on('click', function () {
    var not = '';
    $('.unseen').each(function () {
        not += this.id + ',';
    });
    if (not.length > 0) {
        myHub.server.seenNotification(not);

        $('#NotificationNumber').html('');
        $('#NotificationNumber').removeClass("label");
        setTimeout(() => {
             $('.notification').removeClass("unseen");
        }, 2000);

    }
});

