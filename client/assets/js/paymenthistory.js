var host = 'http://localhost:5000';

function add_payment_history(date, amount) {
    var str = ""
    str += '<div class="card">'
    str += '<div class="card-body">'
    str += '<p class="card-text">' + date + ': ' + amount + ' SEK' + '</p>'
    str += '</div>'
    str += '</div>'
    document.getElementById("paymenthistory_container").innerHTML += str
}

function add_no_payments_found() {
    var str = ""
    str += '<div class="card">'
    str += '<div class="card-body">'
    str += '<p class="card-text">' + 'Inga tidigare betalningar hittades.' + '</p>'
    str += '</div>'
    str += '</div>'
    document.getElementById("paymenthistory_container").innerHTML += str
}

$(document).on("click", "#see-payment-history", function() {
    auth = JSON.parse(window.sessionStorage.getItem('auth'));
    
    current_user = auth.user;
    $.ajax({
        headers: { "Authorization": "Bearer " + auth.token },
        url: host + '/payment-history' + '/' + current_user.customer_id.toString(),
        type: 'GET',
        contentType: 'application/json',
        success: function(payment_history) {
            if (payment_history.length == 0) {
                add_no_payments_found()
            } else {
                $.each(payment_history, function(index, value) {
                    add_payment_history(value.date, value.amount)
                })
            }
            
        }
    })
})