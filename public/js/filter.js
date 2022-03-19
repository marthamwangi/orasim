var allCheckboxes = document.querySelectorAll('input[type=checkbox');
var allRealtors = Array.from(document.getElementsByClassName("card-realtor"));
var checked = {};

getChecked('realtorYearExperience')
getChecked('realtorRating')
getChecked('realtorBadge')
Array.prototype.forEach.call(allCheckboxes, function (el) {
  el.addEventListener('change', toggleCheckbox)
})
function getChecked(name) {
  checked[name] = Array.from(document.querySelectorAll('input[name=' + name + ']:checked')).map(function (el) {
    return el.value;
  });
}
function toggleCheckbox(e) {
  console.log(e.target.name)
  getChecked(e.target.name);
  setVisibility()
}



function setVisibility() {
  allRealtors.map(function (el) {
    var realtorYearExperience = checked.realtorYearExperience.length ? _.intersection(Array.from(el.classList), checked.realtorYearExperience).length : true;
    var realtorRating = checked.realtorRating.length ? _.intersection(Array.from(el.classList), checked.realtorRating).length : true;
    var realtorBadge = checked.realtorBadge.length ? _.intersection(Array.from(el.classList), checked.realtorBadge).length : true;

    if (realtorYearExperience && realtorRating && realtorBadge) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  });
}

