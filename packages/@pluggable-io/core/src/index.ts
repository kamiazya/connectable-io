

const regisotry = new Map<string, any>();




export interface Storage {
  //
}

export namespace Storage {
  export function create(path: string): Storage {
    const url = new URL(path)
    // url.protocol
  }
}
