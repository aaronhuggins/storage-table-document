class StorageTableDocument {
  constructor (object) {
    this._object = Object.assign({}, object)

    return new Proxy(this, {
      get: function get (target, property) {
        return property in target
          ? target[property]
          : target._object[property]
      },
      set: function set (target, property, value) {
        if (property in target) {
          target[property] = value
        } else {
          target._object[property] = value
        }
      }
    })
  }

  toRow () {
    const output = { __jsonKeys: [] }

    Object.keys(this._object).forEach((key) => {
      if (typeof this._object[key] === 'object' && this._object[key] !== null) {
        output.__jsonKeys.push(key)
        output[key] = JSON.stringify(this._object[key])
      } else {
        output[key] = this._object[key]
      }
    })

    if (Array.isArray(output.__jsonKeys)) {
      output.__jsonKeys = JSON.stringify(output.__jsonKeys)
    }

    return output
  }

  toObject () {
    let output = {}

    if (this._object.__jsonKeys !== undefined) {
      const __jsonKeys = JSON.parse(this._object.__jsonKeys)

      Object.keys(this._object).forEach((key) => {
        if (__jsonKeys.includes(key)) {
          output[key] = JSON.parse(this._object[key])
        } else {
          output[key] = this._object[key]
        }
      })
    } else {
      output = this._object
    }

    if (output.__jsonKeys !== undefined) {
      delete output.__jsonKeys
    }

    return output
  }

  static toObject (input) {
    return new StorageTableDocument(input).toObject()
  }

  static toRow (input) {
    return new StorageTableDocument(input).toRow()
  }
}

module.exports = { StorageTableDocument }
