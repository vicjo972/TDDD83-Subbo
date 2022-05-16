 
 function loadAd(ad_id) {
    $.ajax({
        url: host + '/ads/' + ad_id,
        type: 'GET',

        success: function(ad) {
            var apartment = ad.apartment
            var ownerId = apartment.owner.id
            

            $("#advertrow").append(
                '<div class="col-lg-12 col-md-12 mb-4 mb-lg-0">' +
                    '<div id="advertcard" class="card shadow-sm border-0 rounded">' +
                        '<div class="card-body p-0">' +
                            image_carousel(ad, apartment)+
                            '<div class="p-4">' +
                                '<h4 class="mb-0">'+ apartment?.address +'</h4>' +
                                '<p class="small text-muted">' + apartment?.city + ', ' + apartment?.state + '</p>'+
                                '<p class="small text-muted">'+ apartment?.rooms +' rum • '+ apartment?.area +' m2</p>'+
                                '<p>'+ad.description+'</p>'+
                                '<div class="row">'+
                                            '<div class="column col-lg-6 col-md-5 col-sm-6 col-6">'+interest_button(ad_id,apartment.id)+'</div>'+
                                            '<div class="column col-lg-6 col-md-5 col-sm-6 col-6"><h4 class="mb-0 rent" style="text-align:right;">'+ad.rent+' kr/mån</h4>'+
                                            '<p class="small text-muted" style="text-align:right">' + 'Tillgänglig ' + ad.start_date +' till '+ ad.end_date +'</p></div>'+
                                        '</div>'+
                                
                                '</div></div></div></div>'
            );
            
            
            $.ajax({
                url: host + '/users/' + ownerId.toString() + '/reviews',
                type: 'GET',
                contentType: 'application/json',
                success: function(reviews) {
                    if (reviews.length != 0) {
                        $.each(reviews, function(index, value) {
                            $("#user-reviews-on-ad").append(
                                '<div class="card">' +
                                    '<div class="card-body">' +
                                        '<p class="card-text">' + value.date + '</p>' +
                                        '<p class="card-text"><b>Betyg:</b></p>' +
                                        '<p class="card-text">' + value.rating + '</p>' +
                                        '<p class="card-text"><b>Kommentar:</b></p>' +
                                        '<p class="card-text">' + value.text + '</p>' +
                                    '</div>' +
                                '</div>'
                            )
                        })
                    } else {
                        $("#user-reviews-on-ad").append(
                            '<div class="card">' +
                                '<div class="card-body">' +
                                    '<p class="card-text">Hyresvärden har inga omdömen ännu.</p>' +
                                '</div>' +
                            '</div>'
                        )
                    }
                    
                }    
                
            })   



        document.getElementById("advert_body").innerHTML += add_user_card(ad) 
        //$("#ad-container").append(add_user_card(ad))                                  
        }
    });
}

function add_user_card(ad){
    var auth = sessionStorage.getItem('auth') ?? ""
    var signedIn = auth.length > 0;
    var str = ""
    if (signedIn) {
        str = '<div class="card-deck">';

        $.ajax({
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
            url: host +"/interested-users/"+ad.apartment.id,
            type: "GET",
            async : false,
            success: function(interested_list){
                console.log(interested_list)
                if( interested_list != "Du äger inte den här lägenheten"){
                    for(var i=0; i<interested_list.length; i++){
                        str += generate_html(interested_list[i], ad.apartment.id);
                        //alert(str)
                                }
                    } 
            }
        });
        str += '</div>'
    }
    return str
}

function generate_html(user, apartment_id){
    var html_str ='<div class="card">'
    //tanken är att visa en profilbild på användaren....
    //html_str += '<img class="w-25 card-img-top" src="https://pix10.agoda.net/hotelImages/103/1030438/1030438_15081214210034117680.png" alt="Bild på användaren >'
    html_str += '<div class="card-body">'
    html_str += '<h5 class="card-title">Namn: '+user.first_name +" "+user.last_name +'</h5>'
    html_str += '<p class="card-text">Sysselsättning: '+user.occupation+'</p>'
    html_str += '<p class="card-text">Biografi: '+user.bio+'</p>'
    html_str += '<p class="card-text">Email: '+user.email+'</p>'
    html_str += '<a class="btn btn-secondary" onclick=potentialTenantReviews('+user.id+') role="button" style="margin-bottom:10px;">Se omdömen för denna användare</a><br>'
    html_str += '<a class="btn btn-warning" onclick=selectTenant('+user.id+','+apartment_id+') role="button">Hyr ut bostaden till denna användare</a>'
    html_str += '</div></div>'
    return html_str
}

