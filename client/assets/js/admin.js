host = 'http://localhost:5000'

$(document).on("click", '#admin-login', function(e){
    e.preventDefault()

    $.ajax({
        url: host + '/admin',
        type: 'POST',
        data: JSON.stringify({ username: $('#admin-username').val(), password: $('#admin-password').val()}),
        contentType: "application/json",
        success: function(result) {
            sessionStorage.setItem('auth', JSON.stringify(result))
            alert("loggade in som admin")
            loadAdminPages()
        },
        error: function() {
            alert("Fel användarnamn eller lösenord")
        }
    });
});

function removeActive() {
    document.getElementById("sidebar-status").classList.remove("active")
    document.getElementById("sidebar-users").classList.remove("active")
    document.getElementById("sidebar-apartments").classList.remove("active")
    document.getElementById("sidebar-reviews").classList.remove("active")
}

function loadAdminPages() {
    $('#wrapper').html($('#view-admin').html())
    removeActive()
    document.getElementById("sidebar-status").classList.add("active")
    loadNumberOfUsers()
    loadNumberOfApartments()
    loadNumberOfReviews()
    
}

function loadNumberOfUsers() {
    $.ajax({
        url: host + '/users',
        type: 'GET',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        success: function(users) {
            var numberOfUsers = users.length
            document.getElementById('number-of-users').innerHTML += numberOfUsers
        }
    })
}

function loadNumberOfApartments() {
    $.ajax({
        url: host + '/apartments',
        type: 'GET',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        success: function(apartments) {
            var numberOfApartments = apartments.length
            document.getElementById('number-of-apartments').innerHTML += numberOfApartments
        }
    })
}
function loadNumberOfReviews() {
    $.ajax({
        url: host + '/reviews',
        type: 'GET',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        success: function(reviews) {
            var numberOfReviews = reviews.length
            document.getElementById('number-of-reviews').innerHTML += numberOfReviews
        }
    })
}

