class MDTLS{
    static parse(text){
        var lines = text.split(/\r\n|\n/),
            hParser = new HParser(),
            listParser = new ListParser(),
            numListParser = new NumListParser(),
            strikethroughParser = new StrikethroughParser(),
            boldParser = new BoldParser(),
            italicParser = new ItalicParser(),
            linkParser = new LinkParser(),
            newLine = "\r\n",
            res = "";

        lines.forEach(l => {
            var tagFlag = false;

            if(hParser.test(l)){
                l = hParser.tag_begin(l) + hParser.text(l) + hParser.tag_end(l) + newLine;
                tagFlag = true;
                NumListParser.clearCounter();
            }
            if(listParser.test(l)){
                l = listParser.tag_begin(l) + listParser.text(l) + listParser.tag_end(l) + newLine;
                tagFlag = true;
                NumListParser.clearCounter();
            }
            if(numListParser.test(l)){
                l = numListParser.tag_begin(l) + numListParser.text(l) + numListParser.tag_end(l) + newLine;
                tagFlag = true;
            }

            while(strikethroughParser.test(l)){
                l = strikethroughParser.text(l);
            }

            while(boldParser.test(l)){
                l = boldParser.text(l);
            }

            while(italicParser.test(l)){
                l = italicParser.text(l);
            }

            while(linkParser.test(l)){
                l = linkParser.tag_begin(l) + linkParser.text(l) + linkParser.tag_end(l);
            }

            if(!tagFlag){
                res += l + newLine;
                NumListParser.clearCounter();
            }
            else{
                res += l;
            }
        });

        return res;
    }
}

class MDTLSParser{
    constructor(tag, regex){
        this.tag = tag;
        this.regex = regex;
    }

    test(line){
        return this.regex.test(line);
    }

    tag_begin(line){
        if(this.tag == ""){
            return "";
        }

        return `[${this.tag}]`;
    }

    text(line){
        return line.replace(this.regex, "");
    }

    tag_end(line){
        if(this.tag == ""){
            return "";
        }

        return `[/${this.tag}]`;
    }
}

class HParser extends MDTLSParser{
    sizeList = [32, 28, 24, 20, 18, 16];

    constructor(){
        super("size", /^#+ +/);
    }

    tag_begin(line){
        var sizeIndex = line.match(this.regex)[0].indexOf(" ") - 1,
            size;

        if(sizeIndex >= this.sizeList.length){
            sizeIndex = this.sizeList.length - 1;
        }

        size = this.sizeList[sizeIndex];

        return `[${this.tag}=${size}]`;
    }
}

class ListParser extends MDTLSParser{
    constructor(){
        super("", /^(    )*\* +/);
    }

    tag_begin(line){
        var indent = line.match(this.regex)[0].indexOf("*") / 4,
            begin = "";

        for(var i = 0; i < indent; i++){
            begin += "    ";
        }

        return begin + "・";
    }
}

class NumListParser extends MDTLSParser{
    static counter = [];

    constructor(){
        super("", /^(    )*[0-9]+\. +/);
        NumListParser.counter = [];
    }

    tag_begin(line){
        var indent = line.match(this.regex)[0].match(/[0-9]/).index / 4,
            begin = "";

        for(var i = 0; i < indent; i++){
            begin += "    ";
        }

        if(NumListParser.counter[indent] == null){
            NumListParser.counter[indent] = 1;
        }
        else{
            NumListParser.counter[indent] += 1;
        }

        for(var i = indent + 1; i < NumListParser.counter.length; i++){
            NumListParser.counter[i] = null;
        }

        begin += NumListParser.counter[indent] + ". ";

        return begin;
    }

    static clearCounter(){
        NumListParser.counter = [];
    }
}

class StrikethroughParser extends MDTLSParser{
    constructor(){
        super("s", /~~(.*?)~~/);
    }

    text(line){
        var match = line.match(this.regex),
            convertedText = this.tag_begin(line) + match[1] + this.tag_end(line);

        return line.replace(this.regex, convertedText);
    }
}

class BoldParser extends MDTLSParser{
    constructor(){
        super("b", /\*\*(.*?)\*\*/);
    }

    text(line){
        var match = line.match(this.regex),
            convertedText = this.tag_begin(line) + match[1] + this.tag_end(line);

        return line.replace(this.regex, convertedText);
    }
}

class ItalicParser extends MDTLSParser{
    constructor(){
        super("i", /\*(.*?)\*/);
    }

    text(line){
        var match = line.match(this.regex),
            convertedText = this.tag_begin(line) + match[1] + this.tag_end(line);

        return line.replace(this.regex, convertedText);
    }
}

class LinkParser extends MDTLSParser{
    constructor(){
        super("url", /^\[(.*)\]\((.*)\)/);
    }

    tag_begin(line){
        var match = line.match(this.regex);

        return `[${this.tag}=${match[1]}]`;
    }

    text(line){
        var match = line.match(this.regex);

        return match[2];
    }
}

class HiddenParser extends MDTLSParser{

}
