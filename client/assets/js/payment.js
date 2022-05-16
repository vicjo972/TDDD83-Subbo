function saveInfo() {
    address = $('#inputAddress').val()
    city = $('#inputCity').val()
    state = $('#inputState').val()
    zip_code = $('#inputZip').val()
    rooms = $('#inputRooms').val()
    area = $('#inputArea').val()
    description = $('#inputAdvertDescription').val()
    rent = $('#inputRent').val()
    start_date = $('#inputStartDate').val()
    end_date  = $('#inputEndDate').val()
}

function showCustomerInfo(modal) {
    auth = JSON.parse(window.sessionStorage.getItem('auth'));
    current_user = auth.user;
    $.ajax({
        url: host + "/users"+"/"+current_user.id.toString(),
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
        type: 'GET',
        contentType: "application/json",
        success: function(user) {
            modal.find('.modal-body #customer-email').val(user.email)
            modal.find('.modal-body #customer-name').val(user.first_name + ' ' + user.last_name)                 
        }
    });
}

//This happens when "lägg till bilder"-button is clicked 
document.getElementById("create-advert-form").onsubmit=function(e) {
    e.preventDefault()
    $('#image-modal').modal('show')
    return false;   
}

//This happens when "lägg till valda bilder" is clicked
$(document).on("click", '#imageNext', function(e){
    $('#image-modal').modal('hide')
    document.getElementById('go-to-image-upload').disabled = true
    document.getElementById('go-to-image-upload').innerHTML = "Du har redan lagt till bilder. Valda bilder kan bytas ut efter att annonsen har skapats"
    document.getElementById('go-to-payment').disabled = false
})

//This happens when "betala" is clicked
document.getElementById("go-to-payment").onclick=function(e) {
    e.preventDefault()
    saveInfo()
    document.getElementById('create-ad-fieldset').disabled = "true"
    $('#payment-modal').modal('show')
    return false;
}

var stripe = Stripe('pk_test_51IUAh8IMrIYuplAm2iQZG65L9Y6lOVuz1OMawl9m8f8vSX6k5cxNy2QbZGYoU4yUdIHT1gZq3UlBtT58eQAWDTQT00D6xMd8BD');

var purchase = {
    items: [{ id: "Annonskostnad" }]
};


$(document).on('shown.bs.modal', '#payment-modal', function(e) {
    create_advert()  // This was the latest in the create-ad-process I could make create_advert() work //Alva

    e.preventDefault()
    showCustomerInfo($(this))
    $('#pay-button-text').append(99 + (JSON.parse(window.sessionStorage.getItem('auth')).user.is_student ? 0 : 1) * 50 + ' SEK')

    fetch('/secret/' + JSON.parse(window.sessionStorage.getItem('auth')).user.id.toString(), {
        method: 'POST', 
        contentType: "application/json",
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        body: JSON.stringify(purchase),
    }).then(function(result) {
        return result.json();
    }).then(function(data) {
        var clientSecret = data.client_secret;
    
        var style = {
            base: {
                color: "#32325d",
            }
        };
    
        var elements = stripe.elements();
        var card = elements.create("card", { style: style });
        card.mount("#card-element");
    
        card.on("change", function (event) {
            // Disables and enables the pay buttion depending on if the user has filled in any card details.
             document.querySelector("#pay").disabled = event.empty;
             document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
        });

        $(document).on("click", "#pay", function(ev) {
            ev.preventDefault();
            loading(true)
            document.querySelector("#pay").disabled = true
            stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: card,
                    billing_details: {
                        name: $('#customer-name').val(),
                        email: $('#customer-email').val()
                    }
                }
            }).then(function(result) {
                if (result.error) {
                    // Show error in console
                    console.log(result.error.message);
                    paymentFailed();
                    $.ajax({
                        url: host + '/ads/' + new_ad.id,
                        type: 'DELETE',
                        // headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
                        success: function(){
                            alert ("Betalningen misslyckades, annonsen har tagits bort")
                        } 
                    })    
                } else {
                    // The payment succeeded!
                    card.update({
                        disabled: true
                    })
                    paymentComplete();
                    $("#wrapper").html($("#view-housing").html()); 
                    window.location.replace("/housing");
                    $.ajax({
                        url: host + '/ads/' + new_ad.id,
                        type: 'PUT',
                        dataType: "json", 
                        contentType: "application/json",
                        // headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
                        data: JSON.stringify({paid: true
                        }),
                        success: function(paid_ad){
                            $("#wrapper").html($("#view-housing").html()); 
                            window.location.replace("/housing");
                        } 
                    })   
                } 
            })
        })
    })
})

var loading = function(isLoading) {
    if (isLoading) {
        // Disable the pay-button
        document.querySelector("#pay").disabled = true;
        document.querySelector("#pay-button-text").classList.add("hidden");
    } else {
        document.querySelector("#pay").disabled = false;
        document.querySelector("#pay-button-text").classList.remove("hidden");
    }
}

var paymentFailed = function() {
    loading(false);
    document.querySelector(".payment-failed-message").classList.remove("hidden");
}

var paymentComplete = function() {
    loading(false);
    document.querySelector(".result-message").classList.remove("hidden");
    document.querySelector("#pay").disabled = true;
    $('#payment-modal').modal('hide')
};

var showError = function(errorMsgText) {
    loading(false);
    var errorMsg = document.querySelector("#card-error");
    errorMsg.textContent = errorMsgText;
    setTimeout(function() {
        errorMsg.textContent = "";
    }, 4000);
};

function create_advert() {
    //Creates apartment
    $.ajax({
        url: host + '/apartments',
        type: 'POST',
        dataType: "json", 
        contentType: "application/json",
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        data: JSON.stringify({address: address, city: city, 
            state: state, zip_code: zip_code,
            rooms: rooms, area: area
        }),
        success: function(new_apartment){
          //Creates advert
          $.ajax({
            url: host + '/ads',
            type: 'POST',
            dataType: "json", 
            contentType: "application/json",
            headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
            data: JSON.stringify({description: description, rent: rent, 
            start_date: start_date, end_date: end_date, apartment_id: new_apartment.id,
            }),
            success: function(newAd){
                new_ad = newAd
                document.getElementById('imageForm').action = '/upload-img/'+new_apartment.id 
                document.getElementById('imageForm').method = 'POST'
                document.getElementById('imageForm').submit()
            }
          })
        }
    })
}


