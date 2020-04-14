class StorageTableDocument {
  constructor (input) {
    this._jsonKeys = typeof input.__jsonKeys === 'string'
      ? JSON.parse(input.__jsonKeys)
      : []
    this._object = Object.assign({}, input)

    if (typeof this._object.__jsonKeys === 'string') {
      this._object = Object.assign({}, this.toObject())
    }

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
    const isArrayOrObject = function isArrayOrObject (value) {
      if (value === null || value === undefined) {
        return false
      }

      if (typeof value.toJSON === 'function') {
        const char = value.toJSON().substring(0, 1)

        return char === '[' || char === '{'
      }

      return Array.isArray(value) || typeof this._object[key] === 'object'
    }

    Object.keys(this._object).forEach((key) => {
      if (isArrayOrObject(this._object[key])) {
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
          try {
            output[key] = JSON.parse(this._object[key])
          } catch (error) {
            output[key] = this._object[key]
          }
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
