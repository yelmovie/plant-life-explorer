// Korean particles that depend on the last syllable of an interpolated word (plant or place names).
// josa('알로에','을/를') → '알로에를', josa('계절 꽃돔','으로/로') → '계절 꽃돔으로', josa('표본 온실','으로/로') → '표본 온실로'.
const PAIRS = {'을/를':['을','를'], '은/는':['은','는'], '이/가':['이','가'], '과/와':['과','와'], '으로/로':['으로','로'], '이야/야':['이야','야']};
function finalConsonant(word) {
  const code = String(word).trim().slice(-1).charCodeAt(0) - 0xAC00;
  return code >= 0 && code <= 11171 ? code % 28 : 0;
}
export function josa(word, pair) {
  const [withFinal, withoutFinal] = PAIRS[pair];
  const final = finalConsonant(word);
  // ㄹ (index 8) takes 로, not 으로: 실험실로, 물길로.
  const useFinal = pair === '으로/로' ? final !== 0 && final !== 8 : final !== 0;
  return `${word}${useFinal ? withFinal : withoutFinal}`;
}
// Labels saved by older versions read "알로에을 심을 자리"; the stored label is repaired on load, the answer itself is untouched.
export function repairPlantLabel(label) {
  return String(label).replace(/^([가-힣]+)(?:을|를) (심을 자리|심은 까닭)$/, (_, name, rest) => `${josa(name, '을/를')} ${rest}`);
}
