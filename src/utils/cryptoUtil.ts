// @ts-nocheck
import CryptoJS from "crypto-js";
export const aesCode = "nolibox--telecom";
export function decryptAES(ciphertext: string, code: string) {
  const keyHex = CryptoJS.enc.Utf8.parse(code);
  // direct decrypt ciphertext
  const decrypted = CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(ciphertext),
    },
    keyHex,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  return decrypted.toString(CryptoJS.enc.Utf8);
}
// 判断json字符串
export function isJSON(str: string) {
  if (typeof str == "string") {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == "object" && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}
