$(document).ready(function () {
	$(document).on("startchat", function (event) {
		var socket = io.connect('http://localhost:5000/chat');
		var imsender = false;
		var currentRoom = 0
		user = JSON.parse(window.sessionStorage.getItem('auth')).user;
		socket.emit('join', { 'username': user.first_name + " " + user.last_name, 'room': currentRoom })

		socket.on('connect', function () {
			console.log("socket lyssnar")
		});

		socket.on('message', function (msg) {
			time = new Date().toLocaleString('sv-SE');
			console.log(time);
			if (imsender) {
				$("#chat").append('<div class="outgoing_msg"><div class="sent_msg"><p>' + msg + '</p><span class="time_date">' + time + '</span> </div></div>');
			} else {
				$("#chat").append('<div class="incoming_msg"><div class="received_msg"><div class="received_withd_msg"><p>' + msg + '</p><span class="time_date">' + time + '</span></div></div></div>');
			}
			imsender = false;
			console.log('Received message');
			$('#chat').scrollTop($('#chat')[0].scrollHeight);
		});

		socket.on('receivenewchat', function (id, firstname, lastname){
			if (user.id == id){
				$("#inbox_chat").append('<div class="chat_list" id="contact"><div class="chat_people"><div class="chat_ib"><h5>' + firstname + ' ' + lastname + '<span></span></div></div></div>');					
			}
		});

		$(document).on("click", '#sendbutton', function (e) {
			e.preventDefault()
			if ($('#myMessage').val() != '') {
				msg = $('#myMessage').val()
				imsender = true;
				socket.send({ 'message': msg, 'room': currentRoom });
				console.log('Medelande skickat:' + $('#myMessage').val());
				$('#myMessage').val('');
			}
		});

		$(document).on("click", '#startchat', function (e) {
			e.preventDefault()
			var contactinput = $('#contactinput').val()
			var split = contactinput.split(" ")
			firstname = split[0]
			lastname = split[1]
			console.log(firstname + lastname)
			$.ajax({
				url: host + "/users",
				headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
				type: 'GET',
				success: function (users) {
					var i;
					for (i = 0; i < users.length; i++) {
						if (users[i].first_name == firstname && users[i].last_name == lastname) {
							var user1 = user.id
							var user2 = users[i].id
							socket.emit('leave', { 'username': user.first_name + ' ' + user.last_name, 'room': currentRoom })
							currentRoom = pairing(user1, user2)
							imsender = true;
							socket.emit('join', { 'username': user.first_name + ' ' + user.last_name, 'room': currentRoom })
							socket.emit('newchat', user2, user.first_name, user.last_name)
							$('#chat').html('')
							$(document.getElementsByClassName("chat_list active_chat")[0]).attr('class', 'chat_list');
							$("#inbox_chat").append('<div class="chat_list active_chat" id="contact"><div class="chat_people"><div class="chat_ib"><h5>' + firstname + ' ' + lastname + '<span></span></div></div></div>');
							$('#contactinput').val('')
							$('#modal').modal('hide');
							$('#contactinput').attr("placeholder", "Fyll i vem du vill chatta med")
							return
						}
					}
					$('#contactinput').attr("placeholder", "Personen finns ej, testa igen!")
					$('#contactinput').val('');
					console.log("användaren finns ej")
				}
			});
		});

		function pairing(x, y) {
			if (x > y) {
				var ref = x;
				x = y;
				y = ref;
			}
			return (0.5 * (x + y) * (x + y + 1)) + y;
		}

		$('#myMessage').keypress(function (e) {
			var code = e.keyCode || e.which;
			if (code == 13) {
				if ($('#myMessage').val() != '') {
					msg = $('#myMessage').val()
					imsender = true;
					socket.send({ 'message': msg, 'room': currentRoom });
					$('#myMessage').val('');
				}
			}
		});

		$(document).on("click", '#contact', function (e) {
			e.preventDefault()
			var contact = $(this).text().replace(/(^\s+|\s+$)/g, "")
			$('#chat').html('')
			$(this).attr('class', 'chat_list active_chat');
			$(this).siblings().attr('class', 'chat_list');
			console.log("du valde en kontakt")

			var split = contact.split(" ")
			firstname = split[0]
			lastname = split[1]

			if (firstname == "Subbos") {
				socket.emit('leave', { 'username': user.first_name + ' ' + user.last_name, 'room': currentRoom })
				currentRoom = 0
				socket.emit('join', { 'username': user.first_name + ' ' + user.last_name, 'room': currentRoom })
			} else {
				$.ajax({
					url: host + "/users",
					headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
					type: 'GET',
					success: function (users) {
						var i;
						for (i = 0; i < users.length; i++) {
							if (users[i].first_name == firstname && users[i].last_name == lastname) {
								var user1 = user.id
								var user2 = users[i].id
								socket.emit('leave', { 'username': user.first_name + ' ' + user.last_name, 'room': currentRoom })
								currentRoom = pairing(user1, user2)
								imsender = true;
								socket.emit('join', { 'username': user.first_name + ' ' + user.last_name, 'room': currentRoom })
							}
						}
					}
				});
			}
		});
	})
});