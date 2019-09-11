'use strict';

var fs = require('fs');
var bib, ch, lastch, lineno, fileptr, error;
var EndOfFile = '\0';
var invalidCodeFile = [],
    defconcepts = [],
    deffigures = [],
    defnotes = [],
    useconcepts = [],
    usefigures = [],
    usenotes = [],
    conceptValues = [],
    defusenotes = [],
    errors = 0,
    AEissues = [],
    ISEissues = [];

var aeexceptions = ["AECL", "Michael", "Anaesthetics", "Praescriptiones", "Israel", "aerospace", "Wedelstaedt", "Naeini", "Saeed", "disease", "diseased", "diseases", "subpoenaed", "Aestiva", "Aespire"];

// apprise, chastise, comprise, compromise, despise, disguise, excise, improvise, incise, prise(open), promise, surprise, analyse, advertise, advise, arise, compromise, disguise, despise, enterprise, exercise, merchandise, revise, supervise

var iseexceptions = "advertise|\
advise|\
arise|\
arises|\
Blaise|\
compromise|\
compromising|\
concise|\
Demise|\
Denise|\
denisemelanson|\
devised|\
Disease|Diseases|disease|diseased|diseases|\
disengaged|\
Disentangling|\
Eisenberg|\
exercise|\
exercises|\
Geisel|\
immunocompromised|\
Kaiser|\
Likewise|\
likewise|\
Lise|\
Lisette|\
millisecond|\
miserable|\
noise|\
otherwise|\
praise|\
praised|\
precise|\
precisely|\
premise|\
Promise|\
promise|\
promised|\
promises|\
Promising|\
promising|\
raise|\
raised|\
raises|\
raising|\
revised|\
Revised|\
rise|\
risen|\
rises|\
Rising|\
rising|\
surprise|\
surprised|\
surprises|\
surprising|\
Surprisingly|\
surprisingly|\
supervising|\
wise|\
wisely|\
".split("|"); // PS sthetised is the suffix of an\ae sthetised!

function anExceptionWord(a) {
    for (var i = 0; i < iseexceptions.length; i++)
        if (a == iseexceptions[i]) {
            return true;
        }
    return false;
}

function process(file, p) {
    bib = fs.readFileSync(file, 'utf8');
    p(file);
}

// read the main file dbd-book.tex to find out the file order
process('dbd-book.tex', getFileOrder);

var texfiles, files;

function getFileOrder(f) {
    texfiles = bib.match(/\\input.*\n/g);
    if (texfiles == null) console.log("No input files in " + f);
    else {
        for (var i = 0; i < texfiles.length; i++)
            texfiles[i] = texfiles[i].replace(/\\input /, "").replace(/\n/, "");
        texfiles[0] = "dbd-book.tex";
    }
}

function saveFile(fileName, buffer) {
    fs.open(fileName, 'w', function (err, fd) {
        if (err) {
            if (err.code === 'EEXIST') {
                console.error(fileName + " can't be over-written");
                return;
            }
            console.log("Some error trying to write " + fileName);
            throw err;
        }
        fs.write(fd, buffer);
    });
}

{
    var txtfiles = [];
    for (var i = 0; i < texfiles.length; i++)
        if (texfiles[i].match(/.*\.txt/)) {
            txtfiles.push(texfiles[i]);
            texfiles.splice(i--, 1);
        }

    var s = "";
    for (var i = 0; i < texfiles.length; i++)
        s = s + texfiles[i] + " ";
    console.log("File order:\n" + s + "\n");
    saveFile("fileOrder.txt", s);


    txtfiles.sort();
    console.log("NB: " + txtfiles.length + " .txt files not scanned (because they are generated from scanned text in .tex files)");
    for (var i = 0; i < txtfiles.length; i++)
        console.log("   " + txtfiles[i]);
    console.log("\n");
}

files = texfiles; // list of files to scan 

