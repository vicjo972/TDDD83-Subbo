var host = 'http://localhost:5000';

$(document).on("click", '#signup', function(e){
    e.preventDefault()
    $.ajax({
        url: host + '/sign-up',
        type: 'POST',
        data: JSON.stringify({ email: $('#email').val(), password: $('#password').val(), bio: $('#bio').val(), occupation: $('#occupation').val(), first_name: $('#first_name').val(), last_name: $('#last_name').val(), is_student: $('#is_student').prop('checked')}),
        contentType: "application/json",
        success: function(result) {
            $("#wrapper").html($("#view-login").html());
        },
        error: function() {
            alert("Ange en giltig e-postadress")
        }
    });
})