var host = 'http://localhost:5000';
var editbioscript = ""
    editbioscript += '<script id="edit-bio" type="text/html">'
    editbioscript += '<section class="clean-block clean-form dark">'
    editbioscript += '<div class="container" style="padding-bottom: 127px; padding-top: 100px;">'
    editbioscript += '<form style="border-top-color: rgb(19,31,40);">'
    editbioscript += '<div class="form-group"><label for="first_name">Förnamn</label><input class="form-control item" type="text" id="first_name"></div>'
    editbioscript += '<div class="form-group"><label for="last_name">Efternamn</label><input class="form-control item" type="text" id="last_name"></div>'
    editbioscript += '<div class="form-group"><label for="occupation">Ockupation</label><input class="form-control item" type="text" id="occupation"><small id="occupationHelp" class="form-text text-muted">T.ex. studerande, yrke, etc.</small></div>'
    editbioscript += '<div class="form-group"><label for="bio">Biografi</label><textarea class="form-control" id="bio" rows="3"></textarea><small id="bioHelp" class="form-text text-muted">Berätta vem du är, vad du söker för boende eller om du vill hyra ut en bostad.</small></div>'
    editbioscript += '<button id="submitbiochanges" class="btn btn-primary btn-block" onclick=submitBio() type="submit" style="background: rgb(19,31,40);">Bekräfta</button></form></div></section></script>'

//Apartments that logged in user have uploaded adverts for
function add_apt_card(ad){
    
    var apartment_image_src = "https://pix10.agoda.net/hotelImages/103/1030438/1030438_15081214210034117680.png"
        if (ad.apartment.images[0] !== undefined) {
            apartment_image_src = "../assets/img_uploads/" + ad.apartment.images[0].image_name
        }

    var str = ""
    str += '<div class="card" style="width: 18rem;"></div>'
    str += '<img class="card-img-top" src="'+ apartment_image_src + '" alt="Subbo-loggan." style="width: 250px;">'
    str +=  '<div class="card-body"></div>'
    str += '<h3 class="card-title">'+ad.apartment.address +'</h3>'
    str += '<p class="card-text">' + ad.apartment.area + " m^2 " + "</p>"
    str += '<a class="btn btn-secondary" id="edit-ad-button" data-id="'+ ad.id +'" data-address="'+ ad.apartment.address +'" data-city="'+ ad.apartment.city +'" data-state="'+ ad.apartment.state +'" data-zip_code="'+ ad.apartment.zip_code +'" data-start_date="'+ ad.start_date +'" data-end_date="'+ ad.end_date +'" data-rooms="'+ ad.apartment.rooms +'" data-area="'+ ad.apartment.area +'" data-rent="'+ ad.rent +'" data-description="'+ ad.description +'" >Redigera annons</a>'
    str += '<a class="btn btn-secondary" href= "/ad&id='+ad.apartment.id+'"role="button">Se annons och intresserade användare</a>'
    if (ad.apartment.tenant != null) {
        str += '<br><a class="btn btn-secondary" onclick=rateTenant('+ ad.apartment.tenant.id +') role="button" style="margin-top: 5px;">Betygsätt Hyresgäst</a>'
    }
    // str += '<a class="btn btn-danger" id="delete-ad-button" data-ad_id="'+ ad.id +'" data-apt_id="'+ ad.apartment.id +'" role="button">Ta bort</a>'
    str +=  '</div></div>'
    document.getElementById("mypage_container").innerHTML += str 
}

//Apartments that logged in user is interested in
function add_interests_card(apt){
    var apartment_image_src = "https://pix10.agoda.net/hotelImages/103/1030438/1030438_15081214210034117680.png"
        if (apt.images[0] !== undefined) {
            apartment_image_src = "../assets/img_uploads/" + apt.images[0].image_name
        }

    var str = ""
    str += '<div class="card" style="width: 18rem;"></div>'
    str += '<img class="card-img-top" src="'+ apartment_image_src +'" alt="Subbo-loggan." style="width: 250px;">'
    str +=  '<div class="card-body"></div>'
    str += '<h5 class="card-title">'+apt.address +'</h5>'
    str += '<p class="card-text">' + apt.area + " m^2 " + "</p>"
    str += '<a class="btn btn-secondary" href="/ad&id='+apt.id+'" role="button">Mer info</a>'
    str += '<a class="btn btn-warning" onclick=removeInterest('+apt.id+') href="/my-pages" role="button">Avanmäl ditt intresse!</a>'
    str +=  '</div></div>'  
    document.getElementById("myinterests_container").innerHTML += str 

}


