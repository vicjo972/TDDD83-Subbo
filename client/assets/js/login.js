var host = 'http://localhost:5000';

function rememberMe(){
 
    if (localStorage.chkbx && localStorage.chkbx != '') {
        $('#remember_me').attr('checked', 'checked');
        $('#email').val(localStorage.usrname);
        $('#password').val(localStorage.pass);
        
    } else {
        $('#remember_me').removeAttr('checked');
        $('#email').val('');
        $('#password').val('');
       
    }
};

$(document).on("click", '#login', function(e){
    e.preventDefault()

    $.ajax({
        url: host + '/login',
        type: 'POST',
        data: JSON.stringify({ email: $('#email').val(), password: $('#password').val()}),
        contentType: "application/json",
        success: function(result) {
            sessionStorage.setItem('auth', JSON.stringify(result))
            if ($('#remember_me').is(':checked')) {
                // save username and password
                localStorage.usrname = $('#email').val();
                localStorage.pass = $('#password').val();
                localStorage.chkbx = $('#remember_me').val();
            } else {
                localStorage.usrname = '';
                localStorage.pass = '';
                localStorage.chkbx = '';
            }
            window.location.replace("./");     

        },
        error: function() {
            alert("Fel användarnamn eller lösenord")
        }
    });
});

    $(document).ready(function(){
        $(document).on("loginroute", function(event) {
            rememberMe();
        });
    })
   

