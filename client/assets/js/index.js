$('.nav-item').on('click', function(){
    $('.navbar-toggler').click(); //bootstrap 4.x
});

function rent() {

    if (JSON.parse(sessionStorage.getItem('auth')) == null) {
        $("#wrapper").html($("#view-login").html());
    } else {
        $("#wrapper").html($("#view-createadvert").html());
    }
    
    }