function add_user_info(user){
    document.getElementById("jumbotron-header").innerHTML += user.first_name + ' ' + user.last_name
    document.getElementById("jumbotron-email").innerHTML += user.email
    document.getElementById("jumbotron-occupation").innerHTML += user.occupation
    document.getElementById("jumbotron-bio").innerHTML += user.bio
    
}

function loadInterestedUsers(apt) {
    console.log("laddar")
    $("#list-interested-users").empty();
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
        url: host + '/interested-users/' + apt.id,
        type: 'GET',
        contentType: 'application/json',
        success: function(users) {
            $.each(users, function() {
                console.log(this)
                if (this) {
                    $("#list-interested-users").append('<li>' + this.first_name + ' ' + this.last_name+
                    '<button type="select" class="btn btn-primary" style="float: right;" data-id="'+this.id+'" onclick=selectTenant('+this.id+',' +apt.id+')>Välj</button></li>')
                    
                }
            });
        }
    });  
}

function selectTenant(user_id, apartment_id) {
    console.log(user_id)
    console.log(apartment_id)   
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
        url: host + '/interested-users/'+apartment_id+'/select/'+user_id,
        type: 'PUT',
        contentType: 'application/json',
        success: function(users) {
            alert("Hyresgäst vald!")
        }
    });
}

function loadInterestedUsers(apt) {
    console.log("laddar")
    $("#list-interested-users").empty();
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
        url: host + '/interested-users/' + apt.id,
        type: 'GET',
        contentType: 'application/json',
        success: function(users) {
            $.each(users, function() {
                console.log(this)
                if (this) {
                    $("#list-interested-users").append('<li>' + this.first_name + ' ' + this.last_name+
                    '<button type="select" class="btn btn-primary" style="float: right;" data-id="'+this.id+'" onclick=selectTenant('+this.id+',' +apt.id+')>Välj</button></li>')
                    
                }
            });
        }
    });  
}

function selectTenant(user_id, apartment_id) {
    console.log(user_id)
    console.log(apartment_id)   
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
        url: host + '/interested-users/'+apartment_id+'/select/'+user_id,
        type: 'PUT',
        contentType: 'application/json',
        success: function(users) {
            alert("Hyresgäst vald!")
        }
    });
}

function removeInterest(apt_id){
    $.ajax({headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
    url : host+"/interesting-apartments/" + apt_id,
    type : "DELETE",
    contentType : "application/json"
        
    })
}

function editBio() {
    $("#wrapper").html($(editbioscript).html());
    
    $('#first_name').val(JSON.parse(sessionStorage.getItem('auth')).user.first_name)
    $('#last_name').val(JSON.parse(sessionStorage.getItem('auth')).user.last_name)
    $('#occupation').val(JSON.parse(sessionStorage.getItem('auth')).user.occupation)
    $('#bio').val(JSON.parse(sessionStorage.getItem('auth')).user.bio)
}

function submitBio() {

    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
        url: host + '/edit-bio',
        type: 'PUT',
        data: JSON.stringify({id: JSON.parse(sessionStorage.getItem('auth')).user.id, bio: $('#bio').val(), occupation: $('#occupation').val(), first_name: $('#first_name').val(), last_name: $('#last_name').val()}),
        contentType: "application/json",
        success: function(user) {
            var newtokenanduser = {token: JSON.parse(sessionStorage.getItem('auth')).token, user: user}
            sessionStorage.setItem('auth', JSON.stringify(newtokenanduser))
            alert("Din profil har ändrats!")
            $(document).ready(function(){
                $(document).trigger("mypagesroute");
            });
        } ,
        error: function() {
            alert("error")
        }
    })
}
   
function loadMyPages() {
    $("#wrapper").html($("#view-mypages").html());
    auth = JSON.parse(window.sessionStorage.getItem('auth'));
}

function editBio() {
    $("#wrapper").html($(editbioscript).html());
    
    $('#first_name').val(JSON.parse(sessionStorage.getItem('auth')).user.first_name)
    $('#last_name').val(JSON.parse(sessionStorage.getItem('auth')).user.last_name)
    $('#occupation').val(JSON.parse(sessionStorage.getItem('auth')).user.occupation)
    $('#bio').val(JSON.parse(sessionStorage.getItem('auth')).user.bio)
}

