const axios = require("axios");

// in memory request
const SEND_REQUEST_LIST = require("../utils/mail");

/** HELPER FUNCTIONs */
/**
 * Check if the user's age is below 10
 * @param {String} birthdate
 * @returns {boolean} isAgeOK
 */
function isRightAge(birthdate) {
  const bdateObj = new Date(birthdate);
  const diff = new Date() - bdateObj;
  const age = diff / 31556952000;
  return age < 10;
}

/**
 * Get the userProfile of the user
 * @param {string} username
 * @returns {object|null} userProfile
 */
async function isRegistered(username) {
  // check in users api
  return axios(process.env.API_KEY_USERS).then((response) => {
    const { data } = response;

    let userResult = data.find((user) => {
      return user.username === username;
    });

    // if not found in users api return null
    if (!userResult) {
      return null;
    }

    // check in userProfiles api
    let userProfile = axios(process.env.API_KEY_USER_PROFILE).then(
      (response) => {
        const { data } = response;
        let userProfileResult = data.find((user) => {
          return user.userUid === userResult.uid;
        });
        return userProfileResult;
      }
    );

    return userProfile ? userProfile : null;
  });
}

/**
 * Display error page with message
 * @param {object} response
 * @param {string} message
 */
function displayErrorPage(response, message) {
  response.render("error", { message });
}

/**
 * Send controller
 * Process request from user
 */
async function send(request, response) {
  const userProfile = await isRegistered(request.body.userid);
  if (!userProfile) {
    // if user is not found, display error page
    displayErrorPage(response, "The user was not found.");
  } else {
    const isAgeOK = await isRightAge(userProfile.birthdate);
    if (!isAgeOK) {
      // if age is above 10, display error page
      displayErrorPage(
        response,
        "Age is inapproriate. Only 10 years old below is allowed."
      );
    } else {
      // if user is found and age is OK,
      // process the request and display confirmation page
      SEND_REQUEST_LIST.push({
        username: request.body.userid,
        address: userProfile.address,
        message: request.body.wish,
      });

      response.render("confirmation");
    }
  }
}

module.exports = { send };
