# TDDD83-Subbo
Grupp-projekt från våren 2021 där vi utvecklade en single page application (SPA) för att hyra och hyra ut bostäder. Vi hade HTML och Javascript med Jquery i frontend, flask med lite olika tillägg för t.ex. autentisering och databashantering (sqlalchemy), och SQLite som databas. Med arbetet ville vi ta reda på hur man utvecklade en hemsida
som var tillgänglig för synnedsatta genom att uppfylla WCAG-riktlinjer och se till att sidan fungerade med syntolk. 

Här är lite bilder på vyer som jag har byggt, för de flesta funktionerna på dessa vyer har jag också byggt motsvarande routes i flask-servern och databasmodeller, t.ex. hämta annonser, skapa användare, etc. Bland annat byggde jag vyn för bostäder där användare kan filtrera annonser utifrån lite olika alternativ. Eftersom hemsidan var en single page application
servade vi inte statiska html-filer från servern, så vi kunde inte ha url-routing genom flask. Jag tyckte det var viktigt att ha routing i klienten så jag 
implementerade ett litet javascript-bibliotek (page.js) för det. Jag var även ansvarig för formgivningen på alla sidor.

Det här projektet var min första introduktion till webbprogrammering. Det jag tog med mig var främst hur man manipulerar HTML med Javascript, 
hur man kan bygga och använda ett REST API, och hur man kan skriva modeller och hämta data från sql-databaser. När jag ser tillbaka på det här nu tänker jag att
vi hade kunnat ha lite bättre filstruktur, t.ex. delat upp koden i servern i mindre filer. Att göra en SPA på det här sättet gjorde också att vi fick en lång HTML-fil som inte blev så hanterbar.

![Startsidan](https://user-images.githubusercontent.com/79589708/168683367-61867850-8f42-4221-b0a1-1b33d997535d.png)


![Bostäder](https://user-images.githubusercontent.com/79589708/168683387-63d50b70-2141-4263-b408-b41f23a4e5bd.png)
client/assets/js/housing.js, routes i server/main.py: '/ads', '/adsfilter'


![Annons-sidan](https://user-images.githubusercontent.com/79589708/168683487-e9ff746d-fccb-4ca2-bea9-85e104d8f30a.png)
client/assets/js/advert.js, routes i server/main.py: '/ads/<int:ad_id>'


![Bli medlem](https://user-images.githubusercontent.com/79589708/168683604-5f1d4d15-a437-4f7a-b76f-77da78227675.png)
client/assets/js/registration.js, routes i server/main.py: '/sign-up', '/login'
