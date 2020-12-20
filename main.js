function pokerWall(opts) {
    this._opts = opts;
    this._logFile = opts.logFile;
    // call get data function
    this._getData(this._logFile);
}

pokerWall.prototype = Object.create(null,{
    constructor: {
        value: pokerWall
    },  
    _getData:{
        value: function(log){
            fetch(log)
            .then(response => response.text())
            .then((data) => {
                console.log('data recieved - passing to convert to json function')
                this._convertCsvToJson(data)
            })
        }
    },
    _convertCsvToJson: {
        value: function(data){
            var lines=data.split("\n");
            var result = [];
            var headers=lines[0].split(",");
            for(var i=1;i<lines.length;i++){
                var obj = {};
                var currentline=lines[i].split(",");
                for(var j=0;j<headers.length;j++){
                    obj[headers[j]] = currentline[j];
                }
                result.push(obj);
            }
            console.log('converted data to json - passing to prettify function')
            this._prettifyData(result)
        }
    },
    _prettifyData: {
        value: function(data){
            playerArray = [];
            var firstRow = data[(data.length) - 2];
            var lastRow = data[0];
            data.forEach(function(data) {
                if (data.entry.substring(0,3) == '"""') {
                    if (data.entry.includes('collected')) {
                        var entry = data.entry.substring(3);
                        playerName = entry.split(' @');
                        playerArray.push(playerName[0]);
                    }
                }
            });
            console.log('built array of all players, time to find uniques')
            this._getPlayerList(playerArray,data);
            this._getGameTime(firstRow)
            this._getGameDuration(firstRow,lastRow)
        }
    },
    _getPlayerList: {
        value: function(playerArray,data){
            function findUniquePlayers(value, index, self) {
                return self.indexOf(value) === index;
            }
            var uniquePlayers = playerArray.filter(findUniquePlayers)
            console.log('found unique players:')
            console.table(uniquePlayers)
            this._setPlayerList(uniquePlayers,data)
        }
    },
    _setPlayerList: {
        value: function(uniquePlayers,data) {
            uniquePlayers.forEach(function(name) {
                var html = '<tr data-name="'+name+'">';
                    html += '<td>'+name+'</td>';
                    html += '<td></td>';
                    html += '<td></td>';
                    html += '<td data-hand="undefined"></td>';
                    html += '<td data-hand="High Card"></td>';
                    html += '<td data-hand="Pair"></td>';
                    html += '<td data-hand="Two Pair"></td>';
                    html += '<td data-hand="Three of a Kind"></td>';
                    html += '<td data-hand="Straight"></td>';
                    html += '<td data-hand="Flush"></td>';
                    html += '<td data-hand="Full House"></td>';
                    html += '<td data-hand="Four of a Kind"></td>';     
                    html += '<td data-hand="Straight Flush"></td>';                            
                    html += '<td data-hand="Royal Flush"></td>';                                                   
                    html += '</tr>';
                    document.getElementById('results').insertAdjacentHTML('beforeend', html)
            })
            document.body.querySelector('.cp-game-meta__players').children[0].innerHTML = uniquePlayers.length;
            this._countWins(data)
        }
    },
    _countWins: {
        value: function(data) {
            var handCount = 0;
            data.forEach(function(data) {
                if (data.entry.substring(0,3) == '"""') {
                    if (data.entry.includes('collected')) {
                        handCount++;
                        var entry = data.entry.substring(3);
                        var winner = entry.split(' @')[0];
                        var hand = entry.split('with ')[1];
                        pokerWall._setHands(winner,hand)
                    }
                }
            });
            this._setShowdowns()
            this._setHandCount(handCount)
            this._setWinPercentage(handCount)
        }
    },
    _setHands: {
        value: function(winner,hand) {
            var winnerRow = document.body.querySelector('tr[data-name="'+winner+'"]');
            var winCount = winnerRow.children[1].innerHTML;
            if (winCount == 'undefined') {
                winCount = 0;
            }
            winCount++;
            winnerRow.children[1].innerHTML = winCount;
            var handColumn = winnerRow.querySelector('[data-hand="'+hand+'"]');
            var handCount = handColumn.innerHTML;
            if (handCount == 'undefined') {
                handCount = 0;
            }
            handCount++;
            if (hand !== 'undefined') {
                handColumn.innerHTML = handCount;
            }
        }
    },
    _setShowdowns: {
        value: function() {
            var playerRows = document.body.querySelectorAll('#results tr');
            playerRows.forEach(function(row) {
                var winRow = row.children[1].innerHTML;
                var showDown = row.children[3].innerHTML;
                var showDowns = winRow - showDown;
                row.children[3].innerHTML = showDowns;
            })
        }
    },
    _setHandCount: {
        value: function(handCount) {
            document.body.querySelector('.cp-game-meta__hands').children[0].innerHTML = handCount;
        }
    },
    _setWinPercentage: {
        value: function(handCount) {
            var playerRows = document.body.querySelectorAll('#results tr');
            playerRows.forEach(function(row) {
                var winRow = row.children[1].innerHTML;
                var percentage = (winRow / handCount) * 100;
                row.children[2].innerHTML = Math.ceil(percentage) + '%';
            })
        }
    },    
    _getGameTime: {
        value: function(firstRow) {
            var time = firstRow['at'].split('T');
            var date = new Date(firstRow['at']);
            var prettyDate = date.toDateString();
            var time = date.toLocaleTimeString();
            document.body.querySelector('.cp-game-meta__time').children[0].innerHTML = time;
            document.body.querySelector('.cp-game-meta__date').children[0].innerHTML = prettyDate;
        }
    },
    _getGameDuration: {
        value: function(firstRow,lastRow) {
            var start = new Date(firstRow['at']);
            var end = new Date(lastRow['at']);
            var duration = Math.abs(start - end);
            var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            var result = hours + " hours, " + minutes + " minutes";
            document.body.querySelector('.cp-game-meta__duration').children[0].innerHTML = result;
        }
    },
})      

var pokerWall = new pokerWall({
    logFile: 'log.csv',
})
