exports.byteSubstitute = function(buf) {
    let temp = [];
    for (let i = 0; i < buf.length; i++) {
        switch (buf[i]) {
            case 0x02:
                temp.push(0x1b);
                temp.push(0x82);
                break;
            case 0x03:
                temp.push(0x1b);
                temp.push(0x83);
                break;
            case 0x06:
                temp.push(0x1b);
                temp.push(0x86);
                break;
            case 0x15:
                temp.push(0x1b);
                temp.push(0x95);
                break;
            case 0x1b:
                temp.push(0x1b);
                temp.push(0x9b);
                break;
            default:
                temp.push(buf[i]);
                break;
        }
    }
    return Buffer.from(temp);
}

exports.byteUnsubstitute = function(buf) {
    let temp = [];
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] == 0x1b) {
            i++;
            switch (buf[i]) {
                case 0x82:
                    temp.push(0x02);
                    break;
                case 0x83:
                    temp.push(0x03);
                    break;
                case 0x86:
                    temp.push(0x06);
                    break;
                case 0x95:
                    temp.push(0x15);
                    break;
                case 0x9b:
                    temp.push(0x1b);
                    break;
            }
        }
        else {
            temp.push(buf[i]);
        }
    }
    return Buffer.from(temp);
}

exports.calculateChecksum = function(buf) {
    let chk = 0
    for (let i = 0; i < buf.length; i++) {
        chk = chk ^ parseInt(buf[i]);
    }
    return Buffer.from([chk]);
}

exports.encapsulateCommand = function(buf) {
    // generate checksum.
    // build command string with checksum.
    // byte substitute illegal characters.
    // build command string with STX and ETX bytes and return to caller.
    let checksum = this.calculateChecksum(buf);
    let temp = Buffer.concat([buf, checksum]);
    temp = this.byteSubstitute(temp);
    return Buffer.concat([Buffer.from([2]), temp, Buffer.from([3])]);
}

exports.decapsulateCommand = function(buf) {
    // strip off STX and ETX.
    // unsubstitute illegal characters.
    // remove command portion
    // remove checksum portion.
    // calculate the checksum.
    // compare the received checksum and the calculated checksum.
    // if checksums match, return command to caller.
    // if checksums don't match, return null to caller.
    let temp = buf.subarray(1, buf.length - 1);
    temp = this.byteUnsubstitute(temp);
    let tempCommand = temp.subarray(0, temp.length - 1);
    let tempChecksum1 = temp.subarray(-1);
    let tempChecksum2 = this.calculateChecksum(tempCommand);
    if (Buffer.compare(tempChecksum1, tempChecksum2) == 0) {
        return tempCommand;
    }
    else {
        return null;
    }
}