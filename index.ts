interface ObjectIntermediate {
  __jsonKeys?: string | string[]
  [key: string]: any
}

export class StorageTableDocument<T = any> {
  constructor (input: T & { __jsonKeys?: string | string[] }) {
    this._object = Object.assign({}, input)
    this._aggressive = false

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

  private _object: T & {
    __jsonKeys?: string | string[]
  }
  private _aggressive: boolean

  mode (aggressive: boolean = false) {
    this._aggressive = aggressive

    return this
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

    for (const key of Object.keys(this._object)) {
      if (isArrayOrObject(this._object[key])) {
        if (Array.isArray(output.__jsonKeys)) output.__jsonKeys.push(key)
        output[key] = JSON.stringify(this._object[key])
      } else {
        output[key] = this._object[key]
      }
    }

    if (Array.isArray(output.__jsonKeys)) {
      output.__jsonKeys = JSON.stringify(output.__jsonKeys)
    }

    return output
  }

  toObject (): T {
    let output: ObjectIntermediate = {}
    const maybeJson = (value: string): boolean => {
      if (typeof value !== 'string') return false

      const trimmed = value.trim()
      const startChar = trimmed.substring(0, 1)
      const endChar = trimmed.substring(trimmed.length - 1, trimmed.length)

      return (startChar === '[' && endChar === ']') || (startChar === '{' && endChar === '}')
    }

    if (this._aggressive) {
      let __jsonKeys = []

      if (typeof this._object.__jsonKeys === 'string') {
        try {
          __jsonKeys = JSON.parse(this._object.__jsonKeys)
        } catch (err) {}
      }

      for (const key of Object.keys(this._object)) {
        if (__jsonKeys.includes(key) || maybeJson(this._object[key])) {
          try {
            output[key] = JSON.parse(this._object[key])
          } catch (error) {
            output[key] = this._object[key]
          }
        } else {
          output[key] = this._object[key]
        }
      }
      
    } else if (typeof this._object.__jsonKeys === 'string') {
      const __jsonKeys = JSON.parse(this._object.__jsonKeys)

      for (const key of Object.keys(this._object)) {
        if (__jsonKeys.includes(key)) {
          try {
            output[key] = JSON.parse(this._object[key])
          } catch (error) {
            output[key] = this._object[key]
          }
        } else {
          output[key] = this._object[key]
        }
      }
    } else {
      output = this._object
    }

    if (output.__jsonKeys !== undefined) {
      delete output.__jsonKeys
    }

    return output as T
  }

  static toObject<T = any> (input: T & { __jsonKeys?: string | string[] }, aggressive: boolean = false) {
    return new StorageTableDocument<T>(input).mode(aggressive).toObject()
  }

  static toRow<T = any> (input: T & { __jsonKeys?: string | string[] }) {
    return new StorageTableDocument<T>(input).toRow()
  }
}
