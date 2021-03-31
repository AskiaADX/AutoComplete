{%
Dim useDatabase = CurrentADC.PropValue("useDatabase")
If (useDatabase = "no") Then
' Load data from question
  Dim idx
  Dim arrResponses = CurrentQuestion.AvailableResponses

  ' Response properties
  Dim caption
  Dim entryCode
  Dim id
  Dim index
  Dim inputName
  Dim inputValue

  For idx = 1 To arrResponses.Count
    caption = arrResponses[idx].Caption
    entryCode = arrResponses[idx].EntryCode
    id = arrResponses[idx].Id
    index = arrResponses[idx].Index
    inputName = CurrentQuestion.InputName()
    inputValue = arrResponses[idx].InputValue()
%}
    {"caption":decodeEntities("{%= caption%}"), "entryCode":"{%= entryCode%}", "id":"{%= id%}", "index":"{%= index%}", "inputValue":"{%= inputValue%}",  "inputName":""}{%= On(idx < arrResponses.Count, ",", "") %}
{% Next idx %}
// ];
{% EndIf %}
