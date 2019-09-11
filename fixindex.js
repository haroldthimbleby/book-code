'use strict';

var fs = require('fs');
var buffer;

var separateAuthorIndex = false; // generate an author index (or merge into single index)
var inote = "|inote"; // do we want authors all to be notes, or normal?

function process(file) {
    buffer = fs.readFileSync(file, 'utf8');
}

process("dbd-book.idx");

var abbreviations =
    "ABMU: Abertawe Bro Morgannwg University Health Board;\
ABS: Anti-lock Braking System;\
ACS: Acute Coronary Syndrome;\
ADC: Automated Dispensing Cabinet;\
ADHD: Attention Deficit Hyperactivity Disorder;\
AI: Artificial Intelligence;\
ANSI: American National Standards Institute;\
BMI: Body Mass Index;\
BRANS: Benefits, Risks, Alternatives, Do nothing, Second opinion;\
BSI: British Standards Institute;\
CDC: Centers for Disease Control;\
CHFG: Clinical Human Factors Group;\
CHI-MED: Computer-Human Interaction for Medical Devices, EPSRC project;\
CPAP: Continuous Positive Airway Pressure Machine;\
CRM: Crew Resource Management;\
CT: Computational Thinking;\
CVE: Common Vulnerabilities and Exposures;\
DOI: Digital Object Identifier;\
DO-178C: Software Considerations in Airborne Systems and Equipment Certification;\
DRM: Digital Rights Management;\
DSL: Domain Specific Language;\
DV: digivigilance;\
EDSAC: Electronic Delay Storage Automatic Calculator;\
EDVAC: Electronic Discrete Variable Automatic Computer;\
ENIAC: Electronic Numerical Integrator And Computer;\
eICU: virtual or Electronic Intensive Care Unit;\
 EPSRC: Engineering and Physical Sciences Research Council;\
 ESA: European Space Agency;\
 DERS: Dose Error Reduction Software;\
 FDA: Federal Drug Administration;\
FPA: Flight Path Angel;\
GDPR: General Data Protection Regulation;\
 GITHIP: Global IT Health Improvement Programme;\
 GOSH: Great Ormond Street Hospital;\
GUDID: Global UDI Database;\
 HCI: Human-Computer Interaction;\
 HF: Human Factors;\
HFE: Human Factors Engineering;\
HL7: Health Level 7;\
 HSE: Health and Safety Executive;\
 HSIB: Healthcare Safety Investigation Branch;\
ICD: International Classification of Diseases;\
ICIJ: International Consortium of Investigative Journalists;\
 IEC: International Electrotechnical Commission;\
INR: International Normalised Ratio;\
 IoT: Internet of Things;\
 ISMP: Institute of Safe Medication Practices;\
 ISO: International Organization for Standardization;\
IU: International Unit;\
IV: intravenous;\
 LASCAD: London Ambulance Service Computer Aided Dispatch system;\
LMIC: Low and Middle Income Countries;\
LVF: Left Ventricular Failure;\
 MAUDE: Manufacturer and User Facility Device Experience;\
MCAS: Maneuvering Characteristics Augmentation System;\
mcg: microgram;\
MDR: Medical Device Regulations;\
 ME: Myalagic Encephalomyelitis;\
MFA: Multi Factor Authentication;\
mg: milligram;\
 MHRA: Medicines and Healthcare Products Regulatory Agency;\
 MISRA: Motor Industry Software Reliability Association;\
MIT: Massachusetts Institute of Technology;\
ML: Machine Learning;\
MOT: car roadworthiness test, UK;\
MRSA: Meticillin-Resistant Staphylococcus Aureus;\
MUMPS: Massachusetts General Hospital Utility Multi-Programming System;\
MVP: Minimal Viable Product;\
 NCAP: New Car Assessment Programme;\
 NCCIC: National Cybersecurity and Communications Integration Center;\
 NCRI: National Cancer Research Institute;\
NHS: National Health Service;\
NICE: National Institute for Health and Care Excellence;\
NMC: Nursing \\& Midwifery Council;\
 NPfIT: National Programme for IT;\
NPSA: National Patient Safety Agency;\
NRLS: National Reporting and Learning System;\
OI: Oxygenation Index;\
 OSHA: Occupational Safety and Health Administration;\
PCA: Patient Controlled Analgesia;\
PV: Pharmacovigilance;\
QI: Quality Improvement;\
QR: Quick Response code;\
 RCA: Root Cause Analysis;\
 RCTs: Randomised Controlled Trials;\
 RFID: Radio-Frequency IDentification tag;\
 SA: Situational Awareness;\
SaMD: Software as a Medical Device;\
SDOH: Social Determinants Of Health;\
SINTEF: Stiftelsen for Industriell og Teknisk Forskning;\
 SNOWMED-CT: Systematized Nomenclature of Medicine --- Clinical Terms;\
SOPs: Standard Operating Procedures;\
 STAMP: Systems-Theoretic Accident Model and Processes;\
SUI: Serious Untoward Incident;\
TCI: Target Controlled Infusion;\
TPP: The Phoenix Partnership;\
 TPS: Toyota Production System;\
 UCD: User Centred Design;\
 UCTA: Unfair Contract Terms Act 1977;\
 UDI: Unique Device Indicator;\
 UN: United Nations;\
 UX: User eXperience;\
VistA: Veterans Information Systems and Technology Architecture;\
WAD: Work As Done;\
WAI: Work As Imagined;\
WEEE: Waste Electrical and Electronic Equipment Directive;\
 WHO: World Health Organization;\
Y2K: Year 2000 problem".split(";");


