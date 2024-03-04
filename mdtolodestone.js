class MDTLS{
    static parse(text){
        var lines = text.split(/\r\n|\n/),
            hParser = new HParser(),
            res = "";

        lines.forEach(l => {
            var tag = "";

            if(hParser.test(l)){
                res += hParser.tag_begin(l) + hParser.text(l) + hParser.tag_end(l) + "\r\n";
                tag = hParser.tag_begin(l);
            }
            if(tag == ""){
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
        return `[${this.tag}]`;
    }

    text(line){
        return line.replace(this.regex, "");
    }

    tag_end(line){
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
