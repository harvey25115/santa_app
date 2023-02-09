const nodemailer = require("nodemailer");

// request list
const SEND_REQUEST_LIST = [];
// batch processing flag
let isBatchDone = true;

// create transporter with pooled connections
const transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PW,
  },
});

// send mail on interval
setInterval(() => {
  console.log("No. of request as of the moment", SEND_REQUEST_LIST.length);
  callBatch();
}, process.env.INTERVAL);

/**
 * Check if the current batch is still running
 * if not, run mail batch
 */
function callBatch() {
  if (isBatchDone) {
    runMailBatch();
  } else {
    console.log("Previous batch is still running. Will run on next interval.");
  }
}

/**
 * Process all the request when nodemailer connection is available
 * and the request list is not empty
 * @param {array} currentRequestList
 */
function runMailBatch() {
  if (!transporter.isIdle()) {
    console.log("Skipped sending request to santa. No connection available.");
  } else if (!SEND_REQUEST_LIST.length) {
    // if list is empty -> skip
    console.log("Skipped sending request to santa. Empty request list.");
  } else {
    // set the flag to false, batch is running
    isBatchDone = false;
    let currentListCount = SEND_REQUEST_LIST.length;
    let newPendingRequestList = [];
    let processList = [];

    while (SEND_REQUEST_LIST.length > 0 && transporter.isIdle()) {
      const request = SEND_REQUEST_LIST.shift();
      // email content
      const mail = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: "Wish to Santa from " + request.username,
        text:
          request.message +
          "\n\n" +
          "Sent by: " +
          request.username +
          "\n" +
          request.address,
        html:
          request.message +
          "<br>" +
          "<br>" +
          "Sent by: " +
          request.username +
          "<br>" +
          request.address,
      };

      let promise = new Promise((resolve, reject) => {
        transporter.sendMail(mail, (error, success) => {
          if (error || success.rejected.length > 0) {
            newPendingRequestList.push(request);
          }
          resolve();
        });
      });

      processList.push(promise);
      console.log(
        "processing",
        SEND_REQUEST_LIST.length + 1,
        "out of",
        currentListCount
      );
    }

    // set the batch flag to true when all current processes is done
    // and add the pending request to the current list
    Promise.allSettled(processList).then(() => {
      isBatchDone = true;
      SEND_REQUEST_LIST.push(...newPendingRequestList);
    });
  }
}

// export in memory request
module.exports = SEND_REQUEST_LIST;
