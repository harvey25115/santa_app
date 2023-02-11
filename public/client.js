// client-side js
// run by the browser each time your view template is loaded

// define variables that reference elements on our page
const santaForm = document.forms[0];

// listen for the form to be submitted and add a new dream when it is
santaForm.onsubmit = function (event) {
  event.preventDefault();
  let { wish } = this;
  // check the text isn't more than 100chars before submitting
  // already has validator on html side, but just in case added custom validator
  if (wish.value.length > 100) {
    alert("Maximum characters allowed: 100");
  } else {
    this.action = "/santa/send";
    this.submit();
  }
};
