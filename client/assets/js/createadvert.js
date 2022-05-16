//Not used anymore, functionallity is now located in payment.js

//   //Creates new apartment after createadvert-form is filled in and createadvert_btn is pushed
// $(document).on("click", '#createadvert_btn', function(e) {
//   e.preventDefault();
//     //Creats apartment
//   $.ajax({
//     url: host + '/apartments',
//     type: 'POST',
//     dataType: "json", 
//     contentType: "application/json",
//     headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
//     data: JSON.stringify({address: $('#inputAddress').val(), city: $('#inputCity').val(), 
//         state: $('#inputState').val(), zip_code: $('#inputZip').val(),
//         rooms: $('#inputRooms').val(), area: $('#inputArea').val()
//     }),
//     success: function(new_apartment){
//       //Creates advert
//       $.ajax({
//         url: host + '/ads',
//         type: 'POST',
//         dataType: "json", 
//         contentType: "application/json",
//         headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
//         data: JSON.stringify({description: $('#inputAdvertDescription').val(), rent: $('#inputRent').val(), 
//         start_date: $('#inputStartDate').val(), end_date: $('#inputEndDate').val(), apartment_id: new_apartment.id,
//         }),
//         success: function(){
//           alert("Lägenheten har lagts till och en annons har skapats")            
//         }
//       })

//     }
//   })
// }) 



