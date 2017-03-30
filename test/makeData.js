function makeData(parameters) {
    var arr = [];
    var today = new Date();

    for (var i = 0; i < 50; i++) {
        arr.push({
            date: new Date(today - i * 3600 * 24 * 100),
            close: Math.random() * 100,
            open: Math.random() * 100
        });
    }
    return arr;
}


