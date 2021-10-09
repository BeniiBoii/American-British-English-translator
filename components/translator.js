const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

//this reverses the translation from british to american
//ie: key values swap places in an object.
const reverseDict = (obj) => {
    return Object.assign(
      {}, ...Object.entries(obj).map(([k, v]) => ({ [v]: k }))
    );
  };

class Translator {
//takes in american spelling time and titles and translates to british.
    toBritishEnglish(text) {
        const dict = { ...americanOnly, ...americanToBritishSpelling };
        const titles = americanToBritishTitles;
        const timeRegex = /([1-9]|1[012]):[0-5][0-9]/g;
        const translated = this.translate(
          text,
          dict,
          titles,
          timeRegex,
          "toBritish"
        );
        if (!translated) {
          return text;
        }
        return translated;
      }
    //reverse of the above, declared reverseDict above..
    toAmericanEnglish(text) {
        const dict = { ...britishOnly, ...reverseDict(americanToBritishSpelling) };
        const titles = reverseDict(americanToBritishTitles);
        const timeRegex = /([1-9]|1[012]).[0-5][0-9]/g;
        const translated = this.translate(
          text,
          dict,
          titles,
          timeRegex,
          "toAmerican"
        );
        if (!translated) {
          return text;
        }
        return translated;
      }

      translate(text, dict, titles, timeRegex, locale) {
        const lowerText = text.toLowerCase();
        const matchesMap = {};
//search title and add to matchmap object..
        Object.entries(titles).map(([k, v]) => {
            if (lowerText.includes(k)) {
              matchesMap[k] = v.charAt(0).toUpperCase() + v.slice(1);
            }
          });
//filter words with spaces..
        const wordsWithSpace = Object.fromEntries(
        Object.entries(dict).filter(([k, v]) => k.includes(" "))
          );
//search for spaced word matches and add to match map..        
        Object.entries(wordsWithSpace).map(([k, v]) => {
            if (lowerText.includes(k)) {
              matchesMap[k] = v;
            }
          });
//search individual words and add to matchmap.. regex will match woeds in dict..         
        lowerText.match(/(\w+([-'])(\w+)?['-]?(\w+))|\w+/g).forEach((word) => {
            if (dict[word]) matchesMap[word] = dict[word];
          });    
//search time matches and add to match map..   
        const matchedTimes = lowerText.match(timeRegex);

          if (matchedTimes) {
            matchedTimes.map((e) => {
              if (locale === "toBritish") {
                return (matchesMap[e] = e.replace(":", "."));
              }
              return (matchesMap[e] = e.replace(".", ":"));
            });
          } 
    // No matches
    if (Object.keys(matchesMap).length === 0) return null;
    // Return logic
    console.log("matchesMap :>> ", matchesMap);
    const translation = this.replaceAll(text, matchesMap);

    const translationWithHighlight = this.replaceAllWithHighlight(
      text,
      matchesMap
    );
    return [translation, translationWithHighlight];
  }

    replaceAll(text, matchesMap) {
    // matchesMap :>>  { favorite: 'favourite' }
    // text :>>  Mangoes are my favorite fruit.
    const re = new RegExp(Object.keys(matchesMap).join("|"), "gi");
    return text.replace(re, (matched) => matchesMap[matched.toLowerCase()]);
  }
  replaceAllWithHighlight(text, matchesMap) {
    const re = new RegExp(Object.keys(matchesMap).join("|"), "gi");
    return text.replace(re, (matched) => {
      return `<span class="highlight">${
        matchesMap[matched.toLowerCase()]
      }</span>`;
    });
  }
}


module.exports = Translator;
