Dette repoet inneholder kamerakoden for Glitch or Die. For resten, se https://github.com/bekk/bekkwagnersizer/tree/feature/glitch-game

# Hvordan bruke Glitch or Die

## Koble sammen alt:

### Koble til camera-laptop
- webkamera via grå usbdongle
- lyskontroll (arduino) via grå usbdongle
- strøm
- kensingtonlås

### Koble til render-maskin
- HDMI til TV/projektor via HDMI. Bruk hvit mac-dongle
- strøm
- kensingtonlås

### Koble til elektronikk-brett
- skal holde å sette fordeler i stikkontakt
- Koble elektronittbrettet til stikkontakten

# Starte laptop'er

## På begge maskiner
Logg inn på maskinene
- bruker: ladmin
- passord: pushwagner

Disable sleep på begge maskiner
- start insomniax
- klikk på måneikon øverst til høyre
- skru på "disable idle sleep"

Logg på trådløst nettverk
- SSID: Softcity
- Passord: pushwagner

## På Camera-laptop:

### Starte lysserver
Åpne terminal (evt stå i terminal og trykk command-t hvis terminal alt er startet)
````
cd
cd bekkwagnersizer/serverstuff
node lysserver.js
````

### Starte bildebehandling
Åpne terminal (evt stå i terminal og trykk command-t hvis terminal alt er startet)
````
cd
cd bekkwagnersizer-camera
npm start
````

### Starte Chrome
Hvis chrome ikke åpner seg automatisk, start chrome og gå til http://localhosst:3006

### Kalibrere kamera
Logitech Gaming Software
- Start Logitech Gaming Software
- Velg kamera nederst
- Klikk på kamera i stort bilde
- Velg video settings
- Sjekk at white Balance -> auto er fjernet
- Advanced -> Advanced setting
- Sjekk at auto er fjernet fra Gain. Gain-slider skal stå helt til venstre.
- Advanced -> Webcam control
- Sjekk at auto er fjernet fra focus. Fouss-slider kal stå helt til venstre.
- Juster brightness, contrast, white balance og evt gain til plate er relativt
  ensfarget sort mens de tre fargene på kalibreringsarket skiller seg fra hverandre.

Gå tilbake til Chrome
- Fjern alt som ligger på sort plate. Pass på at det ikke er skygger på platen
- Trykk 'set initial'
- se at rød ring i baseline video frame overlapper sort ring.
  Hvis ikke kan dette endres fra terminal med

  `nano bekkwagnersizer-camera/src/config.js`

  og endre videoCircle x, y og diameter, men det er litt vanskelig.

Kalibrere farger.
- Legg på kalibreringsark.
- Trykk calibrate colors.
- Sjekk at farger detekteres ok.
- Ta bort ark.

Starte
- Trykk Run forever.

Hvis noe ikke funker
- trykk stop!
- Legg på kalibreringsark, evt juster på kamerainnstillinger
- trykk på calibrate colors. Ssjekk at det går bra
- trykk run forever.

Debugging:
- i Chrome, klikk på bakgrunn, velg inspect, velg console.

## På Render-laptop

### Starte miraserver

Åpne terminal (evt stå i terminal og trykk command-t hvis terminal alt er startet)
````
cd
cd bekkwagnersizer/serverstuff
node server
````

### Starte spillserveren
Åpne terminal (evt stå i terminal og trykk command-t hvis terminal alt er startet)
````
cd
cd bekkwagnersizer/webglstuff
npm start
````

### Vise spill
- start chrome
- gå til localhost:8081
- trykk grønn knapp for å gå i fullscreen

### Musikk
Spilleliste på spotify, spille ved siden av. Ligger på Holger Ludvigsens konto:
https://open.spotify.com/user/pufft/playlist/1zppLiEv8zjZ7jo6NsIfsL?si=NonAglNFRA2-ZbKHBnNPww

# NEDRIGG:
Koble fra nettspenning før du kobler ned resten!
