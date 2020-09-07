const form = document.getElementById('form');
const output = document.getElementById('output');

const getResult = (regex, aInput, output) => {
  let match = regex.exec(aInput);  
  if (match) {
    aInput = aInput.replace(regex, output(match))
  }
  return aInput;
}

const getPutsToConsoleLog = (aInput) => {
  const regex = /^(\s*)puts (.*)$/g;
  return getResult(regex, aInput, (match) => `${match[1]}console.log(${match[2]})`);
}
const getClassToTypeOf = (aInput) => {
  const regex = /(\s*)(\S*|".*"\S*|'.*'\S*)\.class\s*/g;
  return getResult(regex, aInput, (match) => `${match[1]}typeof(${match[2]})`);
}
const getToInt = (aInput) => {
  const regex = /(\s*)(".*"|'.*'|\d*|\d+\.\d+)\.to_i\s*/g;
  return getResult(regex, aInput, (match) => `${match[1]}parseInt(${match[2]}, 10)`);
}
const getToS = (aInput) => {
  const regex = /(\s*)(".*"|'.*'|\S*)\.to_s\s*/g;
  return getResult(regex, aInput, (match) => `${match[1]}(${match[2]}).toString()`);
}


form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('input').value;
  output.innerHTML = "";
  const lines = input.split("\n");
  lines.forEach((input) => {
    input = getClassToTypeOf(input);
    input = getToInt(input);
    input = getToS(input);
    input = getPutsToConsoleLog(input);
    output.insertAdjacentHTML('beforeend', `<p>${input}</p>`);
  });
});