var imageTypes = ["photo", "graph", "schematic", "screenshot", "table"];
var imageNames = ["photograph", "plot", "schematic", "screenshot", "table"];
var totalimageCounter = [0, 0, 0, 0, 0];
var totalColourimageCounter = [0, 0, 0, 0, 0];
var totalimages = 0,
    totalColourimages = 0,
    totalFigures = 0;

function sayall(s) {
    var t = "";
    var wrap = 0;
    if (s == null) return;
    for (var i = 0; i < s.length; i++) {
        t += s[i].name;
        wrap = wrap + s[i].name.length + 2;
        if (wrap > 60 && i < s.length - 1) {
            t += "\n";
            wrap = 0;
        } else t += "  ";
    }
    console.log(t);
}

function compareLabels(a, b) { // [filename,name]
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    // names must be equal
    return 0;
}

for (i = 0; i < files.length; i++)
    if (files[i] != "") process(files[i], processTEX);

var filename = "";

function consolelog(s) {
    var pad = "",
        slen = 51 - filename.length;
    while (slen-- > 0) pad = pad + " ";
    if (filename != "") filename = filename + pad;
    console.log(filename + " - " + s);
    filename = "";
}

function parse(names, pattern) {
    var nrefs = bib.match(pattern);
    if (nrefs != null)
        for (var i = 0; i < nrefs.length; i++) {
            var name = nrefs[i].replace(/.*{/, "").replace(/}.*/, "");
            if (name == "") console.log("ERROR " + filename + " has null " + pattern);
            else names.push({
                filename: filename,
                name: name,
                value: null
            });
        }
}

