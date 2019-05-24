var tester = "u.c. 1.FC a string with a lot of words";
tester = tester.replace(/\W+/g," ");
console.log(tester);

function getMeRepeatedWordsDetails(sentence) {
    //at least a space at the end of sentence otherwise the \W in regex2 doesn't match the last word: sentence = sentence + " "
    sentence = sentence.replace(/\W+/g," ") + " ";
    console.log(sentence)
    var regex = /[^\s]{3,}/g;
    console.log(tester.match(regex).join("|"));
    var regex2 = new RegExp("(" + tester.match(regex).join("|") + ")", "g");
    console.log(regex2);
    matches = sentence.match(regex2);
    console.log(matches);
    console.log()
    return matches;
}

console.log(getMeRepeatedWordsDetails("1.FC another string with some words"));
