(function () {
    // Function needed to decode special html characters
    var decodeEntities = (function() {
    // this prevents any overhead from creating the object each time
    var element = document.createElement('div');

    function decodeHTMLEntities (str) {
        if(str && typeof str === 'string') {
        // strip script/html tags
        // str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
        // str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
        element.innerHTML = str;
        str = element.textContent;
        element.textContent = '';
        }
        return str;
    }
    return decodeHTMLEntities;
    })();
    // autoComplete.databases["CURRENTQUESTION"] = [

    function notUndefined (element) {
        return typeof element !== "undefined";
    }
    /**
   * Replace the accent by the non accent version and replace y by i for phonetic search
   */
    String.prototype.withoutAccent = function(){
        // Array accents
        var pattern_accent = new Array(/À/g, /Á/g, /Â/g, /Ã/g, /Ä/g, /Å/g, /Æ/g, /Ç/g, /È/g, /É/g, /Ê/g, /Ë/g,
                                       /Ì/g, /Í/g, /Î/g, /Ï/g, /Ð/g, /Ñ/g, /Ò/g, /Ó/g, /Ô/g, /Õ/g, /Ö/g, /Ø/g, /Ù/g, /Ú/g, /Û/g, /Ü/g, /Ý/g,
                                       /Þ/g, /ß/g, /à/g, /á/g, /â/g, /ã/g, /ä/g, /å/g, /æ/g, /ç/g, /è/g, /é/g, /ê/g, /ë/g, /ì/g, /í/g, /î/g,
                                       /ï/g, /ð/g, /ñ/g, /ò/g, /ó/g, /ô/g, /õ/g, /ö/g, /ø/g, /ù/g, /ú/g, /û/g, /ü/g, /ý/g, /ý/g, /þ/g, /ÿ/g);

        // Array without accents
        var pattern_replace_accent = new Array("A","A","A","A","A","A","A","C","E","E","E","E",
                                               "I","I","I","I","D","N","O","O","O","O","O","O","U","U","U","U","I",
                                               "b","s","a","a","a","a","a","a","a","c","e","e","e","e","i","i","i",
                                               "i","d","n","o","o","o","o","o","o","u","u","u","u","i","i","b","i");

        var my_string = this;

        //For each caracters if accent remplace it by his non accent version
        for(var i=0;i<pattern_accent.length;i++){
            my_string = my_string.replace(pattern_accent[i],pattern_replace_accent[i]);
        }
        return my_string;
    }

    /**
   * Shim string.prototype.trim
   */
    if (!String.prototype.trim) {
        String.prototype.trim = function trim() {
            return this.replace(/^\s+|\s+$/gm, '');
        };
    }

    var autocomplete = new autoComplete({
        instanceId: "{%= CurrentADC.InstanceId %}",
        menuClass: "adc_{%= CurrentADC.InstanceId %}",
        selector: "#adc_{%= CurrentADC.InstanceId %}_input",
        useDatabase: "{%:= CurrentADC.PropValue("useDatabase")%}",
        questionType: "{%:= CurrentQuestion.Type%}",
        databaseName: '{%:= CurrentADC.PropValue("databaseName") %}',
        searchField: '{%:= On(CurrentADC.PropValue("useDatabase") = "no", "caption", CurrentADC.PropValue("searchField")) %}',
        additionalSearchField: "{%:= CurrentADC.PropValue("additionalSearchField")%}",
        filterField: "{%:= CurrentADC.PropValue("filterField")%}",
        filterValue: "{%:= CurrentADC.PropValue("filterValue")%}",
        minChars: {%:= CurrentADC.PropValue("minChars")%},
        responseInList: {%:= CurrentADC.PropValue("responseInList")%},
        searchSeparator: "{%:= CurrentADC.PropValue("searchSeparator")%}",
        currentQuestion: "{%:= CurrentQuestion.Shortcut %}",
        inputName: "{%:= CurrentQuestion.InputName() %}",
        noMatchFound: "{%:= CurrentADC.PropValue("noMatchFound")%}",
        noMatchOffset: "{%:= CurrentADC.PropValue("noMatchOffset")%}",
        autoSelect: "{%:= CurrentADC.PropValue("autoSelect")%}" || 1,
        items :[
          {% If(CurrentQuestion.Type = "single") Then %}
          {%:= CurrentADC.GetContent("dynamic/single.js").ToText()%}
          {% EndIf %}
        ],
        inputIds: [
          {% If(CurrentQuestion.Type = "single") Then %}
          "{%=CurrentQuestion.InputName()%}"
          {% Else %}
            {% Dim i %}
            {% Dim ar = CurrentQuestion.ParentLoop.Answers %}
            {% Dim inputNames %}
            {% For i = 1 To ar.Count %}
              {% inputNames = CurrentQuestion.Iteration(ar[i].Index).InputName() %}
              "{%= inputNames %}"
              {%:= On(i < ar.Count, ",", "") %}
            {% Next i %}
          {% EndIf %}
        ],
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
        	var n = 0;
        	var m = 0;
        	var l = 0;
        	var k = 0;
        	var count = 0;
          var choices;
          if (this.questionType == "single") {
            choices = this.items;
          } else {
            choices = autoComplete.databases[this.databaseName];
          }
          var suggestions = [];
        	var beginFirst = false;
        	var first = [];
        	var others = [];
            var completeData = [];
        	var completeFirstData = [];
        	var completeOthersData = [];
        	var searchPhonetic = "{%:= CurrentADC.PropValue("searchPhonetic") %}";
        	var sortFirst = "{%:= CurrentADC.PropValue("sortFirst") %}";
        	var arrTerms = term.toString().split(this.searchSeparator).filter(notUndefined);
        	var arrTempSearch = []
            arrTempSearch.push(this.searchField);
        	var serchFields = (this.additionalSearchField.toString().trim().split(',') != '') ? arrTempSearch.concat(this.additionalSearchField.toString().split(',')) : arrTempSearch;
        	var temp = false;
            for (i = 0; n = choices.length, i < n;i++) {
                choices[i].inputName = this.inputName;
                count = 0;
                beginFirst = false;
                for (j = 0; m = arrTerms.length, j < m;j++) {
                    for (l = 0; k = serchFields.length, l < k;l++) {
                        temp = false;
                        if (searchPhonetic === 'yes') {
                            if (this.filterValue.withoutAccent().trim().toLowerCase() !== '') {
                                if ((~choices[i][serchFields[l]].toString().withoutAccent().toLowerCase().indexOf(arrTerms[j].withoutAccent())) && (~choices[i][this.filterField].toString().withoutAccent().toLowerCase().indexOf(this.filterValue.withoutAccent().toLowerCase()))) {
                                    count++;
                                    temp = true;
                                }
                            } else {
                                if (~choices[i][serchFields[l]].toString().withoutAccent().toLowerCase().indexOf(arrTerms[j].withoutAccent())) {
                                    count++;
                                    temp = true;
                                }
                            }
                            if (~choices[i][serchFields[l]].toString().withoutAccent().toLowerCase().indexOf(arrTerms[j].withoutAccent()) === -1) {
                                beginFirst = true;
                            }
                            if (temp === true) break;
                        } else {
                            if (this.filterValue.trim().toLowerCase() !== '') {
                                if ((~choices[i][serchFields[l]].toString().toLowerCase().indexOf(arrTerms[j])) && (~choices[i][this.filterField].toString().toLowerCase().indexOf(this.filterValue.toLowerCase()))) {
                                    count++;
                                    temp = true;
                                }
                            } else {
                                if (~choices[i][serchFields[l]].toString().toLowerCase().indexOf(arrTerms[j])) {
                                    count++;
                                    temp = true;
                                }
                            }
                            if (~choices[i][serchFields[l]].toString().toLowerCase().indexOf(arrTerms[j]) === -1) {
                                beginFirst = true;
                            }
                            if (temp === true) break;
                        }
                    }
                }
                if (count === arrTerms.length) {
                    if (sortFirst === 'yes') {
                        if (beginFirst === true) {
                        	first.push(choices[i][this.searchField]);
                            completeFirstData.push(JSON.stringify(choices[i]).replace(/"/g, '&quot;'));
                        } else {
                            others.push(choices[i][this.searchField]);
                            completeOthersData.push(JSON.stringify(choices[i]).replace(/"/g, '&quot;'));
                        }
                    } else {
                    	suggestions.push(choices[i][this.searchField]);
                        completeData.push(JSON.stringify(choices[i]).replace(/"/g, '&quot;'));
                    }
                }
            }
        	if (sortFirst === 'yes') {
            	suggest(first.concat(others),completeFirstData.concat(completeOthersData));
            } else {
            	suggest(suggestions,completeData);
            }
        }
    });

    document.addEventListener("DOMContentLoaded", function(event) {
        document.querySelector('#adc_{%= CurrentADC.InstanceId %} .close-icon').addEventListener("click", function(event) {
			event.preventDefault();
			event.stopPropagation();
			var inputs = document.getElementById('adc_{%= CurrentADC.InstanceId %}').getElementsByClassName('autocomplete');
			for (var i=0; n = inputs.length, i < n; i++) {
            	inputs[i].value = '';
            	inputs[i].defaultValue = '';
        	}
        	document.querySelector('#adc_{%= CurrentADC.InstanceId %} .nomatch').innerHTML = '';
        });
    });
} ());
