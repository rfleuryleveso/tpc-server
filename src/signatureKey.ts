import {sign} from "tweetnacl";

const keyPair = sign.keyPair.fromSecretKey(new Uint8Array([50, 184, 24, 238, 95, 153, 138, 132, 75, 139, 85,
  227, 135, 249, 122, 88, 144, 179, 183, 4, 15, 226,
  56, 105, 157, 229, 240, 166, 215, 241, 252, 223, 46,
  63, 250, 151, 66, 69, 187, 21, 157, 26, 19, 46,
  82, 246, 24, 7, 89, 84, 159, 4, 13, 75, 35,
  76, 108, 126, 18, 207, 243, 23, 226, 254
]))

export default keyPair;