function submitBio() {

        $.ajax({
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
            url: host + '/edit-bio',
            type: 'PUT',
            data: JSON.stringify({id: JSON.parse(sessionStorage.getItem('auth')).user.id, bio: $('#bio').val(), occupation: $('#occupation').val(), first_name: $('#first_name').val(), last_name: $('#last_name').val()}),
            contentType: "application/json",
            success: function(user) {
                var newtokenanduser = {token: JSON.parse(sessionStorage.getItem('auth')).token, user: user}
                sessionStorage.setItem('auth', JSON.stringify(newtokenanduser))
                alert("Din profil har ändrats!")
                $(document).ready(function(){
                    $(document).trigger("mypagesroute");
                });
            } ,
            error: function() {
                alert("error")
            }
        });
}
   
function loadMyPages() {
    $("#wrapper").html($("#view-mypages").html());
    auth = JSON.parse(window.sessionStorage.getItem('auth'));
}

function editAdvert(apt_id){
    $(document).on("click", '#edit-ad-button', function(e){
        e.preventDefault()
        $("#edit-advert-modal").modal()
        var ad_id = $(this).data('id')
        
        document.getElementById("edit-images-div").innerHTML = '<button class="btn btn-primary btn-block" id="edit-images" type="button" style="background: rgb(19,31,40);margin-top: 17px;" data-id=" '+ ad_id +' ">Ändra bilderna för annonsen</button>'
        
        document.getElementById('editAddress').value = $(this).data('address')
        document.getElementById('editCity').value = $(this).data('city')
        document.getElementById('editState').value = $(this).data('state')
        document.getElementById('editZip').value = $(this).data('zip_code')
        document.getElementById('editStartDate').value = $(this).data('start_date')
        document.getElementById('editEndDate').value = $(this).data('end_date')
        document.getElementById('editRooms').value = $(this).data('rooms')
        document.getElementById('editArea').value = $(this).data('area')
        document.getElementById('editRent').value = $(this).data('rent')
        document.getElementById('editAdvertDescription').value = $(this).data('description')

        document.getElementById("edit-advert-form").onsubmit=function(e) {
        //apartments/ad.id and ads/apartment.id needs ID for related apartments and ads to be equal
            $.ajax({
                url: host + '/apartments/' + ad_id,
                type: 'PUT',
                dataType: "json", 
                contentType: "application/json",
                headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
                data: JSON.stringify({address: $('#editAddress').val(), city: $('#editCity').val(), 
                    state: $('#editState').val(), zip_code: $('#editZip').val(),
                    rooms: $('#editRooms').val(), area: $('#editArea').val()
                }),
                success: function(edited_apartment){
                    $.ajax({
                        url: host + '/ads/' + edited_apartment.id,
                        type: 'PUT',
                        dataType: "json", 
                        contentType: "application/json",
                        //headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
                        data: JSON.stringify({description: $('#editAdvertDescription').val(), rent: $('#editRent').val(), 
                        start_date: $('#editStartDate').val(), end_date: $('#editEndDate').val(),
                        }),
                        success: function(){
                        }
                    })
                }
            })
        }
    })
}
function loadMyHousing(user) {
    if (user.current_apartment_id) {
        $.ajax({
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
            url: host + '/apartments/' + user.current_apartment_id.toString(),
            type: 'GET',
            contentType: 'application/json',
            success: function(apartment) {
                $("#my-address").append(apartment.address)
                $("#my-city").append(apartment.city+', '+apartment.state)
                $("#my-apartment-size").append(apartment.rooms+' rum • '+apartment.area+' m2')
                //$("#my-rent").append('Hyra: '+apartment.rent+' kr/månad')
                $("#my-housing-title").append('<a class="btn btn-primary btn-lg" onclick=rateLandlord() role="button">Betygsätt Hyresvärd</a>')
            }

        }) 
    } else {
        $('#my-city').append("I nuläget hyr du inte någon bostad.")
    }

}