function image_carousel(ad, apartment){
    var carousel = '<div id="imagecarousel" class="carousel slide" data-ride="carousel" data-interval="false">'+
                            '<ol class="carousel-indicators">'+
                                '<li data-target="#imagecarousel" data-slide-to="0" class="active"></li>'+
                                add_carousel_indicator(ad, apartment) +
                            '</ol>'+
                            '<div class="carousel-inner">'+
                                '<div class="carousel-item active">'+
                                '<figure class="card-img-wrapper">'+
                                '<img class="d-block w-100 card-img-top" src="assets/img_uploads/' + apartment.images[0].image_name +'" alt="First image" >'+
                                '</figure>'+
                                '</div>'+
                                add_images_to_carousel(ad, apartment) +
                            '</div>'+
                            '<a class="carousel-control-prev" href="#imagecarousel" role="button" data-slide="prev">'+
                                '<span class="carousel-control-prev-icon" aria-hidden="true"></span>'+
                                '<span class="sr-only">Previous</span>'+
                            '</a>'+
                            '<a class="carousel-control-next" href="#imagecarousel" role="button" data-slide="next">'+
                                '<span class="carousel-control-next-icon" aria-hidden="true"></span>'+
                                '<span class="sr-only">Next</span>'+
                            '</a>'+
                ' </div>'
    return carousel
}

function add_carousel_indicator(ad, apartment){
    var indicator_carousel = ""

    for (i = 1; i < apartment.images.length; i++){
        indicator_carousel += '<li data-target="#imagecarousel" data-slide-to="'+i+'"></li>'
    }

    return indicator_carousel
}

function add_images_to_carousel(ad, apartment){
    var images_carousel = ""

    for (i = 1; i < apartment.images.length; i++){
        images_carousel += '<div class="carousel-item">'+
                            '<figure class="card-img-wrapper">'+
                            '<img class="d-block w-100 card-img-top" src="assets/img_uploads/' + apartment.images[i].image_name +'" alt="">'+
                            '</figure>'+
                            '</div>'
    }

    return images_carousel
}

function check_interest(apt,id){
    return apt.id == id
}
 
function interest_button(ad_id,apt_id){
    var auth = sessionStorage.getItem('auth') ?? ""
    var signedIn = auth.length > 0;
    var ret =""

    if(signedIn) {
        reg_interest_string = '<a class="btn btn-warning" onclick=registerInterest('+apt_id+','+ad_id+')  role="button">Anmäl ditt intresse!</a>'
        rem_interest_string = '<a class="btn btn-warning" onclick=removeInterest('+apt_id+','+ad_id+')  role="button">Avanmäl ditt intresse!</a>'
    
        $.ajax({
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
            url: host + "/interesting-apartments",
            type: 'GET',
            contentType: "application/json",
            async : false,
            success: function(result) {
                result.forEach(apt => {
                    if (apt.id == apt_id){
                        ret = rem_interest_string
                    }           
                });
                if (ret ==""){
                    ret = reg_interest_string 
                }                                         
            }
        });
    } else {
        ret = '<a class="btn btn-warning disabled role="button">Logga in för intresseanmälan</a>'
    }
   
return ret

}


function removeInterest(apt_id){
    $.ajax({headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
    url : host+"/interesting-apartments/" + apt_id,
    type : "DELETE",
    contentType : "application/json"
    });

}
function registerInterest(ad_id) {
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
        url: host + '/register-interest/' + ad_id,
        type: 'POST',
        contentType: "application/json",

    })
}

$(document).ready(function(){
    $(document).on("advertroute", function(event, ad_id) {
        loadAd(ad_id);
    })
});
