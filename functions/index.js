/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall} = require("firebase-functions/v2/https");
const fetch = require('isomorphic-fetch');

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

exports.getLogtimeV2 = onCall(async (request) => {
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
      const { login } = request.data;

    const queryParams1 = new URLSearchParams({
      access_token: access_token,
    });

    const dataResponse = await fetch(`https://api.intra.42.fr/v2/users/${login}/locations_stats?${queryParams1.toString()}`);

    const responseData = await dataResponse.json();

    return responseData;
  } catch (error) {
    throw new functions.https.HttpsError("internal ", "Failed to get user LogtimesV2 ", error);
  }
});


exports.getStudentsConnected = onCall(async (request) => {
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

      const queryParams3 = new URLSearchParams({
        access_token: access_token,
        "page[size]": "100",
        "page[number]": "3",
      });

      const [dataResponse1, dataResponse2, dataResponse3] = await Promise.allSettled([
        fetch(`https://api.intra.42.fr/v2/campus/9/locations?${queryParams1.toString()}`),
        fetch(`https://api.intra.42.fr/v2/campus/9/locations?${queryParams2.toString()}`),
        fetch(`https://api.intra.42.fr/v2/campus/9/locations?${queryParams3.toString()}`)
      ]);

      const mergedResponseData = [];
      [dataResponse1, dataResponse2, dataResponse3].forEach(async (response, index) => {
        if(response.status === "fulfilled" && response.value.ok) {
          const data = await response.value.json();
          mergedResponseData.push(...data);
        } else {
          console.error(`Error with request ${index + 1}: `, response.reason);
        }
      });

      // const finalResponseData = mergedResponseData.map(item => ({
      //   id: item.user.id,
      //   login: item.user.login,
      //   url: item.user.url,
      //   img: item.user.image.link,
      //   host: item.host,
      // }));

      return mergedResponseData;
  } catch (error) {
    throw new functions.https.HttpsError("internal ", "Failed to get Students Connected ", error);
  }
});
