const checkString = (string) => {
  return typeof string === "string" && string !== ""
    ? true
    : "Please enter a valid answer.";
};

const checkNum = (number) => {
  return typeof number === "number" && !isNaN(number)
    ? true
    : "Please enter a valid answer.";
};

module.exports = {
  checkString,
  checkNum,
};
