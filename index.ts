interface ObjectIntermediate {
  __jsonKeys?: string | string[]
  [key: string]: any
}

export class StorageTableDocument<T = any> {
  constructor (input: T & { __jsonKeys?: string | string[] }) {
    this._jsonKeys = typeof input.__jsonKeys === 'string'
      ? JSON.parse(input.__jsonKeys)
      : []
    this._object = Object.assign({}, input)

    if (typeof this._object.__jsonKeys === 'string') {
      this._object = Object.assign({}, this.toObject()) as T
    }

    return new Proxy(this, {
      get: function get (target, property) {
        return property in target
          ? target[property]
          : target._object[property]
      },
      set: function set (target, property, value, receiver) {
        if (property in target) {
          target[property] = value
        } else {
          target._object[property] = value
        }

        return true
      }
    })
  }

  private _jsonKeys: string[]
  private _object: T & {
    __jsonKeys?: string | string[]
  }

  toRow (): any {
    const output: ObjectIntermediate = { __jsonKeys: [] }
    const isArrayOrObject = function isArrayOrObject (value) {
      if (value === null || value === undefined) {
        return false
      }

      if (typeof value.toJSON === 'function') {
        const result = value.toJSON()

        if (typeof result === 'string') {
          const char = result.substring(0, 1)

          return char === '[' || char === '{'
        }

        value = result
      }

      return Array.isArray(value) || typeof value === 'object'
    }

    Object.keys(this._object).forEach((key) => {
      if (isArrayOrObject(this._object[key])) {
        if (Array.isArray(output.__jsonKeys)) output.__jsonKeys.push(key)
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

  toObject (): T {
    let output: ObjectIntermediate = {}

    if (typeof this._object.__jsonKeys === 'string') {
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

    return output as T
  }

  static toObject<T = any> (input: T & { __jsonKeys?: string | string[] }) {
    return new StorageTableDocument<T>(input).toObject()
  }

  static toRow<T = any> (input: T & { __jsonKeys?: string | string[] }) {
    return new StorageTableDocument<T>(input).toRow()
  }
}
