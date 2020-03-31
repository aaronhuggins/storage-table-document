# StorageTableDocument

A simple class for dealing with storage table rows as if they were a document.

This is useful for storing and reviving table rows dynamically. It works by making a shallow copy of the input object and then converting it to or from a table row. Deep references are kept, so do not expect a deep clone to take place. This is only a naive implementation. A proxy is returned so that the object can be used to directly get and set properties on its internal shallow copy.

## Usage

Install from NPM and import it.

```javascript
const { StorageTableDocument } = require('storage-table-document')

const data = { some: { data: 'here' }, here: 2 }
const document = new StorageTableDocument(data)

document.add = 'me'

console.log(data.add) // Expected output: undefined
console.log(document.add) // Expected output: me

const tableRow = document.toRow()

console.log(tableRow) // Expected output: { __jsonKeys: '["some"]', some: '{"data":"here"}', here: 2, add: 'me' }
console.log(StorageTableDocument.toRow(data)) // Expected output: { __jsonKeys: '["some"]', some: '{"data":"here"}', here: 2 }

```

## API

### new StorageTableDocument(input: any)

Returns a proxied instance of the StorageTableDocument class and a shallow copy of the input object. Getters and setters on the instance will use the copied object to allow updating data prior to converting to a row or an object. If the input object has a `__jsonKeys` property, the copy will be revived internally.

- **toRow() =>** Returns the copied object as a flattened object with arrays and objects as jsonified strings and property `__jsonKeys`.
- **toObject() =>** Returns the copied object as a revived object using property `__jsonKeys`.

### Static Methods

- **toRow(input: any) =>** Returns the input object as a flattened copy with arrays and objects as jsonified strings and property `__jsonKeys`.
- **toObject(input: any) =>** Returns the input object as a revived copy using property `__jsonKeys`.