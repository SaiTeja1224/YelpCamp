let divs = document.querySelectorAll(".card-img-overlay");
let checkboxes = document.querySelectorAll("input[type = 'checkbox']");

if (divs.length > 0) {
  const divsArray = Array.from(divs);
  const checkboxesArray = Array.from(checkboxes);

  divsArray.forEach(function (div) {
    div.addEventListener("click", function (e) {
      e.stopPropagation();
      let divClassList = div.className.split(" ");
      let checkedCheckboxes = checkboxesArray.filter((checkbox) => {
        if (divClassList.indexOf(checkbox.id) !== -1) {
          return true;
        }
      });
      checkedCheckboxes[0].checked = !checkedCheckboxes[0].checked;
    });
  });
}
