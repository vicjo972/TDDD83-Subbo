var host = 'http://localhost:5000';

function hide_nav_buttons(){
    var auth = sessionStorage.getItem('auth') ?? ""
    var signedIn = auth.length > 0;

    $(".signed-out").toggleClass('d-none', signedIn);
    $(".signed-in").toggleClass('d-none', !signedIn);
}

window.onload = hide_nav_buttons();

$("#logout").click(function(e) {
    e.preventDefault();
    sessionStorage.removeItem('auth')
    window.location.replace("./");
});