// I have standard index entries, but some things, like \authors generates different styles
// specials[] sorts this out
// for example \authors{Liam Donaldson}... is the author of a paper, but (thanks to this table) he's indexed as Donaldson, Sir Liam

var specials = [ // rewrite [this, as this]
    ["Jackson, Michael", "Jackson, Michael (professor)"],
    ["Williams, Dave", "Williams, David"],
    ["iPhone", "Apple!iPhone"],
    ["iOS", "Apple!iOS"],
    ["iPad", "Apple!iPad"],
    ["ABMU", "Abertawe Bro Morgannwg University Health Board"],
    ["Continetal", "Continental AG"],
    ["Harrison, Michael", "Harrison, Michael D."],
    ["Just following orders", "Just following orders@``Just following orders''"],
    ["Swiss Cheese", "Swiss Cheese Model"],
    ["Dijkstra, E. W.", "Dijkstra, Edsger Wybe"],
    ["Donaldson, Liam", "Donaldson, Sir Liam"],
    ["iPhone XR", "Apple!iPhone XR"],
    ["Ruksenas, Rimvydas", "Ruksenas, Rimvydas@{Ruk\\v{s}\\.{e}nas}, Rimvydas"]
    ];

var victims = [
    "Adcock, Jack",
    "Amaro, Isabel",
    "Avina, Gaby",
    "Awdish, Rana",
    "Bawa-Garba, Hadiza",
    "Bromiley, Elaine",
    "Cahill, Clare",
    "Dally, Clarence",
    "Faye, Shon",
    "Fine, Nick",
    "Fossbakk, Grete",
    "Garcia, Pablo",
    "Gonz..alez, Olivia Salda..na", // Gonzalez has accents (using Latex backslashes)
    "Gonz..alez, Alveo",
    "Grigg-Booth, Anne",
    "Grubbe, Emil Herman",
    "Halwala, Mettaloka",
    "Harpin, Laura Grace",
    "Hiatt, Kimberly",
    "Jackson, Michael .singer.",
    "James, Alex",
    "Kalanithi, Paul",
    "Levitt, Brooke",
    "Lucca, Jenny",
    "Macdonald, James",
    "Melanson, Denise",
    "Moe, Marie Elisabeth Gaup",
    "Murphey, Charlene",
    "Najeeb, Maisha",
    "Norris, Lisa",
    "Pagel, Mark",
    "Pettitt, Stephen",
    "Pugh, Jade",
    "Sacks, Oliver",
    "Samson, Arsula",
    "Singer, Jack",
    "Sparrow, Lisa",
    "Taylor, Theresa",
    "Thimbleby, Peter",
    "Titcombe, Joshua",
    "Umansky, Eric",
    "Vaught, Radonda Leanne",
    "Walter, Pam",
    "Washington, George",
    "Wolfe, Catherine",
    "Zautner, Kaia"
];

