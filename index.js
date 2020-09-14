const form = document.getElementById('form');
const output = document.getElementById('output');

const variableList = [];

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
  const regex = /(\s*)(".*"|'.*'|\w+|\d+\.\d+)\.to_i\s*/g;
  return getResult(regex, aInput, (match) => `${match[1]}parseInt(${match[2]}, 10)`);
}
const getToS = (aInput) => {
  const regex = /(\s*)(".*"|'.*'|\S*)\.to_s\s*/g;
  return getResult(regex, aInput, (match) => `${match[1]}(${match[2]}).toString()`);
}

const getCorrectConvention = (match_two) => {
  const underscoreRegex = /_/g;
  let lowerCaseResetCounter = true;
  while (underscoreMatch = underscoreRegex.exec(match_two)) {
    if (lowerCaseResetCounter) {
      match_two = match_two.toLowerCase();
      lowerCaseResetCounter = false;
    }
    underscoreIndex = underscoreMatch.index;
    match_two = match_two.replace(match_two[underscoreIndex + 1], match_two[underscoreIndex + 1].toUpperCase());
    match_two = match_two.replace("_", "");
  }
  return match_two
}

const getVariableDefinition = (aInput) => {
  const regex = /(\s*)(\w+)\s*(=)\s*(.+)/g;
  let match = regex.exec(aInput);
  if (match && !variableList.includes(match[2])) {
    variableList.push(match[2]);
    variableList.push(getCorrectConvention(match[2]));
    if (match[2].toUpperCase() === match[2]) {
      // the variable is a constant      
      match[2] = getCorrectConvention(match[2]);
      aInput = aInput.replace(regex, `${match[1]}const ${match[2]} = ${match[4]}`);     
    } else {
      match[2] = getCorrectConvention(match[2]);
      aInput = aInput.replace(regex, `${match[1]}let ${match[2]} = ${match[4]}`);
    }
  }
  return aInput;

  // if variable name has underscore, delete it, make next letter uppercase if possible
  
  
  // (done) check if variable name has 52 alp, 10 digits, underscore, NO whitespace, NO dashes (maybe use \w)
  // (done) if variable name has been called before, don't regenerate it
  // (done) if variable name === allCaps, then use const, otherwise let
}

const getVariable = (aInput) => {
  // possible characters:
	// A - Z
	// a - z
	// 0 - 9
	// underscore
	// whitespace(\t, " ", \n, end_of_line)  (yes)
	// brackets({}, (), [], <>) (yes)
	// punctuation(,  .  :  ;  " ' ?  /  |  \) (only dot, colon, semi-colon and ?)
	// operation(+ = -) (yes)
  // other(! @ # $ % ^ & * ` ~)   (only !, @ if in front)
  
  // variableList = ["my_array", "numbers"]

  const regex = /(\w+)/g;
  const words = aInput.match(regex);
  if (words) {
    words.forEach((word) => {
      if (variableList.includes(word)) {
        // word = my_array
        const regexString = "(\\s*)(|[\\(\\)\\{\\}\\[\\]\\<\\>]|[\\.\\:\\;\\?]|[+-=!]|puts[\\s|\\(])(" + word + ")(\\s+|$|[\\(\\)\\{\\}\\[\\]\\<\\>]|[\\.\\:\\;\\?]|[+-=!])";
        const regexTwo = new RegExp(regexString, 'g');
        let match = regexTwo.exec(aInput);
        if (match) {
          correctedWord = getCorrectConvention(match[3]);
          aInput = aInput.replace(match[3], correctedWord)
        }
      }
    });
  }

  return aInput

}

const getLastElement = (aInput) => {
  // change variable_name[-1] to variable_name[variableName.length - 1]
  const regex = /(\w+)\[\s*-\s*(\d+)\s*\]/g;
  while (match = regex.exec(aInput)) {
    aInput = aInput.replace(match[0], `${match[1]}[${match[1]}.length - ${match[2]}]`)
  }
  return aInput
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
    input = getLastElement(input);
    input = getVariable(input);
    input = getVariableDefinition(input);
    input = getPutsToConsoleLog(input);
    output.insertAdjacentHTML('beforeend', `<p>${input}</p>`);
  });
  variableList.length = 0;
});
