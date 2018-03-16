(function () {
    function notUndefined (element) {
        return typeof element !== "undefined";
    }
    var autocomplete = new autoComplete({
        menuClass: 'adc_{%= CurrentADC.InstanceId %}',
        selector: '#adc_{%= CurrentADC.InstanceId %}_input',
        databaseName: '{%:= CurrentADC.PropValue("databaseName")%}',
        searchField: '{%:= CurrentADC.PropValue("searchField")%}',
        minChars: {%:= CurrentADC.PropValue("minChars")%},
        responseInList: {%:= CurrentADC.PropValue("responseInList")%},
        searchSeparator: '{%:= CurrentADC.PropValue("searchSeparator")%}',
        currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
        inputIds: [{%  Dim i %}{% Dim ar = CurrentQuestion.ParentLoop.Answers %}{% Dim inputNames %}{% For i = 1 To ar.Count %}{% inputNames = CurrentQuestion.Iteration(ar[i].Index).InputName() %}"{%= inputNames %}"{%:= On(i < ar.Count, ",","") %}{% Next i %}],
        dataFields: function() {
            var fields = [];
            for(var key in autoComplete.databases[this.databaseName][0]){
                fields.push(key);
            }
            return fields;
        },
        source: function(term, suggest){
            term = term.toLowerCase();
            var i = 0;
        	var j = 0;
        	var count = 0;
            var choices = autoComplete.databases[this.databaseName];
            var suggestions = [];
            var completeData = [];
        	var arrTerms = term.toString().split(this.searchSeparator).filter(notUndefined);
            for (i = 0; n = choices.length, i < n;i++) {
                count = 0;
                for (j = 0; m = arrTerms.length, j < m;j++) {
                	if (~choices[i][this.searchField].toString().toLowerCase().indexOf(arrTerms[j])) {
                        count++;
                    }    
                }
                if (count === arrTerms.length) {
                    suggestions.push(choices[i][this.searchField]);
                    completeData.push(JSON.stringify(choices[i]).replace(/"/g, "#"));
                }
            }
            suggest(suggestions,completeData);
        }
    });
} ());