if (0)
    for (var i = 0; i < abbreviations.length; i++)
        console.log(i + ": " + abbreviations[i].trim());

function getAuthors(a) {
    var vec = a.split(/,| and /);
    for (var i = 0; i < vec.length; i++) {
        var v = vec[i].trim();
        v = v.split(" ");
        // put last item first (i.e, the surname), comma, space, then rest of them (ie forenames)
        vec[i] = v[v.length - 1] + ", " + v[0];
        for (var middle = 1; middle < v.length - 1; middle++)
            vec[i] = vec[i] + " " + v[middle];
    }
    return vec;
}

var warning = "% already processed\n";

function fixauthors(pattern) {
    // e.g., \indexentry{Fix-authors Judith M. Laing and Jean V. McHale}{28}
    // OR:   \indexentry{Fix-subject-authors Judith M. Laing and Jean V. McHale}{28}
    var matchFixAuthorsG = new RegExp(".indexentry{" + pattern + " ([^}]*)}{([^}]*)}", "g");
    var matchFixAuthors = new RegExp(".indexentry{" + pattern + " ([^}]*)}{([^}]*)}", "");
    var m = buffer.match(matchFixAuthorsG);
    if (m != null) {
        for (var i = 0; i < m.length; i++) {
            var fix = m[i].match(matchFixAuthors);
            // fix[1] is the list of authors
            // fix[2] is the page number
            m[i] = [fix[1], fix[2]];
        }
        buffer = buffer.replace(matchFixAuthorsG, ""); // delete the old entries
        var temp = "";
        // authors may need rewriting from specials[] array
        // and some may be victims in the victims[] array
        for (var i = 0; i < m.length; i++) {
            var authors = getAuthors(m[i][0]);
            for (var a = 0; a < authors.length; a++) {
                authors[a] = authors[a].trim();
                for (var s = 0; s < specials.length; s++)
                    if (specials[s][0] == authors[a]) {
                        authors[a] = specials[s][1];
                        break;
                    }
                var embolden = "";
                for (var v = 0; v < victims.length; v++)
                    if (victims[v].trim() == authors[a]) {
                        embolden = "@\\textbf{" + authors[a] + "}";
                        break;
                    }
                temp = temp + "\\indexentry{" + authors[a] + embolden + inote + "}{" + m[i][1] + "}\n"
            }
        }
        return temp;
    }
}

function toUpperCase(s, n) {
    return s[n].toUpperCase();
}

function toUpperCaseCode(s, n) {
    return toUpperCase(s, n).charCodeAt(0);
}

function toInitialUpperCase(s) {
    return toUpperCase(s, 0) + s.substr(1);
}

function sufficientlyDifferent(a, b) {
    var d = Math.abs(toUpperCaseCode(a, 0) - toUpperCaseCode(b, 0));
    var e = Math.abs(toUpperCaseCode(a, 1) - toUpperCaseCode(b, 1));
    return d > 0 || e > 1;
}

