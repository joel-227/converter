const form = document.getElementById('form');
const output = document.getElementById('output');

const variableList = [];
const functionParamList = [];
const blockList = [];

const getResult = (regex, aInput, output) => {
  let match = regex.exec(aInput);
  if (match) {
    aInput = aInput.replace(regex, output(match))
  }
  return aInput;
}

const getPutsToConsoleLog = (aInput) => {
  const regex = /^puts (.*)$/g;
  return getResult(regex, aInput, (match) => `${match[1]}console.log(${match[2]})`);
}

const getAllToEvery = (aInput) => {
  const regex = /^(\s*)(.*).all\?$/g;
  return getResult(regex, aInput, (match) => `${match[2]}.every()`);
}
const getIncludeToIndexOf = (aInput) => {
  const regex = /^(\s*)(.*).include\?\((.*)\)$/g;
  return getResult(regex, aInput, (match) => `${match[2]}.indexOf(${match[3]}) != -1`);
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

const getCorrectConvention = (matchTwo) => {
  const underscoreRegex = /_/g;
  let lowerCaseResetCounter = true;
  while (underscoreMatch = underscoreRegex.exec(matchTwo)) {
    if (lowerCaseResetCounter) {
      matchTwo = matchTwo.toLowerCase();
      lowerCaseResetCounter = false;
    }
    underscoreIndex = underscoreMatch.index;
    // matchTwo = matchTwo.replace(matchTwo[underscoreIndex + 1], matchTwo[underscoreIndex + 1].toUpperCase());
    let charArray = matchTwo.split("");
    charArray[underscoreIndex + 1] = charArray[underscoreIndex + 1].toUpperCase();
    matchTwo = charArray.join("");
    matchTwo = matchTwo.replace("_", "");
  }
  if (lowerCaseResetCounter === false) {
    return matchTwo;
  } else {
    return matchTwo.toLowerCase();
  }
}

const getVariableDefinition = (aInput) => {
  const regex = /(\s*)(\w+)\s*(=)\s*(.+)/g;
  let match = regex.exec(aInput);
  if (match && !variableList.includes(match[2]) && !functionParamList.includes(match[2])) {
    console.log(variableList);
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
    aInput = aInput.replace(match[0], `${match[1]}[${match[1]}.length - ${match[2]}]`);
  }
  return aInput;
}

const getSubString = (aInput) => {
  // change variable_name[1...5] to variable_name.substring(1, 5)
  const regexOne = /(\w+)\[\s*(\d+)\s*\.\.\.\s*(\d*)\s*\]/g;
  while (match = regexOne.exec(aInput)) {
    if (parseInt(match[3], 10) > parseInt(match[2], 10)) {
      let result = match[3].match(/\d+/g);
      if (result) {
        aInput = aInput.replace(match[0], `${match[1]}.substring(${match[2]}, ${match[3]})`);
      } else {
        aInput = aInput.replace(match[0], `${match[1]}.substring(${match[2]})`);
      }
    } else {
      aInput = aInput.replace(match[0], `${match[1]}.substring(${match[2]}, ${match[2]})`);
    }
  }
  const regexTwo = /(\w+)\[\s*(\d+)\s*\.\.\s*(\d*)\s*\]/g;
  while (match = regexTwo.exec(aInput)) {
    if (parseInt(match[3], 10) >= parseInt(match[2], 10)) {
      let result = match[3].match(/\d+/g);
      if (result) {
        aInput = aInput.replace(match[0], `${match[1]}.substring(${match[2]}, ${parseInt(match[3], 10) + 1})`);
      } else {
        aInput = aInput.replace(match[0], `${match[1]}.substring(${match[2]})`);
      }
    } else {
      aInput = aInput.replace(match[0], `${match[1]}.substring(${match[2]}, ${match[2]})`);
    }
  }
  return aInput;
}

const getToUpperCase = (aInput) => {
  // converts variable_name.upcase   to   variable_name.toUpperCase()
  const regex = /(\s*)(\S*|".*"\S*|'.*'\S*)\.upcase\s*/g;
  return getResult(regex, aInput, (match) => `${match[1]}${match[2]}.toUpperCase()`);
}

const getToLowerCase = (aInput) => {
  // converts variable_name.upcase   to   variable_name.toUpperCase()
  const regex = /(\s*)(\S*|".*"\S*|'.*'\S*)\.downcase\s*/g;
  return getResult(regex, aInput, (match) => `${match[1]}${match[2]}.toLowerCase()`);
}

const getInterpolation = (aInput) => {
  const regex = /#{([^}]*)}/g;
  while (match = regex.exec(aInput)) {
    aInput = aInput.replace(match[0], "${" + match[1] + "}");
    aInput = aInput.replace(/"/g, "`");
  }
  return aInput;
}

const getPush = (aInput) => {
  const regex = /(\s*)(\w+)\s*<<\s+(.+)/g;
  return getResult(regex, aInput, (match) => `${match[1]}${match[2]}.push(${match[3]})`);
}

const getSplice = (aInput) => {
  const regex = /(\s*)(\w+)\.delete_at\(\s*(\d+)\s*\)/g;
  return getResult(regex, aInput, (match) => `${match[1]}${match[2]}.splice(${match[3]}, 1)`);
}

const getForEach = (aInput) => {
  const regex = /(\s*)(\w+).each do \|(\w+)\|/g;
  while (match = regex.exec(aInput)) {
    functionParamList.push(match[3]);
    blockList.push("{(")
    aInput = aInput.replace(regex, `${match[1]}${match[2]}.forEach((${match[3]}) => {`)
  }
  return aInput;
}

const getEndToBracket = (aInput) => {
  const regex = /(\s*)end/g;
  while (match = regex.exec(aInput)) {
    if (blockList[blockList.length - 1] == "{(") {
      aInput = aInput.replace(regex, `${match[1]}})`);
    } else {
      aInput = aInput.replace(regex, `${match[1]}}`);
    }
    blockList.pop();
  }
  return aInput
}

const getIf = (aInput) => {
  const regex = /(\s*)\b(if )(.+)/g;
  if (match = regex.exec(aInput)) {
    blockList.push("{")
    aInput = aInput.replace(regex, `${match[1]}${match[2]}(${match[3]}) {`);
  }
  return aInput;
}

const getElse = (aInput) => {
  const regex = /(\s*)(else)(\s*)/g;
  if (match = regex.exec(aInput)) {
    aInput = aInput.replace(regex, `${match[1]}} ${match[2]} {`)
  }
  return aInput;
}

const getElseIf = (aInput) => {
  const regex = /(\s*)(elsif )(.+)/g;
  if (match = regex.exec(aInput)) {
    aInput = aInput.replace(regex, `${match[1]}} else if (${match[3]}) {`);
  }
  return aInput;
}

const getConditional = (aInput) => {
  const regex = /(\s*)(==)(\s*)/g;
  if (match = regex.exec(aInput)) {
    aInput = aInput.replace(regex, `${match[1]}===${match[3]}`);
  }
  return aInput;
}

const getNilToUndefined = (aInput) => {
  const regex = /\b(nil)\b/g;
  if (match = regex.exec(aInput)) {
    aInput = aInput.replace(regex, `undefined`)
  }
  return aInput;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('input').value;
  output.innerHTML = "";
  const lines = input.split("\n");
  lines.forEach((input) => {
    input = getClassToTypeOf(input);
    input = getToUpperCase(input);
    input = getToLowerCase(input);
    input = getPush(input);
    input = getSplice(input);
    input = getInterpolation(input);
    input = getToInt(input);
    input = getToS(input);
    input = getLastElement(input);
    input = getSubString(input);
    input = getVariable(input);
    input = getVariableDefinition(input);
    input = getPutsToConsoleLog(input);
    input = getAllToEvery(input);
    input = getIncludeToIndexOf(input);
    input = getEndToBracket(input);
    input = getForEach(input);
    input = getIf(input);
    input = getElse(input);
    input = getElseIf(input);
    input = getConditional(input);
    input = getNilToUndefined(input);
    output.insertAdjacentHTML('beforeend', `<p>${input}</p>`);
  });
  variableList.length = 0;
});
