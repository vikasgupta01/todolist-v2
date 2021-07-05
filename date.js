// module.exports is a JS object, and objects have properties and methods associated with them, 
// so that means instead of binding tee entire object to just one function (like : "module.exports = getDate;"), we can bind multiple functions with it's properties
// we're not executing the function by adding parentheses because we want app.js to do that as per it's convenience. 
module.exports.getDate = function () {
  const today = new Date();

  const options = {
      weekday: "long",
      day: "numeric",
      month: "long"
  };

  return today.toLocaleDateString("en-US", options);
}


// now our exports object now has two functions tied to it. (getDate and getDay)
// console.log(module.exports);

module.exports.getDay = function () {
  const today = new Date();

  const options = {
      weekday: "long"
  };

  return today.toLocaleDateString("en-US", options);
}
