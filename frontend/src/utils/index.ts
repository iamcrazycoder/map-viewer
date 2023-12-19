export function capitalizeSentence(line: string) {
  const words = line.split(/\s+/);

  return words
    .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
    .join(" ");
}