$(document).on("click", '#edit-ad-button', function(e){
    e.preventDefault()
    $("#edit-advert-modal").modal()
    var ad_id = $(this).data('id')
    
    document.getElementById("edit-images-div").innerHTML = '<button class="btn btn-primary btn-block" id="edit-images" type="button" style="background: rgb(19,31,40);margin-top: 17px;" data-id=" '+ ad_id +' ">Ändra bilderna för annonsen</button>'
    
    document.getElementById('editAddress').value = $(this).data('address')
    document.getElementById('editCity').value = $(this).data('city')
    document.getElementById('editState').value = $(this).data('state')
    document.getElementById('editZip').value = $(this).data('zip_code')
    document.getElementById('editStartDate').value = $(this).data('start_date')
    document.getElementById('editEndDate').value = $(this).data('end_date')
    document.getElementById('editRooms').value = $(this).data('rooms')
    document.getElementById('editArea').value = $(this).data('area')
    document.getElementById('editRent').value = $(this).data('rent')
    document.getElementById('editAdvertDescription').value = $(this).data('description')

    document.getElementById("edit-advert-form").onsubmit=function(e) {
    //apartments/ad.id and ads/apartment.id needs ID for related apartments and ads to be equal
        $.ajax({
            url: host + '/apartments/' + ad_id,
            type: 'PUT',
            dataType: "json", 
            contentType: "application/json",
            headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
            data: JSON.stringify({address: $('#editAddress').val(), city: $('#editCity').val(), 
                state: $('#editState').val(), zip_code: $('#editZip').val(),
                rooms: $('#editRooms').val(), area: $('#editArea').val()
            }),
            success: function(edited_apartment){
                $.ajax({
                    url: host + '/ads/' + edited_apartment.id,
                    type: 'PUT',
                    dataType: "json", 
                    contentType: "application/json",
                    //headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
                    data: JSON.stringify({description: $('#editAdvertDescription').val(), rent: $('#editRent').val(), 
                    start_date: $('#editStartDate').val(), end_date: $('#editEndDate').val(),
                    }),
                    success: function(){
                    }
                })
            }
        })
    }
})

$(document).on("click", '#edit-images', function(e){
    var img_id = $(this).data('id')
    $("#edit-image-modal").modal('show')
    $("#edit-advert-modal").modal('hide')

    $(document).on("click", '#editImageNext', function(e){
        deleteImages(img_id)
        document.getElementById('editImageForm').action = '/upload-img/'+ Number(img_id)
        document.getElementById('editImageForm').method = 'POST'
        document.getElementById('editImageForm').submit()
        $("#edit-image-modal").modal('hide')
        $("#edit-advert-modal").modal('show')
    })
})

function deleteImages(img_id) { 
    $.ajax({
        url: host + '/upload-img/' + Number(img_id),
        type: 'DELETE',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        success: function() {
        }
    })
}

// $(document).on("click", '#delete-ad-button', function(e){
//     e.preventDefault()
//     var ad_id = $(this).data('ad_id')
//     var apt_id = $(this).data('apt_id')

//     deleteImages(apt_id)

//     $.ajax({headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
//     url : host+"/ads/" + ad_id,
//     type : "DELETE",
//     contentType : "application/json"
        
//     })

//     $.ajax({headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
//     url : host+"/apartments/" + apt_id,
//     type : "DELETE",
//     contentType : "application/json"
        
//     })
// })


   
$(document).ready(function(){
    
    $(document).on("mypagesroute", function(event) {
        auth = JSON.parse(window.sessionStorage.getItem('auth'));    
        current_user = auth.user;
        loadMyHousing(current_user)
        
        $.ajax({
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
            url: host + "/users"+"/"+current_user.id.toString()+"/ads",
            type: 'GET',
            contentType: "application/json",
            success: function(result) {
                if (result.length == 0){
                    document.getElementById("mypage_container").innerHTML += "Lägg till en bostad genom att gå in på 'SKAPA ANNONS'"; 
                } else {
                    result.forEach(ad => {
                        add_apt_card(ad)
                    })
                }                                                     
            }
        })

        $.ajax({
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
            url: host + "/interesting-apartments",
            type: 'GET',
            contentType: "application/json",
            success: function(result) {

                if (result.length != 0){
                    result.forEach(add_interests_card)
                }
                                                                
            }
        })

        $.ajax({
            url: host + "/users"+"/"+current_user.id.toString(),
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
            type: 'GET',
            contentType: "application/json",
            success: function(user) {

                
                add_user_info(user)
                                                                
            }
        })
    })
})
