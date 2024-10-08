# Vedonlyöntisovellus

Sovelluksen avulla ylläpitäjä voi luoda vedonlyöntialustan haluamansa sarjan tulosvetokilpailua varten. Sarjoja voi olla useita.

Sovellus pitää kirjaa käyttäjien veikkauksista, pelien lopputuloksista sekä käyttäjien veikkauksistaan saamista pisteistä.


Sovelluksessa peruskäyttäjä voi:

* kirjautua sisään ja ulos sekä luoda uuden tunnuksen.
* valita, minkä sarja tietoja haluaa tarkastella.
* nähdä menneet ja tulevat pelit.
* lisätä veikkauksen tuleville peleille.
* poistaa oman veikkauksensa, kunnes veikkaukset on pisteytetty.
* muokata omaa veikkaustansa tuleville peleille.
* tarkastella kaikkia annettuja veikkauksia.
* tarkastella kaikkien pelien lopputuloksia. 
* tarkastella kaikkien pelien pisteytyksiä.
* tarkastella käyttäjiä sekä kokonaispistetilannetta.
* tarkastella yksittäisten käyttäjien vetoja ja heidän saamiaan pelikohtaisia pisteitä.
* tarkastella yksittäisten pelien vetoja, lopputulosta sekä pisteytystä.


Ylläpitäjä voi lisäksi:

* lisätä sovellukseen sarjoja tulevaisuuteen.
* lisätä sovellukseen veikkauskohteita tulevaisuuteen.
* lisätä menneille peleille lopputulokset ja pisteyttää pelit.
* tietyin ehdoin poistaa sarjoja, pelejä, käyttäjiä, vetoja ja lopputuloksia.
* tietyin ehdoin muokata sarjoja, pelejä, vetoja ja pisteytyksiä.
* tietyin ehdoin hallinnoida käyttäjien ylläpitäjän oikeuksia.

## Sovelluksen osoite

[Gambler App](https://gambler-wjy2.onrender.com)


## Ohjeet sovelluksen käynnistämiseen paikallisesti:

- Lataa sovellus koneellesi GitHubista ja siirry sen juurihakemistoon.

- Asenna riippuvuudet komennolla *npm run install:all*.

- Siirry backend -kansioon ja luo sinne tiedosto .env.

- Lisää .env -tiedostoon satunnaisesti muodostettu salainen avain: *SECRET_KEY=salainen avain*

- Lisää .env -tiedostoon tietokannan osoite: *MONGODB_URI=tietokannan osoite*

- Lisää .env -tiedostoon portti: *PORT=portti*

- Sovelluksessa on käytössä MongoDB -tietokanta. Osa sovelluksen vaatimista tietokantatoiminnoista on toteutettu MongoDB:n sisällä. Lisää tietokannan triggereihin projektin juurihakemiston kansiosta mongodb_triggers löytyvät asetukset ja triggerit. Lisätietoa triggereistä: https://www.mongodb.com/docs/atlas/app-services/triggers/database-triggers/ 

- Siirry juurihakemistoon ja luo uusi versio sovelluksesta komennolla: *npm run build:ui*

- Käynnistä sovellus juurihakemistosta komennolla: *npm run start:prod*

- Sovellus on käynnissä .env -tiedostossa määrittelemässäsi portissa *http://localhost:portti/*

## Ohjeet ylläpitäjän toimintojen testaamiseksi:  

- Kirjaudu sovelluseen sisään seuraavilla tunnuksilla

  - käyttäjätunnus *admin*

  - salasana *admin*

## Ohjeet testaukseen:

- Lisää backendin .env -tiedostoon testitietokannan osoite: *TEST_MONGODB_URI=tietokannan osoite*

- Aja backendin toimintaa testaavat testit backend -hakemistossa komennolla: *npm run test* 

- Voit ajaa samat testit testikattavuusraportin kanssa komennolla: *npm run test:coverage*

- Aja e2e -testit juurihakemistossa komennolla: *npm run test* tai visuaalisesti *npm test -- --ui*

## Dokumentaatio

[Työaikakirjanpito](https://github.com/Kaabero/Gambler/blob/main/dokumentaatio/tuntikirjanpito.md)