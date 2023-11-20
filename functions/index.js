/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
**/

const {onCall} = require("firebase-functions/v2/https");
const fetch = require('isomorphic-fetch');
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const pubsub = functions.pubsub;

admin.initializeApp();
function UserMatrice(id, url, img, host, login, displayName) {
  this.id = id;
  this.url = url;
  this.img = img;
  this.host = host;
  this.login = login;
  this.displayName = displayName;
}

// Constructeur pour Poste
function Poste(user, viable, occupe, zone, ranger, poste) {
  this.user = user;
  this.viable = viable;
  this.occupe = occupe;
  this.zone = zone;
  this.ranger = ranger;
  this.poste = poste;
}

// Constructeur pour Ranger
function Ranger(ranger, postes) {
  this.ranger = ranger;
  this.postes = postes;
}

// Constructeur pour Zone
function Zone(zone, rangers) {
  this.zone = zone;
  this.rangers = rangers;
}

// Constructeur pour Matrice
function Matrice(users) {
  this.zones = [];

  // Configuration des zones, rangers et postes selon vos règles
  const zoneConfigs = [
    { rangees: 12, postesPerRangee: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] },
    { rangees: 12, postesPerRangee: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 7, 7] },
    { rangees: 13, postesPerRangee: [4, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3] },
    { rangees: 13, postesPerRangee: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6] },
  ];

  // Initialisation des zones, rangers et postes
  this.zones = zoneConfigs.map((config, zIdx) => {
    const rangers = Array.from({ length: config.rangees }, (_, rIdx) => {
      const postes = Array.from({ length: config.postesPerRangee[rIdx] }, (_, pIdx) => new Poste(undefined, true, false, zIdx + 1, rIdx + 1, pIdx + 1));
      return new Ranger(rIdx + 1, postes);
    });
    return new Zone(zIdx + 1, rangers);
  });

  // Allocation des utilisateurs aux postes
  this.allocateUsers(users);
}

Matrice.prototype.allocateUsers = function (users) {
  users.forEach((user) => {
    const match = user.host.match(/z(\d+)r(\d+)p(\d+)/);
    if (!match) {
      console.error(`Invalid host format: ${user.host}`);
      return;
    }
    const [, z, r, p] = match.map(Number);

    // Vérification et allocation de l'utilisateur à un poste
    if (this.zones[z - 1] && this.zones[z - 1].rangers[r - 1] && this.zones[z - 1].rangers[r - 1].postes[p - 1]) {
      const targetPoste = this.zones[z - 1].rangers[r - 1].postes[p - 1];

      if (targetPoste.viable) {
        targetPoste.user = user;
        targetPoste.occupe = true;
      } else {
        console.error(`Trying to allocate user to a non-viable poste: ${user.host}`);
      }
    } else {
      console.error(`Invalid position: ${user.host}`);
    }
  });
};

exports.refreshMatrice = onCall(async (request)  => {
    try {
      let finalResponseData;
      const { client_id } = request.data;
      const { client_secret } = request.data;

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', client_id);
      params.append('client_secret', client_secret);

          // Recuperation token permetant de faire des requette pour le user.
          const rep = await fetch('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
          });

          let temp = await rep.json();

        const { access_token } = temp;

        let allData = [];
        let pageNumber = 1;

        do {
            const response = await fetch(`https://api.intra.42.fr/v2/campus/9/locations?access_token=${access_token}&page[size]=100&page[number]=${pageNumber}&sort=-end_at`);
            if (response.ok) {
                const data = await response.json();
                allData.push(...data);
            } else {
                console.error("Error: ", response.status);
            }
            pageNumber++;
          } while (allData.length < 300);


        const filteredData = allData.filter(item => item.end_at === null);
        const finalFilteredData = filteredData.filter(item => item.primary === true);

        finalResponseData = finalFilteredData.map(item => ({
          id: item.id,
          login: item.user.login,
          url: item.user.url,
          img: item.user.image.link,
          host: item.host,
          displayName: item.user.displayname,
        }));

      } catch (error) {
        throw new functions.https.HttpsError("internal ", "Failed to get Students Connected ", error);
      }

        const db = admin.firestore();

        const matrice = new Matrice(finalResponseData);

        // Sérialiser la matrice en JSON pour le stockage
        const matriceData = JSON.stringify(matrice);

        // Ajouter le timestamp actuel
        const lastFetchTime = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

        // Stocker dans Firestore
        await db.collection('matrice').doc('matriceData').set({ matriceData, lastFetchTime }, { merge: false });

        console.log('Data written successfully to Firestore!');
      } catch (error) {
          console.error('Error:', error);
      }

    return null;
});



exports.getLogtime = onCall(async (request) => {
  try {
    const { client_id } = request.data;
    const { client_secret } = request.data;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);
    // Recuperation token permetant de faire des requette pour le user.
    const rep = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString()
        });
        let temp = await rep.json();
        const { access_token } = temp;
        const { id } = request.data;
        const queryParams1 = new URLSearchParams({
          access_token: access_token,
          "page[size]": "100",
          "page[number]": "1",
        });
        const queryParams2 = new URLSearchParams({
          access_token: access_token,
          "page[size]": "100",
          "page[number]": "2",
        });
        const [dataResponse1, dataResponse2] = await Promise.all([
          fetch(`https://api.intra.42.fr/v2/users/${id}/locations?${queryParams1.toString()}`),
          fetch(`https://api.intra.42.fr/v2/users/${id}/locations?${queryParams2.toString()}`)
        ]);
    const [responseData1, responseData2] = await Promise.all([
      dataResponse1.json(),
      dataResponse2.json()
    ]);
    const mergedResponseData = [...responseData1, ...responseData2];

    const finalResponseData = mergedResponseData.map(item => ({
      begin_at: item.begin_at,
      end_at: item.end_at
    }));
    return finalResponseData;
  } catch (error) {
    throw new functions.https.HttpsError("internal ", "Failed to get user Logtimes ", error);
  }
});


exports.getData = onCall(async (request)  => {
try {
        const { code  } = request.data;
        const { client_id } = request.data;
        const { client_secret } = request.data;

        // mise en place du header (coter backend)
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', client_id);
        params.append('client_secret', client_secret);
        params.append('code', code);
        params.append('redirect_uri', 'https://student-hub.fr/login');
        // params.append('state', 'bsfdvjdshfdshfgsdkhgfisudghfiusdvfbuyvhuyfviufbvidusbviidsvb_for_42_student_app');
        // Recuperation token permetant de faire des requette pour le user.
        const response = await fetch('https://api.intra.42.fr/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString()
        });
        const temp = await response.json();
        const { access_token } = temp;
        const dataResponse = await fetch(`https://api.intra.42.fr/v2/me?access_token=${access_token}`);
        // retour de l'objet response

        return await dataResponse.json();
      } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get User from API42, ' + error.message );
      }
});
