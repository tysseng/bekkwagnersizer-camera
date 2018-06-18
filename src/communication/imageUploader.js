// @flow
import uuid from 'uuid/v1';
import config from "../config";
import logger from "../utils/logger";
import type { Container } from "../types";

const b64toBlob = (b64Data: string, contentType: string = '', sliceSize: number = 512): Blob => {
  // from https://ourcodeworld.com/articles/read/322/how-to-convert-a-base64-image-into-a-image-file-and-upload-it-with-an-asynchronous-form-using-jquery

  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

const uploadOne = async (url: string, formData: FormData): Promise<*> => {
  await fetch(url, {
    method: 'POST',
    body: formData
  })
    .then(response => {
      logger.info('Upload response:', response);
      if (response.status !== 200) {
        throw new Error(`Status code not OK (${response.status})`);
      }
    })
    .catch(err => {
      logger.info('Upload error:', err);
    });
};

export const uploadFile = async (
  container: Container, bitCode: number, variation: string
): Promise<*> => {
  const png = container.canvas.toDataURL("image/png");
  const block = png.split(";");
  const contentType = block[0].split(":")[1];
  const realData = block[1].split(",")[1];

  const blob = b64toBlob(realData, contentType);

  const image = config.sceneConfig.bitCodeToImageMap[bitCode];

  //const filenameStem = filenames[bitCode] || 'fallback';
  const filename = `${variation}-${image.gender}-${image.id}-${uuid()}.png`;

  const formData = new FormData();
  formData.append("image", blob, filename);

  logger.info(`uploading ${filename} (bitCode ${bitCode}, variation ${variation}) to MiraServer`);

  const uploadPromises = config.uploadUrls.map((url) => {
    logger.info(`uploading to ${url}`);
    return uploadOne(url, formData);
  });
  await Promise.all(uploadPromises);
};