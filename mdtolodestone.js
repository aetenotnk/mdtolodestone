class MDTLS{
    static parse(text){
        var lines = text.split(/\r\n|\n/),
            hParser = new HParser(),
            listParser = new ListParser(),
            newLine = "\r\n",
            res = "";

        lines.forEach(l => {
            var tagFlag = false;

            if(hParser.test(l)){
                res += hParser.tag_begin(l) + hParser.text(l) + hParser.tag_end(l) + newLine;
                tagFlag = true;
            }
            if(listParser.test(l)){
                res += listParser.tag_begin(l) + listParser.text(l) + listParser.tag_end(l) + newLine;
                tagFlag = true;
            }

            if(!tagFlag){
                res += l + "\r\n";
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
