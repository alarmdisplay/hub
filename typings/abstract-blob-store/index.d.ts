declare module 'abstract-blob-store' {
  type BlobKey = string | {key: string, [name: string]: any}
  type BlobMetadata = {key: string, [name: string]: any}
  type CreateCallback = (error: Error | null, metadata: BlobMetadata) => void
  type ExistsCallback = (error: Error | null, exists: boolean) => void
  type RemoveCallback = (error: Error | null) => void
  interface AbstractBlobStore {
    createWriteStream(opts: BlobKey, callback: CreateCallback): NodeJS.WriteStream
    createReadStream(opts: BlobKey): NodeJS.ReadStream
    exists(opts: BlobKey, callback: ExistsCallback): void
    remove(opts: BlobKey, callback: RemoveCallback): void
  }
}
