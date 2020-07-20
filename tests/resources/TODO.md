# TODO

These tests fail with the current implementation, so are not included.

## declare-and-assign

```vbs
Dim x : x = "abc"

```

```js
var x; x = "abc";

```

## assign-boolean-expression

```vbs
x = a = b

```

```js
x = a == b;

```

## Loops

No loops are supported right now.

## Select Case with `Case Else`

```vbs
Select Case someSymbol
Case someSecondSymbol
    doSomething()
Case someThirdSymbol
    doSomethingElse()
Case Else
    doLastResort()
End Select

```

```js
switch(someSymbol){
case someSecondSymbol: {
    doSomething();
break;
}
case someThirdSymbol: {
    doSomethingElse();
break;
}
default:
    doLastResort();
break;
}

```
