# TDDD83-Subbo
Grupp-projekt från våren 2021 där vi utvecklade en single page application för att hyra och hyra ut bostäder. Vi hade HTML och Javascript med Jquery i frontend, flask med lite olika tillägg för t.ex. autentisering och databashantering (sqlalchemy), och SQLite som databas.

Jag var övergripande ansvarig för formgivningen på alla sidor.
Här är lite bilder på vyer som jag har byggt, för de flesta funktionerna på dessa vyer har jag också byggt motsvarande routes i flask-servern. Bland annat byggde jag 
vyn för bostäder där användare kan filtrera annonser utifrån lite olika alternativ. Eftersom hemsidan är en single page application
servade vi inte statiska html-filer från servern, så vi kunde inte ha routing genom flask-routes. Jag tyckte det var viktigt att ha routing i klienten så jag 
implementerade ett litet javascript-bibliotek för det. 

Det här projektet var min första introduktion till webbprogrammering. Det jag tar med mig var främst hur man manipulerar HTML med Javascript, 
hur man bygger och använder REST-api, och hur man kan skriva modeller för sql-databaser och hur man skriver queries. Lärorikt och långt ifrån perfekt, 
jag tror att

![Startsidan](https://user-images.githubusercontent.com/79589708/168683367-61867850-8f42-4221-b0a1-1b33d997535d.png)
![Bostäder](https://user-images.githubusercontent.com/79589708/168683387-63d50b70-2141-4263-b408-b41f23a4e5bd.png)
![Annons-sidan](https://user-images.githubusercontent.com/79589708/168683487-e9ff746d-fccb-4ca2-bea9-85e104d8f30a.png)
![Mina sidor, min bostad och intresseanmälningar](https://user-images.githubusercontent.com/79589708/168683534-9aa25732-cacf-41c7-879b-9f0cd696f158.png)
![Bli medlem](https://user-images.githubusercontent.com/79589708/168683604-5f1d4d15-a437-4f7a-b76f-77da78227675.png)