function processTEX(f) {
    // in tex files, look for three types of label:
    // concepts \mylabel{label}{name of concept} and \myref{label}
    // figures  \labelFigure{label} and \where{label} or \basicwhere{label}
    // notes    \noteLabel{the label}{the note} or \bignoteLabel{the label}{the note} and \noteref{label}

    filename = f; // only said once by consolelog
    //console.log("- Process " + f);

    parse(defconcepts, /\\mylabel{[^}]*}/g);
    parse(useconcepts, /\\myref(text)?{[^}]*}/g);
    parse(deffigures, /\\labelFigure{[^}]*}/g);
    parse(usefigures, /\\(where|basicwhere){[^}]*}/g);
    parse(defnotes, /\\(noteLabel|bignoteLabel){[^}]*}/g);
    parse(usenotes, /\\noteref{[^}]*}/g);

    // get concept labels and values, to later give a table of definitions
    var s = bib.match(/\\mylabel{([^}]*)}{([^}]*)}/g);
    if (s != null)
        for (var i = 0; i < s.length; i++) {
            var t = s[i].match(/\\mylabel{([^}]*)}{([^}]*)}/);
            conceptValues.push({
                name: t[1],
                value: t[2],
                used: 0
            });
        }

    // collect all definitions and uses of notes, to later check all uses follow definitions
    // defusenotes = [use, name, file]
    s = bib.match(/\\(noteLabel|bignoteLabel|noteref){[^}]*}/g)
    if (s != null)
        for (var i = 0; i < s.length; i++) {
            var t = s[i].match(/\\(noteLabel|bignoteLabel|noteref){([^}]*)}/);
            //console.log("> 0=" + t[1] + "?=" + (t[1] == "noteref") + " 1=" + t[2]);
            defusenotes.push({
                define: t[1] != "noteref",
                use: t[1] == "noteref",
                name: t[2],
                filename: filename
            });
        }

    // does the file have any dodgy characters?
    for (var i = 0; i < bib.length; i++) {
        var c = bib.charCodeAt(i);
        if (c == 9 || c == 10) continue;
        if (c < 32 || c > 126 || c == "’") {
            consolelog("\n**  Invalid character code " + c);
            invalidCodeFile.push(f);
            var s = "";
            // show context...
            for (var j = -20; j <= 20; j++) {
                c = bib.charAt(i + j - 20);
                if (c == "\n") {
                    console.log(s);
                    s = "";
                } else {
                    if (c == "\t") c = " ";
                    s = s + (j == 0 ? "🔴" : c);
                }
            }
            consolelog(s);
        }
    }

    // does the file have any repeated words "the the" etc?
    s = bib.match(/[^a-z]([a-z]+)( )+\1[^a-z]+/ig);
    if (s != null)
        for (var i = 1; i < s.length; i++) {
            //if (s[i - 1] == s[i])
            console.log("**** " + filename + ", repeated words: " + s[i]);
        }

    // does the file have any ae that should have been \ae?
    s = bib.match(/[a-z]+ae[a-z]+/ig);
    //s = bib.match(/[a-z]*ae[a-z]*/ig);
    if (s != null)
        for (var i = 0; i < s.length; i++) {
            var bad = true;
            for (var j = 0; j < aeexceptions.length; j++)
                if (aeexceptions[j] == s[i]) {
                    bad = false;
                    break;
                }
                //if (bad) console.log("si=|" + s[i] + "|");

            if (bad)
                AEissues.push({
                    file: filename,
                    word: s[i]
                });
        }

    // does the file have any ISE/IZE spelling issues? (-ise, -ising, -isation that should have been -ize etc?
    // |[a-zA-Z]+isation)|([a-zA-Z]+ising)[^a-zA-Z]
    s = bib.match(/[a-zA-Z]+ise[a-z]*|[a-z]+isation[a-z]*|[a-z]+ising[a-z]*/ig);
    if (s != null) {
        for (var i = 0; i < s.length; i++) {
            if (!anExceptionWord(s[i])) {
                ISEissues.push({
                    file: filename,
                    word: s[i]
                });
            }
        }
    }

    // check that \begin{figure} \caption \labelFigure{x} occur only in that order
    s = bib.match(/begin.figure|caption{|labelFigure{([^}]*)}/g);
    if (s != null) {
        var state = 0,
            laststate = 0;
        for (var i = 0; i < s.length; i++) {
            if (s[i].match(/begin.figure/) != null) state = 1;
            if (s[i].match(/caption/) != null) state = 2;
            if (s[i].match(/labelFigure/) != null) state = 3;
            if (state == 3 && laststate == 1)
                console.log("*** \\labelFigure used before caption error: " + s[i]);
            laststate = state;
        }
    }

    // count how many figures in each file
    totalFigures += (bib.match(new RegExp("begin{figure", 'gi')) || []).length;

    var chapterimageCounter = [0, 0, 0, 0, 0];
    var chapterColourimageCounter = [0, 0, 0, 0, 0];
    for (var i = 0; i < imageTypes.length; i++) {
        chapterimageCounter[i] = (bib.match(new RegExp("% *" + imageTypes[i], 'gi')) || []).length;
        chapterColourimageCounter[i] = (bib.match(new RegExp("% *" + imageTypes[i] + " *colour", 'gi')) || []).length;
        totalimageCounter[i] += chapterimageCounter[i];
        totalColourimageCounter[i] += chapterColourimageCounter[i];
    }
    var summary = "",
        gap = "";
    for (var i = 0; i < imageTypes.length; i++)
        if (chapterimageCounter[i] > 0) {
            summary += gap + chapterimageCounter[i] + " " + imageNames[i] + (chapterimageCounter[i] > 1 ? "s" : "");
            if (chapterColourimageCounter[i] > 0)
                summary += " (" + chapterColourimageCounter[i] + " colour)";
            gap = ", ";
            totalimages += chapterimageCounter[i];
            totalColourimages += chapterColourimageCounter[i];
        }
    if (summary.length > 0) consolelog("   " + summary + ".");
    else consolelog("   No figures or tables.");
}