if (buffer.match(warning) == null) {
    buffer = warning + buffer; // prefix with processed flag 

    for (var i = 0; i < specials.length; i++) {
        var re = new RegExp("{" + specials[i][0] + "}", "g");
        buffer = buffer.replace(re, function (match, offset, string) {
            return "{" + specials[i][1] + "}";
        });
    }

    for (var i = 0; i < abbreviations.length; i++) {
        abbreviations[i] = abbreviations[i].trim().split(":");
        var pattern = abbreviations[i][0].trim();
        re = new RegExp("{(" + pattern + "(?![a-zA-Z]))(.*)}{([0-9]*)}", "g");
        var replace = abbreviations[i][1].trim();
        buffer = buffer.replace(re, function (match, p1, p2, p3, p4, offset, string) {
            //return "{" + pattern + " (" + replace + ")" + p2 + "}{" + p4 + "}\n  \\indexentry{" + toInitialUpperCase(replace) + " (" + pattern + ")" + p2 + "}{" + p4 + "}";

            var fullEntryFirst = toInitialUpperCase(replace) + " (" + pattern + ")" + p2 + "}{" + p3 + "}\n";
            var subsidiaryEntry = pattern + " (" + replace + ")" + p2 + "}{" + p3 + "}";
            //return "[ 1=" + p1 + " 2=" + p2 + " 3=" + p3 + " 4=" + p4 + " ]\n" + 
            return "{" + fullEntryFirst + (sufficientlyDifferent(fullEntryFirst, subsidiaryEntry) ? "\\indexentry{" + subsidiaryEntry : "");
        });
    }

    for (var i = 0; i < victims.length; i++) {
        pattern = victims[i].trim();
        re = new RegExp("{(" + pattern + ")([^@}]*)}{([0-9]*)}", "gi");
        buffer = buffer.replace(re, function (match, p1, p2, p3, offset, string) {
            return "{" + p1 + "@\\textbf{" + p1 + "}" + p2 + "}{" + p3 + "}";
        });
    }

    // now sort out Fix-authors
    var temp = fixauthors("Fix-subject-authors");
    buffer = buffer + temp;
    temp = fixauthors("Fix-authors");
    if (separateAuthorIndex) {
        saveFile("author-index.idx", "% author index\n" + temp + "\n%end of author index\n");
    } else
        buffer = buffer + temp;
}

function saveFile(fileName, buffer) {
    fs.open(fileName, 'w', function (err, fd) {
        if (err) {
            if (err.code === 'EEXIST') {
                console.error(fileName + " can't be over-written");
                return;
            }
            console.error("Some error trying to write " + fileName);
            throw err;
        }
        fs.write(fd, buffer);
    });
}

console.log(buffer);

/// while we are at it, fix the list of people for the acknowledgements

var ack = [["Anderson", "Stuart", "Stuart O."],
           ["Blandford", "Ann"],
          // ["Buchanan", "George"],
           ["Butler", "Carol"],
           ["Cairns", "Paul"],
           ["Cauchi", "Abigail"],
           ["Curzon", "Paul"],
           ["Edrees", "Hanan"],
           ["Feldman", "Daniel"],
           ["Friesen", "Emma"],
           ["Greig", "Carolyn"],
           ["Griffiths", "Rob"],
           ["Harrison", "Michael"],
           ["Hoogewerf", "Jan"],
           ["Jackson", "Daniel"],
           ["Jackson", "Michael"],
           ["Koppel", "Ross"],
           ["Ladkin", "Peter"],
           ["Masci", "Paolo"],
           ["Mason", "Stephen"],
           ["Moe", "Marie", "Marie Elisabeth Gaup"], // full name for index
           ["Oladimeji", "Patrick"],
           ["Pike", "Josh"],
           ["Plummer", "Rosie"],
           ["Scott", "Philip"],
           ["Sheldon", "Martin", "Martin I."],
           ["Shneiderman", "Ben"],
           ["Smith", "Mike"],
           ["Symmons", "Deborah"],
           ["Tombs", "Sarah"],
           ["Thimbleby", "Prue"],
           ["Thimbleby", "Samuel"],
           ["Thimbleby", "Will"],
           ["Thomas", "Martyn"],
           ["Whitaker", "David"],
           ["White", "Dan"],
           ["White", "Graham"],
           ["Widdows", "David"],
           ["Williams", "Dave"],
           ["Woodward", "Suzette"],
           ["Yao", "Xixi"],
           ["Yeates", "Alex"]
          ];

