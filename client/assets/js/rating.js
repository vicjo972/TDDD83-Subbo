var host = 'http://localhost:5000';
var rating = 3;

function unselectAllStars() {
    document.querySelector("#first-star").classList.remove("checked")
    document.querySelector("#second-star").classList.remove("checked")
    document.querySelector("#third-star").classList.remove("checked")
    document.querySelector("#fourth-star").classList.remove("checked")
    document.querySelector("#fifth-star").classList.remove("checked")
}

function selectStars(rating) {
    unselectAllStars()
    for (i = 1; i <= rating; i++) {
        if (i == 1) {
            document.querySelector("#first-star").classList.add("checked")
        }
        else if (i == 2) {
            document.querySelector("#second-star").classList.add("checked")
        }
        else if (i == 3) {
            document.querySelector("#third-star").classList.add("checked")
        }
        else if (i == 4) {
            document.querySelector("#fourth-star").classList.add("checked")
        }
        else if (i == 5) {
            document.querySelector("#fifth-star").classList.add("checked")
        }
    }
}

function rateLandlord() {
    if (JSON.parse(window.sessionStorage.getItem('auth')).user.current_apartment_id) {
        $('#rate-user-modal').modal('show');
    }
    else {
        alert("Du hyr inte någon lägenhet i nuläget")
    }
}

function rateTenant(user_id) {
    $('#rate-user-modal').modal('show');
    $(document).on('shown.bs.modal', '#rate-user-modal', function() {
        var modal = $(this)
        modal.find('.modal-body #leave-review-on').val(user_id) 
    })
}

$("#first-star").on("click", function(e) {
    e.preventDefault()
    rating = 1;
    selectStars(rating)
    updateRatingText(rating)
})

$("#second-star").on("click", function(e) {
    e.preventDefault()
    rating = 2;
    selectStars(rating)
    updateRatingText(rating)
})

$("#third-star").on("click", function(e) {
    e.preventDefault()
    rating = 3;
    selectStars(rating)
    updateRatingText(rating)
})

$("#fourth-star").on("click", function(e) {
    e.preventDefault()
    rating = 4;
    selectStars(rating)
    updateRatingText(rating)
})

$("#fifth-star").click(function(e) {
    e.preventDefault()
    rating = 5;
    selectStars(rating)
    updateRatingText(rating)
})

function updateRatingText(rating) {
    $('#input-rating').val(rating)
}

$('#input-rating').change(function() {
    selectStars($('#input-rating').val())
})

document.getElementById("rating-user-form").onsubmit=function(e) {
    e.preventDefault()

    if (Number($('#leave-review-on').val()) != 0) {
        sendReview(Number($('#leave-review-on').val()))
    }
    else {
        // fetch user_id for landlord
        $.ajax({
            url: host + '/apartments/' + JSON.parse(window.sessionStorage.getItem('auth')).user.current_apartment_id.toString(),
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
            type: 'GET',
            contentType: 'application/json',
            success: function(current_appartment) {
                sendReview(current_appartment.owner.id)            
            }
        })
    }

    $('#rate-user-modal').modal('hide');
 }



 function sendReview(user_id) {
    $.ajax({
        url: host + '/reviews',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        data: JSON.stringify({user: user_id, rating: $('#input-rating').val(), text: $('#user-comments').val()}),
        success: function() {
            alert("omdömet har lagts till")
        }
    })
 }

function getReviews(user_id) {
    var total_stars = 0
    var average_rating = 0
    $.ajax({
        url: host + '/users/' + user_id.toString() + '/reviews',
        type: 'GET',
        contentType: 'application/json',
        success: function(reviews) {
            if (reviews.length == 0) {
                document.getElementById("userreviews_container").innerHTML += '<div class="card"><div class="card-body"><p class="card-text">Kunde inte hitta några omdömen</p></div></div>'
            }
            $.each(reviews, function(index, value) {
                total_stars += value.rating
                showReviews(value.rating, value.text, value.date)
            })
            average_rating = total_stars / reviews.length
            $("#average-rating").append(average_rating)

        }

    })
}

function showReviews(rating, text, date) {
    var str = ""
    str += '<div class="card">'
    str += '<div class="card-body">'
    str += '<p class="card-text">' + date + '</p>'
    str += '<p class="card-text"><b>Betyg:</b></p>'
    str += '<p class="card-text">' + rating + '</p>'
    str += '<p class="card-text"><b>Kommentar:</b></p>'
    str += '<p class="card-text">' + text + '</p>'
    str += '</div>'
    str += '</div>'
    document.getElementById("userreviews_container").innerHTML += str
}

$(document).ready(function(){
    $(document).on("readreviewsroute", function() {
        getReviews(JSON.parse(window.sessionStorage.getItem('auth')).user.id)
    })
})

function potentialTenantReviews(user_id) {
    $("#wrapper").html($("#view-reviews").html());
    getReviews(user_id)
}
