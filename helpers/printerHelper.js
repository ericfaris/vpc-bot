var Table = require('easy-table')

module.exports = {

    noDecimal: (val, width) => {
        var str = val;
        return (width ? Table.padLeft(str, width) : str).replace(/^0+/, '');
    }

}

