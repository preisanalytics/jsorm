import { IncludeScope } from '../scope'

export interface IncludeArgHash {
  [key : string] : IncludeScope
}

interface IncludeHash {
  [key : string] : string | IncludeHash
}

type NestedInclude = Record<string, IncludeDirective>

export interface IncludeScopeHash {
  [key : string] : IncludeScopeHash
}

export class IncludeDirective {
  private dct : NestedInclude = {}

  constructor(arg? : IncludeScope) {
    let includeHash = this._parseIncludeArgs(arg)

    for (let key in includeHash) {
      if (includeHash.hasOwnProperty(key)) {
        this.dct[key] = new IncludeDirective(includeHash[key])
      }
    }
  }

  toScopeObject() : IncludeScopeHash {
    let hash : IncludeScopeHash = {}
    for (let key in this.dct) {
      if (this.dct.hasOwnProperty(key)) {
        hash[key] = this.dct[key].toScopeObject()
      }
    }
    return hash
  }

  toString() : string {
    let stringArray = []
    for (let key in this.dct) {
      if (this.dct.hasOwnProperty(key)) {
        let stringValue = this.dct[key].toString()

        if (stringValue === '') {
          stringArray.push(key)
        } else {
          let split = stringValue.split(',')
          split = split.map((x) => `${key}.${x}`)

          stringArray.push(split.join(','))
        }
      }
    }

    return stringArray.join(',')
  }

  private _parseIncludeArgs(includeArgs? : IncludeScope) : IncludeHash {
    if (Array.isArray(includeArgs)) {
      return this._parseArray(includeArgs)
    } else if (typeof includeArgs === "string") {
      let obj : IncludeHash = {}
      obj[includeArgs] = {}
      return obj
    } else if (typeof includeArgs === "object") {
      return this._parseObject(includeArgs)
    } else {
      return {}
    }
  }

  private _parseObject(includeObj : IncludeArgHash) : IncludeHash {
    let parsed : IncludeHash = {}

    for (let key in includeObj) {
      if (includeObj.hasOwnProperty(key)) {
        parsed[key] = this._parseIncludeArgs(includeObj[key])
      }
    }
    return parsed
  }

  private _parseArray(includeArray : any[]) : IncludeHash {
    let parsed : IncludeHash = {}
    for (let value of includeArray) {
      let parsedEl = this._parseIncludeArgs(value)
      for (let key in parsedEl) {
        if (parsedEl.hasOwnProperty(key)) {
          parsed[key] = parsedEl[key]
        }
      }
    }
    return parsed
  }
}