function editUsersView() {
    $('.admin-wrapper').empty()
    removeActive()
    document.getElementById("sidebar-users").classList.add("active")

    $.ajax({
        url: host + '/users',
        type: 'GET',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        success: function(users) {
            $('.admin-wrapper').append(
                '<div class="row">' +
                    '<div class="col">' +
                        '<div class="card-content">' +
                            '<table>' +
                                '<thead>' +
                                    '<tr>' +
                                        '<th>#</th>' +
                                        '<th>Namn</th>' +
                                        '<th>Email</th>' +
                                        '<th>Sysselsättning</th>' +
                                    '</tr>' +
                                '</thead>' +
                                '<tbody id="users-table"></tbody>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            )
            $.each(users, function(index, value) {
                $('#users-table').append(
                    '<tr>' +
                        '<td>' + value.id + '</td>' +
                        '<td>' + value.first_name + ' ' + value.last_name + '</td>' +
                        '<td>' + value.email + '</td>' +
                        '<td>' + value.occupation + '</td>' +
                        '<td>' +
                            '<i class="fas fa-user-edit" role="button" onclick=editUser('+value.id+')></i>' +
                        '</td>' +
                        '<td>' +
                            '<i class="fas fa-trash-alt" role="button" onclick=deleteUser('+value.id+')></i>' +
                        '</td>' +
                    '</tr>'
                )
            })
        }
    })
}

function editApartmentsView() {
    $('.admin-wrapper').empty()
    removeActive()
    document.getElementById("sidebar-apartments").classList.add("active")

    $.ajax({
        url: host + '/apartments',
        type: 'GET',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        success: function(apartments) {
            $('.admin-wrapper').append(
                '<div class="row">' +
                    '<div class="col">' +
                        '<div class="card-content">' +
                            '<table>' +
                                '<thead>' +
                                    '<tr>' +
                                        '<th>#</th>' +
                                        '<th>Adress</th>' +
                                        '<th>Postnummer</th>' +
                                        '<th>Ort</th>' +
                                        '<th>Yta</th>' +
                                    '</tr>' +
                                '</thead>' +
                                '<tbody id="apartments-table"></tbody>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            )
            $.each(apartments, function(index, value) {
                $('#apartments-table').append(
                    '<tr>' +
                        '<td>' + value.id + '</td>' +
                        '<td>' + value.address +'</td>' +
                        '<td>' + value.zip_code +'</td>' +
                        '<td>' + value.city + '</td>' +
                        '<td>' + value.area + '</td>' +
                        '<td>' +
                            '<i class="fas fa-edit" role="button" onclick=editApartment('+value.id+')></i>' +
                        '</td>' +
                        '<td>' +
                            '<i class="fas fa-trash-alt" role="button" onclick=deleteApartment('+value.id+')></i>' +
                        '</td>' +
                    '</tr>'
                )
            })
        }
    })
}

function editReviewsView() {
    $('.admin-wrapper').empty()
    removeActive()
    document.getElementById("sidebar-reviews").classList.add("active")

    $.ajax({
        url: host + '/reviews',
        type: 'GET',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        success: function(reviews) {
            $('.admin-wrapper').append(
                '<div class="row">' +
                    '<div class="col">' +
                        '<div class="card-content">' +
                            '<table>' +
                                '<thead>' +
                                    '<tr>' +
                                        '<th>#</th>' +
                                        '<th>Betyg</th>' +
                                        '<th>Lämnat på (användarens id)</th>' +
                                    '</tr>' +
                                '</thead>' +
                                '<tbody id="reviews-table"></tbody>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            )
            $.each(reviews, function(index, value) {
                $('#reviews-table').append(
                    '<tr>' +
                        '<td>' + value.id + '</td>' +
                        '<td>' + value.rating +'</td>' +
                        '<td>' + value.user_id +'</td>' +
                        '<td>' +
                            '<i class="fas fa-edit" role="button" onclick=editReview('+value.id+')></i>' +
                        '</td>' +
                        '<td>' +
                            '<i class="fas fa-trash-alt" role="button" onclick=deleteReview('+value.id+')></i>' +
                        '</td>' +
                    '</tr>'
                )
            })
        }
    })
}

function deleteUser(user_id) {
    $.ajax({
        url: host + '/users/' + user_id.toString(),
        type: 'DELETE',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        success: function() {
            alert('Användare ' + user_id.toString() + ' har tagits bort')
            editUsersView()
        }
    })
}

function deleteApartment(apartment_id) {
    $.ajax({
        url: host + '/apartments/' + apartment_id.toString(),
        type: 'DELETE',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        success: function() {
            alert('Lägenhet ' + apartment_id.toString() + ' har tagits bort')
            editApartmentsView()
        }
    })
}

function deleteReview(review_id) {
    $.ajax({
        url: host + '/reviews/' + review_id.toString(),
        type: 'DELETE',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        success: function() {
            alert('Omdöme ' + review_id.toString() + ' har tagits bort')
            editReviewsView()
        }
    })
}

function editUser(user_id) {
    $('.admin-wrapper').empty()
    $('.admin-wrapper').append(
        '<div class="admin-edit-view">' +
            '<form class="admin-edit-form" id="admin-edit-user">' +
                '<input type="text" name="id" class="admin-edit-input" id="admin-edit-user-id" hidden>' +
                '<label for="förnamn">Förnamn</label><input type="text" name="first name" class="admin-edit-input" id="admin-edit-first-name">' +
                '<label for="efternamn">Efternamn</label><input type="text" name="last name" class="admin-edit-input" id="admin-edit-last-name">' +
                '<label for="email">Email</label><input type="text" name="email" class="admin-edit-input" id="admin-edit-email">' +
                '<label for="bio">Bio</label><textarea type="text" name="bio" class="admin-edit-input" id="admin-edit-bio" rows="3"></textarea>' +
                '<label for="sysselsättning">Sysselsättning</label><input type="text" name="occupation" class="admin-edit-input" id="admin-edit-occupation">' +
                '<label for="är_student">Student? (true/false)</label><input type="text" name="is student" class="admin-edit-input" id="admin-edit-is-student">' +
                '<a class="btn btn-primary" id="admin-save-user-changes" onclick=saveAdminUserChanges()>Spara Ändringar</a>' +
                '<a class="btn btn-secondary" onclick=editUsersView()>Avbryt</a>' +
            '</form>' +
        '</div>'
    )
    $.ajax({
        url: host + '/users/' + user_id.toString(),
        type: 'GET',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        success: function(user) {
            $('#admin-edit-user-id').val(user.id)
            $('#admin-edit-first-name').val(user.first_name)
            $('#admin-edit-last-name').val(user.last_name)
            $('#admin-edit-email').val(user.email)
            $('#admin-edit-bio').val(user.bio)
            $('#admin-edit-occupation').val(user.occupation)
            $('#admin-edit-is-student').val(user.is_student)
        }
    })
}

function saveAdminUserChanges() {
    $.ajax({
        url: host + '/users/' + $('#admin-edit-user-id').val(),
        type: 'PUT',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        data: JSON.stringify({ email: $('#admin-edit-email').val(), bio: $('#admin-edit-bio').val(), 
                                occupation: $('#admin-edit-occupation').val(), first_name: $('#admin-edit-first-name').val(), 
                                last_name: $('#admin-edit-last-name').val(), is_student: $('#admin-edit-is-student').val() == 'true'}),
        success: function() {
            alert("Ändringarna har sparats")
            editUsersView()
        }
    })
}

function editApartment(apartment_id) {
    $('.admin-wrapper').empty()
    $('.admin-wrapper').append(
        '<div class="admin-edit-view">' +
            '<form class="admin-edit-form" id="admin-edit-apartment">' +
                '<input type="text" name="id" class="admin-edit-input" id="admin-edit-apartment-id" hidden>' +
                '<label for="adress">Adress</label><input type="text" name="adress" class="admin-edit-input" id="admin-edit-address">' +
                '<label for="stad">Stad</label><input type="text" name="stad" class="admin-edit-input" id="admin-edit-city">' +
                '<label for="landskap">Landskap</label><input type="text" name="landskap" class="admin-edit-input" id="admin-edit-state">' +
                '<label for="postnummer">Postnummer</label><input type="text" name="postnummer" class="admin-edit-input" id="admin-edit-zip-code">' +
                '<label for="Antal rum">Rum</label><input type="text" name="rum" class="admin-edit-input" id="admin-edit-rooms">' +
                '<label for="yta">Yta</label><input type="text" name="yta" class="admin-edit-input" id="admin-edit-area">' +
                '<a class="btn btn-primary" id="admin-save-apartment-changes" onclick=saveAdminApartmentChanges()>Spara Ändringar</a>' +
                '<a class="btn btn-secondary" onclick=editApartmentsView()>Avbryt</a>' +
            '</form>' +
        '</div>'
    )
    $.ajax({
        url: host + '/apartments/' + apartment_id.toString(),
        type: 'GET',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        success: function(apartment) {
            $('#admin-edit-apartment-id').val(apartment.id)
            $('#admin-edit-address').val(apartment.address)
            $('#admin-edit-city').val(apartment.city)
            $('#admin-edit-state').val(apartment.state)
            $('#admin-edit-zip-code').val(apartment.zip_code)
            $('#admin-edit-rooms').val(apartment.rooms)
            $('#admin-edit-area').val(apartment.area)
        }
    })
}

function saveAdminApartmentChanges() {
    $.ajax({
        url: host + '/apartments/' + $('#admin-edit-apartment-id').val(),
        type: 'PUT',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        data: JSON.stringify({ address: $('#admin-edit-address').val(), city: $('#admin-edit-city').val(), 
                                state: $('#admin-edit-state').val(), zip_code: parseInt($('#admin-edit-zip-code').val()), 
                                rooms: parseInt($('#admin-edit-rooms').val()), area: parseInt($('#admin-edit-area').val())}),
        success: function() {
            alert("Ändringarna har sparats")
            editApartmentsView()
        }
    })
}

function editReview(review_id) {
    $('.admin-wrapper').empty()
    $('.admin-wrapper').append(
        '<div class="admin-edit-view">' +
            '<form class="admin-edit-form" id="admin-edit-review">' +
                '<input type="text" name="id" class="admin-edit-input" id="admin-edit-review-id" hidden>' +
                '<label for="betyg">Betyg</label><input type="text" name="betyg" class="admin-edit-input" id="admin-edit-rating">' +
                '<label for="kommentarer">Kommentarer</label><textarea type="text" name="kommentarer" class="admin-edit-input" id="admin-edit-comments" rows="3"></textarea>' +
                '<a class="btn btn-primary" id="admin-save-apartment-changes" onclick=saveAdminReviewChanges()>Spara Ändringar</a>' +
                '<a class="btn btn-secondary" onclick=editReviewsView()>Avbryt</a>' +
            '</form>' +
        '</div>'
    )
    $.ajax({
        url: host + '/reviews/' + review_id.toString(),
        type: 'GET',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        success: function(review) {
            $('#admin-edit-review-id').val(review.id)
            $('#admin-edit-rating').val(review.rating)
            $('#admin-edit-comments').val(review.text)
        }
    })
}

function saveAdminReviewChanges() {
    $.ajax({
        url: host + '/reviews/' + $('#admin-edit-review-id').val(),
        type: 'PUT',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).admin_token},
        contentType: 'application/json',
        data: JSON.stringify({ text: $('#admin-edit-comments').val(), rating: parseInt($('#admin-edit-rating').val())}),
        success: function() {
            alert("Ändringarna har sparats")
            editReviewsView()
        }
    })
}