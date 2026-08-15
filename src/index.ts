// dshboard — host half.
//
// Like the shipped client plugins, the node half is a (near-)empty governed
// entry: the host Loader owns its lifecycle, and the web plugin registry
// discovers this package's `dsh.client` declaration from package.json. All
// capability lives in the browser half (src/client).
export const name = 'dshboard'

export function apply(): void {}