// sort out used but not defined, defined but not used, multiply defined errors, and list defined names
function check(t, defs, uses) {
    defs.sort(compareLabels);
    uses.sort(compareLabels);
    for (var i = 0; i < defs.length; i++) {
        var f = false;
        for (var j = 0; j < uses.length; j++)
            if (defs[i].name == uses[j].name) {
                f = true;
                break;
            }
        if (f) {
            if (t == "Concept") {
                var indictionary = false;
                for (var j = 0; j < conceptValues.length; j++)
                    if (conceptValues[j].name == defs[i].name) {
                        conceptValues[j].defined = 1;
                        indictionary = true;
                        break;
                    }
            }
        } else
            console.log("  OK " + t + " " + defs[i].name + " never used, defined in " + defs[i].filename);
    }
    for (var i = 0; i < uses.length; i++) {
        var f = false;
        for (var j = 0; j < defs.length; j++)
            if (defs[j].name == uses[i].name) {
                f = true;
                break;
            }
        if (!f) {
            errors++;
            console.log("*BAD* " + t + " " + uses[i].name + " never defined, used in " + uses[i].filename);
        }
    }
    for (var i = 0; i < defs.length; i++) {
        var f = 0,
            deffiles = [];
        for (var j = 0; j < defs.length; j++)
            if (defs[i].name == defs[j].name) {
                f++;
                deffiles.push(defs[i].filename);
                break;
            }
        if (f > 1) {
            errors++;
            console.log("*BAD* " + t + " " + defs[i].name + " multiply defined in " + deffiles);
        }
    }
    console.log("\n" + t + " labels:");
    sayall(defs);
    console.log("\n");
}

console.log("");
check("Concept", defconcepts, useconcepts);
check("Figure", deffigures, usefigures);
check("Note", defnotes, usenotes);

function conceptValuescompare(a, b) // {filename,name,defined}
{
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    // names must be equal
    return 0;
}

function spaces(n) {
    var s = "";
    for (var i = 0; i < n; i++) s = s + " ";
    return s;
}

//for (var i = 0; i < conceptValues.length; i++)
//   console.log("---:  " + conceptValues[i].name + " = " + conceptValues[i].value);

conceptValues.sort(conceptValuescompare);

var maxlength = 0;
for (i = 0; i < conceptValues.length; i++)
    if (conceptValues[i].name.length > maxlength) maxlength = conceptValues[i].name.length;
console.log("Concepts (starred items are not used):");
for (i = 0; i < conceptValues.length; i++)
    console.log(spaces(maxlength - conceptValues[i].name.length) + conceptValues[i].name + " = " + (conceptValues[i].defined ? " " : "*") + " " + conceptValues[i].value + " " + (conceptValues[i].defined ? " " : "*"));

// check all all note uses follow note definitions
// defusenotes = {define:t[1] != "noteref",use:t[1] == "noteref", name:t[2], file:filename}
console.log(""); {
    var maxlength = 0;
    for (var i = 0; i < defusenotes.length; i++) {
        var ok = false;
        if (defusenotes[i].use) { // its a use
            for (var j = 0; j < i; j++)
                if (defusenotes[j].define && defusenotes[j].name == defusenotes[i].name) {
                    ok = true;
                    break;
                }
        }
        if (!ok)
            if (defusenotes[i].name.length > maxlength) maxlength = defusenotes[i].name.length;
    }
}

for (var i = 0; i < defusenotes.length; i++) {
    var ok = false;
    if (defusenotes[i].use) { // it's a use
        for (var j = 0; j < i; j++) {
            if (defusenotes[j].define && defusenotes[j].name == defusenotes[i].name) {
                ok = true;
                break;
            }
        }
        if (!ok) {
            errors++;
            var adefiner;
            for (var j = 0; j < defusenotes.length; j++)
                if (defusenotes[j].define && defusenotes[j].name == defusenotes[i].name) {
                    adefiner = defusenotes[j].filename;
                    break;
                }
            console.log(spaces(maxlength - defusenotes[i].name.length) + defusenotes[i].name + " used before defined. Used in " + defusenotes[i].filename);
            console.log(spaces(maxlength + 22) + "Defined in: " + adefiner);
        }
    }
}

