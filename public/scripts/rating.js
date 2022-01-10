const noRateRadioButton = document.querySelector(".input-no-rate");
const noRateButton = document.querySelector(".no-rate-check");
const fieldset = document.querySelector(".starability-basic");
if (noRateButton) {
  noRateButton.disabled = true;
  fieldset.addEventListener("click", function (e) {
    e.stopPropagation();
    if (noRateRadioButton.checked === true) {
      noRateButton.disabled = true;
    } else {
      noRateButton.disabled = false;
    }
  });
}
