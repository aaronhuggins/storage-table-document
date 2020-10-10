declare module 'storage-table-document' {
  interface StorageTableRow {
    __jsonKeys: string
    [property: string]: any
  }

  class StorageTableDocument {
    constructor(input: any)

    toObject(): any
    toRow(): StorageTableRow

    static toObject(input: any): any
    static toRow(input: any): StorageTableRow
  }

  export = { StorageTableDocument }
}
