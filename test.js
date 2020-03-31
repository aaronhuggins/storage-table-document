const { StorageTableDocument } = require('storage-table-document')

const data = { some: { data: 'here' }, here: 2 }
const document = new StorageTableDocument(data)

document.add = 'me'

console.log(data.add) // Expected output: undefined
console.log(document.add) // Expected output: me

const tableRow = document.toRow()

console.log(tableRow) // Expected output: { __jsonKeys: '["some"]', some: '{"data":"here"}', here: 2, add: 'me' }
console.log(StorageTableDocument.toRow(data)) // Expected output: { __jsonKeys: '["some"]', some: '{"data":"here"}', here: 2 }
