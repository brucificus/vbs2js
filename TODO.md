# Script Converter: map of code constructs & progress

- ✅ declare variable

- ✅ concat string

- ✅ statement
  - `\r\n`
  - line continuation char `_`
  - line combination char `:`

- ✅ declare proc
- ✅ end proc
- ✅ proc params & open
  - `SUB somesub(p1…)`
- ✅ call proc
  - `call somesub(p1…)`
  - `somesub p1`
- ✅ function return
- ✅ if statement
- ✅ case statement
  - `SELECT CASE`
  - still needs multiple cases, eg: `CASE 1, 2` --> `case 1:`/`case 2:`
- 🔳 for loop
  - `FOR x=0 TO n … NEXT`
  - `FOR EACH obj IN someCol NEXT` ---> ???
- 🔳 do loop
- ✅ comments
- ✅ object
  - `CreateObject` / `Server.CreateObject()`
  - `SET`
  - `nothing`
- ✅ dialogs
  - `msgbox()` --> `window.alert()`
  - `msgbox(..vbYesNo/vbOKCancel…)` -> `windows.confirm()`
  - `inputbox()` --> `window.prompt()`
- ✅ language constants
  - `vbOK`, `vbCancel`, `vbYes`, `vbNo`, `vbCRLF`, `vbTab`, `vbEmpty`..
- _miscellaneous_
  - ✅ Option Explicit
  - ✅ On Error Goto 0/ On Error Resume Next
