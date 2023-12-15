import fs from "fs";
import fsPromise from "fs/promises";
import path from "path";
import { finished } from "stream/promises";
import { ReadableStream as ReadableWebStream } from "stream/web";
import { Readable } from "stream";
import "../utils/polyfills";

type WebDownloaderOptions = {
  url: string;
  outFile: string;
};

export default class WebDownloader implements Disposable {
  private readonly fileStream: fs.WriteStream;
  private filePath = path.join(__dirname, "../temp");
  private readonly url: string;

  constructor({ outFile, url }: WebDownloaderOptions) {
    this.url = url;
    this.filePath = path.join(this.filePath, outFile);
    this.fileStream = fs.createWriteStream(this.filePath);
  }

  public async download() {
    console.log("Downloading..");

    try {
      await this.createFile();
      const { body } = await fetch(this.url);

      // explicit casting to ReadableWebStream because there are 2 versions of ReadableStream (nodejs, DOM)
      await finished(
        Readable.fromWeb(body as unknown as ReadableWebStream).pipe(
          this.fileStream
        )
      );

      return this.filePath;
    } catch (error: any) {
      await this.deleteFile();
      throw error;
    }
  }

  private async createFile() {
    try {
      await fsPromise.writeFile(this.filePath, "");
    } catch (_) {}
  }

  private async deleteFile() {
    try {
      await fsPromise.unlink(this.filePath);
    } catch (_) {}
  }

  // Cleanup after the class instance has finished processing
  [Symbol.dispose]() {
    this.fileStream.close();
  }
}