var expectations = [{
        file: "ch-death-rates/death-rates.tex",
        expect: 2,
        word: "organisation",
        ise: true
    },
    {
        file: "ch-aviation/aviation.tex",
        expect: 1,
        word: "realised",
        ise: true
    },
    {
        file: "ch-ideas/testing.tex",
        expect: 1,
        word: "Formalising",
        ise: true
    },
    {
        file: "ch-dogs-dancing/dogs-dancing.tex",
        expect: 1,
        word: "paediatric",
        ise: false
    },
    {
        file: "ch-error/error.tex",
        expect: 1,
        word: "Caesar",
        ise: false
    },
    {
        file: "ch-bug-blocking/bug-blocking.tex",
        expect: 1,
        word: "Anaesthesiology",
        ise: false
    },
    {
        file: "ch-cybersecurity/cybersecurity.tex",
        expect: 1,
        word: "Anaesthetic",
        ise: false
            }];

// save putting in a constant entry for all of the above...
for (var i = 0; i < expectations.length; i++)
    expectations[i].count = 0;

function carefulword(iseae, word, file) {
    var report = true;
    for (var k = 0; k < expectations.length; k++)
        if (expectations[k].ise == (iseae == "ise") && word == expectations[k].word && expectations[k].file == file) {
            if (++expectations[k].count <= expectations[k].expect)
                report = false;
        }
    if (report)
        console.log("        ", word);
}

console.log("Potential spelling issues? AE and ISE issues? -- Note: some issues may be in original quotes/article titles/urls/etc or \\index @ entries, urls");

var lastfile = "";
for (var files = 0; files < texfiles.length; files++) {
    for (var i = 0; i < ISEissues.length; i++)
        if (ISEissues[i].file == texfiles[files]) {
            if (lastfile != ISEissues[i].file) {
                console.log("   " + ISEissues[i].file);
                for (var j = 0; j < expectations.length; j++)
                    if (expectations[j].ise && expectations[j].file == ISEissues[i].file) {
                        console.log("   -- expect " + expectations[j].expect + " x " + expectations[j].word);
                    }
            }
            carefulword("ise", ISEissues[i].word, ISEissues[i].file);
            lastfile = ISEissues[i].file;
        }
    lastfile = "";
    for (var i = 0; i < AEissues.length; i++)
        if (AEissues[i].file == texfiles[files]) {
            if (lastfile != AEissues[i].file) {
                console.log("   " + AEissues[i].file);
                for (var j = 0; j < expectations.length; j++)
                    if (!expectations[j].ise && expectations[j].file == AEissues[i].file) {
                        console.log("   -- expect " + expectations[j].expect + " x " + expectations[j].word);
                    }
            }
            carefulword("ae", AEissues[i].word, AEissues[i].file);
            lastfile = AEissues[i].file;
        }
}

// maybe some of the expected words didn't appear?
var initialnewline = "\n";
for (var j = 0; j < expectations.length; j++) {
    if (expectations[j].count < expectations[j].expect) {
        console.log(initialnewline + "** missing? " + (expectations[j].expect - expectations[j].count) + " x " + expectations[j].word + " in " + expectations[j].file);
        initialnewline = "";
    }
}

console.log("\nTotal images " + totalimages + " (" + totalColourimages + " colour)");
var summary = "",
    gap = "",
    doubleCheck = 0;
for (var i = 0; i < imageTypes.length; i++)
    if (totalimageCounter[i] > 0) {
        doubleCheck += totalimageCounter[i];
        summary += gap + totalimageCounter[i] + " " + imageNames[i] + (totalimageCounter[i] > 1 ? "s" : "");
        if (totalColourimageCounter[i] > 0)
            summary += " (" + totalColourimageCounter[i] + " colour)";
        gap = "\n   -  ";
    }
if (summary.length > 0) console.log("   -  " + summary + ".");
else consolelog("   No figures or tables.");
console.log("Double check = " + doubleCheck + " versus " + totalFigures + " figures");

console.log("");
if (errors) console.log(errors + " cross reference error" + (errors > 1 ? "s" : ""));
else console.log("No noticed cross reference errors");

if (invalidCodeFile.length > 0) {
    var s = "",
        sep = "";
    for (var i = 0; i < invalidCodeFile.length; i++) {
        s += sep + invalidCodeFile[i];
        sep = " ";
    }
    console.log("Invalid characters found in: " + s);
}