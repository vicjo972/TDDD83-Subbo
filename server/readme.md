# Server

## Routes

* **'/'**: för att komma åt startsidan

* **'/users'**, methods=['GET', 'POST']: för att hämta och lägga till användare

* **'/ads', methods=['GET', 'POST']**: för att hämta och lägga till annonser

* **'/apartments', methods=['GET', 'POST']**: för att hämta och lägga till lägenheter

* **'/reviews', methods=['GET', 'POST']**: för att hämta och lägga till omdömen

* **'/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE']**: för att hämta, ändra eller ta bort en specifikt användare

* **'/apartments/<int:apartment_id>', methods=['GET', 'PUT', 'DELETE']**: för att hämta, ändra eller ta bort en specifik lägenhet

* **'/ads/<int:ad_id>', methods=['GET', 'PUT', 'DELETE']**: för att hämta, ändra eller ta bort en specifik annons

* **'/reviews/<int:review_id>', methods=['GET', 'PUT', 'DELETE']**: för att hämta, lägga till eller ta bort ett specifikt omdöme

* **'/users/<int:user_id>/apartments', methods=['GET']**: för att hämta alla lägenheter som ägs av en viss användare

* **'/users/<int:user_id>/reviews', methods=['GET']**: för att hämta alla omdömen som finns på en specifik användare