// make sure ack is in order
ack.sort(function (a, b) { // return a[1].localeCompare(b[1])
    return (a[0] == b[0]) ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]);
});


function truncate(n) {
    var t = n + " ";
    var u = t.replace(/\..*/, "").replace(/ /, "");;
    //console.log("'" + n + "' -> '" + u + "'");
    return u / 1.0;
}

var c1, c2, c3;
var colmin = truncate(ack.length / 3);
c1 = c2 = c3 = colmin;

switch (ack.length - c1 - c2 - c3) {
case 0:
    break;
case 1:
    c2++;
    break;
case 2:
    c1++;
    c3++;
    break;
}

function getack(n, max) {
    //console.log("getack(" + n + ", " + max + ")");
    if (n < max) {
        var christianNames = ack[n][1];
        if (ack[n].length == 3) christianNames = ack[n][2];
        return "\\index{" + ack[n][0] + ", " + christianNames + "}" + ack[n][1] + "&" + ack[n][0];
    }
    return "~&~";
}

//console.log("c1=" + c1 + "  c2=" + c2 + "  c3=" + c3);

var s = "";
for (var i = 0; i < c1 || i < c2 || i < c3; i++) {
    s += getack(i, c1) + "&  " + getack(i + c1, c1 + c2) + "&  " + getack(i + c1 + c2, c1 + c2 + c3) + "\\\\\n";
}

saveFile("acknowledgements.txt", s);

function wc(str) {
    return " (" + str.trim().split(/\s+/).length + " words)";
}

function dump() {
    summary.push({
        keywords: entry.keywords,
        abstract: entry.abstract,
        title: entry.title,
        part: entry.part
    });
    entry.title = entry.abstract = entry.keywords = ""; // parts stay the same
}

// now process abstracts and keywords for OUP...
process("dbd-book.toc");
if (buffer == null)
    console.error("No dbd-book.toc file to process");
else {
    var b = buffer.replace(/[{][}]/g, "").replace(/\\nobreakspace/g, "");
    var s = b.match(/contentsline *{chapter}{.numberline *{[^}]*}[^}]*}|chapterBlurb *[^}]*}|ignorekeywordsincontents *{[^}]*}|contentsline {part}{[^}]*}/g);
    if (s == null) console.error("*** No abstract/keyword matches?");
    // order is: 
    // \ignorekeywordsincontents {...}
    // \contentsline {chapter}{...}
    // \chapterBlurb {...}
    // and part titles:
    // \contentsline {part}{...}
    var summary = [];
    var entry = {
        keywords: "",
        title: "",
        abstract: "",
        part: "",
    };

    for (var i = 0; i < s.length; i++) {
        if (s[i].match(/{part}/)) {
            entry.part = s[i];
        } else
        if (s[i].match(/chapterBlurb/)) {
            if (entry.abstract != "") dump();
            entry.abstract = s[i] + wc(s[i]);
        } else
        if (s[i].match(/contentsline/)) {
            if (entry.title != "") dump();
            entry.title = s[i];
        } else
        if (s[i].match(/ignorekeywordsincontents/)) {
            if (entry.keywords != "") dump();
            entry.keywords = s[i];
        }
    }
    s = "";
    if (entry.title != "" || entry.abstract != "" || entry.keywords != "") dump();
    var lastpart = "";
    for (var i = 0; i < summary.length; i++) {
        if (summary[i].part != lastpart) {
            s += "\n\n\\part" + summary[i].part + "\n\n";
            lastpart = summary[i].part;
        }
        if (summary[i].title != "") s += ("\n\n\\" + summary[i].title + "\n");
        if (summary[i].abstract != "") s += ("\\" + summary[i].abstract + "\n");
        if (summary[i].keywords != "") s += ("\\" + summary[i].keywords + "\n");
    }
    s += "\n\n";
    saveFile("abstracts.txt", s);
}